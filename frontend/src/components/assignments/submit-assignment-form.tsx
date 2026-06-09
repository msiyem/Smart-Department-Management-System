"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { submitAssignmentByStudent } from "@/action/assignment.action";
import { FileUploader } from "@/components/shared/file-uploader";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

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

const submitAssignmentSchema = z.object({
  comment: z
    .string()
    .max(5000, "Comment must be less than 5000 characters")
    .optional()
    .default(""),
  file: z
    .instanceof(File)
    .optional()
    .nullable()
    .refine(
      (file) => !file || file.size <= 50 * 1024 * 1024,
      "File size must be less than 50MB",
    )
    .refine(
      (file) => !file || ACCEPTED_FILE_TYPES.includes(file.type),
      "File type must be PDF, DOC, DOCX, XLSX, TXT, JPG, PNG, or ZIP",
    ),
});

type SubmitAssignmentFormValues = z.infer<typeof submitAssignmentSchema>;

interface SubmitAssignmentFormProps {
  assignmentId: number;
  onSuccess?: () => void;
}

export function SubmitAssignmentForm({
  assignmentId,
  onSuccess,
}: SubmitAssignmentFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SubmitAssignmentFormValues>({
    resolver: zodResolver(submitAssignmentSchema),
  });

  const onSubmit: SubmitHandler<SubmitAssignmentFormValues> = async (
    values: SubmitAssignmentFormValues,
  ) => {
    try {
      if (!values.file && !values.comment?.trim()) {
        toast.error("Please upload a file or add a comment");
        return;
      }

      const response = await submitAssignmentByStudent({
        assignment_id: assignmentId,
        comment: values.comment?.trim(),
        file: values.file || null,
      });

      if (!response.success) {
        toast.error(response.message || "Failed to submit assignment");
        return;
      }

      toast.success(response.message);
      onSuccess?.();
    } catch (error) {
      console.error("Submit assignment error:", error);
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred",
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Comment/Notes */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Comments (Optional)</label>
        <Textarea
          {...register("comment")}
          placeholder="Add any notes or comments about your submission..."
          rows={4}
        />
        {errors.comment && (
          <p className="text-sm text-red-500">{errors.comment.message}</p>
        )}
      </div>

      {/* File Upload */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Upload File (Optional)</label>
        <Controller
          control={control}
          name="file"
          render={({ field }) => (
            <FileUploader
              value={field.value}
              onChange={field.onChange}
              label="Upload your assignment file"
              maxSizeMB={50}
            />
          )}
        />
        {errors.file && (
          <p className="text-sm text-red-500">{errors.file.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Upload className="mr-2 size-4" />
              Submit Assignment
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
