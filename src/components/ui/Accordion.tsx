import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

export interface AccordionProps {
  title: string;
  eyebrow?: string;
  icon?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
  className?: string;
  id?: string;
}

export default function Accordion({
  title,
  eyebrow,
  icon,
  defaultOpen = false,
  children,
  className,
  id,
}: AccordionProps) {
  return (
    <details
      id={id}
      open={defaultOpen}
      className={cn(
        "group rounded-nb-md border-3 border-ink bg-surface shadow-hard-2",
        className,
      )}
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 [&::-webkit-details-marker]:hidden">
        <span className="flex min-w-0 items-center gap-2.5">
          {icon && <span className="shrink-0">{icon}</span>}
          <span className="min-w-0">
            {eyebrow && (
              <span className="block font-mono text-[length:var(--fs-2xs)] font-bold uppercase tracking-[0.08em] text-coral-ink">
                {eyebrow}
              </span>
            )}
            <span className="block font-body text-sm font-bold uppercase tracking-[0.02em] text-ink">
              {title}
            </span>
          </span>
        </span>
        <ChevronDown
          className="h-4 w-4 shrink-0 text-ink transition-transform duration-200 group-open:rotate-180"
          aria-hidden
        />
      </summary>
      <div className="border-t-2 border-line-soft px-4 py-4">{children}</div>
    </details>
  );
}
