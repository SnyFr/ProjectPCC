import type { ReactNode } from "react";
import { AuthLayout } from "@/components/auth/auth-layout";

export default function AuthenticationLayout({ children }: { children: ReactNode }) {
  return <AuthLayout>{children}</AuthLayout>;
}