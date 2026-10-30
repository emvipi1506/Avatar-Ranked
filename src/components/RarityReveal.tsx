"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Sparkles, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { scaleIn, fadeUp } from "@/lib/motion";
import { soundManager } from "@/lib/sound";
import type { RobloxUser, ScoreReport } from "@/types";

interface RarityRevealProps {
  user: RobloxUser;
  imageUrl: string | null;
  report: ScoreReport;
  onComplete: () => void;
}

export default function RarityReveal({
  user,
  imageUrl,
  report,
  onComplete,
}: RarityRevealProps) {
  const { rarity, total } = report;
  const quote = rarity.quote;
  const [revealed, setRevealed] = useState(false);
  const [flash, setFlash] = useState(true);

  useEffect(() => {
    // Phát âm thanh reveal theo cấp độ rarity
    soundManager.playRarityReveal(rarity.tier);

    // Tắt flash sau 300ms
    const flashTimer = setTimeout(() => setFlash(false), 300);

    // Kích hoạt confetti đặc biệt cho LEGENDARY và MYTHICAL
    if (rarity.tier === "MYTHICAL") {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 },
        colors: ["#FF007F", "#A855F7", "#46C8FF", "#FFFFFF", "#FFDF00"],
      });
      // Bắn tiếp đợt 2 tạo cảm giác vũ trụ nổ tung
      setTimeout(() => {
        confetti({
          particleCount: 80,
          spread: 120,
          origin: { y: 0.5 },
          colors: ["#FF007F", "#8B5CF6", "#06B6D4"],
        });
      }, 400);
    } else if (rarity.tier === "LEGENDARY") {
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#FBBF24", "#F59E0B", "#FDE68A", "#FFFFFF"],
      });
    }

    setRevealed(true);

    return () => clearTimeout(flashTimer);
  }, [rarity]);

  // Render các hiệu ứng đặc thù của từng Rarity xung quanh Avatar
  const renderRarityAura = () => {
    switch (rarity.tier) {
      case "COMMON":
        return (
          <div className="pointer-events-none absolute inset-0 rounded-2xl border border-slate-600/40 bg-white/[0.02]" />
        );

      case "UNCOMMON":
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pointer-events-none absolute -inset-4 rounded-3xl border border-emerald-400/40 bg-emerald-500/10 blur-xl"
          />
        );

      case "RARE":
        return (
          <>
            <div className="animate-hologram pointer-events-none absolute -inset-6 rounded-full border-2 border-dashed border-[#38BDF8]/60 shadow-[0_0_40px_rgba(56,189,248,0.5)]" />
            <div className="pointer-events-none absolute -inset-3 rounded-full bg-[#38BDF8]/20 blur-xl" />
          </>
        );

      case "EPIC":
        return (
          <>
            <motion.div
              animate={{ opacity: [0.6, 1, 0.5], scale: [1, 1.05, 0.98] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="pointer-events-none absolute -inset-6 rounded-3xl border border-[#C084FC]/70 bg-[#A855F7]/20 blur-xl shadow-[0_0_50px_rgba(192,132,252,0.6)]"
            />
            <div className="animate-hologram pointer-events-none absolute -inset-8 rounded-full border border-dotted border-[#C084FC]/60" />
          </>
        );

      case "LEGENDARY":
        return (
          <>
            <motion.div
              animate={{ rotate: 360, scale: [1, 1.08, 1] }}
              transition={{ rotate: { duration: 20, repeat: Infinity, ease: "linear" }, scale: { duration: 2, repeat: Infinity } }}
              className="pointer-events-none absolute -inset-10 rounded-full bg-gradient-to-tr from-amber-400/30 via-yellow-300/20 to-transparent blur-2xl"
            />
            <div className="pointer-events-none absolute -inset-3 rounded-3xl border-2 border-amber-400/80 shadow-[0_0_60px_rgba(251,191,36,0.8)]" />
          </>
        );

      case "MYTHICAL":
        return (
          <>
            {/* Cosmic Energy Rift & Shimmering Magic Ring */}
            <motion.div
              animate={{ rotate: -360, scale: [1, 1.15, 0.95] }}
              transition={{ rotate: { duration: 12, repeat: Infinity, ease: "linear" }, scale: { duration: 1.6, repeat: Infinity } }}
              className="pointer-events-none absolute -inset-12 rounded-full bg-gradient-to-r from-[#FF007F]/40 via-[#8B5CF6]/35 to-[#06B6D4]/40 blur-3xl shadow-[0_0_80px_rgba(255,0,127,0.9)]"
            />
            <div className="animate-hologram pointer-events-none absolute -inset-8 rounded-full border-2 border-dashed border-[#FF007F] shadow-[0_0_40px_rgba(255,0,127,0.7)]" />
          </>
        );
    }
  };

  return (
    <div
      className={`glass-card relative mx-auto max-w-2xl overflow-hidden rounded-3xl p-6 sm:p-10 ${
        rarity.tier === "MYTHICAL" ? "animate-camera-shake" : ""
      }`}
    >
      {/* Flash Effect on Reveal */}
      <AnimatePresence>
        {flash && (
          <motion.div
            initial={{ opacity: 0.9 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="pointer-events-none absolute inset-0 z-50 bg-white"
          />
        )}
      </AnimatePresence>

      {/* Top Banner Indicator */}
      <div className="text-center font-mono text-xs uppercase tracking-[0.3em] text-slate-400">
        RARITY DECODED
      </div>

      {/* Center Avatar with Rarity Aura */}
      <div className="relative mx-auto mt-6 aspect-square w-60 max-w-full sm:w-72">
        {renderRarityAura()}

        <div className="relative h-full w-full overflow-hidden rounded-2xl">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={`Avatar của ${user.displayName}`}
              fill
              priority
              sizes="300px"
              className="animate-float object-contain p-3 drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <div className="h-3/4 w-3/4 animate-pulse rounded-full bg-white/5" />
            </div>
          )}
        </div>
      </div>

      {/* Rarity Label with Cinematic Typography */}
      <div className="mt-6 text-center">
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="font-mono text-xs uppercase tracking-widest"
          style={{ color: rarity.color }}
        >
          {rarity.tier === "MYTHICAL" ? "★ SUPREME ENTITY ★" : "RARITY CLASSIFICATION"}
        </motion.p>

        <motion.h2
          variants={scaleIn}
          initial="hidden"
          animate="visible"
          className="mt-1 font-sans text-5xl font-black uppercase tracking-tight sm:text-7xl"
          style={{
            backgroundImage: rarity.gradient,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: `drop-shadow(0 0 25px ${rarity.glowColor})`,
          }}
        >
          {rarity.label}
        </motion.h2>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mt-2 text-sm font-semibold italic text-slate-200 sm:text-base"
        >
          &ldquo;{quote}&rdquo;
        </motion.p>
      </div>

      {/* Score Reveal Counter */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="mx-auto mt-6 max-w-xs rounded-2xl border border-white/10 bg-white/5 p-4 text-center backdrop-blur-md"
      >
        <span className="font-mono text-[11px] uppercase tracking-wider text-slate-400">
          ĐIỂM TỰ ĐỘNG KHÁCH QUAN
        </span>
        <div className="mt-1 flex items-baseline justify-center gap-1.5 font-sans text-5xl font-black text-white sm:text-6xl">
          <span>{total}</span>
          <span className="text-xl font-normal text-slate-500">/100</span>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Công thức: 4 tiêu chí × 25% trọng số đều
        </p>
      </motion.div>

      {/* Continue to Detailed Breakdown Button */}
      <div className="mt-8 flex justify-center">
        <button
          id="reveal-continue-btn"
          type="button"
          onClick={onComplete}
          className="btn-gaming-primary group flex items-center gap-2 rounded-2xl px-8 py-3.5 text-sm font-black tracking-wider text-white uppercase shadow-lg transition duration-200"
        >
          <span>XEM CHI TIẾT KẾT QUẢ</span>
          <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}
