import pool from '../config/db.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/apiHelpers.js';

export const adminDashboard = asyncHandler(async (_req, res) => {
  const [[{ total_students }]] = await pool.query('SELECT COUNT(*) total_students FROM students');
  const [[{ total_teachers }]] = await pool.query('SELECT COUNT(*) total_teachers FROM teachers');
  const [[{ total_courses }]] = await pool.query('SELECT COUNT(*) total_courses  FROM courses');
  const [[{ total_notices }]] = await pool.query('SELECT COUNT(*) total_notices  FROM notices');

  const [recentNotices] = await pool.query(
    'SELECT id, title, priority, created_at FROM notices ORDER BY created_at DESC LIMIT 5',
  );

  return res.json(new ApiResponse(200, 'Dashboard stats.', {
    total_students,
    total_teachers,
    total_courses,
    total_notices,
    recent_notices: recentNotices,
  }));
});

export const studentDashboard = asyncHandler(async (req, res) => {
  const [[student]] = await pool.query(
    'SELECT id, cgpa, semester FROM students WHERE user_id = ?',
    [req.user.id],
  );

  const [[{ enrolled_courses }]] = await pool.query(
    'SELECT COUNT(*) enrolled_courses FROM enrollments WHERE student_id = ?',
    [student.id],
  );

  const [[{ pending_assignments }]] = await pool.query(
    `SELECT COUNT(*) pending_assignments
     FROM assignments a
     JOIN enrollments e ON e.course_id = a.course_id
     LEFT JOIN assignment_submissions asub ON asub.assignment_id = a.id AND asub.student_id = e.student_id
     WHERE e.student_id = ? AND asub.id IS NULL AND a.due_date > NOW()`,
    [student.id],
  );

  const [recentNotices] = await pool.query(
    'SELECT id, title, priority, created_at FROM notices ORDER BY created_at DESC LIMIT 3',
  );

  return res.json(new ApiResponse(200, 'Student dashboard.', {
    cgpa: student.cgpa,
    semester: student.semester,
    enrolled_courses,
    pending_assignments,
    recent_notices: recentNotices,
  }));
});

export const teacherDashboard = asyncHandler(async (req, res) => {
  const [[teacher]] = await pool.query(
    'SELECT id FROM teachers WHERE user_id = ?',
    [req.user.id]
  );

  if (!teacher) {
    throw new ApiError(404, 'Teacher profile not found');
  }

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
  });

  const [
    [[{ courses_teaching }]],
    [[{ total_assignments }]],
    [[{ total_students }]],
    [[{ pending_submissions }]],
    [[{ today_classes }]],
  ] = await Promise.all([
    pool.query(
      `SELECT COUNT(*) AS courses_teaching
       FROM course_teachers
       WHERE teacher_id = ?`,
      [teacher.id]
    ),

    pool.query(
      `SELECT COUNT(*) AS total_assignments
       FROM assignments
       WHERE teacher_id = ?`,
      [teacher.id]
    ),

    pool.query(
      `
      SELECT COUNT(DISTINCT e.student_id) AS total_students
      FROM enrollments e
      JOIN course_teachers ct ON ct.course_id = e.course_id
      WHERE ct.teacher_id = ?
      `,
      [teacher.id]
    ),

    pool.query(
      `
      SELECT COUNT(*) AS pending_submissions
      FROM assignment_submissions s
      JOIN assignments a ON a.id = s.assignment_id
      WHERE a.teacher_id = ?
      AND s.graded_at IS NULL
      `,
      [teacher.id]
    ),

    pool.query(
      `
      SELECT COUNT(*) AS today_classes
      FROM class_routines
      WHERE teacher_id = ?
      AND day = ?
      `,
      [teacher.id, today]
    ),
  ]);

  return res.json(
    new ApiResponse(200, "Teacher dashboard", {
      courses_teaching,
      total_assignments,
      total_students,
      pending_submissions,
      today_classes,
    })
  );
});
