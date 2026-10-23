import type { DataQuality, Rarity, RarityTier } from "@/types";

/** Thứ tự từ thấp đến cao — nguồn duy nhất cho mọi so sánh bậc. */
export const TIER_ORDER: readonly RarityTier[] = ["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY", "MYTHICAL"];

/** Bậc cao nhất được phép khi dữ liệu chưa đầy đủ. */
export const MAX_TIER_WHEN_DATA_INCOMPLETE: RarityTier = "LEGENDARY";

export const RARITIES: Record<RarityTier, Rarity> = {
  COMMON: {
    tier: "COMMON",
    label: "COMMON",
    minScore: 0,
    personalScore: 0,
    color: "#94A3B8",
    glowColor: "rgba(148, 163, 184, 0.3)",
    borderColor: "rgba(148, 163, 184, 0.4)",
    gradient: "linear-gradient(135deg, #F8FAFC 0%, #94A3B8 50%, #475569 100%)",
    quote: "Simple fit. Nothing too crazy.",
    description: "Trang phục tối giản, gọn gàng, phong cách khởi đầu quen thuộc.",
    soundType: "simple",
    visualTheme: "common-simple",
  },
  UNCOMMON: {
    tier: "UNCOMMON",
    label: "UNCOMMON",
    minScore: 15,
    personalScore: 15,
    color: "#4ADE80",
    glowColor: "rgba(74, 222, 128, 0.45)",
    borderColor: "rgba(74, 222, 128, 0.6)",
    gradient: "linear-gradient(135deg, #BBF7D0 0%, #4ADE80 50%, #16A34A 100%)",
    quote: "Okay, you've got some style.",
    description: "Đã có gu thẩm mỹ riêng, biết cách phối đồ và chọn phụ kiện hài hòa.",
    soundType: "chime",
    visualTheme: "uncommon-emerald",
  },
  RARE: {
    tier: "RARE",
    label: "RARE",
    minScore: 35,
    personalScore: 35,
    color: "#38BDF8",
    glowColor: "rgba(56, 189, 248, 0.6)",
    borderColor: "rgba(56, 189, 248, 0.75)",
    gradient: "linear-gradient(135deg, #BAE6FD 0%, #38BDF8 50%, #0284C7 100%)",
    quote: "This avatar actually stands out.",
    description: "Nổi bật rõ rệt trong mọi server, phong cách ấn tượng và bắt mắt.",
    soundType: "energy",
    visualTheme: "rare-azure",
  },
  EPIC: {
    tier: "EPIC",
    label: "EPIC",
    minScore: 60,
    personalScore: 60,
    color: "#C084FC",
    glowColor: "rgba(192, 132, 252, 0.7)",
    borderColor: "rgba(192, 132, 252, 0.85)",
    gradient: "linear-gradient(135deg, #F3E8FF 0%, #C084FC 50%, #7E22CE 100%)",
    quote: "Main character energy detected.",
    description: "Tỏa ra thần thái nhân vật chính, các chi tiết được chau chuốt kỹ lưỡng.",
    soundType: "glitch",
    visualTheme: "epic-glitch",
  },
  LEGENDARY: {
    tier: "LEGENDARY",
    label: "LEGENDARY",
    minScore: 80,
    personalScore: 80,
    color: "#FBBF24",
    glowColor: "rgba(251, 191, 36, 0.85)",
    borderColor: "rgba(251, 191, 36, 0.95)",
    gradient: "linear-gradient(135deg, #FEF3C7 0%, #FBBF24 45%, #D97706 100%)",
    quote: "Your fit belongs in the hall of fame.",
    description: "Bộ skin đẳng cấp đỉnh cao, hào quang vương giả khiến ai cũng phải ngưỡng mộ.",
    soundType: "fanfare",
    visualTheme: "legendary-gold",
  },
  MYTHICAL: {
    tier: "MYTHICAL",
    label: "MYTHICAL",
    minScore: 92,
    personalScore: 100,
    color: "#FF007F",
    glowColor: "rgba(255, 0, 127, 0.95)",
    borderColor: "rgba(255, 0, 127, 1)",
    gradient: "linear-gradient(135deg, #FF66B2 0%, #FF007F 35%, #8B5CF6 70%, #06B6D4 100%)",
    quote: "THE AVATAR GOD HAS ARRIVED.",
    description: "Đỉnh cao tuyệt đối: chủ đề, độ độc lạ, ý tưởng và giá trị đều xuất sắc cùng lúc.",
    soundType: "cosmic",
    visualTheme: "mythical-cosmic",
  },
};

export const RARITIES_LIST: Rarity[] = TIER_ORDER.map((t) => RARITIES[t]);

export function tierIndex(tier: RarityTier): number {
  return TIER_ORDER.indexOf(tier);
}

/** Phân loại điểm tổng (0-100) theo ngưỡng 0 / 15 / 35 / 60 / 80 / 92. */
export function getRarityForScore(score: number): RarityTier {
  const safe = Number.isFinite(score) ? score : 0;
  for (let i = TIER_ORDER.length - 1; i >= 0; i--) {
    if (safe >= RARITIES[TIER_ORDER[i]].minScore) return TIER_ORDER[i];
  }
  return "COMMON";
}

/** Hạ bậc xuống tối đa `maxTier`, không bao giờ nâng bậc. */
export function capTier(tier: RarityTier, maxTier: RarityTier): RarityTier {
  return tierIndex(tier) > tierIndex(maxTier) ? maxTier : tier;
}

/** Áp quy tắc chất lượng dữ liệu: dữ liệu chưa đầy đủ thì tối đa LEGENDARY. */
export function applyDataQualityCap(
  tier: RarityTier,
  level: DataQuality["level"],
): { tier: RarityTier; capApplied: boolean } {
  if (level === "complete") return { tier, capApplied: false };
  const capped = capTier(tier, MAX_TIER_WHEN_DATA_INCOMPLETE);
  return { tier: capped, capApplied: capped !== tier };
}
