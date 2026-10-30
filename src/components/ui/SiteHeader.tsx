"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, Volume2, VolumeX, X } from "lucide-react";
import { soundManager } from "@/lib/sound";
import { cn } from "@/lib/cn";
import { buttonClasses } from "./Button";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";

export type SiteHeaderVariant = "landing" | "scan" | "preview";

interface NavItem {
  href: string;
  label: string;
}

const NAV: Record<SiteHeaderVariant, NavItem[]> = {
  landing: [
    { href: "/#how-it-works", label: "Cách hoạt động" },
    { href: "/#bang-diem", label: "Bảng điểm" },
    { href: "/#faq", label: "FAQ" },
  ],
  scan: [
    { href: "/", label: "Trang chủ" },
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
        "sticky top-0 z-50 border-b-3 border-ink bg-cream",
        className,
      )}
    >
      <div className="nb-container flex h-[72px] items-center justify-between gap-2 sm:gap-4">
        <Logo href={variant === "preview" ? "/preview" : "/"} />

        <div className="flex items-center gap-2">
          <nav aria-label="Điều hướng chính" className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-nb-sm px-3 py-2 font-mono text-[length:var(--fs-xs)] font-bold uppercase tracking-[0.06em] text-ink-2 transition-colors duration-[120ms] hover:bg-lemon hover:text-on-accent"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <ThemeToggle />

          {mounted && (
            <button
              type="button"
              onClick={toggleSound}
              aria-pressed={!muted}
              aria-label={muted ? "Bật âm thanh" : "Tắt âm thanh"}
              title={muted ? "Bật âm thanh" : "Tắt âm thanh"}
              className="hidden h-11 w-11 place-items-center rounded-nb-sm border-2 border-ink bg-surface text-ink shadow-hard-1 transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 min-[360px]:grid"
            >
              {muted ? (
                <VolumeX className="h-5 w-5" aria-hidden />
              ) : (
                <Volume2 className="h-5 w-5" aria-hidden />
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
            className="grid h-11 w-11 place-items-center rounded-nb-sm border-2 border-ink bg-surface text-ink shadow-hard-1 md:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div
          id="mobile-menu"
          className="absolute inset-x-0 top-full border-b-3 border-ink bg-cream p-4 shadow-hard-4 md:hidden"
        >
          <nav aria-label="Điều hướng mobile" className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-nb-sm border-2 border-ink bg-surface px-3 py-3 font-mono text-xs font-bold uppercase tracking-[0.06em] text-ink shadow-hard-1"
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
