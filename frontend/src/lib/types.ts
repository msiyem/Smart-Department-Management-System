export type UserRole = "student" | "teacher" | "admin";

export interface User {
  id: number;
  full_name: string;
  email: string;
  role: UserRole;
  profile_image: string | null;
  is_active: boolean | number;
  last_login_at: string | null;
  created_at: string;

  registration_no?: string | null;
  session?: string | null;
  semester?: string | null;
  cgpa?: number | string | null;
  designation?: string | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export interface LoginData {
  user: User;
  accessToken: string;
  refreshToken: string;
  sessionId: string;
}

export type LoginResponse = ApiResponse<LoginData>;

export interface AuthResponse {
  success: boolean;
  statusCode: number;
  message: string;
}
export interface ApiError {
  field?: string;
  message: string;
}

export interface ErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  errors?: ApiError[];
}


