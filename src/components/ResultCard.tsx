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
  Search,
  AlertTriangle,
  Sparkles,
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
  Info,
  Tag,
  Coins,
} from "lucide-react";
import ScoreBreakdown from "./ScoreBreakdown";
import PersonalTasteSlider from "./PersonalTasteSlider";
import { RARITIES, TIER_ORDER } from "@/lib/rarity";
import { soundManager } from "@/lib/sound";
import { fadeUp, stagger } from "@/lib/motion";
import type { RarityTier, RobloxProfile, RobloxUser, ScoreReport } from "@/types";

interface ResultCardProps {
  user: RobloxUser;
  profile: RobloxProfile;
  imageUrl: string | null;
  report: ScoreReport;
  personalTier: RarityTier;
  onPersonalTierChange: (tier: RarityTier) => void;
  onScanAgain: () => void;
  onNewSearch: () => void;
}

export default function ResultCard({
  user,
  profile,
  imageUrl,
  report,
  personalTier,
  onPersonalTierChange,
  onScanAgain,
  onNewSearch,
}: ResultCardProps) {
  const {
    rarity: systemRarity,
    total,
    criteria,
    dataQuality,
    value: valueBreakdown,
    dominantStyle,
    styles,
    strengths,
    weaknesses,
    nextTier,
    mythicalAdvice,
    limitations,
  } = report;

  const [copied, setCopied] = useState(false);
  const [showValueDetails, setShowValueDetails] = useState(false);

  const selectedPersonalRarity = RARITIES[personalTier];

  const handleCopyResult = async () => {
    soundManager.playClick();
    const textToCopy = `🎮 AVATAR RANKED REPORT:
👤 ${user.displayName} (@${user.name})
✨ Bậc tự động: [${systemRarity.label}] (Tổng điểm: ${total}/100)
💖 Bậc hợp gu cá nhân: [${selectedPersonalRarity.label}] (${selectedPersonalRarity.personalScore} đ)
🎨 Phong cách: ${dominantStyle?.label ?? "Tự do"}
📊 Chi tiết 4 tiêu chí:
  • Chủ đề & Hài hòa: ${criteria.theme.score ?? "N/A"}/100
  • Độc lạ & Sáng tạo: ${criteria.uniqueness.score ?? "N/A"}/100
  • Hài hước & Meme: ${criteria.humor.score ?? "N/A"}/100
  • Giá trị Robux: ${criteria.value.score ?? "N/A"}/100 (R$ ${valueBreakdown.totalRobux.toLocaleString("vi-VN")})
🌐 Quét avatar của bạn tại: ${typeof window !== "undefined" ? window.location.origin : "https://avatar-ranked-roblox.vercel.app"}`;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback
    }
  };

  const handleShare = async () => {
    soundManager.playClick();
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `Avatar Ranked: ${user.displayName} đạt [${systemRarity.label}] (${total}/100)`,
          text: `Avatar Roblox của ${user.displayName} đạt xếp hạng [${systemRarity.label}] với ${total}/100 điểm trên Avatar Ranked!`,
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
      variants={stagger(0.08)}
      initial="hidden"
      animate="visible"
      className="glass-card relative mx-auto max-w-5xl overflow-hidden rounded-3xl p-6 sm:p-10"
      style={{
        boxShadow: `0 0 50px -10px ${systemRarity.glowColor}`,
        borderColor: systemRarity.borderColor,
      }}
    >
      {/* Top Accent Gradient Line */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-1.5"
        style={{ background: systemRarity.gradient }}
      />

      {/* CẢNH BÁO CHẤT LƯỢNG DỮ LIỆU (NẾU THIẾU DỮ LIỆU HOẶC BỊ ÁP TRẦN) */}
      {dataQuality.level !== "complete" && (
        <motion.div
          variants={fadeUp}
          className="mb-6 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 text-xs text-amber-300"
        >
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400 mt-0.5" />
            <div>
              <p className="font-bold text-amber-200">
                Thông báo: Kết quả phân tích dựa trên dữ liệu chưa đầy đủ
              </p>
              <ul className="mt-1 list-disc list-inside space-y-0.5 text-amber-300/90">
                {dataQuality.issues.map((iss, i) => (
                  <li key={i}>{iss}</li>
                ))}
              </ul>
              {dataQuality.capApplied && (
                <p className="mt-2 font-semibold text-amber-200">
                  ⚠️ Theo quy tắc bảo vệ tính chính xác, bậc tự động bị giới hạn tối đa ở LEGENDARY khi dữ liệu chưa được xác minh đầy đủ 100%.
                </p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* MAIN TOP GRID: AVATAR PREVIEW + SUMMARY */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* CỘT TRÁI (5 cols): AVATAR & TIÊU CHÍ NHẬN DIỆN */}
        <div className="flex flex-col items-center text-center lg:col-span-5">
          {/* Avatar Box */}
          <div
            className="relative aspect-square w-64 max-w-full overflow-hidden rounded-3xl border sm:w-72"
            style={{
              borderColor: systemRarity.borderColor,
              background: `radial-gradient(circle at center, ${systemRarity.glowColor} 0%, rgba(8,10,18,0.95) 80%)`,
            }}
          >
            <div aria-hidden className="cyber-grid absolute inset-0 opacity-40" />

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

            {/* Corner Badge */}
            <div
              className="absolute left-3 top-3 rounded-full px-3 py-1 text-[11px] font-black uppercase tracking-wider text-black shadow-lg"
              style={{ background: systemRarity.gradient }}
            >
              {systemRarity.label}
            </div>
          </div>

          {/* User Info */}
          <div className="mt-4">
            <div className="flex items-center justify-center gap-1.5">
              <h3 className="font-sans text-2xl font-black text-white">{user.displayName}</h3>
              {user.hasVerifiedBadge && <BadgeCheck className="h-5 w-5 text-[#46C8FF]" />}
            </div>
            <p className="font-mono text-xs text-[#46C8FF]">@{user.name}</p>
            <p className="text-[11px] text-slate-500">Roblox User ID: #{user.id}</p>
          </div>

          {/* Dominant Style Tag */}
          {dominantStyle && (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[#46C8FF]/30 bg-[#46C8FF]/10 px-3 py-1 text-xs font-semibold text-[#46C8FF]">
              <Tag className="h-3.5 w-3.5" />
              <span>Phong cách: {dominantStyle.label}</span>
            </div>
          )}

          {/* Cosplay Detection Badge */}
          {report.cosplayDetections && report.cosplayDetections.length > 0 && (
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-pink-500/40 bg-pink-500/15 px-3 py-1 text-xs font-bold text-pink-300 shadow-[0_0_15px_rgba(236,72,153,0.35)] animate-pulse">
              <Sparkles className="h-3.5 w-3.5 text-pink-400" />
              <span>Cosplay: {report.cosplayDetections[0].character} ({report.cosplayDetections[0].franchise})</span>
            </div>
          )}

          {/* Quote nhận xét vui theo Rarity */}
          <div className="mt-4 w-full rounded-2xl border border-white/10 bg-white/5 p-3.5 text-center">
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400">
              VERDICT
            </span>
            <p className="mt-1 text-sm font-semibold italic text-slate-200">
              &ldquo;{systemRarity.quote}&rdquo;
            </p>
          </div>
        </div>

        {/* CỘT PHẢI (7 cols): TOTAL SCORE + 5 CRITERIA */}
        <div className="flex flex-col justify-between lg:col-span-7">
          <div>
            {/* Header: Điểm tổng hợp và Bậc xếp hạng */}
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-5">
              <div>
                <span className="font-mono text-xs uppercase tracking-widest text-[#46C8FF]">
                  ĐIỂM TỔNG HỢP (AI 75% + GU BẠN 25%)
                </span>
                <div className="flex items-baseline gap-2 font-sans text-5xl font-black text-white sm:text-6xl">
                  <span>{total}</span>
                  <span className="text-xl font-normal text-slate-500">/100</span>
                </div>
                <p className="mt-1 font-mono text-xs text-slate-400">
                  Phân tích AI: <strong className="text-[#46C8FF]">{report.aiScore}đ</strong> &bull; Gu của bạn: <strong className="text-pink-400">{report.personalScore}đ</strong>
                </p>
              </div>

              <div className="text-right">
                <span className="font-mono text-xs uppercase tracking-widest text-slate-400">
                  BẬC ĐỘ HIẾM CUỐI CÙNG
                </span>
                <p
                  className="font-sans text-3xl font-black uppercase sm:text-4xl"
                  style={{
                    backgroundImage: systemRarity.gradient,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {systemRarity.label}
                </p>
                <p className="text-xs text-slate-400">
                  {systemRarity.description}
                </p>
              </div>
            </div>

            {/* 4 Tiêu chí có trọng số 25% */}
            <div className="mt-6">
              <ScoreBreakdown report={report} />
            </div>
          </div>
        </div>
      </div>

      {/* NHẬN DIỆN AESTHETIC (CATALOG 270 STYLE) & COSPLAY RECOGNITION */}
      <motion.div variants={fadeUp} className="mt-8 rounded-3xl border border-white/10 bg-white/[0.02] p-5 sm:p-6">
        <h4 className="font-sans text-sm font-extrabold text-white flex items-center gap-2 border-b border-white/10 pb-3">
          <Tag className="h-4 w-4 text-[#46C8FF]" />
          Nhận diện Phong cách (Catalog 270 Style) & Cosplay
        </h4>

        <div className="mt-4 grid gap-6 md:grid-cols-2">
          {/* Cột Aesthetic Styles */}
          <div className="rounded-2xl border border-white/5 bg-black/30 p-4">
            <span className="font-mono text-[10px] uppercase tracking-wider text-[#46C8FF]">
              AESTHETIC STYLES
            </span>

            {report.primaryStyle ? (
              <div className="mt-2 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-white text-sm">{report.primaryStyle.name}</p>
                    <span className="text-[11px] text-slate-400">Phong cách chủ đạo ({report.primaryStyle.itemCount} dấu hiệu)</span>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase ${
                      report.primaryStyle.confidence === "high"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : report.primaryStyle.confidence === "medium"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-slate-500/20 text-slate-300 border border-slate-500/30"
                    }`}
                  >
                    Độ tin cậy: {report.primaryStyle.confidence.toUpperCase()}
                  </span>
                </div>

                {report.primaryStyle.evidence.length > 0 && (
                  <div className="text-xs text-slate-300 bg-white/5 rounded-xl p-2.5">
                    <p className="text-[11px] font-semibold text-slate-400 mb-1">Bằng chứng hỗ trợ:</p>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                      {report.primaryStyle.evidence.slice(0, 3).map((ev, i) => (
                        <li key={i}>{ev}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {report.primaryStyle.missingEvidence.length > 0 && (
                  <p className="text-[11px] text-amber-300/80 italic">
                    ⚠️ {report.primaryStyle.missingEvidence[0]}
                  </p>
                )}

                {/* Secondary Styles */}
                {report.secondaryStyles && report.secondaryStyles.length > 0 && (
                  <div className="pt-2 border-t border-white/5">
                    <p className="text-[11px] font-semibold text-slate-400 mb-1.5">Phong cách phụ:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {report.secondaryStyles.map((sec) => (
                        <span
                          key={sec.id}
                          className="rounded-lg bg-white/5 px-2 py-1 text-[11px] text-slate-300 border border-white/10"
                        >
                          {sec.name} <span className="text-slate-500">({sec.confidence})</span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="mt-2 text-xs text-slate-400 italic">
                Trang phục tự do, chưa hội tụ đủ dấu hiệu để phân loại vào aesthetic cụ thể trong catalog.
              </p>
            )}
          </div>

          {/* Cột Cosplay Recognition */}
          <div className="rounded-2xl border border-pink-500/20 bg-pink-500/[0.03] p-4">
            <span className="font-mono text-[10px] uppercase tracking-wider text-pink-400">
              COSPLAY RECOGNITION
            </span>

            {report.cosplayResult && report.cosplayResult.identified ? (
              <div className="mt-2 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-pink-300 text-sm">{report.cosplayResult.characterName}</p>
                    <p className="text-[11px] text-pink-400/80">Tác phẩm: {report.cosplayResult.franchise}</p>
                  </div>
                  <span className="rounded-full bg-pink-500/20 px-2.5 py-0.5 font-mono text-[10px] font-bold text-pink-300 border border-pink-500/30 uppercase">
                    Độ tin cậy: {report.cosplayResult.confidenceLevel.toUpperCase()} ({Math.round(report.cosplayResult.confidence * 100)}%)
                  </span>
                </div>

                <p className="text-xs text-slate-300">{report.cosplayResult.explanation}</p>

                {report.cosplayResult.supportingDetails.length > 0 && (
                  <div className="text-xs text-slate-300 bg-black/40 rounded-xl p-2.5">
                    <p className="text-[11px] font-semibold text-slate-400 mb-1">Chi tiết phù hợp:</p>
                    <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                      {report.cosplayResult.supportingDetails.map((det, i) => (
                        <li key={i}>{det}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {report.cosplayResult.mismatchedDetails.length > 0 && (
                  <p className="text-[11px] text-slate-400 italic">
                    Góp ý: {report.cosplayResult.mismatchedDetails[0]}
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-3 text-xs text-slate-400 space-y-1">
                <p className="italic text-slate-300">Chưa đủ bằng chứng để xác định đây là trang phục Cosplay của một nhân vật cụ thể.</p>
                <p className="text-[11px] text-slate-500">
                  Hệ thống không tự ý gán nhân vật khi thiếu các phụ kiện đặc trưng (tóc, vũ khí, trang phục nhận diện).
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* CHI TIẾT GIÁ TRỊ ROBUX & DANH SÁCH VẬT PHẨM */}
      <motion.div variants={fadeUp} className="mt-8 rounded-3xl border border-white/10 bg-white/[0.02] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="font-sans text-sm font-extrabold text-white flex items-center gap-2">
              <Coins className="h-4 w-4 text-amber-400" />
              Chi tiết giá trị Robux Catalog đã xác minh
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Tổng giá trị: <strong className="text-amber-300 font-mono">R$ {valueBreakdown.totalRobux.toLocaleString("vi-VN")}</strong> &bull; Độ phủ giá catalog: {Math.round(valueBreakdown.coverage * 100)}%
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowValueDetails(!showValueDetails)}
            className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white"
          >
            {showValueDetails ? "Ẩn danh sách vật phẩm" : "Xem chi tiết vật phẩm"}
          </button>
        </div>

        {showValueDetails && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 pt-4 border-t border-white/5 text-xs">
            {/* Vật phẩm tính giá */}
            <div>
              <p className="font-bold text-emerald-300 mb-2">
                Đang mở bán trên Catalog ({valueBreakdown.pricedCount} món):
              </p>
              {valueBreakdown.priced.length === 0 ? (
                <p className="text-slate-500 italic">Không có vật phẩm tính phí đang mở bán.</p>
              ) : (
                <ul className="space-y-1.5 max-h-48 overflow-y-auto pr-2">
                  {valueBreakdown.priced.map((p) => (
                    <li key={p.id} className="flex justify-between rounded bg-white/5 px-2 py-1">
                      <span className="truncate pr-2 text-slate-300">{p.name}</span>
                      <span className="font-mono text-amber-300 shrink-0">R$ {p.price.toLocaleString("vi-VN")}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Vật phẩm bị loại trừ */}
            <div>
              <p className="font-bold text-slate-400 mb-2">
                Vật phẩm loại trừ khỏi tính giá ({valueBreakdown.excluded.length} món):
              </p>
              {valueBreakdown.excluded.length === 0 ? (
                <p className="text-slate-500 italic">Không có vật phẩm nào bị loại trừ.</p>
              ) : (
                <ul className="space-y-1.5 max-h-48 overflow-y-auto pr-2">
                  {valueBreakdown.excluded.map((e, idx) => (
                    <li key={idx} className="flex justify-between rounded bg-white/[0.03] px-2 py-1 text-slate-400">
                      <span className="truncate pr-2">{e.name}</span>
                      <span className="font-mono text-[10px] text-slate-500 uppercase">
                        {e.reason === "limited" ? "Limited" : e.reason === "offsale" ? "Off-sale" : "Không có giá"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* THANH TRƯỢT HỢP GU CÁ NHÂN (TIÊU CHÍ E) */}
      <motion.div variants={fadeUp} className="mt-8">
        <PersonalTasteSlider
          value={personalTier}
          onChange={onPersonalTierChange}
          systemTier={systemRarity.tier}
        />
      </motion.div>

      {/* PHẦN BÁO CÁO CÁ NHÂN HÓA: ĐIỂM MẠNH, ĐIỂM YẾU, LỜI KHUYÊN LÊN BẬC */}
      <motion.div variants={fadeUp} className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
        <h3 className="font-sans text-lg font-black text-white flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-[#46C8FF]" />
          Báo cáo cá nhân hóa & Hướng dẫn nâng cấp Avatar
        </h3>

        {/* Điểm mạnh & Điểm yếu */}
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs">
            <p className="font-bold text-emerald-300 uppercase tracking-wider mb-2">Điểm mạnh:</p>
            {strengths.length > 0 ? (
              <ul className="space-y-1.5 text-slate-300">
                {strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">&check;</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-400">Chưa có tiêu chí nào đạt điểm xuất sắc vượt trội.</p>
            )}
          </div>

          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs">
            <p className="font-bold text-amber-300 uppercase tracking-wider mb-2">Cần cải thiện:</p>
            {weaknesses.length > 0 ? (
              <ul className="space-y-1.5 text-slate-300">
                {weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-amber-400 font-bold">&bull;</span>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-400">Các tiêu chí đều đang ở mức ổn định hoặc tốt.</p>
            )}
          </div>
        </div>

        {/* Lời khuyên lên bậc tiếp theo */}
        {nextTier && (
          <div className="mt-6 rounded-2xl border border-[#46C8FF]/30 bg-[#46C8FF]/5 p-4 text-xs">
            <p className="font-bold text-[#46C8FF] uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <ArrowUpRight className="h-4 w-4" />
              Làm thế nào để lên {nextTier.target}? (Cần thêm khoảng +{nextTier.pointsNeeded} điểm)
            </p>
            <ul className="mt-2 space-y-1.5 text-slate-300">
              {nextTier.steps.map((st, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="font-mono font-bold text-[#46C8FF]">{i + 1}.</span>
                  <span>{st}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Lời khuyên đạt MYTHICAL */}
        <div className="mt-4 rounded-2xl border border-pink-500/30 bg-pink-500/5 p-4 text-xs">
          <p className="font-bold text-pink-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4" />
            Làm thế nào để đạt bậc tối cao MYTHICAL? (Yêu cầu &ge; 92 điểm)
          </p>
          <ul className="mt-2 space-y-1.5 text-slate-300">
            {mythicalAdvice.map((ma, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-pink-400">&star;</span>
                <span>{ma}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Giới hạn hệ thống */}
        <div className="mt-4 rounded-xl border border-white/5 bg-black/40 p-3 text-[11px] text-slate-500">
          <p className="font-semibold text-slate-400 mb-1 flex items-center gap-1">
            <Info className="h-3 w-3" /> Giới hạn và phương pháp phân tích:
          </p>
          <ul className="list-disc list-inside space-y-0.5">
            {limitations.map((lim, i) => (
              <li key={i}>{lim}</li>
            ))}
          </ul>
        </div>
      </motion.div>

      {/* ACTION BUTTONS GRID */}
      <div className="mt-8 border-t border-white/10 pt-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
            <span>SCAN LẠI</span>
          </button>

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
                <span>COPY BÁO CÁO</span>
              </>
            )}
          </button>

          <button
            id="btn-share-results"
            type="button"
            onClick={handleShare}
            className="btn-gaming-secondary flex items-center justify-center gap-1.5 rounded-xl py-3 text-xs font-bold transition"
          >
            <Share2 className="h-4 w-4 text-[#46C8FF]" />
            <span>CHIA SẺ</span>
          </button>

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
    </motion.div>
  );
}
