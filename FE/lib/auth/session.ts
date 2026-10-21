const SESSION_KEY = "token";

export type SessionUser = {
  email: string;
  role: string;
  name: string;
  createdAt: string;
  token?: string;
};

let inMemorySession: SessionUser | null = null;
let lastRawSession: string | null = null;
let cachedSession: SessionUser | null = null;

const sessionListeners = new Set<() => void>();

function notifySessionListeners() {
  for (const listener of sessionListeners) {
    listener();
  }
}

export function subscribeSession(callback: () => void): () => void {
  sessionListeners.add(callback);

  let onStorage: ((e: StorageEvent) => void) | null = null;
  if (typeof window !== "undefined") {
    onStorage = (e: StorageEvent) => {
      if (e.key === SESSION_KEY) {
        lastRawSession = null;
        callback();
      }
    };
    window.addEventListener("storage", onStorage);
  }

  return () => {
    sessionListeners.delete(callback);
    if (onStorage && typeof window !== "undefined") {
      window.removeEventListener("storage", onStorage);
    }
  };
}

export function createSession(
  user: Omit<SessionUser, "createdAt">
): SessionUser {
  const session: SessionUser = {
    ...user,
    createdAt: new Date().toISOString(),
  };

  const serialized = JSON.stringify(session);
  if (typeof window !== "undefined") {
    if (window.sessionStorage) {
      window.sessionStorage.setItem(SESSION_KEY, serialized);
    }
    if (session.token && window.localStorage) {
      window.localStorage.setItem("token", session.token);
    }
  }

  if (typeof document !== "undefined" && session.token) {
    document.cookie = `token=${encodeURIComponent(session.token)}; path=/; max-age=86400; SameSite=Lax`;
  }

  inMemorySession = session;
  cachedSession = session;
  lastRawSession = serialized;
  notifySessionListeners();
  return session;
}

export function getSession(): SessionUser | null {
  if (typeof window !== "undefined" && window.sessionStorage) {
    const rawSession = window.sessionStorage.getItem(SESSION_KEY);
    if (!rawSession) {
      inMemorySession = null;
      cachedSession = null;
      lastRawSession = null;
      return null;
    }

    if (rawSession === lastRawSession && cachedSession !== null) {
      return cachedSession;
    }

    try {
      const session = JSON.parse(rawSession) as SessionUser;
      if (session && session.email && session.role) {
        lastRawSession = rawSession;
        cachedSession = session;
        inMemorySession = session;
        return cachedSession;
      }
      return inMemorySession;
    } catch {
      return inMemorySession;
    }
  }

  return inMemorySession;
}

export function clearSession(): void {
  if (typeof window !== "undefined") {
    if (window.sessionStorage) {
      window.sessionStorage.removeItem(SESSION_KEY);
    }
    if (window.localStorage) {
      window.localStorage.removeItem("token");
    }
  }

  if (typeof document !== "undefined") {
    document.cookie = "token=; path=/; max-age=0; SameSite=Lax";
  }

  inMemorySession = null;
  cachedSession = null;
  lastRawSession = null;
  notifySessionListeners();
}

export function isAuthenticated(): boolean {
  return getSession() !== null;
}

export function getToken(): string | null {
  const session = getSession();
  if (session?.token) {
    return session.token;
  }

  if (typeof window !== "undefined") {
    const localToken = window.localStorage?.getItem("token");
    if (localToken && !localToken.startsWith("{")) {
      return localToken;
    }
    if (typeof document !== "undefined" && document.cookie) {
      const match = document.cookie.match(/(?:^|;\s*)token=([^;]+)/);
      if (match) {
        return decodeURIComponent(match[1]);
      }
    }
  }

  return null;
}
