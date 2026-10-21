import type { Metadata } from "next";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata: Metadata = {
  title: "Sign in | Frame Creator Studio",
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}