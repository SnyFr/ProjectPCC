import { isChannelPlatform, type ChannelPlatform } from "../types/channel.ts";

export type ChannelFormValues = {
  platform: ChannelPlatform | "";
  handle_name: string;
};

export type ChannelFormField = keyof ChannelFormValues;
export type ChannelFormErrors = Partial<Record<ChannelFormField, string>>;

export const initialChannelFormValues: ChannelFormValues = {
  platform: "",
  handle_name: "",
};

export function validateChannelForm(
  values: ChannelFormValues
): ChannelFormErrors {
  const errors: ChannelFormErrors = {};

  if (!isChannelPlatform(values.platform)) {
    errors.platform = "Pilih platform channel yang tersedia.";
  }

  const handleName = values.handle_name.trim();
  if (!handleName) {
    errors.handle_name = "Handle channel wajib diisi.";
  } else if (handleName.length > 100) {
    errors.handle_name = "Handle channel maksimal 100 karakter.";
  }

  return errors;
}
