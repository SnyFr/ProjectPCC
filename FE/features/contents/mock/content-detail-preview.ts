import type { ContentDetailPreviewRecord } from "@/features/contents/types/content-detail";
import { channelPreviewRecords } from "../../channels/mock/channel-preview.ts";

export const contentDetailPreview: ContentDetailPreviewRecord = {
  id: "demo-42",
  title: "A quiet morning inside the studio",
  channel: {
    ...channelPreviewRecords[0],
  },
  format_type: "short_video",
  description: "A short behind-the-scenes story about turning a rough idea into a finished frame.",
  script_draft: "Open on the studio lights.\nShow the first sketch.\nCut to the final frame.\nClose with the sound of the room going quiet.",
  priority: "medium",
  scheduled_date: "2026-10-30",
  published_date: null,
  status: "editing",
  checklists: [
    { id: "task-01", task_name: "Shape the opening hook", is_completed: true },
    { id: "task-02", task_name: "Record the voiceover", is_completed: true },
    { id: "task-03", task_name: "Add captions and sound mix", is_completed: false },
    { id: "task-04", task_name: "Review the final export", is_completed: false },
  ],
  metrics: [
    {
      id: "snapshot-01",
      recorded_at: "2026-10-08",
      views_count: 1840,
      likes_count: 163,
      comments_count: 21,
      shares_count: 14,
    },
    {
      id: "snapshot-02",
      recorded_at: "2026-10-12",
      views_count: 2675,
      likes_count: 224,
      comments_count: 32,
      shares_count: 27,
    },
  ],
};
