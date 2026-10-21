import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContentForm } from "@/components/contents/content-form";

export const metadata: Metadata = {
  title: "New content | Frame Creator Studio",
};

export default function NewContentPage() {
  return (
    <div className="mx-auto max-w-230">
      <Button asChild className="-ml-2.5 mb-6 text-[11px] text-[#65736a]" variant="ghost">
        <Link href="/contents"><ArrowLeft aria-hidden="true" className="size-[15px]" /> Back to pipeline</Link>
      </Button>
      <div className="mb-6.75">
        <p className="mb-3 text-[10px] font-bold tracking-[0.14em] text-[#53816c]">CONTENT OPERATIONS</p>
        <h1 className="m-0 font-serif text-[38px] font-normal leading-[1.1] text-[#1d2b24] max-[640px]:text-[34px]">New content</h1>
        <p className="mt-2.75 max-w-67.5 text-[12px] leading-relaxed text-[#68746e] sm:text-[13px]">Start with the essentials. The details can find their shape as you work.</p>
      </div>
      <ContentForm mode="create" />
    </div>
  );
}