import type {
  ContentFormat,
  ContentPriority,
  ContentStatus,
} from "@/features/contents/types/content";
import type { ChannelPlatform } from "@/features/channels/types/channel";

export type ContentMetricValues = {
  views_count: number;
  likes_count: number;
  comments_count: number;
  shares_count: number;
};

export type ContentMetricSnapshot = ContentMetricValues & {
  id: string | number;
  recorded_at: string;
};

export type ChecklistPreviewItem = {
  id: string | number;
  content_id?: string | number;
  task_name: string;
  is_completed: boolean;
  created_at?: string;
};

export type ContentChannelRef = {
  id: string | number;
  platform: ChannelPlatform;
  handle_name: string;
};

export type ContentItem = {
  id: string | number;
  user_id?: string | number;
  channel_id: string | number;
  channel?: ContentChannelRef;
  title: string;
  description?: string | null;
  script_draft?: string | null;
  format_type: ContentFormat;
  status: ContentStatus;
  priority: ContentPriority;
  scheduled_date?: string | null;
  published_date?: string | null;
  published_url?: string | null;
  created_at?: string;
  updated_at?: string;
  checklists_count?: number;
  completed_checklists_count?: number;
};

export type ContentDetailPreviewRecord = {
  id: string | number;
  user_id?: string | number;
  channel_id?: string | number;
  title: string;
  channel?: ContentChannelRef;
  format_type: ContentFormat;
  description: string;
  script_draft: string;
  priority: ContentPriority;
  scheduled_date: string | null;
  published_date: string | null;
  status: ContentStatus;
  published_url?: string | null;
  checklists: ChecklistPreviewItem[];
  metrics: ContentMetricSnapshot[];
};

export type CreateContentPayload = {
  title: string;
  channel_id: string | number;
  format_type: ContentFormat;
  description?: string;
  script_draft?: string;
  priority?: ContentPriority;
  scheduled_date?: string | null;
};

export type UpdateContentPayload = Partial<CreateContentPayload> & {
  status?: ContentStatus;
  published_url?: string | null;
  published_date?: string | null;
};
