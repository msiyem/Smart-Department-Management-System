const API = process.env.NEXT_PUBLIC_API_URL;

// GET ALL NOTICES
export async function getNotices() {
  const res = await fetch(`${API}/notices`, {
    credentials: "include",
    cache: "no-store",
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.message || "Failed to fetch notices");
  }

  return result;
}

// CREATE NOTICE
export async function createNotice(formData: FormData) {
  const res = await fetch(`${API}/notices`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.message || "Failed to create notice");
  }

  return result;
}

// DELETE NOTICE
export async function deleteNotice(id: number) {
  const res = await fetch(`${API}/notices/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.message || "Failed to delete notice");
  }

  return result;
}