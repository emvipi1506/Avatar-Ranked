// ===== Roblox API Types =====

export interface RobloxUser {
  id: number;
  name: string;
  displayName: string;
  hasVerifiedBadge: boolean;
}

export interface AvatarAsset {
  id: number;
  name: string;
  assetType: { id: number; name: string };
}

export interface AvatarEmote {
  assetId: number;
  assetName: string;
  position: number;
}

export interface RobloxAvatar {
  playerAvatarType: "R6" | "R15";
  assets: AvatarAsset[];
  emotes: AvatarEmote[];
}

export interface RobloxProfile {
  id: number;
  name: string;
  displayName: string;
  description: string;
  created: string;
  isBanned: boolean;
  hasVerifiedBadge: boolean;
  friendsCount: number;
  followersCount: number;
  followingCount: number;
  avatar: RobloxAvatar;
}

export interface ThumbnailResponse {
  userId: number;
  imageUrl: string | null;
}

export interface ApiError {
  error: string;
}

// ===== Rarity & Scoring Types =====

export type RarityTier =
  | "COMMON"
  | "UNCOMMON"
  | "RARE"
  | "EPIC"
  | "LEGENDARY"
  | "MYTHICAL";

export interface Rarity {
  tier: RarityTier;
  label: string;
  dropRatePercent: number; // Tỷ lệ rơi mặc định: 40%, 25%, 17%, 10%, 6%, 2%
  color: string;
  glowColor: string;
  borderColor: string;
  gradient: string;
  quote: string;
  description: string;
  soundType: "simple" | "chime" | "energy" | "glitch" | "fanfare" | "cosmic";
  visualTheme:
    | "common-simple"
    | "uncommon-emerald"
    | "rare-azure"
    | "epic-glitch"
    | "legendary-gold"
    | "mythical-cosmic";
}

export interface ScoreCriterion {
  key: "uniqueness" | "value" | "humor";
  title: string;
  subtitle: string;
  score: number; // 0 - 100
  detail: string;
}

export interface ScoreResult {
  uniqueness: ScoreCriterion;
  value: ScoreCriterion;
  humor: ScoreCriterion;
  totalScore: number; // 0 - 300
  normalizedScore: number; // 0 - 100
  rarity: Rarity;
  quote: string;
  timestamp: string;
  scanSeed: number;
}

// ===== Scanner & UI States =====

export type ScanPhase =
  | "idle" // Màn hình ban đầu
  | "searching" // Đang tìm user từ Roblox API
  | "found" // Đã tìm thấy user, hiển thị avatar & nút "SCAN MY AVATAR"
  | "init" // Phase 1: INITIALIZING AVATAR SCANNER... (~1s)
  | "scanning" // Phase 2: SCANNING AVATAR / ANALYZING STYLE (~2.5s)
  | "calculating" // Phase 3: CALCULATING RARITY... (~1s)
  | "revealing" // Phase 4: Rarity reveal animation (1-2s)
  | "done" // Hiển thị Result Card đầy đủ
  | "error"; // Lỗi

export interface TelemetryLine {
  text: string;
  status?: "ok" | "sync" | "warn";
}

export interface ScanStep {
  id: string;
  label: string;
}

