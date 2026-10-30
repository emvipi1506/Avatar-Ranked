import Link from "next/link";
import { Shield } from "lucide-react";
import { cn } from "@/lib/cn";

export interface LogoProps {
  className?: string;
  href?: string;
  tone?: "ink" | "cream";
}

export default function Logo({ className, href = "/", tone = "ink" }: LogoProps) {
  return (
    <Link href={href} className={cn("group inline-flex shrink-0 items-center gap-2.5", className)}>
      <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#46C8FF] via-[#A855F7] to-[#FF007F] p-[1.5px] shadow-[0_0_20px_rgba(70,200,255,0.4)] transition-transform duration-300 group-hover:scale-105">
        <span className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#080A12]">
          <Shield className="h-5 w-5 text-[#46C8FF] transition-transform duration-300 group-hover:rotate-12" aria-hidden />
        </span>
      </span>
      <span className="flex min-w-0 flex-col">
        <span
          className={cn(
            "whitespace-nowrap font-sans text-base font-extrabold uppercase tracking-tight sm:text-lg",
            tone === "cream" ? "text-[var(--c-footer-ink)]" : "text-white",
          )}
        >
          Avatar{" "}
          <span className="bg-gradient-to-r from-[#46C8FF] to-[#A855F7] bg-clip-text text-transparent">
            Ranked
          </span>
        </span>
        <span
          className={cn(
            "mt-0.5 hidden whitespace-nowrap font-mono text-[9px] font-bold uppercase tracking-[0.16em] min-[360px]:block",
            tone === "cream" ? "text-[var(--c-footer-muted)]" : "text-slate-400",
          )}
        >
          Rarity reveal engine
        </span>
      </span>
    </Link>
  );
}
