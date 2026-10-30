import { RARITIES } from "@/lib/rarity";
import type { ScoreReport } from "@/types";

/**
 * Tài khoản chủ web.
 *
 * - Luôn hiện MYTHICAL khi có người quét, để giữ "easter egg" cá nhân.
 * - Không bao giờ xuất hiện trên bảng live công khai (overlay / OBS).
 *
 * Chỉ áp cho đúng một user ID, không đụng tới công thức chấm điểm chung.
 */
export const SECRET_ACCOUNT_ID = 179921294;
export const SECRET_USERNAME = "UncIe_Rice";
export const SECRET_ENTRY_ID = SECRET_USERNAME.toLowerCase();

export function isSecretAccount(userId: number): boolean {
  return userId === SECRET_ACCOUNT_ID;
}

export function isSecretEntryId(id: string): boolean {
  return id.trim().toLowerCase() === SECRET_ENTRY_ID;
}

/** Nâng báo cáo của tài khoản chủ web lên MYTHICAL 100/100. */
export function applySecretAccountBoost(report: ScoreReport): ScoreReport {
  const curated = {
    theme: {
      summary: "Chủ đề cực kỳ rõ ràng, bảng màu và phụ kiện đồng bộ hoàn hảo.",
      evidence: [
        "Toàn bộ trang phục xoay quanh một concept thống nhất.",
        "Bảng màu và silhouette hỗ trợ lẫn nhau.",
      ],
    },
    uniqueness: {
      summary: "Silhouette và cách phối đồ khác biệt hoàn toàn so với số đông.",
      evidence: [
        "Kết hợp phụ kiện độc đáo, gần như không trùng lặp.",
        "Tạo dấu ấn riêng ngay từ cái nhìn đầu tiên.",
      ],
    },
    humor: {
      summary: "Concept hài hước đặc sắc, biểu cảm gây ấn tượng mạnh.",
      evidence: [
        "Chi tiết gây cười được đặt đúng chỗ.",
        "Tạo được khoảnh khắc meme dễ nhớ.",
      ],
    },
    value: {
      summary: "Trang phục được đầu tư kỹ, giá trị vật phẩm nổi bật.",
      evidence: [
        "Các vật phẩm chính đều có giá trị catalog.",
        "Tổng giá trị trang bị ở mức ấn tượng.",
      ],
    },
  } as const;

  const criteria = { ...report.criteria };
  for (const key of ["theme", "uniqueness", "humor", "value"] as const) {
    criteria[key] = {
      ...criteria[key],
      score: 100,
      confidence: "high",
      summary: curated[key].summary,
      evidence: [...curated[key].evidence],
    };
  }

  return {
    ...report,
    criteria,
    aiScore: 100,
    total: 100,
    rawTotal: 100,
    uncappedTier: "MYTHICAL",
    rarity: RARITIES.MYTHICAL,
    dataQuality: { level: "complete", issues: [], capApplied: false },
    strengths: [
      "Được chủ web chứng nhận MYTHICAL — trang phục đạt chuẩn thẩm mỹ cao nhất của bảng xếp hạng.",
      ...report.strengths.filter((line) => !/\(\d+\/100\)/.test(line)),
    ],
    weaknesses: [],
    outfitRecommendations: [],
    nextTier: null,
    mythicalAdvice: [],
    secretAccount: true,
  };
}
