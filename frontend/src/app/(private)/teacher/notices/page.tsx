"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  ExternalLink,
  Loader2,
  Megaphone,
  Paperclip,
  Search,
  Send,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { serverRequest } from "@/action/server-request.action";
import { createNotice, deleteNotice, getNotices } from "@/lib/api/notices.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type {
  ApiResponse,
  Course,
  Notice,
  NoticePriority,
  User,
} from "@/types";

const priorityStyles: Record<NoticePriority, string> = {
  high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  medium:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  low: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
};

export default function TeacherNoticesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Notice | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium" as NoticePriority,
  });

  const loadData = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      }
      const [courseResponse, noticeResponse, userResponse] = await Promise.all([
        serverRequest<ApiResponse<Course[]>>("/courses/teacher/my", {
          method: "GET",
          auth: true,
        }),
        getNotices(),
        serverRequest<ApiResponse<User>>("/auth/me", {
          method: "GET",
          auth: true,
        }),
      ]);

      setCourses(courseResponse.data || []);
      setNotices(noticeResponse.data?.notices || []);
      setCurrentUserId(userResponse.data?.id ?? null);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        const [courseResponse, noticeResponse, userResponse] =
          await Promise.all([
            serverRequest<ApiResponse<Course[]>>("/courses/teacher/my", {
              method: "GET",
              auth: true,
            }),
            getNotices(),
            serverRequest<ApiResponse<User>>("/auth/me", {
              method: "GET",
              auth: true,
            }),
          ]);

        setCourses(courseResponse.data || []);
        setNotices(noticeResponse.data?.notices || []);
        setCurrentUserId(userResponse.data?.id ?? null);
        setError("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load notices");
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const filteredNotices = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return notices;

    return notices.filter((notice) =>
      [notice.title, notice.description, notice.created_by_name]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle)),
    );
  }, [notices, query]);

  const selectedCourseLabel = useMemo(() => {
    const course = courses.find((item) => String(item.id) === selectedCourse);
    if (!course) return "";

    return `${course.course_code} - ${course.course_title}`;
  }, [courses, selectedCourse]);

  const handlePublish = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      setPublishing(true);
      const formData = new FormData();
      const title = selectedCourseLabel
        ? `[${selectedCourseLabel}] ${form.title}`
        : form.title;

      formData.append("title", title);
      formData.append("description", form.description);
      formData.append("priority", form.priority);

      if (file) {
        formData.append("attachment", file);
      }

      await createNotice(formData);
      toast.success("Notice published");
      setForm({ title: "", description: "", priority: "medium" });
      setSelectedCourse("");
      setFile(null);
      await loadData(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to publish");
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      const id = deleteTarget.id;
      setDeletingId(id);
      await deleteNotice(id);
      setNotices((current) => current.filter((notice) => notice.id !== id));
      setDeleteTarget(null);
      toast.success("Notice deleted");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      <Dialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && deletingId === null) {
            setDeleteTarget(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete notice?</DialogTitle>
            <DialogDescription>
              This will permanently delete &quot;{deleteTarget?.title}&quot;.
              Students will no longer see this notice.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={deletingId !== null}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deletingId !== null}
            >
              {deletingId !== null && (
                <Loader2 className="size-4 animate-spin" />
              )}
              {deletingId !== null ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Course notices</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">
            Publish Notices
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Share course updates, attachment links, deadlines, and class
            announcements with students.
          </p>
          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
        </div>

        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search notices..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <section className="h-fit rounded-xl border bg-background shadow-lg">
          <div className="border-b p-5">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Megaphone className="size-5" />
              </div>
              <div>
                <h2 className="font-semibold">Create Notice</h2>
                <p className="text-sm text-muted-foreground">
                  Select a course context before publishing.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handlePublish} className="space-y-3 p-5">
            <div className="space-y-2">
              <label className="text-sm font-medium">Course</label>
              <select
                value={selectedCourse}
                onChange={(event) => setSelectedCourse(event.target.value)}
                className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">General department notice</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.course_code} - {course.course_title}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                required
                placeholder="Class test schedule"
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                rows={6}
                placeholder="Write the notice details..."
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none transition placeholder:text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/50 max-h-16 lg:max-h-52"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <select
                  value={form.priority}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      priority: event.target.value as NoticePriority,
                    }))
                  }
                  className="h-9 w-full rounded-lg border border-input bg-background px-3 text-sm outline-none transition focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Attachment</label>
                <Input
                  type="file"
                  accept=".pdf,image/*"
                  onChange={(event) => setFile(event.target.files?.[0] || null)}
                />
              </div>
            </div>

            <Button type="submit" disabled={publishing} className="w-full">
              {publishing ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              {publishing ? "Publishing..." : "Publish Notice"}
            </Button>
          </form>
        </section>

        <section className="flex max-h-[calc(100vh-120px)] flex-col overflow-hidden rounded-xl border bg-background shadow-lg">
          
          <div className="flex items-center justify-between border-b p-5">
            <div>
              <h2 className="font-semibold">Published Notices</h2>
              <p className="text-sm text-muted-foreground">
                {filteredNotices.length} notices visible
              </p>
            </div>
            <Bell className="size-5 text-muted-foreground" />
          </div>
          {loading ? (
            <div className="flex justify-center py-14">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : filteredNotices.length ? (
            <div className="divide-y overflow-y-auto">
              {filteredNotices.map((notice) => (
                <article key={notice.id} className="p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold">{notice.title}</h3>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                            priorityStyles[notice.priority]
                          }`}
                        >
                          {notice.priority}
                        </span>
                      </div>
                      {notice.description && (
                        <p className="text-sm text-muted-foreground">
                          {notice.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {notice.created_by_name
                          ? `By ${notice.created_by_name} - `
                          : ""}
                        {new Date(notice.created_at).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {notice.attachment && (
                        <Button asChild variant="outline">
                          <a
                            href={notice.attachment}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Paperclip className="size-4" />
                            Attachment
                            <ExternalLink className="size-4" />
                          </a>
                        </Button>
                      )}
                      {Number(notice.created_by) === currentUserId && (
                        <Button
                          variant="destructive"
                          onClick={() => setDeleteTarget(notice)}
                          disabled={deletingId === notice.id}
                        >
                          {deletingId === notice.id ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Trash2 className="size-4" />
                          )}
                          {deletingId === notice.id ? "Deleting..." : "Delete"}
                        </Button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Bell className="mx-auto mb-3 size-10 text-muted-foreground" />
              <p className="font-medium">No notices found</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Publish a notice and it will appear here.
              </p>
            </div>
          )}
        </section>
      </div>
      </div>
    </>
  );
}
