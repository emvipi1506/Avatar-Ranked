"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { clampScore, formatScore10, scoreAriaLabel } from "@/lib/format";

export interface ScoreDisplayProps {
  score: number;
  label?: string;
  className?: string;
  /** Dùng khi đặt trên nền accent sáng (lemon/mint/coral...). */
  onAccent?: boolean;
  /** Chỉ bật count-up ở màn reveal; mặc định hiển thị ngay giá trị thật. */
  animate?: boolean;
}

export default function ScoreDisplay({
  score,
  label = "FINAL VERDICT",
  className,
  onAccent = false,
  animate = false,
}: ScoreDisplayProps) {
  const target = clampScore(score);
  const [display, setDisplay] = useState(target);

  useEffect(() => {
    if (!animate) {
      setDisplay(target);
      return;
    }

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (reduced || target === 0) {
      setDisplay(target);
      return;
    }

    let frame = 0;
    const start = performance.now();
    const duration = 700;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(target * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, animate]);

  return (
    <div className={cn("inline-block", className)}>
      {label && (
        <p
          className={cn(
            "font-mono text-[length:var(--fs-xs)] font-bold uppercase tracking-[0.1em]",
            onAccent ? "text-on-accent-2" : "text-ink-2",
          )}
        >
          {label}
        </p>
      )}
      <p
        className={cn(
          "mt-1 font-display text-score font-extrabold tabular-nums tracking-[-0.03em]",
          onAccent ? "text-on-accent" : "neon-score",
        )}
      >
        <span aria-hidden>{formatScore10(display)}</span>
        <span aria-hidden className="ml-1 font-mono text-2xl font-bold tracking-normal">
          /10
        </span>
        <span className="sr-only">{scoreAriaLabel(score)}</span>
      </p>
    </div>
  );
}
