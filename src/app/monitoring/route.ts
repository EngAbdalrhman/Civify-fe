import { type NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const NUM = /^\d+$/;
const REGION = /^[a-z]{2}$/;

function ingestUrl(o: string, p: string, r: string | null): string {
  const host = r ? `o${o}.ingest.${r}.sentry.io` : `o${o}.ingest.sentry.io`;
  return `https://${host}/api/${p}/envelope/?hsts=0`;
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

  let upstream: Response;
  try {
    upstream = await fetch(ingestUrl(o, p, r), {
      method: "POST",
      headers: { "content-type": contentType },
      body,
    });
  } catch {
    return new NextResponse("upstream unreachable", { status: 502 });
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
