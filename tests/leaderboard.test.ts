import { describe, it, expect } from "vitest";
import {
  LEADERBOARD_MAX_ENTRIES,
  LEADERBOARD_PAGE_SIZE,
  clearLeaderboard,
  createLeaderboardEntry,
  getLeaderboardRank,
  getPageForRank,
  loadLeaderboard,
  paginateLeaderboard,
  rankLeaderboard,
  recordLeaderboardEntry,
  saveLeaderboard,
  type LeaderboardEntry,
  type LeaderboardStorage,
} from "@/lib/leaderboard";
import { mockReport, mockUser } from "@/lib/fixtures/mockReport";

function createStorage(): LeaderboardStorage & { values: Map<string, string> } {
  const values = new Map<string, string>();
  return {
    values,
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => {
      values.set(key, value);
    },
    removeItem: (key) => {
      values.delete(key);
    },
  };
}

function makeEntry(overrides: Partial<LeaderboardEntry> = {}): LeaderboardEntry {
  return {
    id: "alice",
    username: "Alice",
    displayName: "Alice",
    avatarUrl: null,
    score: 50,
    aiScore: 50,
    tier: "RARE",
    scannedAt: 1_000,
    firstScannedAt: 1_000,
    ...overrides,
  };
}

describe("Leaderboard ranking", () => {
  it("xếp theo điểm tổng, rồi điểm hệ thống, rồi lần quét sớm hơn", () => {
    const entries = [
      makeEntry({ id: "low", score: 40, aiScore: 90 }),
      makeEntry({ id: "b", score: 80, aiScore: 70, firstScannedAt: 2_000 }),
      makeEntry({ id: "a", score: 80, aiScore: 70, firstScannedAt: 1_000 }),
      makeEntry({ id: "high-ai", score: 80, aiScore: 75, firstScannedAt: 3_000 }),
    ];

    expect(rankLeaderboard(entries).map((entry) => entry.id)).toEqual([
      "high-ai",
      "a",
      "b",
      "low",
    ]);
  });

  it("getLeaderboardRank trả về vị trí 1-based", () => {
    const entries = rankLeaderboard([
      makeEntry({ id: "a", score: 90 }),
      makeEntry({ id: "b", score: 80 }),
    ]);

    expect(getLeaderboardRank(entries, "a")).toBe(1);
    expect(getLeaderboardRank(entries, "b")).toBe(2);
    expect(getLeaderboardRank(entries, "missing")).toBeNull();
  });

  it("getPageForRank chia đúng trang 6 mục", () => {
    expect(getPageForRank(1)).toBe(1);
    expect(getPageForRank(6)).toBe(1);
    expect(getPageForRank(7)).toBe(2);
    expect(getPageForRank(12)).toBe(2);
    expect(getPageForRank(13)).toBe(3);
  });
});

describe("Leaderboard pagination", () => {
  const entries = Array.from({ length: 14 }, (_, index) =>
    makeEntry({ id: `user-${index}`, username: `User${index}`, score: 100 - index }),
  );

  it("trả đúng 6 mục và thông tin trang", () => {
    const page = paginateLeaderboard(entries, 2);

    expect(LEADERBOARD_PAGE_SIZE).toBe(6);
    expect(page.items).toHaveLength(6);
    expect(page.page).toBe(2);
    expect(page.totalPages).toBe(3);
    expect(page.total).toBe(14);
    expect(page.start).toBe(7);
    expect(page.end).toBe(12);
  });

  it("kẹp số trang ngoài phạm vi và xử lý bảng trống", () => {
    expect(paginateLeaderboard(entries, 99).page).toBe(3);
    expect(paginateLeaderboard(entries, 99).items).toHaveLength(2);
    expect(paginateLeaderboard(entries, 0).page).toBe(1);

    const empty = paginateLeaderboard([], 5);
    expect(empty.page).toBe(1);
    expect(empty.totalPages).toBe(1);
    expect(empty.start).toBe(0);
    expect(empty.end).toBe(0);
  });
});

describe("Leaderboard storage", () => {
  it("lưu và đọc lại entry đã sắp xếp", () => {
    const storage = createStorage();
    const entries = [
      makeEntry({ id: "a", score: 70 }),
      makeEntry({ id: "b", score: 90 }),
    ];

    expect(saveLeaderboard(entries, storage)).toBe(true);
    expect(loadLeaderboard(storage).map((entry) => entry.id)).toEqual(["b", "a"]);
  });

  it("bỏ qua JSON hỏng và entry không hợp lệ", () => {
    const storage = createStorage();
    storage.setItem("avatar-ranked-leaderboard-v1", "{not-json");
    expect(loadLeaderboard(storage)).toEqual([]);

    storage.setItem(
      "avatar-ranked-leaderboard-v1",
      JSON.stringify({
        version: 1,
        entries: [
          { id: "ok", username: "Ok", score: 55.555, aiScore: 55.555, tier: "EPIC", scannedAt: 10, firstScannedAt: 10 },
          { id: "bad-tier", username: "Bad", score: 50, aiScore: 50, tier: "NOPE", scannedAt: 10 },
          { username: "" },
        ],
      }),
    );

    const loaded = loadLeaderboard(storage);
    expect(loaded).toHaveLength(1);
    expect(loaded[0].score).toBe(55.56);
  });

  it("loại entry trùng id, giữ bản điểm cao hơn", () => {
    const storage = createStorage();
    storage.setItem(
      "avatar-ranked-leaderboard-v1",
      JSON.stringify({
        entries: [
          makeEntry({ id: "alice", score: 60, scannedAt: 2_000 }),
          makeEntry({ id: "alice", score: 80, scannedAt: 3_000 }),
        ],
      }),
    );

    const loaded = loadLeaderboard(storage);
    expect(loaded).toHaveLength(1);
    expect(loaded[0].score).toBe(80);
  });

  it("clearLeaderboard xóa sạch dữ liệu", () => {
    const storage = createStorage();
    saveLeaderboard([makeEntry()], storage);

    expect(clearLeaderboard(storage)).toBe(true);
    expect(loadLeaderboard(storage)).toEqual([]);
  });
});

describe("recordLeaderboardEntry", () => {
  it("thêm mới đúng hạng và cập nhật khi quét lại", () => {
    const storage = createStorage();

    const alice = makeEntry({
      id: "alice",
      username: "Alice",
      score: 60,
      aiScore: 60,
      firstScannedAt: 1_000,
      scannedAt: 1_000,
    });
    const bob = makeEntry({
      id: "bob",
      username: "Bob",
      score: 80,
      aiScore: 80,
      firstScannedAt: 2_000,
      scannedAt: 2_000,
    });

    const first = recordLeaderboardEntry(alice, storage);
    expect(first.isNew).toBe(true);
    expect(first.rank).toBe(1);
    expect(first.saved).toBe(true);

    const second = recordLeaderboardEntry(bob, storage);
    expect(second.rank).toBe(1);
    expect(second.entries.map((entry) => entry.id)).toEqual(["bob", "alice"]);

    const updatedAlice = makeEntry({
      id: "alice",
      username: "ALICE",
      displayName: "Alice Mới",
      score: 95,
      aiScore: 95,
      firstScannedAt: 9_000,
      scannedAt: 9_000,
    });
    const third = recordLeaderboardEntry(updatedAlice, storage);
    expect(third.isNew).toBe(false);
    expect(third.rank).toBe(1);
    expect(third.entries).toHaveLength(2);
    expect(third.entries[0].username).toBe("ALICE");
    expect(third.entries[0].displayName).toBe("Alice Mới");
    expect(third.entries[0].firstScannedAt).toBe(1_000);
  });

  it("giới hạn số entry lưu trữ", () => {
    const storage = createStorage();
    const existing = Array.from({ length: LEADERBOARD_MAX_ENTRIES }, (_, index) =>
      makeEntry({
        id: `user-${index}`,
        username: `User${index}`,
        score: 100 - index,
        aiScore: 100 - index,
        firstScannedAt: index + 1,
      }),
    );
    saveLeaderboard(existing, storage);

    const result = recordLeaderboardEntry(
      makeEntry({ id: "newcomer", username: "Newcomer", score: 1, aiScore: 1, firstScannedAt: 99_999, scannedAt: 99_999 }),
      storage,
    );

    expect(result.entries).toHaveLength(LEADERBOARD_MAX_ENTRIES);
    expect(result.rank).toBeNull();
  });
});

describe("createLeaderboardEntry", () => {
  it("chuẩn hóa username, điểm và avatar", () => {
    const entry = createLeaderboardEntry(
      mockUser,
      mockReport,
      "https://tr.rbxcdn.com/avatar.png",
      1_234,
    );

    expect(entry.id).toBe(mockUser.name.toLowerCase());
    expect(entry.username).toBe(mockUser.name);
    expect(entry.score).toBe(Math.round(mockReport.total * 100) / 100);
    expect(entry.aiScore).toBe(Math.round(mockReport.aiScore * 100) / 100);
    expect(entry.tier).toBe(mockReport.rarity.tier);
    expect(entry.avatarUrl).toBe("https://tr.rbxcdn.com/avatar.png");
    expect(entry.scannedAt).toBe(1_234);
    expect(entry.firstScannedAt).toBe(1_234);
  });

  it("bỏ URL avatar không an toàn", () => {
    const entry = createLeaderboardEntry(mockUser, mockReport, "javascript:alert(1)");
    expect(entry.avatarUrl).toBeNull();
  });
});
