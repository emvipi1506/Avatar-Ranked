import { describe, expect, it } from "vitest";
import { mockReport } from "@/lib/fixtures/mockReport";
import {
  applySecretAccountBoost,
  isSecretAccount,
  isSecretEntryId,
  SECRET_ACCOUNT_ID,
} from "@/lib/secretAccount";

describe("secretAccount", () => {
  it("nhận đúng tài khoản chủ web", () => {
    expect(isSecretAccount(SECRET_ACCOUNT_ID)).toBe(true);
    expect(isSecretAccount(156)).toBe(false);
  });

  it("nhận đúng entry theo username, không phân biệt hoa thường", () => {
    expect(isSecretEntryId("UncIe_Rice")).toBe(true);
    expect(isSecretEntryId("uncie_rice")).toBe(true);
    expect(isSecretEntryId("builderman")).toBe(false);
  });

  it("nâng báo cáo lên MYTHICAL 100/100", () => {
    const boosted = applySecretAccountBoost(mockReport);

    expect(boosted.total).toBe(100);
    expect(boosted.aiScore).toBe(100);
    expect(boosted.rawTotal).toBe(100);
    expect(boosted.rarity.tier).toBe("MYTHICAL");
    expect(boosted.uncappedTier).toBe("MYTHICAL");
    expect(boosted.criteria.theme.score).toBe(100);
    expect(boosted.criteria.uniqueness.score).toBe(100);
    expect(boosted.criteria.humor.score).toBe(100);
    expect(boosted.criteria.value.score).toBe(100);
    expect(boosted.weaknesses).toEqual([]);
    expect(boosted.nextTier).toBeNull();
    expect(boosted.mythicalAdvice).toEqual([]);
    expect(boosted.dataQuality.capApplied).toBe(false);
  });

  it("không đụng tới điểm gu cá nhân", () => {
    const boosted = applySecretAccountBoost(mockReport);
    expect(boosted.criteria.personal).toEqual(mockReport.criteria.personal);
    expect(boosted.personalTier).toBe(mockReport.personalTier);
  });
});
