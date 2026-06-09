"use server";

import { serverRequest } from "@/action/server-request.action";
import { APIResponse } from "@/lib/api";
import type { Assignment, AssignmentSubmission } from "@/types/assignment";

export interface AssignmentFormPayload {
  course_id: number;
  title: string;
  description?: string;
  due_date: string;
  max_marks: number;
  file?: File | null;
}

interface CreateAssignmentResponse {
  success: boolean;
  message: string;
  assignmentId?: number;
}

interface GetAssignmentsResponse {
  success: boolean;
  message?: string;
  data: Assignment[];
}

interface SubmitAssignmentPayload {
  assignment_id: number;
  comment?: string;
  file?: File | null;
}

interface SubmitAssignmentResponse {
  success: boolean;
  message: string;
}

interface GetSubmissionsResponse {
  success: boolean;
  message?: string;
  data: AssignmentSubmission[];
}

interface GradeSubmissionPayload {
  submission_id: number;
  marks: number;
  feedback?: string;
}

/**
 * Create a new assignment with optional file upload
 * Uses proper server action with FormData handling
 */
export async function createAssignment(
  payload: AssignmentFormPayload,
): Promise<CreateAssignmentResponse> {
  try {
    if (!payload.course_id || !payload.title || !payload.due_date) {
      return {
        success: false,
        message: "Missing required fields: course_id, title, or due_date",
      };
    }

    const formData = new FormData();
    formData.append("course_id", String(payload.course_id));
    formData.append("title", payload.title);
    formData.append("due_date", payload.due_date);
    formData.append("max_marks", String(payload.max_marks || 100));

    if (payload.description?.trim()) {
      formData.append("description", payload.description);
    }

    if (payload.file) {
      if (payload.file.size > 50 * 1024 * 1024) {
        return {
          success: false,
          message: "File size must not exceed 50MB",
        };
      }
      formData.append("file", payload.file);
    }

    const response = await serverRequest<APIResponse<{ id: number }>>(
      "/assignments",
      {
        method: "POST",
        body: formData,
        auth: true,
      },
    );

    return {
      success: true,
      message: response.message || "Assignment created successfully",
      assignmentId: response.data?.id,
    };
  } catch (error) {
    console.error("Create assignment error:", error);

    const errorMessage =
      error && typeof error === "object" && "message" in error
        ? (error.message as string)
        : "Failed to create assignment";

    return {
      success: false,
      message: errorMessage,
    };
  }
}

/**
 * Fetch assignments for a specific course
 */
export async function getAssignments(
  courseId: number,
): Promise<GetAssignmentsResponse> {
  try {
    if (!courseId || courseId <= 0) {
      return {
        success: false,
        message: "Invalid course ID",
        data: [],
      };
    }

    const response = await serverRequest<APIResponse<Assignment[]>>(
      `/assignments?course_id=${courseId}`,
      {
        method: "GET",
        auth: true,
      },
    );

    return {
      success: true,
      message: response.message,
      data: response.data || [],
    };
  } catch (error) {
    console.error("Get assignments error:", error);

    const errorMessage =
      error && typeof error === "object" && "message" in error
        ? (error.message as string)
        : "Failed to load assignments";

    return {
      success: false,
      message: errorMessage,
      data: [],
    };
  }
}

/**
 * Fetch all assignments created by the current teacher
 */
export async function getTeacherAssignments(): Promise<GetAssignmentsResponse> {
  try {
    const response = await serverRequest<APIResponse<Assignment[]>>(
      `/assignments/teacher/created`,
      {
        method: "GET",
        auth: true,
      },
    );

    return {
      success: true,
      message: response.message,
      data: response.data || [],
    };
  } catch (error) {
    console.error("Get teacher assignments error:", error);

    const errorMessage =
      error && typeof error === "object" && "message" in error
        ? (error.message as string)
        : "Failed to load assignments";

    return {
      success: false,
      message: errorMessage,
      data: [],
    };
  }
}

export async function deleteAssignment(
  assignmentId: number,
): Promise<SubmitAssignmentResponse> {
  try {
    if (!assignmentId || assignmentId <= 0) {
      return {
        success: false,
        message: "Invalid assignment ID",
      };
    }

    const response = await serverRequest<APIResponse<null>>(
      `/assignments/${assignmentId}`,
      {
        method: "DELETE",
        auth: true,
      },
    );

    return {
      success: true,
      message: response.message || "Assignment deleted successfully",
    };
  } catch (error) {
    console.error("Delete assignment error:", error);

    const errorMessage =
      error && typeof error === "object" && "message" in error
        ? (error.message as string)
        : "Failed to delete assignment";

    return {
      success: false,
      message: errorMessage,
    };
  }
}

/**
 * Fetch all assignments for student (assignments from enrolled courses)
 */
export async function getStudentAssignments(): Promise<GetAssignmentsResponse> {
  try {
    const response = await serverRequest<APIResponse<Assignment[]>>(
      `/assignments/student/my`,
      {
        method: "GET",
        auth: true,
      },
    );

    return {
      success: true,
      message: response.message,
      data: response.data || [],
    };
  } catch (error) {
    console.error("Get student assignments error:", error);

    const errorMessage =
      error && typeof error === "object" && "message" in error
        ? (error.message as string)
        : "Failed to load assignments";

    return {
      success: false,
      message: errorMessage,
      data: [],
    };
  }
}

/**
 * Submit an assignment by student
 */
export async function submitAssignmentByStudent(
  payload: SubmitAssignmentPayload,
): Promise<SubmitAssignmentResponse> {
  try {
    if (!payload.assignment_id) {
      return {
        success: false,
        message: "Assignment ID is required",
      };
    }

    const formData = new FormData();

    if (payload.comment?.trim()) {
      formData.append("comment", payload.comment);
    }

    if (payload.file) {
      if (payload.file.size > 50 * 1024 * 1024) {
        return {
          success: false,
          message: "File size must not exceed 50MB",
        };
      }
      formData.append("file", payload.file);
    }

    const response = await serverRequest<APIResponse<{ id: number }>>(
      `/assignments/${payload.assignment_id}/submit`,
      {
        method: "POST",
        body: formData,
        auth: true,
      },
    );

    return {
      success: true,
      message: response.message || "Assignment submitted successfully",
    };
  } catch (error) {
    console.error("Submit assignment error:", error);

    const errorMessage =
      error && typeof error === "object" && "message" in error
        ? (error.message as string)
        : "Failed to submit assignment";

    return {
      success: false,
      message: errorMessage,
    };
  }
}

export async function getAssignmentSubmissions(
  assignmentId: number,
): Promise<GetSubmissionsResponse> {
  try {
    if (!assignmentId || assignmentId <= 0) {
      return {
        success: false,
        message: "Invalid assignment ID",
        data: [],
      };
    }

    const response = await serverRequest<APIResponse<AssignmentSubmission[]>>(
      `/assignments/${assignmentId}/submissions`,
      {
        method: "GET",
        auth: true,
      },
    );

    return {
      success: true,
      message: response.message,
      data: response.data || [],
    };
  } catch (error) {
    console.error("Get assignment submissions error:", error);

    const errorMessage =
      error && typeof error === "object" && "message" in error
        ? (error.message as string)
        : "Failed to load submissions";

    return {
      success: false,
      message: errorMessage,
      data: [],
    };
  }
}

export async function gradeAssignmentSubmission(
  payload: GradeSubmissionPayload,
): Promise<SubmitAssignmentResponse> {
  try {
    if (!payload.submission_id) {
      return {
        success: false,
        message: "Submission ID is required",
      };
    }

    const response = await serverRequest<APIResponse<null>>(
      `/assignments/submissions/${payload.submission_id}/grade`,
      {
        method: "PATCH",
        body: JSON.stringify({
          marks: payload.marks,
          feedback: payload.feedback?.trim() || undefined,
        }),
        auth: true,
      },
    );

    return {
      success: true,
      message: response.message || "Submission graded successfully",
    };
  } catch (error) {
    console.error("Grade assignment submission error:", error);

    const errorMessage =
      error && typeof error === "object" && "message" in error
        ? (error.message as string)
        : "Failed to grade submission";

    return {
      success: false,
      message: errorMessage,
    };
  }
}
