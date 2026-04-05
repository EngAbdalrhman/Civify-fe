import { type NextRequest, NextResponse } from "next/server";

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
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  let upstream: Response;
  try {
    upstream = await fetch(url, {
      method: "POST",
      headers: upstreamHeaders(request, contentType),
      body: new Uint8Array(body),
      signal: controller.signal,
      cache: "no-store",
    });
  } catch (err) {
    const name = err instanceof Error ? err.name : "";
    const message = err instanceof Error ? err.message : String(err);
    console.error("[sentry-tunnel] fetch failed:", url, name, message);
    const status = name === "AbortError" ? 504 : 502;
    return new NextResponse("tunnel upstream error", { status });
  } finally {
    clearTimeout(timeout);
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
}
