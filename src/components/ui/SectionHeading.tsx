import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export interface SectionHeadingProps {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
  id?: string;
}

export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
  id,
}: SectionHeadingProps) {
  return (
    <div className={cn(align === "center" && "mx-auto text-center", className)}>
      {eyebrow && (
        <p className="font-mono text-[length:var(--fs-xs)] font-bold uppercase tracking-[0.1em] text-coral-ink">
          {eyebrow}
        </p>
      )}
      <h2
        id={id}
        className={cn(
          "mt-2 max-w-[20ch] font-display text-display-md font-extrabold uppercase tracking-[-0.02em] text-ink",
          align === "center" && "mx-auto",
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-3 max-w-[65ch] text-[length:var(--fs-lg)] leading-[1.55] text-ink-2",
            align === "center" && "mx-auto",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
