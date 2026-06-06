const API = process.env.NEXT_PUBLIC_API_URL;

export async function getCourses(semester?: number) {
  const url = semester
    ? `${API}/courses?semester=${semester}`
    : `${API}/courses`;

  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to fetch courses");

  return res.json();
}

export async function createCourse(data: any) {
  const res = await fetch(`${API}/courses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok) {
    console.error(result);
    throw new Error(result.message || "Failed to create course");
  }

  return result;
}

export async function updateCourse(id: number, data: any) {
  const res = await fetch(`${API}/courses/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to update course");

  return res.json();
}

export async function deleteCourse(id: number) {
  const res = await fetch(`${API}/courses/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to delete course");

  return res.json();
}

export async function enrollStudent(data: {
  student_id: number;
  course_id: number;
}) {
  const res = await fetch(`${API}/courses/enroll`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to enroll student");

  return res.json();
}

export async function assignTeacher(data: {
  teacher_id: number;
  course_id: number;
}) {
  const res = await fetch(`${API}/courses/assign-teacher`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Failed to assign teacher");

  return res.json();
}