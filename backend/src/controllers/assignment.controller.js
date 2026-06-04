import pool from "../config/db.js";
import asyncHandler from "../utils/asyncHandler.js";
import { ApiError, ApiResponse } from "../utils/apiHelpers.js";
import { uploadToCloudinary } from "../utils/cloudinaryUpload.js";

export const createAssignment = asyncHandler(async (req, res) => {
  const { course_id, title, description, due_date, max_marks } = req.body;

  const [[teacher]] = await pool.query(
    "SELECT id FROM teachers WHERE user_id = ?",
    [req.user.id],
  );
  if (!teacher) throw new ApiError(403, "Teacher record not found.");

  const [[ct]] = await pool.query(
    "SELECT id FROM course_teachers WHERE teacher_id = ? AND course_id = ?",
    [teacher.id, course_id],
  );
  if (!ct) throw new ApiError(403, "You are not assigned to this course.");

  let fileUrl = null;

  if (req.file) {
    const result = await uploadToCloudinary(
      req.file.buffer,
      "dept-mgmt/assignments",
      "auto",
    );

    fileUrl = result.secure_url;
  }
  const [result] = await pool.query(
    "INSERT INTO assignments (course_id, teacher_id, title, description, due_date, max_marks, file_url) VALUES (?,?,?,?,?,?,?)",
    [
      course_id,
      teacher.id,
      title,
      description || null,
      due_date,
      max_marks || 100,
      fileUrl,
    ],
  );
  return res
    .status(201)
    .json(new ApiResponse(201, "Assignment created.", { id: result.insertId }));
});

export const getAssignments = asyncHandler(async (req, res) => {
  const { course_id } = req.query;
  if (!course_id) throw new ApiError(422, "course_id is required.");

  const [rows] = await pool.query(
    `SELECT a.*, u.full_name AS teacher_name
     FROM assignments a
     JOIN teachers t ON t.id = a.teacher_id
     JOIN users u    ON u.id = t.user_id
     WHERE a.course_id = ? AND a.is_active = 1
     ORDER BY a.due_date`,
    [course_id],
  );
  return res.json(new ApiResponse(200, "Assignments fetched.", rows));
});

export const submitAssignment = asyncHandler(async (req, res) => {
  const { assignment_id } = req.params;
  const { comment } = req.body;

  const [[student]] = await pool.query(
    "SELECT id FROM students WHERE user_id = ?",
    [req.user.id],
  );
  if (!student) throw new ApiError(404, "Student not found.");

  const [[assignment]] = await pool.query(
    "SELECT id, due_date FROM assignments WHERE id = ?",
    [assignment_id],
  );
  if (!assignment) throw new ApiError(404, "Assignment not found.");
  if (new Date() > new Date(assignment.due_date)) {
    throw new ApiError(400, "Submission deadline has passed.");
  }

  let fileUrl = null;

  if (req.file) {
    const result = await uploadToCloudinary(
      req.file.buffer,
      "dept-mgmt/assignments/submissions",
      "auto"
    );
    fileUrl = result.secure_url;
  }

  await pool.query(
    `INSERT INTO assignment_submissions (assignment_id, student_id, file_url, comment)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE file_url = VALUES(file_url), comment = VALUES(comment), submitted_at = NOW()`,
    [assignment_id, student.id, fileUrl, comment || null],
  );
  return res.status(201).json(new ApiResponse(201, "Assignment submitted."));
});

export const gradeSubmission = asyncHandler(async (req, res) => {
  const { submission_id } = req.params;
  const { marks, feedback } = req.body;

  await pool.query(
    "UPDATE assignment_submissions SET marks = ?, feedback = ?, graded_at = NOW() WHERE id = ?",
    [marks, feedback || null, submission_id],
  );
  return res.json(new ApiResponse(200, "Submission graded."));
});

export const getSubmissions = asyncHandler(async (req, res) => {
  const { assignment_id } = req.params;

  const [rows] = await pool.query(
    `SELECT asub.*, u.full_name, s.registration_no
     FROM assignment_submissions asub
     JOIN students s ON s.id = asub.student_id
     JOIN users u    ON u.id = s.user_id
     WHERE asub.assignment_id = ?
     ORDER BY asub.submitted_at`,
    [assignment_id],
  );
  return res.json(new ApiResponse(200, "Submissions fetched.", rows));
});

export const mySubmissions = asyncHandler(async (req, res) => {
  const [[student]] = await pool.query(
    "SELECT id FROM students WHERE user_id = ?",
    [req.user.id],
  );
  if (!student) throw new ApiError(404, "Student not found.");

  const [rows] = await pool.query(
    `SELECT asub.*, a.title, a.due_date, a.max_marks, c.course_title
     FROM assignment_submissions asub
     JOIN assignments a ON a.id = asub.assignment_id
     JOIN courses c     ON c.id = a.course_id
     WHERE asub.student_id = ?
     ORDER BY asub.submitted_at DESC`,
    [student.id],
  );
  return res.json(new ApiResponse(200, "Submissions fetched.", rows));
});
