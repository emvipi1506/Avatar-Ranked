import { describe, it, expect } from "vitest";
import { RARITIES } from "@/lib/rarity";
import { mockReport, mockUser } from "@/lib/fixtures/mockReport";
import {
  getFormulaLabel,
  getPersonalLabel,
  getShareText,
  getVerdictBubbles,
  getVerdictView,
  truncateText,
} from "@/lib/ui/verdict";
import type { RarityTier, ScoreReport } from "@/types";

function withTier(tier: RarityTier, overrides: Partial<ScoreReport> = {}): ScoreReport {
  return { ...mockReport, rarity: RARITIES[tier], uncappedTier: tier, ...overrides };
}

describe("Verdict mapping", () => {
  it("map đủ 6 tier sang stamp đã chốt", () => {
    expect(getVerdictView(withTier("COMMON")).stamp).toBe("NEEDS WORK");
    expect(getVerdictView(withTier("UNCOMMON")).stamp).toBe("NOT BAD");
    expect(getVerdictView(withTier("RARE")).stamp).toBe("CERTIFIED DRIP");
    expect(getVerdictView(withTier("EPIC")).stamp).toBe("MAIN CHARACTER");
    expect(getVerdictView(withTier("LEGENDARY")).stamp).toBe("HALL OF FAME");
    expect(getVerdictView(withTier("MYTHICAL")).stamp).toBe("AVATAR GOD");
  });

  it("tone đi theo tier, không phụ thuộc điểm lẻ", () => {
    expect(getVerdictView(withTier("COMMON")).tone).toBe("roast");
    expect(getVerdictView(withTier("RARE")).tone).toBe("praise");
    expect(getVerdictView(withTier("MYTHICAL")).tone).toBe("mythical");
  });
});

describe("Verdict bubbles", () => {
  it("lấy strengths/weaknesses/outfitRecommendations theo thứ tự", () => {
    const bubbles = getVerdictBubbles(mockReport);
    expect(bubbles).toHaveLength(3);
    expect(bubbles[0]).toMatchObject({ tone: "praise", speaker: "THE JUDGE", text: mockReport.strengths[0] });
    expect(bubbles[1]).toMatchObject({ tone: "roast", speaker: "THE ROASTER", text: mockReport.weaknesses[0] });
    expect(bubbles[2]).toMatchObject({
      tone: "tip",
      speaker: "THE STYLIST",
      text: mockReport.outfitRecommendations[0],
    });
  });

  it("fallback an toàn khi report thiếu mảng", () => {
    const empty = withTier("COMMON", {
      strengths: [],
      weaknesses: [],
      limitations: [],
      outfitRecommendations: [],
      nextTier: null,
      mythicalAdvice: [],
    });
    const bubbles = getVerdictBubbles(empty);
    expect(bubbles[0].text).toBe(RARITIES.COMMON.description);
    expect(bubbles[1].text).toContain("Đáng ngờ");
    expect(bubbles[2].text.length).toBeGreaterThan(0);
  });

  it("cắt text dài tại ranh giới từ và thêm dấu …", () => {
    const text = "một hai ba bốn năm sáu bảy tám chín mười";
    const cut = truncateText(text, 20);
    expect(cut.endsWith("…")).toBe(true);
    expect(cut.length).toBeLessThanOrEqual(21);
    expect(cut).not.toContain("mườ…");
  });
});

describe("Personal taste copy", () => {
  it("null hiển thị 'Chưa chọn' và 100% hệ thống", () => {
    expect(getPersonalLabel(mockReport)).toBe("Chưa chọn");
    expect(getFormulaLabel(mockReport)).toBe("100% hệ thống");
  });

  it("đã chọn hiển thị tier + điểm và công thức 75/25", () => {
    const report = { ...mockReport, personalTier: "RARE" as const, personalScore: 35 };
    expect(getPersonalLabel(report)).toBe("RARE · 35đ");
    expect(getFormulaLabel(report)).toBe("75% hệ thống + 25% gu");
  });
});

describe("Share text", () => {
  it("có score /10, /100, personal và URL", () => {
    const text = getShareText({ user: mockUser, report: mockReport, url: "http://localhost:3000/scan?u=builderman" });
    expect(text).toContain("builderman");
    expect(text).toContain("8.5/10");
    expect(text).toContain("85/100");
    expect(text).toContain("Chưa chọn");
    expect(text).toContain("100% hệ thống");
    expect(text).toContain("http://localhost:3000/scan?u=builderman");
  });
});
