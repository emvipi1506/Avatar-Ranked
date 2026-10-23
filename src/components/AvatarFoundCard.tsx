"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Zap, RotateCcw, BadgeCheck, Sparkles } from "lucide-react";
import { fadeUp } from "@/lib/motion";
import { soundManager } from "@/lib/sound";
import type { RobloxUser } from "@/types";

interface AvatarFoundCardProps {
  user: RobloxUser;
  imageUrl: string | null;
  onScan: () => void;
  onCancel: () => void;
}

export default function AvatarFoundCard({
  user,
  imageUrl,
  onScan,
  onCancel,
}: AvatarFoundCardProps) {
  const handleScanClick = () => {
    soundManager.playClick();
    onScan();
  };

  const handleCancelClick = () => {
    soundManager.playClick();
    onCancel();
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
          TARGET ACQUIRED
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
      <div className="relative mx-auto mt-6 aspect-square w-64 max-w-full sm:w-72">
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
      <div className="mt-5 text-center">
        <div className="flex items-center justify-center gap-2">
          <h2 className="font-sans text-2xl font-black text-white sm:text-3xl">
            {user.displayName}
          </h2>
          {user.hasVerifiedBadge && (
            <BadgeCheck className="h-6 w-6 text-[#46C8FF] drop-shadow-[0_0_8px_rgba(70,200,255,0.8)]" />
          )}
        </div>
        <p className="mt-1 font-mono text-sm text-[#46C8FF]">@{user.name}</p>
        <p className="mt-0.5 text-xs text-slate-500">Roblox User ID: #{user.id}</p>
      </div>

      {/* Action Button: SCAN MY AVATAR */}
      <div className="mt-8 flex flex-col items-center">
        <motion.button
          id="scan-my-avatar-btn"
          type="button"
          onClick={handleScanClick}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="btn-gaming-primary group relative flex w-full max-w-md items-center justify-center gap-3 rounded-2xl py-4 text-base font-black tracking-wider text-white uppercase shadow-[0_0_35px_rgba(70,200,255,0.5)] transition duration-200"
        >
          <Zap className="h-5 w-5 text-yellow-300 transition-transform duration-300 group-hover:rotate-12" />
          <span>SCAN MY AVATAR</span>
          <Sparkles className="h-4 w-4 text-white animate-pulse" />
        </motion.button>

        <p className="mt-3 text-center text-xs text-slate-400">
          Nhấn để kích hoạt chuỗi quét AI đa chiều và giải mã độ hiếm Avatar
        </p>
      </div>
    </motion.div>
  );
}
