import pool from '../config/db.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ApiError, ApiResponse } from '../utils/apiHelpers.js';

export const takeAttendance = asyncHandler(async (req, res) => {
  const { course_id, attendance_date, records } = req.body;

  // Verify teacher owns this course
  const [[teacher]] = await pool.query('SELECT id FROM teachers WHERE user_id = ?', [req.user.id]);
  if (!teacher) throw new ApiError(403, 'Teacher record not found.');

  const [[ct]] = await pool.query(
    'SELECT id FROM course_teachers WHERE teacher_id = ? AND course_id = ?',
    [teacher.id, course_id],
  );
  if (!ct) throw new ApiError(403, 'You are not assigned to this course.');

  // Batch upsert
  const values = records.map((r) => [r.student_id, course_id, attendance_date, r.status, teacher.id]);
  await pool.query(
    `INSERT INTO attendance (student_id, course_id, attendance_date, status, taken_by)
     VALUES ?
     ON DUPLICATE KEY UPDATE status = VALUES(status)`,
    [values],
  );

  return res.status(201).json(new ApiResponse(201, `Attendance saved for ${records.length} students.`));
});

export const getCourseAttendance = asyncHandler(async (req, res) => {
  const { course_id, date } = req.query;
  if (!course_id) throw new ApiError(422, 'course_id is required.');

  const where  = date ? 'AND a.attendance_date = ?' : '';
  const params = date ? [course_id, date] : [course_id];

  const [rows] = await pool.query(
    `SELECT a.*, u.full_name, s.registration_no
     FROM attendance a
     JOIN students s ON s.id = a.student_id
     JOIN users u    ON u.id = s.user_id
     WHERE a.course_id = ? ${where}
     ORDER BY a.attendance_date DESC, u.full_name`,
    params,
  );
  return res.json(new ApiResponse(200, 'Attendance fetched.', rows));
});

export const myAttendance = asyncHandler(async (req, res) => {
  const [[student]] = await pool.query('SELECT id FROM students WHERE user_id = ?', [req.user.id]);
  if (!student) throw new ApiError(404, 'Student not found.');

  const [rows] = await pool.query(
    `SELECT c.course_code, c.course_title,
            COUNT(*) AS total_classes,
            SUM(a.status = 'present') AS present,
            SUM(a.status = 'absent')  AS absent,
            ROUND(SUM(a.status = 'present') / COUNT(*) * 100, 2) AS attendance_percent
     FROM attendance a
     JOIN courses c ON c.id = a.course_id
     WHERE a.student_id = ?
     GROUP BY c.id`,
    [student.id],
  );
  return res.json(new ApiResponse(200, 'Attendance summary fetched.', rows));
});
