import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifyDirectorSession } from "./lib/auth";

const PUBLIC_PATHS = new Set(["/login", "/api/session"]);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifyDirectorSession(token, process.env.FFOS_SESSION_SECRET);

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/") loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
