import { resolveApiUrl } from "@/lib/env";
import { ApiClientError, getErrorMessage } from "@/lib/api/errors";
import { getToken } from "@/lib/auth/session";

export interface ApiRequestOptions extends RequestInit {
  token?: string;
  customBaseUrl?: string;
}

/**
 * Universal API Request runner for interacting with the backend REST API.
 */
export async function apiRequest<T = unknown>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { token, customBaseUrl, headers: customHeaders, ...fetchOptions } = options;

  const url = resolveApiUrl(endpoint, customBaseUrl);
  let activeToken = token ?? getToken();

  if (!activeToken && typeof window === "undefined") {
    try {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      activeToken = cookieStore.get("token")?.value ?? null;
    } catch {
      // Ignore when running outside of Next request context (e.g. unit tests)
    }
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(customHeaders as Record<string, string>),
  };

  if (fetchOptions.body && !(fetchOptions.body instanceof FormData)) {
    if (!headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }
  }

  if (activeToken && !headers.Authorization) {
    headers.Authorization = `Bearer ${activeToken}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...fetchOptions,
      headers,
    });
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error ? err.message : "Tidak dapat menghubungi server backend.";
    throw new ApiClientError(
      `Koneksi ke backend gagal (${url}): ${errorMsg}`,
      0,
      null,
      true
    );
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  // Parse response body
  const contentType = response.headers.get("content-type") || "";
  let data: unknown = null;

  if (contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    try {
      data = await response.text();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const message = getErrorMessage(
      new ApiClientError(
        `Request gagal dengan status ${response.status}`,
        response.status,
        data
      )
    );
    throw new ApiClientError(message, response.status, data);
  }

  return data as T;
}

export const apiClient = {
  get: <T = unknown>(endpoint: string, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: "GET" }),

  post: <T = unknown>(endpoint: string, body?: unknown, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "POST",
      body: body !== undefined ? (typeof body === "string" ? body : JSON.stringify(body)) : undefined,
    }),

  put: <T = unknown>(endpoint: string, body?: unknown, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body !== undefined ? (typeof body === "string" ? body : JSON.stringify(body)) : undefined,
    }),

  patch: <T = unknown>(endpoint: string, body?: unknown, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: body !== undefined ? (typeof body === "string" ? body : JSON.stringify(body)) : undefined,
    }),

  delete: <T = unknown>(endpoint: string, options?: ApiRequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: "DELETE" }),
};
