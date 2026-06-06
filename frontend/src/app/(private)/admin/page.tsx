"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type DashboardData = {
  total_students: number;
  total_teachers: number;
  total_courses: number;
  total_notices: number;
  recent_notices: {
    id: number;
    title: string;
    priority: string;
    created_at: string;
  }[];
};

export default function Page() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/dashboard/admin`,
          {
            credentials: "include",
          }
        );

        if (!res.ok) throw new Error("Failed to fetch dashboard");

        const json = await res.json();
        setData(json.data);
      } catch (err: any) {
        setError(err.message);
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
        <h1 className="text-2xl font-bold">Admin Dashboard 👋</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Here&apos;s what&apos;s happening in your department.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={data.total_students} />
        <StatCard title="Total Teachers" value={data.total_teachers} />
        <StatCard title="Courses" value={data.total_courses} />
        <StatCard title="Notices" value={data.total_notices} />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="rounded-xl border bg-background p-5">
          <h2 className="text-base font-semibold mb-4">Quick Actions</h2>

          <div className="grid grid-cols-2 gap-3">
            {[
              { href: "/admin/users", label: "Users", color: "text-blue-500" },
              { href: "/admin/courses", label: "Courses", color: "text-emerald-500" },
              { href: "/admin/notices", label: "Notices", color: "text-amber-500" },
              { href: "/admin/routines", label: "Routines", color: "text-purple-500" },
              { href: "/admin/results", label: "Results", color: "text-red-500" },
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

        {/* Recent Notices */}
        <div className="rounded-xl border bg-background p-5">
          <h2 className="text-base font-semibold mb-4">Recent Notices</h2>

          <div className="space-y-3">
            {data.recent_notices?.length ? (
              data.recent_notices.map((notice) => (
                <div
                  key={notice.id}
                  className="flex items-start justify-between gap-3 rounded-lg border p-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {notice.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Priority: {notice.priority}
                    </p>
                  </div>

                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(notice.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No notices yet
              </p>
            )}
          </div>
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
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  );
}