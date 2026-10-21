import type { ContentMetricValues } from "@/features/contents/types/content-detail";

export type MetricField = keyof ContentMetricValues;
export type MetricFormValues = Record<MetricField, string>;
export type MetricFormErrors = Partial<Record<MetricField, string>>;

export const METRIC_FIELDS: MetricField[] = [
  "views_count",
  "likes_count",
  "comments_count",
  "shares_count",
];

export const METRIC_FIELD_LABELS: Record<MetricField, string> = {
  views_count: "Views",
  likes_count: "Likes",
  comments_count: "Comments",
  shares_count: "Shares",
};

export const initialMetricFormValues: MetricFormValues = {
  views_count: "",
  likes_count: "",
  comments_count: "",
  shares_count: "",
};

export function validatePublishedUrl(value: string): boolean {
  try {
    const url = new URL(value.trim());
    return (
      (url.protocol === "http:" || url.protocol === "https:") &&
      Boolean(url.hostname)
    );
  } catch {
    return false;
  }
}

export function validateMetricForm(values: MetricFormValues): MetricFormErrors {
  const errors: MetricFormErrors = {};

  for (const field of METRIC_FIELDS) {
    const value = values[field].trim();
    if (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value))) {
      errors[
        field
      ] = `${METRIC_FIELD_LABELS[field]} harus berupa bilangan bulat non-negatif.`;
    }
  }

  return errors;
}

export function sortMetricHistoryNewestFirst<T extends { recorded_at: string }>(
  snapshots: readonly T[]
): T[] {
  return [...snapshots].sort((first, second) =>
    second.recorded_at.localeCompare(first.recorded_at)
  );
}
