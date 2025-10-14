import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { protectRoute } from "./features/lib/authGuard";

export const config = {
  // matcher: ["/:path*"],
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
  // matcher: ["/feed", "/upload", "/profile"],
};

export function middleware(request: NextRequest) {
  const redirect = protectRoute(request);
  if (redirect) return redirect;

  return NextResponse.next();
}
