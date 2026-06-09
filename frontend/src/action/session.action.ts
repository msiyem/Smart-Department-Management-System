"use server";

import { API_URL } from "@/lib/const";
import { deleteCookie, getCookie, setCookie } from "@/lib/cookies";

export const refreshSession = async (): Promise<boolean> => {
  try {
    const refreshToken = await getCookie("refreshToken");
    const sessionId = await getCookie("sessionId");

    if (!refreshToken || !sessionId) {
      return false;
    }

    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        refreshToken,
        sessionId,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      await deleteCookie("accessToken");
      await deleteCookie("refreshToken");
      await deleteCookie("sessionId");
      return false;
    }

    const {
      accessToken,
      refreshToken: newRefreshToken,
      sessionId: newSessionId,
    } = result.data;

    await setCookie(
      "accessToken",
      accessToken,
      60 * 60, // 1 hour
    );

    await setCookie(
      "refreshToken",
      newRefreshToken,
      60 * 60 * 24 * 7,
    );

    await setCookie(
      "sessionId",
      newSessionId,
      60 * 60 * 24 * 7,
    );

    return true;
  } catch (error) {
    console.error("Refresh error:", error);

    await deleteCookie("accessToken");
    await deleteCookie("refreshToken");
    await deleteCookie("sessionId");

    return false;
  }
};