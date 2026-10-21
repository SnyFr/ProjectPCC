import assert from "node:assert/strict";
import test from "node:test";
import { resolveApiUrl } from "../lib/env.ts";
import { API_ROUTES } from "../lib/api/routes.ts";
import { ApiClientError, getErrorMessage, isApiClientError } from "../lib/api/errors.ts";
import { clearSession, createSession, getToken } from "../lib/auth/session.ts";

test("resolveApiUrl handles relative paths, slashes, and prevents duplicate /api", () => {
  const base = "http://localhost:5000/api";

  assert.equal(
    resolveApiUrl("/v1/channels", base),
    "http://localhost:5000/api/v1/channels"
  );

  assert.equal(
    resolveApiUrl("v1/channels", base),
    "http://localhost:5000/api/v1/channels"
  );

  // If endpoint already starts with /api/, avoid duplicate /api/api/
  assert.equal(
    resolveApiUrl("/api/v1/channels", base),
    "http://localhost:5000/api/v1/channels"
  );

  // Absolute URLs should be preserved
  assert.equal(
    resolveApiUrl("https://example.com/custom/api", base),
    "https://example.com/custom/api"
  );
});

test("API_ROUTES generates correct paths and query params matching Section 5", () => {
  assert.equal(API_ROUTES.auth.register, "/v1/auth/register");
  assert.equal(API_ROUTES.auth.login, "/v1/auth/login");
  assert.equal(API_ROUTES.channels.list, "/v1/channels");
  assert.equal(API_ROUTES.channels.create, "/v1/channels");

  assert.equal(API_ROUTES.contents.list(), "/v1/contents");
  assert.equal(
    API_ROUTES.contents.list({ status: "idea" }),
    "/v1/contents?status=idea"
  );
  assert.equal(
    API_ROUTES.contents.list({ status: "ready", channel_id: "12" }),
    "/v1/contents?status=ready&channel_id=12"
  );

  assert.equal(API_ROUTES.contents.detail(42), "/v1/contents/42");
  assert.equal(API_ROUTES.contents.update(42), "/v1/contents/42");
  assert.equal(API_ROUTES.contents.delete(42), "/v1/contents/42");
  assert.equal(API_ROUTES.contents.checklists.create(42), "/v1/contents/42/checklists");
  assert.equal(API_ROUTES.checklists.toggle(9), "/v1/checklists/9/toggle");
  assert.equal(API_ROUTES.contents.metrics.create(42), "/v1/contents/42/metrics");
});

test("ApiClientError and getErrorMessage extract backend validation errors correctly", () => {
  const customError = new ApiClientError("Custom message", 400, {
    message: "Email already taken",
  });
  assert.equal(isApiClientError(customError), true);
  assert.equal(customError.status, 400);
  assert.equal(getErrorMessage(customError), "Email already taken");

  const validationError = new ApiClientError("Validation failed", 422, {
    errors: {
      title: ["Kolom title wajib diisi."],
    },
  });
  assert.equal(getErrorMessage(validationError), "Kolom title wajib diisi.");

  const fallbackError = getErrorMessage(new Error("Generic network error"));
  assert.equal(fallbackError, "Generic network error");
});

test("session helper supports optional token storage and retrieval", () => {
  clearSession();
  assert.equal(getToken(), null);

  createSession({
    name: "Creator Test",
    email: "creator@example.com",
    role: "creator",
    token: "mock-jwt-token-12345",
  });

  assert.equal(getToken(), "mock-jwt-token-12345");
  clearSession();
  assert.equal(getToken(), null);
});
