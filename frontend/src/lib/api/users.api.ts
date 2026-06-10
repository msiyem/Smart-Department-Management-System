const API =process.env.NEXT_PUBLIC_API_URL;


export async function getUsers(page = 1) {
  const res = await fetch(`${API}/users?page=${page}`, {
    method: "GET",
    credentials: "include", 
  });

  return res.json();
}


export async function createUser(data: any) {
  const res = await fetch(`${API}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", 
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

export async function deleteMyAccount() {
  const res = await fetch(`${API}/users/`, {
    method: "DELETE",
    credentials: "include",
  });

  return res.json();
}