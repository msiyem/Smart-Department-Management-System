import pool from "../config/db.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError, ApiResponse } from "../utils/apiHelpers.js";

// ─── Create notice (admin / teacher) ─────────────────────────────────────────
export const createNotice = asyncHandler(async (req, res) => {
  const { title, description, priority } = req.body;
  let attachment  = null;

  if (req.file) {
    const result = await uploadToCloudinary(
      req.file.buffer,
      "dept-mgmt/assignments",
      "auto",
    );

    attachment = result.secure_url;
  }
  const [result] = await pool.query(
    "INSERT INTO notices (title, description, priority, attachment, created_by) VALUES (?,?,?,?,?)",
    [title, description || null, priority || "medium", attachment, req.user.id],
  );
  return res
    .status(201)
    .json(new ApiResponse(201, "Notice published.", { id: result.insertId }));
});

export const getNotices = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, priority } = req.query;
  const offset = (Number(page) - 1) * Number(limit);

  const where = priority ? "WHERE n.priority = ?" : "";
  const params = priority ? [priority] : [];

  const [rows] = await pool.query(
    `SELECT n.*, u.full_name AS created_by_name
     FROM notices n
     LEFT JOIN users u ON u.id = n.created_by
     ${where}
     ORDER BY n.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), offset],
  );
  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) total FROM notices ${where}`,
    params,
  );

  return res.json(
    new ApiResponse(200, "Notices fetched.", {
      notices: rows,
      total,
      page: Number(page),
    }),
  );
});

export const deleteNotice = asyncHandler(async (req, res) => {
  const [[notice]] = await pool.query("SELECT id FROM notices WHERE id = ?", [
    req.params.id,
  ]);
  if (!notice) throw new ApiError(404, "Notice not found.");
  await pool.query("DELETE FROM notices WHERE id = ?", [req.params.id]);
  return res.json(new ApiResponse(200, "Notice deleted."));
});
