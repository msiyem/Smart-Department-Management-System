"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/shared/DataTable";
import { DatePicker } from "@/components/shared/date-picker";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  takeAttendance,
  getCourseEnrollments,
  getCourseAttendance,
  type CourseEnrollment,
} from "@/action/attendance.action";
import { serverRequest } from "@/action/server-request.action";
import { APIResponse } from "@/lib/api";

interface Course {
  id: number;
  course_code: string;
  course_title: string;
  credit: number;
  semester: number;
}

interface StudentAttendance extends CourseEnrollment {
  status: "present" | "absent" | "pending";
  [key: string]: unknown;
}

export default function TeacherAttendancePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>(
    format(new Date(), "yyyy-MM-dd"),
  );
  const [students, setStudents] = useState<StudentAttendance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch teacher's courses on mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        const response = await serverRequest<APIResponse<Course[]>>(
          "/courses/teacher/my",
          { method: "GET", auth: true },
        );
        console.log("Courses response:", response);
        setCourses(response.data || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch courses",
        );
        toast.error("Failed to load courses");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Fetch students when course is selected
  useEffect(() => {
    if (!selectedCourse) {
      return;
    }

    const fetchStudents = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const courseId = parseInt(selectedCourse);

        // Fetch enrolled students
        const enrollResponse = await getCourseEnrollments(courseId);
        if (!enrollResponse.success) {
          setError(enrollResponse.message || "Failed to fetch students");
          toast.error(enrollResponse.message || "Failed to fetch students");
          setStudents([]);
          return;
        }

        const studentList: StudentAttendance[] = (
          enrollResponse.data || []
        ).map((student) => ({
          ...student,
          status: "pending" as const,
        }));

        // Fetch existing attendance for selected date
        if (selectedDate) {
          const attendResponse = await getCourseAttendance(
            courseId,
            selectedDate,
          );

          if (attendResponse.success) {
            const attendanceMap = new Map(
              attendResponse.data.map((a) => [a.student_id, a.status]),
            );

            // Map attendance status to students
            const updatedList = studentList.map((student) => ({
              ...student,
              status:
                (attendanceMap.get(student.student_id) as
                  | "present"
                  | "absent") || "pending",
            }));
            setStudents(updatedList);
          } else {
            setStudents(studentList);
          }
        } else {
          setStudents(studentList);
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to fetch students";
        setError(message);
        toast.error(message);
        setStudents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, [selectedCourse, selectedDate]);

  // Toggle attendance status
  const toggleAttendance = (studentId: number) => {
    setStudents((prevStudents) =>
      prevStudents.map((student) =>
        student.student_id === studentId
          ? {
              ...student,
              status:
                student.status === "present"
                  ? "absent"
                  : student.status === "absent"
                    ? "present"
                    : "present",
            }
          : student,
      ),
    );
  };

  // Submit attendance
  const handleSubmit = async () => {
    if (!selectedCourse || !selectedDate) {
      setError("Please select both course and date");
      toast.error("Please select both course and date");
      return;
    }

    const pendingStudents = students.filter((s) => s.status === "pending");
    if (pendingStudents.length > 0) {
      setError(
        `Please mark attendance for all ${pendingStudents.length} student(s)`,
      );
      toast.error(
        `Please mark attendance for all ${pendingStudents.length} student(s)`,
      );
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const payload = {
        course_id: parseInt(selectedCourse),
        attendance_date: selectedDate,
        records: students
          .filter((s) => s.status !== "pending")
          .map((s) => ({
            student_id: s.student_id,
            status: s.status as "present" | "absent",
          })),
      };

      const result = await takeAttendance(payload);

      if (result.success) {
        setSuccess(result.message);
        toast.success(result.message);

        // Reset form
        setTimeout(() => {
          setSelectedCourse("");
          setSelectedDate(format(new Date(), "yyyy-MM-dd"));
          setStudents([]);
          setSuccess(null);
        }, 2000);
      } else {
        setError(result.message);
        toast.error(result.message);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to submit attendance";
      setError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate statistics
  const stats = {
    total: students.length,
    present: students.filter((s) => s.status === "present").length,
    absent: students.filter((s) => s.status === "absent").length,
    pending: students.filter((s) => s.status === "pending").length,
  };

  const columns = [
    {
      key: "full_name" as const,
      header: "Student Name",
      className: "min-w-[200px]",
    },
    {
      key: "registration_no" as const,
      header: "Registration No.",
      className: "min-w-[150px]",
    },
    {
      key: "email" as const,
      header: "Email",
      className: "min-w-[200px]",
    },
    {
      key: "status" as const,
      header: "Attendance",
      render: (row: StudentAttendance) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleAttendance(row.student_id)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
              row.status === "pending"
                ? "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300"
                : row.status === "present"
                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                  : "bg-red-100 text-red-700 hover:bg-red-200"
            }`}
            disabled={isSubmitting}
          >
            {row.status === "pending"
              ? "Mark"
              : row.status === "present"
                ? "✓ Present"
                : "✗ Absent"}
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Attendance Management
        </h1>
        <p className="text-muted-foreground mt-2">
          Record and manage student attendance for your courses
        </p>
      </div>

      {/* Selection Card */}
      <Card>
        <CardHeader>
          <CardTitle>Select Course & Date</CardTitle>
          <CardDescription>
            Choose a course and date to record attendance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Course Select */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Course</label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a course..." />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id.toString()}>
                      {course.course_code} - {course.course_title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Picker */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Attendance Date</label>
              <DatePicker value={selectedDate} onChange={setSelectedDate} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {success}
          </AlertDescription>
        </Alert>
      )}

      {/* Students Table */}
      {selectedCourse && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Student Attendance</CardTitle>
                <CardDescription className="mt-2">
                  {selectedDate
                    ? format(new Date(selectedDate), "MMMM dd, yyyy")
                    : "Select a date"}
                </CardDescription>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="font-medium">Present: {stats.present}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="font-medium">Absent: {stats.absent}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                  <span className="font-medium">Pending: {stats.pending}</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : students.length > 0 ? (
              <>
                <DataTable<StudentAttendance>
                  data={students}
                  columns={columns}
                  searchable
                  searchKeys={["full_name", "registration_no", "email"]}
                  emptyMessage="No students enrolled in this course."
                />
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || stats.pending > 0}
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Submit Attendance
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedCourse("");
                      setStudents([]);
                    }}
                    variant="outline"
                    size="lg"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">
                  No students enrolled in this course. Please select another
                  course.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instructions */}
      {!selectedCourse && (
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">How to Use</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-900 space-y-2">
            <p>
              1. Select a course from the dropdown to view enrolled students.
            </p>
            <p>2. Select the attendance date using the date picker.</p>
            <p>
              3. Click on the &quot;Mark&quot; button for each student to mark
              them as Present or Absent.
            </p>
            <p>
              4. Once all students are marked, click &quot;Submit
              Attendance&quot; to save the records.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
