import Link from "next/link";
import { Suspense } from "react";
import {
  ArrowRight,
  Briefcase,
  Calendar,
  Camera,
  CircleAlert,
  Clapperboard,
  Edit2,
  Eye,
  ListFilter,
  Music2,
  Play,
  Plus,
  Radio,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { channelPreviewRecords } from "@/features/channels/mock/channel-preview";
import {
  CHANNEL_PLATFORM_LABELS,
  type ChannelPlatform,
  type ChannelRecord,
} from "@/features/channels/types/channel";
import {
  CONTENT_FORMAT_LABELS,
  CONTENT_FORMATS,
  CONTENT_PRIORITY_LABELS,
  CONTENT_STATUSES,
  CONTENT_STATUS_LABELS,
  isContentFormat,
  isContentStatus,
  type ContentFormat,
  type ContentStatus,
} from "@/features/contents/types/content";
import type { ContentItem } from "@/features/contents/types/content-detail";
import { getChannels } from "@/features/channels/services/channels-service";
import { getContents } from "@/features/contents/services/contents-service";
import { getErrorMessage } from "@/lib/api/errors";



const platformIcons: Record<
  ChannelPlatform,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  youtube: Play,
  tiktok: Music2,
  instagram: Camera,
  linkedin: Briefcase,
};

function statusBadgeClass(status: ContentStatus): string {
  const classes: Record<ContentStatus, string> = {
    idea: "border-[#e6e8cf] bg-[#f3f4e9] text-[#737642]",
    scripting: "border-[#d8e6ea] bg-[#eef4f6] text-[#4b727d]",
    recording: "border-[#d8e6ea] bg-[#eef4f6] text-[#4b727d]",
    editing: "border-[#ecdfbf] bg-[#f8f2e6] text-[#8b6e31]",
    ready: "border-[#d8e8d8] bg-[#edf5ed] text-[#47794f]",
    published: "border-[#cde5d6] bg-[#e7f3ec] text-[#286b4b]",
  };
  return classes[status] || "border-[#e2e8e1] bg-[#f3f5f1] text-[#6f7b72]";
}

function priorityBadgeClass(priority: string): string {
  switch (priority) {
    case "high":
      return "border-[#f1d0ce] bg-[#fdf5f4] text-[#b8382e]";
    case "low":
      return "border-[#dce8dc] bg-[#f2f7f2] text-[#437554]";
    default:
      return "border-[#fae8c8] bg-[#fdfaf3] text-[#9c6a1e]";
  }
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function getSingleValue(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : "";
}

async function ContentPipelineContent({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const rawStatus = getSingleValue(params.status);
  const selectedStatus: ContentStatus | "" = isContentStatus(rawStatus) ? rawStatus : "";
  const rawFormat = getSingleValue(params.format);
  const selectedFormat: ContentFormat | "" = isContentFormat(rawFormat) ? rawFormat : "";
  const selectedChannelId = getSingleValue(params.channel_id).trim();
  const rawPlatform = getSingleValue(params.platform).trim();

  let channels: ChannelRecord[] = [];
  try {
    channels = await getChannels();
  } catch {
    channels = channelPreviewRecords;
  }
  if (!channels || channels.length === 0) {
    channels = channelPreviewRecords;
  }

  const selectedPlatform = channels.some((c) => c.platform === rawPlatform) ? rawPlatform : "";
  const activeChannel = channels.find((c) => String(c.id) === selectedChannelId);
  const hasFilters = Boolean(selectedStatus || selectedChannelId || selectedFormat || selectedPlatform);

  let contents: ContentItem[] = [];
  let backendError: string | null = null;

  try {
    contents = await getContents({
      status: selectedStatus || undefined,
      channel_id: selectedChannelId || undefined,
    });
  } catch (err: unknown) {
    backendError = getErrorMessage(err, "Koneksi ke backend belum tersedia.");
    contents = [];
  }

  // Filter client-side by format or platform if specified
  let displayedContents = contents;
  if (selectedFormat) {
    displayedContents = displayedContents.filter((c) => c.format_type === selectedFormat);
  }
  if (selectedPlatform) {
    displayedContents = displayedContents.filter(
      (c) => c.channel?.platform === selectedPlatform
    );
  }

  // Count items per status
  const statusCounts: Record<ContentStatus, number> = {
    idea: 0,
    scripting: 0,
    recording: 0,
    editing: 0,
    ready: 0,
    published: 0,
  };
  contents.forEach((item) => {
    if (isContentStatus(item.status)) {
      statusCounts[item.status] = (statusCounts[item.status] || 0) + 1;
    }
  });

  return (
    <div className="mx-auto max-w-342.5">
      <div className="mb-7 flex items-center justify-between max-[640px]:items-start max-[640px]:gap-3.5">
        <div>
          <p className="mb-3 text-[10px] font-bold tracking-[0.14em] text-[#53816c]">CONTENT OPERATIONS</p>
          <h1 className="m-0 font-serif text-[clamp(34px,4vw,46px)] font-normal leading-[1.08] text-[#1d2b24] max-[640px]:text-4xl">Content pipeline</h1>
          <p className="mt-2.75 max-w-67.5 text-[12px] leading-relaxed text-[#68746e] sm:text-[13px]">
            Every story, from the first spark to the final publish.
          </p>
        </div>
        <Button asChild className="mt-1 min-h-9.75 rounded-[5px] bg-[#1c644c] px-3.25 text-[11px] font-semibold text-white hover:bg-[#174f3d] max-[640px]:mt-5.75 max-[640px]:shrink-0">
          <Link href="/contents/new">
            <Plus aria-hidden="true" data-icon="inline-start" />
            New content
          </Link>
        </Button>
      </div>

      {backendError && (
        <Alert className="mb-5 grid-cols-[18px_1fr] items-start rounded-[7px] border-[#ebc2bf] bg-[#fbf2f1] px-3.75 py-3.25 text-[#8c2a24] [&>svg]:mt-px [&>svg]:text-[#bf382f] **:data-[slot=alert-title]:text-[11px] **:data-[slot=alert-title]:font-semibold **:data-[slot=alert-description]:text-[10px] **:data-[slot=alert-description]:leading-normal **:data-[slot=alert-description]:text-[#8c2a24]">
          <CircleAlert aria-hidden="true" />
          <AlertTitle>Koneksi Server Tertunda</AlertTitle>
          <AlertDescription>
            {backendError}. Pastikan server backend aktif di endpoint yang terkonfigurasi. Anda juga dapat membuka sampel pratinjau di bawah.
          </AlertDescription>
        </Alert>
      )}

      <section aria-label="Content lifecycle" className="overflow-hidden rounded-[9px] border border-[#e0e7e0] bg-[rgb(255_255_255/84%)] shadow-[0_12px_32px_rgb(30_56_41/4%)]">
        <div className="flex min-h-23 items-center justify-between border-b border-[#e8ede8] px-6.25 py-5 max-[640px]:min-h-19.75 max-[640px]:px-4">
          <div>
            <span className="mb-1.75 block text-[9px] font-bold tracking-[0.14em] text-[#78877e]">THE WORKFLOW</span>
            <h2 className="m-0 text-base font-semibold text-[#24332b]">Production stages</h2>
          </div>
          <span className="rounded bg-[#f0f4f0] px-2.25 py-1.75 text-[9px] font-bold tracking-[0.14em] text-[#65756b]">
            {contents.length} ACTIVE ITEMS
          </span>
        </div>

        <ol className="m-0 grid min-w-195 grid-cols-6 overflow-x-auto px-6 py-0 [scrollbar-color:#becfc2_transparent] scrollbar-thin max-[640px]:min-w-171 max-[640px]:px-3">
          {CONTENT_STATUSES.map((status, index) => (
            <li className={`flex min-h-14 items-center gap-2.25 border-b border-[#e8ede8] px-2.25 ${index > 0 ? "border-l border-l-[#edf0ed]" : ""}`} key={status}>
              <span className={`text-[9px] tabular-nums ${index === 0 ? "text-[#26765b]" : "text-[#9aa49d]"}`}>
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="flex flex-col">
                <span className="whitespace-nowrap text-[11px] font-semibold text-[#4d5c53]">{CONTENT_STATUS_LABELS[status]}</span>
                <span className="text-[9px] text-[#86948b]">{statusCounts[status]} item</span>
              </div>
              <span className={`ml-auto h-1 w-4.5 rounded-sm ${index === 0 ? "bg-[#7bb99a]" : "bg-[#d8e1da]"}`} aria-hidden="true" />
            </li>
          ))}
        </ol>

        <div className="border-b border-[#e8ede8] px-6 pb-5 pt-4.5 max-[640px]:px-3.5 max-[640px]:py-4">
          <div className="mb-3.25 flex items-center gap-2 text-[11px] font-semibold text-[#44544a]">
            <ListFilter aria-hidden="true" size={16} />
            <span>Filter content</span>
          </div>
          <form action="/contents" className="flex flex-wrap items-end gap-2.75 max-[640px]:grid max-[640px]:grid-cols-2" method="get">
            <div className="flex max-w-55 min-w-0 flex-[1_1_150px] flex-col gap-1.5 max-[640px]:max-w-none">
              <label className="text-[10px] font-semibold text-[#65736a]" htmlFor="filter-status">Status</label>
              <select className="h-9.25 w-full min-w-0 rounded-[5px] border border-[#d9e0d9] bg-white px-2.5 text-[11px] text-[#34443a]" defaultValue={selectedStatus} id="filter-status" name="status">
                <option value="">All statuses</option>
                {CONTENT_STATUSES.map((status) => (
                  <option key={status} value={status}>{CONTENT_STATUS_LABELS[status]}</option>
                ))}
              </select>
            </div>
            <div className="flex max-w-55 min-w-0 flex-[1_1_180px] flex-col gap-1.5 max-[640px]:max-w-none">
              <label className="text-[10px] font-semibold text-[#65736a]" htmlFor="filter-format">Format</label>
              <select className="h-9.25 w-full min-w-0 rounded-[5px] border border-[#d9e0d9] bg-white px-2.5 text-[11px] text-[#34443a]" defaultValue={selectedFormat} id="filter-format" name="format">
                <option value="">All formats</option>
                {CONTENT_FORMATS.map((format) => (
                  <option key={format} value={format}>{CONTENT_FORMAT_LABELS[format]}</option>
                ))}
              </select>
            </div>
            <div className="flex max-w-55 min-w-0 flex-[1_1_220px] flex-col gap-1.5 max-[640px]:col-span-full max-[640px]:max-w-none">
              <label className="text-[10px] font-semibold text-[#65736a]" htmlFor="filter-channel-id">Channel</label>
              <select className="h-9.25 w-full min-w-0 rounded-[5px] border border-[#d9e0d9] bg-white px-2.5 text-[11px] text-[#34443a]" defaultValue={selectedChannelId} id="filter-channel-id" name="channel_id">
                <option value="">All channels</option>
                {channels.map((channel) => (
                  <option key={String(channel.id)} value={String(channel.id)}>
                    {CHANNEL_PLATFORM_LABELS[channel.platform] || channel.platform} · {channel.handle_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex max-w-55 min-w-0 flex-[1_1_180px] flex-col gap-1.5 max-[640px]:max-w-none">
              <label className="text-[10px] font-semibold text-[#65736a]" htmlFor="filter-platform">Platform</label>
              <select className="h-9.25 w-full min-w-0 rounded-[5px] border border-[#d9e0d9] bg-white px-2.5 text-[11px] text-[#34443a]" defaultValue={selectedPlatform} id="filter-platform" name="platform">
                <option value="">All platforms</option>
                {Object.entries(CHANNEL_PLATFORM_LABELS).map(([platformName, label]) => (
                  <option key={platformName} value={platformName}>{label}</option>
                ))}
              </select>
            </div>
            <Button className="h-9.25 rounded-[5px] border-[#d9e0d9] text-[10px] text-[#425248]" type="submit" variant="outline">
              Apply filters
            </Button>
            {hasFilters && (
              <Button asChild className="h-9.25 rounded-[5px] text-[10px] max-[640px]:justify-center" variant="ghost">
                <Link href="/contents">Clear</Link>
              </Button>
            )}
          </form>

          {hasFilters && (
            <div className="mt-3.5 flex flex-wrap items-center gap-1.5 text-[10px] text-[#55665b]">
              <span className="font-semibold text-[#3b4c41]">Active:</span>
              {selectedStatus && (
                <span className="rounded border border-[#dfe8df] bg-[#f0f5f0] px-2 py-0.5">
                  Status: {CONTENT_STATUS_LABELS[selectedStatus]}
                </span>
              )}
              {selectedFormat && (
                <span className="rounded border border-[#dfe8df] bg-[#f0f5f0] px-2 py-0.5">
                  Format: {CONTENT_FORMAT_LABELS[selectedFormat]}
                </span>
              )}
              {selectedChannelId && (
                <span className="rounded border border-[#dfe8df] bg-[#f0f5f0] px-2 py-0.5">
                  Channel: {activeChannel ? `${CHANNEL_PLATFORM_LABELS[activeChannel.platform] || activeChannel.platform} · ${activeChannel.handle_name}` : selectedChannelId}
                </span>
              )}
              {selectedPlatform && (
                <span className="rounded border border-[#dfe8df] bg-[#f0f5f0] px-2 py-0.5">
                  Platform: {CHANNEL_PLATFORM_LABELS[selectedPlatform as keyof typeof CHANNEL_PLATFORM_LABELS] || selectedPlatform}
                </span>
              )}
            </div>
          )}
        </div>

        {displayedContents.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3 max-[640px]:p-3.5">
            {displayedContents.map((content) => {
              const platform = content.channel?.platform || "youtube";
              const PlatformIcon = platformIcons[platform] || Radio;

              return (
                <div
                  key={String(content.id)}
                  className="flex flex-col justify-between rounded-lg border border-[#e2e8e2] bg-white p-4.5 transition-shadow hover:shadow-md"
                >
                  <div>
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-sm bg-[#f1f5f1] px-2 py-0.75 text-[10px] font-medium text-[#3b6b50]">
                        <PlatformIcon size={12} aria-hidden="true" />
                        <span className="truncate max-w-35">{content.channel?.handle_name || "Channel"}</span>
                      </span>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[9px] font-bold tracking-wide uppercase ${statusBadgeClass(
                          content.status
                        )}`}
                      >
                        {CONTENT_STATUS_LABELS[content.status] || content.status}
                      </span>
                    </div>

                    <h3 className="mb-1.5 font-serif text-[17px] font-medium leading-snug text-[#1f2c25]">
                      <Link
                        href={`/contents/${content.id}`}
                        className="no-underline hover:text-[#1c644c] hover:underline"
                      >
                        {content.title}
                      </Link>
                    </h3>

                    {content.description && (
                      <p className="line-clamp-2 text-[11px] leading-relaxed text-[#738077]">
                        {content.description}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 border-t border-[#edf0ed] pt-3">
                    <div className="mb-3 flex flex-wrap items-center gap-1.5">
                      <Badge variant="outline" className="text-[9px] text-[#55635a]">
                        {CONTENT_FORMAT_LABELS[content.format_type] || content.format_type}
                      </Badge>
                      <span
                        className={`rounded-sm border px-1.5 py-0.5 text-[9px] font-medium capitalize ${priorityBadgeClass(
                          content.priority
                        )}`}
                      >
                        {CONTENT_PRIORITY_LABELS[content.priority] || content.priority}
                      </span>
                      {content.scheduled_date && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-[#748279]">
                          <Calendar size={11} aria-hidden="true" />
                          <span>{content.scheduled_date.slice(0, 10)}</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1">
                      <Button asChild size="sm" variant="ghost" className="h-7 text-[10px] text-[#55645a]">
                        <Link href={`/contents/${content.id}/edit`}>
                          <Edit2 size={12} className="mr-1" aria-hidden="true" />
                          Edit
                        </Link>
                      </Button>
                      <Button asChild size="sm" variant="outline" className="h-7 border-[#dce4dc] text-[10px] text-[#245b42]">
                        <Link href={`/contents/${content.id}`}>
                          <Eye size={12} className="mr-1" aria-hidden="true" />
                          Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex min-h-71.25 flex-col items-center justify-center px-5 pb-9.5 pt-7.5 text-center">
            <div className="relative mb-4.25 flex size-14.5 items-center justify-center rounded-full border border-[#e0e9e1] bg-[#f0f5f0] text-[#38775c]" aria-hidden="true">
              <Clapperboard size={24} strokeWidth={1.6} />
              <span className="absolute -right-0.5 -top-px size-2.75 rounded-full border-2 border-white bg-[#e6b94f]" />
            </div>
            <p className="mb-2 text-[9px] font-bold tracking-[0.14em] text-[#6a8a75]">
              {hasFilters ? "FILTERS APPLIED" : "A CLEAR FRAME"}
            </p>
            <h3 className="m-0 font-serif text-[22px] font-normal text-[#24332b]">
              {hasFilters ? "Tidak ada konten yang cocok dengan filter" : "Belum ada konten dibuat"}
            </h3>
            <p className="mt-2.25 max-w-105 text-[12px] leading-relaxed text-[#758078]">
              {hasFilters
                ? "Cobalah menyetel ulang filter status, format, atau channel untuk melihat seluruh item konten."
                : "Mulai perjalanan konten Anda dengan menambahkan ide baru ke dalam pipeline."}
            </p>
            {hasFilters ? (
              <Button asChild className="mt-4.5 h-8.5 rounded-[5px] bg-[#1c644c] px-3.5 text-[11px] text-white" variant="default">
                <Link href="/contents">Reset all filters</Link>
              </Button>
            ) : (
              <Button asChild className="mt-4.5 h-8.5 rounded-[5px] bg-[#1c644c] px-3.5 text-[11px] text-white" variant="default">
                <Link href="/contents/new">
                  <Plus className="mr-1 size-3.5" aria-hidden="true" />
                  Buat konten pertama
                </Link>
              </Button>
            )}

            <div className="mt-5.5 flex items-center justify-center gap-3 border-t border-[#edf0ed] pt-4">
              <span className="text-[8px] font-bold tracking-widest text-[#809087]">INTERACTIVE PREVIEW</span>
              <Button asChild className="h-8 rounded-[5px] border-[#d9e3d9] bg-white text-[9px] text-[#39644a]" variant="outline">
                <Link href="/contents/demo-42">
                  Open sample detail
                  <ArrowRight aria-hidden="true" data-icon="inline-end" />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </section>

      <footer className="mt-5.25 flex justify-between text-[8px] tracking-[0.12em] text-[#87928a] max-[640px]:gap-4.5 max-[640px]:text-[7px]">
        <span>FRAME STUDIO</span>
        <span>PLAN WITH INTENTION. PUBLISH WITH PURPOSE.</span>
      </footer>
    </div>
  );
}

function ContentPipelineFallback() {
  return (
    <div aria-busy="true" className="mx-auto max-w-342.5" role="status">
      <p className="mb-3 text-[10px] font-bold tracking-[0.14em] text-[#53816c]">CONTENT OPERATIONS</p>
      <h1 className="m-0 font-serif text-4xl font-normal text-[#1d2b24]">Loading content pipeline</h1>
    </div>
  );
}

export default function ContentPipelinePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  return (
    <Suspense fallback={<ContentPipelineFallback />}>
      <ContentPipelineContent searchParams={searchParams} />
    </Suspense>
  );
}