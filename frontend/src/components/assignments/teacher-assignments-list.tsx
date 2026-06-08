"use client";

import React, { useEffect, useState } from "react";
import { format, isPast, parseISO, endOfDay } from "date-fns";
import {
  Loader2,
  Plus,
  FileText,
  Clock,
  Award,
  Users,
  Download,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

import { getTeacherAssignments } from "@/action/assignment.action";
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

interface TeacherAssignmentsListProps {
  onCreateClick: () => void;
  refreshTrigger?: number;
}

export function TeacherAssignmentsList({
  onCreateClick,
  refreshTrigger = 0,
}: TeacherAssignmentsListProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAssignments = async () => {
      try {
        setLoading(true);
        const response = await getTeacherAssignments();

        if (response.success) {
          setAssignments(response.data || []);
        } else {
          toast.error(response.message || "Failed to load assignments");
          setAssignments([]);
        }
      } catch (error) {
        console.error("Load teacher assignments error:", error);
        toast.error("Failed to load assignments");
        setAssignments([]);
      } finally {
        setLoading(false);
      }
    };

    loadAssignments();
  }, [refreshTrigger]);

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
          <CardTitle className="mb-2">No Assignments Yet</CardTitle>
          <CardDescription className="mb-6">
            Create your first assignment by clicking the button below
          </CardDescription>
          <Button onClick={onCreateClick}>
            <Plus className="mr-2 size-4" />
            Create Assignment
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Assignments</h2>
          <p className="text-sm text-muted-foreground">
            {assignments.length} assignment{assignments.length !== 1 ? "s" : ""}{" "}
            created
          </p>
        </div>
        <Button onClick={onCreateClick}>
          <Plus className="mr-2 size-4" />
          Create New
        </Button>
      </div>

      <div className="grid gap-4">
        {assignments.map((assignment) => {
          const isOverdue = isAssignmentOverdue(assignment.due_date);
          return (
            <Card
              key={assignment.id}
              className={isOverdue ? "border-red-200" : ""}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="line-clamp-2">
                      {assignment.title}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {assignment.course_code && `${assignment.course_code} - `}
                      {assignment.course_title || "Unknown Course"}
                    </CardDescription>
                  </div>
                  {isOverdue && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-800">
                      Overdue
                    </span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {assignment.description && (
                  <p className="line-clamp-3 text-sm text-muted-foreground">
                    {assignment.description}
                  </p>
                )}

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {/* Due Date */}
                  <div className="flex items-center gap-2">
                    <Clock className="size-4 text-muted-foreground" />
                    <div className="text-sm">
                      <p className="text-xs text-muted-foreground">Due Date</p>
                      <p className="font-medium">
                        {formatDueDate(assignment.due_date)}
                      </p>
                    </div>
                  </div>

                  {/* Max Marks */}
                  <div className="flex items-center gap-2">
                    <Award className="size-4 text-muted-foreground" />
                    <div className="text-sm">
                      <p className="text-xs text-muted-foreground">Max Marks</p>
                      <p className="font-medium">{assignment.max_marks}</p>
                    </div>
                  </div>

                  {/* File Status */}
                  {assignment.file_url && (
                    <div className="flex items-center gap-2">
                      <FileText className="size-4 text-muted-foreground" />
                      <div className="text-sm">
                        <p className="text-xs text-muted-foreground">File</p>
                        <div className="flex flex-wrap gap-2">
                          <a
                            href={assignment.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center font-medium text-blue-600 hover:underline"
                          >
                            <ExternalLink className="mr-1 size-3" />
                            View
                          </a>
                          <a
                            href={getDownloadUrl(assignment.file_url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center font-medium text-blue-600 hover:underline"
                          >
                            <Download className="mr-1 size-3" />
                            Download
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submission Count */}
                  <div className="flex items-center gap-2">
                    <Users className="size-4 text-muted-foreground" />
                    <div className="text-sm">
                      <p className="text-xs text-muted-foreground">Submitted</p>
                      <p className="font-medium">
                        {assignment.submission_count ?? 0}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" asChild>
                    <a href={`/teacher/assignments/${assignment.id}/submissions`}>
                      <Users className="mr-2 size-4" />
                      View Submissions
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
