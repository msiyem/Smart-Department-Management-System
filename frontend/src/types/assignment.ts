export interface Assignment {
  id: number;
  course_id: number;
  teacher_id: number;
  title: string;
  description: string | null;
  due_date: string;
  max_marks: number;
  file_url: string | null;
  teacher_name?: string;
  course_code?: string;
  course_title?: string;
  created_at?: string;
  is_active?: number;
  submission_id?: number | null;
  submission_file_url?: string | null;
  submission_comment?: string | null;
  submitted_at?: string | null;
  marks?: number | null;
  feedback?: string | null;
  graded_at?: string | null;
  submission_count?: number;
  graded_count?: number;
}

export interface AssignmentSubmission {
  id: number;
  assignment_id: number;
  student_id: number;
  file_url: string | null;
  comment: string | null;
  submitted_at: string;
  marks: number | null;
  feedback: string | null;
  graded_at: string | null;
  full_name: string;
  registration_no: string;
  max_marks: number;
}
