"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { fadeUp, stagger } from "@/lib/motion";

interface HeroProps {
  children: ReactNode;
}

export default function Hero({ children }: HeroProps) {
  return (
    <section className="relative overflow-hidden pb-12 pt-14 sm:pb-20 sm:pt-20">
      {/* Nền Cyber Grid mờ ảo */}
      <div aria-hidden className="cyber-grid pointer-events-none absolute inset-0" />

      {/* Ánh sáng Neon Ambient */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-10 -translate-x-1/2 h-[350px] w-[500px] rounded-full bg-[#46C8FF]/15 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-1/4 top-32 h-[300px] w-[400px] rounded-full bg-[#A855F7]/15 blur-[120px]"
      />

      <motion.div
        variants={stagger(0.12)}
        initial="hidden"
        animate="visible"
        className="relative mx-auto max-w-4xl px-4 text-center sm:px-6"
      >
        {/* Tagline Badge */}
        <motion.div variants={fadeUp} className="inline-flex items-center gap-2 rounded-full border border-[#46C8FF]/30 bg-[#101528]/80 px-4 py-1.5 shadow-[0_0_15px_rgba(70,200,255,0.2)]">
          <Sparkles className="h-3.5 w-3.5 text-[#46C8FF] animate-pulse" />
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-300">
            YOUR AVATAR. YOUR RARITY. YOUR LEGEND.
          </span>
        </motion.div>

        {/* Big Heading */}
        <motion.h1
          variants={fadeUp}
          className="mt-6 font-sans text-4xl font-black uppercase tracking-tight sm:text-6xl md:text-7xl"
        >
          HOW RARE IS YOUR
          <br />
          <span className="text-neon-title">ROBLOX AVATAR?</span>
        </motion.h1>

        {/* Description */}
        <motion.p
          variants={fadeUp}
          className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-lg"
        >
          Enter your Roblox username and discover your avatar&apos;s rarity. Hệ thống quét AI mô phỏng sẽ phân tích trang phục, phụ kiện và hé lộ cấp bậc huyền thoại của bạn.
        </motion.p>

        {/* Interactive Workspace (Search / Found / Scanner) */}
        <motion.div variants={fadeUp} className="mt-10">
          {children}
        </motion.div>
      </motion.div>
    </section>
  );
}
