"use client";

import { useEffect, useState } from "react";
import {
  createNotice,
  deleteNotice,
  getNotices,
} from "@/lib/api/notices.api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function Page() {
  const [notices, setNotices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
  });

  const [file, setFile] = useState<File | null>(null);

  const fetchData = async () => {
    try {
      const res = await getNotices();
      setNotices(res.data?.notices || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("title", form.title);
      formData.append("description", form.description);
      formData.append("priority", form.priority);

      if (file) {
        formData.append("attachment", file);
      }

      await createNotice(formData);

      setForm({
        title: "",
        description: "",
        priority: "medium",
      });

      setFile(null);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    try {
      const id = deleteTarget.id;
      setDeletingId(id);
      await deleteNotice(id);
      setDeleteTarget(null);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  // ✅ FIXED INPUT STYLE FOR DARK MODE
  const inputCls =
    "w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-4 py-3 text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition focus:border-[#2a7fba] focus:outline-none focus:bg-white dark:focus:bg-gray-800";

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
              Students and teachers will no longer see it.
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
              {deletingId !== null ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="min-h-screen bg-[#e9eef2] dark:bg-gray-950 px-4 py-10 transition-colors">
      <div className="mx-auto max-w-6xl space-y-8">

        {/* HEADER */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#2a7fba]">
            Admin Panel
          </p>

          <h1 className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
            Notice Management
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Publish and manage department notices
          </p>
        </div>

        {/* STATS */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
          <div className="text-3xl font-bold text-gray-900 dark:text-white">
            {notices.length}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Total Notices
          </div>
        </div>

        {/* CREATE NOTICE */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="border-b border-gray-100 dark:border-gray-800 px-6 py-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Create Notice
            </h2>
          </div>

          <form onSubmit={handleCreate} className="space-y-4 p-6">
            <input
              type="text"
              placeholder="Notice title"
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
              className={inputCls}
              required
            />

            <textarea
              placeholder="Description"
              rows={5}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className={inputCls}
            />

            <select
              value={form.priority}
              onChange={(e) =>
                setForm({ ...form, priority: e.target.value })
              }
              className={inputCls}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            <input
              type="file"
              accept=".pdf,image/*"
              onChange={(e) =>
                setFile(e.target.files?.[0] || null)
              }
              className={inputCls}
            />

            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-[#2a7fba] px-6 py-3 font-semibold text-white hover:bg-[#1f6fa3] transition"
            >
              {loading ? "Publishing..." : "Publish Notice"}
            </button>
          </form>
        </div>

        {/* NOTICE LIST */}
        <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
          <div className="border-b border-gray-100 dark:border-gray-800 px-6 py-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Published Notices
            </h2>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {notices.length === 0 && (
              <div className="p-10 text-center text-gray-400 dark:text-gray-500">
                No notices found
              </div>
            )}

            {notices.map((notice: any) => (
              <div key={notice.id} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">

                  <div className="space-y-2">

                    {/* TITLE + BADGE */}
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {notice.title}
                      </h3>

                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          notice.priority === "high"
                            ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                            : notice.priority === "medium"
                            ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
                            : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                        }`}
                      >
                        {notice.priority}
                      </span>
                    </div>

                    {/* DESCRIPTION */}
                    <p className="text-gray-600 dark:text-gray-300">
                      {notice.description}
                    </p>

                    {/* AUTHOR */}
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      By {notice.created_by_name}
                    </div>

                    {/* ATTACHMENT */}
                    {notice.attachment && (
                      <a
                        href={notice.attachment}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-block rounded-lg bg-blue-50 dark:bg-blue-900/30 px-3 py-2 text-sm font-medium text-blue-700 dark:text-blue-300 hover:opacity-80"
                      >
                        View Attachment
                      </a>
                    )}
                  </div>

                  {/* DELETE BUTTON */}
                  <button
                    onClick={() => setDeleteTarget(notice)}
                    disabled={deletingId === notice.id}
                    className="rounded-lg px-3 py-2 text-sm font-semibold text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                  >
                    {deletingId === notice.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}

          </div>
        </div>

      </div>
      </div>
    </>
  );
}
