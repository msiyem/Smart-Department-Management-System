import pool from '../config/db.js';
import cloudinary from '../config/cloudinary.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ApiError, ApiResponse } from '../utils/apiHelpers.js';

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
    if (publicId) await cloudinary.uploader.destroy(publicId).catch(() => {});
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
    const file  = parts.pop().split('.')[0];
    const folder = parts.slice(parts.indexOf('upload') + 2).join('/');
    return `${folder}/${file}`;
  } catch { return null; }
}
