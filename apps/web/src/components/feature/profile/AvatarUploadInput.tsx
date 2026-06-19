"use client";

import { useRef, useState } from "react";
import { Camera, X } from "@phosphor-icons/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUploadAvatar, useRemoveAvatar } from "@/hooks/user/useUploadAvatar";
import { AvatarCropModal } from "./AvatarCropModal";
import { cn } from "@/lib/utils";

const MAX_SIZE_BYTES = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

interface AvatarUploadInputProps {
  currentAvatarUrl?: string;
  initials?: string;
}

export function AvatarUploadInput({
  currentAvatarUrl,
  initials = "U",
}: AvatarUploadInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [rawSrc, setRawSrc] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { mutate: upload, isPending: uploading } = useUploadAvatar();
  const { mutate: remove, isPending: removing } = useRemoveAvatar();
  const isPending = uploading || removing;

  const displayUrl = preview ?? currentAvatarUrl ?? undefined;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) return;
    if (file.size > MAX_SIZE_BYTES) return;

    const objectUrl = URL.createObjectURL(file);
    if (rawSrc) URL.revokeObjectURL(rawSrc);
    setRawSrc(objectUrl);

    e.target.value = "";
  }

  function handleCrop(blob: Blob) {
    const croppedUrl = URL.createObjectURL(blob);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(croppedUrl);

    const file = new File([blob], "avatar.jpg", { type: "image/jpeg" });
    upload(file, {
      onSuccess: () => {
        setPreview(null);
        URL.revokeObjectURL(croppedUrl);
      },
      onError: () => {
        setPreview(null);
        URL.revokeObjectURL(croppedUrl);
      },
    });
  }

  function handleCropCancel() {
    if (rawSrc) {
      URL.revokeObjectURL(rawSrc);
      setRawSrc(null);
    }
  }

  function handleRemove(e: React.MouseEvent) {
    e.stopPropagation();
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
    remove();
  }

  return (
    <>
      <div className="flex items-center gap-4">
        <div className="relative">
          <button
            type="button"
            disabled={isPending}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "group relative h-20 w-20 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isPending && "opacity-60 cursor-not-allowed",
            )}
            aria-label="Change avatar"
          >
            <Avatar className="h-20 w-20">
              {displayUrl && <AvatarImage src={displayUrl} alt="Avatar" />}
              <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
            </Avatar>
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <Camera size={24} className="text-white" />
            </span>
            {isPending && (
              <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              </span>
            )}
          </button>

          {displayUrl && !isPending && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accent-foreground shadow hover:bg-destructive/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Remove avatar"
            >
              <X size={10} weight="bold" />
            </button>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium">Profile photo</p>
          <p className="text-xs text-muted-foreground">
            JPG, PNG, WEBP or GIF · max 10 MB
          </p>
          <button
            type="button"
            disabled={isPending}
            onClick={() => inputRef.current?.click()}
            className="text-xs text-primary underline-offset-2 hover:underline disabled:opacity-50"
          >
            {displayUrl ? "Change photo" : "Upload photo"}
          </button>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {rawSrc && (
        <AvatarCropModal
          imageSrc={rawSrc}
          open={!!rawSrc}
          onClose={handleCropCancel}
          onCrop={handleCrop}
        />
      )}
    </>
  );
}
