import pool from "../config/db.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError, ApiResponse } from "../utils/apiHelpers.js";

export const createCourse = asyncHandler(async (req, res) => {
  const { course_code, course_title, credit, semester } = req.body;

  const [result] = await pool.query(
    "INSERT INTO courses (course_code, course_title, credit, semester) VALUES (?, ?, ?, ?)",
    [course_code, course_title, credit, semester],
  );
  return res
    .status(201)
    .json(new ApiResponse(201, "Course created.", { id: result.insertId }));
});

export const getCourses = asyncHandler(async (req, res) => {
  const { semester } = req.query;
  const where = semester ? "WHERE c.semester = ?" : "";
  const params = semester ? [semester] : [];

  const [rows] = await pool.query(
    `SELECT c.*, GROUP_CONCAT(u.full_name SEPARATOR ', ') AS teachers
     FROM courses c
     LEFT JOIN course_teachers ct ON ct.course_id = c.id
     LEFT JOIN teachers t ON t.id = ct.teacher_id
     LEFT JOIN users u ON u.id = t.user_id
     ${where}
     GROUP BY c.id
     ORDER BY c.semester, c.course_code`,
    params,
  );
  return res.json(new ApiResponse(200, "Courses fetched.", rows));
});

export const getCourse = asyncHandler(async (req, res) => {
  const [[course]] = await pool.query("SELECT * FROM courses WHERE id = ?", [
    req.params.id,
  ]);
  if (!course) throw new ApiError(404, "Course not found.");
  return res.json(new ApiResponse(200, "Course fetched.", course));
});

export const updateCourse = asyncHandler(async (req, res) => {
  const { course_code, course_title, credit, semester } = req.body;
  const [[existing]] = await pool.query("SELECT id FROM courses WHERE id = ?", [
    req.params.id,
  ]);
  if (!existing) throw new ApiError(404, "Course not found.");

  await pool.query(
    "UPDATE courses SET course_code=?, course_title=?, credit=?, semester=? WHERE id=?",
    [course_code, course_title, credit, semester, req.params.id],
  );
  return res.json(new ApiResponse(200, "Course updated."));
});

export const deleteCourse = asyncHandler(async (req, res) => {
  const [[existing]] = await pool.query("SELECT id FROM courses WHERE id = ?", [
    req.params.id,
  ]);
  if (!existing) throw new ApiError(404, "Course not found.");
  await pool.query("DELETE FROM courses WHERE id = ?", [req.params.id]);
  return res.json(new ApiResponse(200, "Course deleted."));
});

export const enrollStudent = asyncHandler(async (req, res) => {
  const { student_id, course_id } = req.body;
  await pool.query(
    "INSERT INTO enrollments (student_id, course_id) VALUES (?, ?)",
    [student_id, course_id],
  );
  return res.status(201).json(new ApiResponse(201, "Student enrolled."));
});

export const assignTeacher = asyncHandler(async (req, res) => {
  const { teacher_id, course_id } = req.body;
  await pool.query(
    "INSERT INTO course_teachers (teacher_id, course_id) VALUES (?, ?)",
    [teacher_id, course_id],
  );
  return res
    .status(201)
    .json(new ApiResponse(201, "Teacher assigned to course."));
});

export const myCourses = asyncHandler(async (req, res) => {
  const [[student]] = await pool.query(
    "SELECT id FROM students WHERE user_id = ?",
    [req.user.id],
  );
  if (!student) throw new ApiError(404, "Student record not found.");

  const [rows] = await pool.query(
    `SELECT c.*, GROUP_CONCAT(u.full_name SEPARATOR ', ') AS teachers
     FROM enrollments e
     JOIN courses c ON c.id = e.course_id
     LEFT JOIN course_teachers ct ON ct.course_id = c.id
     LEFT JOIN teachers t ON t.id = ct.teacher_id
     LEFT JOIN users u ON u.id = t.user_id
     WHERE e.student_id = ?
     GROUP BY c.id`,
    [student.id],
  );
  return res.json(new ApiResponse(200, "Enrolled courses fetched.", rows));
});

export const myTeacherCourses = asyncHandler(async (req, res) => {
  const [[teacher]] = await pool.query(
    "SELECT id FROM teachers WHERE user_id = ?",
    [req.user.id],
  );
  if (!teacher) throw new ApiError(404, "Teacher record not found.");

  const [rows] = await pool.query(
    `SELECT c.*
     FROM course_teachers ct
     JOIN courses c ON c.id = ct.course_id
     WHERE ct.teacher_id = ?
     ORDER BY c.semester, c.course_code`,
    [teacher.id],
  );
  return res.json(new ApiResponse(200, "Assigned courses fetched.", rows));
});

export const getCourseEnrollments = asyncHandler(async (req, res) => {
  const { course_id } = req.query;
  if (!course_id) throw new ApiError(422, "course_id is required.");

  // Verify teacher owns this course (optional - can allow admins too)
  const [[course]] = await pool.query("SELECT id FROM courses WHERE id = ?", [
    course_id,
  ]);
  if (!course) throw new ApiError(404, "Course not found.");

  const [rows] = await pool.query(
    `SELECT e.id, e.student_id, e.course_id,
          u.full_name, s.registration_no, u.email
     FROM enrollments e
     JOIN students s ON s.id = e.student_id
     JOIN users u ON u.id = s.user_id
     WHERE e.course_id = ?
     ORDER BY u.full_name`,
    [course_id],
  );
  return res.json(new ApiResponse(200, "Enrollments fetched.", rows));
});
