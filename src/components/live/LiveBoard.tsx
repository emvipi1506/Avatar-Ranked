"use client";

import { useEffect, useRef, useState } from "react";
import { Trophy } from "lucide-react";
import AvatarFrame from "@/components/ui/AvatarFrame";
import { cn } from "@/lib/cn";
import { formatScore10 } from "@/lib/format";
import { RARITIES } from "@/lib/rarity";
import {
  LIVE_HIGHLIGHT_MS,
  LIVE_PAGE_SIZE,
  LIVE_POLL_MS,
  LIVE_ROTATE_MS,
} from "@/lib/live";
import { fetchLiveBoard } from "@/lib/liveClient";
import {
  getPageForRank,
  paginateLeaderboard,
  type LeaderboardEntry,
} from "@/lib/leaderboard";

export interface LiveBoardProps {
  /** Vị trí bảng trên khung OBS. Mặc định bên trái để chừa chỗ cho gameplay. */
  align?: "left" | "center" | "right";
  /** Nền tối đặc thay vì trong suốt (khi preview hoặc muốn phủ toàn màn hình). */
  solid?: boolean;
}

type LiveStatus = "loading" | "live" | "offline";

function rankTone(rank: number): string {
  if (rank === 1) return "bg-lemon text-on-accent";
  if (rank === 2) return "bg-mint text-on-accent";
  if (rank === 3) return "bg-coral text-on-accent";
  return "bg-surface-2 text-ink";
}

function LiveSkeleton() {
  return (
    <div aria-hidden>
      {Array.from({ length: LIVE_PAGE_SIZE }).map((_, index) => (
        <div
          key={index}
          className="grid grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-[clamp(8px,1vw,16px)] border-b-2 border-line-soft px-[clamp(10px,1.4vw,24px)] py-[clamp(8px,0.75vw,13px)] last:border-b-0"
        >
          <div className="h-[clamp(30px,2.6vw,40px)] w-[clamp(30px,2.6vw,40px)] rounded-nb-sm border-2 border-line-soft bg-surface-2" />
          <div className="h-[clamp(42px,4.4vw,64px)] w-[clamp(42px,4.4vw,64px)] rounded-nb-sm border-2 border-line-soft bg-surface-2" />
          <div className="space-y-2">
            <div className="h-3.5 w-1/2 rounded bg-surface-2" />
            <div className="h-2.5 w-1/3 rounded bg-surface-2" />
          </div>
          <div className="h-6 w-16 rounded bg-surface-2" />
        </div>
      ))}
    </div>
  );
}

export default function LiveBoard({ align = "left", solid = false }: LiveBoardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [status, setStatus] = useState<LiveStatus>("loading");
  const [page, setPage] = useState(1);
  const [newId, setNewId] = useState<string | null>(null);

  const lastScannedAt = useRef<number | null>(null);
  const highlightTimer = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    let pollTimer: number | null = null;
    let controller: AbortController | null = null;

    const poll = async () => {
      controller = new AbortController();
      try {
        const data = await fetchLiveBoard(controller.signal);
        if (cancelled) return;

        setStatus("live");
        setEntries(data.entries);

        if (data.entries.length === 0) {
          lastScannedAt.current = 0;
          setPage(1);
          setNewId(null);
          if (highlightTimer.current !== null) {
            window.clearTimeout(highlightTimer.current);
            highlightTimer.current = null;
          }
          return;
        }

        const latest = data.entries.reduce((best, entry) =>
          entry.scannedAt > best.scannedAt ? entry : best,
        );

        if (lastScannedAt.current === null) {
          lastScannedAt.current = latest.scannedAt;
        } else if (latest.scannedAt > lastScannedAt.current) {
          lastScannedAt.current = latest.scannedAt;

          const rank = data.entries.findIndex((entry) => entry.id === latest.id) + 1;
          setPage(getPageForRank(rank, LIVE_PAGE_SIZE));
          setNewId(latest.id);

          if (highlightTimer.current !== null) {
            window.clearTimeout(highlightTimer.current);
          }
          highlightTimer.current = window.setTimeout(() => {
            setNewId(null);
            highlightTimer.current = null;
          }, LIVE_HIGHLIGHT_MS);
        }
      } catch (error) {
        if (cancelled || (error instanceof Error && error.name === "AbortError")) return;
        setStatus("offline");
      } finally {
        if (!cancelled) {
          pollTimer = window.setTimeout(() => void poll(), LIVE_POLL_MS);
        }
      }
    };

    void poll();

    return () => {
      cancelled = true;
      controller?.abort();
      if (pollTimer !== null) window.clearTimeout(pollTimer);
      if (highlightTimer.current !== null) {
        window.clearTimeout(highlightTimer.current);
        highlightTimer.current = null;
      }
    };
  }, []);

  const view = paginateLeaderboard(entries, page, LIVE_PAGE_SIZE);

  useEffect(() => {
    if (page > view.totalPages) setPage(view.totalPages);
  }, [page, view.totalPages]);

  useEffect(() => {
    if (view.totalPages <= 1) return;
    const timer = window.setTimeout(
      () => setPage((current) => (current >= view.totalPages ? 1 : current + 1)),
      newId ? LIVE_ROTATE_MS + LIVE_HIGHLIGHT_MS : LIVE_ROTATE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [newId, page, view.totalPages]);

  const isInitialLoading = status === "loading" && entries.length === 0;

  return (
    <div
      data-theme="dark"
      className={cn(
        "live-shell flex min-h-dvh w-full font-body text-ink",
        solid ? "bg-cream" : "bg-transparent",
        align === "center" && "justify-center",
        align === "right" && "justify-end",
        align === "left" && "justify-start",
        "items-start p-[clamp(10px,1.6vw,32px)]",
      )}
    >
      <main className="w-full max-w-[980px]">
        <section
          aria-labelledby="live-board-title"
          className="overflow-hidden border-3 border-ink bg-surface shadow-hard-4"
        >
          <div className="flex items-center justify-between gap-3 border-b-3 border-ink bg-lemon px-4 py-3 text-on-accent sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center border-3 border-ink bg-[var(--c-footer-bg)] font-display text-base font-extrabold leading-none text-lemon">
                AR
              </span>
              <div className="min-w-0">
                <p className="truncate font-display text-[clamp(15px,1.2vw,20px)] font-extrabold uppercase leading-none tracking-[-0.01em]">
                  Avatar Ranked
                </p>
                <p className="mt-1 truncate font-mono text-[8px] font-bold uppercase tracking-[0.14em] sm:text-[9px]">
                  Roast · Rate · Rank
                </p>
              </div>
            </div>

            <span
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-[3px] border-2 border-ink px-2 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.08em] shadow-hard-1 sm:text-[10px]",
                status === "offline"
                  ? "bg-danger-bg text-danger"
                  : "bg-[var(--c-footer-bg)] text-lemon",
              )}
            >
              <span
                className={cn(
                  "h-2 w-2 rounded-full bg-current",
                  status === "live" && "animate-pulse",
                )}
                aria-hidden
              />
              {status === "offline" ? "Offline" : "Live"}
            </span>
          </div>

          <div className="flex items-end justify-between gap-4 border-b-2 border-line-soft px-4 py-4 sm:px-6 sm:py-5">
            <div className="min-w-0">
              <p className="font-mono text-[clamp(9px,0.7vw,11px)] font-bold uppercase tracking-[0.18em] text-coral-ink">
                Hall of drip · Live
              </p>
              <h1
                id="live-board-title"
                className="mt-1 font-display text-[clamp(26px,3.2vw,50px)] font-extrabold uppercase leading-[0.9] tracking-[-0.03em] text-ink"
              >
                Bảng xếp hạng
              </h1>
            </div>

            <div className="shrink-0 text-right">
              <p className="font-display text-[clamp(30px,3.2vw,52px)] font-extrabold leading-none tabular-nums tracking-[-0.03em] text-ink">
                {String(entries.length).padStart(2, "0")}
              </p>
              <p className="mt-1 font-mono text-[8px] font-bold uppercase tracking-[0.16em] text-muted sm:text-[9px]">
                Avatar
              </p>
            </div>
          </div>

          {isInitialLoading ? (
            <LiveSkeleton />
          ) : entries.length === 0 ? (
            <div className="px-6 py-[clamp(34px,5vw,64px)] text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border-3 border-ink bg-lemon text-on-accent shadow-hard-2">
                <Trophy className="h-7 w-7" aria-hidden />
              </span>
              <p className="mt-4 font-display text-[clamp(18px,2vw,28px)] font-extrabold uppercase leading-tight text-ink">
                Đang chờ lượt quét đầu tiên
              </p>
              <p className="mx-auto mt-2 max-w-[46ch] text-sm leading-[1.5] text-ink-2">
                Quét avatar trong mục Chấm avatar — bảng live tự cập nhật tại đây.
              </p>
            </div>
          ) : (
            <ol aria-label="Bảng xếp hạng live" className="list-none">
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
                    className="grid grid-cols-[auto_auto_minmax(0,1fr)_auto] items-center gap-[clamp(8px,1vw,16px)] border-b-2 border-line-soft px-[clamp(10px,1.4vw,24px)] py-[clamp(8px,0.75vw,13px)] last:border-b-0"
                  >
                    <span
                      aria-label={`Hạng ${rank}`}
                      className={cn(
                        "grid h-[clamp(30px,2.6vw,40px)] w-[clamp(30px,2.6vw,40px)] shrink-0 place-items-center rounded-nb-sm border-2 border-ink font-display text-[clamp(13px,1.1vw,19px)] font-extrabold leading-none shadow-hard-1",
                        rankTone(rank),
                      )}
                    >
                      {rank}
                    </span>

                    <AvatarFrame
                      displayName={entry.displayName}
                      username={entry.username}
                      imageUrl={entry.avatarUrl}
                      sizes="64px"
                      priority={index < 3}
                      className="h-[clamp(42px,4.4vw,64px)] w-[clamp(42px,4.4vw,64px)] shrink-0 rounded-nb-sm"
                    />

                    <div className="min-w-0">
                      <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                        <p className="max-w-full truncate font-display text-[clamp(15px,1.3vw,26px)] font-extrabold uppercase leading-tight tracking-[-0.01em] text-ink">
                          {entry.displayName}
                        </p>
                        {isNew && (
                          <span className="shrink-0 rounded-[3px] border-2 border-ink bg-lemon px-1 py-0.5 font-mono text-[clamp(9px,0.7vw,13px)] font-bold uppercase leading-none text-on-accent">
                            Mới
                          </span>
                        )}
                      </div>

                      <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="max-w-full truncate font-mono text-[clamp(9px,0.75vw,14px)] font-bold text-muted">
                          @{entry.username}
                        </span>
                        <span
                          className="inline-flex shrink-0 items-center rounded-[3px] border-2 border-ink px-1 py-0.5 font-mono text-[clamp(9px,0.7vw,13px)] font-bold uppercase leading-none tracking-[0.03em] text-on-accent"
                          style={{ backgroundColor: RARITIES[entry.tier].color }}
                        >
                          {entry.tier}
                        </span>
                      </div>
                    </div>

                    <p
                      aria-label={`${formatScore10(entry.score)} trên 10`}
                      className="whitespace-nowrap text-right font-display font-extrabold leading-none tabular-nums tracking-[-0.03em] text-ink"
                    >
                      <span className="text-[clamp(23px,2.2vw,40px)]">
                        {formatScore10(entry.score)}
                      </span>
                      <span className="ml-1 font-mono text-[clamp(8px,0.62vw,11px)] font-bold text-muted">
                        /10
                      </span>
                    </p>
                  </li>
                );
              })}
            </ol>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 border-t-3 border-ink bg-surface-2 px-4 py-2.5 sm:px-6">
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-muted sm:text-[10px]">
              {view.total === 0
                ? "Chưa có dữ liệu"
                : `${view.start}–${view.end} / ${view.total} avatar`}
            </p>

            {view.totalPages > 1 && (
              <div className="flex items-center gap-1.5" role="group" aria-label="Chọn trang">
                {Array.from({ length: view.totalPages }).map((_, index) => {
                  const pageNumber = index + 1;
                  return (
                    <button
                      key={pageNumber}
                      type="button"
                      aria-label={`Trang ${pageNumber}`}
                      aria-current={pageNumber === view.page ? "page" : undefined}
                      onClick={() => setPage(pageNumber)}
                      className={cn(
                        "h-2.5 w-2.5 border-2 border-ink transition-colors",
                        pageNumber === view.page ? "bg-ink" : "bg-transparent",
                      )}
                    />
                  );
                })}
              </div>
            )}

            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-muted sm:text-[10px]">
              {status === "offline"
                ? "Đang thử lại…"
                : `Trang ${view.page}/${view.totalPages} · Tự động`}
            </p>
          </div>

          {status === "offline" && (
            <div
              role="status"
              className="border-t-2 border-ink bg-warning-bg px-4 py-2 font-mono text-[9px] font-bold uppercase tracking-[0.04em] text-warning sm:px-6 sm:text-[10px]"
            >
              Mất kết nối tới server — bảng sẽ tự cập nhật lại.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
