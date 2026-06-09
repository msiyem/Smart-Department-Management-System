
import { z } from "zod";

const emailSchema = z
  .string()
  .email("Invalid email address")
  .toLowerCase()
  .trim();

const passwordSchema = z
  .string()
  .trim()
  .min(8, "Password must be at least 8 characters")
  .max(100, "Password is too long")
  .regex(/[A-Z]/, "Must contain at least one uppercase letter")
  .regex(/[0-9]/, "Must contain at least one number");

const fullNameSchema = z
  .string()
  .trim()
  .min(2, "Full name must be at least 2 characters")
  .max(100, "Full name is too long");

const registrationSchema = z
  .string()
  .trim()
  .regex(
    /^\d{10}$/,
    "Registration number must be exactly 10 digits",
  );

const sessionSchema = z
  .string()
  .trim()
  .regex(
    /^\d{4}-\d{2}$/,
    "Session must be like 2022-23",
  );

const designationSchema = z
  .string()
  .trim()
  .min(2, "Designation is too short")
  .max(50, "Designation is too long");

export const createUserSchema = z
  .object({
    full_name: fullNameSchema,

    email: emailSchema,

    password: passwordSchema,

    confirm_password: z
      .string()
      .trim()
      .min(1, "Please confirm password"),

    role: z.enum([
      "student",
      "teacher",
      "admin",
    ]),

    registration_no:
      registrationSchema.optional(),

    session: sessionSchema.optional(),

    semester: z.coerce
      .number({
        invalid_type_error:
          "Semester must be a number",
      })
      .int("Semester must be an integer")
      .min(
        1,
        "Semester must be between 1 and 8",
      )
      .max(
        8,
        "Semester must be between 1 and 8",
      )
      .optional(),

    designation: designationSchema.optional(),
  })

  // .refine(
  //   (data) =>
  //     data.password === data.confirm_password,
  //   {
  //     path: ["confirm_password"],
  //     message: "Passwords do not match",
  //   },
  // )

  .superRefine((data, ctx) => {
    if (data.role === "student") {
      if (!data.registration_no) {
        ctx.addIssue({
          code: "custom",
          path: ["registration_no"],
          message:
            "Registration number is required for students",
        });
      }

      if (!data.session) {
        ctx.addIssue({
          code: "custom",
          path: ["session"],
          message:
            "Session is required for students",
        });
      }

      if (!data.semester) {
        ctx.addIssue({
          code: "custom",
          path: ["semester"],
          message:
            "Semester is required for students",
        });
      }
    }

    if (data.role === "teacher") {
      if (!data.designation) {
        ctx.addIssue({
          code: "custom",
          path: ["designation"],
          message:
            "Designation is required for teachers",
        });
      }
    }
  })

  .transform((data) => ({
    ...data,

    registration_no:
      data.registration_no || undefined,

    session: data.session || undefined,

    designation:
      data.designation || undefined,
  }));

export type CreateUserInput = z.infer<
  typeof createUserSchema
>;