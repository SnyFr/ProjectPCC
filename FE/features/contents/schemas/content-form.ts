import type {
  ContentFormat,
  ContentPriority,
} from "@/features/contents/types/content";

export type ContentFormField = "title" | "channel_id" | "format_type";
export type ContentFormValues = {
  title: string;
  channel_id: string;
  format_type: ContentFormat | "";
  description: string;
  script_draft: string;
  priority: ContentPriority;
  scheduled_date: string;
};
export type ContentFormErrors = Partial<Record<ContentFormField, string>>;

export const initialContentFormValues: ContentFormValues = {
  title: "",
  channel_id: "",
  format_type: "",
  description: "",
  script_draft: "",
  priority: "medium",
  scheduled_date: "",
};

export function validateContentForm(
  values: ContentFormValues
): ContentFormErrors {
  const errors: ContentFormErrors = {};

  if (!values.title.trim()) {
    errors.title = "Judul konten wajib diisi.";
  }

  if (!values.channel_id.trim()) {
    errors.channel_id = "Channel ID wajib diisi.";
  }

  if (!values.format_type.trim()) {
    errors.format_type = "Format konten wajib diisi.";
  }

  return errors;
}
