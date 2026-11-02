"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Crown,
  Medal,
  Sparkles,
  Trophy,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RefreshCw,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  Radio,
  X,
  Flame,
  Star,
  ShieldAlert,
} from "lucide-react";
import { clearLiveBoard, fetchLiveBoard, type LiveBoardResponse } from "@/lib/liveClient";
import { formatScore10 } from "@/lib/format";
import { RARITIES } from "@/lib/rarity";
import { soundManager } from "@/lib/sound";
import type { LeaderboardEntry } from "@/lib/leaderboard";
import type { RarityTier } from "@/types";

function LiveBoardInner() {
  const searchParams = useSearchParams();

  // URL Query Parameters
  const isObs = searchParams.get("obs") === "1" || searchParams.get("obs") === "true";
  const bgMode = searchParams.get("bg") || (isObs ? "transparent" : "solid");
  const pollInterval = Math.max(800, Number(searchParams.get("poll")) || 1500);

  // Live state
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [lastSignature, setLastSignature] = useState<string>("");
  const [newestEntry, setNewestEntry] = useState<LeaderboardEntry | null>(null);
  const [newestRank, setNewestRank] = useState<number | null>(null);

  // UI state
  const [soundActive, setSoundActive] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  const [isClearing, setIsClearing] = useState<boolean>(false);
  const [selectedEntry, setSelectedEntry] = useState<{
    entry: LeaderboardEntry;
    rank: number;
  } | null>(null);

  // Pagination for rows after podium (ranks 4+)
  const [page, setPage] = useState<number>(1);
  const pageSize = 8;

  // Refs for tracking changes
  const prevIdsRef = useRef<Set<string>>(new Set());
  const initialLoadRef = useRef<boolean>(true);
  const celebrateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Top podium
  const top1 = entries[0] || null;
  const top2 = entries[1] || null;
  const top3 = entries[2] || null;
  const restEntries = useMemo(() => entries.slice(3), [entries]);

  const totalPages = Math.max(1, Math.ceil(restEntries.length / pageSize));
  const pagedRest = useMemo(() => {
    const start = (page - 1) * pageSize;
    return restEntries.slice(start, start + pageSize);
  }, [restEntries, page, pageSize]);

  // Tự động xoay trang nếu có nhiều hơn 1 trang cho các rank 4+
  useEffect(() => {
    if (totalPages <= 1) return;
    const rotateTimer = setInterval(() => {
      setPage((prev) => (prev >= totalPages ? 1 : prev + 1));
    }, 10000);
    return () => clearInterval(rotateTimer);
  }, [totalPages]);

  // Pháo hoa & âm thanh chúc mừng
  const triggerCelebration = useCallback((entry: LeaderboardEntry, rank: number) => {
    setNewestEntry(entry);
    setNewestRank(rank);

    if (soundActive) {
      soundManager.playFanfare();
    }

    import("canvas-confetti")
      .then(({ default: confetti }) => {
        confetti({
          particleCount: 120,
          spread: 90,
          origin: { y: 0.5 },
          colors: ["#fbbf24", "#38bdf8", "#ff007f", "#a855f7", "#34d399"],
        });
      })
      .catch(() => {});

    if (celebrateTimeoutRef.current) {
      clearTimeout(celebrateTimeoutRef.current);
    }
    celebrateTimeoutRef.current = setTimeout(() => {
      setNewestEntry(null);
      setNewestRank(null);
    }, 8000);
  }, [soundActive]);

  // Polling server theo thời gian thực
  const pollData = useCallback(async () => {
    try {
      const data: LiveBoardResponse = await fetchLiveBoard();
      setIsConnected(true);
      setTotalCount(data.total || data.entries.length);

      const newEntries = data.entries || [];
      const currentSignature = newEntries
        .map((e) => `${e.id}-${e.score}-${e.tier}-${e.scannedAt}`)
        .join("|");

      if (currentSignature !== lastSignature) {
        setLastSignature(currentSignature);

        // Kiểm tra xem có avatar mới xuất hiện không
        if (!initialLoadRef.current) {
          const prevIds = prevIdsRef.current;
          // Tìm entry mới nhất dựa theo scannedAt
          const newlyAdded = newEntries.find(
            (e) => !prevIds.has(e.id) || (e.scannedAt && Date.now() - e.scannedAt < 15000),
          );

          if (newlyAdded) {
            const rank = newEntries.findIndex((e) => e.id === newlyAdded.id) + 1;
            triggerCelebration(newlyAdded, rank);
          }
        }

        prevIdsRef.current = new Set(newEntries.map((e) => e.id));
        setEntries(newEntries);
        initialLoadRef.current = false;
      }
    } catch (err) {
      console.warn("[live-board] Polling error:", err);
      setIsConnected(false);
    }
  }, [lastSignature, triggerCelebration]);

  useEffect(() => {
    pollData();
    const timer = setInterval(pollData, pollInterval);
    return () => clearInterval(timer);
  }, [pollData, pollInterval]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const handleFsChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", handleFsChange);
    return () => document.removeEventListener("fullscreenchange", handleFsChange);
  }, []);

  // Copy link OBS
  const handleCopyObsLink = () => {
    const url = `${window.location.origin}/live?obs=1&bg=transparent`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Reset live board
  const handleClearBoard = async () => {
    setIsClearing(true);
    try {
      await clearLiveBoard();
      setEntries([]);
      setTotalCount(0);
      setLastSignature("");
      prevIdsRef.current.clear();
      setShowClearConfirm(false);
    } catch {
      alert("Không thể xóa bảng xếp hạng. Vui lòng thử lại!");
    } finally {
      setIsClearing(false);
    }
  };

  const isSolid = bgMode === "solid";

  return (
    <div
      className={`min-h-screen w-full select-none text-white transition-colors duration-300 ${
        isSolid ? "bg-[#06080F]" : "bg-transparent"
      }`}
      style={{
        backgroundImage: isSolid
          ? "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(70, 200, 255, 0.15), transparent), radial-gradient(ellipse 60% 40% at 50% 110%, rgba(255, 0, 127, 0.12), transparent)"
          : undefined,
      }}
    >
      {/* KHUNG CÔNG CỤ STREAMER (TỰ ĐỘNG ẨN KHI Ở CHẾ ĐỘ OBS) */}
      {!isObs && (
        <header className="sticky top-0 z-40 border-b border-white/10 bg-[#080A12]/90 backdrop-blur-xl px-4 py-2.5 sm:px-6">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
            {/* Logo & Trạng thái Live */}
            <div className="flex items-center gap-3">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#46C8FF] to-[#FF007F] p-[1.5px] shadow-[0_0_15px_rgba(70,200,255,0.4)]">
                  <div className="flex h-full w-full items-center justify-center rounded-[6px] bg-[#080A12]">
                    <Trophy className="h-4 w-4 text-[#46C8FF]" />
                  </div>
                </div>
                <div className="leading-tight">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-sm tracking-tight text-white">
                      AVATAR <span className="bg-gradient-to-r from-[#46C8FF] to-[#FF007F] bg-clip-text text-transparent">RANKED</span>
                    </span>
                    <span className="rounded bg-rose-500/20 px-1.5 py-0.2 text-[9px] font-black uppercase text-rose-400 border border-rose-500/30">
                      LIVE STREAM
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-slate-400">Màn hình chiếu BXH cho Viewer</p>
                </div>
              </Link>

              {/* Status Indicator */}
              <div
                className={`ml-3 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold border ${
                  isConnected
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                    : "border-rose-500/40 bg-rose-500/10 text-rose-400"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    isConnected ? "bg-emerald-400 animate-ping" : "bg-rose-500"
                  }`}
                />
                <span>{isConnected ? "LIVE REALTIME" : "OFFLINE / ĐANG NỐI..."}</span>
              </div>
            </div>

            {/* Streamer Controls */}
            <div className="flex items-center gap-2">
              <span className="hidden md:inline-flex items-center gap-1 font-mono text-xs text-slate-300 mr-2 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">
                <span className="text-cyan-400 font-bold">{totalCount}</span> Avatar đã lên bảng
              </span>

              {/* Sound Toggle */}
              <button
                type="button"
                onClick={() => setSoundActive((prev) => !prev)}
                className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition"
                title={soundActive ? "Tắt âm thanh hiệu ứng" : "Bật âm thanh hiệu ứng"}
              >
                {soundActive ? (
                  <>
                    <Volume2 className="h-4 w-4 text-[#46C8FF]" />
                    <span className="hidden sm:inline">Âm thanh: Bật</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="h-4 w-4 text-slate-500" />
                    <span className="hidden sm:inline">Âm thanh: Tắt</span>
                  </>
                )}
              </button>

              {/* Fullscreen Button */}
              <button
                type="button"
                onClick={toggleFullscreen}
                className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition"
                title="Toàn màn hình chiếu live"
              >
                {isFullscreen ? (
                  <>
                    <Minimize className="h-4 w-4 text-amber-400" />
                    <span className="hidden sm:inline">Thu nhỏ</span>
                  </>
                ) : (
                  <>
                    <Maximize className="h-4 w-4 text-cyan-400" />
                    <span className="hidden sm:inline">Toàn màn hình</span>
                  </>
                )}
              </button>

              {/* Copy OBS Link */}
              <button
                type="button"
                onClick={handleCopyObsLink}
                className="flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-2.5 py-1.5 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 transition shadow-[0_0_12px_rgba(70,200,255,0.15)]"
                title="Copy link dán vào OBS Browser Source"
              >
                {copiedLink ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span>ĐÃ COPY LINK OBS</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-cyan-400" />
                    <span>LINK OBS</span>
                  </>
                )}
              </button>

              {/* Reset Live Board */}
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-500/10 px-2 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition"
                title="Làm mới / Xóa BXH buổi live"
              >
                <Trash2 className="h-3.5 w-3.5 text-rose-400" />
                <span className="hidden md:inline">Làm mới</span>
              </button>

              {/* Mở tab chấm avatar */}
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 rounded-lg border border-amber-400/40 bg-amber-400/10 px-2.5 py-1.5 text-xs font-bold text-amber-300 hover:bg-amber-400/20 transition"
                title="Mở tab điều khiển quét avatar cho streamer"
              >
                <span>Chấm Avatar ↗</span>
              </a>
            </div>
          </div>
        </header>
      )}

      {/* POP-IN BANNER ĂN MỪNG AVATAR MỚI VÀO BXH */}
      <AnimatePresence>
        {newestEntry && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.95 }}
            transition={{ type: "spring", damping: 18 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4 pointer-events-none"
          >
            <div className="relative overflow-hidden rounded-2xl border-2 border-amber-400 bg-gradient-to-r from-[#170a2c] via-[#240e3b] to-[#170a2c] p-4 text-center shadow-[0_0_50px_rgba(251,191,36,0.6)]">
              {/* Glow effects */}
              <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-amber-400 via-rose-500 to-cyan-400 opacity-30 blur-lg" />
              <div className="relative flex items-center justify-center gap-4">
                {newestEntry.avatarUrl && (
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border-2 border-amber-400 shadow-lg">
                    <Image
                      src={newestEntry.avatarUrl}
                      alt={newestEntry.username}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                )}
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1 rounded-full bg-amber-400/20 px-2.5 py-0.5 text-xs font-black text-amber-300 border border-amber-400/40">
                      <Sparkles className="h-3.5 w-3.5 animate-spin" />
                      VỪA ĐƯỢC ĐƯA LÊN BXH!
                    </span>
                    {newestRank && (
                      <span className="rounded-full bg-rose-500/20 px-2 py-0.5 text-xs font-black text-rose-300 border border-rose-500/40">
                        HẠNG #{newestRank}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-0.5 text-lg font-black text-white">
                    {newestEntry.displayName} <span className="text-amber-300 text-sm font-semibold">(@{newestEntry.username})</span>
                  </h3>
                  <p className="text-xs font-bold text-cyan-300">
                    Tổng điểm: <span className="text-base font-black text-amber-400">{formatScore10(newestEntry.score)}/10</span> • Bậc [{newestEntry.tier}]
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NỘI DUNG CHÍNH CỦA BẢNG XẾP HẠNG LIVE */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* TIÊU ĐỀ SHOWCASE */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3.5 py-1 text-xs font-mono font-bold uppercase tracking-widest text-cyan-300 shadow-[0_0_20px_rgba(70,200,255,0.2)]">
            <Radio className="h-3.5 w-3.5 text-rose-400 animate-pulse" />
            HALL OF FAME • STREAM SHOWCASE
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-5xl">
            BẢNG <span className="bg-gradient-to-r from-[#46C8FF] via-[#A855F7] to-[#FF007F] bg-clip-text text-transparent">XẾP HẠNG</span> AVATAR
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Xếp hạng theo điểm phong cách & độ hiếm. Cập nhật trực tiếp khi streamer duyệt avatar!
          </p>
        </div>

        {/* TRẠNG THÁI BẢNG TRỐNG */}
        {entries.length === 0 ? (
          <div className="my-16 flex flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/[0.02] p-12 text-center backdrop-blur-xl">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-white/10 shadow-[0_0_40px_rgba(70,200,255,0.2)]">
              <Trophy className="h-10 w-10 text-cyan-400 animate-bounce" />
            </div>
            <h2 className="mt-6 text-xl font-black text-white sm:text-2xl">
              ĐANG CHỜ AVATAR ĐẦU TIÊN
            </h2>
            <p className="mt-2 max-w-md text-sm text-slate-400">
              Streamer hãy mở trang chấm điểm, tìm kiếm người chơi và bấm nút <strong className="text-amber-300">&quot;⭐ ĐƯA VÀO BXH LIVE&quot;</strong> để avatar xuất hiện tại đây!
            </p>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#46C8FF] to-[#A855F7] px-5 py-3 text-xs font-black uppercase text-white shadow-[0_0_25px_rgba(70,200,255,0.4)] transition hover:scale-105"
            >
              <Sparkles className="h-4 w-4" />
              <span>BẮT ĐẦU QUÉT & CHẤM ĐIỂM</span>
            </a>
          </div>
        ) : (
          <>
            {/* BỤC VINH QUANG PODIUM: TOP 1 - 2 - 3 */}
            <div className="mb-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 items-end justify-center max-w-5xl mx-auto pt-6">
                {/* TOP 2: Á QUÂN (BÊN TRÁI) */}
                <div className="order-2 md:order-1 flex flex-col items-center">
                  {top2 ? (
                    <PodiumCard
                      rank={2}
                      entry={top2}
                      onClick={() => setSelectedEntry({ entry: top2, rank: 2 })}
                    />
                  ) : (
                    <EmptyPodiumSlot rank={2} label="Á QUÂN" />
                  )}
                  {/* Bục số 2 */}
                  <div className="w-full mt-3 rounded-t-2xl border-t-2 border-x-2 border-slate-400/40 bg-gradient-to-b from-slate-800/80 to-slate-900/90 py-4 px-2 text-center shadow-[0_0_30px_rgba(203,213,225,0.2)] backdrop-blur-md h-24 sm:h-28 flex flex-col justify-center">
                    <span className="font-mono text-3xl sm:text-4xl font-black text-slate-300">#2</span>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Á QUÂN</span>
                  </div>
                </div>

                {/* TOP 1: QUÁN QUÂN (Ở GIỮA, CAO NHẤT) */}
                <div className="order-1 md:order-2 flex flex-col items-center -translate-y-2 sm:-translate-y-4">
                  {top1 ? (
                    <PodiumCard
                      rank={1}
                      entry={top1}
                      onClick={() => setSelectedEntry({ entry: top1, rank: 1 })}
                    />
                  ) : (
                    <EmptyPodiumSlot rank={1} label="QUÁN QUÂN" />
                  )}
                  {/* Bục số 1 */}
                  <div className="w-full mt-3 rounded-t-2xl border-t-2 border-x-2 border-amber-400/60 bg-gradient-to-b from-amber-950/80 via-amber-900/40 to-slate-900/90 py-5 px-2 text-center shadow-[0_0_50px_rgba(251,191,36,0.35)] backdrop-blur-md h-32 sm:h-36 flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
                    <span className="font-mono text-4xl sm:text-5xl font-black text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]">#1</span>
                    <span className="text-xs font-black uppercase tracking-widest text-amber-300">QUÁN QUÂN</span>
                  </div>
                </div>

                {/* TOP 3: HẠNG BA (BÊN PHẢI) */}
                <div className="order-3 md:order-3 flex flex-col items-center">
                  {top3 ? (
                    <PodiumCard
                      rank={3}
                      entry={top3}
                      onClick={() => setSelectedEntry({ entry: top3, rank: 3 })}
                    />
                  ) : (
                    <EmptyPodiumSlot rank={3} label="HẠNG BA" />
                  )}
                  {/* Bục số 3 */}
                  <div className="w-full mt-3 rounded-t-2xl border-t-2 border-amber-600/40 bg-gradient-to-b from-amber-950/60 to-slate-900/90 py-3 px-2 text-center shadow-[0_0_25px_rgba(245,158,11,0.2)] backdrop-blur-md h-20 sm:h-24 flex flex-col justify-center">
                    <span className="font-mono text-2xl sm:text-3xl font-black text-amber-500">#3</span>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">HẠNG BA</span>
                  </div>
                </div>
              </div>
            </div>

            {/* DANH SÁCH CÁC HẠNG TIẾP THEO (TỪ HẠNG 4 TRỞ ĐI) */}
            {restEntries.length > 0 && (
              <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-6 backdrop-blur-xl shadow-2xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Flame className="h-5 w-5 text-rose-400" />
                    <h3 className="text-lg font-black text-white">TOP ỨNG VIÊN TIẾP THEO</h3>
                    <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs font-mono font-bold text-slate-300">
                      {restEntries.length} avatar
                    </span>
                  </div>

                  {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-slate-400">
                        Trang {page}/{totalPages}
                      </span>
                      <div className="flex gap-1">
                        {Array.from({ length: totalPages }).map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setPage(i + 1)}
                            className={`h-2 rounded-full transition-all ${
                              page === i + 1 ? "w-6 bg-cyan-400" : "w-2 bg-white/20 hover:bg-white/40"
                            }`}
                            aria-label={`Trang ${i + 1}`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Danh sách thẻ Card */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  <AnimatePresence mode="popLayout">
                    {pagedRest.map((entry, idx) => {
                      const actualRank = (page - 1) * pageSize + idx + 4;
                      return (
                        <motion.div
                          key={entry.id}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ duration: 0.2 }}
                        >
                          <RankCard
                            rank={actualRank}
                            entry={entry}
                            onClick={() => setSelectedEntry({ entry, rank: actualRank })}
                          />
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* SPOTLIGHT MODAL XEM CHI TIẾT AVATAR KHI CLICK */}
      <AnimatePresence>
        {selectedEntry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-lg rounded-3xl border border-white/20 bg-gradient-to-b from-[#11162b] to-[#080a14] p-6 shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setSelectedEntry(null)}
                className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-slate-300 hover:bg-white/20 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="flex flex-col items-center text-center">
                <div
                  className="relative h-32 w-32 rounded-3xl overflow-hidden border-2 p-1 shadow-2xl"
                  style={{
                    borderColor: RARITIES[selectedEntry.entry.tier]?.color || "#38bdf8",
                    boxShadow: `0 0 35px ${RARITIES[selectedEntry.entry.tier]?.glowColor || "rgba(56,189,248,0.5)"}`,
                  }}
                >
                  {selectedEntry.entry.avatarUrl ? (
                    <Image
                      src={selectedEntry.entry.avatarUrl}
                      alt={selectedEntry.entry.username}
                      fill
                      className="object-cover rounded-[20px]"
                      unoptimized
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-800 text-3xl font-black">
                      {selectedEntry.entry.username.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <span className="rounded-full bg-amber-400/20 px-3 py-1 font-mono text-sm font-black text-amber-300 border border-amber-400/40">
                    HẠNG #{selectedEntry.rank}
                  </span>
                  <span
                    className="rounded-full px-3 py-1 font-mono text-xs font-black uppercase text-white border"
                    style={{
                      borderColor: RARITIES[selectedEntry.entry.tier]?.color,
                      backgroundColor: `${RARITIES[selectedEntry.entry.tier]?.color}22`,
                      color: RARITIES[selectedEntry.entry.tier]?.color,
                    }}
                  >
                    {selectedEntry.entry.tier}
                  </span>
                </div>

                <h2 className="mt-2 text-2xl font-black text-white">
                  {selectedEntry.entry.displayName}
                </h2>
                <p className="font-mono text-sm text-slate-400">
                  @{selectedEntry.entry.username}
                </p>

                <div className="my-5 w-full rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-center justify-around">
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase">Điểm Tổng</p>
                      <p className="text-3xl font-black text-amber-400">
                        {formatScore10(selectedEntry.entry.score)}
                        <span className="text-sm font-normal text-slate-400">/10</span>
                      </p>
                    </div>
                    <div className="h-10 w-[1px] bg-white/10" />
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase">Điểm Hệ Thống</p>
                      <p className="text-2xl font-black text-cyan-400">
                        {formatScore10(selectedEntry.entry.aiScore)}
                        <span className="text-xs font-normal text-slate-400">/10</span>
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-xs italic text-slate-300 max-w-sm">
                  &quot;{RARITIES[selectedEntry.entry.tier]?.quote || "Phong cách ấn tượng!"}&quot;
                </p>

                <div className="mt-6 flex w-full gap-3">
                  <a
                    href={`https://www.roblox.com/users/${selectedEntry.entry.id}/profile`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-bold text-slate-200 hover:bg-white/10 transition"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Xem Roblox Profile</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setSelectedEntry(null)}
                    className="flex-1 rounded-xl bg-gradient-to-r from-[#46C8FF] to-[#A855F7] py-2.5 text-xs font-black uppercase text-white hover:opacity-90 transition"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRM MODAL XÓA BẢNG XẾP HẠNG BUỔI LIVE */}
      <AnimatePresence>
        {showClearConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-2xl border border-rose-500/40 bg-[#0e111d] p-6 text-center shadow-2xl"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30">
                <ShieldAlert className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-lg font-black text-white">LÀM MỚI BẢNG XẾP HẠNG?</h3>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                Thao tác này sẽ xóa sạch danh sách avatar trên bảng live để streamer bắt đầu một buổi stream chấm điểm mới.
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowClearConfirm(false)}
                  disabled={isClearing}
                  className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/10"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleClearBoard}
                  disabled={isClearing}
                  className="flex-1 rounded-xl bg-rose-600 py-2.5 text-xs font-black text-white hover:bg-rose-500 shadow-lg shadow-rose-600/30"
                >
                  {isClearing ? "Đang xóa..." : "Xác nhận xóa"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Thẻ hiển thị trên Bục Podium
function PodiumCard({
  rank,
  entry,
  onClick,
}: {
  rank: 1 | 2 | 3;
  entry: LeaderboardEntry;
  onClick: () => void;
}) {
  const tierInfo = RARITIES[entry.tier] || RARITIES.COMMON;
  const isTop1 = rank === 1;
  const isTop2 = rank === 2;
  const isTop3 = rank === 3;

  const borderColor = isTop1
    ? "#FBBF24"
    : isTop2
      ? "#CBD5E1"
      : "#F59E0B";

  const glowColor = isTop1
    ? "rgba(251, 191, 36, 0.5)"
    : isTop2
      ? "rgba(203, 213, 225, 0.4)"
      : "rgba(245, 158, 11, 0.35)";

  return (
    <div
      onClick={onClick}
      className={`group relative flex w-full max-w-[280px] cursor-pointer flex-col items-center rounded-3xl border-2 p-5 text-center transition-all duration-300 hover:scale-105 ${
        isTop1
          ? "border-amber-400 bg-gradient-to-b from-amber-950/60 via-[#151228] to-[#0a0815] shadow-[0_0_40px_rgba(251,191,36,0.35)]"
          : isTop2
            ? "border-slate-300/80 bg-gradient-to-b from-slate-900/80 via-[#121626] to-[#0a0815] shadow-[0_0_30px_rgba(203,213,225,0.2)]"
            : "border-amber-600/80 bg-gradient-to-b from-amber-950/50 via-[#161224] to-[#0a0815] shadow-[0_0_25px_rgba(245,158,11,0.2)]"
      }`}
    >
      {/* Vương miện / Huy chương */}
      <div className="absolute -top-6 flex items-center justify-center">
        {isTop1 ? (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-amber-600 shadow-[0_0_25px_rgba(251,191,36,0.8)] border-2 border-white animate-bounce">
            <Crown className="h-6 w-6 text-slate-950" />
          </div>
        ) : isTop2 ? (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-200 to-slate-400 shadow-[0_0_15px_rgba(203,213,225,0.6)] border-2 border-white">
            <Medal className="h-5 w-5 text-slate-900" />
          </div>
        ) : (
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-amber-500 to-amber-800 shadow-[0_0_15px_rgba(245,158,11,0.6)] border-2 border-white">
            <Medal className="h-4 w-4 text-white" />
          </div>
        )}
      </div>

      {/* Ảnh Avatar lớn */}
      <div
        className={`relative mt-2 overflow-hidden rounded-2xl border-2 shadow-xl ${
          isTop1 ? "h-28 w-28 sm:h-32 sm:w-32" : "h-24 w-24 sm:h-28 sm:w-28"
        }`}
        style={{
          borderColor,
          boxShadow: `0 0 25px ${glowColor}`,
        }}
      >
        {entry.avatarUrl ? (
          <Image
            src={entry.avatarUrl}
            alt={entry.username}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-800 font-mono text-2xl font-black">
            {entry.username.slice(0, 2).toUpperCase()}
          </div>
        )}
      </div>

      {/* Tên & Rank */}
      <h3 className="mt-3 font-extrabold text-sm sm:text-base text-white truncate max-w-[200px]">
        {entry.displayName}
      </h3>
      <p className="font-mono text-xs text-slate-400 truncate max-w-[180px]">
        @{entry.username}
      </p>

      {/* Bậc & Điểm số to rõ */}
      <div className="mt-2.5 flex items-center gap-2">
        <span
          className="rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase border"
          style={{
            borderColor: tierInfo.color,
            backgroundColor: `${tierInfo.color}22`,
            color: tierInfo.color,
          }}
        >
          {entry.tier}
        </span>
      </div>

      <div className="mt-2">
        <span className="font-mono text-2xl sm:text-3xl font-black" style={{ color: borderColor }}>
          {formatScore10(entry.score)}
        </span>
        <span className="font-mono text-xs text-slate-400">/10</span>
      </div>
    </div>
  );
}

// Ô trống trên bục khi chưa có người lọt vào Top 2 hoặc Top 3
function EmptyPodiumSlot({ rank, label }: { rank: number; label: string }) {
  return (
    <div className="flex w-full max-w-[240px] flex-col items-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] p-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5 border border-white/5 text-slate-600">
        <Trophy className="h-8 w-8 opacity-40" />
      </div>
      <p className="mt-3 text-xs font-bold text-slate-500 uppercase">{label}</p>
      <p className="text-[11px] text-slate-600">Đang chờ ứng viên...</p>
    </div>
  );
}

// Thẻ Rank dành cho Top 4 trở đi
function RankCard({
  rank,
  entry,
  onClick,
}: {
  rank: number;
  entry: LeaderboardEntry;
  onClick: () => void;
}) {
  const tierInfo = RARITIES[entry.tier] || RARITIES.COMMON;

  return (
    <div
      onClick={onClick}
      className="group flex cursor-pointer items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 transition-all duration-200 hover:border-cyan-400/40 hover:bg-white/[0.06] hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(70,200,255,0.15)]"
    >
      <div className="flex items-center gap-3 min-w-0">
        {/* Số thứ tự */}
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-black text-slate-400 bg-white/5 border border-white/10 group-hover:text-cyan-300 group-hover:border-cyan-400/30">
          #{rank}
        </span>

        {/* Thumbnail Avatar */}
        <div
          className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border p-0.5"
          style={{ borderColor: tierInfo.color }}
        >
          {entry.avatarUrl ? (
            <Image
              src={entry.avatarUrl}
              alt={entry.username}
              fill
              className="object-cover rounded-[8px]"
              unoptimized
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-800 text-xs font-bold">
              {entry.username.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        {/* Thông tin tên */}
        <div className="min-w-0">
          <p className="truncate text-xs font-bold text-white group-hover:text-cyan-300">
            {entry.displayName}
          </p>
          <p className="truncate font-mono text-[10px] text-slate-400">
            @{entry.username}
          </p>
          <span
            className="inline-block mt-0.5 text-[9px] font-bold uppercase"
            style={{ color: tierInfo.color }}
          >
            {entry.tier}
          </span>
        </div>
      </div>

      {/* Điểm số */}
      <div className="text-right shrink-0">
        <span className="font-mono text-base font-black text-amber-300">
          {formatScore10(entry.score)}
        </span>
        <span className="font-mono text-[10px] text-slate-500">/10</span>
      </div>
    </div>
  );
}

export default function LiveBoardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#06080F] text-cyan-400 font-mono text-sm">
          Đang khởi tạo Màn Hình Live BXH...
        </div>
      }
    >
      <LiveBoardInner />
    </Suspense>
  );
}
