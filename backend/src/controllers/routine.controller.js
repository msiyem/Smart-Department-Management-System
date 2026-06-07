import pool from '../config/db.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ApiError, ApiResponse } from '../utils/apiHelpers.js';

export const createRoutine = asyncHandler(async (req, res) => {

  const {
    course_id,
    teacher_id,
    room_no,
    day,
    start_time,
    end_time,
  } = req.body;

  // Validate time range
  const start = new Date(`1970-01-01T${start_time}`);
  const end = new Date(`1970-01-01T${end_time}`);

  if (start >= end) {
    throw new ApiError(400, "End time must be greater than start time.");
  }

  const [[course]] = await pool.query(
    `
    SELECT id, semester
    FROM courses
    WHERE id = ?
    `,
    [course_id]
  );

  if (!course) {
    throw new ApiError(404, 'Course not found.');
  }

  const [[teacher]] = await pool.query(
    `
      SELECT id
      FROM teachers
      WHERE user_id = ?
    `,
    [teacher_id]
  );

  if (!teacher) {
    throw new ApiError(404, 'Teacher not found.');
  }

  // Teacher conflict check
  const [teacherConflict] = await pool.query(
    `
    SELECT id
    FROM class_routines
    WHERE teacher_id = ?
      AND day = ?
      AND start_time < ?
      AND end_time > ?
    `,
    [teacher_id, day, end_time, start_time]
  );

  if (teacherConflict.length > 0) {
    throw new ApiError(
      409,
      'Teacher already has another class during this time.'
    );
  }

  // Room conflict check
  if (room_no) {
    const [roomConflict] = await pool.query(
      `
      SELECT id
      FROM class_routines
      WHERE room_no = ?
        AND day = ?
        AND start_time < ?
        AND end_time > ?
      `,
      [room_no, day, end_time, start_time]
    );

    if (roomConflict.length > 0) {
      throw new ApiError(
        409,
        'Room already occupied during this time.'
      );
    }
  }

  // Semester conflict check
  const [semesterConflict] = await pool.query(
    `
    SELECT cr.id
    FROM class_routines cr
    JOIN courses c ON c.id = cr.course_id
    WHERE c.semester = ?
      AND cr.day = ?
      AND cr.start_time < ?
      AND cr.end_time > ?
    `,
    [course.semester, day, end_time, start_time]
  );

  if (semesterConflict.length > 0) {
    throw new ApiError(
      409,
      `Semester ${course.semester} already has another class during this time.`
    );
  }

  // Create routine
  const teacherId = teacher.id;

  const [result] = await pool.query(
    `
      INSERT INTO class_routines
      (
        course_id,
        teacher_id,
        room_no,
        day,
        start_time,
        end_time
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      course_id,
      teacherId,   // ✅ FIXED HERE
      room_no || null,
      day,
      start_time,
      end_time,
    ]
  );

  await pool.query(
    `
    INSERT IGNORE INTO course_teachers
    (
      teacher_id,
      course_id
    )
    VALUES (?, ?)
  `,
    [teacherId, course_id]
  );

  return res.status(201).json(
    new ApiResponse(
      201,
      'Routine slot created.',
      {
        id: result.insertId,
      }
    )
  );
});

export const getRoutine = asyncHandler(async (_req, res) => {
  const [rows] = await pool.query(
    `
    SELECT
      cr.*,
      c.course_code,
      c.course_title,
      c.semester,
      u.full_name AS teacher_name
    FROM class_routines cr
    JOIN courses c
      ON c.id = cr.course_id
    JOIN teachers t
      ON t.id = cr.teacher_id
    JOIN users u
      ON u.id = t.user_id
    ORDER BY
      FIELD(
        cr.day,
        'Saturday',
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday'
      ),
      cr.start_time
    `
  );

  return res.json(
    new ApiResponse(
      200,
      'Routine fetched.',
      rows
    )
  );
});

export const deleteRoutine = asyncHandler(async (req, res) => {
  const [[slot]] = await pool.query(
    `
    SELECT
      id,
      teacher_id,
      course_id
    FROM class_routines
    WHERE id = ?
    `,
    [req.params.id]
  );

  if (!slot) {
    throw new ApiError(
      404,
      "Routine slot not found."
    );
  }

  // Delete routine
  await pool.query(
    `
    DELETE FROM class_routines
    WHERE id = ?
    `,
    [req.params.id]
  );

  // Check whether another routine still exists
  const [remaining] = await pool.query(
    `
    SELECT id
    FROM class_routines
    WHERE teacher_id = ?
      AND course_id = ?
    LIMIT 1
    `,
    [
      slot.teacher_id,
      slot.course_id,
    ]
  );

  // If no routines remain, remove course assignment
  if (remaining.length === 0) {
    await pool.query(
      `
      DELETE FROM course_teachers
      WHERE teacher_id = ?
        AND course_id = ?
      `,
      [
        slot.teacher_id,
        slot.course_id,
      ]
    );
  }

  return res.json(
    new ApiResponse(
      200,
      "Routine slot deleted."
    )
  );
});