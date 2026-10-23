"use client";

import { motion } from "framer-motion";
import { Palette, Sparkles, Smile, Coins, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { CriterionResult, ScoreReport } from "@/types";

interface ScoreBreakdownProps {
  report: ScoreReport;
}

export default function ScoreBreakdown({ report }: ScoreBreakdownProps) {
  const { criteria, total, value: valueBreakdown } = report;

  const items: {
    key: keyof typeof criteria;
    icon: React.ReactNode;
    color: string;
    barColor: string;
    result: CriterionResult;
  }[] = [
    {
      key: "theme",
      icon: <Palette className="h-5 w-5 text-[#46C8FF]" />,
      color: "#46C8FF",
      barColor: "from-[#46C8FF] to-[#0284C7]",
      result: criteria.theme,
    },
    {
      key: "uniqueness",
      icon: <Sparkles className="h-5 w-5 text-[#A855F7]" />,
      color: "#A855F7",
      barColor: "from-[#A855F7] to-[#7E22CE]",
      result: criteria.uniqueness,
    },
    {
      key: "humor",
      icon: <Smile className="h-5 w-5 text-pink-400" />,
      color: "#EC4899",
      barColor: "from-pink-500 to-rose-600",
      result: criteria.humor,
    },
    {
      key: "value",
      icon: <Coins className="h-5 w-5 text-amber-400" />,
      color: "#F59E0B",
      barColor: "from-amber-400 to-yellow-500",
      result: criteria.value,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Weighted Formula Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-white/5 bg-white/[0.02] px-4 py-2.5 font-mono text-xs text-slate-400">
        <span>CÔNG THỨC:</span>
        <span className="text-slate-300">
          Chủ đề (25%) + Độc lạ (25%) + Hài hước (25%) + Đắt tiền (25%)
        </span>
      </div>

      {/* 4 Criteria Cards */}
      {items.map(({ key, icon, barColor, result }, idx) => {
        const isMissing = result.score === null;
        const displayScore = isMissing ? "Chưa có" : `${result.score}`;

        return (
          <div
            key={key}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition duration-200 hover:border-white/20 hover:bg-white/[0.05]"
          >
            {/* Top row: Icon + Titles + Weight + Score */}
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 border border-white/10">
                  {icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-sans text-sm font-extrabold tracking-wide text-white">
                      {result.labelVi}
                    </h4>
                    <span className="rounded-full bg-white/5 px-2 py-0.5 font-mono text-[10px] text-slate-400">
                      × 25%
                    </span>
                    {result.confidence === "low" && (
                      <span className="flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[9px] text-amber-400">
                        <AlertTriangle className="h-2.5 w-2.5" /> Dữ liệu thấp
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400">{result.label}</p>
                </div>
              </div>

              <div className="text-right">
                <span className="font-sans text-2xl font-black text-white">{displayScore}</span>
                {!isMissing && <span className="text-xs text-slate-500">/100</span>}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10 p-[1px]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: isMissing ? "0%" : `${result.score}%` }}
                transition={{ duration: 0.8, delay: 0.1 * idx, ease: "easeOut" }}
                className={`h-full rounded-full bg-gradient-to-r ${barColor}`}
              />
            </div>

            {/* Summary */}
            <p className="mt-2.5 text-xs text-slate-300 leading-relaxed font-medium">
              {result.summary}
            </p>

            {/* Evidence items */}
            {result.evidence.length > 0 && (
              <ul className="mt-2 space-y-1 border-t border-white/5 pt-2 text-[11px] text-slate-400">
                {result.evidence.slice(0, 3).map((ev, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-slate-500 shrink-0">&bull;</span>
                    <span>{ev}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
