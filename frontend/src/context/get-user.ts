"use server";

import { getCookie } from "@/lib/cookies";
import { jwtDecode } from "jwt-decode";

type DecodedToken = {
  id: number;
  role: string;
  email: string;
  full_name?: string;
  expiresIn?: number;
};

export const getUser = async () => {
  try {
    const accessToken = await getCookie("accessToken");

    if (!accessToken) {
      return null;
    }

    const decoded = jwtDecode<DecodedToken>(accessToken);

    if (decoded.expiresIn && decoded.expiresIn * 1000 < Date.now()) {
      return null;
    }

    return {
      id: decoded.id,
      email: decoded.email,
      full_name: decoded?.full_name || "unknown",
      role: decoded.role,
    };
  } catch {
    return null;
  }
};