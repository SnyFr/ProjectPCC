export const CHANNEL_PLATFORMS = [
  "youtube",
  "tiktok",
  "instagram",
  "linkedin",
] as const;

export type ChannelPlatform = (typeof CHANNEL_PLATFORMS)[number];

export type ChannelRecord = {
  id: string | number;
  user_id?: string | number;
  platform: ChannelPlatform;
  handle_name: string;
  created_at?: string;
};

export type CreateChannelPayload = {
  platform: ChannelPlatform;
  handle_name: string;
};

export const CHANNEL_PLATFORM_LABELS: Record<ChannelPlatform, string> = {
  youtube: "YouTube",
  tiktok: "TikTok",
  instagram: "Instagram",
  linkedin: "LinkedIn",
};

export function isChannelPlatform(value: string): value is ChannelPlatform {
  return CHANNEL_PLATFORMS.some((platform) => platform === value);
}
