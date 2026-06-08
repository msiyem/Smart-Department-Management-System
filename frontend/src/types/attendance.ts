export interface Course {
  id: number;
  course_code: string;
  course_title: string;
  credit: number;
  semester: number;
}

export interface Student {
  id: number;
  full_name: string;
  registration_no: string;
  email: string;
  enrollment_status?: string;
}

export interface AttendanceRecord {
  student_id: number;
  status: "present" | "absent";
}

export interface AttendanceHistory {
  id: number;
  student_id: number;
  course_id: number;
  attendance_date: string;
  status: "present" | "absent";
  full_name: string;
  registration_no: string;
}
