export type AuthMode = "login" | "register";
export type AuthField = "name" | "email" | "password" | "confirmPassword";
export type AuthFormValues = Record<AuthField, string>;
export type AuthFieldErrors = Partial<Record<AuthField, string>>;

export const initialAuthFormValues: AuthFormValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export function validateAuthForm(
  values: AuthFormValues,
  mode: AuthMode
): AuthFieldErrors {
  const errors: AuthFieldErrors = {};

  if (mode === "register" && values.name.trim().length < 2) {
    errors.name = "Masukkan nama minimal 2 karakter.";
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Masukkan alamat email yang valid.";
  }

  if (values.password.length < 8) {
    errors.password = "Password harus berisi minimal 8 karakter.";
  }

  if (mode === "register" && values.confirmPassword !== values.password) {
    errors.confirmPassword = "Konfirmasi password belum sama.";
  }

  return errors;
}
