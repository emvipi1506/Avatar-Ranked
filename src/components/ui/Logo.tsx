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
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[linear-gradient(135deg,#46c8ff_0%,#a855f7_55%,#ff4fd8_100%)] font-display text-lg font-extrabold leading-none text-white shadow-[0_0_26px_rgba(70,200,255,0.35)] transition-transform duration-[180ms] group-hover:scale-105">
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
            tone === "cream" ? "text-[var(--c-footer-muted)]" : "text-cyan",
          )}
        >
          Roast · Rate · Rank
        </span>
      </span>
    </Link>
  );
}
