import { z } from "zod";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ACCEPTED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "image/jpeg",
  "image/png",
  "application/zip",
  "application/x-zip-compressed",
];

export const assignmentSchema = z.object({
  course_id: z
    .number()
    .positive("Please select a course"),

  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(255, "Title must be less than 255 characters"),

  description: z
    .string()
    .max(5000, "Description must be less than 5000 characters")
    .optional()
    .default(""),

  due_date: z
    .string()
    .min(1, "Due date is required")
    .refine((date) => {
      const selectedDate = new Date(date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return selectedDate >= today;
    }, "Due date must be today or in the future"),

  max_marks: z
    .number()
    .min(1, "Minimum marks is 1")
    .max(100, "Maximum marks cannot exceed 100")
    .default(10),

  file: z
    .instanceof(File)
    .optional()
    .nullable()
    .refine(
      (file) => !file || file.size <= MAX_FILE_SIZE,
      `File size must be less than 50MB`,
    )
    .refine(
      (file) => !file || ACCEPTED_FILE_TYPES.includes(file.type),
      "File type must be PDF, DOC, DOCX, XLSX, TXT, JPG, PNG, or ZIP",
    ),
});

export type AssignmentFormValues = z.infer<
  typeof assignmentSchema
>;
