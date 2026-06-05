'use server';

import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";
import { UserRole } from "../types";

type AuthUser = {
  id: string;
  role: UserRole;
  full_name?: string;
  email: string;
  exp?: number;
};

export async function getUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();

  const token = cookieStore.get("accessToken")?.value;

  if (!token) return null;

  try {
    const decoded = jwtDecode<AuthUser>(token);

    if (decoded.exp && decoded.exp * 1000 <= Date.now()) {
      return null;
    }

    if (!decoded.role || !["student", "teacher", "admin"].includes(decoded.role)) {
      return null;
    }

    return decoded;
  } catch {
    return null;
  }
}