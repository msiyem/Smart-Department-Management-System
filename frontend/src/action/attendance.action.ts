"use server";

import { serverRequest } from "./server-request.action";
import { APIResponse } from "@/lib/api";

export interface AttendanceRecord {
  student_id: number;
  status: "present" | "absent";
}

export interface TakeAttendancePayload {
  course_id: number;
  attendance_date: string;
  records: AttendanceRecord[];
}

export interface CourseEnrollment {
  id: number;
  student_id: number;
  course_id: number;
  full_name: string;
  registration_no: string;
  email: string;
}

export interface AttendanceData {
  id: number;
  student_id: number;
  course_id: number;
  attendance_date: string;
  status: "present" | "absent";
  full_name: string;
  registration_no: string;
}

export interface CourseAttendanceSummary {
  course_code: string;
  course_title: string;
  total_classes: number;
  present: number;
  absent: number;
  attendance_percent: number;
}

export async function takeAttendance(payload: TakeAttendancePayload) {
  try {
    const response = await serverRequest<APIResponse<string>>("/attendance", {
      method: "POST",
      body: JSON.stringify(payload),
      auth: true,
    });
    return {
      success: true,
      message: response.message || "Attendance recorded successfully",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to take attendance",
    };
  }
}

export async function getCourseEnrollments(courseId: number) {
  try {
    const response = await serverRequest<APIResponse<CourseEnrollment[]>>(
      `/courses/enrollment?course_id=${courseId}`,
      {
        method: "GET",
        auth: true,
      },
    );
    return {
      success: true,
      data: response.data || [],
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to fetch enrollments",
      data: [],
    };
  }
}

export async function getCourseAttendance(courseId: number, date?: string) {
  try {
    let endpoint = `/attendance?course_id=${courseId}`;
    if (date) {
      endpoint += `&date=${date}`;
    }

    const response = await serverRequest<APIResponse<AttendanceData[]>>(
      endpoint,
      {
        method: "GET",
        auth: true,
      },
    );
    return {
      success: true,
      data: response.data || [],
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to fetch attendance",
      data: [],
    };
  }
}
