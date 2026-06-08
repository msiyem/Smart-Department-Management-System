"use server";

import { serverRequest } from "@/action/server-request.action";
import { APIResponse } from "@/lib/api";
import type {
  AttendanceSummary,
  Course,
  Notice,
  Result,
  RoutineSlot,
  StudentDashboard,
} from "@/types";

type ActionResult<T> = {
  success: boolean;
  message?: string;
  data: T;
};

export type StudentResultsData = {
  results: Result[];
  cgpa: number;
};

export type NoticesData = {
  notices: Notice[];
  total: number;
  page: number;
};

function getErrorMessage(error: unknown, fallback: string) {
  return error && typeof error === "object" && "message" in error
    ? String(error.message)
    : fallback;
}

export async function getStudentDashboard(): Promise<
  ActionResult<StudentDashboard | null>
> {
  try {
    const response = await serverRequest<APIResponse<StudentDashboard>>(
      "/dashboard/student",
      {
        method: "GET",
        auth: true,
      },
    );

    return {
      success: true,
      message: response.message,
      data: response.data ?? null,
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error, "Failed to load dashboard"),
      data: null,
    };
  }
}

export async function getMyCourses(): Promise<ActionResult<Course[]>> {
  try {
    const response = await serverRequest<APIResponse<Course[]>>("/courses/my", {
      method: "GET",
      auth: true,
    });

    return {
      success: true,
      message: response.message,
      data: response.data ?? [],
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error, "Failed to load courses"),
      data: [],
    };
  }
}

export async function getMyAttendance(): Promise<
  ActionResult<AttendanceSummary[]>
> {
  try {
    const response = await serverRequest<APIResponse<AttendanceSummary[]>>(
      "/attendance/my",
      {
        method: "GET",
        auth: true,
      },
    );

    return {
      success: true,
      message: response.message,
      data: response.data ?? [],
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error, "Failed to load attendance"),
      data: [],
    };
  }
}

export async function getMyResults(): Promise<ActionResult<StudentResultsData>> {
  try {
    const response = await serverRequest<APIResponse<StudentResultsData>>(
      "/results/my",
      {
        method: "GET",
        auth: true,
      },
    );

    return {
      success: true,
      message: response.message,
      data: response.data ?? { results: [], cgpa: 0 },
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error, "Failed to load results"),
      data: { results: [], cgpa: 0 },
    };
  }
}

export async function getStudentNotices(): Promise<ActionResult<NoticesData>> {
  try {
    const response = await serverRequest<APIResponse<NoticesData>>(
      "/notices?limit=20",
      {
        method: "GET",
        auth: true,
      },
    );

    return {
      success: true,
      message: response.message,
      data: response.data ?? { notices: [], total: 0, page: 1 },
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error, "Failed to load notices"),
      data: { notices: [], total: 0, page: 1 },
    };
  }
}

export async function getStudentRoutine(): Promise<ActionResult<RoutineSlot[]>> {
  try {
    const response = await serverRequest<APIResponse<RoutineSlot[]>>(
      "/routines",
      {
        method: "GET",
        auth: true,
      },
    );

    return {
      success: true,
      message: response.message,
      data: response.data ?? [],
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error, "Failed to load routine"),
      data: [],
    };
  }
}
