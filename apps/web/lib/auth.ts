export const SESSION_COOKIE = "ffos_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 12;

export type DirectorSession = {
  sub: string;
  role: "DIRECTOR";
  exp: number;
};

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function stringToBase64Url(value: string) {
  return bytesToBase64Url(new TextEncoder().encode(value));
}

function base64UrlToString(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

async function sign(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return bytesToBase64Url(new Uint8Array(signature));
}

async function signaturesMatch(a: string, b: string) {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return mismatch === 0;
}

export function getAuthConfiguration() {
  const user = process.env.FFOS_DIRECTOR_USER;
  const password = process.env.FFOS_DIRECTOR_PASSWORD;
  const secret = process.env.FFOS_SESSION_SECRET;
  return { user, password, secret, configured: Boolean(user && password && secret) };
}

export async function createDirectorSession(subject: string, secret: string) {
  const payload: DirectorSession = {
    sub: subject,
    role: "DIRECTOR",
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const encoded = stringToBase64Url(JSON.stringify(payload));
  const signature = await sign(encoded, secret);
  return `${encoded}.${signature}`;
}

export async function verifyDirectorSession(token: string | undefined, secret: string | undefined) {
  if (!token || !secret) return null;
  const [encoded, providedSignature, extra] = token.split(".");
  if (!encoded || !providedSignature || extra) return null;

  const expectedSignature = await sign(encoded, secret);
  if (!(await signaturesMatch(providedSignature, expectedSignature))) return null;

  try {
    const payload = JSON.parse(base64UrlToString(encoded)) as DirectorSession;
    if (payload.role !== "DIRECTOR" || !payload.sub || !payload.exp) return null;
    if (payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}
