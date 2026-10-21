"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  CircleAlert,
  ClipboardCheck,
  ExternalLink,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  CONTENT_FORMAT_LABELS,
  CONTENT_STATUSES,
  CONTENT_STATUS_LABELS,
  type ContentStatus,
} from "@/features/contents/types/content";
import {
  initialMetricFormValues,
  METRIC_FIELDS,
  METRIC_FIELD_LABELS,
  sortMetricHistoryNewestFirst,
  validateMetricForm,
  validatePublishedUrl,
  type MetricFormErrors,
  type MetricFormValues,
  type MetricField,
} from "@/features/contents/schemas/content-detail";
import type {
  ChecklistPreviewItem,
  ContentDetailPreviewRecord,
  ContentMetricSnapshot,
  ContentMetricValues,
} from "@/features/contents/types/content-detail";
import {
  addChecklistItem,
  deleteContent,
  recordMetricSnapshot,
  toggleChecklistItem as apiToggleChecklistItem,
  updateContent,
} from "@/features/contents/services/contents-service";
import { getErrorMessage } from "@/lib/api/errors";

function formatNumber(value: number): string {
  return new Intl.NumberFormat("id-ID").format(value);
}

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

export function ContentDetailPreview({
  content,
  isSample = false,
}: {
  content: ContentDetailPreviewRecord;
  isSample?: boolean;
}) {
  const router = useRouter();

  const [status, setStatus] = useState<ContentStatus>(content.status);
  const [publishedUrl, setPublishedUrl] = useState(content.published_url ?? "");
  const [isPublishDialogOpen, setIsPublishDialogOpen] = useState(false);
  const [publishUrlInput, setPublishUrlInput] = useState(content.published_url ?? "");
  const [publishError, setPublishError] = useState("");
  const [checklist, setChecklist] = useState<ChecklistPreviewItem[]>(content.checklists || []);
  const [newTask, setNewTask] = useState("");
  const [metrics, setMetrics] = useState<ContentMetricValues[]>(content.metrics || []);
  const [metricHistory, setMetricHistory] = useState<ContentMetricSnapshot[]>(() =>
    sortMetricHistoryNewestFirst(content.metrics || [])
  );
  const [metricValues, setMetricValues] = useState<MetricFormValues>(initialMetricFormValues);
  const [metricErrors, setMetricErrors] = useState<MetricFormErrors>({});

  // Loading & confirmation states
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isRecordingMetric, setIsRecordingMetric] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const completedTasks = checklist.filter((item) => item.is_completed).length;
  const checklistProgress = checklist.length === 0 ? 0 : Math.round((completedTasks / checklist.length) * 100);
  const currentStatusIndex = CONTENT_STATUSES.indexOf(status);

  // CCP-04: Toggle checklist item without full page reload
  async function toggleChecklistItem(itemId: string | number, isCompleted: boolean) {
    const previousChecklist = [...checklist];

    // Optimistic UI update
    setChecklist((items) =>
      items.map((item) => (item.id === itemId ? { ...item, is_completed: isCompleted } : item))
    );

    if (isSample) {
      setFeedback({ type: "success", message: "Checklist diperbarui di pratinjau lokal." });
      return;
    }

    try {
      await apiToggleChecklistItem(itemId);
      setFeedback({ type: "success", message: "Checklist berhasil diperbarui di server." });
    } catch (err: unknown) {
      // Rollback on failure
      setChecklist(previousChecklist);
      setFeedback({
        type: "error",
        message: getErrorMessage(err, "Gagal memperbarui status checklist di server."),
      });
    }
  }

  // CCP-04: Add new checklist item
  async function handleAddChecklistItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const task = newTask.trim();
    if (!task) return;

    setIsAddingTask(true);
    setFeedback(null);

    if (isSample) {
      setChecklist((items) => [
        ...items,
        { id: `local-${Date.now()}`, task_name: task, is_completed: false },
      ]);
      setNewTask("");
      setIsAddingTask(false);
      setFeedback({ type: "success", message: "Task ditambahkan ke pratinjau lokal." });
      return;
    }

    try {
      const added = await addChecklistItem(content.id, task);
      setChecklist((items) => [
        ...items,
        {
          id: added.id || `item-${Date.now()}`,
          task_name: added.task_name || task,
          is_completed: added.is_completed ?? false,
        },
      ]);
      setNewTask("");
      setFeedback({ type: "success", message: "Subtugas checklist berhasil ditambahkan!" });
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        message: getErrorMessage(err, "Gagal menambahkan checklist ke server."),
      });
    } finally {
      setIsAddingTask(false);
    }
  }

  function deleteChecklistItem(itemId: string | number) {
    setChecklist((items) => items.filter((item) => item.id !== itemId));
    setFeedback({ type: "success", message: "Checklist item dihapus." });
  }

  function updateMetric(field: MetricField, value: string) {
    setMetricValues((currentValues) => ({ ...currentValues, [field]: value }));
    setMetricErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }));
  }

  // CCP-05: Record snapshot of views, likes, comments, shares
  async function recordMetrics(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateMetricForm(metricValues);
    setMetricErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setIsRecordingMetric(true);
    setFeedback(null);

    const values = Object.fromEntries(
      METRIC_FIELDS.map((field) => [field, Number(metricValues[field])])
    ) as ContentMetricValues;

    if (isSample) {
      const recordedAt = new Date().toISOString().slice(0, 10);
      const snapshot: ContentMetricSnapshot = {
        id: `local-${Date.now()}`,
        recorded_at: recordedAt,
        ...values,
      };

      setMetrics((history) => [...history, values]);
      setMetricHistory((history) => [snapshot, ...history]);
      setMetricValues(initialMetricFormValues);
      setIsRecordingMetric(false);
      setFeedback({ type: "success", message: "Snapshot metrik dicatat di preview lokal." });
      return;
    }

    try {
      const savedSnapshot = await recordMetricSnapshot(content.id, values);
      const recordedAt = savedSnapshot?.recorded_at || new Date().toISOString().slice(0, 10);
      const snapshot: ContentMetricSnapshot = {
        id: savedSnapshot?.id || `snap-${Date.now()}`,
        recorded_at: recordedAt,
        ...values,
      };

      setMetrics((history) => [...history, values]);
      setMetricHistory((history) => [snapshot, ...history]);
      setMetricValues(initialMetricFormValues);
      setFeedback({ type: "success", message: "Snapshot analitik berhasil dicatat di server!" });
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        message: getErrorMessage(err, "Gagal mencatat metrik ke server."),
      });
    } finally {
      setIsRecordingMetric(false);
    }
  }

  // Lifecycle progression
  async function moveToNextStage() {
    if (status === "ready") {
      setPublishUrlInput(publishedUrl);
      setPublishError("");
      setIsPublishDialogOpen(true);
      return;
    }

    const nextStatus = CONTENT_STATUSES[currentStatusIndex + 1];
    if (!nextStatus) return;

    setIsUpdatingStatus(true);
    setFeedback(null);

    if (isSample) {
      setStatus(nextStatus);
      setIsUpdatingStatus(false);
      setFeedback({
        type: "success",
        message: `Status berubah ke ${CONTENT_STATUS_LABELS[nextStatus]} (preview lokal).`,
      });
      return;
    }

    try {
      await updateContent(content.id, { status: nextStatus });
      setStatus(nextStatus);
      setFeedback({
        type: "success",
        message: `Status konten berhasil diperbarui ke ${CONTENT_STATUS_LABELS[nextStatus]}.`,
      });
    } catch (err: unknown) {
      setFeedback({
        type: "error",
        message: getErrorMessage(err, "Gagal memperbarui status konten di backend."),
      });
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  // CCP-05 & TC-03: Publish transition validation
  async function publishContent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const url = publishUrlInput.trim();

    // TC-03: Tolak jika published_url kosong atau bukan tautan valid
    if (!url) {
      setPublishError("Kolom published_url wajib diisi untuk mempublikasikan konten.");
      return;
    }

    if (!validatePublishedUrl(url)) {
      setPublishError("Masukkan tautan URL publikasi yang valid dengan protokol http atau https.");
      return;
    }

    setIsPublishing(true);
    setPublishError("");

    if (isSample) {
      setPublishedUrl(url);
      setStatus("published");
      setIsPublishDialogOpen(false);
      setIsPublishing(false);
      setFeedback({
        type: "success",
        message: "Status dan URL publikasi berhasil diperbarui di preview lokal.",
      });
      return;
    }

    try {
      await updateContent(content.id, {
        status: "published",
        published_url: url,
        published_date: new Date().toISOString().slice(0, 10),
      });

      setPublishedUrl(url);
      setStatus("published");
      setIsPublishDialogOpen(false);
      setFeedback({
        type: "success",
        message: "Konten resmi dipublikasikan! Akses pencatatan metrik sekarang aktif.",
      });
    } catch (err: unknown) {
      const msg = getErrorMessage(err, "Server menolak transisi publikasi.");
      setPublishError(msg);
    } finally {
      setIsPublishing(false);
    }
  }

  // TC-04: Delete content with cascade
  async function handleDeleteContent() {
    setIsDeleting(true);
    setFeedback(null);

    if (isSample) {
      router.push("/contents");
      return;
    }

    try {
      await deleteContent(content.id);
      router.push("/contents");
    } catch (err: unknown) {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setFeedback({
        type: "error",
        message: getErrorMessage(err, "Gagal menghapus konten dari backend."),
      });
    }
  }

  return (
    <div className="mx-auto max-w-330">
      <div className="mb-6 flex items-center justify-between">
        <Button asChild className="-ml-2.5 text-[11px] text-[#65736a]" variant="ghost">
          <Link href="/contents">
            <ArrowLeft aria-hidden="true" className="size-3.75" /> Back to pipeline
          </Link>
        </Button>
        <Button
          onClick={() => setIsDeleteDialogOpen(true)}
          variant="outline"
          className="h-8 border-[#eed5d2] text-[10px] text-[#a13b33] hover:bg-[#fcf3f2] hover:text-[#7f261f]"
          type="button"
        >
          <Trash2 size={13} className="mr-1.5" aria-hidden="true" />
          Delete content
        </Button>
      </div>

      <header className="mb-5.75 flex items-end justify-between gap-5.5 max-[640px]:flex-col max-[640px]:items-start max-[640px]:gap-3.5">
        <div>
          <p className="mb-3 text-[10px] font-bold tracking-[0.14em] text-[#53816c]">CONTENT DETAIL</p>
          <h1 className="m-0 max-w-190 font-serif text-[clamp(31px,3.2vw,42px)] font-normal leading-[1.12] text-[#1d2b24] max-[640px]:text-[34px]">
            {content.title}
          </h1>
          <p className="mt-2.5 flex flex-wrap gap-2.25 text-[11px] text-[#728077]">
            {content.channel?.handle_name || "Channel"} <span className="text-[#b3bdb5]" aria-hidden="true">/</span> {CONTENT_FORMAT_LABELS[content.format_type] || content.format_type}
          </p>
        </div>
        <div className="flex flex-none items-center gap-2.25 max-[640px]:w-full max-[640px]:justify-between">
          <Badge
            className={`h-6.25 rounded text-[8px] font-bold tracking-[0.08em] ${isSample
                ? "border-[#e8dbb3] bg-[#f8f2dd] text-[#796735]"
                : "border-[#d0e5d4] bg-[#edf6ef] text-[#2c724e]"
              }`}
            variant="outline"
          >
            {isSample ? "PREVIEW DATA" : "LIVE BACKEND"}
          </Badge>
          <Button asChild className="h-8.75 rounded-[5px] border-[#dce4dc] bg-white text-[10px] text-[#425248]" variant="outline">
            <Link href={`/contents/${content.id}/edit`}>Edit details</Link>
          </Button>
        </div>
      </header>

      {isSample && (
        <Alert className="mb-5 grid-cols-[18px_1fr] rounded-[7px] border-[#dbe7d8] bg-[#f3f6ef] px-3.5 py-3 text-[#365943] [&>svg]:mt-px [&>svg]:text-[#67875e] **:data-[slot=alert-title]:text-[10px] **:data-[slot=alert-title]:font-semibold **:data-[slot=alert-description]:text-[10px] **:data-[slot=alert-description]:leading-normal **:data-[slot=alert-description]:text-[#64776a]">
          <Sparkles aria-hidden="true" />
          <AlertTitle>Local preview fixture (demo-42)</AlertTitle>
          <AlertDescription>
            Tampilan sampel ini berfungsi secara offline untuk pratinjau alur kerja.
          </AlertDescription>
        </Alert>
      )}

      {feedback && (
        <Alert
          className={`mb-5 rounded-[7px] px-3.5 py-3 text-[11px] ${feedback.type === "success"
              ? "border-[#d5e4d4] bg-[#f2f6ef] text-[#345642]"
              : "border-[#ebc2bf] bg-[#fbf2f1] text-[#8c2a24]"
            }`}
          role={feedback.type === "error" ? "alert" : "status"}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="size-4 text-[#358257]" aria-hidden="true" />
          ) : (
            <CircleAlert className="size-4 text-[#bf382f]" aria-hidden="true" />
          )}
          <AlertTitle>{feedback.type === "success" ? "Berhasil" : "Pemberitahuan"}</AlertTitle>
          <AlertDescription>{feedback.message}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-[minmax(0,1.45fr)_minmax(330px,0.85fr)] items-start gap-5 max-[920px]:grid-cols-1">
        <div className="flex min-w-0 flex-col gap-4.25">
          {/* CCP-04: Checklist Subtugas Produksi */}
          <section aria-labelledby="checklist-title" className="min-w-0 rounded-lg border border-[#e0e7e0] bg-[rgb(255_255_255/92%)] p-5 max-[640px]:px-3.5 max-[640px]:py-4">
            <div className="mb-3.75 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex size-8.5 items-center justify-center rounded-md border border-[#e0e9e1] bg-[#edf4ee] text-[#38775c]">
                  <ClipboardCheck aria-hidden="true" size={17} />
                </span>
                <div>
                  <p className="mb-1.25 text-[8px] font-bold tracking-[0.14em] text-[#78877e]">PRODUCTION</p>
                  <h2 className="m-0 text-sm font-semibold text-[#24332b]" id="checklist-title">Checklist</h2>
                </div>
              </div>
              <span className="whitespace-nowrap text-[9px] text-[#7b877f]">
                {completedTasks} / {checklist.length} complete
              </span>
            </div>

            <Progress aria-label="Checklist completion" className="mb-2 h-1.25 bg-[#e8eee8] **:data-[slot=progress-indicator]:bg-[#438362]" value={checklistProgress} />

            <ul className="m-0 list-none p-0">
              {checklist.length === 0 ? (
                <li className="py-4 text-center text-[11px] text-[#828f86]">
                  Belum ada subtugas produksi. Tambahkan task di bawah.
                </li>
              ) : (
                checklist.map((item) => (
                  <li className="flex min-h-11.75 items-center gap-2.75 border-b border-[#edf0ed]" key={String(item.id)}>
                    <Checkbox
                      className="size-4.25 flex-[0_0_17px] rounded border-[#c5d2c6] data-[state=checked]:border-[#2e7555] data-[state=checked]:bg-[#2e7555] data-[state=checked]:text-white"
                      checked={item.is_completed}
                      id={`checklist-${item.id}`}
                      onCheckedChange={(checked) => toggleChecklistItem(item.id, checked === true)}
                    />
                    <label
                      className={`flex-1 cursor-pointer py-3 text-[11px] leading-normal ${item.is_completed ? "text-[#8a948d] line-through decoration-[#a8b3aa]" : "text-[#435349]"
                        }`}
                      htmlFor={`checklist-${item.id}`}
                    >
                      {item.task_name}
                    </label>
                    {item.is_completed && <Check aria-hidden="true" className="flex-none text-[#4c8968]" size={15} />}
                    <Button
                      aria-label={`Delete checklist item ${item.task_name}`}
                      className="h-7 min-w-7 rounded-[5px] border-[#dce4dc] px-1.5 text-[9px] text-[#5a6d60] hover:text-[#a03830]"
                      onClick={() => deleteChecklistItem(item.id)}
                      type="button"
                      variant="outline"
                    >
                      Delete
                    </Button>
                  </li>
                ))
              )}
            </ul>

            <form className="mt-3.5 flex gap-2" onSubmit={handleAddChecklistItem}>
              <Input
                aria-label="New checklist task"
                maxLength={120}
                disabled={isAddingTask}
                onChange={(event) => setNewTask(event.target.value)}
                placeholder="Add a production task (misal: Rekam B-Roll, Hook naskah selesai)"
                value={newTask}
                className="h-9.25 rounded-[5px] border-[#dce4dc] text-[11px]"
              />
              <Button
                aria-label="Add checklist task"
                className="size-9.25 flex-[0_0_37px] rounded-[5px] border-[#dce4dc] text-[#42654f]"
                disabled={!newTask.trim() || isAddingTask}
                size="icon"
                type="submit"
                variant="outline"
              >
                {isAddingTask ? <Loader2 className="size-3.5 animate-spin" /> : <Plus aria-hidden="true" />}
              </Button>
            </form>
          </section>

          <section aria-labelledby="brief-title" className="min-w-0 rounded-lg border border-[#e0e7e0] bg-[rgb(255_255_255/92%)] p-5 max-[640px]:px-3.5 max-[640px]:py-4">
            <div className="mb-3.75 flex items-center justify-between gap-3">
              <div>
                <p className="mb-1.25 text-[8px] font-bold tracking-[0.14em] text-[#78877e]">CREATIVE BRIEF</p>
                <h2 className="m-0 text-sm font-semibold text-[#24332b]" id="brief-title">Description & script</h2>
              </div>
              <Button asChild className="h-7.5 px-2.25 text-[10px] text-[#557260]" variant="ghost">
                <Link href={`/contents/${content.id}/edit`}>Edit</Link>
              </Button>
            </div>
            <p className="m-0 text-[11px] leading-[1.7] text-[#55645a]">
              {content.description || <span className="italic text-[#88948c]">Belum ada deskripsi konten.</span>}
            </p>
            <p className="mt-3 text-[10px] text-[#78837b]">
              Priority: <span className="font-semibold capitalize text-[#3d5045]">{content.priority}</span>
              <span aria-hidden="true"> · </span>
              Scheduled: {content.scheduled_date ? content.scheduled_date.slice(0, 10) : "Not set"}
            </p>
            {content.script_draft ? (
              <pre className="mt-3.75 wrap-break-word whitespace-pre-wrap border-l-2 border-[#cbdccb] bg-[#f7f9f6] px-3.5 py-3 font-sans text-[10px] leading-[1.8] text-[#57665c]">
                {content.script_draft}
              </pre>
            ) : null}
          </section>

          {publishedUrl && (
            <section aria-labelledby="published-link-title" className="min-w-0 rounded-lg border border-[#cde5d6] bg-[#f5faf6] p-5 max-[640px]:px-3.5 max-[640px]:py-4">
              <div>
                <p className="mb-1.25 text-[8px] font-bold tracking-[0.14em] text-[#3e7855]">PUBLISHED LINK</p>
                <h2 className="m-0 text-sm font-semibold text-[#204a32]" id="published-link-title">Public URL</h2>
              </div>
              <a className="mt-3 flex items-center gap-2 text-[11px] font-medium text-[#1c644c] no-underline hover:underline" href={publishedUrl} rel="noreferrer" target="_blank">
                <span className="min-w-0 break-all">{publishedUrl}</span>
                <ExternalLink aria-hidden="true" size={15} />
              </a>
            </section>
          )}
        </div>

        <aside className="flex min-w-0 flex-col gap-4.25 max-[920px]:grid max-[920px]:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] max-[640px]:flex">
          {/* Status & Lifecycle Transition */}
          <section aria-labelledby="status-title" className="min-w-0 rounded-lg border border-[#e0e7e0] bg-[rgb(255_255_255/92%)] p-5 max-[640px]:px-3.5 max-[640px]:py-4">
            <div className="mb-3.75 flex items-center justify-between gap-3">
              <div>
                <p className="mb-1.25 text-[8px] font-bold tracking-[0.14em] text-[#78877e]">LIFECYCLE</p>
                <h2 className="m-0 text-sm font-semibold text-[#24332b]" id="status-title">Production status</h2>
              </div>
            </div>
            <Badge className={`mb-3.5 h-6.25 rounded text-[9px] ${statusBadgeClass(status)}`} variant="outline">
              {CONTENT_STATUS_LABELS[status]}
            </Badge>
            <ol className="mb-4.5 ml-1.25 flex list-none flex-col border-l border-[#dfe7df] p-0">
              {CONTENT_STATUSES.map((stage, index) => (
                <li
                  className={`relative flex min-h-7.75 items-center gap-2.5 pl-3 text-[10px] ${index === currentStatusIndex ? "font-semibold text-[#365843]" : "text-[#89948c]"
                    }`}
                  aria-current={index === currentStatusIndex ? "step" : undefined}
                  key={stage}
                >
                  <span
                    className={`absolute -left-1.25 size-2.25 rounded-full border-2 border-white ${index <= currentStatusIndex ? "bg-[#448564] shadow-[0_0_0_1px_#448564]" : "bg-[#d7e0d8]"
                      }`}
                  />
                  <span>{CONTENT_STATUS_LABELS[stage]}</span>
                </li>
              ))}
            </ol>

            <Button
              className="h-9.5 w-full bg-[#1c644c] text-[10px] font-semibold text-white hover:bg-[#174f3d] disabled:opacity-50"
              disabled={status === "published" || isUpdatingStatus}
              onClick={moveToNextStage}
              type="button"
            >
              {isUpdatingStatus ? (
                <>
                  <Loader2 className="mr-1.5 size-3.5 animate-spin" /> Updating stage...
                </>
              ) : status === "ready" ? (
                "Add URL & publish"
              ) : status === "published" ? (
                "Content is published"
              ) : (
                <>
                  Move to next stage
                  <ArrowRight aria-hidden="true" className="ml-1.5 size-3.5" />
                </>
              )}
            </Button>
          </section>

          {/* CCP-05: Record Performance Metrics */}
          <section aria-labelledby="metrics-title" className="min-w-0 rounded-lg border border-[#e0e7e0] bg-[rgb(255_255_255/92%)] p-5 max-[640px]:px-3.5 max-[640px]:py-4">
            <div className="mb-3.75 flex items-end justify-between gap-3">
              <div>
                <p className="mb-1.25 text-[8px] font-bold tracking-[0.14em] text-[#78877e]">PERFORMANCE</p>
                <h2 className="m-0 text-sm font-semibold text-[#24332b]" id="metrics-title">Record metrics</h2>
              </div>
              <span className="whitespace-nowrap text-[9px] text-[#7b877f]">
                {metrics.length} snapshot{metrics.length !== 1 ? "s" : ""}
              </span>
            </div>

            {status !== "published" && (
              <p className="mb-3 rounded border border-[#f0e3c5] bg-[#fbf8ee] p-2 text-[10px] text-[#8c6722]">
                Pencatatan metrik diaktifkan penuh setelah konten bertransisi ke status <strong>Published</strong>.
              </p>
            )}

            <form className="border-b border-[#e9eee8] pb-4.25" noValidate onSubmit={recordMetrics}>
              <div className="grid grid-cols-2 gap-3 max-[640px]:gap-2.5">
                {METRIC_FIELDS.map((field) => (
                  <div className="flex min-w-0 flex-col gap-1.5" key={field}>
                    <Label htmlFor={`metric-${field}`}>{METRIC_FIELD_LABELS[field]}</Label>
                    <Input
                      aria-invalid={Boolean(metricErrors[field])}
                      aria-describedby={metricErrors[field] ? `metric-${field}-error` : undefined}
                      id={`metric-${field}`}
                      inputMode="numeric"
                      min="0"
                      disabled={isRecordingMetric}
                      onChange={(event) => updateMetric(field, event.target.value)}
                      type="number"
                      value={metricValues[field]}
                      className="h-8.75 rounded-[5px] border-[#dce4dc] bg-white px-2.25 text-[11px] text-[#34443a] aria-invalid:border-[#bd5149]"
                    />
                    {metricErrors[field] && (
                      <p className="m-0 text-[9px] leading-normal text-[#a33e37]" id={`metric-${field}-error`}>
                        {metricErrors[field]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              <Button
                className="mt-3 h-8.25 w-full rounded-[5px] border-[#d9e2da] text-[9px] text-[#42604d]"
                type="submit"
                variant="outline"
                disabled={isRecordingMetric}
              >
                {isRecordingMetric ? (
                  <>
                    <Loader2 className="mr-1.5 size-3 animate-spin" /> Recording snapshot...
                  </>
                ) : (
                  "Record snapshot"
                )}
              </Button>
            </form>

            <div className="mb-2.25 mt-4 flex items-center justify-between">
              <h3 className="m-0 text-[10px] font-semibold text-[#415147]">Metrics history</h3>
              <span className="text-[8px] text-[#929c94]">Newest first</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-110 border-collapse">
                <thead>
                  <tr>
                    <th className="px-1.5 py-2 text-right text-[8px] font-semibold text-[#87928a] first:text-left" scope="col">Date</th>
                    <th className="px-1.5 py-2 text-right text-[8px] font-semibold text-[#87928a]" scope="col">Views</th>
                    <th className="px-1.5 py-2 text-right text-[8px] font-semibold text-[#87928a]" scope="col">Likes</th>
                    <th className="px-1.5 py-2 text-right text-[8px] font-semibold text-[#87928a]" scope="col">Comments</th>
                    <th className="px-1.5 py-2 text-right text-[8px] font-semibold text-[#87928a]" scope="col">Shares</th>
                  </tr>
                </thead>
                <tbody>
                  {metricHistory.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-[10px] text-[#86948b]">
                        Belum ada riwayat snapshot analitik tercatat.
                      </td>
                    </tr>
                  ) : (
                    metricHistory.map((snapshot) => (
                      <tr key={String(snapshot.id)}>
                        <td className="whitespace-nowrap border-t border-[#edf0ed] px-1.5 py-2.25 text-left text-[9px] text-[#536259]">
                          <time dateTime={snapshot.recorded_at}>{snapshot.recorded_at}</time>
                        </td>
                        <td className="whitespace-nowrap border-t border-[#edf0ed] px-1.5 py-2.25 text-right text-[9px] text-[#536259]">{formatNumber(snapshot.views_count)}</td>
                        <td className="whitespace-nowrap border-t border-[#edf0ed] px-1.5 py-2.25 text-right text-[9px] text-[#536259]">{formatNumber(snapshot.likes_count)}</td>
                        <td className="whitespace-nowrap border-t border-[#edf0ed] px-1.5 py-2.25 text-right text-[9px] text-[#536259]">{formatNumber(snapshot.comments_count)}</td>
                        <td className="whitespace-nowrap border-t border-[#edf0ed] px-1.5 py-2.25 text-right text-[9px] text-[#536259]">{formatNumber(snapshot.shares_count)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </aside>
      </div>

      {/* Publish Dialog Modal (TC-03) */}
      <Dialog open={isPublishDialogOpen} onOpenChange={setIsPublishDialogOpen}>
        <DialogContent className="max-w-110 gap-4.5 rounded-lg max-[640px]:p-5">
          <DialogHeader>
            <p className="mb-1.25 text-[8px] font-bold tracking-[0.14em] text-[#78877e]">FINAL STEP</p>
            <DialogTitle className="font-serif text-[22px] font-normal text-[#24332b]">Publish this content?</DialogTitle>
            <DialogDescription className="text-[10px] leading-normal text-[#718077]">
              Masukkan tautan URL publikasi (YouTube/TikTok/IG/LinkedIn) sebelum konten berstatus Published.
            </DialogDescription>
          </DialogHeader>
          <form className="flex flex-col gap-4.25" noValidate onSubmit={publishContent}>
            <div className="flex min-w-0 flex-col gap-1.5">
              <Label htmlFor="published-url">
                Published URL <span className="text-[#a33e37]">*</span>
              </Label>
              <Input
                aria-invalid={Boolean(publishError)}
                aria-describedby={publishError ? "published-url-error" : undefined}
                autoComplete="url"
                id="published-url"
                inputMode="url"
                disabled={isPublishing}
                onChange={(event) => {
                  setPublishUrlInput(event.target.value);
                  setPublishError("");
                }}
                placeholder="https://..."
                type="url"
                value={publishUrlInput}
                className="h-9.75 rounded-[5px] border-[#d9e0d9] bg-white text-[11px]"
              />
              {publishError && (
                <p className="m-0 text-[10px] leading-normal text-[#a33e37]" id="published-url-error">
                  {publishError}
                </p>
              )}
            </div>
            <DialogFooter className="gap-2 max-[640px]:flex-col-reverse [&_button]:rounded-[5px] [&_button]:text-[10px] max-[640px]:[&_button]:w-full">
              <Button onClick={() => setIsPublishDialogOpen(false)} type="button" variant="outline" disabled={isPublishing}>
                Cancel
              </Button>
              <Button
                className="h-9.5 rounded-[5px] bg-[#1c644c] text-[10px] font-semibold text-white hover:bg-[#174f3d] disabled:opacity-60"
                type="submit"
                disabled={isPublishing}
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="mr-1.5 size-3.5 animate-spin" /> Publishing...
                  </>
                ) : (
                  "Confirm & Publish"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Content Modal (TC-04) */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-105 gap-4 rounded-lg max-[640px]:p-5">
          <DialogHeader>
            <DialogTitle className="font-serif text-[20px] text-[#8e2b24]">Hapus Konten Ini?</DialogTitle>
            <DialogDescription className="text-[11px] leading-relaxed text-[#68736b]">
              Tindakan ini akan menghapus konten <strong>&quot;{content.title}&quot;</strong> beserta seluruh subtugas checklist dan riwayat log metrik secara permanen (Cascade Delete).
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 max-[640px]:flex-col-reverse [&_button]:rounded-[5px] [&_button]:text-[10px]">
            <Button onClick={() => setIsDeleteDialogOpen(false)} type="button" variant="outline" disabled={isDeleting}>
              Batal
            </Button>
            <Button
              className="bg-[#ad332b] text-white hover:bg-[#8f241d] disabled:opacity-60"
              onClick={handleDeleteContent}
              type="button"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-1.5 size-3 animate-spin" /> Menghapus...
                </>
              ) : (
                "Ya, Hapus Konten"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}