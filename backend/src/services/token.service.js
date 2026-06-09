import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import ms from "ms";
import pool from "../config/db.js";

const ACCESS_SECRET =
  process.env.ACCESS_TOKEN_SECRET || process.env.JWT_ACCESS_SECRET;
const REFRESH_SECRET =
  process.env.REFRESH_TOKEN_SECRET ||
  process.env.JWT_REFRESH_SECRET ||
  ACCESS_SECRET;
const ACCESS_EXP = process.env.ACCESS_TOKEN_EXPIRES_IN || "15m";
const REFRESH_EXP =
  process.env.REFRESH_TOKEN_EXPIRES_IN || process.env.EXPIRES_IN || "7d";

export function generateAccessToken(user) {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      full_name: user.full_name,
      email: user.email,
      profile_image: user.profile_image || null,
    },
    ACCESS_SECRET,
    { expiresIn: ACCESS_EXP || "15m" },
  );
}

export async function generateRefreshToken(user) {
  const token = uuidv4();
  const sessionId = uuidv4();
  const hashedToken = await bcrypt.hash(token, 12);

  await pool.query(
    "INSERT INTO refresh_tokens (user_id, session_id, token, expires_at, revoked_at, is_revoked) VALUES (?, ?, ?, ?, NULL, 0)",
    [
      user.id,
      sessionId,
      hashedToken,
      new Date(Date.now() + ms(REFRESH_EXP || "7d")),
    ],
  );

  return [token, sessionId];
}

export async function generateNewRefreshToken(user, sessionId) {
  const token = uuidv4();
  const hashedToken = await bcrypt.hash(token, 12);

  const [rows] = await pool.query(
    "SELECT id FROM refresh_tokens WHERE session_id = ? AND is_revoked = 0 ORDER BY created_at DESC LIMIT 1",
    [sessionId],
  );

  if (!rows.length) {
    throw new Error("Session not found");
  }

  await pool.query(
    "INSERT INTO refresh_tokens (user_id, session_id, token, expires_at, revoked_at, is_revoked) VALUES (?, ?, ?, ?, NULL, 0)",
    [
      user.id,
      sessionId,
      hashedToken,
      new Date(Date.now() + ms(REFRESH_EXP || "7d")),
    ],
  );

  return [token, hashedToken];
}

export async function findRefreshToken(token, sessionId) {
  if (!token || !sessionId) return null;

  const [rows] = await pool.query(
    "SELECT * FROM refresh_tokens WHERE session_id = ? ORDER BY created_at DESC",
    [sessionId],
  );

  if (!rows.length) return null;

  for (const row of rows) {
    if (await bcrypt.compare(token, row.token)) {
      return row;
    }
  }

  return null;
}

export async function revokeToken(sessionId, token, newToken = null) {
  const [rows] = await pool.query(
    "SELECT * FROM refresh_tokens WHERE session_id = ? AND is_revoked = 0 ORDER BY created_at DESC",
    [sessionId],
  );

  for (const row of rows) {
    if (await bcrypt.compare(token, row.token)) {
      await pool.query(
        "UPDATE refresh_tokens SET is_revoked = 1, revoked_at = NOW(), replaced_by_token = ? WHERE id = ?",
        [newToken, row.id],
      );
      return;
    }
  }
}

export async function revokedRefreshTokenByUserId(id) {
  await pool.query(
    "UPDATE refresh_tokens SET is_revoked = 1, revoked_at = NOW() WHERE user_id = ? AND is_revoked = 0",
    [id],
  );
}

export async function revokedRefreshTokenBySessionId(sessionId) {
  await pool.query(
    "UPDATE refresh_tokens SET is_revoked = 1, revoked_at = NOW() WHERE session_id = ? AND is_revoked = 0",
    [sessionId],
  );
}

export function setTokenCookies(res, accessToken, refreshToken, sessionId) {
  const isProduction = process.env.NODE_ENV === "production";
  const cookieOpts = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
  };

  res.cookie("accessToken", accessToken, {
    ...cookieOpts,
    maxAge: ms(ACCESS_EXP),
  });
  res.cookie("refreshToken", refreshToken, {
    ...cookieOpts,
    maxAge: ms(REFRESH_EXP),
  });
  res.cookie("sessionId", sessionId, {
    ...cookieOpts,
    maxAge: ms(REFRESH_EXP),
  });
}

export function clearTokenCookies(res) {
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");
  res.clearCookie("sessionId");
}
