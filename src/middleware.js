import { NextResponse } from "next/server";

export function middleware(req) {
  const token = req.cookies.get("access_token");

  const { pathname } = req.nextUrl;

  const publicRoutes = ["/login", "/register"];

  // allow next internal files
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  // allow public pages
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // protect pages
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/orders/:path*",
    "/events/:path*",
  ],
};