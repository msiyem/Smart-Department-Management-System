"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type DashboardData = {
  courses_teaching: number;
  total_assignments: number;
  total_students: number;
  pending_submissions: number;
  today_classes: number;
};

export default function Page() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/dashboard/teacher`,
          {
            credentials: "include",
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch dashboard");
        }

        const json = await res.json();
        setData(json.data);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">
          Teacher Dashboard 👨‍🏫
        </h1>

        <p className="text-muted-foreground text-sm mt-1">
          Here&apos;s what&apos;s happening in your courses today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
        <StatCard
          title="Courses"
          value={data.courses_teaching}
        />

        <StatCard
          title="Assignments"
          value={data.total_assignments}
        />

        {/* <StatCard
          title="Students"
          value={data.total_students}
        /> */}

        {/* <StatCard
          title="Pending Review"
          value={data.pending_submissions}
        /> */}

        <StatCard
          title="Today's Classes"
          value={data.today_classes}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="rounded-xl border bg-background p-5">
          <h2 className="text-base font-semibold mb-4">
            Quick Actions
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {[
              {
                href: "/teacher/courses",
                label: "My Courses",
                color: "text-blue-500",
              },
              {
                href: "/teacher/assignments",
                label: "Assignments",
                color: "text-emerald-500",
              },
              {
                href: "/teacher/attendance",
                label: "Attendance",
                color: "text-purple-500",
              },
              {
                href: "/teacher/results",
                label: "Results",
                color: "text-amber-500",
              },
              {
                href: "/teacher/notices",
                label: "Notices",
                color: "text-red-500",
              },
              {
                href: "/teacher/profile",
                label: "Profile",
                color: "text-cyan-500",
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-center rounded-xl border p-3 text-sm font-medium hover:bg-muted/50 transition"
              >
                <span className={item.color}>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Teaching Summary */}
        <div className="rounded-xl border bg-background p-5">
          <h2 className="text-base font-semibold mb-4">
            Teaching Summary
          </h2>

          <div className="space-y-3">
            <SummaryItem
              label="Courses Assigned"
              value={data.courses_teaching}
            />

            <SummaryItem
              label="Assignments Created"
              value={data.total_assignments}
            />

            <SummaryItem
              label="Students Enrolled"
              value={data.total_students}
            />

            <SummaryItem
              label="Pending Submissions"
              value={data.pending_submissions}
            />

            <SummaryItem
              label="Today's Classes"
              value={data.today_classes}
            />
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="rounded-xl border bg-background p-5">
        <h2 className="text-base font-semibold mb-4">
          Performance Overview
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InfoCard
            title="Student Coverage"
            value={data.total_students}
            description="Students under your assigned courses"
          />

          <InfoCard
            title="Assignment Workload"
            value={data.total_assignments}
            description="Total assignments you've created"
          />

          <InfoCard
            title="Review Queue"
            value={data.pending_submissions}
            description="Submissions waiting for grading"
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border bg-background p-4 shadow-sm hover:shadow-md transition">
      <p className="text-sm text-muted-foreground">
        {title}
      </p>

      <p className="text-2xl font-bold mt-1">
        {value}
      </p>
    </div>
  );
}

function SummaryItem({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-4">
      <span className="text-sm text-muted-foreground">
        {label}
      </span>

      <span className="text-lg font-semibold">
        {value}
      </span>
    </div>
  );
}

function InfoCard({
  title,
  value,
  description,
}: {
  title: string;
  value: number;
  description: string;
}) {
  return (
    <div className="rounded-xl border p-4">
      <h3 className="font-medium">{title}</h3>

      <p className="text-3xl font-bold mt-3">
        {value}
      </p>

      <p className="text-xs text-muted-foreground mt-2">
        {description}
      </p>
    </div>
  );
}