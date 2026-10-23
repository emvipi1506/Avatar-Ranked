import Image from "next/image";
import type { ReactNode } from "react";

interface AvatarPreviewProps {
  imageUrl: string | null;
  name?: string;
  displayName?: string;
  verified?: boolean;
  /** Màu viền phát sáng, ví dụ màu của bậc độ hiếm */
  accent?: string;
  className?: string;
  /** Lớp phủ đặt bên trong khung ảnh (hiệu ứng quét, huy hiệu...) */
  children?: ReactNode;
}

export default function AvatarPreview({
  imageUrl,
  name,
  displayName,
  verified = false,
  accent,
  className = "",
  children,
}: AvatarPreviewProps) {
  return (
    <div className={className}>
      <div
        className="relative aspect-square overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-ink-800 to-ink-950"
        style={accent ? { boxShadow: `0 0 70px -12px ${accent}`, borderColor: `${accent}66` } : undefined}
      >
        <div aria-hidden className="grid-bg absolute inset-0 opacity-70" />
        <div
          aria-hidden
          className="absolute inset-x-10 bottom-6 h-6 rounded-[50%] bg-black/50 blur-md"
        />

        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={`Avatar Roblox của ${name ?? "người chơi"}`}
            fill
            priority
            sizes="(max-width: 768px) 90vw, 420px"
            className="animate-float object-contain p-6"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <div className="h-2/3 w-2/5 animate-pulse rounded-[40%] bg-white/5" />
          </div>
        )}

        {children}
      </div>

      {name && (
        <div className="mt-4 text-center">
          <p className="flex items-center justify-center gap-1.5 font-display text-xl font-bold">
            {displayName ?? name}
            {verified && (
              <svg aria-label="Đã xác minh" viewBox="0 0 24 24" className="h-5 w-5 fill-sky-400">
                <path d="M12 2l2.4 2.2 3.2-.5.9 3.1 2.9 1.5-1 3.1 1 3.1-2.9 1.5-.9 3.1-3.2-.5L12 22l-2.4-2.2-3.2.5-.9-3.1-2.9-1.5 1-3.1-1-3.1 2.9-1.5.9-3.1 3.2.5L12 2zm-1.2 13.6l5.9-5.9-1.4-1.4-4.5 4.5-2.1-2.1-1.4 1.4 3.5 3.5z" />
              </svg>
            )}
          </p>
          <p className="text-sm text-slate-400">@{name}</p>
        </div>
      )}
    </div>
  );
}
