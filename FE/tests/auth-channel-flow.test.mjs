import assert from "node:assert/strict";
import test from "node:test";
import { validateAuthForm } from "../features/auth/schemas/auth-form.ts";
import { validateChannelForm } from "../features/channels/schemas/channel-form.ts";
import {
  clearSession,
  createSession,
  getSession,
  getToken,
  isAuthenticated,
} from "../lib/auth/session.ts";
import { ApiClientError, getErrorMessage } from "../lib/api/errors.ts";

test("TC-01 simulated: server duplicate email error maps cleanly to email field error", () => {
  const serverResponse = {
    message: "Email already taken",
  };
  const apiError = new ApiClientError("Request failed with status 400", 400, serverResponse);
  const extractedMessage = getErrorMessage(apiError);

  assert.equal(extractedMessage, "Email already taken");

  const errors = {};
  if (extractedMessage.toLowerCase().includes("email already taken")) {
    errors.email = extractedMessage;
  }

  assert.equal(errors.email, "Email already taken");
});

test("auth form validation rejects invalid email and weak/unmatched passwords", () => {
  const invalidRegister = validateAuthForm(
    {
      name: "   ",
      email: "invalid-email",
      password: "123",
      confirmPassword: "456",
    },
    "register"
  );

  assert.equal(invalidRegister.name, "Masukkan nama minimal 2 karakter.");
  assert.equal(invalidRegister.email, "Masukkan alamat email yang valid.");
  assert.equal(invalidRegister.password, "Password harus berisi minimal 8 karakter.");
  assert.equal(invalidRegister.confirmPassword, "Konfirmasi password belum sama.");
});

test("channel form strictly enforces allowed platforms and max 100 character handle", () => {
  const invalidPlatform = validateChannelForm({
    platform: "twitter",
    handle_name: "@tech",
  });
  assert.equal(invalidPlatform.platform, "Pilih platform channel yang tersedia.");

  const validYouTube = validateChannelForm({
    platform: "youtube",
    handle_name: "@techcreator",
  });
  assert.deepEqual(validYouTube, {});

  const longHandle = validateChannelForm({
    platform: "tiktok",
    handle_name: `@${"a".repeat(100)}`,
  });
  assert.equal(longHandle.handle_name, "Handle channel maksimal 100 karakter.");
});

test("auth lifecycle: login stores user with token, logout clears session completely", () => {
  clearSession();
  assert.equal(isAuthenticated(), false);
  assert.equal(getToken(), null);

  const session = createSession({
    name: "Alex Creator",
    email: "alex@creator.studio",
    role: "creator",
    token: "jwt-token-xyz-987",
  });

  assert.equal(session.email, "alex@creator.studio");
  assert.equal(isAuthenticated(), true);
  assert.equal(getToken(), "jwt-token-xyz-987");
  assert.equal(getSession()?.email, "alex@creator.studio");
  assert.equal(getSession()?.name, "Alex Creator");

  clearSession();
  assert.equal(isAuthenticated(), false);
  assert.equal(getToken(), null);
  assert.equal(getSession(), null);
});

test("auth backend envelope: extracts token and user from backend { success, message, data } shape", () => {
  clearSession();

  // Simulated backend Express login response
  const backendResponse = {
    success: true,
    message: "Login successful",
    data: {
      token: "backend-express-jwt-token-12345",
      user: {
        id: 1,
        name: "Agil Creator",
        email: "agil@creator.com",
        role: "creator",
      },
    },
    meta: null,
  };

  const token = backendResponse.token || backendResponse.data?.token;
  const user = backendResponse.user || backendResponse.data?.user;

  assert.equal(token, "backend-express-jwt-token-12345");
  assert.equal(user?.name, "Agil Creator");
  assert.equal(user?.email, "agil@creator.com");

  createSession({
    name: user.name,
    email: user.email,
    role: user.role,
    token: token,
  });

  assert.equal(isAuthenticated(), true);
  assert.equal(getToken(), "backend-express-jwt-token-12345");
  assert.equal(getSession()?.name, "Agil Creator");

  clearSession();
  assert.equal(getToken(), null);
});
