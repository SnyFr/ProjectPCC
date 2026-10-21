import Link from "next/link";
import { Clapperboard } from "lucide-react";

const stages = ["IDEA", "SCRIPT", "RECORD", "EDIT", "READY", "PUBLISH"];

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen grid-cols-[minmax(360px,0.9fr)_minmax(440px,1.1fr)] bg-[#f1f3ef] max-[760px]:grid-cols-1">
      <section className="relative isolate flex min-h-screen flex-col justify-between overflow-hidden bg-[#17372d] px-[clamp(32px,6vw,82px)] py-9 text-[#f7f7f0] max-[760px]:min-h-63.75 max-[760px]:px-6.25 max-[760px]:pb-4.75 max-[760px]:pt-6" aria-label="Frame Creator Studio">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(rgb(216_236_218/5%)_1px,transparent_1px),linear-gradient(90deg,rgb(216_236_218/5%)_1px,transparent_1px)] bg-size-[36px_36px] mask-[linear-gradient(to_bottom,#000_15%,transparent_92%)]" aria-hidden="true" />
        <div className="absolute -right-62.5 top-[26%] -z-10 size-115 rotate-36 border border-[rgb(220_238_220/15%)]" aria-hidden="true" />
        <Link className="inline-flex w-fit items-center gap-2.75 text-[#f7f7f0] no-underline" href="/contents" aria-label="Frame home">
          <span className="inline-flex size-9.5 items-center justify-center rounded-[7px] bg-[#f0c873] text-[#17372d]"><Clapperboard size={20} /></span>
          <span className="flex flex-col gap-0.75"><strong className="text-[14px] font-extrabold leading-none tracking-[0.12em]">FRAME</strong><small className="text-[9px] font-semibold tracking-[0.13em] text-[#b2c9bb]">CREATOR STUDIO</small></span>
        </Link>

        <div className="my-auto max-w-122.5 py-13 pb-15 max-[760px]:my-9.25 max-[760px]:py-0">
          <p className="mb-5.25 text-[9px] font-bold tracking-[0.16em] text-[#e4c77e] max-[760px]:mb-2.5 max-[760px]:text-[8px]">A STUDIO FOR EVERY STORY</p>
          <h1 className="m-0 font-serif text-[clamp(45px,5.1vw,69px)] font-normal leading-[1.03] max-[760px]:text-[37px]">Make room<br />for the work<br /><em className="font-normal text-[#e7c77c]">that matters.</em></h1>
          <p className="mt-5.5 max-w-91.25 text-[13px] leading-[1.8] text-[#c3d2c8] max-[760px]:hidden">
            A thoughtful place to shape ideas, move them through production, and share them with the world.
          </p>
        </div>

        <div className="flex items-start justify-between border-t border-[rgb(223_238_225/21%)] pt-4 max-[760px]:hidden" aria-label="Idea to publication">
          {stages.map((stage, index) => (
            <div className="flex flex-col gap-2 text-[8px] tracking-[0.08em] text-[#afc2b5]" key={stage}>
              <span className={`size-2 rounded-full border-2 border-[#17372d] ${index === 0 ? "bg-[#e7c77c] shadow-[0_0_0_1px_#e7c77c]" : "bg-[#527166] shadow-[0_0_0_1px_#527166]"}`} />
              <span>{stage}</span>
            </div>
          ))}
        </div>

        <p className="mt-4.75 text-[8px] tracking-[0.14em] text-[#9fb6a7] max-[760px]:hidden">PLAN WITH INTENTION. PUBLISH WITH PURPOSE.</p>
      </section>
      <section className="flex min-h-screen flex-col items-center justify-center bg-[#f8f9f6] px-9 pb-7 pt-12.5 max-[760px]:min-h-0 max-[760px]:px-6 max-[760px]:pb-7.5 max-[760px]:pt-10.5">
        {children}
        <p className="mt-10.75 text-center text-[9px] text-[#929b94] max-[760px]:mt-8.5">By continuing, you agree to keep your creative work yours.</p>
      </section>
    </main>
  );
}