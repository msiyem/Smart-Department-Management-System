"use client";

import { useEffect, useMemo, useState } from "react";
import { Award, Loader2 } from "lucide-react";

import { getMyResults } from "@/action/student.action";
import type { Result } from "@/types";

export default function StudentResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [cgpa, setCgpa] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadResults = async () => {
      setLoading(true);
      const response = await getMyResults();
      setResults(response.data.results);
      setCgpa(Number(response.data.cgpa || 0));
      setError(response.success ? "" : response.message || "Failed to load results");
      setLoading(false);
    };

    loadResults();
  }, []);

  const creditsCompleted = useMemo(
    () => results.reduce((sum, item) => sum + Number(item.credit || 0), 0),
    [results],
  );

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Results</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Published marks, grades, GPA, and cumulative progress.
        </p>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="CGPA" value={cgpa.toFixed(2)} />
        <StatCard label="Courses Published" value={results.length} />
        <StatCard label="Credits Completed" value={creditsCompleted} />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : results.length ? (
        <div className="rounded-xl border bg-background shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50 text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">
                    Course
                  </th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">
                    Semester
                  </th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">
                    Marks
                  </th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">
                    Grade
                  </th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">
                    GPA
                  </th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {results.map((result) => (
                  <tr key={result.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <p className="font-medium">{result.course_code}</p>
                      <p className="text-xs text-muted-foreground">
                        {result.course_title}
                      </p>
                    </td>
                    <td className="px-4 py-3">Semester {result.semester}</td>
                    <td className="px-4 py-3">{result.marks}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                        <Award className="size-3" />
                        {result.grade}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {Number(result.gpa || 0).toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {result.remarks || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed bg-background p-10 text-center text-sm text-muted-foreground">
          No results have been published yet.
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
