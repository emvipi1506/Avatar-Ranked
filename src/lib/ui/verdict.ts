import { RARITIES } from "@/lib/rarity";
import { formatScore10, formatScore100 } from "@/lib/format";
import type { RarityTier, RobloxUser, ScoreReport } from "@/types";

export type VerdictTone = "roast" | "neutral" | "praise" | "legendary" | "mythical";
export type VerdictBubbleTone = "praise" | "roast" | "tip";

export interface VerdictView {
  tier: RarityTier;
  tierLabel: string;
  stamp: string;
  tone: VerdictTone;
  quote: string;
}

const TIER_VERDICT: Record<RarityTier, { stamp: string; tone: VerdictTone; quote: string }> = {
  COMMON: { stamp: "NEEDS WORK", tone: "roast", quote: "Fit cơ bản. Chưa có gì để nổ." },
  UNCOMMON: { stamp: "NOT BAD", tone: "neutral", quote: "Ổn đấy, bạn bắt đầu có gu rồi." },
  RARE: { stamp: "CERTIFIED DRIP", tone: "praise", quote: "Avatar này thật sự nổi bật." },
  EPIC: { stamp: "MAIN CHARACTER", tone: "praise", quote: "Phát hiện năng lượng nhân vật chính." },
  LEGENDARY: { stamp: "HALL OF FAME", tone: "legendary", quote: "Bộ fit này xứng đáng vào bảng vàng." },
  MYTHICAL: { stamp: "AVATAR GOD", tone: "mythical", quote: "Thần avatar đã giáng trần." },
};

/** Quote tiếng Việt theo tier — dùng chung cho verdict hero, landing và bảng điểm. */
export function getTierQuote(tier: RarityTier): string {
  return TIER_VERDICT[tier].quote;
}

/** Mapping tier → stamp/tone là hợp đồng thuần, không phụ thuộc UI. */
export function getVerdictView(report: ScoreReport): VerdictView {
  const { stamp, tone } = TIER_VERDICT[report.rarity.tier];
  return {
    tier: report.rarity.tier,
    tierLabel: report.rarity.label,
    stamp,
    tone,
    quote: getTierQuote(report.rarity.tier),
  };
}

export interface VerdictBubble {
  tone: VerdictBubbleTone;
  speaker: string;
  text: string;
}

/** Cắt tại ranh giới từ, không cắt giữa emoji/từ. */
export function truncateText(text: string, maxLength = 180): string {
  const clean = text.trim().replace(/\s+/g, " ");
  if (clean.length <= maxLength) return clean;
  const cut = clean.slice(0, maxLength - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return `${cut.slice(0, lastSpace > 60 ? lastSpace : cut.length).trimEnd()}…`;
}

/** 3 bubble cố định: khen, roast, gợi ý — luôn có fallback, không bịa dữ liệu mới. */
export function getVerdictBubbles(report: ScoreReport): VerdictBubble[] {
  const praise = report.strengths[0] ?? report.rarity.description;
  const roast = report.secretAccount
    ? (report.weaknesses[0] ?? "Không có gì để chê. Đáng ngờ.")
    : (report.weaknesses[0] ??
      report.limitations[0] ??
      "Không có gì để chê. Đáng ngờ.");
  const tip = report.secretAccount
    ? "Không cần thêm gì cả — bộ fit này đã đạt chuẩn MYTHICAL tuyệt đối."
    : (report.outfitRecommendations[0] ??
      report.nextTier?.steps[0] ??
      report.mythicalAdvice[0] ??
      "Thử thêm một phụ kiện tối màu để tăng chiều sâu cho silhouette.");

  return [
    { tone: "praise", speaker: "THE JUDGE", text: truncateText(praise) },
    { tone: "roast", speaker: "THE ROASTER", text: truncateText(roast) },
    { tone: "tip", speaker: "THE STYLIST", text: truncateText(tip) },
  ];
}

export function getPersonalLabel(report: ScoreReport): string {
  if (report.personalTier === null) return "Chưa chọn";
  return `${RARITIES[report.personalTier].label} · ${report.personalScore ?? 0}đ`;
}

export function getFormulaLabel(report: ScoreReport): string {
  return report.personalTier === null ? "100% hệ thống" : "75% hệ thống + 25% gu";
}

export interface ShareTextInput {
  user: RobloxUser;
  report: ScoreReport;
  url: string;
}

export function getShareText({ user, report, url }: ShareTextInput): string {
  const verdict = getVerdictView(report);
  const aestheticNames =
    report.categorizedTags?.aestheticTags
      ?.slice(0, 4)
      .map((tag) => tag.name)
      .join(", ") || report.dominantStyle?.label || "Tự do";

  return [
    "🎮 AVATAR RANKED REPORT",
    `👤 ${user.displayName} (@${user.name})`,
    `✨ ${verdict.tierLabel} · ${formatScore10(report.total)}/10 (${formatScore100(report.total)}/100)`,
    `🏷️ Stamp: ${verdict.stamp}`,
    `❤️ Gu cá nhân: ${getPersonalLabel(report)} · ${getFormulaLabel(report)}`,
    `🎨 Phong cách: ${aestheticNames}`,
    `📊 Hệ thống ${formatScore100(report.aiScore)}/100 · Chủ đề ${formatScore100(report.criteria.theme.score ?? 0)}, Độc lạ ${formatScore100(report.criteria.uniqueness.score ?? 0)}, Hài hước ${formatScore100(report.criteria.humor.score ?? 0)}, Giá trị ${formatScore100(report.criteria.value.score ?? 0)}`,
    `🌐 ${url}`,
  ].join("\n");
}
