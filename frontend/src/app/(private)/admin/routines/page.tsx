"use client";

import { useEffect, useState } from "react";
import {
  getRoutines,
  createRoutine,
  deleteRoutine,
} from "@/lib/api/routines.api";
import { getCourses } from "@/lib/api/courses.api";
import { getUsers } from "@/lib/api/users.api";

const DAYS = [
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];

const DAY_COLORS: Record<string, string> = {
  Saturday:  "bg-violet-100 text-violet-700",
  Sunday:    "bg-rose-100 text-rose-700",
  Monday:    "bg-blue-100 text-blue-700",
  Tuesday:   "bg-emerald-100 text-emerald-700",
  Wednesday: "bg-amber-100 text-amber-700",
  Thursday:  "bg-cyan-100 text-cyan-700",
  Friday:    "bg-orange-100 text-orange-700",
};

export default function Page() {
  const [routines, setRoutines] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterDay, setFilterDay] = useState("All");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [form, setForm] = useState({
    course_id: "",
    teacher_id: "",
    room_no: "",
    day: "Saturday",
    start_time: "",
    end_time: "",
  });

  const fetchData = async () => {
    try {
      const [routineRes, courseRes, userRes] = await Promise.all([
        getRoutines(),
        getCourses(),
        getUsers(),
      ]);
      setRoutines(routineRes.data || []);
      setCourses(courseRes.data || []);
      const teacherList =
        userRes.data?.users?.filter((u: any) => u.role === "teacher") || [];
      setTeachers(teacherList);
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
      await createRoutine({
        course_id: Number(form.course_id),
        teacher_id: Number(form.teacher_id),
        room_no: form.room_no,
        day: form.day,
        start_time: form.start_time,
        end_time: form.end_time,
      });
      setForm({
        course_id: "",
        teacher_id: "",
        room_no: "",
        day: "Saturday",
        start_time: "",
        end_time: "",
      });
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this routine slot?")) return;
    try {
      setDeletingId(id);
      await deleteRoutine(id);
      fetchData();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredRoutines =
    filterDay === "All"
      ? routines
      : routines.filter((r) => r.day === filterDay);

  const inputCls =
    "w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 transition focus:border-[#2a7fba] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2a7fba]/20";

  return (
    <div className="min-h-screen bg-[#e9eef2] px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-8">

        {/* ── Header ── */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-[#2a7fba]">
              Admin Panel
            </p>
            <h1 className="mt-1 text-3xl font-bold text-gray-900">
              Routine Management
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Create and manage weekly class schedules
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white/70 px-4 py-2 shadow-sm ring-1 ring-gray-200 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-sm font-medium text-gray-600">
              {routines.length} slot{routines.length !== 1 ? "s" : ""} active
            </span>
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Total Slots", value: routines.length, icon: "🗓️" },
            { label: "Courses", value: courses.length, icon: "📚" },
            { label: "Teachers", value: teachers.length, icon: "🧑‍🏫" },
            {
              label: "Days Used",
              value: new Set(routines.map((r) => r.day)).size,
              icon: "📅",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100"
            >
              <div className="text-2xl">{stat.icon}</div>
              <div className="mt-2 text-2xl font-bold text-gray-900">
                {stat.value}
              </div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* ── Create Form ── */}
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
          <div className="border-b border-gray-100 px-6 py-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Add New Routine Slot
            </h2>
            <p className="text-sm text-gray-500">
              Fill in all fields to schedule a class session
            </p>
          </div>

          <form onSubmit={handleCreate} className="p-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Course */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Course
                </label>
                <select
                  value={form.course_id}
                  onChange={(e) =>
                    setForm({ ...form, course_id: e.target.value })
                  }
                  className={inputCls}
                  required
                >
                  <option value="">Select course…</option>
                  {courses.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.course_code} – {c.course_title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Teacher */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Teacher
                </label>
                <select
                  value={form.teacher_id}
                  onChange={(e) =>
                    setForm({ ...form, teacher_id: e.target.value })
                  }
                  className={inputCls}
                  required
                >
                  <option value="">Select teacher…</option>
                  {teachers.map((t: any) => (
                    <option key={t.id} value={t.id}>
                      {t.full_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Day */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Day
                </label>
                <select
                  value={form.day}
                  onChange={(e) =>
                    setForm({ ...form, day: e.target.value })
                  }
                  className={inputCls}
                >
                  {DAYS.map((d) => (
                    <option key={d}>{d}</option>
                  ))}
                </select>
              </div>

              {/* Start Time */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Start Time
                </label>
                <input
                  type="time"
                  value={form.start_time}
                  onChange={(e) =>
                    setForm({ ...form, start_time: e.target.value })
                  }
                  className={inputCls}
                  required
                />
              </div>

              {/* End Time */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  End Time
                </label>
                <input
                  type="time"
                  value={form.end_time}
                  onChange={(e) =>
                    setForm({ ...form, end_time: e.target.value })
                  }
                  className={inputCls}
                  required
                />
              </div>

              {/* Room */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Room Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 301-A"
                  value={form.room_no}
                  onChange={(e) =>
                    setForm({ ...form, room_no: e.target.value })
                  }
                  className={inputCls}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-xl bg-[#2a7fba] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#2472a8] active:scale-[0.98] disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <svg
                      className="h-4 w-4 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8z"
                      />
                    </svg>
                    Creating…
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Create Slot
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* ── Routine List ── */}
        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-gray-100">
          {/* Header + Day Filter */}
          <div className="flex flex-col gap-3 border-b border-gray-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Schedule Overview
              </h2>
              <p className="text-sm text-gray-500">
                {filteredRoutines.length} slot
                {filteredRoutines.length !== 1 ? "s" : ""} shown
              </p>
            </div>

            {/* Day filter pills */}
            <div className="flex flex-wrap gap-2">
              {["All", ...DAYS].map((d) => (
                <button
                  key={d}
                  onClick={() => setFilterDay(d)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    filterDay === d
                      ? "bg-[#2a7fba] text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Desktop Table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
                  <th className="px-6 py-4">Course</th>
                  <th className="px-6 py-4">Teacher</th>
                  <th className="px-6 py-4">Day</th>
                  <th className="px-6 py-4">Time</th>
                  <th className="px-6 py-4">Room</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredRoutines.map((routine: any) => (
                  <tr
                    key={routine.id}
                    className="group transition hover:bg-blue-50/30"
                  >
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-800">
                        {routine.course_code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#2a7fba]/10 text-xs font-bold text-[#2a7fba]">
                          {routine.teacher_name
                            ?.split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .slice(0, 2)
                            .toUpperCase() || "—"}
                        </div>
                        <span className="text-gray-700">
                          {routine.teacher_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                          DAY_COLORS[routine.day] ?? "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {routine.day}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3.5 w-3.5 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <circle cx="12" cy="12" r="10" />
                          <path
                            strokeLinecap="round"
                            d="M12 6v6l4 2"
                          />
                        </svg>
                        {routine.start_time} – {routine.end_time}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {routine.room_no ? (
                        <span className="rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                          {routine.room_no}
                        </span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(routine.id)}
                        disabled={deletingId === routine.id}
                        className="rounded-lg px-3 py-1.5 text-xs font-semibold text-red-500 transition hover:bg-red-50 active:scale-95 disabled:opacity-40"
                      >
                        {deletingId === routine.id ? "Deleting…" : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredRoutines.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-16 text-center text-gray-400"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-10 w-10 text-gray-200"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={1.5}
                        >
                          <rect x="3" y="4" width="18" height="18" rx="2" />
                          <path
                            strokeLinecap="round"
                            d="M16 2v4M8 2v4M3 10h18"
                          />
                        </svg>
                        <span className="text-sm">No routines found</span>
                        {filterDay !== "All" && (
                          <button
                            onClick={() => setFilterDay("All")}
                            className="text-xs text-[#2a7fba] underline underline-offset-2"
                          >
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

          {/* Mobile Cards */}
          <div className="divide-y divide-gray-100 md:hidden">
            {filteredRoutines.map((routine: any) => (
              <div key={routine.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900">
                        {routine.course_code}
                      </span>
                      <span
                        className={`rounded-lg px-2 py-0.5 text-xs font-semibold ${
                          DAY_COLORS[routine.day] ?? "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {routine.day}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {routine.teacher_name}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span>
                        {routine.start_time} – {routine.end_time}
                      </span>
                      {routine.room_no && (
                        <span className="rounded bg-gray-100 px-1.5 py-0.5 font-medium text-gray-600">
                          {routine.room_no}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(routine.id)}
                    disabled={deletingId === routine.id}
                    className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold text-red-500 transition hover:bg-red-50 disabled:opacity-40"
                  >
                    {deletingId === routine.id ? "…" : "Delete"}
                  </button>
                </div>
              </div>
            ))}

            {filteredRoutines.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-16 text-center text-gray-400">
                <span className="text-sm">No routines found</span>
                {filterDay !== "All" && (
                  <button
                    onClick={() => setFilterDay("All")}
                    className="text-xs text-[#2a7fba] underline underline-offset-2"
                  >
                    Clear filter
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}