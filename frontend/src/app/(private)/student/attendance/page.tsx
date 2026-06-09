"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

import { getMyAttendance } from "@/action/student.action";
import type { AttendanceSummary } from "@/types";

export default function StudentAttendancePage() {
  const [attendance, setAttendance] = useState<AttendanceSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAttendance = async () => {
      setLoading(true);
      const response = await getMyAttendance();
      setAttendance(response.data);
      setError(response.success ? "" : response.message || "Failed to load attendance");
      setLoading(false);
    };

    loadAttendance();
  }, []);

  const summary = useMemo(() => {
    const totalClasses = attendance.reduce(
      (sum, item) => sum + Number(item.total_classes || 0),
      0,
    );
    const present = attendance.reduce(
      (sum, item) => sum + Number(item.present || 0),
      0,
    );
    const absent = attendance.reduce(
      (sum, item) => sum + Number(item.absent || 0),
      0,
    );

    return {
      totalClasses,
      present,
      absent,
      percent: totalClasses ? Math.round((present / totalClasses) * 100) : 0,
    };
  }, [attendance]);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Attendance</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Course-wise attendance summary from your recorded classes.
        </p>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Overall" value={`${summary.percent}%`} />
        <StatCard label="Classes" value={summary.totalClasses} />
        <StatCard label="Present" value={summary.present} />
        <StatCard label="Absent" value={summary.absent} />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : attendance.length ? (
        <div className="rounded-xl border bg-background shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">
                    Course
                  </th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">
                    Classes
                  </th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">
                    Present
                  </th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">
                    Absent
                  </th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">
                    Percentage
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {attendance.map((item) => {
                  const percent = Number(item.attendance_percent || 0);

                  return (
                    <tr key={item.course_code} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <p className="font-medium">{item.course_code}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.course_title}
                        </p>
                      </td>
                      <td className="px-4 py-3">{item.total_classes}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-emerald-600">
                          <CheckCircle2 className="size-4" />
                          {item.present}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-red-600">
                          <XCircle className="size-4" />
                          {item.absent}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex min-w-36 items-center gap-3">
                          <div className="h-2 flex-1 rounded-full bg-muted">
                            <div
                              className="h-2 rounded-full bg-emerald-500"
                              style={{ width: `${Math.min(percent, 100)}%` }}
                            />
                          </div>
                          <span className="w-12 text-right font-medium">
                            {percent}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed bg-background p-10 text-center text-sm text-muted-foreground">
          No attendance has been recorded yet.
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-xl border bg-background p-4 shadow-sm">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
