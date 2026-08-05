import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  const isAdminRoute = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isCustomerProtectedRoute =
    pathname.startsWith("/checkout") || pathname.startsWith("/orders");

  if (isAdminRoute) {
    if (!req.auth || req.auth.user?.role !== "admin") {
      const loginUrl = new URL("/admin/login", req.nextUrl.origin);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (isCustomerProtectedRoute && !req.auth) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }
});

export const config = {
  matcher: ["/admin/:path*", "/checkout/:path*", "/orders/:path*"],
};
