"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Crown,
  Sparkles,
  Trash2,
  TriangleAlert,
  Trophy,
} from "lucide-react";
import AvatarFrame from "@/components/ui/AvatarFrame";
import Badge from "@/components/ui/Badge";
import { buttonClasses } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { formatRelativeTime, formatScore10 } from "@/lib/format";
import { clearLiveBoard, publishLiveScan } from "@/lib/liveClient";
import { RARITIES } from "@/lib/rarity";
import { isSecretEntryId } from "@/lib/secretAccount";
import {
  LEADERBOARD_MAX_ENTRIES,
  LEADERBOARD_STORAGE_KEY,
  clearLeaderboard,
  createLeaderboardEntry,
  getPageForRank,
  leaderboardHighlightMs,
  loadLeaderboard,
  paginateLeaderboard,
  recordLeaderboardEntry,
  type LeaderboardEntry,
} from "@/lib/leaderboard";
import type { RobloxUser, ScoreReport } from "@/types";

export interface LeaderboardSectionProps {
  className?: string;
  headingLevel?: "h1" | "h2";
  eyebrow?: string;
  title?: string;
  description?: string;
  /** Hiện CTA "Quét avatar" ở góc phải tiêu đề. */
  showCta?: boolean;
  /** Có user + report = tự ghi/cập nhật entry sau khi quét. */
  user?: RobloxUser | null;
  report?: ScoreReport | null;
  imageUrl?: string | null;
}

interface Notice {
  text: string;
  tone: "success" | "warning";
}

const PODIUM_ACCENTS: Record<number, { color: string; label: string }> = {
  1: { color: "#fbbf24", label: "Quán quân" },
  2: { color: "#cbd5e1", label: "Á quân" },
  3: { color: "#f59e0b", label: "Hạng ba" },
};

function rankTone(rank: number): string {
  if (rank === 1) {
    return "border-[rgba(251,191,36,0.45)] bg-[rgba(251,191,36,0.12)] text-[#fbbf24]";
  }
  if (rank === 2) {
    return "border-[rgba(203,213,225,0.38)] bg-[rgba(203,213,225,0.10)] text-[#e2e8f0]";
  }
  if (rank === 3) {
    return "border-[rgba(245,158,11,0.42)] bg-[rgba(245,158,11,0.12)] text-[#f59e0b]";
  }
  return "border-white/10 bg-white/[0.04] text-ink-2";
}

function LeaderboardSkeleton() {
  return (
    <div className="neon-panel overflow-hidden rounded-[22px]" aria-hidden>
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="h-3 w-44 rounded bg-white/[0.06]" />
        <div className="h-3 w-16 rounded bg-white/[0.06]" />
      </div>
      <div className="grid gap-3 p-3 sm:grid-cols-3 sm:gap-4 sm:p-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
          >
            <div className="h-16 w-16 rounded-2xl bg-white/[0.06]" />
            <div className="h-3 w-20 rounded bg-white/[0.06]" />
            <div className="h-2.5 w-14 rounded bg-white/[0.05]" />
            <div className="h-6 w-12 rounded bg-white/[0.06]" />
          </div>
        ))}
      </div>
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 border-t border-white/[0.06] px-4 py-3"
        >
          <div className="h-9 w-9 rounded-lg bg-white/[0.06]" />
          <div className="h-10 w-10 rounded-lg bg-white/[0.06]" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/2 rounded bg-white/[0.06]" />
            <div className="h-2.5 w-1/3 rounded bg-white/[0.05]" />
          </div>
          <div className="h-6 w-12 rounded bg-white/[0.06]" />
        </div>
      ))}
    </div>
  );
}

function PodiumCard({
  entry,
  rank,
  isNew,
}: {
  entry: LeaderboardEntry;
  rank: number;
  isNew: boolean;
}) {
  const accent = PODIUM_ACCENTS[rank] ?? PODIUM_ACCENTS[3];
  const rarity = RARITIES[entry.tier];

  return (
    <article
      className={cn(
        "relative flex flex-col items-center gap-2 overflow-hidden rounded-2xl border p-2.5 text-center transition-transform duration-300 sm:gap-2.5 sm:p-4",
        rank === 1 && "sm:-translate-y-1 sm:pb-5",
      )}
      style={{
        borderColor: `${accent.color}44`,
        background: `linear-gradient(180deg, ${accent.color}16 0%, rgba(9,14,28,0.9) 58%, rgba(7,10,20,0.95) 100%)`,
        boxShadow:
          rank === 1
            ? `0 0 34px ${accent.color}30, inset 0 1px 0 rgba(255,255,255,0.08)`
            : `0 0 22px ${accent.color}14, inset 0 1px 0 rgba(255,255,255,0.05)`,
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background: `linear-gradient(90deg, transparent, ${accent.color}, transparent)`,
        }}
      />

      <div className="flex w-full items-center justify-between gap-1">
        <span
          className="inline-flex items-center gap-1 rounded-full border px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.04em] sm:px-2 sm:text-[10px]"
          style={{
            borderColor: `${accent.color}55`,
            backgroundColor: `${accent.color}14`,
            color: accent.color,
          }}
        >
          {rank === 1 && <Crown className="h-3 w-3" aria-hidden />}
          #{rank}
        </span>
        {isNew && (
          <span className="inline-flex items-center gap-1 rounded-full border border-[rgba(70,200,255,0.45)] bg-[rgba(70,200,255,0.14)] px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase leading-none text-cyan shadow-[0_0_14px_rgba(70,200,255,0.25)]">
            <Sparkles className="h-2.5 w-2.5" aria-hidden />
            Mới
          </span>
        )}
      </div>

      <div className="relative">
        <span
          aria-hidden
          className="absolute inset-0 -z-10 rounded-2xl blur-xl"
          style={{ backgroundColor: `${accent.color}30` }}
        />
        <AvatarFrame
          displayName={entry.displayName}
          username={entry.username}
          imageUrl={entry.avatarUrl}
          sizes="96px"
          className="h-14 w-14 rounded-2xl sm:h-20 sm:w-20"
        />
      </div>

      <div className="w-full min-w-0">
        <p className="truncate font-display text-[11px] font-extrabold uppercase leading-tight tracking-[-0.01em] text-ink min-[380px]:text-xs sm:text-base">
          {entry.displayName}
        </p>
        <p className="mt-0.5 truncate font-mono text-[9px] font-semibold text-muted sm:text-[10px]">
          @{entry.username}
        </p>
      </div>

      <Badge tier={entry.tier} className="hidden sm:inline-flex">
        {entry.tier}
      </Badge>

      <p
        aria-label={`${formatScore10(entry.score)} trên 10`}
        className="neon-score font-display text-xl font-extrabold leading-none tabular-nums tracking-[-0.03em] sm:text-3xl"
      >
        {formatScore10(entry.score)}
        <span className="ml-0.5 font-mono text-[9px] font-bold text-muted sm:text-[10px]">
          /10
        </span>
      </p>

      <span
        aria-hidden
        className="h-0.5 w-8 rounded-full sm:w-10"
        style={{ backgroundColor: `${accent.color}88` }}
      />
      <span className="sr-only">
        {accent.label} · hạng {rank} · bậc {rarity.label}
      </span>
    </article>
  );
}

export default function LeaderboardSection({
  className,
  headingLevel = "h2",
  eyebrow,
  title = "Bảng xếp hạng",
  description = "Xếp theo điểm tổng /10. Avatar vừa quét tự động ghi vào bảng — 6 mục mỗi trang.",
  showCta = false,
  user,
  report,
  imageUrl,
}: LeaderboardSectionProps) {
  const Heading = headingLevel;
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [mounted, setMounted] = useState(false);
  const [page, setPage] = useState(1);
  const [newId, setNewId] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  const recordedKey = useRef<string | null>(null);
  const highlightTimer = useRef<number | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const resetTriggerRef = useRef<HTMLButtonElement | null>(null);
  const cancelResetRef = useRef<HTMLButtonElement | null>(null);

  const autoEntry = useMemo(
    () => (user && report ? createLeaderboardEntry(user, report, imageUrl ?? null) : null),
    [imageUrl, report, user],
  );

  useEffect(() => {
    setEntries(loadLeaderboard());
    setMounted(true);

    const onStorage = (event: StorageEvent) => {
      if (event.key === null || event.key === LEADERBOARD_STORAGE_KEY) {
        setEntries(loadLeaderboard());
      }
    };

    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      if (highlightTimer.current !== null) {
        window.clearTimeout(highlightTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!autoEntry) return;

    // Tài khoản chủ web được giữ riêng tư: không ghi lên bảng máy hay bảng live.
    if (isSecretEntryId(autoEntry.id)) {
      setEntries(loadLeaderboard());
      setNotice({
        text: "Tài khoản này được giữ riêng tư và không ghi lên bảng xếp hạng.",
        tone: "success",
      });
      return;
    }

    const key = `${autoEntry.id}:${autoEntry.score}:${autoEntry.aiScore}:${autoEntry.tier}`;
    if (recordedKey.current === key) return;
    recordedKey.current = key;

    const result = recordLeaderboardEntry(autoEntry);
    setEntries(result.entries);

    setLiveError(null);
    void publishLiveScan(autoEntry)
      .then(() => setLiveError(null))
      .catch((error: unknown) => {
        console.error("[live] Không gửi được lượt quét lên bảng live:", error);
        setLiveError(
          "Đã lưu vào bảng trên máy nhưng chưa gửi được lên bảng live. Kiểm tra server rồi quét lại.",
        );
      });

    if (!result.saved) {
      setNotice({
        text: "Không lưu được bảng xếp hạng — trình duyệt đang chặn localStorage.",
        tone: "warning",
      });
      return;
    }

    if (result.rank === null) {
      setNotice({
        text: `@${autoEntry.username} nằm ngoài top ${LEADERBOARD_MAX_ENTRIES} nên chưa được thêm vào bảng.`,
        tone: "warning",
      });
      return;
    }

    setPage(getPageForRank(result.rank));
    setNewId(autoEntry.id);
    setNotice({
      text: result.isNew
        ? `Đã thêm @${autoEntry.username} vào bảng — hạng #${result.rank}.`
        : `Đã cập nhật @${autoEntry.username} — hiện ở hạng #${result.rank}.`,
      tone: "success",
    });

    if (highlightTimer.current !== null) {
      window.clearTimeout(highlightTimer.current);
    }
    highlightTimer.current = window.setTimeout(() => {
      setNewId(null);
    }, leaderboardHighlightMs());
  }, [autoEntry]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (confirmingReset) {
      cancelResetRef.current?.focus({ preventScroll: true });
    }
  }, [confirmingReset]);

  const view = paginateLeaderboard(entries, page);
  const eyebrowText = eyebrow ?? `Lịch sử quét · ${view.total} avatar`;
  const podiumEntries = view.page === 1 ? view.items.slice(0, 3) : [];
  const rowEntries = view.page === 1 ? view.items.slice(3) : view.items;
  const rowStart = view.page === 1 ? view.start + 3 : view.start;

  const handleReset = () => {
    clearLeaderboard();
    void clearLiveBoard().catch((error: unknown) => {
      console.error("[live] Không xóa được bảng live:", error);
    });
    setEntries([]);
    setPage(1);
    setNewId(null);
    setNotice(null);
    setLiveError(null);
    setConfirmingReset(false);
    window.setTimeout(() => headingRef.current?.focus({ preventScroll: true }), 0);
  };

  const cancelReset = () => {
    setConfirmingReset(false);
    window.setTimeout(() => resetTriggerRef.current?.focus({ preventScroll: true }), 0);
  };

  return (
    <section aria-labelledby="leaderboard-title" className={cn("nb-section", className)}>
      <div className="nb-container max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <p className="neon-kicker">
              {mounted ? eyebrowText : "Lịch sử quét"}
            </p>
            <Heading
              ref={headingRef}
              id="leaderboard-title"
              tabIndex={-1}
              className={cn(
                "mt-2 max-w-[16ch] font-display font-extrabold uppercase leading-[0.95] tracking-[-0.03em] text-ink",
                headingLevel === "h1"
                  ? "text-[length:var(--fs-3xl)]"
                  : "text-[length:var(--fs-2xl)]",
              )}
            >
              {title.split(" ").length > 1 ? (
                <>
                  {title.split(" ").slice(0, -1).join(" ")}{" "}
                  <span className="neon-title">{title.split(" ").slice(-1)}</span>
                </>
              ) : (
                title
              )}
            </Heading>
            <p className="mt-3 max-w-[62ch] text-sm leading-[1.6] text-ink-2 sm:text-base">
              {description}
            </p>
          </div>

          {showCta && (
            <Link href="/scan" className={buttonClasses({ variant: "primary", size: "md" })}>
              Quét avatar
            </Link>
          )}
        </div>

        <div className="mt-8">
          {notice && (
            <div
              role="status"
              className={cn(
                "mb-4 flex items-start gap-2.5 rounded-xl border px-4 py-3 backdrop-blur",
                notice.tone === "success"
                  ? "border-[rgba(70,200,255,0.32)] bg-[rgba(70,200,255,0.08)] text-cyan"
                  : "border-[rgba(255,209,102,0.32)] bg-warning-bg text-warning",
              )}
            >
              <Trophy className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <p className="text-sm font-semibold leading-[1.5]">{notice.text}</p>
            </div>
          )}

          {liveError && (
            <div
              role="status"
              className="mb-4 flex items-start gap-2.5 rounded-xl border border-[rgba(255,209,102,0.32)] bg-warning-bg px-4 py-3 text-warning backdrop-blur"
            >
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <p className="text-sm font-semibold leading-[1.5]">{liveError}</p>
            </div>
          )}

          {!mounted ? (
            <LeaderboardSkeleton />
          ) : view.total === 0 ? (
            <div className="neon-panel rounded-[22px] px-6 py-12 text-center sm:px-10">
              <span className="relative mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-[rgba(70,200,255,0.35)] bg-[rgba(70,200,255,0.10)] text-cyan shadow-[0_0_32px_rgba(70,200,255,0.22)]">
                <Trophy className="h-8 w-8" aria-hidden />
              </span>
              <h3 className="mt-5 font-display text-xl font-extrabold uppercase tracking-[-0.01em] text-ink">
                Bảng đang trống
              </h3>
              <p className="mx-auto mt-2 max-w-[42ch] text-sm leading-[1.6] text-ink-2">
                Quét avatar đầu tiên để mở bảng xếp hạng. Mỗi lượt quét sẽ tự động thêm người
                chơi vào đường đua.
              </p>
              <Link
                href="/scan"
                className={buttonClasses({ variant: "primary", size: "md", className: "mt-6" })}
              >
                Chấm avatar đầu tiên
              </Link>
            </div>
          ) : (
            <div className="neon-panel overflow-hidden rounded-[22px]">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-white/[0.02] px-3 py-3 sm:px-4">
                <div className="flex items-center gap-2">
                  <span className="neon-chip">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan shadow-[0_0_8px_rgba(70,200,255,0.8)]" />
                    {view.total} avatar
                  </span>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-muted">
                    Trang {view.page}/{view.totalPages}
                  </span>
                </div>

                {confirmingReset ? (
                  <div
                    role="group"
                    aria-label="Xác nhận xóa bảng xếp hạng"
                    className="flex w-full flex-wrap items-center justify-between gap-2 sm:w-auto sm:justify-end"
                  >
                    <span className="font-mono text-[10px] font-bold uppercase tracking-[0.04em] text-danger">
                      Xóa bảng này và bảng live?
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        ref={cancelResetRef}
                        type="button"
                        onClick={cancelReset}
                        className={buttonClasses({ variant: "ghost", size: "sm" })}
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        onClick={handleReset}
                        className={buttonClasses({ variant: "danger", size: "sm" })}
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    ref={resetTriggerRef}
                    type="button"
                    onClick={() => setConfirmingReset(true)}
                    aria-label="Reset bảng xếp hạng"
                    title="Reset bảng xếp hạng"
                    className={buttonClasses({ variant: "ghost", size: "sm" })}
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden />
                    <span className="hidden sm:inline">Reset</span>
                  </button>
                )}
              </div>

              {podiumEntries.length > 0 && (
                <div className="grid gap-2.5 p-3 sm:grid-cols-3 sm:gap-4 sm:p-5">
                  {podiumEntries.map((entry, index) => {
                    const rank = index + 1;
                    return (
                      <div
                        key={entry.id}
                        className={cn(
                          rank === 1 && "order-1 sm:order-2",
                          rank === 2 && "order-2 sm:order-1",
                          rank === 3 && "order-3",
                        )}
                      >
                        <PodiumCard
                          entry={entry}
                          rank={rank}
                          isNew={entry.id === newId}
                        />
                      </div>
                    );
                  })}
                </div>
              )}

              {rowEntries.length > 0 && (
                <>
                  <div className="flex items-center justify-between gap-2 border-t border-white/10 bg-white/[0.02] px-4 py-2">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-muted">
                      {view.page === 1 ? "Các hạng tiếp theo" : `Trang ${view.page}`}
                    </span>
                    <span className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-muted">
                      {rowStart}–{view.end} / {view.total}
                    </span>
                  </div>

                  <ol aria-label="Bảng xếp hạng avatar" className="list-none">
                    {rowEntries.map((entry, index) => {
                      const rank = rowStart + index;
                      const isNew = entry.id === newId;

                      return (
                        <li
                          key={entry.id}
                          style={
                            isNew
                              ? {
                                  backgroundColor: "rgba(70,200,255,0.10)",
                                  boxShadow: "inset 3px 0 0 #46c8ff",
                                }
                              : undefined
                          }
                          className="grid grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-white/[0.06] px-3 py-3 transition-colors last:border-b-0 hover:bg-white/[0.03] sm:px-5 sm:py-4"
                        >
                          <span
                            aria-label={`Hạng ${rank}`}
                            className={cn(
                              "grid h-8 w-8 shrink-0 place-items-center rounded-lg border font-display text-sm font-extrabold leading-none sm:h-9 sm:w-9",
                              rankTone(rank),
                            )}
                          >
                            {rank}
                          </span>

                          <AvatarFrame
                            displayName={entry.displayName}
                            username={entry.username}
                            imageUrl={entry.avatarUrl}
                            sizes="48px"
                            className="h-10 w-10 rounded-lg sm:h-12 sm:w-12"
                          />

                          <div className="min-w-0">
                            <div className="flex min-w-0 items-center gap-1.5">
                              <p className="truncate font-display text-sm font-extrabold uppercase leading-tight tracking-[-0.01em] text-ink sm:text-base">
                                {entry.displayName}
                              </p>
                              {isNew && (
                                <span className="shrink-0 rounded-full border border-[rgba(70,200,255,0.4)] bg-[rgba(70,200,255,0.12)] px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase leading-none text-cyan">
                                  Mới
                                </span>
                              )}
                            </div>

                            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                              <span className="max-w-full truncate font-mono text-[10px] font-semibold text-muted">
                                @{entry.username}
                              </span>
                              <Badge tier={entry.tier} className="hidden min-[380px]:inline-flex">
                                {entry.tier}
                              </Badge>
                              <span className="font-mono text-[10px] font-normal text-muted">
                                {formatRelativeTime(entry.scannedAt, now)}
                              </span>
                            </div>
                          </div>

                          <p
                            aria-label={`${formatScore10(entry.score)} trên 10`}
                            className="neon-score whitespace-nowrap text-right font-display text-xl font-extrabold leading-none tabular-nums tracking-[-0.02em] sm:text-2xl"
                          >
                            {formatScore10(entry.score)}
                            <span className="ml-0.5 font-mono text-[10px] font-bold text-muted">
                              /10
                            </span>
                          </p>
                        </li>
                      );
                    })}
                  </ol>
                </>
              )}

              {view.totalPages > 1 && (
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 bg-white/[0.02] px-4 py-3">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-muted">
                    {view.start}–{view.end} / {view.total}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={view.page <= 1}
                      onClick={() => setPage(Math.max(1, view.page - 1))}
                      className={buttonClasses({ variant: "secondary", size: "sm" })}
                    >
                      <ChevronLeft className="h-4 w-4" aria-hidden />
                      Trước
                    </button>
                    <span className="min-w-[54px] text-center font-mono text-[11px] font-bold tabular-nums text-ink-2">
                      {view.page} / {view.totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={view.page >= view.totalPages}
                      onClick={() => setPage(Math.min(view.totalPages, view.page + 1))}
                      className={buttonClasses({ variant: "secondary", size: "sm" })}
                    >
                      Sau
                      <ChevronRight className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {mounted && view.total > 0 && (
            <p className="mt-3 font-mono text-[10px] leading-[1.7] text-muted">
              Bảng trên máy lưu trong trình duyệt này. Reset sẽ xóa cả bảng này và bảng live trên
              server.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
