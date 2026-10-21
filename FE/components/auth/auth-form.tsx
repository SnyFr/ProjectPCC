"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowRight, CheckCircle2, CircleAlert, Eye, EyeOff, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSession } from "@/lib/auth/session";
import { getErrorMessage } from "@/lib/api/errors";
import { loginUser, registerUser } from "@/features/auth/services/auth-service";
import {
  initialAuthFormValues,
  validateAuthForm,
  type AuthField,
  type AuthFieldErrors,
  type AuthFormValues,
  type AuthMode,
} from "@/features/auth/schemas/auth-form";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const isRegister = mode === "register";

  const [values, setValues] = useState(initialAuthFormValues);
  const [errors, setErrors] = useState<AuthFieldErrors>({});
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  function updateField(field: AuthField, value: string) {
    setValues((currentValues: AuthFormValues) => ({ ...currentValues, [field]: value }));
    setErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }));
    setErrorMessage("");
    setSuccessMessage("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const nextErrors = validateAuthForm(values, mode);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (isRegister) {
        const response = await registerUser({
          name: values.name.trim(),
          email: values.email.trim(),
          password: values.password,
        });

        let user = response.user || response.data?.user || {
          name: values.name.trim(),
          email: values.email.trim(),
          role: "creator",
        };
        let token = response.token || response.data?.token;

        // Backend register does not generate a token, perform auto-login so session has token
        if (!token) {
          try {
            const loginRes = await loginUser({
              email: values.email.trim(),
              password: values.password,
            });
            token = loginRes.token || loginRes.data?.token;
            if (loginRes.user || loginRes.data?.user) {
              user = loginRes.user || loginRes.data?.user || user;
            }
          } catch {
            setSuccessMessage("Akun berhasil dibuat. Mengalihkan ke halaman login...");
            setTimeout(() => {
              router.push("/login");
            }, 800);
            return;
          }
        }

        createSession({
          name: user.name || values.name.trim(),
          email: user.email || values.email.trim(),
          role: user.role || "creator",
          token: token,
        });

        setSuccessMessage("Akun berhasil dibuat. Mengalihkan ke workspace...");
        setTimeout(() => {
          router.push("/contents");
        }, 800);
      } else {
        const response = await loginUser({
          email: values.email.trim(),
          password: values.password,
        });

        const token = response.token || response.data?.token;
        const user = response.user || response.data?.user || {
          name: "Creator",
          email: values.email.trim(),
          role: "creator",
        };

        createSession({
          name: user.name || "Creator",
          email: user.email || values.email.trim(),
          role: user.role || "creator",
          token: token,
        });

        setSuccessMessage("Berhasil masuk. Mengalihkan ke workspace...");
        setTimeout(() => {
          router.push("/contents");
        }, 500);
      }
    } catch (err: unknown) {
      setIsSubmitting(false);
      const msg = getErrorMessage(err, "Gagal memproses permintaan autentikasi.");
      setErrorMessage(msg);

      // Support QA Test Case TC-01: "Email already taken"
      if (msg.toLowerCase().includes("email already taken") || msg.toLowerCase().includes("sudah terdaftar")) {
        setErrors((prev) => ({
          ...prev,
          email: msg,
        }));
      }
    }
  }

  return (
    <div className="w-full max-w-97.5">
      <div className="mb-7.5 max-[760px]:mb-6.25">
        <p className="mb-3 text-[9px] font-bold tracking-[0.16em] text-[#56816a]">{isRegister ? "START YOUR STUDIO" : "WELCOME BACK"}</p>
        <h2 className="m-0 font-serif text-[32px] font-normal leading-[1.15] text-[#1d2b24] max-[760px]:text-[29px]">{isRegister ? "Create your account" : "Sign in to your studio"}</h2>
        <p className="mt-2.5 text-[12px] leading-[1.65] text-[#737e77]">
          {isRegister
            ? "Set up your creator workspace and bring the next idea to life."
            : "Pick up where your next piece of work begins."}
        </p>
      </div>

      {errorMessage && (
        <Alert className="mb-5 -mt-3 rounded-md border-[#ebc2bf] bg-[#fbf2f1] text-[11px] leading-normal text-[#8c2a24] **:data-[slot=alert-title]:text-[11px] **:data-[slot=alert-title]:font-semibold **:data-[slot=alert-description]:text-[10px] **:data-[slot=alert-description]:text-[#8c2a24]" role="alert">
          <CircleAlert aria-hidden="true" className="size-4 text-[#bf382f]" />
          <AlertTitle>Autentikasi Gagal</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <Alert className="mb-5 -mt-3 rounded-md border-[#d5e4d4] bg-[#f2f6ef] text-[11px] leading-normal text-[#345642] **:data-[slot=alert-title]:text-[11px] **:data-[slot=alert-title]:font-semibold **:data-[slot=alert-description]:text-[10px] **:data-[slot=alert-description]:text-[#64776a]" role="status">
          <CheckCircle2 aria-hidden="true" className="size-4 text-[#358257]" />
          <AlertTitle>Sukses</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      <form className="flex flex-col gap-4.75" noValidate onSubmit={handleSubmit}>
        {isRegister && (
          <div className="flex min-w-0 flex-col gap-1.75">
            <Label htmlFor="name">Nama</Label>
            <Input
              autoComplete="name"
              id="name"
              name="name"
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "name-error" : undefined}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Nama lengkap"
              value={values.name}
            />
            {errors.name && <p className="m-0 text-[10px] leading-[1.4] text-[#a33e37]" id="name-error">{errors.name}</p>}
          </div>
        )}

        <div className="flex min-w-0 flex-col gap-1.75">
          <Label htmlFor="email">Email</Label>
          <Input
            autoComplete="email"
            id="email"
            name="email"
            type="email"
            inputMode="email"
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            onChange={(event) => updateField("email", event.target.value)}
            placeholder="nama@email.com"
            value={values.email}
          />
          {errors.email && <p className="m-0 text-[10px] leading-[1.4] text-[#a33e37]" id="email-error">{errors.email}</p>}
        </div>

        <div className="flex min-w-0 flex-col gap-1.75">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            {!isRegister && <span className="text-[10px] text-[#88938b]">Minimal 8 karakter</span>}
          </div>
          <div className="relative">
            <Input
              autoComplete={isRegister ? "new-password" : "current-password"}
              id="password"
              name="password"
              type={isPasswordVisible ? "text" : "password"}
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.password)}
              aria-describedby={errors.password ? "password-error" : undefined}
              onChange={(event) => updateField("password", event.target.value)}
              placeholder="Masukkan password"
              value={values.password}
              className="h-10.75 rounded-[5px] border-[#d9e0d9] bg-white px-3 text-[12px] text-[#24332b] shadow-none placeholder:text-[#a3ada5] focus-visible:border-[#4f8d6a] focus-visible:ring-[3px] focus-visible:ring-[#4f8d6a]/15 aria-invalid:border-[#bd5149]"
            />
            <Button
              aria-label={isPasswordVisible ? "Sembunyikan password" : "Tampilkan password"}
              className="absolute right-1 top-0.75 size-9 text-[#76827a]"
              onClick={() => setIsPasswordVisible((isVisible) => !isVisible)}
              size="icon"
              type="button"
              variant="ghost"
              disabled={isSubmitting}
            >
              {isPasswordVisible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
            </Button>
          </div>
          {errors.password && (
            <p className="m-0 text-[10px] leading-[1.4] text-[#a33e37]" id="password-error">{errors.password}</p>
          )}
        </div>

        {isRegister && (
          <div className="flex min-w-0 flex-col gap-1.75">
            <Label htmlFor="confirmPassword">Konfirmasi password</Label>
            <Input
              autoComplete="new-password"
              id="confirmPassword"
              name="confirmPassword"
              type={isPasswordVisible ? "text" : "password"}
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.confirmPassword)}
              aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
              onChange={(event) => updateField("confirmPassword", event.target.value)}
              placeholder="Ulangi password"
              value={values.confirmPassword}
              className="h-10.75 rounded-[5px] border-[#d9e0d9] bg-white px-3 text-[12px] text-[#24332b] shadow-none placeholder:text-[#a3ada5] focus-visible:border-[#4f8d6a] focus-visible:ring-[3px] focus-visible:ring-[#4f8d6a]/15 aria-invalid:border-[#bd5149]"
            />
            {errors.confirmPassword && (
              <p className="m-0 text-[10px] leading-[1.4] text-[#a33e37]" id="confirm-password-error">
                {errors.confirmPassword}
              </p>
            )}
          </div>
        )}

        <Button
          className="mt-0.75 h-11.25 justify-between rounded-[5px] bg-[#1c644c] px-3.75 text-[12px] font-semibold text-white hover:bg-[#174f3d] disabled:opacity-60"
          type="submit"
          size="lg"
          disabled={isSubmitting}
        >
          <span>{isSubmitting ? "Processing..." : isRegister ? "Create account" : "Continue to studio"}</span>
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <ArrowRight aria-hidden="true" data-icon="inline-end" />
          )}
        </Button>
      </form>

      <p className="mt-5.5 text-center text-[11px] text-[#77827a]">
        {isRegister ? "Already have an account?" : "New to Frame?"}{" "}
        <Link className="font-semibold text-[#216348] no-underline hover:underline hover:underline-offset-[3px]" href={isRegister ? "/login" : "/register"}>
          {isRegister ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </div>
  );
}