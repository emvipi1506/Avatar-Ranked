"use client";

import { motion } from "framer-motion";
import { Heart, AlertCircle, CheckCircle2, Equal } from "lucide-react";
import { RARITIES, TIER_ORDER } from "@/lib/rarity";
import type { RarityTier } from "@/types";

interface PersonalTasteSliderProps {
  value: RarityTier;
  onChange: (tier: RarityTier) => void;
  systemTier: RarityTier;
}

export default function PersonalTasteSlider({
  value,
  onChange,
  systemTier,
}: PersonalTasteSliderProps) {
  const currentIndex = TIER_ORDER.indexOf(value);
  const systemIndex = TIER_ORDER.indexOf(systemTier);
  const selectedRarity = RARITIES[value];
  const systemRarity = RARITIES[systemTier];

  const diffSteps = currentIndex - systemIndex;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-500/10 border border-pink-500/30 text-pink-400">
            <Heart className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-sans text-sm font-extrabold tracking-wide text-white">
              E. Hợp gu cá nhân (Personal Taste)
            </h4>
            <p className="text-xs text-slate-400">
              Đánh giá độc lập theo gu thẩm mỹ của bạn — không tính gộp vào điểm tổng khách quan
            </p>
          </div>
        </div>

        {/* Selected badge */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-slate-400">Điểm tham khảo:</span>
          <span
            className="rounded-full px-3 py-1 font-mono text-xs font-black uppercase shadow-sm"
            style={{
              background: selectedRarity.gradient,
              color: value === "COMMON" ? "#0f172a" : "#ffffff",
            }}
          >
            {selectedRarity.label} ({selectedRarity.personalScore} đ)
          </span>
        </div>
      </div>

      {/* 6-step Visual Slider */}
      <div className="mt-6 px-2">
        <div className="relative">
          {/* Progress background line */}
          <div className="h-2 w-full rounded-full bg-white/10">
            <div
              className="h-full rounded-full transition-all duration-200"
              style={{
                width: `${(currentIndex / (TIER_ORDER.length - 1)) * 100}%`,
                background: selectedRarity.gradient,
              }}
            />
          </div>

          {/* Native range input overlay for accessibility */}
          <input
            id="personal-taste-range"
            type="range"
            min={0}
            max={TIER_ORDER.length - 1}
            step={1}
            value={currentIndex}
            onChange={(e) => {
              const idx = Number(e.target.value);
              onChange(TIER_ORDER[idx]);
            }}
            aria-label="Thanh trượt đánh giá hợp gu cá nhân"
            className="absolute inset-0 h-6 w-full cursor-pointer opacity-0"
          />

          {/* 6 Step Nodes */}
          <div className="mt-[-16px] flex justify-between pointer-events-none">
            {TIER_ORDER.map((tier, idx) => {
              const r = RARITIES[tier];
              const isSelected = idx === currentIndex;
              const isSystem = idx === systemIndex;

              return (
                <button
                  key={tier}
                  type="button"
                  onClick={() => onChange(tier)}
                  className="pointer-events-auto flex flex-col items-center group focus:outline-none"
                >
                  <div
                    className={`relative flex h-6 w-6 items-center justify-center rounded-full border-2 transition-transform duration-200 ${
                      isSelected
                        ? "scale-125 border-white shadow-lg"
                        : "border-white/20 bg-[#080A12] hover:border-white/60"
                    }`}
                    style={isSelected ? { background: r.gradient, borderColor: "#ffffff" } : undefined}
                  >
                    {isSystem && (
                      <span
                        className="absolute -top-6 rounded bg-[#46C8FF] px-1 text-[9px] font-bold text-black"
                        title="Bậc tính toán tự động của hệ thống"
                      >
                        AI
                      </span>
                    )}
                  </div>
                  <span
                    className={`mt-2 font-mono text-[10px] font-bold uppercase transition-colors ${
                      isSelected ? "text-white" : "text-slate-500 group-hover:text-slate-300"
                    }`}
                    style={isSelected ? { color: r.color } : undefined}
                  >
                    {r.label}
                  </span>
                  <span className="text-[9px] text-slate-500">{r.personalScore}đ</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Comparison with System Rating */}
      <div className="mt-8 rounded-2xl border border-white/5 bg-black/40 p-3.5 text-xs">
        <div className="flex items-center gap-2">
          {diffSteps === 0 ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <p className="text-slate-300">
                <span className="font-semibold text-emerald-300">Đồng thuận hoàn hảo:</span> Gu thẩm mỹ cá nhân của bạn hoàn toàn trùng khớp với bậc tính toán tự động của hệ thống (<strong style={{ color: systemRarity.color }}>{systemRarity.label}</strong>).
              </p>
            </>
          ) : diffSteps > 0 ? (
            <>
              <AlertCircle className="h-4 w-4 text-pink-400 shrink-0" />
              <p className="text-slate-300">
                <span className="font-semibold text-pink-300">Bạn đánh giá cao hơn hệ thống:</span> Bạn chọn <strong style={{ color: selectedRarity.color }}>{selectedRarity.label}</strong> (cao hơn {diffSteps} bậc so với kết quả tự động <strong style={{ color: systemRarity.color }}>{systemRarity.label}</strong>).
              </p>
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4 text-amber-400 shrink-0" />
              <p className="text-slate-300">
                <span className="font-semibold text-amber-300">Bạn khắt khe hơn hệ thống:</span> Bạn chọn <strong style={{ color: selectedRarity.color }}>{selectedRarity.label}</strong> (thấp hơn {Math.abs(diffSteps)} bậc so với kết quả tự động <strong style={{ color: systemRarity.color }}>{systemRarity.label}</strong>).
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
