import jwt from "jsonwebtoken"; //libreria para crear y verificar tokens jwt

export type TokenPayload = {
  userId: string;
  email: string;  //se define info que va dentro del token
  role: string;
};

const ACCESS_SECRET = process.env.JWT_SECRET || "access-secret";
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || "refresh-secret";

// ─── Access token ──────────────────────────────────────────
export function generateAccessToken(payload: TokenPayload) {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: "15m" });
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, ACCESS_SECRET) as TokenPayload;
}

// ─── Refresh token ─────────────────────────────────────────
export function generateRefreshToken(payload: TokenPayload) {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: "7d" });
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, REFRESH_SECRET) as TokenPayload;
}

// ─── Alias compatibles (legacy) ────────────────────────────
export const createToken = generateAccessToken;
export const verifyToken = verifyAccessToken;


/* “Aquí manejo los tokens JWT.
generateAccessToken() crea token corto (15 min).
generateRefreshToken() crea token largo (7 días).
verifyAccessToken() y verifyRefreshToken() validan firma y payload.” */