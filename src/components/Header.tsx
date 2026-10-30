"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Volume2, VolumeX, Sparkles, Shield, Trophy } from "lucide-react";
import { soundManager } from "@/lib/sound";

export default function Header() {
  const [isMuted, setIsMuted] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsMuted(soundManager.getMuted());
  }, []);

  const handleToggleSound = () => {
    const next = soundManager.toggleMute();
    setIsMuted(next);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080A12]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link
          href="/"
          id="logo-link"
          className="group flex items-center gap-2.5 font-sans font-black tracking-wider text-white"
        >
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#46C8FF] via-[#A855F7] to-[#FF007F] p-[1.5px] shadow-[0_0_20px_rgba(70,200,255,0.4)] transition-transform duration-300 group-hover:scale-105">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#080A12]">
              <Shield className="h-5 w-5 text-[#46C8FF] transition-transform duration-300 group-hover:rotate-12" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-extrabold tracking-tight sm:text-lg">
              AVATAR <span className="bg-gradient-to-r from-[#46C8FF] to-[#A855F7] bg-clip-text text-transparent">RANKED</span>
            </span>
            <span className="hidden text-[9px] font-mono tracking-widest text-slate-400 sm:inline-block">
              RARITY REVEAL ENGINE
            </span>
          </div>
        </Link>

        {/* Navigation & Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          <nav aria-label="Điều hướng trang" className="flex items-center gap-1 text-xs font-semibold sm:text-sm">
            <Link
              id="nav-leaderboard"
              href="/leaderboard"
              className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 font-bold text-amber-300 transition hover:bg-amber-400/10 hover:text-amber-200 sm:px-3 sm:py-2"
            >
              <Trophy className="h-4 w-4 text-amber-400" />
              <span>BXH</span>
            </Link>
            <a
              id="nav-how-it-works"
              href="/#how-it-works"
              className="rounded-lg px-2.5 py-1.5 text-slate-400 transition hover:bg-white/5 hover:text-white sm:px-3 sm:py-2"
            >
              How It Works
            </a>
            <a
              id="nav-rarity"
              href="/#rarity-guide"
              className="rounded-lg px-2.5 py-1.5 text-slate-400 transition hover:bg-white/5 hover:text-white sm:px-3 sm:py-2"
            >
              Rarity Guide
            </a>
          </nav>

          {/* Nút Sound On / Off */}
          {mounted && (
            <button
              id="toggle-sound-btn"
              type="button"
              onClick={handleToggleSound}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-slate-300 transition hover:border-[#46C8FF]/50 hover:bg-white/10 hover:text-white sm:px-3 sm:py-2"
              title={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
              aria-label={isMuted ? "Bật âm thanh" : "Tắt âm thanh"}
            >
              {isMuted ? (
                <>
                  <VolumeX className="h-4 w-4 text-rose-400" />
                  <span className="hidden sm:inline">Sound Off</span>
                </>
              ) : (
                <>
                  <Volume2 className="h-4 w-4 text-[#46C8FF]" />
                  <span className="hidden sm:inline">Sound On</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
