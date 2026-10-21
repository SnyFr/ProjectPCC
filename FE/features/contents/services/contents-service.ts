import { apiClient } from "@/lib/api/client";
import { API_ROUTES } from "@/lib/api/routes";
import type {
  ChecklistPreviewItem,
  ContentDetailPreviewRecord,
  ContentItem,
  ContentMetricSnapshot,
  ContentMetricValues,
  CreateContentPayload,
  UpdateContentPayload,
} from "@/features/contents/types/content-detail";

type DataEnvelope<T> = T | { data: T };

function unwrap<T>(result: DataEnvelope<T>): T {
  if (result && typeof result === "object" && "data" in result) {
    return (result as { data: T }).data;
  }
  return result as T;
}

export async function getContents(filters?: {
  status?: string;
  channel_id?: string | number;
}): Promise<ContentItem[]> {
  const result = await apiClient.get<DataEnvelope<ContentItem[]>>(
    API_ROUTES.contents.list(filters)
  );
  const data = unwrap(result);
  return Array.isArray(data) ? data : [];
}

export async function getContentById(
  id: string | number
): Promise<ContentDetailPreviewRecord> {
  const result = await apiClient.get<DataEnvelope<ContentDetailPreviewRecord>>(
    API_ROUTES.contents.detail(id)
  );
  return unwrap(result);
}

export async function createContent(
  payload: CreateContentPayload
): Promise<ContentDetailPreviewRecord> {
  const result = await apiClient.post<DataEnvelope<ContentDetailPreviewRecord>>(
    API_ROUTES.contents.create,
    payload
  );
  return unwrap(result);
}

export async function updateContent(
  id: string | number,
  payload: UpdateContentPayload
): Promise<ContentDetailPreviewRecord> {
  const result = await apiClient.patch<DataEnvelope<ContentDetailPreviewRecord>>(
    API_ROUTES.contents.update(id),
    payload
  );
  return unwrap(result);
}

export async function deleteContent(id: string | number): Promise<void> {
  await apiClient.delete<void>(API_ROUTES.contents.delete(id));
}

export async function addChecklistItem(
  contentId: string | number,
  task_name: string
): Promise<ChecklistPreviewItem> {
  const result = await apiClient.post<DataEnvelope<ChecklistPreviewItem>>(
    API_ROUTES.contents.checklists.create(contentId),
    { task_name }
  );
  return unwrap(result);
}

export async function toggleChecklistItem(
  checklistId: string | number
): Promise<ChecklistPreviewItem> {
  const result = await apiClient.patch<DataEnvelope<ChecklistPreviewItem>>(
    API_ROUTES.checklists.toggle(checklistId)
  );
  return unwrap(result);
}

export async function recordMetricSnapshot(
  contentId: string | number,
  payload: ContentMetricValues
): Promise<ContentMetricSnapshot> {
  const result = await apiClient.post<DataEnvelope<ContentMetricSnapshot>>(
    API_ROUTES.contents.metrics.create(contentId),
    payload
  );
  return unwrap(result);
}
