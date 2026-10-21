const DEFAULT_API_BASE = "http://localhost:5000/api";

export function getApiBaseUrl(): string {
  const rawUrl =
    (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL) ||
    DEFAULT_API_BASE;

  return rawUrl.trim().replace(/\/+$/, "");
}

/**
 * Resolves a given endpoint path against the API base URL.
 * Prevents duplicate `/api` prefix when base URL already ends with `/api`.
 *
 * Example:
 *   resolveApiUrl("/v1/channels", "http://localhost:5000/api")
 *   -> "http://localhost:5000/api/v1/channels"
 *
 *   resolveApiUrl("/api/v1/channels", "http://localhost:5000/api")
 *   -> "http://localhost:5000/api/v1/channels"
 */
export function resolveApiUrl(path: string, customBaseUrl?: string): string {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const base = (customBaseUrl ? customBaseUrl.trim() : getApiBaseUrl()).replace(
    /\/+$/,
    ""
  );
  let normalizedPath = path.startsWith("/") ? path : `/${path}`;

  // If base already ends with /api, and path starts with /api/, strip the leading /api from path
  if (base.endsWith("/api") && normalizedPath.startsWith("/api/")) {
    normalizedPath = normalizedPath.slice(4);
  }

  return `${base}${normalizedPath}`;
}
