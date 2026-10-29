import { cn } from "@/lib/cn";
import { clampScore } from "@/lib/format";

export type ProgressTone = "coral" | "lemon" | "mint";

const TONE_CLASSES: Record<ProgressTone, string> = {
  coral: "bg-coral",
  lemon: "bg-lemon",
  mint: "bg-mint",
};

export interface ProgressBarProps {
  value: number;
  label?: string;
  tone?: ProgressTone;
  className?: string;
  showValue?: boolean;
}

export default function ProgressBar({
  value,
  label = "Tiến trình",
  tone = "coral",
  className,
  showValue = true,
}: ProgressBarProps) {
  const safe = clampScore(value);

  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="mb-1.5 flex items-center justify-between gap-3">
          <span className="font-mono text-[length:var(--fs-2xs)] font-bold uppercase tracking-[0.08em] text-ink-2">
            {label}
          </span>
          {showValue && (
            <span className="font-mono text-[length:var(--fs-2xs)] font-bold tabular-nums text-ink">
              {Math.round(safe)}%
            </span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(safe)}
        className="h-4 w-full rounded-nb-sm border-2 border-ink bg-surface-2 p-[2px]"
      >
        <div
          className={cn("h-full rounded-[4px] transition-[width] duration-200 ease-linear", TONE_CLASSES[tone])}
          style={{ width: `${safe}%` }}
        />
      </div>
    </div>
  );
}
