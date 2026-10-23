import { describe, it, expect } from "vitest";
import { calculateAvatarRank } from "@/lib/scoring";
import { getRarityForScore, applyDataQualityCap, RARITIES } from "@/lib/rarity";
import { classifyCatalogItem, uniqueAssetIds, RawCatalogItem } from "@/lib/catalog";
import type { RobloxProfile, CatalogSummary } from "@/types";

function createMockProfile(overrides: Partial<RobloxProfile> = {}): RobloxProfile {
  return {
    id: 123456,
    name: "TestUser",
    displayName: "Test Display",
    description: "Bio for test",
    created: "2020-01-01T00:00:00Z",
    isBanned: false,
    hasVerifiedBadge: false,
    friendsCount: 50,
    followersCount: 100,
    followingCount: 20,
    avatar: {
      playerAvatarType: "R15",
      assets: [
        { id: 101, name: "Cool Cyberpunk Jacket", assetType: { id: 11, name: "Shirt" } },
        { id: 102, name: "Cyberpunk Cargo Pants", assetType: { id: 12, name: "Pants" } },
        { id: 103, name: "Neon Cyberpunk Visor", assetType: { id: 41, name: "FaceAccessory" } },
      ],
      emotes: [],
      scales: { height: 1.0, width: 1.0, head: 1.0, depth: 1.0, proportion: 0, bodyType: 0 },
      bodyColors: {
        headColor3: "ffffff",
        torsoColor3: "111111",
        rightArmColor3: "111111",
        leftArmColor3: "111111",
        rightLegColor3: "111111",
        leftLegColor3: "111111",
      },
      defaultShirtApplied: false,
      defaultPantsApplied: false,
    },
    ...overrides,
  };
}

describe("Avatar Ranked - Hệ Thống Chấm Điểm 5 Tiêu Chí", () => {
  // =========================================================================
  // 1. CÔNG THỨC 4 TIÊU CHÍ TRỌNG SỐ 25%
  // =========================================================================
  describe("1. Công thức trọng số 4 tiêu chí 25%", () => {
    it("Điểm tổng phải bằng trung bình có trọng số chính xác: 25% cho mỗi tiêu chí", () => {
      const profile = createMockProfile();
      const mockCatalog: CatalogSummary = {
        fetchedAt: new Date().toISOString(),
        items: [
          {
            id: 101,
            status: "priced",
            price: 100,
            favoriteCount: 500,
            restrictions: [],
          },
          {
            id: 102,
            status: "priced",
            price: 50,
            favoriteCount: 300,
            restrictions: [],
          },
          {
            id: 103,
            status: "priced",
            price: 150,
            favoriteCount: 800,
            restrictions: [],
          },
        ],
      };

      const report = calculateAvatarRank(profile, mockCatalog, null);

      const sTheme = report.criteria.theme.score ?? 0;
      const sUniq = report.criteria.uniqueness.score ?? 0;
      const sHumor = report.criteria.humor.score ?? 0;
      const sValue = report.criteria.value.score ?? 0;

      const expectedTotal = Math.round(sTheme * 0.25 + sUniq * 0.25 + sHumor * 0.25 + sValue * 0.25);
      expect(report.total).toBe(expectedTotal);
      expect(report.criteria.theme.weight).toBe(0.25);
      expect(report.criteria.uniqueness.weight).toBe(0.25);
      expect(report.criteria.humor.weight).toBe(0.25);
      expect(report.criteria.value.weight).toBe(0.25);
    });
  });

  // =========================================================================
  // 2. CÁC NGƯỠNG ĐỘ HIẾM CỐ ĐỊNH
  // =========================================================================
  describe("2. Các ngưỡng độ hiếm theo thang điểm cố định", () => {
    it("Phải trả về đúng bậc tương ứng với điểm số", () => {
      // COMMON: >= 0 (0-14)
      expect(getRarityForScore(0)).toBe("COMMON");
      expect(getRarityForScore(14)).toBe("COMMON");

      // UNCOMMON: >= 15 (15-34)
      expect(getRarityForScore(15)).toBe("UNCOMMON");
      expect(getRarityForScore(34)).toBe("UNCOMMON");

      // RARE: >= 35 (35-59)
      expect(getRarityForScore(35)).toBe("RARE");
      expect(getRarityForScore(59)).toBe("RARE");

      // EPIC: >= 60 (60-79)
      expect(getRarityForScore(60)).toBe("EPIC");
      expect(getRarityForScore(79)).toBe("EPIC");

      // LEGENDARY: >= 80 (80-91)
      expect(getRarityForScore(80)).toBe("LEGENDARY");
      expect(getRarityForScore(91)).toBe("LEGENDARY");

      // MYTHICAL: >= 92 (92-100)
      expect(getRarityForScore(92)).toBe("MYTHICAL");
      expect(getRarityForScore(100)).toBe("MYTHICAL");
    });

    it("Điểm tham khảo Personal Taste phải đúng chuẩn 6 mốc", () => {
      expect(RARITIES.COMMON.personalScore).toBe(10);
      expect(RARITIES.UNCOMMON.personalScore).toBe(25);
      expect(RARITIES.RARE.personalScore).toBe(45);
      expect(RARITIES.EPIC.personalScore).toBe(65);
      expect(RARITIES.LEGENDARY.personalScore).toBe(85);
      expect(RARITIES.MYTHICAL.personalScore).toBe(100);
    });
  });

  // =========================================================================
  // 3. CATALOG ROBLOX: LOẠI TRỪ LIMITED, OFF-SALE & TRÙNG LẶP
  // =========================================================================
  describe("3. Phân loại Catalog & Loại trừ Limited/Off-sale khỏi giá Robux", () => {
    it("Phân loại chính xác vật phẩm đang bán, Limited, Off-sale, Miễn phí", () => {
      // Đang bán có giá
      const normalItem: RawCatalogItem = { id: 1, price: 75 };
      const classifiedNormal = classifyCatalogItem(normalItem, 1);
      expect(classifiedNormal.status).toBe("priced");
      expect(classifiedNormal.price).toBe(75);

      // Limited (dù có price niêm yết cũ vẫn bị loại trừ)
      const limitedItem: RawCatalogItem = {
        id: 2,
        price: 50000,
        itemRestrictions: ["Limited"],
      };
      const classifiedLimited = classifyCatalogItem(limitedItem, 2);
      expect(classifiedLimited.status).toBe("limited");
      expect(classifiedLimited.restrictions).toContain("Limited");

      // Off-sale
      const offSaleItem: RawCatalogItem = {
        id: 3,
        isOffSale: true,
      };
      const classifiedOffsale = classifyCatalogItem(offSaleItem, 3);
      expect(classifiedOffsale.status).toBe("offsale");

      // Free item
      const freeItem: RawCatalogItem = { id: 4, price: 0 };
      const classifiedFree = classifyCatalogItem(freeItem, 4);
      expect(classifiedFree.status).toBe("free");
      expect(classifiedFree.price).toBe(0);
    });

    it("Loại bỏ ID trùng lặp trước khi gửi catalog API", () => {
      const dupes = [101, 102, 101, 103, 102, 104, 0, -5];
      const cleaned = uniqueAssetIds(dupes);
      expect(cleaned).toEqual([101, 102, 103, 104]);
    });

    it("Chỉ cộng dồn tiền Robux từ các món status 'priced', loại trừ Limited và Off-sale", () => {
      const profile = createMockProfile({
        avatar: {
          playerAvatarType: "R15",
          assets: [
            { id: 1, name: "Hat 1", assetType: { id: 8, name: "Hat" } },
            { id: 2, name: "Dominus Limited", assetType: { id: 8, name: "Hat" } },
            { id: 3, name: "Off Sale Valk", assetType: { id: 8, name: "Hat" } },
            { id: 4, name: "Free Pants", assetType: { id: 12, name: "Pants" } },
            { id: 5, name: "Hat 2", assetType: { id: 8, name: "Hat" } },
          ],
          emotes: [],
          scales: null,
          bodyColors: null,
          defaultShirtApplied: false,
          defaultPantsApplied: false,
        },
      });

      const catalog: CatalogSummary = {
        fetchedAt: new Date().toISOString(),
        items: [
          { id: 1, status: "priced", price: 100, favoriteCount: 0, restrictions: [] },
          { id: 2, status: "limited", price: null, favoriteCount: 0, restrictions: ["Limited"] },
          { id: 3, status: "offsale", price: null, favoriteCount: 0, restrictions: [] },
          { id: 4, status: "free", price: 0, favoriteCount: 0, restrictions: [] },
          { id: 5, status: "priced", price: 250, favoriteCount: 0, restrictions: [] },
        ],
      };

      const report = calculateAvatarRank(profile, catalog, null);
      // Chỉ 100 + 250 = 350 Robux
      expect(report.value.totalRobux).toBe(350);
      expect(report.value.pricedCount).toBe(2);
      expect(report.value.freeCount).toBe(1);

      // Limited và Off-sale phải có trong excluded list
      const excludedReasons = report.value.excluded.map((e) => e.reason);
      expect(excludedReasons).toContain("limited");
      expect(excludedReasons).toContain("offsale");
    });

    it("Điểm Robux được chuẩn hóa logarit có trần, không bị một món đắt kéo vọt xà", () => {
      const profile = createMockProfile();
      // Một món siêu đắt nhưng điểm value tối đa bị giới hạn ở 100 và mỗi món có trần 2000 R$
      const crazyCatalog: CatalogSummary = {
        fetchedAt: new Date().toISOString(),
        items: [
          {
            id: 101,
            status: "priced",
            price: 500000,
            favoriteCount: 0,
            restrictions: [],
          },
        ],
      };

      const report = calculateAvatarRank(profile, crazyCatalog, null);
      expect(report.criteria.value.score).toBeLessThanOrEqual(100);
      expect(report.total).toBeLessThanOrEqual(100);
    });
  });

  // =========================================================================
  // 4. TRẦN CHẤT LƯỢNG DỮ LIỆU (DATA QUALITY CAP)
  // =========================================================================
  describe("4. Quy tắc bảo vệ chất lượng dữ liệu: Áp trần LEGENDARY khi thiếu dữ liệu", () => {
    it("Khi thiếu dữ liệu catalog, kết quả không được vượt quá LEGENDARY dù điểm cao", () => {
      // Mock hàm applyDataQualityCap trực tiếp
      const capped = applyDataQualityCap("MYTHICAL", "partial");
      expect(capped.tier).toBe("LEGENDARY");

      const cappedFromMissing = applyDataQualityCap("MYTHICAL", "insufficient");
      expect(cappedFromMissing.tier).toBe("LEGENDARY");

      // Nếu dữ liệu complete thì được giữ nguyên MYTHICAL
      const uncapped = applyDataQualityCap("MYTHICAL", "complete");
      expect(uncapped.tier).toBe("MYTHICAL");
    });

    it("Avatar khi không có catalog summary sẽ bị đánh dấu dataQuality không complete", () => {
      const profile = createMockProfile();
      const report = calculateAvatarRank(profile, null, null);

      expect(report.dataQuality.level).not.toBe("complete");
      expect(report.dataQuality.issues.length).toBeGreaterThan(0);
      // Bậc kết quả cuối cùng không bao giờ là MYTHICAL
      expect(report.rarity.tier).not.toBe("MYTHICAL");
    });
  });

  // =========================================================================
  // 5. THANH TRƯỢT GU CÁ NHÂN ĐỘC LẬP
  // =========================================================================
  describe("5. Tiêu chí Hợp gu cá nhân độc lập 100%", () => {
    it("Công thức tính điểm tự động không bị ảnh hưởng bởi gu cá nhân", () => {
      const profile = createMockProfile();
      const report = calculateAvatarRank(profile, null, null);

      // Điểm tổng report.total chỉ phụ thuộc 4 tiêu chí hệ thống
      const sTheme = report.criteria.theme.score ?? 0;
      const sUniq = report.criteria.uniqueness.score ?? 0;
      const sHumor = report.criteria.humor.score ?? 0;
      const sValue = report.criteria.value.score ?? 0;
      const expected = Math.round(sTheme * 0.25 + sUniq * 0.25 + sHumor * 0.25 + sValue * 0.25);

      expect(report.total).toBe(expected);
      // Không có trường personal taste trong công thức tổng khách quan
      expect((report.criteria as Record<string, unknown>).personalTaste).toBeUndefined();
    });
  });

  // =========================================================================
  // 6. TÍNH TẤT ĐỊNH (DETERMINISTIC - KHÔNG MATH.RANDOM)
  // =========================================================================
  describe("6. Tính tất định (Deterministic, không ngẫu nhiên)", () => {
    it("Chấm điểm 50 lần liên tiếp với cùng dữ liệu đầu vào phải cho kết quả y hệt 100%", () => {
      const profile = createMockProfile();
      const catalog: CatalogSummary = {
        fetchedAt: new Date().toISOString(),
        items: [
          { id: 101, status: "priced", price: 100, favoriteCount: 100, restrictions: [] },
          { id: 102, status: "priced", price: 50, favoriteCount: 100, restrictions: [] },
          { id: 103, status: "priced", price: 100, favoriteCount: 100, restrictions: [] },
        ],
      };

      const firstRun = calculateAvatarRank(profile, catalog, null);

      for (let i = 0; i < 50; i++) {
        const nextRun = calculateAvatarRank(profile, catalog, null);
        expect(nextRun.total).toBe(firstRun.total);
        expect(nextRun.rarity.tier).toBe(firstRun.rarity.tier);
        expect(nextRun.criteria.theme.score).toBe(firstRun.criteria.theme.score);
        expect(nextRun.criteria.uniqueness.score).toBe(firstRun.criteria.uniqueness.score);
        expect(nextRun.criteria.humor.score).toBe(firstRun.criteria.humor.score);
        expect(nextRun.criteria.value.score).toBe(firstRun.criteria.value.score);
      }
    });
  });
});
