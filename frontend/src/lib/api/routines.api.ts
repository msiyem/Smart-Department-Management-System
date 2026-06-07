const API = process.env.NEXT_PUBLIC_API_URL;

// GET ALL ROUTINES
export async function getRoutines() {
  const res = await fetch(`${API}/routines`, {
    credentials: "include",
    cache: "no-store",
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.message || "Failed to fetch routines");
  }

  return result;
}

// CREATE ROUTINE
export async function createRoutine(data: {
  course_id: number;
  teacher_id: number;
  room_no?: string;
  day: string;
  start_time: string;
  end_time: string;
}) {
  const res = await fetch(`${API}/routines`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.message || "Failed to create routine");
  }

  return result;
}

// DELETE ROUTINE
export async function deleteRoutine(id: number) {
  const res = await fetch(`${API}/routines/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.message || "Failed to delete routine");
  }

  return result;
}