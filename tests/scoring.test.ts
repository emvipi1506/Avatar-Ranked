import { describe, it, expect } from "vitest";
import { calculateAvatarRank, detectCatalog270Styles, buildCosplayRecognition } from "@/lib/scoring";
import { getRarityForScore, applyDataQualityCap, RARITIES, TIER_ORDER } from "@/lib/rarity";
import { classifyCatalogItem, uniqueAssetIds, RawCatalogItem } from "@/lib/catalog";
import { detectCosplayInAssets } from "@/lib/styleRules";
import { AVATAR_STYLES_CATALOG, AVATAR_STYLE_MAP, TOTAL_STYLES_COUNT, getStyleById } from "@/lib/data/avatarStyles";
import { STYLE_GROUPS } from "@/lib/data/styleGroups";
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

describe("Avatar Ranked — Master Test Suite (Phần XII)", () => {
  // =========================================================================
  // 1. CÔNG THỨC SCORING: 75% AI + 25% GU CÁ NHÂN & VÍ DỤ BẮT BUỘC
  // =========================================================================
  describe("1. Công thức chấm điểm (75% AI Scan + 25% Gu cá nhân)", () => {
    it("VÍ DỤ KIỂM THỬ BẮT BUỘC: Theme=70, Uniq=76, Humor=45, Value=55, Personal=80 -> AI=61.5, Final=66.125 -> EPIC", () => {
      const theme = 70;
      const uniqueness = 76;
      const humor = 45;
      const value = 55;
      const personalScore = 80;

      // AI Score = (70 + 76 + 45 + 55) / 4 = 61.5
      const aiScore = (theme + uniqueness + humor + value) / 4;
      expect(aiScore).toBe(61.5);

      // Final Score = 61.5 * 0.75 + 80 * 0.25 = 66.125
      const finalScore = aiScore * 0.75 + personalScore * 0.25;
      expect(finalScore).toBe(66.125);

      // Rarity xác định bằng điểm thực không làm tròn sớm
      const finalRarity = getRarityForScore(finalScore);
      expect(finalRarity).toBe("EPIC");
    });

    it("VÍ DỤ KIỂM THỬ BỔ SUNG: AI=70, Personal=80 -> Final=72.5 -> EPIC", () => {
      const aiScore = 70;
      const personalScore = 80;
      const finalScore = aiScore * 0.75 + personalScore * 0.25;
      expect(finalScore).toBe(72.5);
      expect(getRarityForScore(finalScore)).toBe("EPIC");
    });

    it("Điểm cá nhân tại 0 (COMMON) và 100 (MYTHICAL) tác động đúng 25%", () => {
      const profile = createMockProfile();
      const reportCommon = calculateAvatarRank(profile, null, null, "COMMON");
      const reportMythical = calculateAvatarRank(profile, null, null, "MYTHICAL");

      expect(reportCommon.personalScore).toBe(0);
      expect(reportMythical.personalScore).toBe(100);

      // Chênh lệch do Gu cá nhân = (100 - 0) * 0.25 = 25 điểm
      const diff = reportMythical.rawTotal - reportCommon.rawTotal;
      expect(diff).toBeCloseTo(25, 4);
    });

    it("Điểm tổng không bao giờ vượt ra ngoài khoảng 0 - 100", () => {
      const profile = createMockProfile();
      const report = calculateAvatarRank(profile, null, null, "MYTHICAL");
      expect(report.total).toBeGreaterThanOrEqual(0);
      expect(report.total).toBeLessThanOrEqual(100);
      expect(report.rawTotal).toBeGreaterThanOrEqual(0);
      expect(report.rawTotal).toBeLessThanOrEqual(100);
    });
  });

  // =========================================================================
  // 2. THANH TRƯỢT GU CÁ NHÂN 6 VỊ TRÍ CHUẨN XÁC
  // =========================================================================
  describe("2. Thanh trượt Gu cá nhân (6 vị trí bắt buộc)", () => {
    it("6 vị trí có đúng điểm cá nhân theo quy định Phần II Bước 3", () => {
      // Vị trí 1: COMMON -> 0
      expect(RARITIES.COMMON.personalScore).toBe(0);
      // Vị trí 2: UNCOMMON -> 15
      expect(RARITIES.UNCOMMON.personalScore).toBe(15);
      // Vị trí 3: RARE -> 35
      expect(RARITIES.RARE.personalScore).toBe(35);
      // Vị trí 4: EPIC -> 60
      expect(RARITIES.EPIC.personalScore).toBe(60);
      // Vị trí 5: LEGENDARY -> 80
      expect(RARITIES.LEGENDARY.personalScore).toBe(80);
      // Vị trí 6: MYTHICAL -> 100
      expect(RARITIES.MYTHICAL.personalScore).toBe(100);
    });

    it("Mặc định khởi tạo là COMMON (0 điểm)", () => {
      const profile = createMockProfile();
      const reportDefault = calculateAvatarRank(profile, null, null, "COMMON");
      expect(reportDefault.personalTier).toBe("COMMON");
      expect(reportDefault.personalScore).toBe(0);
    });
  });

  // =========================================================================
  // 3. CÁC NGƯỠNG ĐỘ HIẾM (RARITY THRESHOLDS)
  // =========================================================================
  describe("3. Ngưỡng độ hiếm (server/rarity.js)", () => {
    it("Phân loại chính xác tuyệt đối các biên cận trên và dưới", () => {
      // COMMON: 0 trở lên
      expect(getRarityForScore(0)).toBe("COMMON");
      expect(getRarityForScore(14.99)).toBe("COMMON");

      // UNCOMMON: 15 trở lên
      expect(getRarityForScore(15)).toBe("UNCOMMON");
      expect(getRarityForScore(34.99)).toBe("UNCOMMON");

      // RARE: 35 trở lên
      expect(getRarityForScore(35)).toBe("RARE");
      expect(getRarityForScore(59.99)).toBe("RARE");

      // EPIC: 60 trở lên
      expect(getRarityForScore(60)).toBe("EPIC");
      expect(getRarityForScore(79.99)).toBe("EPIC");

      // LEGENDARY: 80 trở lên
      expect(getRarityForScore(80)).toBe("LEGENDARY");
      expect(getRarityForScore(91.99)).toBe("LEGENDARY");

      // MYTHICAL: 92 trở lên
      expect(getRarityForScore(92)).toBe("MYTHICAL");
      expect(getRarityForScore(100)).toBe("MYTHICAL");
    });

    it("Không làm tròn trước khi phân loại để không sai lệch Rarity", () => {
      // 59.99 phải là RARE, không được làm tròn lên 60 thành EPIC trước khi phân loại
      expect(getRarityForScore(59.99)).toBe("RARE");
      // 79.99 phải là EPIC, không được làm tròn lên 80 thành LEGENDARY trước khi phân loại
      expect(getRarityForScore(79.99)).toBe("EPIC");
      // 91.99 phải là LEGENDARY, không được làm tròn lên 92 thành MYTHICAL
      expect(getRarityForScore(91.99)).toBe("LEGENDARY");
    });
  });

  // =========================================================================
  // 4. CATALOG ĐẦY ĐỦ 270 STYLE (PHẦN IV & V)
  // =========================================================================
  describe("4. Bộ dữ liệu Catalog 270 Style bắt buộc", () => {
    it("Catalog phải có đúng chính xác 270 mục style", () => {
      expect(TOTAL_STYLES_COUNT).toBe(270);
      expect(AVATAR_STYLES_CATALOG.length).toBe(270);
    });

    it("Toàn bộ 270 styles phải có ID duy nhất, tên và mô tả không rỗng", () => {
      const ids = new Set<string>();
      for (const style of AVATAR_STYLES_CATALOG) {
        expect(style.id).toBeTruthy();
        expect(style.name).toBeTruthy();
        expect(style.description).toBeTruthy();
        expect(style.description.length).toBeGreaterThan(10);
        expect(style.keywords.length).toBeGreaterThan(0);
        expect(ids.has(style.id)).toBe(false);
        ids.add(style.id);
      }
      expect(ids.size).toBe(270);
    });

    it("Kiểm tra sự tồn tại của các style đầu, giữa và cuối danh sách 270", () => {
      // Style 1
      const s1 = getStyleById("classic");
      expect(s1).toBeDefined();
      expect(s1?.name).toBe("Classic");

      // Style 10
      const s10 = getStyleById("cnp");
      expect(s10).toBeDefined();

      // Style 53: Cyberpunk
      const s53 = getStyleById("cyberpunk");
      expect(s53).toBeDefined();
      expect(s53?.groups).toContain("uniqueness");

      // Style 235: Y3K
      const s235 = getStyleById("y3k");
      expect(s235).toBeDefined();

      // Style 270: 2026 Style
      const s270 = getStyleById("2026-style");
      expect(s270).toBeDefined();
      expect(s270?.index).toBe(270);
      expect(s270?.name).toBe("2026 Style");
    });

    it("Một style có thể thuộc nhiều nhóm tiêu chí mà không nhân đôi", () => {
      const cnp = getStyleById("cnp");
      expect(cnp?.groups.length).toBeGreaterThan(1);
      expect(cnp?.groups).toContain("uniqueness");
      expect(cnp?.groups).toContain("humor");
    });

    it("Phát hiện Multi-Style cùng lúc và gán Primary Style + Secondary Styles", () => {
      const profile = createMockProfile({
        avatar: {
          playerAvatarType: "R15",
          assets: [
            { id: 1, name: "Neon Cyberpunk Visor Goggles", assetType: { id: 41, name: "FaceAccessory" } },
            { id: 2, name: "Cyberpunk Techwear Straps Jacket", assetType: { id: 11, name: "Shirt" } },
            { id: 3, name: "Cyberpunk Futuristic Cyber Armor", assetType: { id: 12, name: "Pants" } },
            { id: 4, name: "Y3K Chrome Metallic Boots", assetType: { id: 47, name: "BackAccessory" } },
          ],
          emotes: [],
          scales: null,
          bodyColors: null,
          defaultShirtApplied: false,
          defaultPantsApplied: false,
        },
      });

      const report = calculateAvatarRank(profile);
      expect(report.primaryStyle).not.toBeNull();
      // Cyberpunk xuất hiện ở 3 món -> chiếm ưu thế tuyệt đối
      expect(report.primaryStyle?.id).toBe("cyberpunk");
      expect(report.primaryStyle?.confidence).toBe("high");
      expect(report.primaryStyle?.evidence.length).toBeGreaterThanOrEqual(3);
      // Secondary Styles có các style khác (như Y3K, Techwear, Futuristic)
      expect(report.secondaryStyles.length).toBeGreaterThan(0);
      const secIds = report.secondaryStyles.map((s) => s.id);
      expect(secIds.some((id) => ["y3k", "techwear", "futuristic"].includes(id))).toBe(true);
    });
  });

  // =========================================================================
  // 5. NHẬN DIỆN COSPLAY & NHÂN VẬT HƯ CẤU (PHẦN VIII)
  // =========================================================================
  describe("5. Nhận diện Cosplay (Phần VIII)", () => {
    it("Nhận diện chính xác nhân vật anime có bằng chứng rõ ràng (high confidence)", () => {
      const assets = [
        { id: 201, name: "Gojo Satoru Blindfold Black", assetType: { id: 41, name: "FaceAccessory" } },
        { id: 202, name: "Jujutsu Kaisen Gojo Uniform", assetType: { id: 11, name: "Shirt" } },
      ];

      const res = buildCosplayRecognition(assets);
      expect(res.identified).toBe(true);
      expect(res.characterName).toContain("Gojo Satoru");
      expect(res.franchise).toBe("Jujutsu Kaisen");
      expect(res.confidenceLevel).toBe("high");
      expect(res.confidence).toBeGreaterThanOrEqual(0.8);
      expect(res.supportingDetails.length).toBeGreaterThanOrEqual(1);
    });

    it("Không nhận diện hoặc trả về insufficient khi không đủ bằng chứng", () => {
      const assets = [
        { id: 301, name: "Plain White T-Shirt", assetType: { id: 11, name: "Shirt" } },
        { id: 302, name: "Normal Blue Jeans", assetType: { id: 12, name: "Pants" } },
      ];

      const res = buildCosplayRecognition(assets);
      expect(res.identified).toBe(false);
      expect(res.characterName).toBeNull();
      expect(res.franchise).toBeNull();
      expect(res.confidenceLevel).toBe("insufficient");
      expect(res.confidence).toBe(0);
    });
  });

  // =========================================================================
  // 6. GIÁ TRỊ ROBUX XÁC MINH & LOẠI TRỪ OFF-SALE
  // =========================================================================
  describe("6. Giá Robux đã xác minh & Loại trừ Off-sale/Limited (Phần VII)", () => {
    it("Chỉ cộng các vật phẩm đang bán có giá xác minh, loại trừ Off-sale/Limited", () => {
      const normalItem: RawCatalogItem = { id: 1, price: 100 };
      const offSaleItem: RawCatalogItem = { id: 2, isOffSale: true };
      const limitedItem: RawCatalogItem = { id: 3, price: 50000, itemRestrictions: ["Limited"] };
      const freeItem: RawCatalogItem = { id: 4, price: 0 };

      expect(classifyCatalogItem(normalItem, 1).status).toBe("priced");
      expect(classifyCatalogItem(offSaleItem, 2).status).toBe("offsale");
      expect(classifyCatalogItem(limitedItem, 3).status).toBe("limited");
      expect(classifyCatalogItem(freeItem, 4).status).toBe("free");

      const profile = createMockProfile({
        avatar: {
          playerAvatarType: "R15",
          assets: [
            { id: 1, name: "Priced Shirt", assetType: { id: 11, name: "Shirt" } },
            { id: 2, name: "Offsale Pants", assetType: { id: 12, name: "Pants" } },
            { id: 3, name: "Limited Hat", assetType: { id: 8, name: "Hat" } },
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
          { id: 1, status: "priced", price: 100, favoriteCount: 10, restrictions: [] },
          { id: 2, status: "offsale", price: null, favoriteCount: 10, restrictions: [] },
          { id: 3, status: "limited", price: 50000, favoriteCount: 10, restrictions: ["Limited"] },
        ],
      };

      const report = calculateAvatarRank(profile, catalog);
      // Chỉ tính 100 R$ của món 1
      expect(report.value.totalRobux).toBe(100);
      expect(report.value.pricedCount).toBe(1);
      expect(report.value.excluded.length).toBe(2);
      expect(isNaN(report.value.totalRobux)).toBe(false);
    });
  });

  // =========================================================================
  // 7. DATA QUALITY GATE
  // =========================================================================
  describe("7. Cơ chế bảo vệ chất lượng dữ liệu (Data Quality Gate)", () => {
    it("Không bao giờ cấp MYTHICAL nếu dữ liệu không đầy đủ (áp trần tối đa LEGENDARY)", () => {
      // Dù điểm đạt 98 nhưng data chất lượng partial/insufficient
      const cappedPartial = applyDataQualityCap("MYTHICAL", "partial");
      expect(cappedPartial.tier).toBe("LEGENDARY");
      expect(cappedPartial.capApplied).toBe(true);

      const cappedInsufficient = applyDataQualityCap("MYTHICAL", "insufficient");
      expect(cappedInsufficient.tier).toBe("LEGENDARY");
      expect(cappedInsufficient.capApplied).toBe(true);

      // Khi data complete mới được giữ MYTHICAL
      const cappedComplete = applyDataQualityCap("MYTHICAL", "complete");
      expect(cappedComplete.tier).toBe("MYTHICAL");
      expect(cappedComplete.capApplied).toBe(false);
    });
  });
});
