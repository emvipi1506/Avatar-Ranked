"use client";

import { motion } from "framer-motion";
import type { ScanStep } from "@/types";

interface ScanProgressProps {
  steps: ScanStep[];
  progress: number; // 0 - 100
}

export default function ScanProgress({ steps, progress }: ScanProgressProps) {
  const complete = progress >= 100;
  const activeIndex = Math.min(steps.length - 1, Math.floor((progress / 100) * steps.length));

  return (
    <div className="glass rounded-3xl p-6 sm:p-8">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-display text-2xl font-bold">Đang phân tích avatar</h2>
        <span className="font-mono text-lg text-neon-cyan" aria-live="polite">
          {Math.round(progress)}%
        </span>
      </div>

      <div
        className="mt-4 h-2 overflow-hidden rounded-full bg-white/5"
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-neon-pink via-neon-violet to-neon-cyan"
          animate={{ width: `${progress}%` }}
          transition={{ ease: "easeOut", duration: 0.3 }}
        />
      </div>

      <ul className="mt-6 space-y-3">
        {steps.map((step, i) => {
          const done = complete || i < activeIndex;
          const current = !done && i === activeIndex;
          return (
            <li
              key={step.id}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors duration-300 ${
                current ? "bg-white/5 text-white" : done ? "text-slate-300" : "text-slate-600"
              }`}
            >
              <span className="grid h-6 w-6 shrink-0 place-items-center">
                {done ? (
                  <motion.svg
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    viewBox="0 0 24 24"
                    className="h-5 w-5 fill-none stroke-neon-lime stroke-[3]"
                  >
                    <path d="M5 12.5l4.5 4.5L19 7.5" strokeLinecap="round" strokeLinejoin="round" />
                  </motion.svg>
                ) : current ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-neon-cyan/30 border-t-neon-cyan" />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-slate-700" />
                )}
              </span>
              {step.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
