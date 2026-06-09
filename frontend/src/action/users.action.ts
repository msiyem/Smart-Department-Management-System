"use server";
import { serverRequest } from "@/action/server-request.action";
import type { User, ApiResponse } from "@/lib/types";

export const getAllUsers = async (): Promise<ApiResponse<User[]>> => {
  try {
    return await serverRequest<ApiResponse<User[]>>("users", {
      method: "GET",
      auth: true,
    });
  } catch (error) {
    console.error("Error fetching users:", error);

    return {
      success: false,
      statusCode: 500,
      message: "Failed to fetch users",
      data: [],
    };
  }
};


export async function createUserAction(data: CreateUserInput) {
  return serverRequest("/users", {
    method: "POST",
    body: JSON.stringify(data),
    auth: true,
  });
}