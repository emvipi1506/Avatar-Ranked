import {
  LEADERBOARD_MAX_ENTRIES,
  getLeaderboardRank,
  leaderboardId,
  normalizeAvatarUrl,
  rankLeaderboard,
  roundLeaderboardScore,
  type LeaderboardEntry,
} from "@/lib/leaderboard";
import { isValidUsername } from "@/lib/roblox";
import { RARITIES } from "@/lib/rarity";
import type { RarityTier } from "@/types";

/** Giới hạn số entry lưu trên server, giống bảng cục bộ. */
export const LIVE_MAX_ENTRIES = LEADERBOARD_MAX_ENTRIES;

export interface LiveBoardSnapshot {
  entries: LeaderboardEntry[];
  updatedAt: number;
}

/** Payload client gửi lên sau khi quét xong. */
export interface LiveScanPayload {
  username: string;
  displayName?: string;
  avatarUrl?: string | null;
  score: number;
  aiScore: number;
  tier: RarityTier;
}

export interface LiveRecordResult {
  entries: LeaderboardEntry[];
  rank: number | null;
  isNew: boolean;
  changed: boolean;
  updatedAt: number;
}

export interface LiveMergeResult {
  entries: LeaderboardEntry[];
  rank: number | null;
  isNew: boolean;
  changed: boolean;
  entry: LeaderboardEntry | null;
}

/**
 * Kiểm tra payload từ client và dựng entry. Server tự đặt mốc thời gian,
 * không tin timestamp do trình duyệt gửi lên.
 */
export function parseLiveScan(
  value: unknown,
  now = Date.now(),
): { entry: LeaderboardEntry } | { error: string } {
  if (!value || typeof value !== "object") {
    return { error: "Body phải là JSON hợp lệ." };
  }

  const raw = value as Record<string, unknown>;
  const username = typeof raw.username === "string" ? raw.username.trim() : "";
  if (!isValidUsername(username)) {
    return { error: "Username gồm 3–20 ký tự: chữ, số hoặc dấu gạch dưới." };
  }

  const score = typeof raw.score === "number" && Number.isFinite(raw.score) ? raw.score : null;
  const aiScore =
    typeof raw.aiScore === "number" && Number.isFinite(raw.aiScore) ? raw.aiScore : null;
  if (score === null || aiScore === null) {
    return { error: "Điểm không hợp lệ." };
  }

  const tier = typeof raw.tier === "string" && raw.tier in RARITIES
    ? (raw.tier as RarityTier)
    : null;
  if (!tier) {
    return { error: "Bậc avatar không hợp lệ." };
  }

  const displayName =
    typeof raw.displayName === "string" && raw.displayName.trim()
      ? raw.displayName.trim().slice(0, 40)
      : username;

  return {
    entry: {
      id: leaderboardId(username),
      username,
      displayName,
      avatarUrl: normalizeAvatarUrl(
        typeof raw.avatarUrl === "string" ? raw.avatarUrl : null,
      ),
      score: roundLeaderboardScore(score),
      aiScore: roundLeaderboardScore(aiScore),
      tier,
      scannedAt: now,
      firstScannedAt: now,
    },
  };
}

/**
 * Gộp entry vào bảng server. Quét lại cùng username sẽ cập nhật điểm nhưng
 * giữ firstScannedAt; nếu nội dung không đổi thì không ghi file và không làm
 * bảng live nhấp nháy lại.
 */
export function mergeLiveEntry(
  current: readonly LeaderboardEntry[],
  next: LeaderboardEntry,
  now = Date.now(),
): LiveMergeResult {
  const existing = current.find((entry) => entry.id === next.id);
  const changed =
    !existing ||
    existing.score !== next.score ||
    existing.aiScore !== next.aiScore ||
    existing.tier !== next.tier ||
    existing.displayName !== next.displayName ||
    existing.avatarUrl !== next.avatarUrl;

  if (existing && !changed) {
    const ranked = rankLeaderboard(current);
    return {
      entries: ranked,
      rank: getLeaderboardRank(ranked, next.id),
      isNew: false,
      changed: false,
      entry: existing,
    };
  }

  const merged: LeaderboardEntry = {
    ...next,
    scannedAt: now,
    firstScannedAt: existing?.firstScannedAt ?? next.firstScannedAt,
  };

  const ranked = rankLeaderboard([
    ...current.filter((entry) => entry.id !== next.id),
    merged,
  ]).slice(0, LIVE_MAX_ENTRIES);
  const rank = getLeaderboardRank(ranked, merged.id);

  if (rank === null) {
    return {
      entries: [...current],
      rank: null,
      isNew: false,
      changed: false,
      entry: null,
    };
  }

  return {
    entries: ranked,
    rank,
    isNew: !existing,
    changed: true,
    entry: merged,
  };
}
