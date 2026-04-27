import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "./lib/jwt";

export function proxy(req: NextRequest) {
  const token = req.cookies.get("access_token")?.value;

  const isAuthPage =
    req.nextUrl.pathname === "/login" ||
    req.nextUrl.pathname === "/register";

  if (isAuthPage) return NextResponse.next();

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  try {
    verifyAccessToken(token);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/login", req.url));
  }
}

export const config = {
  // Excluimos API, Next internals y archivos estaticos (ej: /images/*.png).
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};

