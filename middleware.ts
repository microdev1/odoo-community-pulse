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

  // Check for auth token in cookies
  const authToken = request.cookies.get("authToken")?.value;

  // If no token and trying to access a protected route, redirect to login
  if (!authToken) {
    // Store the original URL to redirect back after login
    const url = new URL("/auth", request.url);
    url.searchParams.set("callbackUrl", encodeURI(request.url));

    // Create a response that redirects to the login page
    const response = NextResponse.redirect(url);

    // Set a secure, HTTP-only cookie to prevent XSS attacks
    response.cookies.set({
      name: "intendedDestination",
      value: request.url,
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
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
