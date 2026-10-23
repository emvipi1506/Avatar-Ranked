"use client";

import { motion } from "framer-motion";
import { Sparkles, Gem, Smile, HelpCircle } from "lucide-react";
import type { ScoreResult } from "@/types";

interface ScoreBreakdownProps {
  result: ScoreResult;
}

export default function ScoreBreakdown({ result }: ScoreBreakdownProps) {
  const { uniqueness, value, humor, rarity } = result;

  const criteria = [
    {
      item: uniqueness,
      icon: <Sparkles className="h-5 w-5 text-[#46C8FF]" />,
      barColor: "from-[#46C8FF] to-[#0284C7]",
    },
    {
      item: value,
      icon: <Gem className="h-5 w-5 text-amber-400" />,
      barColor: "from-amber-400 to-yellow-500",
    },
    {
      item: humor,
      icon: <Smile className="h-5 w-5 text-[#FF007F]" />,
      barColor: "from-[#FF007F] to-[#A855F7]",
    },
  ];

  return (
    <div className="space-y-4">
      {criteria.map(({ item, icon, barColor }, idx) => (
        <div
          key={item.key}
          className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition duration-200 hover:border-white/20 hover:bg-white/[0.05]"
        >
          {/* Header tiêu chí: Icon + Tiêu đề + Điểm */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 border border-white/10">
                {icon}
              </div>
              <div>
                <h4 className="font-sans text-sm font-extrabold tracking-wide text-white">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-400">{item.subtitle}</p>
              </div>
            </div>

            <div className="font-sans text-xl font-black text-white">
              <span>{item.score}</span>
              <span className="text-xs font-normal text-slate-500">/100</span>
            </div>
          </div>

          {/* Animated Progress Bar */}
          <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-white/10 p-[1px]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${item.score}%` }}
              transition={{ duration: 0.8, delay: 0.1 * idx, ease: "easeOut" }}
              className={`h-full rounded-full bg-gradient-to-r ${barColor}`}
            />
          </div>

          {/* Detail Comment */}
          <p className="mt-2 text-xs text-slate-300">
            &bull; {item.detail}
          </p>
        </div>
      ))}

      {/* Note về điểm số */}
      <div className="flex items-start gap-2 pt-1 text-[11px] text-slate-500">
        <HelpCircle className="h-3.5 w-3.5 shrink-0 mt-0.5 text-slate-400" />
        <p>
          Lưu ý: Tiêu chí VALUE không phải là giá trị Robux hay thị trường thực tế, mà là chỉ số thẩm mỹ cao cấp mang tính giải trí.
        </p>
      </div>
    </div>
  );
}
