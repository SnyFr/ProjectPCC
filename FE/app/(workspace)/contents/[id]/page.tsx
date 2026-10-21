import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ContentDetailPreview } from "@/components/contents/content-detail-preview";
import { contentDetailPreview } from "@/features/contents/mock/content-detail-preview";
import { getContentById } from "@/features/contents/services/contents-service";
import type { ContentDetailPreviewRecord } from "@/features/contents/types/content-detail";
import { getErrorMessage, isApiClientError } from "@/lib/api/errors";

export const metadata: Metadata = {
  title: "Content detail | Frame Creator Studio",
};

async function ContentDetailRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Preserve local fixture preview for demo-42
  if (id === contentDetailPreview.id) {
    return <ContentDetailPreview content={contentDetailPreview} isSample />;
  }

  let data: ContentDetailPreviewRecord | null = null;
  let loadError: string | null = null;

  try {
    data = await getContentById(id);
  } catch (err: unknown) {
    if (isApiClientError(err) && err.status === 404) {
      notFound();
    }
    loadError = getErrorMessage(err, "Gagal memuat detail konten dari backend.");
  }

  if (loadError) {
    return (
      <div className="mx-auto max-w-330 py-8">
        <Alert className="mb-4 rounded-md border-[#ebc2bf] bg-[#fbf2f1] text-[#8c2a24]">
          <AlertTitle>Konten Tidak Dapat Dimuat</AlertTitle>
          <AlertDescription>{loadError}</AlertDescription>
        </Alert>
        <Button asChild variant="outline" className="text-xs">
          <Link href="/contents">Kembali ke Pipeline</Link>
        </Button>
      </div>
    );
  }

  if (!data) {
    notFound();
  }

  return <ContentDetailPreview content={data} />;
}

export default function ContentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<div className="py-9 text-xs text-[#68746e]" role="status">Loading content detail...</div>}>
      <ContentDetailRoute params={params} />
    </Suspense>
  );
}