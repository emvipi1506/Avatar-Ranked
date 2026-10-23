"use client";

import { motion } from "framer-motion";
import { Sparkles, Dice5, Eye } from "lucide-react";
import { fadeUp, stagger } from "@/lib/motion";
import { RARITIES_LIST } from "@/lib/rarity";

export default function RarityGuide() {
  return (
    <section
      id="rarity-guide"
      aria-labelledby="rarity-guide-title"
      className="relative mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6 sm:py-24"
    >
      <div className="mx-auto max-w-2xl text-center">
        <span className="font-mono text-xs uppercase tracking-widest text-[#A855F7]">
          RARITY CLASSIFICATION
        </span>
        <h2
          id="rarity-guide-title"
          className="mt-2 font-sans text-3xl font-black uppercase tracking-tight text-white sm:text-4xl"
        >
          BẢNG CẤP BẬC ĐỘ HIẾM
        </h2>
        <p className="mt-3 text-sm text-slate-400 sm:text-base">
          Mỗi avatar khi quét sẽ được mở khóa 1 trong 6 cấp độ gacha. Tỷ lệ rơi tham khảo được quy chuẩn cho toàn bộ người chơi.
        </p>
      </div>

      <motion.div
        variants={stagger(0.08)}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {RARITIES_LIST.map((rarity) => (
          <motion.div
            key={rarity.tier}
            variants={fadeUp}
            whileHover={{ y: -6, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="glass-card group relative overflow-hidden rounded-3xl p-6 transition-all duration-300"
            style={{ borderColor: rarity.borderColor }}
          >
            {/* Top Border Line with Gradient */}
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-1 transition-all duration-300 group-hover:h-1.5"
              style={{ background: rarity.gradient }}
            />

            {/* Ambient Background Glow on Hover */}
            <div
              aria-hidden
              className="pointer-events-none absolute -bottom-10 -right-10 h-32 w-32 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-60"
              style={{ background: rarity.color }}
            />

            {/* Header: Rarity Name & Drop Rate */}
            <div className="flex items-center justify-between">
              <h3
                className="font-sans text-2xl font-black uppercase tracking-tight"
                style={{
                  backgroundImage: rarity.gradient,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {rarity.label}
              </h3>
              <span
                className="rounded-full border px-2.5 py-1 font-mono text-xs font-black uppercase tracking-wider"
                style={{
                  borderColor: rarity.color,
                  color: rarity.color,
                  backgroundColor: `${rarity.color}15`,
                }}
              >
                TỶ LỆ: {rarity.dropRatePercent}%
              </span>
            </div>

            {/* Quote đặc trưng */}
            <p className="mt-3 text-xs font-semibold italic text-slate-300">
              &ldquo;{rarity.quote}&rdquo;
            </p>

            {/* Description */}
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              {rarity.description}
            </p>

            {/* Visual Effect Highlights */}
            <div className="mt-4 flex items-center gap-2 border-t border-white/5 pt-3 text-[11px] text-slate-400">
              <Sparkles className="h-3 w-3 shrink-0" style={{ color: rarity.color }} />
              <span className="truncate">
                {rarity.tier === "MYTHICAL"
                  ? "Cosmic Rift, Camera Shake & Confetti"
                  : rarity.tier === "LEGENDARY"
                  ? "Golden Aura, Explosive Fanfare & Particle"
                  : rarity.tier === "EPIC"
                  ? "Purple Neon Glitch & Hologram Rings"
                  : rarity.tier === "RARE"
                  ? "Azure Energy Vortex & Shimmer"
                  : rarity.tier === "UNCOMMON"
                  ? "Emerald Glow & Gentle Sparkles"
                  : "Minimalist Border & Soft Fade-in"}
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
