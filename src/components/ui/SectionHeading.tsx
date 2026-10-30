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
        <p className="font-mono text-[length:var(--fs-xs)] font-bold uppercase tracking-[0.18em] text-[#46C8FF]">
          {eyebrow}
        </p>
      )}
      <h2
        id={id}
        className={cn(
          "mt-2 max-w-[20ch] font-sans text-3xl font-black uppercase tracking-tight text-white sm:text-4xl",
          align === "center" && "mx-auto max-w-[24ch] text-balance",
        )}
      >
        {title}
      </h2>
      {description && (
        <p
          className={cn(
            "mt-3 max-w-[65ch] text-sm leading-relaxed text-slate-400 sm:text-base",
            align === "center" && "mx-auto text-balance",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}
