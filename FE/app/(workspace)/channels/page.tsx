"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  Briefcase,
  Camera,
  CheckCircle2,
  CircleAlert,
  Loader2,
  Music2,
  Plus,
  Play,
  Radio,
  RefreshCw,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CHANNEL_PLATFORM_LABELS,
  CHANNEL_PLATFORMS,
  type ChannelPlatform,
  type ChannelRecord,
} from "@/features/channels/types/channel";
import {
  initialChannelFormValues,
  validateChannelForm,
  type ChannelFormErrors,
  type ChannelFormValues,
} from "@/features/channels/schemas/channel-form";
import {
  createChannel,
  getChannels,
} from "@/features/channels/services/channels-service";
import { getErrorMessage } from "@/lib/api/errors";

const platformIcons: Record<
  ChannelPlatform,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  youtube: Play,
  tiktok: Music2,
  instagram: Camera,
  linkedin: Briefcase,
};

function AddChannelDialog({
  onChannelAdded,
}: {
  onChannelAdded: (channel: ChannelRecord) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [values, setValues] = useState<ChannelFormValues>(initialChannelFormValues);
  const [errors, setErrors] = useState<ChannelFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  function handleOpenChange(nextOpen: boolean) {
    setIsOpen(nextOpen);
    if (!nextOpen) {
      setErrors({});
      setErrorMessage("");
      setValues(initialChannelFormValues);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    const nextErrors = validateChannelForm(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createChannel({
        platform: values.platform as ChannelPlatform,
        handle_name: values.handle_name.trim(),
      });
      onChannelAdded(created);
      handleOpenChange(false);
    } catch (err: unknown) {
      const msg = getErrorMessage(err, "Gagal menambahkan channel ke server.");
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="h-9.75 rounded-[5px] bg-[#1c644c] px-3.25 text-[11px] font-semibold text-white hover:bg-[#174f3d]" type="button">
          <Plus aria-hidden="true" data-icon="inline-start" />
          Add channel
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-115 gap-5 rounded-lg max-[640px]:p-5">
        <DialogHeader>
          <p className="m-0 text-[9px] font-bold tracking-[0.14em] text-[#53816c]">CHANNEL DIRECTORY</p>
          <DialogTitle className="font-serif text-[23px] font-normal text-[#203128]">Add a channel</DialogTitle>
          <DialogDescription className="text-[11px] leading-relaxed text-[#718077]">
            Choose a platform and enter the name you use to identify this channel.
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <Alert className="-mt-1 rounded-md border-[#ebc2bf] bg-[#fbf2f1] text-[10px] leading-normal text-[#8c2a24] **:data-[slot=alert-title]:text-[10px] **:data-[slot=alert-description]:text-[10px] **:data-[slot=alert-description]:text-[#8c2a24]" role="alert">
            <CircleAlert aria-hidden="true" className="size-3.5 text-[#bf382f]" />
            <AlertTitle>Gagal Menyimpan</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <form className="flex flex-col gap-4.25" noValidate onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.75">
            <Label htmlFor="channel-platform">Platform</Label>
            <Select
              value={values.platform}
              onValueChange={(value) => {
                setValues((currentValues: ChannelFormValues) => ({
                  ...currentValues,
                  platform: value as ChannelFormValues["platform"],
                }));
                setErrors((currentErrors) => ({ ...currentErrors, platform: undefined }));
                setErrorMessage("");
              }}
            >
              <SelectTrigger
                aria-invalid={Boolean(errors.platform)}
                aria-describedby={errors.platform ? "channel-platform-error" : undefined}
                className="h-10.25 w-full rounded-[5px] border-[#d9e0d9] bg-white text-[11px] text-[#34443a]"
                id="channel-platform"
                disabled={isSubmitting}
              >
                <SelectValue placeholder="Pilih platform" />
              </SelectTrigger>
              <SelectContent>
                {CHANNEL_PLATFORMS.map((platformName) => (
                  <SelectItem key={platformName} value={platformName}>
                    {CHANNEL_PLATFORM_LABELS[platformName]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.75">
            <Label htmlFor="channel-handle-name">Handle channel</Label>
            <Input
              autoComplete="off"
              aria-invalid={Boolean(errors.handle_name)}
              aria-describedby={errors.handle_name ? "channel-handle-error" : undefined}
              id="channel-handle-name"
              maxLength={100}
              disabled={isSubmitting}
              onChange={(event) => {
                setValues((currentValues) => ({ ...currentValues, handle_name: event.target.value }));
                setErrors((currentErrors) => ({ ...currentErrors, handle_name: undefined }));
                setErrorMessage("");
              }}
              placeholder="Contoh: @techcreator"
              value={values.handle_name}
              className="h-10.25 rounded-[5px] border-[#d9e0d9] bg-white text-[11px] text-[#34443a]"
            />
          </div>

          {errors.platform && <p className="-mt-1.75 m-0 text-[10px] text-[#a33e37]" id="channel-platform-error" role="alert">{errors.platform}</p>}
          {errors.handle_name && <p className="-mt-1.75 m-0 text-[10px] text-[#a33e37]" id="channel-handle-error" role="alert">{errors.handle_name}</p>}

          <DialogFooter className="mt-1 gap-2.25 max-[640px]:flex-col-reverse [&_button]:rounded-[5px] [&_button]:text-[10px] max-[640px]:[&_button]:w-full">
            <Button onClick={() => handleOpenChange(false)} type="button" variant="outline" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              className="h-9.75 rounded-[5px] bg-[#1c644c] px-3.25 text-[11px] font-semibold text-white hover:bg-[#174f3d] disabled:opacity-60"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-1.5 size-3.5 animate-spin" aria-hidden="true" />
                  Saving...
                </>
              ) : (
                "Save channel"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function ChannelsPage() {
  const [channels, setChannels] = useState<ChannelRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const fetchChannels = () => {
    setIsLoading(true);
    setLoadError(null);
    getChannels()
      .then((data) => {
        setChannels(data);
      })
      .catch((err: unknown) => {
        const msg = getErrorMessage(err, "Gagal memuat saluran dari server backend.");
        setLoadError(msg);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    let ignore = false;
    getChannels()
      .then((data) => {
        if (!ignore) {
          setChannels(data);
          setIsLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const msg = getErrorMessage(err, "Gagal memuat saluran dari server backend.");
          setLoadError(msg);
          setIsLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, []);

  function handleChannelAdded(newChannel: ChannelRecord) {
    setChannels((prev) => [newChannel, ...prev]);
    setSuccessBanner(`Channel ${newChannel.handle_name} berhasil ditambahkan!`);
    setTimeout(() => {
      setSuccessBanner(null);
    }, 4000);
  }

  return (
    <div className="mx-auto max-w-342.5">
      <div className="mb-7 flex items-center justify-between max-[640px]:flex-col max-[640px]:items-stretch max-[640px]:gap-3.75">
        <div>
          <p className="mb-3 text-[10px] font-bold tracking-[0.14em] text-[#53816c]">YOUR CREATOR NETWORK</p>
          <h1 className="m-0 font-serif text-[clamp(34px,4vw,46px)] font-normal leading-[1.08] text-[#1d2b24] max-[640px]:text-4xl">Channels</h1>
          <p className="mt-2.75 max-w-67.5 text-[12px] leading-relaxed text-[#68746e] sm:text-[13px]">
            Keep the places where you publish in one considered directory.
          </p>
        </div>
        <div className="flex items-center gap-2.5 max-[640px]:self-start">
          <Button
            onClick={fetchChannels}
            disabled={isLoading}
            variant="outline"
            className="h-9.75 rounded-[5px] border-[#d9e0d9] px-2.75 text-[11px] text-[#4d5c52]"
            type="button"
            title="Refresh channels"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} aria-hidden="true" />
            <span className="max-[640px]:hidden">Refresh</span>
          </Button>
          <AddChannelDialog onChannelAdded={handleChannelAdded} />
        </div>
      </div>

      {successBanner && (
        <Alert className="mb-6 rounded-[7px] border-[#d5e4d4] bg-[#f2f6ef] px-3.75 py-3 text-[#345642] **:data-[slot=alert-title]:text-[11px] **:data-[slot=alert-description]:text-[10px]" role="status">
          <CheckCircle2 aria-hidden="true" className="size-4 text-[#358257]" />
          <AlertTitle>Berhasil Ditambahkan</AlertTitle>
          <AlertDescription>{successBanner}</AlertDescription>
        </Alert>
      )}

      {loadError && (
        <Alert className="mb-6 grid-cols-[18px_1fr] items-start rounded-[7px] border-[#ebc2bf] bg-[#fbf2f1] px-3.75 py-3.5 text-[#8c2a24] [&>svg]:mt-px [&>svg]:text-[#bf382f] **:data-[slot=alert-title]:text-[11px] **:data-[slot=alert-title]:font-semibold **:data-[slot=alert-description]:text-[10px] **:data-[slot=alert-description]:leading-normal **:data-[slot=alert-description]:text-[#8c2a24]">
          <CircleAlert aria-hidden="true" />
          <AlertTitle>Koneksi Backend Bermasalah</AlertTitle>
          <AlertDescription>
            {loadError}. Pastikan server backend Anda aktif di endpoint yang terkonfigurasi.
          </AlertDescription>
        </Alert>
      )}

      <section aria-labelledby="channel-directory-title" className="overflow-hidden rounded-lg border border-[#e0e7e0] bg-[rgb(255_255_255/88%)] shadow-[0_12px_32px_rgb(30_56_41/3%)]">
        <div className="flex min-h-19.75 items-center justify-between border-b border-[#e8ede8] px-5.75 py-4 max-[640px]:px-3.75">
          <div>
            <p className="mb-1.75 text-[9px] font-bold tracking-[0.14em] text-[#78877e]">DIRECTORY</p>
            <h2 className="m-0 text-[15px] font-semibold text-[#24332b]" id="channel-directory-title">Connected channels</h2>
          </div>
          <Badge className="h-6 rounded border-[#e2e8e1] bg-[#f3f5f1] text-[9px] text-[#6f7b72]" variant="outline">
            {isLoading ? "SYNCING..." : `${channels.length} CHANNELS`}
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-130 border-collapse">
            <thead>
              <tr>
                <th className="border-b border-[#e8ede8] bg-[#fafbf9] px-5 py-3.25 text-left text-[9px] font-semibold tracking-[0.08em] text-[#758179] uppercase" scope="col">Platform</th>
                <th className="border-b border-[#e8ede8] bg-[#fafbf9] px-5 py-3.25 text-left text-[9px] font-semibold tracking-[0.08em] text-[#758179] uppercase" scope="col">Channel name</th>
                <th className="border-b border-[#e8ede8] bg-[#fafbf9] px-5 py-3.25 text-left text-[9px] font-semibold tracking-[0.08em] text-[#758179] uppercase" scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={3}>
                    <div className="flex min-h-48 flex-col items-center justify-center gap-2.5 py-8 text-center text-[#78837b]">
                      <Loader2 className="size-6 animate-spin text-[#38775c]" aria-hidden="true" />
                      <span className="text-[12px]">Memuat daftar channel dari backend...</span>
                    </div>
                  </td>
                </tr>
              ) : channels.length === 0 ? (
                <tr>
                  <td colSpan={3}>
                    <div className="flex min-h-78.75 flex-col items-center justify-center px-5 py-8.5 text-center max-[640px]:min-h-75 max-[640px]:px-4">
                      <span className="mb-4.25 inline-flex size-13.5 items-center justify-center rounded-full border border-[#dfeae0] bg-[#edf4ee] text-[#38775c]" aria-hidden="true">
                        <Radio size={22} strokeWidth={1.7} />
                      </span>
                      <h3 className="m-0 font-serif text-[21px] font-normal text-[#2c3b32]">Belum ada channel terdaftar</h3>
                      <p className="mt-2 max-w-97.5 text-[11px] leading-relaxed text-[#78837b]">
                        Klik tombol &quot;Add channel&quot; di atas untuk mendaftarkan channel platform YouTube, TikTok, Instagram, atau LinkedIn Anda.
                      </p>
                      <div className="mt-5 flex flex-wrap justify-center gap-2" aria-label="Supported platforms">
                        {CHANNEL_PLATFORMS.map((platformName) => {
                          const PlatformIcon = platformIcons[platformName];
                          return (
                            <span className="inline-flex min-h-7.25 items-center gap-1.5 rounded border border-[#e3e9e2] bg-[#f6f8f5] px-2.25 text-[9px] text-[#56645b]" key={platformName}>
                              <PlatformIcon className={platformName === "youtube" ? "text-[#c13b33]" : platformName === "instagram" ? "text-[#a6507c]" : platformName === "linkedin" ? "text-[#266e9c]" : "text-[#202a25]"} aria-hidden="true" size={14} />
                              {CHANNEL_PLATFORM_LABELS[platformName]}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                channels.map((channel) => {
                  const PlatformIcon = platformIcons[channel.platform] || Radio;
                  return (
                    <tr key={String(channel.id)} className="transition-colors hover:bg-[#fafbfa]">
                      <td className="border-b border-[#e8ede8] px-5 py-3.5 text-left text-[12px] font-medium text-[#2d3b32]">
                        <span className="inline-flex items-center gap-2">
                          <span className="inline-flex size-6 items-center justify-center rounded-sm bg-[#f0f4f0] text-[#3b7458]">
                            <PlatformIcon
                              size={14}
                              className={
                                channel.platform === "youtube"
                                  ? "text-[#c13b33]"
                                  : channel.platform === "instagram"
                                  ? "text-[#a6507c]"
                                  : channel.platform === "linkedin"
                                  ? "text-[#266e9c]"
                                  : "text-[#202a25]"
                              }
                            />
                          </span>
                          <span>{CHANNEL_PLATFORM_LABELS[channel.platform] || channel.platform}</span>
                        </span>
                      </td>
                      <td className="border-b border-[#e8ede8] px-5 py-3.5 text-left text-[12px] text-[#37493d]">
                        <span className="font-semibold">{channel.handle_name}</span>
                      </td>
                      <td className="border-b border-[#e8ede8] px-5 py-3.5 text-left text-[11px] text-[#5c6d62]">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#cde2d3] bg-[#edf6f0] px-2.25 py-0.5 text-[9px] font-semibold text-[#256c49]">
                          <span className="size-1.5 rounded-full bg-[#349c69]" aria-hidden="true" />
                          CONNECTED
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}