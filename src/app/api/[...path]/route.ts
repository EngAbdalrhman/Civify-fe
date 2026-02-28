import { NextRequest, NextResponse } from "next/server";

/**
 * API Proxy Route - Forwards all requests to the backend server.
 *
 * This proxy solves the cross-origin cookie issue during local development.
 * When frontend (localhost:3000) and backend are on different origins,
 * cookies with SameSite=Lax won't be sent on cross-origin requests.
 *
 * By proxying through Next.js, the browser sees same-origin requests,
 * and cookies are properly forwarded to the actual backend.
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return handleRequest(request, await params, "GET");
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return handleRequest(request, await params, "POST");
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return handleRequest(request, await params, "PUT");
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return handleRequest(request, await params, "PATCH");
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  return handleRequest(request, await params, "DELETE");
}

async function handleRequest(
  request: NextRequest,
  params: { path: string[] },
  method: string,
) {
  const path = params.path.join("/");
  const url = new URL(request.url);
  const targetUrl = `${BACKEND_URL}/${path}${url.search}`;

  console.log(`[Proxy] ${method} ${targetUrl}`);

  // Forward headers, including cookies
  const headers = new Headers();
  request.headers.forEach((value, key) => {
    // Skip headers that shouldn't be forwarded
    if (
      key.toLowerCase() !== "host" &&
      key.toLowerCase() !== "connection" &&
      key.toLowerCase() !== "content-length" &&
      key.toLowerCase() !== "accept-encoding" // Don't forward - we want uncompressed responses
    ) {
      headers.set(key, value);
    }
  });

  // Prepare request options
  const fetchOptions: RequestInit = {
    method,
    headers,
    credentials: "include",
  };

  // Forward body for methods that support it
  if (method !== "GET" && method !== "HEAD") {
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      try {
        const body = await request.json();
        fetchOptions.body = JSON.stringify(body);
      } catch {
        // Empty body or invalid JSON
      }
    } else if (contentType.includes("multipart/form-data")) {
      // For FormData, pass the raw body
      fetchOptions.body = await request.arrayBuffer();
    } else if (contentType.includes("application/x-www-form-urlencoded")) {
      fetchOptions.body = await request.text();
    } else {
      // For other content types, try to pass body as-is
      try {
        fetchOptions.body = await request.arrayBuffer();
      } catch {
        // No body
      }
    }
  }

  try {
    const response = await fetch(targetUrl, fetchOptions);

    // Create response with backend's body
    const responseBody = await response.arrayBuffer();

    // For login requests: the backend returns accessToken only via Set-Cookie headers,
    // not in the body. On localhost, those cookies are rejected (wrong domain).
    // Extract the accessToken from Set-Cookie and inject it into the response body.
    let finalBody: BodyInit = responseBody;
    let finalContentType: string | null = response.headers.get("content-type");

    if (path.includes("login") && response.ok) {
      const setCookieHeaders: string[] = [];
      response.headers.forEach((value, key) => {
        if (key.toLowerCase() === "set-cookie") {
          setCookieHeaders.push(value);
        }
      });
      console.log("[Proxy DEBUG] All backend response headers:");
      response.headers.forEach((value, key) => {
        console.log(`  ${key}: ${value}`);
      });
      console.log("[Proxy DEBUG] Set-Cookie headers:", setCookieHeaders);

      // Extract accessToken from Set-Cookie headers
      let accessToken: string | null = null;
      for (const cookie of setCookieHeaders) {
        const match = cookie.match(/accessToken=([^;]+)/);
        if (match) {
          accessToken = match[1];
          break;
        }
      }

      // Parse existing body (if any) and inject accessToken
      const bodyText = new TextDecoder().decode(responseBody);
      let bodyObj: Record<string, unknown> = {};
      try {
        if (bodyText.trim()) {
          bodyObj = JSON.parse(bodyText);
        }
      } catch {
        // Not JSON, start fresh
      }

      if (accessToken) {
        bodyObj.accessToken = accessToken;
        console.log(
          "[Proxy] Injected accessToken from Set-Cookie into response body",
        );
      }

      finalBody = JSON.stringify(bodyObj);
      finalContentType = "application/json";
    }

    // 204, 205, and 304 responses cannot have a body
    const isBodyAllowed =
      response.status !== 204 &&
      response.status !== 205 &&
      response.status !== 304;

    const proxyResponse = new NextResponse(isBodyAllowed ? finalBody : null, {
      status: response.status,
      statusText: response.statusText,
    });

    // Set content-type explicitly
    if (finalContentType) {
      proxyResponse.headers.set("content-type", finalContentType);
    }

    // Forward response headers, especially Set-Cookie
    response.headers.forEach((value, key) => {
      // Forward all headers including Set-Cookie
      if (key.toLowerCase() === "set-cookie") {
        // Append each Set-Cookie header (there might be multiple)
        proxyResponse.headers.append(key, value);
      } else if (
        key.toLowerCase() !== "content-encoding" &&
        key.toLowerCase() !== "transfer-encoding" &&
        key.toLowerCase() !== "content-length" &&
        key.toLowerCase() !== "content-type" // Already set above
      ) {
        proxyResponse.headers.set(key, value);
      }
    });

    return proxyResponse;
  } catch (error) {
    console.error("[Proxy] Error:", error);
    return NextResponse.json(
      { error: "Proxy error", message: String(error) },
      { status: 502 },
    );
  }
}
