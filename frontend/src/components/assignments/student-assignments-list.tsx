"use client";

import React, { useEffect, useState } from "react";
import { format, isPast, parseISO, endOfDay } from "date-fns";
import {
  Loader2,
  FileText,
  Clock,
  Award,
  Upload,
  CheckCircle2,
  Download,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

import { getStudentAssignments } from "@/action/assignment.action";
import type { Assignment } from "@/types/assignment";
import { getDownloadUrl } from "@/lib/file-url";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { SubmitAssignmentForm } from "./submit-assignment-form";

interface StudentAssignmentsListProps {
  refreshTrigger?: number;
}

export function StudentAssignmentsList({
  refreshTrigger = 0,
}: StudentAssignmentsListProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [localRefresh, setLocalRefresh] = useState(0);

  useEffect(() => {
    const loadAssignments = async () => {
      try {
        setLoading(true);
        const response = await getStudentAssignments();

        if (response.success) {
          setAssignments(response.data || []);
        } else {
          toast.error(response.message || "Failed to load assignments");
          setAssignments([]);
        }
      } catch (error) {
        console.error("Load student assignments error:", error);
        toast.error("Failed to load assignments");
        setAssignments([]);
      } finally {
        setLoading(false);
      }
    };

    loadAssignments();
  }, [refreshTrigger, localRefresh]);

  const isAssignmentOverdue = (dueDate: string) => {
    try {
      return isPast(endOfDay(parseISO(dueDate)));
    } catch {
      return false;
    }
  };

  const formatDueDate = (dueDate: string) => {
    try {
      return format(parseISO(dueDate), "MMM dd, yyyy");
    } catch {
      return "Invalid date";
    }
  };

  const handleSubmitClick = (assignment: Assignment) => {
    if (isAssignmentOverdue(assignment.due_date)) {
      toast.error("This assignment has passed its due date");
      return;
    }
    setSelectedAssignment(assignment);
    setSubmitDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="mb-4 size-12 text-muted-foreground" />
          <CardTitle className="mb-2">No Assignments Available</CardTitle>
          <CardDescription>
            Assignments will appear here once your teachers create them
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-bold">Assignments</h2>
          <p className="text-sm text-muted-foreground">
            {assignments.length} assignment{assignments.length !== 1 ? "s" : ""}{" "}
            available
          </p>
        </div>


        <div className="grid gap-4">
  {assignments.map((assignment) => {
    const isOverdue = isAssignmentOverdue(assignment.due_date);

    return (
      <Card
        key={assignment.id}
        className={
          isOverdue
            ? "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30"
            : "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30"
        }
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="line-clamp-2 text-gray-900 dark:text-gray-100">
                {assignment.title}
              </CardTitle>

              <CardDescription className="mt-1 text-gray-600 dark:text-gray-400">
                {assignment.teacher_name &&
                  `By ${assignment.teacher_name} • `}
                {assignment.course_title || "Unknown Course"}
              </CardDescription>
            </div>

            <div className="ml-2 flex flex-col items-end gap-1">
              {assignment.submission_id && (
                <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  Submitted
                </span>
              )}

              {isOverdue ? (
                <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-200">
                  Overdue
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-200">
                  Active
                </span>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {assignment.description && (
            <p className="line-clamp-3 text-sm text-muted-foreground dark:text-gray-400">
              {assignment.description}
            </p>
          )}

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {/* Due Date */}
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-muted-foreground dark:text-gray-400" />
              <div className="text-sm">
                <p className="text-xs text-muted-foreground dark:text-gray-500">
                  Due Date
                </p>
                <p
                  className={`font-medium ${
                    isOverdue
                      ? "text-red-600 dark:text-red-400"
                      : "text-green-600 dark:text-green-400"
                  }`}
                >
                  {formatDueDate(assignment.due_date)}
                </p>
              </div>
            </div>

            {/* Max Marks */}
            <div className="flex items-center gap-2">
              <Award className="size-4 text-muted-foreground dark:text-gray-400" />
              <div className="text-sm">
                <p className="text-xs text-muted-foreground dark:text-gray-500">
                  Max Marks
                </p>
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {assignment.max_marks}
                </p>
              </div>
            </div>

            {/* File Status */}
            {assignment.file_url && (
              <div className="flex items-center gap-2">
                <FileText className="size-4 text-muted-foreground dark:text-gray-400" />
                <div className="text-sm">
                  <p className="text-xs text-muted-foreground dark:text-gray-500">
                    Materials
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <a
                      href={assignment.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center font-medium text-blue-600 hover:underline dark:text-blue-400"
                    >
                      <ExternalLink className="mr-1 size-3" />
                      View
                    </a>

                    <a
                      href={getDownloadUrl(assignment.file_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center font-medium text-blue-600 hover:underline dark:text-blue-400"
                    >
                      <Download className="mr-1 size-3" />
                      Download
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Submission Status */}
            {assignment.submission_id && (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-muted-foreground dark:text-gray-400" />
                <div className="text-sm">
                  <p className="text-xs text-muted-foreground dark:text-gray-500">
                    Your Status
                  </p>
                  <p className="font-medium text-gray-900 dark:text-gray-100">
                    {assignment.graded_at
                      ? `${assignment.marks ?? 0}/${assignment.max_marks}`
                      : "Submitted"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => handleSubmitClick(assignment)}
              disabled={isOverdue}
              className="flex-1 sm:flex-none"
            >
              <Upload className="mr-2 size-4" />
              {assignment.submission_id
                ? "Resubmit Assignment"
                : "Submit Assignment"}
            </Button>

            {isOverdue && (
              <p className="text-xs text-red-600 dark:text-red-400">
                Submission deadline has passed
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  })}
        </div>
        
      </div>

      {/* Submit Assignment Dialog */}
      {selectedAssignment && (
        <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Submit Assignment</DialogTitle>
              <DialogDescription>
                {selectedAssignment.title} • Due:{" "}
                {formatDueDate(selectedAssignment.due_date)}
              </DialogDescription>
            </DialogHeader>

            <SubmitAssignmentForm
              assignmentId={selectedAssignment.id}
              onSuccess={() => {
                setSubmitDialogOpen(false);
                setSelectedAssignment(null);
                setLocalRefresh((current) => current + 1);
              }}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
