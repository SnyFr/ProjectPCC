export class ApiClientError extends Error {
  readonly status: number;
  readonly data: unknown;
  readonly isNetworkError: boolean;

  constructor(message: string, status = 500, data: unknown = null, isNetworkError = false) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.data = data;
    this.isNetworkError = isNetworkError;
    Object.setPrototypeOf(this, ApiClientError.prototype);
  }
}

export function isApiClientError(error: unknown): error is ApiClientError {
  return error instanceof ApiClientError;
}

export function getErrorMessage(error: unknown, fallback = "Terjadi kesalahan pada server."): string {
  if (isApiClientError(error)) {
    if (typeof error.data === "object" && error.data !== null) {
      const dataObj = error.data as Record<string, unknown>;
      if (typeof dataObj.message === "string" && dataObj.message.trim()) {
        return dataObj.message;
      }
      if (typeof dataObj.error === "string" && dataObj.error.trim()) {
        return dataObj.error;
      }
      if (Array.isArray(dataObj.errors) && dataObj.errors.length > 0) {
        return String(dataObj.errors[0]);
      }
      if (typeof dataObj.errors === "object" && dataObj.errors !== null) {
        const errorEntries = Object.values(dataObj.errors);
        if (errorEntries.length > 0) {
          const first = errorEntries[0];
          if (Array.isArray(first) && first.length > 0) return String(first[0]);
          if (typeof first === "string") return first;
        }
      }
    }
    return error.message || fallback;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  if (typeof error === "string") {
    return error;
  }

  return fallback;
}
