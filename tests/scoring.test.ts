import { describe, it, expect } from "vitest";
import { calculateAvatarRank } from "@/lib/scoring";
import { getRarityForScore, applyDataQualityCap, RARITIES } from "@/lib/rarity";
import { classifyCatalogItem, uniqueAssetIds, RawCatalogItem } from "@/lib/catalog";
import { detectCosplayInAssets } from "@/lib/styleRules";
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

describe("Avatar Ranked - Hệ Thống Chấm Điểm Kết Hợp (AI 75% + Gu Bạn 25%)", () => {
  // =========================================================================
  // 1. CÔNG THỨC KẾT HỢP: 75% AI SCAN + 25% GU CÁ NHÂN
  // =========================================================================
  describe("1. Công thức điểm tổng kết hợp: 75% AI Scan + 25% Gu bạn", () => {
    it("Điểm tổng phải bằng Math.round(aiScore * 0.75 + personalScore * 0.25)", () => {
      const profile = createMockProfile();
      const mockCatalog: CatalogSummary = {
        fetchedAt: new Date().toISOString(),
        items: [
          { id: 101, status: "priced", price: 100, favoriteCount: 500, restrictions: [] },
          { id: 102, status: "priced", price: 50, favoriteCount: 300, restrictions: [] },
          { id: 103, status: "priced", price: 150, favoriteCount: 800, restrictions: [] },
        ],
      };

      // Giả sử người dùng kéo chọn EPIC (65đ)
      const report = calculateAvatarRank(profile, mockCatalog, null, "EPIC");

      const sTheme = report.criteria.theme.score ?? 0;
      const sUniq = report.criteria.uniqueness.score ?? 0;
      const sHumor = report.criteria.humor.score ?? 0;
      const sValue = report.criteria.value.score ?? 0;

      const expectedAiScore = Math.round((sTheme + sUniq + sHumor + sValue) / 4);
      expect(report.aiScore).toBe(expectedAiScore);
      expect(report.aiWeight).toBe(0.75);

      expect(report.personalTier).toBe("EPIC");
      expect(report.personalScore).toBe(65);
      expect(report.personalWeight).toBe(0.25);

      const expectedTotal = Math.round(expectedAiScore * 0.75 + 65 * 0.25);
      expect(report.total).toBe(expectedTotal);
    });

    it("Thay đổi thanh trượt từ COMMON (10đ) sang MYTHICAL (100đ) tác động chính xác 25% điểm tổng", () => {
      const profile = createMockProfile();
      const reportCommon = calculateAvatarRank(profile, null, null, "COMMON");
      const reportMythical = calculateAvatarRank(profile, null, null, "MYTHICAL");

      // Cùng dữ liệu AI nhưng gu cá nhân chênh lệch: 100 - 10 = 90đ
      // Tác động vào điểm tổng = 90 * 0.25 = 22.5đ -> làm tròn là 22 hoặc 23 điểm
      const diff = reportMythical.total - reportCommon.total;
      expect(diff).toBeGreaterThanOrEqual(22);
      expect(diff).toBeLessThanOrEqual(23);
    });
  });

  // =========================================================================
  // 2. NHẬN DIỆN COSPLAY ANIME, PHIM ẢNH & FANTASY VÀO TIÊU CHÍ CHỦ ĐỀ
  // =========================================================================
  describe("2. Tính năng nhận diện Cosplay (Anime / Phim ảnh / Fantasy / Game)", () => {
    it("Phát hiện chính xác nhân vật anime (Luffy, Gojo, Goku) và gán vào cosplayDetections", () => {
      const assets = [
        { id: 201, name: "Luffy Straw Hat Red Ribbon", assetType: { id: 8, name: "Hat" } },
        { id: 202, name: "Gojo Satoru Blindfold Black", assetType: { id: 41, name: "FaceAccessory" } },
        { id: 203, name: "Goku Super Saiyan Hair Gold", assetType: { id: 42, name: "HairAccessory" } },
      ];

      const detections = detectCosplayInAssets(assets);
      expect(detections.length).toBe(3);

      const characters = detections.map((d) => d.character);
      expect(characters.some((c) => c.includes("Luffy"))).toBe(true);
      expect(characters.some((c) => c.includes("Gojo"))).toBe(true);
      expect(characters.some((c) => c.includes("Goku"))).toBe(true);
    });

    it("Phát hiện nhân vật phim & siêu anh hùng (Spider-Man, Batman, Darth Vader)", () => {
      const assets = [
        { id: 301, name: "Classic Spider-Man Suit Shirt", assetType: { id: 11, name: "Shirt" } },
        { id: 302, name: "The Dark Knight Batman Cowl", assetType: { id: 8, name: "Hat" } },
        { id: 303, name: "Darth Vader Lightsaber Back", assetType: { id: 47, name: "BackAccessory" } },
      ];

      const detections = detectCosplayInAssets(assets);
      expect(detections.length).toBeGreaterThanOrEqual(3);
      expect(detections.some((d) => d.franchise === "Marvel")).toBe(true);
      expect(detections.some((d) => d.franchise === "DC Comics")).toBe(true);
      expect(detections.some((d) => d.franchise === "Star Wars")).toBe(true);
    });

    it("Phát hiện hình tượng Fantasy (Paladin, Archmage, Dark Knight)", () => {
      const assets = [
        { id: 401, name: "Grand Archmage Celestial Robe", assetType: { id: 11, name: "Shirt" } },
        { id: 402, name: "Silver Holy Paladin Greatsword", assetType: { id: 47, name: "BackAccessory" } },
      ];

      const detections = detectCosplayInAssets(assets);
      expect(detections.length).toBeGreaterThanOrEqual(2);
      expect(detections.some((d) => d.category === "fantasy")).toBe(true);
    });

    it("Avatar Cosplay được cộng điểm thưởng đáng kể cho tiêu chí Chủ đề & Hài hòa", () => {
      // Avatar thông thường không có cosplay
      const normalProfile = createMockProfile({
        avatar: {
          playerAvatarType: "R15",
          assets: [
            { id: 501, name: "Basic Blue Hoodie", assetType: { id: 11, name: "Shirt" } },
            { id: 502, name: "Basic Jeans", assetType: { id: 12, name: "Pants" } },
          ],
          emotes: [],
          scales: null,
          bodyColors: null,
          defaultShirtApplied: false,
          defaultPantsApplied: false,
        },
      });

      // Avatar Cosplay Naruto & Kakashi
      const cosplayProfile = createMockProfile({
        avatar: {
          playerAvatarType: "R15",
          assets: [
            { id: 601, name: "Naruto Uzumaki Shippuden Jacket", assetType: { id: 11, name: "Shirt" } },
            { id: 602, name: "Kakashi Hatake Sharingan Mask", assetType: { id: 41, name: "FaceAccessory" } },
          ],
          emotes: [],
          scales: null,
          bodyColors: null,
          defaultShirtApplied: false,
          defaultPantsApplied: false,
        },
      });

      const normalReport = calculateAvatarRank(normalProfile, null, null, "RARE");
      const cosplayReport = calculateAvatarRank(cosplayProfile, null, null, "RARE");

      // Điểm Chủ đề của avatar Cosplay phải cao hơn đáng kể
      const normalTheme = normalReport.criteria.theme.score ?? 0;
      const cosplayTheme = cosplayReport.criteria.theme.score ?? 0;
      expect(cosplayTheme).toBeGreaterThan(normalTheme);
      expect(cosplayReport.cosplayDetections.length).toBeGreaterThan(0);
    });
  });

  // =========================================================================
  // 3. CÁC NGƯỠNG ĐỘ HIẾM CỐ ĐỊNH & THANH TRƯỢT
  // =========================================================================
  describe("3. Các ngưỡng độ hiếm theo thang điểm cố định", () => {
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

    it("Điểm tham khảo Personal Taste đúng chuẩn 6 mốc", () => {
      expect(RARITIES.COMMON.personalScore).toBe(10);
      expect(RARITIES.UNCOMMON.personalScore).toBe(25);
      expect(RARITIES.RARE.personalScore).toBe(45);
      expect(RARITIES.EPIC.personalScore).toBe(65);
      expect(RARITIES.LEGENDARY.personalScore).toBe(85);
      expect(RARITIES.MYTHICAL.personalScore).toBe(100);
    });
  });

  // =========================================================================
  // 4. CATALOG ROBLOX: LOẠI TRỪ LIMITED, OFF-SALE & TRÙNG LẶP
  // =========================================================================
  describe("4. Phân loại Catalog & Loại trừ Limited/Off-sale khỏi giá Robux", () => {
    it("Phân loại chính xác vật phẩm đang bán, Limited, Off-sale, Miễn phí", () => {
      const normalItem: RawCatalogItem = { id: 1, price: 75 };
      expect(classifyCatalogItem(normalItem, 1).status).toBe("priced");

      const limitedItem: RawCatalogItem = { id: 2, price: 50000, itemRestrictions: ["Limited"] };
      expect(classifyCatalogItem(limitedItem, 2).status).toBe("limited");

      const offSaleItem: RawCatalogItem = { id: 3, isOffSale: true };
      expect(classifyCatalogItem(offSaleItem, 3).status).toBe("offsale");

      const freeItem: RawCatalogItem = { id: 4, price: 0 };
      expect(classifyCatalogItem(freeItem, 4).status).toBe("free");
    });

    it("Loại bỏ ID trùng lặp trước khi gửi catalog API", () => {
      const dupes = [101, 102, 101, 103, 102, 104, 0, -5];
      expect(uniqueAssetIds(dupes)).toEqual([101, 102, 103, 104]);
    });
  });

  // =========================================================================
  // 5. TRẦN CHẤT LƯỢNG DỮ LIỆU & TÍNH TẤT ĐỊNH
  // =========================================================================
  describe("5. Bảo vệ chất lượng dữ liệu & Tính tất định", () => {
    it("Áp trần tối đa LEGENDARY khi dữ liệu chưa đầy đủ", () => {
      expect(applyDataQualityCap("MYTHICAL", "partial").tier).toBe("LEGENDARY");
      expect(applyDataQualityCap("MYTHICAL", "insufficient").tier).toBe("LEGENDARY");
      expect(applyDataQualityCap("MYTHICAL", "complete").tier).toBe("MYTHICAL");
    });

    it("Tính tất định 100%: Cùng đầu vào cho ra kết quả y hệt qua 50 lần quét", () => {
      const profile = createMockProfile();
      const firstRun = calculateAvatarRank(profile, null, null, "EPIC");

      for (let i = 0; i < 50; i++) {
        const nextRun = calculateAvatarRank(profile, null, null, "EPIC");
        expect(nextRun.total).toBe(firstRun.total);
        expect(nextRun.aiScore).toBe(firstRun.aiScore);
        expect(nextRun.personalScore).toBe(firstRun.personalScore);
        expect(nextRun.rarity.tier).toBe(firstRun.rarity.tier);
      }
    });
  });
});
