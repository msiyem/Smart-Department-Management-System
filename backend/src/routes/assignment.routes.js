import { Router } from "express";
import {
  createAssignment,
  getAssignments,
  submitAssignment,
  gradeSubmission,
  getSubmissions,
  mySubmissions,
  getTeacherAssignments,
  getStudentAssignments,
} from "../controllers/assignment.controller.js";
import { protect, authorize } from "../middlewares/auth.js";
import validate from "../middlewares/validate.js";
import {
  assignmentSchema,
  gradeSubmissionSchema,
} from "../validators/resource.validator.js";
import { uploadAssignment } from "../middlewares/upload.js";

const router = Router();
router.use(protect);

router.get("/", getAssignments);
router.get("/my", authorize("student"), mySubmissions);
router.get("/student/my", authorize("student"), getStudentAssignments);
router.get("/teacher/created", authorize("teacher"), getTeacherAssignments);

router.post(
  "/",
  authorize("teacher"),
  uploadAssignment.single("file"),
  validate(assignmentSchema),
  createAssignment,
);

router.post(
  "/:assignment_id/submit",
  authorize("student"),
  uploadAssignment.single("file"),
  submitAssignment,
);

router.get(
  "/:assignment_id/submissions",
  authorize("teacher", "admin"),
  getSubmissions,
);

router.patch(
  "/submissions/:submission_id/grade",
  authorize("teacher", "admin"),
  validate(gradeSubmissionSchema),
  gradeSubmission,
);

export default router;
