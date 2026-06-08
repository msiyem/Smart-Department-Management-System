"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, ExternalLink, Loader2, Search } from "lucide-react";

import { getStudentNotices } from "@/action/student.action";
import type { Notice } from "@/types";
import { Input } from "@/components/ui/input";

const priorityStyles = {
  high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  medium:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  low: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
};

export default function StudentNoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const loadNotices = async () => {
      setLoading(true);
      const response = await getStudentNotices();
      setNotices(response.data.notices);
      setError(response.success ? "" : response.message || "Failed to load notices");
      setLoading(false);
    };

    loadNotices();
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

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notices</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Department updates, announcements, and shared attachments.
          </p>
          {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
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

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : filteredNotices.length ? (
        <div className="space-y-3">
          {filteredNotices.map((notice) => (
            <article
              key={notice.id}
              className="rounded-xl border bg-background p-5 shadow-sm"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold">{notice.title}</h2>
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

                {notice.attachment && (
                  <a
                    href={notice.attachment}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition hover:bg-muted/50"
                  >
                    <ExternalLink className="size-4" />
                    Attachment
                  </a>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed bg-background p-10 text-center">
          <Bell className="mx-auto mb-3 size-10 text-muted-foreground" />
          <p className="font-medium">No notices found</p>
          <p className="mt-1 text-sm text-muted-foreground">
            New department notices will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
