"use server";

import { refreshSession } from "@/action/session.action";
import { serverRequest } from "@/action/server-request.action";
import { deleteCookie } from "@/lib/cookies";
import type { ApiResponse, User } from "@/lib/types";

type ActionResult<T> = {
  success: boolean;
  message?: string;
  data: T;
};

function getErrorMessage(error: unknown, fallback: string) {
  return error && typeof error === "object" && "message" in error
    ? String(error.message)
    : fallback;
}

export async function getCurrentProfile(): Promise<ActionResult<User | null>> {
  try {
    const response = await serverRequest<ApiResponse<User>>("auth/me", {
      method: "GET",
      auth: true,
      cache: "no-store",
    });

    return {
      success: true,
      message: response.message,
      data: response.data ?? null,
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error, "Failed to load profile"),
      data: null,
    };
  }
}

export async function updateCurrentProfile(formData: FormData) {
  try {
    const fullName = String(formData.get("full_name") || "").trim();

    if (!fullName) {
      return {
        success: false,
        message: "Full name is required",
      };
    }

    const response = await serverRequest<ApiResponse<null>>("users/profile", {
      method: "PATCH",
      auth: true,
      body: JSON.stringify({ full_name: fullName }),
    });

    await refreshSession();

    return {
      success: true,
      message: response.message,
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error, "Failed to update profile"),
    };
  }
}

export async function updateCurrentProfileImage(formData: FormData) {
  try {
    const file = formData.get("profile_image");

    if (!(file instanceof File) || file.size === 0) {
      return {
        success: false,
        message: "Please choose an image",
      };
    }

    const response = await serverRequest<ApiResponse<{ profile_image: string }>>(
      "users/profile/image",
      {
        method: "PATCH",
        auth: true,
        body: formData,
      },
    );

    await refreshSession();

    return {
      success: true,
      message: response.message,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error, "Failed to update profile image"),
    };
  }
}

export async function changeCurrentPassword(formData: FormData) {
  try {
    const currentPassword = String(formData.get("current_password") || "");
    const newPassword = String(formData.get("new_password") || "");
    const confirmPassword = String(formData.get("confirm_password") || "");

    if (!currentPassword || !newPassword || !confirmPassword) {
      return {
        success: false,
        message: "All password fields are required",
      };
    }

    if (newPassword !== confirmPassword) {
      return {
        success: false,
        message: "New password and confirmation do not match",
      };
    }

    if (newPassword.length < 8) {
      return {
        success: false,
        message: "Password must be at least 8 characters",
      };
    }

    if (!/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      return {
        success: false,
        message: "Password must contain an uppercase letter and a number",
      };
    }

    const response = await serverRequest<ApiResponse<null>>(
      "auth/change-password",
      {
        method: "PATCH",
        auth: true,
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      },
    );

    await deleteCookie("accessToken");
    await deleteCookie("refreshToken");
    await deleteCookie("sessionId");

    return {
      success: true,
      message: response.message,
    };
  } catch (error) {
    return {
      success: false,
      message: getErrorMessage(error, "Failed to change password"),
    };
  }
}
