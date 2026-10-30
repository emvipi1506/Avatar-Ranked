import { promises as fs } from "node:fs";
import path from "node:path";
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
 * Bảng live dùng file JSON chung trên server, không dùng localStorage.
 * Chỉ phù hợp khi chạy `next start` / `next dev` trên máy stream (hướng A).
 * Trên serverless (Vercel...) filesystem không ghi bền được.
 */
const STORE_VERSION = 1;
const DATA_DIR = path.join(process.cwd(), "server", "data");
const STORE_FILE = path.join(DATA_DIR, "live-leaderboard.json");

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
    const raw = await fs.readFile(STORE_FILE, "utf8");
    return sanitizeStore(JSON.parse(raw) as unknown);
  } catch {
    return emptyStore();
  }
}

async function writeStore(store: StoreFile): Promise<void> {
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
  return { entries: store.entries, updatedAt: store.updatedAt };
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
