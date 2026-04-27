import { cookies } from "next/headers";

const ACCESS_TOKEN_NAME = "access_token";
const REFRESH_TOKEN_NAME = "refresh_token";

export async function setAccessTokenCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(ACCESS_TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 15, // 15 minutos
  });
}

export async function setRefreshTokenCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(REFRESH_TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 días
  });
}

export async function setToken(token: string) {
  // Legacy alias para login/logout simple
  await setAccessTokenCookie(token);
}

export async function getAccessToken() {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_NAME)?.value;
}

export async function getRefreshToken() {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_TOKEN_NAME)?.value;
}

export async function getToken() {
  return getAccessToken();
}

export async function removeToken() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_NAME);
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_NAME);
  cookieStore.delete(REFRESH_TOKEN_NAME);
}

