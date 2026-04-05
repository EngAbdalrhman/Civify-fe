import dns from "node:dns";
import https from "node:https";
import { URL as NodeURL } from "node:url";
import { type NextRequest, NextResponse } from "next/server";

dns.setDefaultResultOrder("ipv4first");

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const NUM = /^\d+$/;
const REGION = /^[a-z]{2}$/;
/** Replays can be large; stay under typical reverse-proxy limits. */
const UPSTREAM_TIMEOUT_MS = 120_000;

function ingestUrl(o: string, p: string, r: string | null): string {
  const host = r ? `o${o}.ingest.${r}.sentry.io` : `o${o}.ingest.sentry.io`;
  return `https://${host}/api/${p}/envelope/?hsts=0`;
}

function upstreamHeaders(request: NextRequest, contentType: string): Headers {
  const h = new Headers();
  h.set("content-type", contentType);
  for (const [key, value] of request.headers) {
    const k = key.toLowerCase();
    if (k === "baggage" || k.startsWith("sentry-")) {
      h.set(key, value);
    }
  }
  return h;
}

function headersToRecord(headers: Headers): Record<string, string> {
  const o: Record<string, string> = {};
  headers.forEach((value, key) => {
    o[key] = value;
  });
  return o;
}

function formatErr(err: unknown): string {
  if (!(err instanceof Error)) return String(err);
  const parts = [`${err.name}: ${err.message}`];
  let c: unknown = (err as { cause?: unknown }).cause;
  let depth = 0;
  while (c !== undefined && c !== null && depth++ < 6) {
    if (c instanceof Error) {
      parts.push(`cause: ${c.name}: ${c.message}`);
      c = (c as { cause?: unknown }).cause;
    } else {
      parts.push(`cause: ${String(c)}`);
      break;
    }
  }
  return parts.join(" | ");
}

function postViaHttps(
  urlString: string,
  headerRecord: Record<string, string>,
  bodyBuf: Buffer,
  signal: AbortSignal,
): Promise<{ status: number; body: Buffer; contentType: string | undefined }> {
  const u = new NodeURL(urlString);
  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        hostname: u.hostname,
        port: u.port || 443,
        path: `${u.pathname}${u.search}`,
        method: "POST",
        headers: {
          ...headerRecord,
          "Content-Length": String(bodyBuf.length),
        },
        servername: u.hostname,
      },
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (chunk: Buffer | string) => {
          chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        });
        res.on("end", () => {
          signal.removeEventListener("abort", onAbort);
          resolve({
            status: res.statusCode ?? 502,
            body: Buffer.concat(chunks),
            contentType:
              typeof res.headers["content-type"] === "string"
                ? res.headers["content-type"]
                : undefined,
          });
        });
      },
    );

    const onAbort = () => {
      req.destroy();
      reject(new DOMException("Aborted", "AbortError"));
    };
    signal.addEventListener("abort", onAbort, { once: true });

    req.on("error", (e) => {
      signal.removeEventListener("abort", onAbort);
      reject(e);
    });
    req.write(bodyBuf);
    req.end();
  });
}

export async function POST(request: NextRequest) {
  const o = request.nextUrl.searchParams.get("o");
  const p = request.nextUrl.searchParams.get("p");
  const r = request.nextUrl.searchParams.get("r");

  if (!o || !p || !NUM.test(o) || !NUM.test(p)) {
    return new NextResponse("invalid tunnel params", { status: 400 });
  }
  if (r && !REGION.test(r)) {
    return new NextResponse("invalid tunnel params", { status: 400 });
  }

  const body = await request.arrayBuffer();
  if (body.byteLength === 0) {
    return new NextResponse("empty body", { status: 400 });
  }

  const contentType =
    request.headers.get("content-type") ?? "application/x-sentry-envelope";

  const url = ingestUrl(o, p, r);
  const h = upstreamHeaders(request, contentType);
  const headerRecord = headersToRecord(h);
  const bodyBuf = Buffer.from(body);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    let upstream: Response;
    try {
      upstream = await fetch(url, {
        method: "POST",
        headers: h,
        body: new Uint8Array(body),
        signal: controller.signal,
        cache: "no-store",
      });
    } catch (fetchErr) {
      console.warn(
        "[sentry-tunnel] fetch failed, retrying via node:https:",
        formatErr(fetchErr),
      );
      try {
        const rHttps = await postViaHttps(
          url,
          headerRecord,
          bodyBuf,
          controller.signal,
        );
        return new NextResponse(new Uint8Array(rHttps.body), {
          status: rHttps.status,
          headers: {
            "content-type": rHttps.contentType ?? "text/plain;charset=UTF-8",
          },
        });
      } catch (httpsErr) {
        console.error(
          "[sentry-tunnel] node:https failed:",
          url,
          formatErr(httpsErr),
        );
        const name = httpsErr instanceof Error ? httpsErr.name : "";
        const status = name === "AbortError" ? 504 : 502;
        return new NextResponse("tunnel upstream error", { status });
      }
    }

    const out =
      upstream.status === 204 || upstream.headers.get("content-length") === "0"
        ? null
        : await upstream.arrayBuffer();

    return new NextResponse(out, {
      status: upstream.status,
      headers: {
        "content-type":
          upstream.headers.get("content-type") ?? "text/plain;charset=UTF-8",
      },
    });
  } finally {
    clearTimeout(timeout);
  }
}
