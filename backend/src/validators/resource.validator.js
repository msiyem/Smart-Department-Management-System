import { z } from 'zod';

export const courseSchema = z.object({
  course_code:  z.string().min(2).max(20).trim().toUpperCase(),
  course_title: z.string().min(3).max(100).trim(),
  credit:       z.coerce.number().min(0.5).max(20),
  semester:     z.coerce.number().int().min(1).max(12),
});

export const enrollSchema = z.object({
  student_id: z.coerce.number().int().positive(),
  course_id:  z.coerce.number().int().positive(),
});

export const assignTeacherSchema = z.object({
  teacher_id: z.coerce.number().int().positive(),
  course_id:  z.coerce.number().int().positive(),
});

const DAYS = ['Saturday','Sunday','Monday','Tuesday','Wednesday','Thursday','Friday'];

export const attendanceSchema = z.object({
  course_id:       z.coerce.number().int().positive(),
  attendance_date: z.string().date(), // YYYY-MM-DD
  records: z.array(
    z.object({
      student_id: z.coerce.number().int().positive(),
      status:     z.enum(['present', 'absent']),
    }),
  ).min(1),
});

export const assignmentSchema = z.object({
  course_id:   z.coerce.number().int().positive(),
  title:       z.string().min(3).max(255).trim(),
  description: z.string().max(2000).optional(),
  due_date:    z.string().datetime({ offset: true }),
  max_marks:   z.coerce.number().min(1).max(1000).default(100),
});

export const gradeSubmissionSchema = z.object({
  marks:    z.coerce.number().min(0).max(1000),
  feedback: z.string().max(1000).optional(),
});

export const resultSchema = z.object({
  student_id: z.coerce.number().int().positive(),
  course_id:  z.coerce.number().int().positive(),
  marks:      z.coerce.number().min(0).max(100),
  remarks:    z.string().max(255).optional(),
});

export const noticeSchema = z.object({
  title:       z.string().min(3).max(255).trim(),
  description: z.string().max(5000).optional(),
  priority:    z.enum(['low', 'medium', 'high']).default('medium'),
});

export const routineSchema = z.object({
  course_id:  z.coerce.number().int().positive(),
  teacher_id: z.coerce.number().int().positive(),
  room_no:    z.string().max(20).optional(),
  day:        z.enum(DAYS),
  start_time: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Invalid time HH:MM'),
  end_time:   z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, 'Invalid time HH:MM'),
});
