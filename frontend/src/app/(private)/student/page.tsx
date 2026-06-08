"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Bell,
  BookOpen,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  Loader2,
} from "lucide-react";

import {
  getMyAttendance,
  getMyCourses,
  getMyResults,
  getStudentDashboard,
} from "@/action/student.action";
import type { AttendanceSummary, Course, StudentDashboard } from "@/types";

const quickLinks = [
  { href: "/student/courses", label: "Courses", icon: BookOpen },
  { href: "/student/attendance", label: "Attendance", icon: BarChart3 },
  { href: "/student/assignments", label: "Assignments", icon: ClipboardList },
  // { href: "/student/results", label: "Results", icon: GraduationCap },
  { href: "/student/notices", label: "Notices", icon: Bell },
  { href: "/student/routine", label: "Routine", icon: CalendarDays },
];

export default function StudentDashboardPage() {
  const [dashboard, setDashboard] = useState<StudentDashboard | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [attendance, setAttendance] = useState<AttendanceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [dashboardRes, coursesRes, attendanceRes, resultsRes] =
        await Promise.all([
          getStudentDashboard(),
          getMyCourses(),
          getMyAttendance(),
          getMyResults(),
        ]);

      if (!dashboardRes.success) {
        setError(dashboardRes.message || "Failed to load dashboard");
      }

      setDashboard(
        dashboardRes.data
          ? {
              ...dashboardRes.data,
              cgpa: resultsRes.data.cgpa ?? dashboardRes.data.cgpa,
              enrolled_courses:
                coursesRes.data.length || dashboardRes.data.enrolled_courses,
            }
          : null,
      );
      setCourses(coursesRes.data);
      setAttendance(attendanceRes.data);
      setLoading(false);
    };

    loadData();
  }, []);

  const averageAttendance = useMemo(() => {
    if (!attendance.length) return 0;
    const total = attendance.reduce(
      (sum, item) => sum + Number(item.attendance_percent || 0),
      0,
    );
    return Math.round(total / attendance.length);
  }, [attendance]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Student Dashboard
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track your courses, attendance, assignments, and academic progress.
        </p>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* <StatCard title="CGPA" value={dashboard?.cgpa?.toFixed(2) ?? "0.00"} /> */}
        <StatCard title="Semester" value={dashboard?.semester ?? "-"} />
        <StatCard
          title="Enrolled Courses"
          value={dashboard?.enrolled_courses ?? courses.length}
        />
        <StatCard
          title="Pending Assignments"
          value={dashboard?.pending_assignments ?? 0}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-xl border bg-background p-5 shadow-sm">
          <h2 className="text-base font-semibold">Quick Access</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {quickLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg border p-3 text-sm font-medium transition hover:bg-muted/50"
              >
                <item.icon className="size-4 text-primary" />
                {item.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="rounded-xl border bg-background p-5 shadow-sm">
          <h2 className="text-base font-semibold">Academic Snapshot</h2>
          <div className="mt-4 space-y-3">
            <SummaryItem label="Courses this semester" value={courses.length} />
            <SummaryItem
              label="Average attendance"
              value={`${averageAttendance}%`}
            />
            <SummaryItem
              label="Latest notices"
              value={dashboard?.recent_notices?.length ?? 0}
            />
          </div>
        </section>
      </div>

      <section className="rounded-xl border bg-background p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Recent Notices</h2>
          <Link
            href="/student/notices"
            className="text-sm font-medium text-primary hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="mt-4 divide-y">
          {dashboard?.recent_notices?.length ? (
            dashboard.recent_notices.map((notice) => (
              <div key={notice.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium">{notice.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(notice.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium capitalize">
                  {notice.priority}
                </span>
              </div>
            ))
          ) : (
            <p className="py-6 text-sm text-muted-foreground">
              No recent notices available.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: number | string }) {
  return (
    <div className="rounded-xl border bg-background p-4 shadow-sm">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
