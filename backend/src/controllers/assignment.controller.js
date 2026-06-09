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
    const resourceType = req.file.mimetype.startsWith("image/")
      ? "image"
      : "raw";
    const result = await uploadToCloudinary(
      req.file.buffer,
      "dept-mgmt/assignments",
      resourceType,
      req.file.originalname,
    );

    fileUrl = result.secure_url;
  }
  const dueDateForDb =
    typeof due_date === "string" && due_date.length === 10
      ? `${due_date} 23:59:59`
      : due_date;

  const [result] = await pool.query(
    "INSERT INTO assignments (course_id, teacher_id, title, description, due_date, max_marks, file_url) VALUES (?,?,?,?,?,?,?)",
    [
      course_id,
      teacher.id,
      title,
      description || null,
      dueDateForDb,
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

  if (!req.file && !comment?.trim()) {
    throw new ApiError(422, "Please upload a file or add a comment.");
  }

  const [[assignment]] = await pool.query(
    `SELECT a.id, a.course_id, a.due_date
     FROM assignments a
     JOIN enrollments e ON e.course_id = a.course_id AND e.student_id = ?
     WHERE a.id = ? AND a.is_active = 1`,
    [student.id, assignment_id],
  );
  if (!assignment) {
    throw new ApiError(404, "Assignment not found for your courses.");
  }

  const dueAt = new Date(assignment.due_date);
  dueAt.setHours(23, 59, 59, 999);
  if (new Date() > dueAt) {
    throw new ApiError(400, "Submission deadline has passed.");
  }

  let fileUrl = null;

  if (req.file) {
    const resourceType = req.file.mimetype.startsWith("image/")
      ? "image"
      : "raw";
    const result = await uploadToCloudinary(
      req.file.buffer,
      "dept-mgmt/assignments/submissions",
      resourceType,
      req.file.originalname,
    );
    fileUrl = result.secure_url;
  }

  await pool.query(
    `INSERT INTO assignment_submissions (assignment_id, student_id, file_url, comment)
     VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       file_url = COALESCE(VALUES(file_url), file_url),
       comment = VALUES(comment),
       marks = NULL,
       feedback = NULL,
       graded_at = NULL,
       submitted_at = NOW()`,
    [assignment_id, student.id, fileUrl, comment?.trim() || null],
  );
  return res.status(201).json(new ApiResponse(201, "Assignment submitted."));
});

export const gradeSubmission = asyncHandler(async (req, res) => {
  const { submission_id } = req.params;
  const { marks, feedback } = req.body;

  if (req.user.role === "teacher") {
    const [[teacher]] = await pool.query(
      "SELECT id FROM teachers WHERE user_id = ?",
      [req.user.id],
    );
    if (!teacher) throw new ApiError(403, "Teacher record not found.");

    const [[submission]] = await pool.query(
      `SELECT asub.id
       FROM assignment_submissions asub
       JOIN assignments a ON a.id = asub.assignment_id
       WHERE asub.id = ? AND a.teacher_id = ?`,
      [submission_id, teacher.id],
    );
    if (!submission) {
      throw new ApiError(403, "You cannot grade this submission.");
    }
  }

  await pool.query(
    "UPDATE assignment_submissions SET marks = ?, feedback = ?, graded_at = NOW() WHERE id = ?",
    [marks, feedback || null, submission_id],
  );
  return res.json(new ApiResponse(200, "Submission graded."));
});

export const getSubmissions = asyncHandler(async (req, res) => {
  const { assignment_id } = req.params;

  if (req.user.role === "teacher") {
    const [[teacher]] = await pool.query(
      "SELECT id FROM teachers WHERE user_id = ?",
      [req.user.id],
    );
    if (!teacher) throw new ApiError(403, "Teacher record not found.");

    const [[assignment]] = await pool.query(
      "SELECT id FROM assignments WHERE id = ? AND teacher_id = ?",
      [assignment_id, teacher.id],
    );
    if (!assignment) {
      throw new ApiError(403, "You cannot view these submissions.");
    }
  }

  const [rows] = await pool.query(
    `SELECT asub.*, u.full_name, s.registration_no, a.max_marks
     FROM assignment_submissions asub
     JOIN assignments a ON a.id = asub.assignment_id
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

export const getTeacherAssignments = asyncHandler(async (req, res) => {
  const [[teacher]] = await pool.query(
    "SELECT id FROM teachers WHERE user_id = ?",
    [req.user.id],
  );
  if (!teacher) throw new ApiError(403, "Teacher record not found.");

  const [rows] = await pool.query(
    `SELECT a.*, c.course_code, c.course_title, u.full_name AS teacher_name,
            COALESCE(stats.submission_count, 0) AS submission_count,
            COALESCE(stats.graded_count, 0) AS graded_count
     FROM assignments a
     JOIN courses c ON c.id = a.course_id
     JOIN teachers t ON t.id = a.teacher_id
     JOIN users u ON u.id = t.user_id
     LEFT JOIN (
       SELECT assignment_id,
              COUNT(*) AS submission_count,
              SUM(CASE WHEN graded_at IS NOT NULL THEN 1 ELSE 0 END) AS graded_count
       FROM assignment_submissions
       GROUP BY assignment_id
     ) stats ON stats.assignment_id = a.id
     WHERE a.teacher_id = ? AND a.is_active = 1
     ORDER BY a.created_at DESC`,
    [teacher.id],
  );
  return res.json(new ApiResponse(200, "Teacher assignments fetched.", rows));
});

export const getStudentAssignments = asyncHandler(async (req, res) => {
  const [[student]] = await pool.query(
    "SELECT id FROM students WHERE user_id = ?",
    [req.user.id],
  );
  if (!student) throw new ApiError(404, "Student record not found.");

  const [rows] = await pool.query(
    `SELECT a.*, c.course_code, c.course_title, u.full_name AS teacher_name,
            asub.id AS submission_id,
            asub.file_url AS submission_file_url,
            asub.comment AS submission_comment,
            asub.submitted_at,
            asub.marks,
            asub.feedback,
            asub.graded_at
     FROM enrollments e
     JOIN assignments a ON a.course_id = e.course_id AND a.is_active = 1
     JOIN courses c ON c.id = a.course_id
     JOIN teachers t ON t.id = a.teacher_id
     JOIN users u ON u.id = t.user_id
     LEFT JOIN assignment_submissions asub
       ON asub.assignment_id = a.id AND asub.student_id = e.student_id
     WHERE e.student_id = ?
     ORDER BY a.due_date ASC, a.created_at DESC`,
    [student.id],
  );

  return res.json(new ApiResponse(200, "Student assignments fetched.", rows));
});

export const deleteAssignment = asyncHandler(async (req, res) => {
  const { assignment_id } = req.params;

  if (req.user.role === "teacher") {
    const [[teacher]] = await pool.query(
      "SELECT id FROM teachers WHERE user_id = ?",
      [req.user.id],
    );
    if (!teacher) throw new ApiError(403, "Teacher record not found.");

    const [[assignment]] = await pool.query(
      "SELECT id FROM assignments WHERE id = ? AND teacher_id = ? AND is_active = 1",
      [assignment_id, teacher.id],
    );
    if (!assignment) {
      throw new ApiError(403, "You can only delete assignments you created.");
    }
  } else {
    const [[assignment]] = await pool.query(
      "SELECT id FROM assignments WHERE id = ? AND is_active = 1",
      [assignment_id],
    );
    if (!assignment) throw new ApiError(404, "Assignment not found.");
  }

  await pool.query("UPDATE assignments SET is_active = 0 WHERE id = ?", [
    assignment_id,
  ]);

  return res.json(new ApiResponse(200, "Assignment deleted."));
});
