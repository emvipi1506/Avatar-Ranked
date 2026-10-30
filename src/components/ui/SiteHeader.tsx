"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, Volume2, VolumeX, X } from "lucide-react";
import { soundManager } from "@/lib/sound";
import { cn } from "@/lib/cn";
import { buttonClasses } from "./Button";
import Logo from "./Logo";

export type SiteHeaderVariant = "landing" | "scan" | "preview";

interface NavItem {
  href: string;
  label: string;
}

const NAV: Record<SiteHeaderVariant, NavItem[]> = {
  landing: [
    { href: "/#how-it-works", label: "Cách hoạt động" },
    { href: "/#bang-diem", label: "Bảng điểm" },
    { href: "/leaderboard", label: "BXH" },
    { href: "/#faq", label: "FAQ" },
  ],
  scan: [
    { href: "/", label: "Trang chủ" },
    { href: "/leaderboard", label: "BXH" },
    { href: "/scan", label: "Scan mới" },
  ],
  preview: [
    { href: "#tokens", label: "Tokens" },
    { href: "#components", label: "Components" },
    { href: "/preview/scan", label: "Scan demo" },
  ],
};

export interface SiteHeaderProps {
  variant?: SiteHeaderVariant;
  className?: string;
}

export default function SiteHeader({ variant = "landing", className }: SiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    setMounted(true);
    setMuted(soundManager.getMuted());
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  const toggleSound = () => {
    setMuted(soundManager.toggleMute());
  };

  const navItems = NAV[variant];
  const ctaHref = "/scan";

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-white/10 bg-[rgba(7,8,15,0.78)] backdrop-blur-xl",
        className,
      )}
    >
      <div className="nb-container flex h-[72px] items-center justify-between gap-2 sm:gap-4">
        <Logo href={variant === "preview" ? "/preview" : "/"} />

        <div className="flex items-center gap-2">
          <nav aria-label="Điều hướng chính" className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-full px-3 py-2 font-mono text-[length:var(--fs-xs)] font-bold uppercase tracking-[0.06em] text-muted transition-colors duration-[140ms] hover:bg-white/[0.06] hover:text-white"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {mounted && (
            <button
              type="button"
              onClick={toggleSound}
              aria-pressed={!muted}
              aria-label={muted ? "Bật âm thanh" : "Tắt âm thanh"}
              title={muted ? "Bật âm thanh" : "Tắt âm thanh"}
              className="hidden h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-muted transition-colors hover:border-[rgba(70,200,255,0.4)] hover:text-cyan min-[360px]:grid"
            >
              {muted ? (
                <VolumeX className="h-4 w-4" aria-hidden />
              ) : (
                <Volume2 className="h-4 w-4" aria-hidden />
              )}
            </button>
          )}

          <Link
            href={variant === "preview" ? "/preview/scan" : ctaHref}
            className={buttonClasses({ variant: "primary", size: "sm", className: "hidden sm:inline-flex" })}
          >
            Chấm avatar
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? "Đóng menu" : "Mở menu"}
            className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-ink transition-colors hover:border-[rgba(70,200,255,0.4)] hover:text-cyan lg:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div
          id="mobile-menu"
          className="absolute inset-x-0 top-full border-b border-white/10 bg-[rgba(7,8,15,0.97)] p-4 backdrop-blur-xl lg:hidden"
        >
          <nav aria-label="Điều hướng mobile" className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 font-mono text-xs font-bold uppercase tracking-[0.06em] text-ink transition-colors hover:border-[rgba(70,200,255,0.35)] hover:text-cyan"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href={variant === "preview" ? "/preview/scan" : ctaHref}
              onClick={() => setMenuOpen(false)}
              className={buttonClasses({ variant: "primary", size: "md", fullWidth: true })}
            >
              Chấm avatar
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
