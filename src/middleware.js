// import { NextResponse } from "next/server";

// export function middleware(req) {
//   const { pathname } = req.nextUrl;

//   if (
//     pathname.startsWith("/_next") ||
//     pathname.startsWith("/") ||
//     pathname === "/favicon.ico"
//   ) {
//     return NextResponse.next();
//   }

//   const PUBLIC = ["/login", "/register", "/403"];

//   if (PUBLIC.some((p) => pathname.startsWith(p))) {
//     return NextResponse.next();
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: ["/:path*"],
// };
