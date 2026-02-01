import { NextRequest, NextResponse } from "next/server";

const ALLOWED_ORIGINS = [
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Check if access is granted via cookie
  const hasAccess = req.cookies.get("gochopper_access")?.value === "granted";
  
  // Allow coming-soon page and API routes without password
  const isComingSoonPage = pathname === "/coming-soon";
  const isApiRoute = pathname.startsWith("/api");
  const isPublicFile = pathname.startsWith("/_next") || pathname.startsWith("/chopper-");
  
  // If trying to access any page without access (except coming-soon and API), redirect
  if (!hasAccess && !isComingSoonPage && !isApiRoute && !isPublicFile) {
    return NextResponse.redirect(new URL("/coming-soon", req.url));
  }
  
  // If has access and trying to access coming-soon, redirect to home
  if (hasAccess && isComingSoonPage) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const origin = req.headers.get("origin") ?? "";
  const isAllowed = ALLOWED_ORIGINS.includes(origin) || origin === "";

  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new NextResponse(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": isAllowed ? origin : ALLOWED_ORIGINS[0],
        "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Admin-Secret",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  const response = NextResponse.next();

  // Set CORS headers on all API responses
  response.headers.set(
    "Access-Control-Allow-Origin",
    isAllowed ? origin || ALLOWED_ORIGINS[0] : ALLOWED_ORIGINS[0]
  );
  response.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Admin-Secret"
  );

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
