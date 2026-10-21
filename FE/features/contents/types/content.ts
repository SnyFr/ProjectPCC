export const CONTENT_STATUSES = [
  "idea",
  "scripting",
  "recording",
  "editing",
  "ready",
  "published",
] as const;

export type ContentStatus = (typeof CONTENT_STATUSES)[number];

export const CONTENT_STATUS_LABELS: Record<ContentStatus, string> = {
  idea: "Idea",
  scripting: "Scripting",
  recording: "Recording",
  editing: "Editing",
  ready: "Ready",
  published: "Published",
};

export const CONTENT_FORMATS = [
  "short_video",
  "long_video",
  "carousel",
  "single_post",
] as const;

export type ContentFormat = (typeof CONTENT_FORMATS)[number];

export const CONTENT_FORMAT_LABELS: Record<ContentFormat, string> = {
  short_video: "Short video",
  long_video: "Long-form video",
  carousel: "Carousel",
  single_post: "Single post",
};

export const CONTENT_PRIORITIES = ["low", "medium", "high"] as const;

export type ContentPriority = (typeof CONTENT_PRIORITIES)[number];

export const CONTENT_PRIORITY_LABELS: Record<ContentPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export function isContentStatus(value: string): value is ContentStatus {
  return CONTENT_STATUSES.some((status) => status === value);
}

export function isContentFormat(value: string): value is ContentFormat {
  return CONTENT_FORMATS.some((format) => format === value);
}

export function isContentPriority(value: string): value is ContentPriority {
  return CONTENT_PRIORITIES.some((priority) => priority === value);
}
