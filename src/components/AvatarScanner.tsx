"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, FastForward, Cpu, Shield, Activity, Radio } from "lucide-react";
import { soundManager } from "@/lib/sound";
import type { RobloxUser, ScanPhase } from "@/types";

interface AvatarScannerProps {
  user: RobloxUser;
  imageUrl: string | null;
  phase: ScanPhase; // "init" | "scanning" | "calculating"
  progress: number; // 0 - 100
  onSkip: () => void;
}

const TELEMETRY_LINES = [
  "ROBLOX_API :: AVATAR_METADATA_LOADED [PASS]",
  "PIXEL_SAMPLING: PALETTE_HARMONY_EXTRACTED",
  "CATALOG_270_AESTHETICS: PATTERN_MATCHING",
  "FANDOM_ENGINE: HYPOTHESIS_GENERATION",
  "CROSS_EXAMINATION: CONTRADICTIONS_CHECKED",
  "WEIGHTED_CRITERIA: 35%_THEME_30%_ORIG_25%_HUMOR_10%_ROBUX",
  "DATA_QUALITY_GATE: VERIFYING_COMPLETENESS",
];

export default function AvatarScanner({
  user,
  imageUrl,
  phase,
  progress,
  onSkip,
}: AvatarScannerProps) {
  const [telemetryIndex, setTelemetryIndex] = useState(0);

  // Hiệu ứng âm thanh theo từng Phase
  useEffect(() => {
    if (phase === "init") {
      soundManager.playScanInit();
    } else if (phase === "scanning") {
      soundManager.playLaserSweep();
      const interval = setInterval(() => {
        soundManager.playLaserSweep();
      }, 1000);
      return () => clearInterval(interval);
    } else if (phase === "calculating") {
      soundManager.playCalculatingHum();
    }
  }, [phase]);

  // Telemetry data feed luân chuyển liên tục trong phase scanning
  useEffect(() => {
    if (phase !== "scanning") return;
    const t = setInterval(() => {
      setTelemetryIndex((prev) => (prev + 1) % TELEMETRY_LINES.length);
    }, 400);
    return () => clearInterval(t);
  }, [phase]);

  // Phụ đề trạng thái hiển thị theo từng giai đoạn thực tế
  const getPhaseTitle = () => {
    if (phase === "init") return "ĐANG KHỞI TẠO BỘ QUÉT AI & KẾT NỐI ROBLOX API...";
    if (phase === "scanning") {
      if (progress < 25) return "THU THẬP METADATA TRANG PHỤC & BẢNG MÀU PIXEL...";
      if (progress < 55) return "ĐỐI CHIẾU 270 AESTHETICS & XÂY DỰNG GIẢ THUYẾT FANDOM/COSPLAY...";
      if (progress < 85) return "THẨM ĐỊNH BẰNG CHỨNG CẠNH TRANH, MEME & GIÁ CATALOG...";
      return "CHẤM ĐIỂM 4 TIÊU CHÍ AI (35% - 30% - 25% - 10%)...";
    }
    if (phase === "calculating") return "KẾT HỢP GU CÁ NHÂN (25%) & TÍNH BẬC ĐỘ HIẾM CUỐI CÙNG...";
    return "ĐANG XỬ LÝ...";
  };

  return (
    <div className="glass-card relative mx-auto max-w-2xl overflow-hidden rounded-3xl p-6 sm:p-10">
      {/* Top Bar: Live telemetry indicator & Skip Button */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#46C8FF] opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#46C8FF]" />
          </span>
          <span className="font-mono text-xs uppercase tracking-widest text-[#46C8FF]">
            AI SYSTEM ACTIVE
          </span>
        </div>

        <button
          id="skip-scan-btn"
          type="button"
          onClick={onSkip}
          className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-[#46C8FF] hover:bg-white/10 hover:text-white"
        >
          <FastForward className="h-3.5 w-3.5 text-[#46C8FF]" />
          <span>BỎ QUA ANIMATION</span>
        </button>
      </div>

      {/* Center Avatar Scanning Viewport */}
      <div className="relative mx-auto mt-8 aspect-square w-64 max-w-full sm:w-80">
        {/* Phase 1: Digital Rings appearing */}
        <AnimatePresence>
          {phase === "init" && (
            <motion.div
              initial={{ scale: 0.3, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              className="pointer-events-none absolute inset-0 rounded-full border-2 border-dashed border-[#46C8FF]/80 shadow-[0_0_35px_rgba(70,200,255,0.6)]"
            />
          )}
        </AnimatePresence>

        {/* Phase 2: Rotating Hologram & Sci-Fi Wireframe Overlay */}
        <div
          aria-hidden
          className={`animate-hologram pointer-events-none absolute inset-0 rounded-full border border-dashed transition-colors duration-500 ${
            phase === "calculating" ? "border-[#FF007F]/60" : "border-[#46C8FF]/50"
          }`}
        />
        <div
          aria-hidden
          className="animate-hologram-reverse pointer-events-none absolute inset-5 rounded-full border border-dotted border-[#A855F7]/40"
        />

        {/* 4 Corner Targeting Reticles */}
        <div className="pointer-events-none absolute left-0 top-0 h-6 w-6 border-l-2 border-t-2 border-[#46C8FF]" />
        <div className="pointer-events-none absolute right-0 top-0 h-6 w-6 border-r-2 border-t-2 border-[#46C8FF]" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-6 w-6 border-b-2 border-l-2 border-[#46C8FF]" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-6 w-6 border-b-2 border-r-2 border-[#46C8FF]" />

        {/* Grid / Wireframe background inside box */}
        <div
          aria-hidden
          className="cyber-grid pointer-events-none absolute inset-2 rounded-2xl opacity-60"
        />

        {/* Avatar Image */}
        <div className="relative h-full w-full overflow-hidden rounded-2xl">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={`Quét avatar ${user.displayName}`}
              fill
              priority
              sizes="320px"
              className={`object-contain p-4 transition-all duration-700 ${
                phase === "calculating" ? "brightness-125 filter drop-shadow-[0_0_30px_rgba(168,85,247,0.9)]" : ""
              }`}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <div className="h-3/4 w-3/4 animate-pulse rounded-full bg-white/5" />
            </div>
          )}

          {/* Phase 2: Laser Scanner Beam moving Top to Bottom */}
          {phase === "scanning" && (
            <div
              aria-hidden
              className="animate-laser pointer-events-none absolute inset-x-0 h-28 border-b-2 border-[#46C8FF] bg-gradient-to-b from-transparent via-[#46C8FF]/20 to-[#46C8FF]/40 shadow-[0_10px_30px_rgba(70,200,255,0.8)]"
            />
          )}

          {/* Phase 3: Screen Darkening & Concentrated Energy Ring */}
          <AnimatePresence>
            {phase === "calculating" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[2px]"
              >
                <motion.div
                  animate={{ scale: [1, 1.25, 0.95, 1.15], rotate: 360 }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                  className="h-44 w-44 rounded-full border-2 border-[#FF007F] shadow-[0_0_50px_rgba(255,0,127,0.8)]"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Target User Identifier */}
      <div className="mt-4 text-center">
        <p className="font-sans text-lg font-bold text-white">{user.displayName}</p>
        <p className="font-mono text-xs text-[#46C8FF]">@{user.name}</p>
      </div>

      {/* Phase Status Heading */}
      <div className="mt-6 text-center">
        <h3 className="font-mono text-sm font-extrabold tracking-widest text-[#46C8FF] sm:text-base">
          {getPhaseTitle()}
        </h3>

        {/* Progress Bar (0% -> 100%) */}
        <div className="mx-auto mt-3 h-2.5 w-full max-w-md overflow-hidden rounded-full bg-white/10 p-[1px]">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#46C8FF] via-[#A855F7] to-[#FF007F] shadow-[0_0_15px_rgba(70,200,255,0.7)]"
            animate={{ width: `${progress}%` }}
            transition={{ ease: "easeOut", duration: 0.2 }}
          />
        </div>
        <div className="mx-auto mt-1 flex max-w-md justify-between font-mono text-[11px] text-slate-400">
          <span>SCANNING PROGRESS</span>
          <span className="font-bold text-[#46C8FF]">{Math.round(progress)}%</span>
        </div>
      </div>

      {/* Decorative Telemetry Feed */}
      <div className="mt-6 rounded-xl border border-white/5 bg-black/40 p-3 font-mono text-xs text-slate-400">
        <div className="flex items-center justify-between border-b border-white/5 pb-1 text-[10px] text-slate-500">
          <span className="flex items-center gap-1">
            <Activity className="h-3 w-3 text-[#46C8FF]" /> LIVE TELEMETRY
          </span>
          <span>NODE: SG-01</span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <p className="truncate text-[11px] text-[#46C8FF]">
            &gt; {TELEMETRY_LINES[telemetryIndex]}
          </p>
          <span className="ml-2 inline-block h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
        </div>
      </div>
    </div>
  );
}
