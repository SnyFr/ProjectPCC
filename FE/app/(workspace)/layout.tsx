"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import WorkspaceShell from "@/components/layout/workspace-shell";
import { getSession } from "@/lib/auth/session";

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!getSession()) {
      router.replace("/login");
    }
  }, [router]);

  return <WorkspaceShell>{children}</WorkspaceShell>;
}