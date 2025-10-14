// lib/authGuard.ts
import { NextRequest, NextResponse } from "next/server";

export function protectRoute(request: NextRequest): NextResponse | null {
  console.log("🔐 Middleware triggered for:", request.nextUrl.pathname);

  const token = request.cookies.get("jwt");
  // const protectedRoutes = ["/:path*"];
  // const protectedRoutes = ["/", "/feed", "/upload", "/profile"];

  // const isProtected = protectedRoutes.some((route) =>
  //   request.nextUrl.pathname.startsWith(route)
  // );
  const publicRoutes = ["/login", "/signup"];
  const isPublic = publicRoutes.includes(request.nextUrl.pathname);
  if (
    // isProtected &&
    !isPublic &&
    !token
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return null;
}
