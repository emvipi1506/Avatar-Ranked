"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Trash2, TriangleAlert, Trophy } from "lucide-react";
import AvatarFrame from "@/components/ui/AvatarFrame";
import Card from "@/components/ui/Card";
import { buttonClasses } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { formatRelativeTime, formatScore10 } from "@/lib/format";
import { clearLiveBoard, publishLiveScan } from "@/lib/liveClient";
import { RARITIES } from "@/lib/rarity";
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

function rankTone(rank: number): string {
  if (rank === 1) return "bg-lemon text-on-accent";
  if (rank === 2) return "bg-mint text-on-accent";
  if (rank === 3) return "bg-coral text-on-accent";
  return "bg-surface-2 text-ink";
}

function LeaderboardSkeleton() {
  return (
    <Card padding="none" className="overflow-hidden" aria-hidden>
      <div className="border-b-2 border-line-soft px-4 py-3">
        <div className="h-3 w-44 rounded bg-surface-2" />
      </div>
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 border-b-2 border-line-soft px-3 py-3 last:border-b-0 sm:px-5"
        >
          <div className="h-9 w-9 rounded-nb-sm bg-surface-2" />
          <div className="h-10 w-10 rounded-nb-sm bg-surface-2" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/2 rounded bg-surface-2" />
            <div className="h-2.5 w-1/3 rounded bg-surface-2" />
          </div>
          <div className="h-6 w-12 rounded bg-surface-2" />
        </div>
      ))}
    </Card>
  );
}

export default function LeaderboardSection({
  className,
  headingLevel = "h2",
  eyebrow,
  title = "Bảng xếp hạng",
  description = "Xếp theo điểm tổng /10. Avatar vừa quét tự động vào đúng hạng — 6 mục mỗi trang.",
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
    <section
      aria-labelledby="leaderboard-title"
      className={cn("nb-section", className)}
    >
      <div className="nb-container max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[length:var(--fs-xs)] font-bold uppercase tracking-[0.1em] text-coral-ink">
              {mounted ? eyebrowText : "Lịch sử quét"}
            </p>
            <Heading
              ref={headingRef}
              id="leaderboard-title"
              tabIndex={-1}
              className={cn(
                "mt-2 max-w-[16ch] font-display font-extrabold uppercase leading-[0.95] tracking-[-0.02em] text-ink",
                headingLevel === "h1"
                  ? "text-[length:var(--fs-3xl)]"
                  : "text-[length:var(--fs-2xl)]",
              )}
            >
              {title}
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
                "mb-4 flex items-start gap-2.5 rounded-nb-md border-3 border-ink px-4 py-3 shadow-hard-2",
                notice.tone === "success"
                  ? "bg-mint text-on-accent"
                  : "bg-warning-bg text-warning",
              )}
            >
              <Trophy className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <p className="text-sm font-bold leading-[1.5]">{notice.text}</p>
            </div>
          )}

          {liveError && (
            <div
              role="status"
              className="mb-4 flex items-start gap-2.5 rounded-nb-md border-3 border-ink bg-warning-bg px-4 py-3 text-warning shadow-hard-2"
            >
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              <p className="text-sm font-bold leading-[1.5]">{liveError}</p>
            </div>
          )}

          {!mounted ? (
            <LeaderboardSkeleton />
          ) : view.total === 0 ? (
            <Card padding="lg" className="text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border-3 border-ink bg-lemon text-on-accent shadow-hard-2">
                <Trophy className="h-7 w-7" aria-hidden />
              </span>
              <h3 className="mt-4 font-display text-xl font-extrabold uppercase tracking-[-0.01em] text-ink">
                Bảng đang trống
              </h3>
              <p className="mx-auto mt-2 max-w-[42ch] text-sm leading-[1.6] text-ink-2">
                Quét avatar đầu tiên để mở bảng xếp hạng. Mỗi lượt quét sẽ tự động thêm
                người chơi vào đúng hạng.
              </p>
              <Link
                href="/scan"
                className={buttonClasses({ variant: "primary", size: "md", className: "mt-5" })}
              >
                Chấm avatar đầu tiên
              </Link>
            </Card>
          ) : (
            <Card padding="none" className="overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-line-soft px-4 py-3">
                {confirmingReset ? (
                  <div
                    role="group"
                    aria-label="Xác nhận xóa bảng xếp hạng"
                    className="flex w-full flex-wrap items-center justify-between gap-2"
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
                  <>
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-muted">
                      {view.total} avatar · Trang {view.page}/{view.totalPages}
                    </p>
                    <button
                      ref={resetTriggerRef}
                      type="button"
                      onClick={() => setConfirmingReset(true)}
                      className={buttonClasses({ variant: "ghost", size: "sm" })}
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden />
                      Reset
                    </button>
                  </>
                )}
              </div>

              <ol aria-label="Bảng xếp hạng avatar" className="list-none divide-y-2 divide-line-soft">
                {view.items.map((entry, index) => {
                  const rank = view.start + index;
                  const isNew = entry.id === newId;

                  return (
                    <li
                      key={entry.id}
                      style={
                        isNew
                          ? {
                              backgroundColor: "var(--c-highlight-bg)",
                              outline: "3px solid var(--c-highlight-line)",
                              outlineOffset: "-3px",
                            }
                          : undefined
                      }
                      className="grid grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-3 px-3 py-3 sm:px-5 sm:py-4"
                    >
                      <span
                        aria-label={`Hạng ${rank}`}
                        className={cn(
                          "grid h-8 w-8 shrink-0 place-items-center rounded-nb-sm border-2 border-ink font-display text-sm font-extrabold leading-none shadow-hard-1 sm:h-9 sm:w-9",
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
                        className="h-10 w-10 rounded-nb-sm sm:h-12 sm:w-12"
                      />

                      <div className="min-w-0">
                        <div className="flex min-w-0 items-center gap-1.5">
                          <p className="truncate font-display text-sm font-extrabold uppercase leading-tight tracking-[-0.01em] text-ink sm:text-base">
                            {entry.displayName}
                          </p>
                          {isNew && (
                            <span className="shrink-0 rounded-[3px] border-2 border-ink bg-lemon px-1 py-0.5 font-mono text-[9px] font-bold uppercase leading-none text-on-accent">
                              Mới
                            </span>
                          )}
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="max-w-full truncate font-mono text-[10px] font-bold text-muted">
                            @{entry.username}
                          </span>
                          <span
                            className="inline-flex shrink-0 items-center rounded-[3px] border-2 border-ink px-1 py-0.5 font-mono text-[9px] font-bold uppercase leading-none tracking-[0.03em] text-on-accent"
                            style={{ backgroundColor: RARITIES[entry.tier].color }}
                          >
                            {entry.tier}
                          </span>
                          <span className="font-mono text-[10px] font-normal text-muted">
                            {formatRelativeTime(entry.scannedAt, now)}
                          </span>
                        </div>
                      </div>

                      <p
                        aria-label={`${formatScore10(entry.score)} trên 10`}
                        className="whitespace-nowrap text-right font-display text-xl font-extrabold leading-none tabular-nums tracking-[-0.02em] text-ink sm:text-2xl"
                      >
                        {formatScore10(entry.score)}
                        <span className="ml-0.5 font-mono text-[10px] font-bold text-muted">/10</span>
                      </p>
                    </li>
                  );
                })}
              </ol>

              {view.totalPages > 1 && (
                <div className="flex flex-wrap items-center justify-between gap-2 border-t-2 border-line-soft px-4 py-3">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-muted">
                    {view.start}–{view.end} / {view.total}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={view.page <= 1}
                      onClick={() => setPage(Math.max(1, view.page - 1))}
                      className={buttonClasses({ variant: "ghost", size: "sm" })}
                    >
                      <ChevronLeft className="h-4 w-4" aria-hidden />
                      Trước
                    </button>
                    <button
                      type="button"
                      disabled={view.page >= view.totalPages}
                      onClick={() => setPage(Math.min(view.totalPages, view.page + 1))}
                      className={buttonClasses({ variant: "ghost", size: "sm" })}
                    >
                      Sau
                      <ChevronRight className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                </div>
              )}
            </Card>
          )}

          {mounted && view.total > 0 && (
            <p className="mt-3 font-mono text-[10px] leading-[1.6] text-muted">
              Bảng trên máy lưu trong trình duyệt này. Reset sẽ xóa cả bảng này và bảng
              live trên server.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
