import { NextResponse } from "next/server";

export function middleware(req) {
    const accessToken = req.cookies.get("access_token");

    const { pathname } = req.nextUrl;

    const publicRoutes = ["/login", "/register"];

    if (publicRoutes.includes(pathname)) {
        return NextResponse.next();
    }

    if (!accessToken) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    if (accessToken && pathname === "/login") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    
    return NextResponse.next();
}

export const config = {
    matcher: ["/:path*"],
};