import { NextRequest, NextResponse } from "next/server";

// Paths that don't require authentication
const publicPaths = [
  "/",
  "/auth",
  "/login",
  "/signup",
  "/api/trpc",
  "/events",
  "/search",
];

// Function to check if a path is public or private
const isPublicPath = (path: string) => {
  // Check exact matches
  if (publicPaths.includes(path)) return true;

  // Check if path starts with public paths
  if (path.startsWith("/api/trpc/")) return true;
  if (path.startsWith("/events/")) return true;
  if (path.startsWith("/_next/")) return true;
  if (path.startsWith("/favicon.ico")) return true;

  // All static assets are public
  if (
    path.match(
      /\.(ico|png|jpg|jpeg|gif|svg|css|js|json|woff|woff2|ttf|eot|map)$/
    )
  )
    return true;

  return false;
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Check for token in Authorization header first, then cookie as fallback
  const authHeader = request.headers.get("Authorization");
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7)
    : null;
  const cookieToken = request.cookies.get("authToken")?.value;
  const token = bearerToken || cookieToken;

  // If no token and trying to access a protected route, redirect to login
  if (!token) {
    const url = new URL("/auth", request.url);
    url.searchParams.set("returnUrl", request.url);

    const response = NextResponse.redirect(url);

    // Store returnUrl in a secure cookie
    response.cookies.set({
      name: "returnUrl",
      value: request.url,
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 10, // 10 minutes
    });

    return response;

    return NextResponse.redirect(url);
  }

  // Token exists, let the request proceed
  return NextResponse.next();
}

// Configure middleware to run only on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
