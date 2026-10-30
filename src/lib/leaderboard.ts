import { clampScore } from "@/lib/format";
import { RARITIES } from "@/lib/rarity";
import type { RarityTier, RobloxUser, ScoreReport } from "@/types";

/** Một dòng trong bảng xếp hạng lịch sử (lưu cục bộ trên trình duyệt). */
export interface LeaderboardEntry {
  /** Khóa ổn định, lowercase username. */
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  /** Điểm tổng thang 100 (điểm chính hiển thị /10). */
  score: number;
  /** Điểm hệ thống thang 100, dùng để phân định khi điểm tổng bằng nhau. */
  aiScore: number;
  tier: RarityTier;
  /** Lần quét gần nhất (epoch ms). */
  scannedAt: number;
  /** Lần đầu xuất hiện trên bảng, dùng để phân định thứ tự ổn định. */
  firstScannedAt: number;
}

export interface LeaderboardPage {
  items: LeaderboardEntry[];
  page: number;
  totalPages: number;
  total: number;
  /** Vị trí 1-based của mục đầu/cuối trên toàn bảng; 0 khi bảng trống. */
  start: number;
  end: number;
}

export interface RecordLeaderboardResult {
  entries: LeaderboardEntry[];
  rank: number | null;
  isNew: boolean;
  /** false khi trình duyệt chặn localStorage. */
  saved: boolean;
}

export type LeaderboardStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

export const LEADERBOARD_STORAGE_KEY = "avatar-ranked-leaderboard-v1";
export const LEADERBOARD_PAGE_SIZE = 6;
/** Giữ tối đa 100 avatar để localStorage không phình vô hạn. */
export const LEADERBOARD_MAX_ENTRIES = 100;

const STORAGE_VERSION = 1;
const HIGHLIGHT_MS = 8000;

export function leaderboardHighlightMs(): number {
  return HIGHLIGHT_MS;
}

function getDefaultStorage(): LeaderboardStorage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function roundLeaderboardScore(value: number): number {
  return Math.round(clampScore(value) * 100) / 100;
}

export function normalizeAvatarUrl(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null;
  return value.startsWith("https://") || value.startsWith("/") ? value : null;
}

export function leaderboardId(username: string): string {
  return username.trim().toLowerCase();
}

/** Xếp hạng: điểm tổng → điểm hệ thống → ai đạt mốc sớm hơn → tên. */
export function rankLeaderboard(entries: readonly LeaderboardEntry[]): LeaderboardEntry[] {
  return [...entries].sort(
    (a, b) =>
      b.score - a.score ||
      b.aiScore - a.aiScore ||
      a.firstScannedAt - b.firstScannedAt ||
      a.id.localeCompare(b.id),
  );
}

export function getLeaderboardRank(
  entries: readonly LeaderboardEntry[],
  id: string,
): number | null {
  const index = entries.findIndex((entry) => entry.id === id);
  return index === -1 ? null : index + 1;
}

export function getPageForRank(rank: number, pageSize = LEADERBOARD_PAGE_SIZE): number {
  const safePageSize = Math.max(1, Math.trunc(pageSize) || 1);
  const safeRank = Math.max(1, Math.trunc(rank) || 1);
  return Math.floor((safeRank - 1) / safePageSize) + 1;
}

export function paginateLeaderboard(
  entries: readonly LeaderboardEntry[],
  page: number,
  pageSize = LEADERBOARD_PAGE_SIZE,
): LeaderboardPage {
  const size = Math.max(1, Math.trunc(pageSize) || 1);
  const total = entries.length;
  const totalPages = Math.max(1, Math.ceil(total / size));
  const safePage = Math.min(Math.max(1, Math.trunc(page) || 1), totalPages);
  const startIndex = (safePage - 1) * size;
  const items = entries.slice(startIndex, startIndex + size);

  return {
    items,
    page: safePage,
    totalPages,
    total,
    start: total === 0 ? 0 : startIndex + 1,
    end: Math.min(total, startIndex + size),
  };
}

export function createLeaderboardEntry(
  user: RobloxUser,
  report: ScoreReport,
  imageUrl: string | null,
  now = Date.now(),
): LeaderboardEntry {
  return {
    id: leaderboardId(user.name),
    username: user.name,
    displayName: user.displayName || user.name,
    avatarUrl: normalizeAvatarUrl(imageUrl),
    score: roundLeaderboardScore(report.total),
    aiScore: roundLeaderboardScore(report.aiScore),
    tier: report.rarity.tier,
    scannedAt: now,
    firstScannedAt: now,
  };
}

export function sanitizeLeaderboardEntry(value: unknown): LeaderboardEntry | null {
  if (!value || typeof value !== "object") return null;
  const raw = value as Record<string, unknown>;

  const username = typeof raw.username === "string" ? raw.username.trim() : "";
  const id = typeof raw.id === "string" ? raw.id.trim().toLowerCase() : leaderboardId(username);
  if (!id || !username) return null;

  const score = typeof raw.score === "number" && Number.isFinite(raw.score) ? raw.score : null;
  const aiScore = typeof raw.aiScore === "number" && Number.isFinite(raw.aiScore) ? raw.aiScore : null;
  const scannedAt =
    typeof raw.scannedAt === "number" && Number.isFinite(raw.scannedAt) ? raw.scannedAt : null;
  const firstScannedAt =
    typeof raw.firstScannedAt === "number" && Number.isFinite(raw.firstScannedAt)
      ? raw.firstScannedAt
      : scannedAt;
  const tier =
    typeof raw.tier === "string" && raw.tier in RARITIES ? (raw.tier as RarityTier) : null;

  if (score === null || aiScore === null || scannedAt === null || firstScannedAt === null || !tier) {
    return null;
  }

  return {
    id,
    username,
    displayName: typeof raw.displayName === "string" && raw.displayName.trim()
      ? raw.displayName.trim()
      : username,
    avatarUrl: normalizeAvatarUrl(
      typeof raw.avatarUrl === "string" ? raw.avatarUrl : null,
    ),
    score: roundLeaderboardScore(score),
    aiScore: roundLeaderboardScore(aiScore),
    tier,
    scannedAt,
    firstScannedAt,
  };
}

/** Đọc + làm sạch dữ liệu; dữ liệu hỏng không làm sập trang. */
export function loadLeaderboard(
  storage: LeaderboardStorage | null = getDefaultStorage(),
): LeaderboardEntry[] {
  if (!storage) return [];
  try {
    const raw = storage.getItem(LEADERBOARD_STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    const list = Array.isArray(parsed)
      ? parsed
      : parsed && typeof parsed === "object" && Array.isArray((parsed as { entries?: unknown }).entries)
        ? (parsed as { entries: unknown[] }).entries
        : [];

    const byId = new Map<string, LeaderboardEntry>();
    for (const item of list) {
      const entry = sanitizeLeaderboardEntry(item);
      if (!entry) continue;
      const existing = byId.get(entry.id);
      if (
        !existing ||
        entry.score > existing.score ||
        (entry.score === existing.score && entry.scannedAt > existing.scannedAt)
      ) {
        byId.set(entry.id, entry);
      }
    }

    return rankLeaderboard([...byId.values()]).slice(0, LEADERBOARD_MAX_ENTRIES);
  } catch {
    return [];
  }
}

export function saveLeaderboard(
  entries: readonly LeaderboardEntry[],
  storage: LeaderboardStorage | null = getDefaultStorage(),
): boolean {
  if (!storage) return false;
  try {
    storage.setItem(
      LEADERBOARD_STORAGE_KEY,
      JSON.stringify({ version: STORAGE_VERSION, entries }),
    );
    return true;
  } catch {
    return false;
  }
}

export function clearLeaderboard(
  storage: LeaderboardStorage | null = getDefaultStorage(),
): boolean {
  if (!storage) return false;
  try {
    storage.removeItem(LEADERBOARD_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

/**
 * Thêm mới hoặc cập nhật theo username (không phân biệt hoa/thường),
 * giữ nguyên firstScannedAt rồi xếp lại toàn bảng.
 */
export function recordLeaderboardEntry(
  next: LeaderboardEntry,
  storage: LeaderboardStorage | null = getDefaultStorage(),
): RecordLeaderboardResult {
  const current = loadLeaderboard(storage);
  const existing = current.find((entry) => entry.id === next.id);
  const merged: LeaderboardEntry = existing
    ? { ...next, firstScannedAt: existing.firstScannedAt }
    : next;

  const entries = rankLeaderboard([
    ...current.filter((entry) => entry.id !== next.id),
    merged,
  ]).slice(0, LEADERBOARD_MAX_ENTRIES);

  const saved = saveLeaderboard(entries, storage);
  const rank = getLeaderboardRank(entries, next.id);

  return { entries, rank, isNew: !existing, saved };
}
