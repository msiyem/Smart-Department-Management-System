"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  getRoutines,
  createRoutine,
  deleteRoutine,
} from "@/lib/api/routines.api";
import { getCourses } from "@/lib/api/courses.api";
import { getUsers } from "@/lib/api/users.api";

/* ─────────────────────────────────────────────────────────
   Constants
───────────────────────────────────────────────────────── */
const DAYS = [
  "Saturday", "Sunday", "Monday", "Tuesday",
  "Wednesday", "Thursday", "Friday",
];

const DAY_COLORS: Record<string, string> = {
  Saturday:  "bg-violet-100  text-violet-700  dark:bg-violet-900/40  dark:text-violet-300",
  Sunday:    "bg-rose-100    text-rose-700    dark:bg-rose-900/40    dark:text-rose-300",
  Monday:    "bg-blue-100    text-blue-700    dark:bg-blue-900/40    dark:text-blue-300",
  Tuesday:   "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  Wednesday: "bg-amber-100   text-amber-700   dark:bg-amber-900/40   dark:text-amber-300",
  Thursday:  "bg-cyan-100    text-cyan-700    dark:bg-cyan-900/40    dark:text-cyan-300",
  Friday:    "bg-orange-100  text-orange-700  dark:bg-orange-900/40  dark:text-orange-300",
};

/* ─────────────────────────────────────────────────────────
   Toast system
───────────────────────────────────────────────────────── */
type ToastType = "success" | "error" | "warning" | "confirm";

interface Toast {
  id: number;
  type: ToastType;
  title: string;
  message?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

const TOAST_ICONS: Record<Exclude<ToastType, "confirm">, JSX.Element> = {
  success: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  error: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
  warning: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
};

const TOAST_STYLES: Record<Exclude<ToastType, "confirm">, string> = {
  success: "border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-900 [&_.t-icon]:text-emerald-500 [&_.t-icon]:bg-emerald-50 dark:[&_.t-icon]:bg-emerald-900/40",
  error:   "border-red-200    dark:border-red-800    bg-white dark:bg-gray-900 [&_.t-icon]:text-red-500    [&_.t-icon]:bg-red-50    dark:[&_.t-icon]:bg-red-900/40",
  warning: "border-amber-200  dark:border-amber-700  bg-white dark:bg-gray-900 [&_.t-icon]:text-amber-500 [&_.t-icon]:bg-amber-50 dark:[&_.t-icon]:bg-amber-900/40",
};

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  useEffect(() => {
    if (toast.type === "confirm") return;
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose, toast.type]);

  /* Confirm variant */
  if (toast.type === "confirm") {
    return (
      <div className="flex flex-col gap-3 w-80 rounded-2xl border border-red-200 dark:border-red-800 bg-white dark:bg-gray-900 px-4 py-4 shadow-lg animate-[slideInRight_0.3s_cubic-bezier(0.22,1,0.36,1)]">
        <div className="flex items-start gap-3">
          <span className="flex-shrink-0 rounded-xl p-1.5 bg-red-50 dark:bg-red-900/40 text-red-500">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
            </svg>
          </span>
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="text-sm font-semibold text-gray-900 dark:text-white">{toast.title}</p>
            {toast.message && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{toast.message}</p>}
          </div>
          <button
            onClick={() => { toast.onCancel?.(); onClose(); }}
            className="flex-shrink-0 text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition-colors cursor-pointer bg-transparent border-none pt-0.5"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="flex gap-2 pl-9">
          <button
            onClick={() => { toast.onCancel?.(); onClose(); }}
            className="flex-1 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer bg-transparent"
          >
            Cancel
          </button>
          <button
            onClick={() => { toast.onConfirm?.(); onClose(); }}
            className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors cursor-pointer border-none shadow-sm"
          >
            Delete
          </button>
        </div>
      </div>
    );
  }

  /* Standard variant */
  return (
    <div className={`flex items-start gap-3 w-80 rounded-2xl border px-4 py-3.5 shadow-lg animate-[slideInRight_0.3s_cubic-bezier(0.22,1,0.36,1)] ${TOAST_STYLES[toast.type as Exclude<ToastType, "confirm">]}`}>
      <span className="t-icon flex-shrink-0 rounded-xl p-1.5">
        {TOAST_ICONS[toast.type as Exclude<ToastType, "confirm">]}
      </span>
      <div className="flex-1 min-w-0 pt-0.5">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">{toast.title}</p>
        {toast.message && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{toast.message}</p>}
      </div>
      <button
        onClick={onClose}
        className="flex-shrink-0 text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400 transition-colors pt-0.5 cursor-pointer bg-transparent border-none"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Searchable Course Dropdown
───────────────────────────────────────────────────────── */
interface CourseDropdownProps {
  courses: any[];
  value: string;
  onChange: (courseId: string) => void;
}

function CourseDropdown({ courses, value, onChange }: CourseDropdownProps) {
  const [open, setOpen]       = useState(false);
  const [search, setSearch]   = useState("");
  const wrapRef               = useRef<HTMLDivElement>(null);
  const searchRef             = useRef<HTMLInputElement>(null);

  const selected = courses.find((c) => String(c.id) === value) ?? null;

  /* Close on outside click */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* Auto-focus search when opened */
  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 40);
    else setSearch("");
  }, [open]);

  const filtered = courses.filter(
    (c) =>
      c.course_code.toLowerCase().includes(search.toLowerCase()) ||
      c.course_title.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div ref={wrapRef} className="relative">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`
          w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-sm text-left
          bg-gray-50 dark:bg-gray-800 border transition-all duration-150
          ${open
            ? "border-indigo-400 dark:border-indigo-500 bg-white dark:bg-gray-800 ring-2 ring-indigo-400/20 dark:ring-indigo-500/20"
            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
          }
        `}
      >
        <span className="flex items-center gap-2 min-w-0 flex-1">
          {selected ? (
            <>
              <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 flex-shrink-0">
                {selected.course_code}
              </span>
              <span className="truncate text-gray-800 dark:text-gray-100 text-sm">
                {selected.course_title}
              </span>
              {/* Clear */}
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => { e.stopPropagation(); onChange(""); }}
                onKeyDown={(e) => e.key === "Enter" && (e.stopPropagation(), onChange(""))}
                className="flex-shrink-0 flex items-center gap-1 text-[10px] font-semibold text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 ml-auto px-1.5 py-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                Clear
              </span>
            </>
          ) : (
            <span className="text-gray-400 dark:text-gray-500">Select course…</span>
          )}
        </span>
        <svg
          className={`flex-shrink-0 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden animate-[dropIn_0.15s_ease]">
          {/* Search input */}
          <div className="p-2.5 pb-2 border-b border-gray-100 dark:border-gray-800">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </span>
              <input
                ref={searchRef}
                type="text"
                placeholder="Search by code or title…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-lg text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-400/20 dark:focus:ring-indigo-500/20 transition-all"
              />
            </div>
          </div>

          {/* Option list */}
          <div className="max-h-96 overflow-y-auto p-1.5 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 dark:[&::-webkit-scrollbar-thumb]:bg-gray-700 [&::-webkit-scrollbar-thumb]:rounded-full">
            {filtered.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-2xl mb-1.5">🔍</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  No courses match{" "}
                  <span className="font-medium text-gray-600 dark:text-gray-300">"{search}"</span>
                </p>
              </div>
            ) : (
              filtered.map((c) => {
                const isSelected = value === String(c.id);
                return (
                  <div
                    key={c.id}
                    onClick={() => { onChange(String(c.id)); setOpen(false); }}
                    className={`
                      flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer transition-colors
                      ${isSelected
                        ? "bg-violet-50 dark:bg-violet-900/20"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800"
                      }
                    `}
                  >
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 flex-shrink-0 min-w-[76px] text-center">
                      {c.course_code}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{c.course_title}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        Semester {c.semester} · {c.credit} credit{c.credit !== 1 ? "s" : ""}
                      </p>
                    </div>
                    {isSelected && (
                      <svg className="flex-shrink-0 text-indigo-500 dark:text-indigo-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer hint */}
          <div className="px-3.5 py-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <span className="text-[10px] text-gray-400 dark:text-gray-500">
              {filtered.length} of {courses.length} courses
            </span>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-[10px] text-indigo-500 dark:text-indigo-400 hover:underline cursor-pointer bg-transparent border-none"
              >
                Clear search
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   Main Page
───────────────────────────────────────────────────────── */
export default function Page() {
  const [routines,   setRoutines]   = useState<any[]>([]);
  const [courses,    setCourses]    = useState<any[]>([]);
  const [teachers,   setTeachers]   = useState<any[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [filterDay,  setFilterDay]  = useState("All");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  /* Toast */
  const [toasts, setToasts] = useState<Toast[]>([]);
  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);
  const addToast = useCallback((
    type: ToastType,
    title: string,
    message?: string,
    extra?: Pick<Toast, "onConfirm" | "onCancel">,
  ) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, type, title, message, ...extra }]);
  }, []);

  /* Form */
  const [form, setForm] = useState({
    course_id: "",
    teacher_id: "",
    room_no: "",
    day: "Saturday",
    start_time: "",
    end_time: "",
  });

  /* ── Data fetch ── */
  const fetchData = async () => {
    try {
      const [routineRes, courseRes, userRes] = await Promise.all([
        getRoutines(), getCourses(), getUsers(),
      ]);
      setRoutines(routineRes.data || []);
      setCourses(courseRes.data || []);
      setTeachers(userRes.data?.users?.filter((u: any) => u.role === "teacher") || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  /* ── Create ── */
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await createRoutine({
        course_id:  Number(form.course_id),
        teacher_id: Number(form.teacher_id),
        room_no:    form.room_no,
        day:        form.day,
        start_time: form.start_time,
        end_time:   form.end_time,
      });
      const course = courses.find((c) => String(c.id) === form.course_id);
      setForm({ course_id: "", teacher_id: "", room_no: "", day: "Saturday", start_time: "", end_time: "" });
      await fetchData();
      addToast("success", "Routine slot created", course ? `${course.course_code} scheduled on ${form.day}` : undefined);
    } catch (err: any) {
      addToast("error", "Failed to create slot", err?.message);
    } finally {
      setLoading(false);
    }
  };

  /* ── Delete (confirm toast) ── */
  const requestDelete = (id: number) => {
    addToast("confirm", "Delete this slot?", "This action cannot be undone.", {
      onConfirm: async () => {
        try {
          setDeletingId(id);
          await deleteRoutine(id);
          await fetchData();
          addToast("warning", "Routine slot deleted", "The schedule entry has been removed.");
        } catch (err: any) {
          addToast("error", "Failed to delete slot", err?.message);
        } finally {
          setDeletingId(null);
        }
      },
      onCancel: () => {},
    });
  };

  const filteredRoutines = filterDay === "All"
    ? routines
    : routines.filter((r) => r.day === filterDay);

  /* Shared input class */
  const inputCls = `
    w-full rounded-xl px-3.5 py-2.5 text-sm transition-all duration-150
    bg-gray-50 dark:bg-gray-800
    border border-gray-200 dark:border-gray-700
    text-gray-800 dark:text-gray-100
    placeholder:text-gray-400 dark:placeholder:text-gray-500
    focus:border-indigo-400 dark:focus:border-indigo-500
    focus:bg-white dark:focus:bg-gray-800
    focus:outline-none focus:ring-2 focus:ring-indigo-400/20 dark:focus:ring-indigo-500/20
  `;

  /* ─── Render ───────────────────────────────────────── */
  return (
    <>
      {/* Toast portal */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onClose={() => removeToast(t.id)} />
          </div>
        ))}
      </div>

      {/* Page */}
      <div className="min-h-screen bg-gray-100 dark:bg-gray-950 px-4 py-10 sm:px-6 lg:px-10 transition-colors duration-200">
        <div className="mx-auto max-w-6xl space-y-8">

          {/* ── Header ── */}
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-indigo-500 dark:text-indigo-400">
                Admin Panel
              </p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                Routine Management
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Create and manage weekly class schedules
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-white dark:bg-gray-900 px-4 py-2.5 shadow-sm ring-1 ring-gray-200 dark:ring-gray-800">
              <span className="h-2 w-2 rounded-full bg-emerald-400 dark:bg-emerald-500" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {routines.length} slot{routines.length !== 1 ? "s" : ""} active
              </span>
            </div>
          </div>

          {/* ── Stats ── */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { label: "Total Slots", value: routines.length,                          icon: "🗓️" },
              { label: "Courses",     value: courses.length,                            icon: "📚" },
              { label: "Teachers",    value: teachers.length,                           icon: "🧑‍🏫" },
              { label: "Days Used",   value: new Set(routines.map((r) => r.day)).size,  icon: "📅" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5 shadow-sm">
                <div className="text-2xl">{s.icon}</div>
                <div className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{s.value}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>

          {/* ── Create Form ── */}
          <div className="rounded-2xl bg-white dark:bg-gray-900 shadow-sm ring-1 ring-gray-100 dark:ring-gray-800">
            <div className="border-b border-gray-100 dark:border-gray-800 px-6 py-5 bg-gray-50 dark:bg-gray-800/50">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-indigo-400 inline-block" />
                Add New Routine Slot
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Fill in all fields to schedule a class session
              </p>
            </div>

            <form onSubmit={handleCreate} className="p-6">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

                {/* ── Course — searchable dropdown ── */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Course
                  </label>
                  <CourseDropdown
                    courses={courses}
                    value={form.course_id}
                    onChange={(id) => setForm({ ...form, course_id: id })}
                  />
                  {/* hidden required input so the form validates */}
                  <input type="hidden" value={form.course_id} required />
                </div>

                {/* ── Teacher ── */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Teacher
                  </label>
                  <select
                    value={form.teacher_id}
                    onChange={(e) => setForm({ ...form, teacher_id: e.target.value })}
                    className={inputCls}
                    required
                  >
                    <option value="">Select teacher…</option>
                    {teachers.map((t: any) => (
                      <option key={t.id} value={t.id}>{t.full_name}</option>
                    ))}
                  </select>
                </div>

                {/* ── Day ── */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Day
                  </label>
                  <select
                    value={form.day}
                    onChange={(e) => setForm({ ...form, day: e.target.value })}
                    className={inputCls}
                  >
                    {DAYS.map((d) => <option key={d}>{d}</option>)}
                  </select>
                </div>

                {/* ── Start Time ── */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={form.start_time}
                    onChange={(e) => setForm({ ...form, start_time: e.target.value })}
                    className={inputCls}
                    required
                  />
                </div>

                {/* ── End Time ── */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={form.end_time}
                    onChange={(e) => setForm({ ...form, end_time: e.target.value })}
                    className={inputCls}
                    required
                  />
                </div>

                {/* ── Room ── */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Room Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 301-A"
                    value={form.room_no}
                    onChange={(e) => setForm({ ...form, room_no: e.target.value })}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={loading || !form.course_id || !form.teacher_id || !form.start_time || !form.end_time}
                  className="flex items-center gap-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-200 dark:shadow-indigo-900/30 transition-all active:scale-[0.98] cursor-pointer border-none"
                >
                  {loading ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Creating…
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      Create Slot
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* ── Routine List ── */}
          <div className="rounded-2xl bg-white dark:bg-gray-900 shadow-sm ring-1 ring-gray-100 dark:ring-gray-800 overflow-hidden">

            {/* Header + Day filter */}
            <div className="flex flex-col gap-4 border-b border-gray-100 dark:border-gray-800 px-6 py-5 sm:flex-row sm:items-center sm:justify-between bg-gray-50 dark:bg-gray-800/40">
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">Schedule Overview</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {filteredRoutines.length} slot{filteredRoutines.length !== 1 ? "s" : ""} shown
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {["All", ...DAYS].map((d) => (
                  <button
                    key={d}
                    onClick={() => setFilterDay(d)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer border ${
                      filterDay === d
                        ? "bg-indigo-500 text-white border-indigo-500 shadow-sm shadow-indigo-200 dark:shadow-indigo-900/30"
                        : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-500 dark:hover:text-indigo-400"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    <th className="px-6 py-4">Course</th>
                    <th className="px-6 py-4">Teacher</th>
                    <th className="px-6 py-4">Day</th>
                    <th className="px-6 py-4">Time</th>
                    <th className="px-6 py-4">Room</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
                  {filteredRoutines.map((routine: any) => (
                    <tr key={routine.id} className="transition hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10">
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                          {routine.course_code}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-xs font-bold text-indigo-600 dark:text-indigo-300">
                            {routine.teacher_name?.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase() || "—"}
                          </div>
                          <span className="text-gray-700 dark:text-gray-300">{routine.teacher_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${DAY_COLORS[routine.day] ?? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"}`}>
                          {routine.day}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                          <svg className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 6v6l4 2" />
                          </svg>
                          {routine.start_time} – {routine.end_time}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {routine.room_no ? (
                          <span className="rounded-lg bg-gray-100 dark:bg-gray-800 px-2.5 py-1 text-xs font-medium text-gray-600 dark:text-gray-300">
                            {routine.room_no}
                          </span>
                        ) : (
                          <span className="text-gray-300 dark:text-gray-600">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => requestDelete(routine.id)}
                          disabled={deletingId === routine.id}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 dark:border-red-900/50 px-3 py-1.5 text-xs font-semibold text-red-500 dark:text-red-400 transition hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700 active:scale-95 disabled:opacity-40 cursor-pointer bg-transparent"
                        >
                          {deletingId === routine.id ? (
                            <>
                              <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                              </svg>
                              Deleting…
                            </>
                          ) : "Delete"}
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filteredRoutines.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xl">🗓️</div>
                          <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">No routines found</p>
                          {filterDay !== "All" && (
                            <button onClick={() => setFilterDay("All")} className="text-xs text-indigo-500 dark:text-indigo-400 underline underline-offset-2 cursor-pointer bg-transparent border-none">
                              Clear filter
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="divide-y divide-gray-100 dark:divide-gray-800 md:hidden">
              {filteredRoutines.map((routine: any) => (
                <div key={routine.id} className="px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                          {routine.course_code}
                        </span>
                        <span className={`rounded-lg px-2 py-0.5 text-xs font-semibold ${DAY_COLORS[routine.day] ?? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"}`}>
                          {routine.day}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{routine.teacher_name}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        <span>{routine.start_time} – {routine.end_time}</span>
                        {routine.room_no && (
                          <span className="rounded bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 font-medium text-gray-600 dark:text-gray-300">
                            {routine.room_no}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => requestDelete(routine.id)}
                      disabled={deletingId === routine.id}
                      className="flex-shrink-0 rounded-lg border border-red-100 dark:border-red-900/50 px-3 py-1.5 text-xs font-semibold text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-40 transition cursor-pointer bg-transparent"
                    >
                      {deletingId === routine.id ? "…" : "Delete"}
                    </button>
                  </div>
                </div>
              ))}

              {filteredRoutines.length === 0 && (
                <div className="flex flex-col items-center gap-2 py-16 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">No routines found</p>
                  {filterDay !== "All" && (
                    <button onClick={() => setFilterDay("All")} className="text-xs text-indigo-500 dark:text-indigo-400 underline underline-offset-2 cursor-pointer bg-transparent border-none">
                      Clear filter
                    </button>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(24px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}