import pool from "../config/db.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError, ApiResponse } from "../utils/apiHelpers.js";
import { calcGrade, calcCGPA } from "../utils/gradeCalc.js";

export const publishResult = asyncHandler(async (req, res) => {
  const { student_id, course_id, marks, remarks } = req.body;

  const { grade, gpa } = calcGrade(marks);

  await pool.query(
    `INSERT INTO results (student_id, course_id, marks, grade, gpa, remarks)
     VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE marks = VALUES(marks), grade = VALUES(grade),
                             gpa   = VALUES(gpa),   remarks = VALUES(remarks)`,
    [student_id, course_id, marks, grade, gpa, remarks || null],
  );

  // Recalculate CGPA
  const [results] = await pool.query(
    `SELECT r.gpa, c.credit
     FROM results r JOIN courses c ON c.id = r.course_id
     WHERE r.student_id = ?`,
    [student_id],
  );
  const cgpa = calcCGPA(results);
  await pool.query("UPDATE students SET cgpa = ? WHERE id = ?", [
    cgpa,
    student_id,
  ]);

  return res
    .status(201)
    .json(new ApiResponse(201, "Result published.", { grade, gpa, cgpa }));
});

export const myResults = asyncHandler(async (req, res) => {
  const [[student]] = await pool.query(
    "SELECT id, cgpa FROM students WHERE user_id = ?",
    [req.user.id],
  );
  if (!student) throw new ApiError(404, "Student not found.");

  const [rows] = await pool.query(
    `SELECT r.*, c.course_code, c.course_title, c.credit, c.semester
     FROM results r JOIN courses c ON c.id = r.course_id
     WHERE r.student_id = ?
     ORDER BY c.semester, c.course_code`,
    [student.id],
  );
  return res.json(
    new ApiResponse(200, "Results fetched.", {
      results: rows,
      cgpa: student.cgpa,
    }),
  );
});

export const courseResults = asyncHandler(async (req, res) => {
  const { course_id } = req.params;

  const [rows] = await pool.query(
    `SELECT r.*, u.full_name, s.registration_no, s.session
     FROM results r
     JOIN students s ON s.id = r.student_id
     JOIN users u    ON u.id = s.user_id
     WHERE r.course_id = ?
     ORDER BY r.marks DESC`,
    [course_id],
  );
  return res.json(new ApiResponse(200, "Course results fetched.", rows));
});
