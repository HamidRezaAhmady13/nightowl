// // lib/authGuard.ts
// import { NextRequest, NextResponse } from "next/server";

// export function protectRoute(request: NextRequest): NextResponse | null {
//   console.log("🔐 Middleware triggered for:", request.nextUrl.pathname);

//   const token = request.cookies.get("refresh");
//   console.log(token);

//   const publicRoutes = ["/login", "/signup"];
//   const isPublic = publicRoutes.includes(request.nextUrl.pathname);
//   if (!isPublic && !token) {
//     return NextResponse.redirect(new URL("/login", request.url));
//   }

//   return null;
// }
