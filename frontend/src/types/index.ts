export type Role = "admin" | "teacher" | "student";

export interface User {
  id: number;
  full_name: string;
  email: string;
  role: Role;
  profile_image?: string | null;
  is_active: number;
  last_login_at?: string | null;
  created_at: string;
  registration_no?: string;
  session?: string;
  semester?: number;
  cgpa?: number;
  designation?: string;
}

export interface Course {
  id: number;
  course_code: string;
  course_title: string;
  credit: number;
  semester: number;
  is_active: number;
  teachers?: string;
  created_at: string;
}

export type AttendanceStatus = "present" | "absent";

export interface AttendanceRecord {
  id: number;
  student_id: number;
  course_id: number;
  attendance_date: string;
  status: AttendanceStatus;
  full_name?: string;
  registration_no?: string;
}

export interface AttendanceSummary {
  course_code: string;
  course_title: string;
  total_classes: number;
  present: number;
  absent: number;
  attendance_percent: number;
}

export interface Assignment {
  id: number;
  course_id: number;
  teacher_id: number;
  title: string;
  description?: string;
  file_url?: string | null;
  due_date: string;
  max_marks: number;
  is_active: number;
  teacher_name?: string;
  course_title?: string;
  created_at: string;
}

export interface Submission {
  id: number;
  assignment_id: number;
  student_id: number;
  file_url?: string | null;
  comment?: string;
  submitted_at: string;
  marks?: number | null;
  feedback?: string | null;
  graded_at?: string | null;
  full_name?: string;
  registration_no?: string;
  title?: string;
  due_date?: string;
  max_marks?: number;
  course_title?: string;
}

export interface Result {
  id: number;
  student_id: number;
  course_id: number;
  marks: number;
  grade: string;
  gpa: number;
  remarks?: string;
  course_code?: string;
  course_title?: string;
  credit?: number;
  semester?: number;
  full_name?: string;
  registration_no?: string;
}

export type NoticePriority = "low" | "medium" | "high";

export interface Notice {
  id: number;
  title: string;
  description?: string;
  attachment?: string | null;
  priority: NoticePriority;
  created_by?: number;
  created_by_name?: string;
  created_at: string;
}

export type WeekDay = "Saturday" | "Sunday" | "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";

export interface RoutineSlot {
  id: number;
  course_id: number;
  teacher_id: number;
  room_no?: string;
  day: WeekDay;
  start_time: string;
  end_time: string;
  course_code?: string;
  course_title?: string;
  teacher_name?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  errors?: { field: string; message: string }[];
}

export interface AdminDashboard {
  total_students: number;
  total_teachers: number;
  total_courses: number;
  total_notices: number;
  recent_notices: Pick<Notice, "id" | "title" | "priority" | "created_at">[];
}

export interface StudentDashboard {
  cgpa: number;
  semester: number;
  enrolled_courses: number;
  pending_assignments: number;
  recent_notices: Pick<Notice, "id" | "title" | "priority" | "created_at">[];
}

export interface TeacherDashboard {
  courses_teaching: number;
  total_assignments: number;
}
