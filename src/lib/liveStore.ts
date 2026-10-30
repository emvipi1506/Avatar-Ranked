import { promises as fs } from "node:fs";
import path from "node:path";
import { Redis } from "@upstash/redis";
import {
  LIVE_MAX_ENTRIES,
  mergeLiveEntry,
  type LiveBoardSnapshot,
  type LiveRecordResult,
} from "@/lib/live";
import {
  rankLeaderboard,
  sanitizeLeaderboardEntry,
  type LeaderboardEntry,
} from "@/lib/leaderboard";

/**
 * Bảng live dùng một store chung, không dùng localStorage.
 *
 * - Khi có Upstash Redis (Vercel Marketplace / Vercel KV), dùng Redis REST.
 * - Khi không có env, fallback về file JSON cho `next dev` / `next start`
 *   trên máy stream (hướng A).
 *
 * Filesystem trên Vercel chỉ đọc, nên production bắt buộc phải có Redis.
 */
const STORE_VERSION = 1;
const DATA_DIR = path.join(process.cwd(), "server", "data");
const STORE_FILE = path.join(DATA_DIR, "live-leaderboard.json");
const REDIS_KEY = "avatar-ranked:live-board:v1";

const REDIS_URL =
  process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL ?? "";
const REDIS_TOKEN =
  process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN ?? "";

const redis =
  REDIS_URL && REDIS_TOKEN ? new Redis({ url: REDIS_URL, token: REDIS_TOKEN }) : null;

/**
 * "Trùm bí mật" của web: luôn giữ hạng 1 trên bảng live.
 * Chỉ được ghép vào lúc đọc, không ghi vào file và không bị Reset xóa.
 * Đây là content bí mật, không đụng tới bảng localStorage của người xem.
 */
const SECRET_ENTRY: LeaderboardEntry = {
  id: "uncie_rice",
  username: "Uncie_Rice",
  displayName: "CRISPYPORK",
  avatarUrl:
    "https://tr.rbxcdn.com/30DAY-Avatar-5921A0FB63D01764281FE9082B1B1565-Png/720/720/Avatar/Png/noFilter",
  score: 100,
  aiScore: 100,
  tier: "MYTHICAL",
  scannedAt: 0,
  firstScannedAt: 0,
};

/** Ghép entry bí mật vào danh sách đọc từ file, loại bản trùng nếu có. */
function withSecretEntry(entries: readonly LeaderboardEntry[]): LeaderboardEntry[] {
  return rankLeaderboard([
    ...entries.filter((entry) => entry.id !== SECRET_ENTRY.id),
    SECRET_ENTRY,
  ]).slice(0, LIVE_MAX_ENTRIES);
}

interface StoreFile {
  version: number;
  updatedAt: number;
  entries: LeaderboardEntry[];
}

let writeQueue: Promise<void> = Promise.resolve();

/** Nối các lần ghi để hai lượt quét cùng lúc không đè dữ liệu của nhau. */
function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = writeQueue.then(task, task);
  writeQueue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function emptyStore(): StoreFile {
  return { version: STORE_VERSION, updatedAt: 0, entries: [] };
}

function sanitizeStore(value: unknown): StoreFile {
  if (!value || typeof value !== "object") return emptyStore();
  const raw = value as Record<string, unknown>;
  const list = Array.isArray(raw.entries) ? raw.entries : [];

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

  return {
    version: STORE_VERSION,
    updatedAt:
      typeof raw.updatedAt === "number" && Number.isFinite(raw.updatedAt)
        ? raw.updatedAt
        : 0,
    entries: rankLeaderboard([...byId.values()]).slice(0, LIVE_MAX_ENTRIES),
  };
}

async function readStore(): Promise<StoreFile> {
  try {
    if (redis) {
      return sanitizeStore(await redis.get<unknown>(REDIS_KEY));
    }

    const raw = await fs.readFile(STORE_FILE, "utf8");
    return sanitizeStore(JSON.parse(raw) as unknown);
  } catch {
    return emptyStore();
  }
}

async function writeStore(store: StoreFile): Promise<void> {
  if (redis) {
    await redis.set(REDIS_KEY, store);
    return;
  }

  await fs.mkdir(DATA_DIR, { recursive: true });
  const payload = `${JSON.stringify(store, null, 2)}\n`;
  const tempFile = `${STORE_FILE}.${process.pid}.tmp`;

  await fs.writeFile(tempFile, payload, "utf8");
  try {
    await fs.rename(tempFile, STORE_FILE);
  } catch {
    // Một số cấu hình Windows chặn rename đè file; ghi thẳng là phương án dự phòng.
    await fs.writeFile(STORE_FILE, payload, "utf8");
    await fs.unlink(tempFile).catch(() => undefined);
  }
}

export async function getLiveSnapshot(): Promise<LiveBoardSnapshot> {
  const store = await readStore();
  return { entries: withSecretEntry(store.entries), updatedAt: store.updatedAt };
}

export async function recordLiveEntry(next: LeaderboardEntry): Promise<LiveRecordResult> {
  return enqueue(async () => {
    const current = await readStore();
    const now = Date.now();
    const merged = mergeLiveEntry(current.entries, next, now);

    if (!merged.changed) {
      return {
        entries: merged.entries,
        rank: merged.rank,
        isNew: false,
        changed: false,
        updatedAt: current.updatedAt,
      };
    }

    const store: StoreFile = {
      version: STORE_VERSION,
      updatedAt: now,
      entries: merged.entries,
    };
    await writeStore(store);

    return {
      entries: store.entries,
      rank: merged.rank,
      isNew: merged.isNew,
      changed: true,
      updatedAt: store.updatedAt,
    };
  });
}

export async function clearLiveEntries(): Promise<LiveBoardSnapshot> {
  return enqueue(async () => {
    const store: StoreFile = { ...emptyStore(), updatedAt: Date.now() };
    await writeStore(store);
    return { entries: store.entries, updatedAt: store.updatedAt };
  });
}
