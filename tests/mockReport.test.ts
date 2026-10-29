import { describe, it, expect } from "vitest";
import { mockProfile, mockReport, mockUser } from "@/lib/fixtures/mockReport";

describe("Fixture mockReport cho preview UI", () => {
  it("nhất quán với user/profile và trạng thái 'Chưa chọn'", () => {
    expect(mockUser.id).toBe(mockProfile.id);
    expect(mockUser.name).toBe(mockProfile.name);
    expect(mockReport.personalTier).toBeNull();
    expect(mockReport.personalScore).toBeNull();
    expect(mockReport.personalWeight).toBe(0);
    expect(mockReport.aiWeight).toBe(1);
    expect(mockReport.total).toBe(mockReport.aiScore);
    expect(mockReport.criteria.personal.score).toBeNull();
  });

  it("dùng đúng thang điểm và tier mẫu", () => {
    expect(mockReport.total).toBe(85);
    expect(mockReport.rarity.tier).toBe("LEGENDARY");
    expect(mockReport.criteria.theme.score).toBe(90);
    expect(mockReport.value.available).toBe(true);
    expect(mockReport.dataQuality.level).toBe("complete");
  });
});
