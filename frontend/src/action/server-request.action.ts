"use server";

import { API_URL } from "@/lib/const";
import { getCookie, deleteCookie } from "@/lib/cookies";
import { refreshSession } from "@/action/session.action";

type ServerRequestOptions = RequestInit & {
  auth?: boolean;
};

let refreshPromise: Promise<boolean> | null = null;

export async function serverRequest<T>(
  endpoint: string,
  options: ServerRequestOptions = {},
): Promise<T> {
  const path = endpoint.replace(/^\//, "");
  const requiresAuth = options.auth ?? false;
  const { headers: requestHeaders, ...fetchOptions } = options;

  const request = async (token: string | null) => {
    const headers = new Headers({
      Accept: "application/json",
      ...(requestHeaders || {}),
    });

    if (
      fetchOptions.body &&
      !(fetchOptions.body instanceof FormData) &&
      !headers.has("Content-Type")
    ) {
      headers.set("Content-Type", "application/json");
    }

    if (requiresAuth && token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    return fetch(`${API_URL}/${path}`, {
      ...fetchOptions,
      headers,
    });
  };

  let token = requiresAuth ? await getCookie("accessToken") : null;

  let refreshed = false;

  if (requiresAuth && !token) {
    if (!refreshPromise) {
      refreshPromise = refreshSession();
    }

    refreshed = await refreshPromise;
    refreshPromise = null;

    token = refreshed ? await getCookie("accessToken") : null;
  }

  let response = await request(token);

  if (requiresAuth && response.status === 401 && !refreshed) {
    if (!refreshPromise) {
      refreshPromise = refreshSession();
    }

    refreshed = await refreshPromise;
    refreshPromise = null;

    if (refreshed) {
      token = await getCookie("accessToken");

      response = await request(token);
    } else {
      await deleteCookie("accessToken");

      await deleteCookie("refreshToken");

      await deleteCookie("sessionId");

      throw new Error("Session expired");
    }
  }

  const contentType = response.headers.get("content-type");

  if (!response.ok) {
    try {
      const errorData = await response.json();

      throw {
        statusCode: errorData.statusCode,
        message: errorData.message || "Request failed",
        errors: errorData.errors || [],
      };
    } catch (error) {
      if (error && typeof error === "object" && "message" in error) {
        throw error;
      }

      throw new Error("Request failed");
    }
  }

  if (contentType?.includes("application/json")) {
    return (await response.json()) as T;
  }

  return (await response.text()) as T;
}
