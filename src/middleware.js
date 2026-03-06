import { NextResponse } from "next/server";

export function middleware(req) {

  const { pathname } = req.nextUrl;

  const publicRoutes = ["/login", "/register", "/403"];

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

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/orders/:path*",
    "/events/:path*",
  ],
};