export type UserRole = "creator" | "editor" | "admin";

export type UserRecord = {
  id: string | number;
  name: string;
  email: string;
  role: UserRole;
  created_at?: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type AuthResponseData = {
  token?: string;
  user?: UserRecord;
  id?: string | number;
  name?: string;
  email?: string;
  role?: UserRole;
};

export type AuthResponse = {
  user?: UserRecord;
  token?: string;
  message?: string;
  success?: boolean;
  data?: AuthResponseData;
};
