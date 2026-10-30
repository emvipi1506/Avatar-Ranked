import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

export type StampTone = "roast" | "praise" | "legendary" | "mythical" | "neutral";
export type StampSize = "sm" | "md" | "lg";

const TONE_CLASSES: Record<StampTone, string> = {
  roast: "bg-coral text-on-accent",
  praise: "bg-mint text-on-accent",
  legendary: "bg-lemon text-on-accent",
  mythical: "bg-coral text-on-accent",
  neutral: "bg-surface-2 text-ink",
};

const SIZE_CLASSES: Record<StampSize, string> = {
  sm: "h-24 w-24 p-2 text-xs",
  md: "h-32 w-32 p-3 text-sm",
  lg: "h-40 w-40 p-4 text-lg",
};

export interface StampProps {
  label: string;
  tone?: StampTone;
  size?: StampSize;
  rotation?: number;
  animate?: boolean;
  className?: string;
}

export default function Stamp({
  label,
  tone = "roast",
  size = "md",
  rotation = -8,
  animate = false,
  className,
}: StampProps) {
  return (
    <span
      className={cn(
        "nb-stamp relative inline-flex shrink-0 items-center justify-center rounded-nb-sm border-3 border-ink text-center font-display font-extrabold uppercase leading-[0.95] tracking-[-0.01em]",
        "before:pointer-events-none before:absolute before:inset-[5px] before:rounded-[4px] before:border-2 before:border-ink before:content-['']",
        TONE_CLASSES[tone],
        SIZE_CLASSES[size],
        animate && "nb-stamp-slam",
        className,
      )}
      style={{ "--stamp-rotate": `${rotation}deg` } as CSSProperties}
    >
      <span className="relative z-10">{label}</span>
    </span>
  );
}
