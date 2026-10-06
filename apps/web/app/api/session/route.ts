import { NextRequest, NextResponse } from "next/server";
import {
  createDirectorSession,
  getAuthConfiguration,
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
} from "../../../lib/auth";

function sameString(a: string, b: string) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

export async function POST(request: NextRequest) {
  const config = getAuthConfiguration();

  if (!config.configured || !config.user || !config.password || !config.secret) {
    return NextResponse.json(
      { ok: false, error: "AUTH_NOT_CONFIGURED" },
      { status: 503 }
    );
  }

  const form = await request.formData();
  const user = String(form.get("user") ?? "");
  const password = String(form.get("password") ?? "");
  const next = String(form.get("next") ?? "/");

  if (!sameString(user, config.user) || !sameString(password, config.password)) {
    const url = new URL("/login", request.url);
    url.searchParams.set("error", "invalid");
    if (next.startsWith("/")) url.searchParams.set("next", next);
    return NextResponse.redirect(url, 303);
  }

  const token = await createDirectorSession(user, config.secret);
  const destination = next.startsWith("/") && !next.startsWith("//") ? next : "/";
  const response = NextResponse.redirect(new URL(destination, request.url), 303);

  response.cookies.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });

  return response;
}
