import Link from "next/link";
import { cn } from "@/lib/cn";

export interface LogoProps {
  className?: string;
  href?: string;
  tone?: "ink" | "cream";
}

export default function Logo({ className, href = "/", tone = "ink" }: LogoProps) {
  return (
    <Link href={href} className={cn("group inline-flex shrink-0 items-center gap-2.5", className)}>
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-nb-sm border-3 border-ink bg-lemon font-display text-lg font-extrabold leading-none text-on-accent shadow-hard-1 transition-transform duration-[180ms] group-hover:-rotate-3">
        AR
      </span>
      <span className="flex min-w-0 flex-col leading-none">
        <span
          className={cn(
            "whitespace-nowrap font-display text-base font-extrabold uppercase tracking-[-0.02em] min-[360px]:text-lg",
            tone === "cream" ? "text-[var(--c-footer-ink)]" : "text-ink",
          )}
        >
          Avatar Ranked
        </span>
        <span
          className={cn(
            "mt-1 hidden whitespace-nowrap font-mono text-[10px] font-bold uppercase tracking-[0.12em] min-[360px]:block",
            tone === "cream" ? "text-[var(--c-footer-muted)]" : "text-muted",
          )}
        >
          Roast • Rate • Rank
        </span>
      </span>
    </Link>
  );
}
