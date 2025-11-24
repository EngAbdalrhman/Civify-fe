import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Define public routes that don't require authentication
const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/auth/callback",
  "/dashboard/plans", // Explicitly requested as public
  "/cv-builder", // Allow access to builder, specific actions will trigger auth check
];

// Define routes that are always public (assets, api, etc)
const publicPathPrefixes = [
  "/_next",
  "/api",
  "/static",
  "/favicon.ico",
  "/images",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path is public
  if (
    publicRoutes.includes(pathname) ||
    publicPathPrefixes.some((prefix) => pathname.startsWith(prefix))
  ) {
    return NextResponse.next();
  }

  // Check for auth token (this is a basic check, real validation happens on backend/client)
  // We check for the cookie if we were using cookies, or we might need to rely on client-side checks
  // Since we store tokens in localStorage, middleware (server-side) can't see them easily unless we also set a cookie.
  // However, for this requirement, we can't fully protect routes in middleware without a cookie.
  // BUT, the user asked for "redirect to login with returnUrl".
  // If we can't see the token in middleware, we might have to rely on client-side protection (HOC or Layout).
  
  // WAIT: The plan says "Implement logic to save current URL before redirecting to login".
  // If we are using localStorage, middleware is limited.
  // Let's assume for now we rely on client-side checks OR the backend sets a cookie that middleware can see?
  // The backend sets `refreshToken` cookie. We could check for that?
  // But `refreshToken` is HttpOnly and for `/refresh-token` path?
  // Let's check `SecurityConfig.java`: `refreshCookie.setPath(JwtConstants.REFRESH_TOKEN_COOKIE_PATH);`
  // So middleware can't see it on other paths.
  
  // So, middleware might not be the right place for *enforcing* auth if we only use localStorage.
  // We should use a client-side wrapper or check in `layout.tsx` / `page.tsx`.
  
  // HOWEVER, for the sake of the requirement "if user select a plan let him login... and after go to checkout",
  // this is a specific flow.
  
  // Let's implement a basic middleware that allows everything by default (since we can't check auth),
  // BUT if we want to *force* login for specific paths, we can't do it here without a token.
  
  // Actually, the user requirement is about *specific actions* redirecting to login.
  // "if user select a plan let him login or sign in and after go to checkout"
  // This implies the *button click* on the plan should check auth, and if not logged in, redirect.
  
  // So middleware might be less relevant here for *protection* but useful for *redirection* if we had cookies.
  // Since we don't, I will create the middleware but keep it permissive, 
  // and focus on updating the *Components* to handle the redirect logic.
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
