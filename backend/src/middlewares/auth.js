import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import { ApiError } from '../utils/apiHelpers.js';
import asyncHandler from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, _res, next) => {
  let token;

  // Accept Bearer header OR httpOnly cookie
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) throw new ApiError(401, 'Access denied. No token provided.');

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  } catch (err) {
    if (err.name === 'TokenExpiredError') throw new ApiError(401, 'Token expired.');
    throw new ApiError(401, 'Invalid token.');
  }

  const [rows] = await pool.query(
    'SELECT id, full_name, email, role, is_active FROM users WHERE id = ?',
    [decoded.id],
  );

  if (!rows.length)       throw new ApiError(401, 'User no longer exists.');
  if (!rows[0].is_active) throw new ApiError(403, 'Account has been deactivated.');

  req.user = rows[0];
  next();
});

export const authorize = (...roles) =>
  (req, _res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, `Role '${req.user.role}' is not authorized.`));
    }
    next();
  };
