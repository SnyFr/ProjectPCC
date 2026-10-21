"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useState, useSyncExternalStore } from "react";
import {
  Clapperboard,
  Layers3,
  LogOut,
  Menu,
  Radio,
  X,
} from "lucide-react";
import { clearSession, getSession, subscribeSession, type SessionUser } from "@/lib/auth/session";

function ActiveWorkspaceNavigation({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const isPipelineActive = pathname.startsWith("/contents");
  const isChannelsActive = pathname.startsWith("/channels");

  return (
    <nav aria-label="Primary navigation" className="flex flex-col gap-2">
      <p className="mb-1 ml-2 text-[10px] font-bold tracking-[0.14em] text-[#89938d]">Workspace</p>
      <Link
        href="/contents"
        aria-current={isPipelineActive ? "page" : undefined}
        className={`group flex min-h-10.5 items-center gap-2.75 rounded-[7px] px-2.75 text-[13px] text-[#626f68] no-underline transition-colors hover:bg-[#f0f4f0] hover:text-[#18231f] ${isPipelineActive ? "bg-[#e4f1eb] font-semibold text-[#145b47]" : ""}`}
        onClick={onNavigate}
      >
        <Layers3 aria-hidden="true" size={18} strokeWidth={1.8} />
        <span>Pipeline</span>
        <span className={`ml-auto h-4.25 w-0.75 rounded-sm bg-[#30896b] ${isPipelineActive ? "opacity-100" : "opacity-0"}`} aria-hidden="true" />
      </Link>
      <Link
        href="/channels"
        aria-current={isChannelsActive ? "page" : undefined}
        className={`group flex min-h-10.5 items-center gap-2.75 rounded-[7px] px-2.75 text-[13px] text-[#626f68] no-underline transition-colors hover:bg-[#f0f4f0] hover:text-[#18231f] ${isChannelsActive ? "bg-[#e4f1eb] font-semibold text-[#145b47]" : ""}`}
        onClick={onNavigate}
      >
        <Radio aria-hidden="true" size={18} strokeWidth={1.8} />
        <span>Channels</span>
        <span className={`ml-auto h-4.25 w-0.75 rounded-sm bg-[#30896b] ${isChannelsActive ? "opacity-100" : "opacity-0"}`} aria-hidden="true" />
      </Link>
    </nav>
  );
}

function WorkspaceNavigation({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Suspense fallback={<nav aria-label="Primary navigation" className="flex flex-col gap-2" />}>
      <ActiveWorkspaceNavigation onNavigate={onNavigate} />
    </Suspense>
  );
}

function CurrentWorkspaceSection() {
  const currentSection = usePathname().startsWith("/channels") ? "Channels" : "Pipeline";
  return <strong>{currentSection}</strong>;
}

function WorkspaceBrand() {
  return (
    <Link className="flex w-fit items-center gap-2.75 text-[#18231f] no-underline" href="/contents" aria-label="Frame workspace home">
      <span className="inline-flex size-9.5 items-center justify-center rounded-lg bg-[#1b3a30] text-[#f4c879]">
        <Clapperboard aria-hidden="true" size={19} strokeWidth={1.8} />
      </span>
      <span className="flex flex-col gap-0.75">
        <strong className="text-[14px] font-extrabold tracking-[0.12em] leading-none">FRAME</strong>
        <span className="text-[9px] font-semibold tracking-[0.13em] text-[#75817b]">CREATOR STUDIO</span>
      </span>
    </Link>
  );
}

function useCurrentUser(): SessionUser | null {
  return useSyncExternalStore(
    subscribeSession,
    getSession,
    () => null
  );
}

export default function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isMobileNavigationOpen, setIsMobileNavigationOpen] = useState(false);
  const currentUser = useCurrentUser();

  function handleLogout() {
    clearSession();
    router.push("/login");
  }

  const userInitial = currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : "C";

  return (
    <div className="flex min-h-screen">
      <aside className="flex min-h-screen flex-[0_0_248px] flex-col border-r border-[#e2e8e2] bg-[#fbfcfa] px-4.5 py-7 max-[800px]:flex-[0_0_218px] max-[800px]:px-3.5 max-[640px]:hidden">
        <WorkspaceBrand />
        <div className="my-9.5 mb-8.5 flex min-h-14.5 w-full items-center gap-2.5 rounded-lg border border-[#e2e8e2] bg-white p-2.25 text-left text-[#18231f] shadow-xs">
          <span suppressHydrationWarning className="inline-flex size-8.5 flex-[0_0_34px] items-center justify-center rounded-md bg-[#f3e6cd] font-serif text-[17px] text-[#674a1e]" aria-hidden="true">
            {userInitial}
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <strong suppressHydrationWarning className="truncate text-[12px] font-semibold">{currentUser?.name || "Creator Studio"}</strong>
            <span suppressHydrationWarning className="truncate text-[10px] text-[#68746e]">{currentUser?.email || "Personal workspace"}</span>
          </div>
        </div>
        <WorkspaceNavigation />
        <div className="mt-auto flex items-center justify-between border-t border-[#e2e8e2] px-1 pb-0.5 pt-4.5 text-[10px] text-[#78847d]">
          <span className="flex items-center gap-2">
            <span className="inline-block size-2.5 flex-[0_0_10px] rounded-full border-[3px] border-[#e2f0e7] bg-[#4b9a70]" aria-hidden="true" />
            Active Session
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 text-[10px] text-[#8c352d] hover:underline"
            type="button"
          >
            <LogOut size={12} aria-hidden="true" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-15.5 items-center justify-between border-b border-[#e2e8e2] bg-[rgb(251_252_250/84%)] px-10.5 max-[800px]:px-6.25 max-[640px]:h-14.5 max-[640px]:justify-between max-[640px]:px-4">
          <div className="flex items-center gap-3">
            <button
              aria-label={isMobileNavigationOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={isMobileNavigationOpen}
              aria-controls="mobile-navigation"
              className="hidden size-9 flex-[0_0_36px] items-center justify-center rounded-md border border-[#e2e8e2] bg-transparent p-0 text-[#34443a] max-[640px]:inline-flex"
              onClick={() => setIsMobileNavigationOpen((isOpen) => !isOpen)}
              type="button"
            >
              {isMobileNavigationOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex items-center gap-2.5 text-[11px] text-[#7b8780] max-[640px]:gap-1.75 max-[640px]:text-[10px]">
              <span>My studio</span>
              <span className="text-[#b0bab3]" aria-hidden="true">/</span>
              <Suspense fallback={<strong>Pipeline</strong>}>
                <CurrentWorkspaceSection />
              </Suspense>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            {currentUser && (
              <span suppressHydrationWarning className="text-[11px] font-medium text-[#44554b] max-[640px]:hidden">
                {currentUser.name}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-[5px] border border-[#d8e0d8] bg-white px-2.5 py-1 text-[11px] font-medium text-[#56655c] transition-colors hover:border-[#e5c5c2] hover:bg-[#fbf4f4] hover:text-[#9e342b]"
              type="button"
            >
              <LogOut size={13} aria-hidden="true" />
              <span>Log out</span>
            </button>
          </div>
        </header>

        {isMobileNavigationOpen && (
          <div className="fixed inset-x-0 bottom-0 top-14.5 z-20 min-[641px]:hidden">
            <button
              aria-label="Close navigation"
              className="absolute inset-0 w-full border-0 bg-[rgb(20_34_27/30%)]"
              onClick={() => setIsMobileNavigationOpen(false)}
              type="button"
            />
            <aside className="absolute bottom-0 left-0 top-0 w-[min(290px,calc(100vw-48px))] border-r border-[#e2e8e2] bg-[#fbfcfa] px-4.5 py-5.5" id="mobile-navigation">
              <WorkspaceBrand />
              <div className="mt-8.75">
                <WorkspaceNavigation onNavigate={() => setIsMobileNavigationOpen(false)} />
              </div>
            </aside>
          </div>
        )}

        <main className="min-w-0 flex-1 bg-[#f4f6f3] bg-[linear-gradient(rgb(30_69_51/2.5%)_1px,transparent_1px),linear-gradient(90deg,rgb(30_69_51/2.5%)_1px,transparent_1px)] bg-size-[32px_32px] px-10.5 pb-6.5 pt-12.5 max-[800px]:px-6.25 max-[800px]:py-9.75 max-[640px]:px-4 max-[640px]:py-8.5">
          {children}
        </main>
      </div>
    </div>
  );
}