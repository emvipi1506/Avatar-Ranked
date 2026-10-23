"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  RotateCcw,
  Copy,
  Check,
  Share2,
  ExternalLink,
  BadgeCheck,
  Sparkles,
  Search,
} from "lucide-react";
import ScoreBreakdown from "./ScoreBreakdown";
import { fadeUp, stagger } from "@/lib/motion";
import { soundManager } from "@/lib/sound";
import type { RobloxProfile, RobloxUser, ScoreResult } from "@/types";

interface ResultCardProps {
  user: RobloxUser;
  profile: RobloxProfile;
  imageUrl: string | null;
  result: ScoreResult;
  onScanAgain: () => void;
  onNewSearch: () => void;
}

export default function ResultCard({
  user,
  profile,
  imageUrl,
  result,
  onScanAgain,
  onNewSearch,
}: ResultCardProps) {
  const { rarity, totalScore, normalizedScore, quote, uniqueness, value, humor } = result;
  const [copied, setCopied] = useState(false);

  // Sao chép kết quả text định dạng Discord / Social
  const handleCopyResult = async () => {
    soundManager.playClick();
    const textToCopy = `🎮 AVATAR RANKED RESULT:
👤 ${user.displayName} (@${user.name})
✨ Rarity: [${rarity.label}]
🏆 Total Score: ${totalScore}/300 (${normalizedScore}/100)
🔥 Uniqueness: ${uniqueness.score}/100
💎 Value: ${value.score}/100
😂 Humor: ${humor.score}/100
💬 "${quote}"
⚡ Scan your avatar at: ${typeof window !== "undefined" ? window.location.origin : "https://avatar-ranked.vercel.app"}`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  // Chia sẻ kết quả qua Web Share API nếu trình duyệt hỗ trợ
  const handleShare = async () => {
    soundManager.playClick();
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `Avatar Ranked: ${user.displayName} đạt [${rarity.label}]!`,
          text: `Avatar Roblox của ${user.displayName} đạt ${totalScore}/300 điểm - Xếp hạng [${rarity.label}]! "${quote}"`,
          url: window.location.href,
        });
      } catch {
        // Hủy chia sẻ
      }
    } else {
      handleCopyResult();
    }
  };

  return (
    <motion.div
      variants={stagger(0.1)}
      initial="hidden"
      animate="visible"
      className="glass-card relative mx-auto max-w-4xl overflow-hidden rounded-3xl p-6 sm:p-10"
      style={{
        boxShadow: `0 0 50px -10px ${rarity.glowColor}`,
        borderColor: rarity.borderColor,
      }}
    >
      {/* Top Accent Gradient Line */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-1.5"
        style={{ background: rarity.gradient }}
      />

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Cột trái (5 cols): Avatar & Rarity Badge */}
        <div className="flex flex-col items-center text-center lg:col-span-5">
          {/* Avatar Preview Box */}
          <div
            className="relative aspect-square w-64 max-w-full overflow-hidden rounded-3xl border sm:w-72"
            style={{
              borderColor: rarity.borderColor,
              background: `radial-gradient(circle at center, ${rarity.glowColor} 0%, rgba(8,10,18,0.95) 80%)`,
            }}
          >
            {/* Grid Pattern */}
            <div aria-hidden className="cyber-grid absolute inset-0 opacity-40" />

            {/* Avatar Image */}
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={`Roblox Avatar của ${user.displayName}`}
                fill
                priority
                sizes="300px"
                className="animate-float object-contain p-4 drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)]"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <div className="h-3/4 w-3/4 animate-pulse rounded-full bg-white/5" />
              </div>
            )}

            {/* Corner Rarity Tag */}
            <div
              className="absolute left-3 top-3 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider text-black shadow-lg"
              style={{ background: rarity.gradient }}
            >
              {rarity.label}
            </div>
          </div>

          {/* User Info */}
          <div className="mt-4">
            <div className="flex items-center justify-center gap-1.5">
              <h3 className="font-sans text-2xl font-black text-white">
                {user.displayName}
              </h3>
              {user.hasVerifiedBadge && (
                <BadgeCheck className="h-5 w-5 text-[#46C8FF]" />
              )}
            </div>
            <p className="font-mono text-xs text-[#46C8FF]">@{user.name}</p>
            <p className="text-[11px] text-slate-500">Roblox ID: #{user.id}</p>
          </div>

          {/* Quote nhận xét vui theo Rarity */}
          <div className="mt-4 w-full rounded-2xl border border-white/10 bg-white/5 p-3.5 text-center">
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
              AI VERDICT
            </span>
            <p className="mt-1 text-sm font-semibold italic text-slate-200">
              &ldquo;{quote}&rdquo;
            </p>
          </div>
        </div>

        {/* Cột phải (7 cols): Score Breakdown, Total & Action Buttons */}
        <div className="flex flex-col justify-between lg:col-span-7">
          <div>
            {/* Header: Total Score & Rarity Header */}
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-slate-400">
                  TOTAL SCORE
                </span>
                <div className="flex items-baseline gap-2 font-sans text-5xl font-black text-white sm:text-6xl">
                  <span>{totalScore}</span>
                  <span className="text-xl font-normal text-slate-500">/300</span>
                </div>
              </div>

              <div className="text-right">
                <span className="font-mono text-xs uppercase tracking-widest text-slate-400">
                  RANK STATUS
                </span>
                <p
                  className="font-sans text-3xl font-black uppercase sm:text-4xl"
                  style={{
                    backgroundImage: rarity.gradient,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {rarity.label}
                </p>
                <p className="text-xs text-slate-400">
                  Chuẩn hóa: <span className="font-bold text-white">{normalizedScore}/100</span>
                </p>
              </div>
            </div>

            {/* 3 Tiêu chí Score Breakdown */}
            <div className="mt-6">
              <ScoreBreakdown result={result} />
            </div>
          </div>

          {/* Action Buttons Grid */}
          <div className="mt-8 border-t border-white/10 pt-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {/* Scan Again */}
              <button
                id="btn-scan-again"
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  onScanAgain();
                }}
                className="btn-gaming-primary col-span-2 flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-black tracking-wider text-white uppercase shadow-md transition sm:col-span-1"
              >
                <RotateCcw className="h-4 w-4" />
                <span>SCAN AGAIN</span>
              </button>

              {/* Copy Results */}
              <button
                id="btn-copy-results"
                type="button"
                onClick={handleCopyResult}
                className="btn-gaming-secondary flex items-center justify-center gap-1.5 rounded-xl py-3 text-xs font-bold transition"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span>ĐÃ COPY!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 text-slate-300" />
                    <span>COPY TEXT</span>
                  </>
                )}
              </button>

              {/* Share Results */}
              <button
                id="btn-share-results"
                type="button"
                onClick={handleShare}
                className="btn-gaming-secondary flex items-center justify-center gap-1.5 rounded-xl py-3 text-xs font-bold transition"
              >
                <Share2 className="h-4 w-4 text-[#46C8FF]" />
                <span>CHIA SẺ</span>
              </button>

              {/* View on Roblox */}
              <a
                id="link-view-roblox"
                href={`https://www.roblox.com/users/${user.id}/profile`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-gaming-secondary flex items-center justify-center gap-1.5 rounded-xl py-3 text-xs font-bold transition"
              >
                <ExternalLink className="h-4 w-4 text-slate-300" />
                <span>ROBLOX ↗</span>
              </a>
            </div>

            {/* Tìm kiếm người khác */}
            <div className="mt-4 text-center">
              <button
                id="btn-new-search"
                type="button"
                onClick={() => {
                  soundManager.playClick();
                  onNewSearch();
                }}
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 transition hover:text-[#46C8FF]"
              >
                <Search className="h-3.5 w-3.5" />
                <span>Quét avatar người chơi khác</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
