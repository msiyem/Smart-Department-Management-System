"use client";

import React, { useEffect, useState } from "react";
import {
  getCourses,
  createCourse,
  deleteCourse,
} from "@/lib/api/courses.api";

type Course = {
  id: number;
  course_code: string;
  course_title: string;
  credit: number;
  semester: number;
  teachers?: string;
};

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

const SEM_COLORS: Record<number, { bg: string; text: string; darkBg: string; darkText: string }> = {
  1: { bg: "bg-amber-100",   text: "text-amber-700",   darkBg: "dark:bg-amber-900/40",   darkText: "dark:text-amber-300" },
  2: { bg: "bg-emerald-100", text: "text-emerald-700", darkBg: "dark:bg-emerald-900/40", darkText: "dark:text-emerald-300" },
  3: { bg: "bg-blue-100",    text: "text-blue-700",    darkBg: "dark:bg-blue-900/40",    darkText: "dark:text-blue-300" },
  4: { bg: "bg-violet-100",  text: "text-violet-700",  darkBg: "dark:bg-violet-900/40",  darkText: "dark:text-violet-300" },
  5: { bg: "bg-pink-100",    text: "text-pink-700",    darkBg: "dark:bg-pink-900/40",    darkText: "dark:text-pink-300" },
  6: { bg: "bg-cyan-100",    text: "text-cyan-700",    darkBg: "dark:bg-cyan-900/40",    darkText: "dark:text-cyan-300" },
  7: { bg: "bg-orange-100",  text: "text-orange-700",  darkBg: "dark:bg-orange-900/40",  darkText: "dark:text-orange-300" },
  8: { bg: "bg-lime-100",    text: "text-lime-700",    darkBg: "dark:bg-lime-900/40",    darkText: "dark:text-lime-300" },
};

const DEFAULT_SEM = { bg: "bg-indigo-100", text: "text-indigo-700", darkBg: "dark:bg-indigo-900/40", darkText: "dark:text-indigo-300" };

const PlusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
const XIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);
const TrashIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);
const SpinnerIcon = () => (
  <svg className="animate-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

function SkeletonRow() {
  return (
    <tr>
      {[...Array(6)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 rounded-md bg-gray-200 dark:bg-gray-700 animate-pulse" style={{ width: i === 1 ? "70%" : "60%" }} />
        </td>
      ))}
    </tr>
  );
}

export default function Page() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filterSemester, setFilterSemester] = useState<string>("all");

  const [form, setForm] = useState({
    course_code: "",
    course_title: "",
    credit: "",
    semester: "",
  });

  const fetchCourses = async () => {
    setLoading(true);
    const res = await getCourses();
    setCourses(res?.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchCourses(); }, []);

  const handleCreate = async () => {
    if (!form.course_code || !form.course_title || !form.credit || !form.semester) return;
    setCreating(true);
    await createCourse({
      ...form,
      credit: Number(form.credit),
      semester: Number(form.semester),
    });
    setForm({ course_code: "", course_title: "", credit: "", semester: "" });
    setShowForm(false);
    await fetchCourses();
    setCreating(false);
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    await deleteCourse(id);
    await fetchCourses();
    setDeletingId(null);
  };

  const filtered = courses.filter((c) => {
    const matchSearch =
      c.course_title.toLowerCase().includes(search.toLowerCase()) ||
      c.course_code.toLowerCase().includes(search.toLowerCase());
    const matchSemester =
      filterSemester === "all" || String(c.semester) === filterSemester;
    return matchSearch && matchSemester;
  });

  const totalCredits = courses.reduce((s, c) => s + (c.credit || 0), 0);
  const activeSems = new Set(courses.map((c) => c.semester)).size;
  const avgCredits = courses.length ? (totalCredits / courses.length).toFixed(1) : "—";

  const isFormValid = form.course_code && form.course_title && form.credit && form.semester;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 px-16 py-10 sm:px-6 lg:px-16 font-sans transition-colors duration-200 ">

      {/* ── Page Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-gray-400 dark:text-gray-500 mb-1">
            Administration
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white leading-none">
            Course{" "}
            <span className="text-indigo-500 dark:text-indigo-400">Registry</span>
          </h1>
          <p className="mt-1.5 text-sm text-gray-400 dark:text-gray-500">
            Manage academic courses, credits, and faculty assignments
          </p>
        </div>

        <button
          onClick={() => setShowForm((v) => !v)}
          className={`
            flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
            transition-all duration-200 shadow-md cursor-pointer
            ${showForm
              ? "bg-indigo-500 hover:bg-indigo-600 text-white shadow-indigo-200 dark:shadow-indigo-900/40"
              : "bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 shadow-gray-300 dark:shadow-gray-800"
            }
          `}
        >
          {showForm ? <XIcon /> : <PlusIcon />}
          {showForm ? "Cancel" : "New Course"}
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Courses",  value: courses.length, sub: "across all semesters" },
          // { label: "Total Credits",  value: totalCredits,   sub: "credit hours offered" },
          { label: "Semesters",      value: activeSems,     sub: "currently active" },
          // { label: "Avg Credits",    value: avgCredits,     sub: "per course" },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-5 py-4 shadow-sm"
          >
            <p className="text-[10px] font-semibold tracking-[0.1em] uppercase text-gray-400 dark:text-gray-500 mb-1.5">
              {s.label}
            </p>
            <p className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white leading-none">
              {s.value}
            </p>
            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* ── Create Form Panel ── */}
      {showForm && (
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm mb-5 overflow-hidden animate-[slideDown_0.22s_cubic-bezier(0.22,1,0.36,1)]">
          {/* Form Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
              <span className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-indigo-400 inline-block" />
              Add New Course
            </div>
            <button
              onClick={() => { setShowForm(false); setForm({ course_code: "", course_title: "", credit: "", semester: "" }); }}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer bg-transparent border-none p-1"
            >
              <XIcon />
            </button>
          </div>

          {/* Form Body */}
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Course Code */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold tracking-[0.08em] uppercase text-gray-500 dark:text-gray-400">
                Course Code
              </label>
              <input
                className="
                  w-full px-3.5 py-2.5 rounded-xl text-sm font-mono
                  bg-gray-50 dark:bg-gray-800
                  border border-gray-200 dark:border-gray-700
                  text-gray-900 dark:text-white
                  placeholder:text-gray-300 dark:placeholder:text-gray-600
                  focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-500 focus:border-transparent
                  transition-all
                "
                placeholder="e.g. CSE-301"
                value={form.course_code}
                onChange={(e) => setForm({ ...form, course_code: e.target.value })}
              />
            </div>

            {/* Course Title */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold tracking-[0.08em] uppercase text-gray-500 dark:text-gray-400">
                Course Title
              </label>
              <input
                className="
                  w-full px-3.5 py-2.5 rounded-xl text-sm
                  bg-gray-50 dark:bg-gray-800
                  border border-gray-200 dark:border-gray-700
                  text-gray-900 dark:text-white
                  placeholder:text-gray-300 dark:placeholder:text-gray-600
                  focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-500 focus:border-transparent
                  transition-all
                "
                placeholder="e.g. Data Structures"
                value={form.course_title}
                onChange={(e) => setForm({ ...form, course_title: e.target.value })}
              />
            </div>

            {/* Credits */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold tracking-[0.08em] uppercase text-gray-500 dark:text-gray-400">
                Credits
              </label>
              <input
                type="number"
                min={1}
                max={6}
                className="
                  w-full px-3.5 py-2.5 rounded-xl text-sm font-mono
                  bg-gray-50 dark:bg-gray-800
                  border border-gray-200 dark:border-gray-700
                  text-gray-900 dark:text-white
                  placeholder:text-gray-300 dark:placeholder:text-gray-600
                  focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-500 focus:border-transparent
                  transition-all
                "
                placeholder="3"
                value={form.credit}
                onChange={(e) => setForm({ ...form, credit: e.target.value })}
              />
            </div>

            {/* Semester */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold tracking-[0.08em] uppercase text-gray-500 dark:text-gray-400">
                Semester
              </label>
              <select
                className="
                  w-full px-3.5 py-2.5 rounded-xl text-sm
                  bg-gray-50 dark:bg-gray-800
                  border border-gray-200 dark:border-gray-700
                  text-gray-900 dark:text-white
                  focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-500 focus:border-transparent
                  transition-all cursor-pointer appearance-none
                "
                value={form.semester}
                onChange={(e) => setForm({ ...form, semester: e.target.value })}
              >
                <option value="">Select semester</option>
                {SEMESTERS.map((s) => (
                  <option key={s} value={s}>{s}{["st","nd","rd"][s-1] || "th"} Semester</option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="sm:col-span-2 lg:col-span-4 flex items-center gap-3 pt-1">
              <button
                onClick={handleCreate}
                disabled={creating || !isFormValid}
                className="
                  flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                  bg-indigo-500 hover:bg-indigo-600 disabled:bg-indigo-300 dark:disabled:bg-indigo-800
                  text-white shadow-sm shadow-indigo-200 dark:shadow-indigo-900/30
                  transition-all cursor-pointer disabled:cursor-not-allowed
                "
              >
                {creating ? <><SpinnerIcon /> Creating…</> : <><PlusIcon /> Create Course</>}
              </button>
              <button
                onClick={() => setForm({ course_code: "", course_title: "", credit: "", semester: "" })}
                className="
                  px-5 py-2.5 rounded-xl text-sm font-medium
                  border border-gray-200 dark:border-gray-700
                  text-gray-500 dark:text-gray-400
                  hover:bg-gray-50 dark:hover:bg-gray-800
                  transition-all cursor-pointer bg-transparent
                "
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toolbar: Search + Semester Filters ── */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none">
            <SearchIcon />
          </span>
          <input
            className="
              w-full pl-10 pr-4 py-2.5 rounded-xl text-sm
              bg-white dark:bg-gray-900
              border border-gray-200 dark:border-gray-800
              text-gray-900 dark:text-white
              placeholder:text-gray-300 dark:placeholder:text-gray-600
              focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-500 focus:border-transparent
              transition-all
            "
            placeholder="Search by code or title…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Pills */}
        <div className="flex flex-wrap gap-2">
          {["all", ...SEMESTERS.map(String)].map((s) => (
            <button
              key={s}
              onClick={() => setFilterSemester(s)}
              className={`
                px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border
                ${filterSemester === s
                  ? "bg-indigo-500 dark:bg-indigo-500 text-white border-indigo-500 dark:border-indigo-500 shadow-sm shadow-indigo-200 dark:shadow-indigo-900/40"
                  : "bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-500 dark:hover:text-indigo-400"
                }
              `}
            >
              {s === "all" ? "All" : `Sem ${s}`}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table Card ── */}
      <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">

        {/* Table header bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40">
          <span className="text-xs font-semibold text-gray-400 dark:text-gray-500">
            Showing{" "}
            <span className="text-gray-800 dark:text-gray-200 text-sm">{filtered.length}</span>
            {" "}of {courses.length} courses
          </span>
        </div>

        {/* Responsive table wrapper */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                {["Code", "Course", "Credits", "Semester", "Teacher(s)", "Actions"].map((h) => (
                  <th
                    key={h}
                    className={`
                      px-5 py-3 text-left text-[10px] font-semibold tracking-[0.1em] uppercase
                      text-gray-400 dark:text-gray-500
                      ${h === "Actions" ? "text-right" : ""}
                    `}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-2xl">
                        📚
                      </div>
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {search || filterSemester !== "all" ? "No matching courses" : "No courses yet"}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {search || filterSemester !== "all"
                          ? "Try adjusting your search or filter"
                          : 'Click "New Course" to add your first course'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const sem = SEM_COLORS[c.semester] ?? DEFAULT_SEM;
                  const initials = c.teachers
                    ? c.teachers.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()
                    : null;

                  return (
                    <tr
                      key={c.id}
                      className="border-b border-gray-50 dark:border-gray-800/60 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                    >
                      {/* Code */}
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                          {c.course_code}
                        </span>
                      </td>

                      {/* Title */}
                      <td className="px-5 py-3.5">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{c.course_title}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                          {c.course_code} · {c.credit} credit{c.credit !== 1 ? "s" : ""}
                        </p>
                      </td>

                      {/* Credits */}
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-gray-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 dark:bg-emerald-500 inline-block" />
                          {c.credit} cr
                        </span>
                      </td>

                      {/* Semester */}
                      <td className="px-5 py-3.5">
                        <span className={`
                          inline-block px-2.5 py-1 rounded-full text-xs font-semibold
                          ${sem.bg} ${sem.text} ${sem.darkBg} ${sem.darkText}
                        `}>
                          Sem {c.semester}
                        </span>
                      </td>

                      {/* Teacher */}
                      <td className="px-5 py-3.5">
                        {c.teachers ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                              {initials}
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-300">{c.teachers}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-300 dark:text-gray-600 italic">Unassigned</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => handleDelete(c.id)}
                          disabled={deletingId === c.id}
                          className="
                            inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold
                            border border-red-100 dark:border-red-900/50
                            text-red-500 dark:text-red-400
                            hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700
                            disabled:opacity-40 disabled:cursor-not-allowed
                            transition-all cursor-pointer bg-transparent
                          "
                        >
                          {deletingId === c.id ? <><SpinnerIcon /> Deleting</> : <><TrashIcon /> Delete</>}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-down keyframe */}
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}