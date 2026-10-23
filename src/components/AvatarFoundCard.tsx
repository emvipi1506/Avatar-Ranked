"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Zap, RotateCcw, BadgeCheck, Sparkles, Heart } from "lucide-react";
import { fadeUp } from "@/lib/motion";
import { soundManager } from "@/lib/sound";
import { RARITIES, TIER_ORDER } from "@/lib/rarity";
import type { RarityTier, RobloxUser } from "@/types";

interface AvatarFoundCardProps {
  user: RobloxUser;
  imageUrl: string | null;
  personalTier: RarityTier;
  onPersonalTierChange: (tier: RarityTier) => void;
  onScan: () => void;
  onCancel: () => void;
}

export default function AvatarFoundCard({
  user,
  imageUrl,
  personalTier,
  onPersonalTierChange,
  onScan,
  onCancel,
}: AvatarFoundCardProps) {
  const currentIdx = TIER_ORDER.indexOf(personalTier);
  const selectedRarity = RARITIES[personalTier];

  const handleScanClick = () => {
    soundManager.playClick();
    onScan();
  };

  const handleCancelClick = () => {
    soundManager.playClick();
    onCancel();
  };

  const handleTierSelect = (tier: RarityTier) => {
    soundManager.playClick();
    onPersonalTierChange(tier);
  };

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="glass-card mx-auto mt-6 max-w-xl overflow-hidden rounded-3xl p-6 sm:p-8"
    >
      {/* Top Banner Status */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <span className="flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-[#46C8FF]">
          <span className="h-2 w-2 animate-ping rounded-full bg-[#46C8FF]" />
          TARGET ACQUIRED — READY TO JUDGE
        </span>
        <button
          type="button"
          onClick={handleCancelClick}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-white"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Tìm người khác</span>
        </button>
      </div>

      {/* Avatar Central Display */}
      <div className="relative mx-auto mt-6 aspect-square w-60 max-w-full sm:w-68">
        {/* Holographic Ring Background */}
        <div
          aria-hidden
          className="animate-hologram pointer-events-none absolute inset-0 rounded-full border border-dashed border-[#46C8FF]/40 shadow-[0_0_50px_rgba(70,200,255,0.25)]"
        />
        <div
          aria-hidden
          className="animate-hologram-reverse pointer-events-none absolute inset-4 rounded-full border border-dotted border-[#A855F7]/35"
        />

        {/* Glow backdrop */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-10 rounded-full bg-gradient-to-tr from-[#46C8FF]/20 via-[#A855F7]/25 to-transparent blur-2xl"
        />

        {/* Avatar Image */}
        <div className="relative h-full w-full overflow-hidden rounded-2xl">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={`Roblox Avatar của ${user.displayName}`}
              fill
              priority
              sizes="300px"
              className="animate-float object-contain p-2 drop-shadow-[0_15px_25px_rgba(0,0,0,0.8)]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <div className="h-3/4 w-3/4 animate-pulse rounded-full bg-white/5" />
            </div>
          )}
        </div>
      </div>

      {/* User Information */}
      <div className="mt-4 text-center">
        <div className="flex items-center justify-center gap-2">
          <h2 className="font-sans text-2xl font-black text-white sm:text-3xl">
            {user.displayName}
          </h2>
          {user.hasVerifiedBadge && (
            <BadgeCheck className="h-6 w-6 text-[#46C8FF] drop-shadow-[0_0_8px_rgba(70,200,255,0.8)]" />
          )}
        </div>
        <p className="mt-0.5 font-mono text-sm text-[#46C8FF]">@{user.name}</p>
        <p className="mt-0.5 text-xs text-slate-500">Roblox User ID: #{user.id}</p>
      </div>

      {/* JUDGE MODE SLIDER: CHẤM THEO GU CỦA BẠN (TRỌNG SỐ 25%) */}
      <div className="mt-6 rounded-2xl border border-pink-500/25 bg-gradient-to-b from-pink-500/10 to-transparent p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-500/20 text-pink-400">
              <Heart className="h-4 w-4 fill-pink-400/30" />
            </div>
            <div>
              <h3 className="font-sans text-xs font-black uppercase tracking-wider text-pink-300">
                1. Chấm Theo Gu Của Bạn (25% Tổng Điểm)
              </h3>
              <p className="text-[11px] text-slate-400">
                Bạn thấy avatar này xứng đáng ở mức nào?
              </p>
            </div>
          </div>

          <span
            className="rounded-full px-3 py-1 font-mono text-xs font-black uppercase shadow-sm"
            style={{
              background: selectedRarity.gradient,
              color: personalTier === "COMMON" ? "#0f172a" : "#ffffff",
            }}
          >
            {selectedRarity.label} ({selectedRarity.personalScore}đ)
          </span>
        </div>

        {/* 6 Step Slider */}
        <div className="mt-5 px-1">
          <div className="relative">
            {/* Progress line */}
            <div className="h-2 w-full rounded-full bg-white/10">
              <div
                className="h-full rounded-full transition-all duration-200"
                style={{
                  width: `${(currentIdx / (TIER_ORDER.length - 1)) * 100}%`,
                  background: selectedRarity.gradient,
                }}
              />
            </div>

            <input
              id="initial-personal-taste-range"
              type="range"
              min={0}
              max={TIER_ORDER.length - 1}
              step={1}
              value={currentIdx}
              onChange={(e) => handleTierSelect(TIER_ORDER[Number(e.target.value)])}
              aria-label="Kéo chọn bậc theo gu của bạn"
              className="absolute inset-0 h-6 w-full cursor-pointer opacity-0"
            />

            {/* 6 Step Nodes */}
            <div className="mt-[-16px] flex justify-between pointer-events-none">
              {TIER_ORDER.map((tier, idx) => {
                const r = RARITIES[tier];
                const isSelected = idx === currentIdx;

                return (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => handleTierSelect(tier)}
                    className="pointer-events-auto flex flex-col items-center group focus:outline-none"
                  >
                    <div
                      className={`h-5 w-5 rounded-full border-2 transition-transform duration-200 ${
                        isSelected
                          ? "scale-125 border-white shadow-[0_0_12px_rgba(255,255,255,0.7)]"
                          : "border-white/20 bg-[#080A12] hover:border-white/60"
                      }`}
                      style={isSelected ? { background: r.gradient, borderColor: "#ffffff" } : undefined}
                    />
                    <span
                      className={`mt-1.5 font-mono text-[9px] font-bold uppercase transition-colors ${
                        isSelected ? "text-white" : "text-slate-500 group-hover:text-slate-300"
                      }`}
                      style={isSelected ? { color: r.color } : undefined}
                    >
                      {r.label}
                    </span>
                    <span className="text-[8px] text-slate-500">{r.personalScore}đ</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Action Button: SCAN MY AVATAR */}
      <div className="mt-6 flex flex-col items-center">
        <motion.button
          id="scan-my-avatar-btn"
          type="button"
          onClick={handleScanClick}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="btn-gaming-primary group relative flex w-full max-w-md items-center justify-center gap-3 rounded-2xl py-4 text-sm font-black tracking-wider text-white uppercase shadow-[0_0_35px_rgba(70,200,255,0.5)] transition duration-200 sm:text-base"
        >
          <Zap className="h-5 w-5 text-yellow-300 transition-transform duration-300 group-hover:rotate-12" />
          <span>QUÉT & CHẤM ĐIỂM (AI 75% + GU BẠN 25%)</span>
          <Sparkles className="h-4 w-4 text-white animate-pulse" />
        </motion.button>

        <p className="mt-2.5 text-center text-xs text-slate-400">
          Kết quả cuối cùng = <strong className="text-[#46C8FF]">75% Phân tích AI</strong> + <strong className="text-pink-400">25% Gu Thẩm Mỹ Của Bạn</strong>
        </p>
      </div>
    </motion.div>
  );
}
