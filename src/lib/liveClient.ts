import type { LiveBoardSnapshot, LiveRecordResult } from "@/lib/live";
import type { LeaderboardEntry } from "@/lib/leaderboard";

const LIVE_API = "/api/live/board";

async function errorFromResponse(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { error?: unknown };
    if (typeof body.error === "string" && body.error) return body.error;
  } catch {
    // Bỏ qua body không phải JSON.
  }
  return `Máy chủ trả về lỗi ${response.status}.`;
}

/** Gửi kết quả quét lên bảng live dùng chung trên server. */
export async function publishLiveScan(entry: LeaderboardEntry): Promise<LiveRecordResult> {
  const response = await fetch(LIVE_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
    keepalive: true,
    body: JSON.stringify({
      username: entry.username,
      displayName: entry.displayName,
      avatarUrl: entry.avatarUrl,
      score: entry.score,
      aiScore: entry.aiScore,
      tier: entry.tier,
    }),
  });

  if (!response.ok) {
    throw new Error(await errorFromResponse(response));
  }

  return (await response.json()) as LiveRecordResult;
}

/** Xóa bảng live trên server (dùng chung nút Reset của bảng cục bộ). */
export async function clearLiveBoard(): Promise<boolean> {
  const response = await fetch(LIVE_API, {
    method: "DELETE",
    cache: "no-store",
  });
  return response.ok;
}

export async function fetchLiveBoard(
  signal?: AbortSignal,
): Promise<LiveBoardSnapshot & { total: number }> {
  const response = await fetch(LIVE_API, {
    cache: "no-store",
    signal,
  });
  if (!response.ok) {
    throw new Error(await errorFromResponse(response));
  }
  return (await response.json()) as LiveBoardSnapshot & { total: number };
}
