import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type SpeechBubbleTone = "praise" | "roast" | "tip" | "neutral";

const TONE_STYLES: Record<
  SpeechBubbleTone,
  { background: string; strip: string; label: string }
> = {
  praise: {
    background: "var(--c-praise-bg)",
    strip: "bg-mint",
    label: "text-success",
  },
  roast: {
    background: "var(--c-roast-bg)",
    strip: "bg-coral",
    label: "text-danger",
  },
  tip: {
    background: "var(--c-tip-bg)",
    strip: "bg-cyan",
    label: "text-info",
  },
  neutral: {
    background: "var(--c-neutral-bg)",
    strip: "bg-ink",
    label: "text-ink-2",
  },
};

export interface SpeechBubbleProps {
  tone?: SpeechBubbleTone;
  speaker: string;
  children: ReactNode;
  tail?: "left" | "right" | "none";
  icon?: ReactNode;
  className?: string;
}

export default function SpeechBubble({
  tone = "neutral",
  speaker,
  children,
  tail = "left",
  icon,
  className,
}: SpeechBubbleProps) {
  const palette = TONE_STYLES[tone];

  return (
    <div
      className={cn(
        "relative max-w-[560px] rounded-nb-md border-3 border-ink px-5 py-4 shadow-hard-2",
        tail !== "none" &&
          "after:absolute after:-bottom-[10px] after:h-4 after:w-4 after:rotate-45 after:border-b-3 after:border-r-3 after:border-ink after:bg-[var(--bubble-bg)] after:content-['']",
        tail === "left" && "after:left-6",
        tail === "right" && "after:right-6",
        className,
      )}
      style={
        {
          backgroundColor: palette.background,
          "--bubble-bg": palette.background,
        } as CSSProperties
      }
    >
      <span
        aria-hidden
        className={cn("absolute inset-y-0 left-0 w-1.5 border-r-3 border-ink", palette.strip)}
      />
      <div className="pl-2">
        <div className="flex items-center gap-1.5">
          {icon}
          <span
            className={cn(
              "font-mono text-[length:var(--fs-2xs)] font-bold uppercase tracking-[0.08em]",
              palette.label,
            )}
          >
            {speaker}
          </span>
        </div>
        <div className="mt-1 text-[length:var(--fs-md)] leading-[1.55] text-ink">{children}</div>
      </div>
    </div>
  );
}
