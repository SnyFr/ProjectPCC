import { apiClient } from "@/lib/api/client";
import { API_ROUTES } from "@/lib/api/routes";
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  UserRecord,
} from "@/features/auth/types/auth";

export async function registerUser(payload: RegisterPayload): Promise<AuthResponse> {
  const result = await apiClient.post<AuthResponse>(API_ROUTES.auth.register, payload);
  const data = result?.data;
  const token = result?.token || data?.token;
  const user =
    result?.user ||
    data?.user ||
    (data?.email
      ? {
          id: data.id ?? "",
          name: data.name ?? payload.name,
          email: data.email,
          role: data.role ?? "creator",
        }
      : undefined);

  return {
    ...result,
    token,
    user: user as UserRecord,
  };
}

export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  const result = await apiClient.post<AuthResponse>(API_ROUTES.auth.login, payload);
  const data = result?.data;
  const token = result?.token || data?.token;
  const user =
    result?.user ||
    data?.user ||
    (data?.email
      ? {
          id: data.id ?? "",
          name: data.name ?? "Creator",
          email: data.email,
          role: data.role ?? "creator",
        }
      : undefined);

  return {
    ...result,
    token,
    user: user as UserRecord,
  };
}
