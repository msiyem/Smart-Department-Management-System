"use client";

import React, { useCallback, useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { ArrowLeft, Download, ExternalLink, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

import {
  getAssignmentSubmissions,
  gradeAssignmentSubmission,
} from "@/action/assignment.action";
import type { AssignmentSubmission } from "@/types/assignment";
import { getDownloadUrl } from "@/lib/file-url";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";

type DraftGrade = {
  marks: string;
  feedback: string;
};

type Props = {
  assignmentId: number;
};

export function AssignmentSubmissionsClient({ assignmentId }: Props) {
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [drafts, setDrafts] = useState<Record<number, DraftGrade>>({});
  const isValidAssignmentId = Number.isFinite(assignmentId) && assignmentId > 0;
  const [loading, setLoading] = useState(isValidAssignmentId);
  const [savingId, setSavingId] = useState<number | null>(null);

  const loadSubmissions = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAssignmentSubmissions(assignmentId);

      if (!response.success) {
        toast.error(response.message || "Failed to load submissions");
        setSubmissions([]);
        return;
      }

      setSubmissions(response.data);
      setDrafts(
        Object.fromEntries(
          response.data.map((submission) => [
            submission.id,
            {
              marks: submission.marks?.toString() || "",
              feedback: submission.feedback || "",
            },
          ]),
        ),
      );
    } finally {
      setLoading(false);
    }
  }, [assignmentId]);

  useEffect(() => {
    if (isValidAssignmentId) {
      loadSubmissions();
    } else {
      toast.error("Invalid assignment ID");
    }
  }, [isValidAssignmentId, loadSubmissions]);

  const formatSubmittedAt = (value: string) => {
    try {
      return format(parseISO(value), "MMM dd, yyyy h:mm a");
    } catch {
      return "Invalid date";
    }
  };

  const saveGrade = async (submission: AssignmentSubmission) => {
    const draft = drafts[submission.id];
    const marks = Number(draft?.marks);

    if (!Number.isFinite(marks) || marks < 0) {
      toast.error("Enter a valid mark");
      return;
    }

    if (marks > Number(submission.max_marks)) {
      toast.error(`Marks cannot exceed ${submission.max_marks}`);
      return;
    }

    try {
      setSavingId(submission.id);
      const response = await gradeAssignmentSubmission({
        submission_id: submission.id,
        marks,
        feedback: draft?.feedback,
      });

      if (!response.success) {
        toast.error(response.message || "Failed to save grade");
        return;
      }

      toast.success(response.message);
      await loadSubmissions();
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="space-y-3">
        <Button variant="outline" size="sm" asChild className="w-fit">
          <Link href="/teacher/assignments">
            <ArrowLeft className="mr-2 size-4" />
            Assignments
          </Link>
        </Button>
        <div>
          <CardTitle>Assignment Submissions</CardTitle>
          <CardDescription>
            {submissions.length} submission{submissions.length === 1 ? "" : "s"}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent>
        {submissions.length === 0 ? (
          <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
            No students have submitted this assignment yet.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>File</TableHead>
                <TableHead>Comment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-28">Marks</TableHead>
                <TableHead>Feedback</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((submission) => (
                <TableRow key={submission.id}>
                  <TableCell>
                    <div className="font-medium">{submission.full_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {submission.registration_no}
                    </div>
                  </TableCell>
                  <TableCell>
                    {formatSubmittedAt(submission.submitted_at)}
                  </TableCell>
                  <TableCell>
                    {submission.file_url ? (
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={submission.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="mr-2 size-4" />
                            View
                          </a>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={getDownloadUrl(submission.file_url)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Download className="mr-2 size-4" />
                            Download
                          </a>
                        </Button>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">No file</span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-56 whitespace-normal">
                    {submission.comment || (
                      <span className="text-muted-foreground">No comment</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {submission.graded_at ? (
                      <Badge variant="secondary">Graded</Badge>
                    ) : (
                      <Badge variant="outline">Pending</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min={0}
                      max={submission.max_marks}
                      value={drafts[submission.id]?.marks || ""}
                      onChange={(event) =>
                        setDrafts((current) => ({
                          ...current,
                          [submission.id]: {
                            marks: event.target.value,
                            feedback: current[submission.id]?.feedback || "",
                          },
                        }))
                      }
                      placeholder={`/${submission.max_marks}`}
                    />
                  </TableCell>
                  <TableCell>
                    <Textarea
                      rows={2}
                      value={drafts[submission.id]?.feedback || ""}
                      onChange={(event) =>
                        setDrafts((current) => ({
                          ...current,
                          [submission.id]: {
                            marks: current[submission.id]?.marks || "",
                            feedback: event.target.value,
                          },
                        }))
                      }
                      placeholder="Feedback"
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      onClick={() => saveGrade(submission)}
                      disabled={savingId === submission.id}
                    >
                      {savingId === submission.id ? (
                        <Loader2 className="mr-2 size-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 size-4" />
                      )}
                      Save
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
