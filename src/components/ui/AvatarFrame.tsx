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
  /** Bỏ khung viền/nền neon để nhường chỗ cho khung riêng (scan viewport, reveal...). */
  bare?: boolean;
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
  bare = false,
}: AvatarFrameProps) {
  const [failed, setFailed] = useState(false);
  const [direct, setDirect] = useState(false);

  useEffect(() => {
    setFailed(false);
    setDirect(false);
  }, [imageUrl]);

  const canUseDirect = Boolean(imageUrl && /^https?:\/\//i.test(imageUrl));
  const useDirect = direct && canUseDirect;
  const useFallback = !imageUrl || failed;
  const src = useFallback ? FALLBACK_AVATAR : imageUrl;

  return (
    <div
      className={cn(
        "relative aspect-square overflow-hidden",
        !bare &&
          "avatar-neon-bg rounded-nb-md border border-[rgba(70,200,255,0.25)] shadow-[0_0_26px_rgba(70,200,255,0.12)]",
        className,
      )}
    >
      <Image
        src={src}
        alt={`Avatar Roblox của ${displayName} (@${username})`}
        fill
        priority={priority}
        sizes={sizes}
        unoptimized={useFallback || useDirect}
        onError={() => {
          // Ảnh qua optimizer của Next có thể lỗi (hết quota, upstream chậm).
          // Thử tải thẳng từ rbxcdn trước khi rơi về placeholder.
          if (canUseDirect && !direct) {
            setDirect(true);
            return;
          }
          setFailed(true);
        }}
        className={cn("object-contain p-1", imageClassName)}
      />

      {useFallback && showFallbackChip && (
        <span className="absolute bottom-2 left-2 rounded-full border border-[rgba(255,209,102,0.35)] bg-warning-bg px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.04em] text-warning">
          {failed ? "Ảnh không tải được" : "Đang tải avatar"}
        </span>
      )}
    </div>
  );
}
