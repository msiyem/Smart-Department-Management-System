import pool from '../config/db.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ApiError, ApiResponse } from '../utils/apiHelpers.js';

export const createRoutine = asyncHandler(async (req, res) => {
  const { course_id, teacher_id, room_no, day, start_time, end_time } = req.body;

  const [result] = await pool.query(
    'INSERT INTO class_routines (course_id, teacher_id, room_no, day, start_time, end_time) VALUES (?,?,?,?,?,?)',
    [course_id, teacher_id, room_no || null, day, start_time, end_time],
  );
  return res.status(201).json(new ApiResponse(201, 'Routine slot created.', { id: result.insertId }));
});

export const getRoutine = asyncHandler(async (_req, res) => {
  const [rows] = await pool.query(
    `SELECT cr.*, c.course_code, c.course_title, u.full_name AS teacher_name
     FROM class_routines cr
     JOIN courses c  ON c.id  = cr.course_id
     JOIN teachers t ON t.id  = cr.teacher_id
     JOIN users u    ON u.id  = t.user_id
     ORDER BY FIELD(cr.day,'Saturday','Sunday','Monday','Tuesday','Wednesday','Thursday','Friday'),
              cr.start_time`,
  );
  return res.json(new ApiResponse(200, 'Routine fetched.', rows));
});

export const deleteRoutine = asyncHandler(async (req, res) => {
  const [[slot]] = await pool.query('SELECT id FROM class_routines WHERE id = ?', [req.params.id]);
  if (!slot) throw new ApiError(404, 'Routine slot not found.');
  await pool.query('DELETE FROM class_routines WHERE id = ?', [req.params.id]);
  return res.json(new ApiResponse(200, 'Routine slot deleted.'));
});
