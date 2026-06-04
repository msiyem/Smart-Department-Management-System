import bcrypt from "bcrypt";
import pool from "../config/db.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError, ApiResponse } from "../utils/apiHelpers.js";
import {
  clearTokenCookies,
  findRefreshToken,
  generateAccessToken,
  generateNewRefreshToken,
  generateRefreshToken,
  revokeToken,
  revokedRefreshTokenBySessionId,
  revokedRefreshTokenByUserId,
  setTokenCookies,
} from "../services/token.service.js";

const USER_SELECT_COLUMNS =
  "id, full_name, email, role, profile_image, is_active, last_login_at, created_at";

export const register = asyncHandler(async (req, res) => {
  const {
    full_name,
    email,
    password,
    role,
    registration_no,
    session,
    semester,
    designation,
  } = req.body;

  const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [
    email,
  ]);
  if (existing.length) throw new ApiError(409, "Email already in use.");

  if (role === "student" && (!registration_no || !session)) {
    throw new ApiError(
      422,
      "registration_no and session are required for students.",
    );
  }

  const hash = await bcrypt.hash(password, 12);
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const [userResult] = await conn.query(
      "INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)",
      [full_name, email, hash, role],
    );

    const userId = userResult.insertId;

    if (role === "student") {
      await conn.query(
        "INSERT INTO students (user_id, registration_no, session, semester) VALUES (?, ?, ?, ?)",
        [userId, registration_no, session, semester || 1],
      );
    } else if (role === "teacher") {
      await conn.query(
        "INSERT INTO teachers (user_id, designation) VALUES (?, ?)",
        [userId, designation || "Lecturer"],
      );
    }

    await conn.commit();

    return res.status(201).json(
      new ApiResponse(201, "Registration successful.", {
        id: userId,
        email,
        role,
      }),
    );
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const [rows] = await pool.query(
    `SELECT ${USER_SELECT_COLUMNS}, password FROM users WHERE email = ?`,
    [email],
  );
  if (!rows.length) throw new ApiError(400, "Invalid credentials.");

  const user = rows[0];
  if (!user.is_active)
    throw new ApiError(403, "Account deactivated. Contact admin.");

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new ApiError(400, "Invalid credentials.");

  const accessToken = generateAccessToken(user);
  const [refreshToken, sessionId] = await generateRefreshToken(user);

  await pool.query("UPDATE users SET last_login_at = NOW() WHERE id = ?", [
    user.id,
  ]);
  // setTokenCookies(res, accessToken, refreshToken);

  const safeUser = {
    id: user.id,
    full_name: user.full_name,
    email: user.email,
    role: user.role,
    profile_image: user.profile_image,
    is_active: user.is_active,
    last_login_at: user.last_login_at,
    created_at: user.created_at,
  };

  return res.json(
    new ApiResponse(200, "Login successful.", {
      user: safeUser,
      accessToken,
      refreshToken,
      sessionId,
    }),
  );
});

export const refresh = asyncHandler(async (req, res) => {
  const token = req.body?.refreshToken || req.cookies?.refreshToken;
  const sessionId = req.body?.sessionId || req.cookies?.sessionId;

  if (!token || !sessionId) {
    throw new ApiError(401, "Refresh token or session is missing.");
  }

  const stored = await findRefreshToken(token, sessionId);
  if (!stored) throw new ApiError(401, "Invalid refresh token.");

  const now = new Date();
  if (
    (stored.expires_at && new Date(stored.expires_at) <= now) ||
    stored.revoked_at
  ) {
    await revokedRefreshTokenBySessionId(sessionId);
    throw new ApiError(401, "Refresh token expired.");
  }

  if (stored.is_revoked) {
    await revokedRefreshTokenByUserId(stored.user_id);
    throw new ApiError(403, "Refresh token revoked.");
  }

  const [rows] = await pool.query(
    `SELECT ${USER_SELECT_COLUMNS} FROM users WHERE id = ?`,
    [stored.user_id],
  );
  if (!rows.length) throw new ApiError(404, "User not found.");

  const user = rows[0];
  const [newRefreshToken, newHashedToken] = await generateNewRefreshToken(
    user,
    sessionId,
  );

  await revokeToken(sessionId, token, newHashedToken);

  const accessToken = generateAccessToken(user);
  // setTokenCookies(res, accessToken, newRefreshToken);

  return res.json(
    new ApiResponse(200, "Token refreshed.", {
      accessToken,
      refreshToken: newRefreshToken,
      sessionId,
    }),
  );
});

export const logout = asyncHandler(async (req, res) => {
  const token = req.body?.refreshToken || req.cookies?.refreshToken;
  const sessionId = req.body?.sessionId || req.cookies?.sessionId;

  if (token && sessionId) {
    const stored = await findRefreshToken(token, sessionId);
    if (stored) {
      await revokedRefreshTokenBySessionId(sessionId);
    }
  }

  // clearTokenCookies(res);

  return res.json(new ApiResponse(200, "Logged out successfully."));
});

export const changePassword = asyncHandler(async (req, res) => {
  const { current_password, new_password } = req.body;

  const [rows] = await pool.query("SELECT password FROM users WHERE id = ?", [
    req.user.id,
  ]);
  if (!rows.length) throw new ApiError(404, "User not found.");

  const match = await bcrypt.compare(current_password, rows[0].password);
  if (!match) throw new ApiError(400, "Current password is incorrect.");

  const hash = await bcrypt.hash(new_password, 12);
  await pool.query("UPDATE users SET password = ? WHERE id = ?", [
    hash,
    req.user.id,
  ]);
  await revokedRefreshTokenByUserId(req.user.id);
  // clearTokenCookies(res);

  return res.json(
    new ApiResponse(200, "Password changed. Please log in again."),
  );
});

export const getMe = asyncHandler(async (req, res) => {
  const [rows] = await pool.query(
    `SELECT u.id, u.full_name, u.email, u.role, u.profile_image, u.is_active, u.last_login_at, u.created_at,
              s.registration_no, s.session, s.semester, s.cgpa,
              t.designation
       FROM users u
       LEFT JOIN students s ON s.user_id = u.id
       LEFT JOIN teachers t ON t.user_id = u.id
       WHERE u.id = ?`,
    [req.user.id],
  );

  if (!rows.length) throw new ApiError(404, "User not found.");

  return res.json(new ApiResponse(200, "User fetched.", rows[0]));
});
