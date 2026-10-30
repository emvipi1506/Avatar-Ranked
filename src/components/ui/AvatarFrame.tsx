"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/cn";

export interface AvatarFrameProps {
  displayName: string;
  username: string;
  imageUrl: string | null;
  className?: string;
  imageClassName?: string;
  sizes?: string;
  priority?: boolean;
  showFallbackChip?: boolean;
}

const FALLBACK_AVATAR = "/samples/avatar-blocky.svg";

export default function AvatarFrame({
  displayName,
  username,
  imageUrl,
  className,
  imageClassName,
  sizes = "(max-width: 768px) 80vw, 360px",
  priority = false,
  showFallbackChip = false,
}: AvatarFrameProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [imageUrl]);

  const useFallback = !imageUrl || failed;
  const src = useFallback ? FALLBACK_AVATAR : imageUrl;

  return (
    <div
      className={cn(
        "avatar-neon-bg relative aspect-square overflow-hidden rounded-nb-md border border-[rgba(70,200,255,0.25)] shadow-[0_0_26px_rgba(70,200,255,0.12)]",
        className,
      )}
    >
      <Image
        src={src}
        alt={`Avatar Roblox của ${displayName} (@${username})`}
        fill
        priority={priority}
        sizes={sizes}
        unoptimized={useFallback}
        onError={() => setFailed(true)}
        className={cn("object-contain p-1", imageClassName)}
      />

      {useFallback && showFallbackChip && (
        <span className="absolute bottom-2 left-2 rounded-full border border-[rgba(255,209,102,0.35)] bg-warning-bg px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.04em] text-warning">
          Ảnh không tải được
        </span>
      )}
    </div>
  );
}
