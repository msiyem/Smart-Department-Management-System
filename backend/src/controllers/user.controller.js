import pool from '../config/db.js';
import cloudinary from '../config/cloudinary.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ApiError, ApiResponse } from '../utils/apiHelpers.js';
import bcrypt from 'bcrypt';

export const createUser = asyncHandler(async (req, res) => {
  const {
    full_name,
    email,
    password,
    role,
    // student fields
    registration_no,
    session,
    semester,
    // teacher fields
    designation,
  } = req.body;

  // 1. validate required fields
  if (!full_name || !email || !password || !role) {
    throw new ApiError(400, "Basic fields are required.");
  }

  const allowedRoles = ["student", "teacher"];
  if (!allowedRoles.includes(role)) {
    throw new ApiError(400, "Only student or teacher can be created.");
  }

  // 2. check duplicate email
  const [[existing]] = await pool.query(
    "SELECT id FROM users WHERE email = ?",
    [email]
  );

  if (existing) {
    throw new ApiError(409, "Email already exists.");
  }

  // 3. hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // 4. insert into users table
  const [userResult] = await pool.query(
    `INSERT INTO users (full_name, email, password, role)
     VALUES (?, ?, ?, ?)`,
    [full_name, email, hashedPassword, role]
  );

  const userId = userResult.insertId;

  // 5. role-based insert
  if (role === "student") {
    if (!registration_no || !session || !semester) {
      throw new ApiError(
        400,
        "registration_no, session, semester are required for student."
      );
    }

    await pool.query(
      `INSERT INTO students (user_id, registration_no, session, semester)
       VALUES (?, ?, ?, ?)`,
      [userId, registration_no, session, semester]
    );
  }

  if (role === "teacher") {
    await pool.query(
      `INSERT INTO teachers (user_id, designation)
       VALUES (?, ?)`,
      [userId, designation || "Lecturer"]
    );
  }

  // 6. response
  return res.status(201).json(
    new ApiResponse(201, "User created successfully.", {
      id: userId,
      full_name,
      email,
      role,
    })
  );
});

export const getAllUsers = asyncHandler(async (req, res) => {
  const { role, page = 1, limit = 20 } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  let where = '';
  const params = [];
  if (role) { where = 'WHERE role = ?'; params.push(role); }

  const [rows] = await pool.query(
    `SELECT id, full_name, email, role, profile_image, is_active, created_at
     FROM users ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, Number(limit), offset],
  );
  const [[{ total }]] = await pool.query(`SELECT COUNT(*) total FROM users ${where}`, params);

  return res.json(new ApiResponse(200, 'Users fetched.', { users: rows, total, page: Number(page), limit: Number(limit) }));
});

export const toggleUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const [[user]] = await pool.query('SELECT id, is_active FROM users WHERE id = ?', [id]);
  if (!user) throw new ApiError(404, 'User not found.');

  const newStatus = user.is_active ? 0 : 1;
  await pool.query('UPDATE users SET is_active = ? WHERE id = ?', [newStatus, id]);

  return res.json(new ApiResponse(200, `User ${newStatus ? 'activated' : 'deactivated'}.`));
});

export const updateProfileImage = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No image provided.');

  // Delete old image from cloudinary if exists
  const [[user]] = await pool.query('SELECT profile_image FROM users WHERE id = ?', [req.user.id]);
  if (user.profile_image) {
    const publicId = extractPublicId(user.profile_image);
    if (publicId) await cloudinary.uploader.destroy(publicId).catch(() => { });
  }

  await pool.query('UPDATE users SET profile_image = ? WHERE id = ?', [req.file.path, req.user.id]);
  return res.json(new ApiResponse(200, 'Profile image updated.', { profile_image: req.file.path }));
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { full_name } = req.body;
  if (!full_name?.trim()) throw new ApiError(422, 'full_name is required.');

  await pool.query('UPDATE users SET full_name = ? WHERE id = ?', [full_name.trim(), req.user.id]);
  return res.json(new ApiResponse(200, 'Profile updated.'));
});

export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (Number(id) === req.user.id) throw new ApiError(400, 'Cannot delete your own account.');

  const [[user]] = await pool.query('SELECT id FROM users WHERE id = ?', [id]);
  if (!user) throw new ApiError(404, 'User not found.');

  await pool.query('DELETE FROM users WHERE id = ?', [id]);
  return res.json(new ApiResponse(200, 'User deleted.'));
});

function extractPublicId(url) {
  try {
    const parts = url.split('/');
    const file = parts.pop().split('.')[0];
    const folder = parts.slice(parts.indexOf('upload') + 2).join('/');
    return `${folder}/${file}`;
  } catch { return null; }
}
