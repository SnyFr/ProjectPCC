import { apiClient } from "@/lib/api/client";
import { API_ROUTES } from "@/lib/api/routes";
import type {
  ChannelRecord,
  CreateChannelPayload,
} from "@/features/channels/types/channel";

export async function getChannels(): Promise<ChannelRecord[]> {
  const result = await apiClient.get<ChannelRecord[] | { data: ChannelRecord[] }>(
    API_ROUTES.channels.list
  );

  // Normalize if backend wraps responses in a { data: ... } envelope
  if (Array.isArray(result)) {
    return result;
  }
  if (result && typeof result === "object" && Array.isArray((result as { data: ChannelRecord[] }).data)) {
    return (result as { data: ChannelRecord[] }).data;
  }

  return [];
}

export async function createChannel(payload: CreateChannelPayload): Promise<ChannelRecord> {
  const result = await apiClient.post<ChannelRecord | { data: ChannelRecord }>(
    API_ROUTES.channels.create,
    payload
  );

  if (result && typeof result === "object" && "data" in result && (result as { data: ChannelRecord }).data) {
    return (result as { data: ChannelRecord }).data;
  }

  return result as ChannelRecord;
}
