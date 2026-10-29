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

export interface AvatarScales {
  height: number;
  width: number;
  head: number;
  depth: number;
  proportion: number;
  bodyType: number;
}

/** Màu cơ thể dạng hex không có dấu # (ví dụ "F5CD30"), lấy từ avatar API v2. */
export interface AvatarBodyColors {
  headColor3: string;
  torsoColor3: string;
  rightArmColor3: string;
  leftArmColor3: string;
  rightLegColor3: string;
  leftLegColor3: string;
}

export interface RobloxAvatar {
  playerAvatarType: "R6" | "R15";
  assets: AvatarAsset[];
  emotes: AvatarEmote[];
  bodyColors: AvatarBodyColors | null;
  scales: AvatarScales | null;
  defaultShirtApplied: boolean;
  defaultPantsApplied: boolean;
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

// ===== Catalog (giá Robux) =====

/**
 * - priced: đang bán, có giá > 0 đã xác minh
 * - free: đang bán với giá 0 (khác với thiếu dữ liệu)
 * - offsale: không còn bán / Not For Sale
 * - limited: Limited / LimitedU / Collectible — giá bán lại ≠ giá catalog nên không tính
 * - no-price: catalog có vật phẩm nhưng không có giá riêng (thường là phần của bundle)
 * - unverified: catalog không trả về vật phẩm này
 */
export type CatalogPriceStatus = "priced" | "free" | "offsale" | "limited" | "no-price" | "unverified";

export interface CatalogItemInfo {
  id: number;
  status: CatalogPriceStatus;
  /** Chỉ có giá trị khi status là "priced" (> 0) hoặc "free" (= 0). */
  price: number | null;
  favoriteCount: number | null;
  restrictions: string[];
}

export interface CatalogSummary {
  items: CatalogItemInfo[];
  fetchedAt: string;
}

// ===== Phân tích màu ảnh avatar =====

export type PaletteHarmony = "neutral" | "monochrome" | "analogous" | "complementary" | "triadic" | "mixed";

export interface PaletteColor {
  hex: string;
  hue: number; // 0-360
  share: number; // 0-1, tỷ lệ trên các pixel có màu
}

export interface PaletteStats {
  /** Số pixel avatar đã phân tích (đã bỏ nền trong suốt). */
  sampledPixels: number;
  colors: PaletteColor[];
  hueClusters: number;
  chromaticShare: number; // 0-1
  averageSaturation: number; // 0-1
  harmony: PaletteHarmony;
  harmonyScore: number; // 0-1
}

// ===== Rarity =====

export type RarityTier = "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY" | "MYTHICAL";

export interface Rarity {
  tier: RarityTier;
  label: string;
  /** Điểm tổng tối thiểu (0-100) để đạt bậc này. */
  minScore: number;
  /** Điểm tham khảo khi người dùng chọn bậc này ở thanh "Hợp gu cá nhân". */
  personalScore: number;
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

// ===== Scoring =====

export type CriterionKey = "theme" | "uniqueness" | "humor" | "value" | "personal";

export type Confidence = "high" | "medium" | "low";

export interface CriterionResult {
  key: CriterionKey;
  label: string;
  labelVi: string;
  /** null = không đủ dữ liệu để chấm (được tính là 0 trong điểm tổng, không tự điền). */
  score: number | null;
  weight: number;
  confidence: Confidence;
  summary: string;
  evidence: string[];
}

export type StyleKey =
  | "y2k"
  | "goth"
  | "cyberpunk"
  | "streetwear"
  | "oldmoney"
  | "grunge"
  | "fantasy"
  | "techwear"
  | "coquette"
  | "kawaii"
  | "sporty"
  | "meme"
  | "cosplay"
  | "minimalism"
  | "maximalism";

export interface StyleMatch {
  style: StyleKey;
  label: string;
  /** Số "đơn vị trang phục" khớp (bundle tính là 1). */
  itemCount: number;
  /** Bằng chứng: tên vật phẩm + từ khóa khớp, hoặc mô tả cấu trúc. */
  evidence: string[];
  source: "keywords" | "structure";
}

export interface CosplayMatchInfo {
  category: "anime" | "movie" | "fantasy" | "game";
  franchise: string;
  character: string;
  matchedKeyword: string;
  assetName: string;
}

export type ExcludedReason = "offsale" | "limited" | "no-price" | "unverified";

export interface ValueBreakdown {
  /** false khi không gọi được catalog → không có điểm Đắt tiền. */
  available: boolean;
  totalRobux: number;
  /** Tổng sau khi áp trần từng món — dùng để chấm điểm. */
  scoredRobux: number;
  pricedCount: number;
  freeCount: number;
  priced: { id: number; name: string; price: number }[];
  excluded: { id: number; name: string; reason: ExcludedReason }[];
  /** Tỷ lệ vật phẩm trang phục có trạng thái giá đã xác minh (0-1). */
  coverage: number;
  duplicatesRemoved: number;
}

export type DataQualityLevel = "complete" | "partial" | "insufficient";

export interface DataQuality {
  level: DataQualityLevel;
  issues: string[];
  /** true nếu bậc tự động bị giới hạn xuống LEGENDARY do dữ liệu. */
  capApplied: boolean;
}

export interface TierAdvice {
  target: RarityTier;
  pointsNeeded: number;
  steps: string[];
}

export interface DetectedStyleInfo {
  id: string;
  name: string;
  confidence: Confidence;
  confidenceScore: number;
  evidence: string[];
  missingEvidence: string[];
  itemCount: number;
}

export interface AlternativeHypothesis {
  characterName: string;
  franchiseName: string;
  confidence: number;
  rationale: string;
}

export interface SearchSourceReference {
  query: string;
  title: string;
  url?: string;
  snippet?: string;
  supports: string;
}

export interface CategorizedStyleTags {
  aestheticTags: {
    id: string;
    name: string;
    confidence: Confidence;
    isPrimary?: boolean;
    isSecondary?: boolean;
    evidence: string[];
  }[];
  cosplayTags: {
    character: string;
    status: "confirmed" | "likely" | "possible" | "unconfirmed" | "unknown";
    confidence: number;
    evidence: string[];
  }[];
  fandomTags: {
    franchise: string;
    franchiseType?: string;
    evidence: string[];
  }[];
  categoryTags: {
    name: "Meme" | "Animal" | "Celebrity" | "Footballer" | "Cartoon" | string;
    evidence: string[];
  }[];
}

export interface CosplayRecognitionResult {
  isCosplay: boolean;
  characterName: string | null;
  franchiseName: string | null;
  franchiseType: string | null;
  primaryAesthetic: string | null;
  secondaryAesthetics: string[];
  confidence: number; // 0 - 1
  supportingEvidence: string[];
  visualEvidence: string[];
  contradictingEvidence: string[];
  matchingItems: string[];
  unmatchedFeatures: string[];
  alternativeHypotheses: AlternativeHypothesis[];
  searchSources: SearchSourceReference[];
  identificationStatus: "confirmed" | "likely" | "possible" | "unconfirmed" | "unknown";
  explanation: string;

  // Trường tương thích ngược
  identified?: boolean;
  franchise?: string | null;
  confidenceLevel?: "high" | "medium" | "insufficient";
  supportingDetails?: string[];
  mismatchedDetails?: string[];
  aesthetic?: string[];
}

export interface ScoreReport {
  criteria: Record<CriterionKey, CriterionResult>;
  /** Điểm AI hệ thống (0-100) từ 4 tiêu chí tự động (chiếm 75% điểm tổng). */
  aiScore: number;
  /** Trọng số của AI (75% = 0.75). */
  aiWeight: number;
  /** Điểm thẩm mỹ do bạn chấm bằng thanh trượt (chiếm 25% điểm tổng). */
  personalScore: number;
  /** Bậc gu cá nhân đã chọn. */
  personalTier: RarityTier;
  /** Trọng số của gu cá nhân (25% = 0.25). */
  personalWeight: number;
  /** Điểm tổng cuối cùng = round(aiScore * 0.75 + personalScore * 0.25). */
  total: number;
  /** Điểm thô thực tế chưa làm tròn để xác định Rarity chuẩn xác. */
  rawTotal: number;
  /** Bậc theo điểm thuần, trước khi áp giới hạn chất lượng dữ liệu. */
  uncappedTier: RarityTier;
  rarity: Rarity;
  dataQuality: DataQuality;
  value: ValueBreakdown;
  styles: StyleMatch[];
  dominantStyle: StyleMatch | null;
  /** Phong cách chính nhận diện từ Catalog 270 Style */
  primaryStyle: DetectedStyleInfo | null;
  /** Các phong cách phụ nhận diện từ Catalog 270 Style */
  secondaryStyles: DetectedStyleInfo[];
  /** Phân loại đầy đủ các style tags: Aesthetic, Cosplay, Fandom, Category */
  categorizedTags: CategorizedStyleTags;
  /** Kết quả nhận diện Cosplay Anime, Phim ảnh, Fantasy */
  cosplayResult: CosplayRecognitionResult;
  /** Danh sách nhận diện cosplay anime/phim/fantasy (tương thích ngược). */
  cosplayDetections: CosplayMatchInfo[];
  strengths: string[];
  weaknesses: string[];
  /** Đề xuất nâng cấp outfit cụ thể dựa trên outfit thực tế */
  outfitRecommendations: string[];
  nextTier: TierAdvice | null;
  mythicalAdvice: string[];
  limitations: string[];
  analysisMethod: "rule-based";
}

// ===== Scanner & UI States =====

export type ScanPhase =
  | "idle"
  | "searching"
  | "found"
  | "init"
  | "scanning"
  | "calculating"
  | "revealing"
  | "done"
  | "error";

export interface ScanStep {
  id: string;
  label: string;
}
