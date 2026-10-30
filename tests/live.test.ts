import { describe, expect, it } from "vitest";
import {
  LIVE_MAX_ENTRIES,
  mergeLiveEntry,
  parseLiveScan,
  type LiveScanPayload,
} from "@/lib/live";
import type { LeaderboardEntry } from "@/lib/leaderboard";

const NOW = 1_700_000_000_000;

function makeEntry(overrides: Partial<LeaderboardEntry> = {}): LeaderboardEntry {
  return {
    id: "alice",
    username: "Alice",
    displayName: "Alice",
    avatarUrl: null,
    score: 50,
    aiScore: 50,
    tier: "RARE",
    scannedAt: NOW,
    firstScannedAt: NOW,
    ...overrides,
  };
}

function payload(overrides: Partial<LiveScanPayload> = {}): LiveScanPayload {
  return {
    username: "BuilderMan",
    displayName: "Builder Man",
    avatarUrl: "https://tr.rbxcdn.com/avatar.png",
    score: 46.555,
    aiScore: 46.555,
    tier: "RARE",
    ...overrides,
  };
}

describe("parseLiveScan", () => {
  it("chuẩn hóa username, điểm, avatar và thời gian", () => {
    const parsed = parseLiveScan(payload(), NOW);
    expect("entry" in parsed).toBe(true);
    if (!("entry" in parsed)) return;

    expect(parsed.entry.id).toBe("builderman");
    expect(parsed.entry.username).toBe("BuilderMan");
    expect(parsed.entry.displayName).toBe("Builder Man");
    expect(parsed.entry.score).toBe(46.56);
    expect(parsed.entry.aiScore).toBe(46.56);
    expect(parsed.entry.tier).toBe("RARE");
    expect(parsed.entry.avatarUrl).toBe("https://tr.rbxcdn.com/avatar.png");
    expect(parsed.entry.scannedAt).toBe(NOW);
    expect(parsed.entry.firstScannedAt).toBe(NOW);
  });

  it("bỏ URL avatar không an toàn và fallback displayName", () => {
    const parsed = parseLiveScan(
      payload({ avatarUrl: "javascript:alert(1)", displayName: "  " }),
      NOW,
    );
    if (!("entry" in parsed)) throw new Error("Payload hợp lệ nhưng bị từ chối.");

    expect(parsed.entry.avatarUrl).toBeNull();
    expect(parsed.entry.displayName).toBe("BuilderMan");
  });

  it("từ chối username, điểm và bậc không hợp lệ", () => {
    expect(parseLiveScan(payload({ username: "ab" }), NOW)).toHaveProperty("error");
    expect(parseLiveScan(payload({ username: "bad name" }), NOW)).toHaveProperty("error");
    expect(parseLiveScan(payload({ score: Number.NaN }), NOW)).toHaveProperty("error");
    expect(parseLiveScan(payload({ tier: "NOPE" as LiveScanPayload["tier"] }), NOW)).toHaveProperty(
      "error",
    );
    expect(parseLiveScan(null, NOW)).toHaveProperty("error");
  });
});

describe("mergeLiveEntry", () => {
  it("thêm entry mới, giữ đúng hạng", () => {
    const current = [makeEntry({ id: "top", username: "Top", score: 90 })];
    const result = mergeLiveEntry(current, makeEntry({ id: "new", username: "New", score: 95 }), NOW + 1);

    expect(result.changed).toBe(true);
    expect(result.isNew).toBe(true);
    expect(result.rank).toBe(1);
    expect(result.entries.map((entry) => entry.id)).toEqual(["new", "top"]);
  });

  it("cập nhật điểm nhưng giữ firstScannedAt", () => {
    const current = [
      makeEntry({ id: "alice", score: 60, firstScannedAt: NOW - 5_000, scannedAt: NOW - 5_000 }),
    ];
    const next = makeEntry({ id: "alice", username: "ALICE", score: 80, scannedAt: NOW });
    const result = mergeLiveEntry(current, next, NOW + 2_000);

    expect(result.changed).toBe(true);
    expect(result.isNew).toBe(false);
    expect(result.entry?.score).toBe(80);
    expect(result.entry?.username).toBe("ALICE");
    expect(result.entry?.firstScannedAt).toBe(NOW - 5_000);
    expect(result.entry?.scannedAt).toBe(NOW + 2_000);
  });

  it("không ghi lại khi nội dung không đổi", () => {
    const existing = makeEntry({ id: "alice", score: 80, scannedAt: NOW - 1_000, firstScannedAt: NOW - 2_000 });
    const result = mergeLiveEntry([existing], makeEntry({ id: "alice", score: 80 }), NOW + 5_000);

    expect(result.changed).toBe(false);
    expect(result.entry).toBe(existing);
    expect(result.entries[0].scannedAt).toBe(NOW - 1_000);
  });

  it("bỏ entry mới nếu bảng đã đầy và điểm thấp hơn top cuối", () => {
    const current = Array.from({ length: LIVE_MAX_ENTRIES }, (_, index) =>
      makeEntry({
        id: `user-${index}`,
        username: `User${index}`,
        score: 100 - index,
        aiScore: 100 - index,
        firstScannedAt: index + 1,
      }),
    );
    const result = mergeLiveEntry(
      current,
      makeEntry({ id: "newcomer", username: "Newcomer", score: 0, aiScore: 0 }),
      NOW,
    );

    expect(result.changed).toBe(false);
    expect(result.rank).toBeNull();
    expect(result.entries).toHaveLength(LIVE_MAX_ENTRIES);
  });
});
