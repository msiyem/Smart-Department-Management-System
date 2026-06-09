"use client";

import React, { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Controller,
  useForm,
  useWatch,
  type SubmitHandler,
} from "react-hook-form";
import { Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";

import {
  assignmentSchema,
  type AssignmentFormValues,
} from "@/lib/validations/assignment";
import { createAssignment } from "@/action/assignment.action";
import { serverRequest } from "@/action/server-request.action";
import { APIResponse } from "@/lib/api";
import { FileUploader } from "@/components/shared/file-uploader";
import { DatePicker } from "@/components/shared/date-picker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface Course {
  id: number;
  course_code: string;
  course_title: string;
}

interface CreateAssignmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function CreateAssignmentModal({
  open,
  onOpenChange,
  onSuccess,
}: CreateAssignmentModalProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [popoverOpen, setPopoverOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AssignmentFormValues>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      due_date: format(new Date(), "yyyy-MM-dd"),
      max_marks: 100,
    },
  });

  // Load courses when modal opens
  useEffect(() => {
    if (!open) return;

    const loadCourses = async () => {
      try {
        setCoursesLoading(true);
        const response = await serverRequest<APIResponse<Course[]>>(
          "/courses/teacher/my",
          {
            method: "GET",
            auth: true,
          },
        );

        if (response.data && Array.isArray(response.data)) {
          setCourses(response.data);
        } else {
          throw new Error("Invalid courses data");
        }
      } catch (error) {
        console.error("Load courses error:", error);
        toast.error(
          error && typeof error === "object" && "message" in error
            ? (error.message as string)
            : "Failed to load courses",
        );
        setCourses([]);
      } finally {
        setCoursesLoading(false);
      }
    };

    loadCourses();
  }, [open]);

  const filteredCourses = useMemo(() => {
    if (!query) return courses;
    return courses.filter((course) =>
      `${course.course_code} ${course.course_title}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    );
  }, [courses, query]);

  const selectedCourseId = useWatch({ control, name: "course_id" });
  const selectedCourse = courses.find((c) => c.id === selectedCourseId);

  const onSubmit: SubmitHandler<AssignmentFormValues> = async (
    values: AssignmentFormValues,
  ) => {
    try {
      if (!values.course_id) {
        toast.error("Please select a course");
        return;
      }

      if (!values.title?.trim()) {
        toast.error("Please enter assignment title");
        return;
      }

      if (!values.due_date) {
        toast.error("Please select a due date");
        return;
      }

      const response = await createAssignment({
        course_id: values.course_id,
        title: values.title.trim(),
        description: values.description?.trim(),
        due_date: values.due_date,
        max_marks: values.max_marks || 100,
        file: values.file || null,
      });

      if (!response.success) {
        toast.error(response.message || "Failed to create assignment");
        return;
      }

      toast.success(response.message);
      reset();
      setQuery("");
      setPopoverOpen(false);
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error(
        error instanceof Error ? error.message : "An unexpected error occurred",
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl sm:min-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle>Create New Assignment</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new assignment for your course
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-5">
              {/* Course Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Course</label>

                <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-between"
                      disabled={coursesLoading}
                    >
                      {coursesLoading ? (
                        <>
                          <Loader2 className="mr-2 size-4 animate-spin" />
                          Loading courses...
                        </>
                      ) : selectedCourse ? (
                        `${selectedCourse.course_code} — ${selectedCourse.course_title}`
                      ) : (
                        "Select course"
                      )}
                      {!coursesLoading && <Plus className="size-4" />}
                    </Button>
                  </PopoverTrigger>

                  {!coursesLoading && (
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput
                          placeholder="Search course..."
                          value={query}
                          onValueChange={setQuery}
                        />
                        <CommandList>
                          <CommandEmpty>
                            {courses.length === 0
                              ? "No courses available."
                              : "No course found."}
                          </CommandEmpty>
                          <CommandGroup>
                            {filteredCourses.map((course) => (
                              <CommandItem
                                key={course.id}
                                onSelect={() => {
                                  setValue("course_id", course.id, {
                                    shouldValidate: true,
                                    shouldDirty: true,
                                  });
                                  setPopoverOpen(false);
                                  setQuery("");
                                }}
                              >
                                {course.course_code} — {course.course_title}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  )}
                </Popover>

                {errors.course_id && (
                  <p className="text-sm text-red-500">
                    {errors.course_id.message}
                  </p>
                )}
              </div>

              {/* Title */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input {...register("title")} placeholder="Assignment title" />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea rows={6} {...register("description")} className="sm:h-55" />
              </div>
            </div>

            <div className="space-y-5">
              {/* Due Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Due Date</label>
                <Controller
                  control={control}
                  name="due_date"
                  render={({ field }) => (
                    <DatePicker value={field.value} onChange={field.onChange} />
                  )}
                />
                {errors.due_date && (
                  <p className="text-sm text-red-500">
                    {errors.due_date.message}
                  </p>
                )}
              </div>

              {/* Max Marks */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Max Marks</label>
                <Input
                  type="number"
                  {...register("max_marks", {
                    valueAsNumber: true,
                  })}
                />
                {errors.max_marks && (
                  <p className="text-sm text-red-500">
                    {errors.max_marks.message}
                  </p>
                )}
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Attachment (Optional)
                </label>
                <Controller
                  control={control}
                  name="file"
                  render={({ field }) => (
                    <FileUploader
                      value={field.value}
                      onChange={field.onChange}
                      maxSizeMB={50}
                    />
                  )}
                />
                {errors.file && (
                  <p className="text-sm text-red-500">{errors.file.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              <X className="mr-2 size-4" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || coursesLoading || courses.length === 0}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 size-4" />
                  Create Assignment
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
