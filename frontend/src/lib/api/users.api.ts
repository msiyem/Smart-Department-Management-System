const API = process.env.NEXT_PUBLIC_API_URL;

/**
 * GET USERS
 * Cookie-based auth (NO localStorage, NO token param)
 */
export async function getUsers(page = 1) {
  const res = await fetch(`${API}/users?page=${page}`, {
    method: "GET",
    credentials: "include", // 🔥 sends accessToken cookie
  });

  return res.json();
}

/**
 * CREATE USER (ADMIN ONLY)
 * FIXED: remove token from localStorage flow → use cookies instead
 */
export async function createUser(data: any) {
  const res = await fetch(`${API}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // 🔥 IMPORTANT (admin auth via cookie)
    body: JSON.stringify(data),
  });

  return res.json();
}

/**
 * TOGGLE USER STATUS
 */
export async function toggleUser(id: number) {
  const res = await fetch(`${API}/users/${id}/toggle-status`, {
    method: "PATCH",
    credentials: "include",
  });

  return res.json();
}

/**
 * DELETE USER
 */
export async function deleteUser(id: number) {
  const res = await fetch(`${API}/users/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  return res.json();
}