import { describe, it, expect } from "vitest";
import { calculateAvatarRank, detectCatalog270Styles, buildCosplayRecognition } from "@/lib/scoring";
import { getRarityForScore, applyDataQualityCap, RARITIES, TIER_ORDER } from "@/lib/rarity";
import { classifyCatalogItem, RawCatalogItem } from "@/lib/catalog";
import { detectCosplayInAssets } from "@/lib/styleRules";
import { AVATAR_STYLES_CATALOG, AVATAR_STYLE_MAP, TOTAL_STYLES_COUNT, getStyleById } from "@/lib/data/avatarStyles";
import { analyzeFandomAndCosplay } from "@/lib/fandomRecognition";
import type { RobloxProfile, CatalogSummary } from "@/types";
import fs from "fs";
import path from "path";

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

describe("Avatar Ranked — Full Upgrade Test Suite", () => {
  // =========================================================================
  // 1. CÔNG THỨC SCORING MỚI: 35% / 30% / 25% / 10% & KẾT HỢP AI 75% + GU 25%
  // =========================================================================
  describe("1. Công thức chấm điểm mới (Theme 35%, Originality 30%, Humor 25%, Robux 10%)", () => {
    it("VÍ DỤ BẮT BUỘC TRONG MỤC 3: Theme=82, Originality=78, Humor=90, Verified=30, Personal=80 -> AI=77.6, Final=78.2 -> EPIC", () => {
      const theme = 82;
      const originality = 78;
      const humor = 90;
      const verifiedValue = 30;
      const personalScore = 80;

      // AI Score = 82 × 0.35 + 78 × 0.30 + 90 × 0.25 + 30 × 0.10
      // 28.7 + 23.4 + 22.5 + 3.0 = 77.6
      const aiScore = theme * 0.35 + originality * 0.30 + humor * 0.25 + verifiedValue * 0.10;
      expect(aiScore).toBeCloseTo(77.6, 5);

      // Final Score = 77.6 × 0.75 + 80 × 0.25
      // 58.2 + 20 = 78.2
      const finalScore = aiScore * 0.75 + personalScore * 0.25;
      expect(finalScore).toBeCloseTo(78.2, 5);

      // Rarity kết quả: EPIC vì chưa đạt ngưỡng 80
      const rarity = getRarityForScore(finalScore);
      expect(rarity).toBe("EPIC");
    });

    it("Trọng số trong CriterionResult phản ánh đúng 35%, 30%, 25%, 10%", () => {
      const profile = createMockProfile();
      const report = calculateAvatarRank(profile);

      expect(report.criteria.theme.weight).toBe(0.35);
      expect(report.criteria.uniqueness.weight).toBe(0.30);
      expect(report.criteria.humor.weight).toBe(0.25);
      expect(report.criteria.value.weight).toBe(0.10);
      expect(report.criteria.personal.weight).toBe(0.25);
      expect(report.aiWeight).toBe(0.75);
      expect(report.personalWeight).toBe(0.25);
    });

    it("Điểm tổng không bao giờ vượt ra ngoài khoảng 0 - 100", () => {
      const profile = createMockProfile();
      const report = calculateAvatarRank(profile, null, null, "MYTHICAL");
      expect(report.total).toBeGreaterThanOrEqual(0);
      expect(report.total).toBeLessThanOrEqual(100);
      expect(report.rawTotal).toBeGreaterThanOrEqual(0);
      expect(report.rawTotal).toBeLessThanOrEqual(100);
    });

    it("Điểm thành phần thiếu hoặc không hợp lệ được xử lý an toàn (fallback an toàn)", () => {
      const emptyProfile = createMockProfile({
        avatar: {
          playerAvatarType: "R15",
          assets: [],
          emotes: [],
          scales: null,
          bodyColors: null,
          defaultShirtApplied: true,
          defaultPantsApplied: true,
        },
      });

      const report = calculateAvatarRank(emptyProfile, null, null, "COMMON");
      expect(report.total).toBeGreaterThanOrEqual(0);
      expect(Number.isFinite(report.total)).toBe(true);
      expect(report.dataQuality.level).toBe("insufficient");
    });
  });

  // =========================================================================
  // 2. CÁC NGƯỠNG ĐỘ HIẾM (RARITY THRESHOLDS) & BẢO VỆ CHẤT LƯỢNG DỮ LIỆU
  // =========================================================================
  describe("2. Ngưỡng độ hiếm (server/rarity.js)", () => {
    it("Phân loại chính xác tuyệt đối các biên cận trên và dưới", () => {
      // COMMON: 0+
      expect(getRarityForScore(0)).toBe("COMMON");
      expect(getRarityForScore(14.99)).toBe("COMMON");

      // UNCOMMON: 15+
      expect(getRarityForScore(15)).toBe("UNCOMMON");
      expect(getRarityForScore(34.99)).toBe("UNCOMMON");

      // RARE: 35+
      expect(getRarityForScore(35)).toBe("RARE");
      expect(getRarityForScore(59.99)).toBe("RARE");

      // EPIC: 60+
      expect(getRarityForScore(60)).toBe("EPIC");
      expect(getRarityForScore(79.99)).toBe("EPIC");

      // LEGENDARY: 80+
      expect(getRarityForScore(80)).toBe("LEGENDARY");
      expect(getRarityForScore(91.99)).toBe("LEGENDARY");

      // MYTHICAL: 92+
      expect(getRarityForScore(92)).toBe("MYTHICAL");
      expect(getRarityForScore(100)).toBe("MYTHICAL");
    });

    it("Điểm 79.99 không phải Legendary (mà là EPIC); Điểm 80 đạt Legendary", () => {
      expect(getRarityForScore(79.99)).toBe("EPIC");
      expect(getRarityForScore(80)).toBe("LEGENDARY");
    });

    it("Điểm 91.99 không phải Mythical (mà là LEGENDARY); Điểm 92 đạt Mythical", () => {
      expect(getRarityForScore(91.99)).toBe("LEGENDARY");
      expect(getRarityForScore(92)).toBe("MYTHICAL");
    });

    it("Personal Score 100 hoặc giá Robux cao không tự động cấp Mythical khi thiếu chất lượng dữ liệu", () => {
      // Dù điểm thô đạt 95 nhưng thiếu dữ liệu catalog hoặc palette -> bị áp trần LEGENDARY
      const capped = applyDataQualityCap("MYTHICAL", "partial");
      expect(capped.tier).toBe("LEGENDARY");
      expect(capped.capApplied).toBe(true);

      const cappedInsufficient = applyDataQualityCap("MYTHICAL", "insufficient");
      expect(cappedInsufficient.tier).toBe("LEGENDARY");
      expect(cappedInsufficient.capApplied).toBe(true);
    });
  });

  // =========================================================================
  // 3. THANH TRƯỢT GU CÁ NHÂN 6 VỊ TRÍ
  // =========================================================================
  describe("3. Thanh trượt Gu cá nhân (6 vị trí bắt buộc)", () => {
    it("6 vị trí có đúng điểm cá nhân theo quy định", () => {
      expect(RARITIES.COMMON.personalScore).toBe(0);
      expect(RARITIES.UNCOMMON.personalScore).toBe(15);
      expect(RARITIES.RARE.personalScore).toBe(35);
      expect(RARITIES.EPIC.personalScore).toBe(60);
      expect(RARITIES.LEGENDARY.personalScore).toBe(80);
      expect(RARITIES.MYTHICAL.personalScore).toBe(100);
    });

    it("Khởi tạo mặc định là COMMON = 0", () => {
      const profile = createMockProfile();
      const report = calculateAvatarRank(profile);
      expect(report.personalTier).toBe("COMMON");
      expect(report.personalScore).toBe(0);
    });
  });

  // =========================================================================
  // 4. BỘ DỮ LIỆU ĐẦY ĐỦ 270 AESTHETICS & FILE JSON
  // =========================================================================
  describe("4. Tích hợp đầy đủ 270 Aesthetics", () => {
    it("Catalog trong avatarStyles.ts phải có đúng chính xác 270 mục style", () => {
      expect(TOTAL_STYLES_COUNT).toBe(270);
      expect(AVATAR_STYLES_CATALOG.length).toBe(270);
    });

    it("File server/data/aesthetics.json tồn tại và chứa đủ 270 style không trùng ID", () => {
      const jsonPath = path.resolve(__dirname, "../server/data/aesthetics.json");
      expect(fs.existsSync(jsonPath)).toBe(true);
      const raw = fs.readFileSync(jsonPath, "utf-8");
      const list = JSON.parse(raw);
      expect(Array.isArray(list)).toBe(true);
      expect(list.length).toBe(270);

      const idSet = new Set<string>();
      for (const item of list) {
        expect(item.id).toBeTruthy();
        expect(item.name).toBeTruthy();
        expect(item.description).toBeTruthy();
        expect(item.keywords.length).toBeGreaterThan(0);
        expect(idSet.has(item.id)).toBe(false);
        idSet.add(item.id);
      }
      expect(idSet.size).toBe(270);
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
      expect(report.primaryStyle?.id).toBe("cyberpunk");
      expect(report.primaryStyle?.confidence).toBe("high");
      expect(report.secondaryStyles.length).toBeGreaterThan(0);
    });
  });

  // =========================================================================
  // 5. NHẬN DIỆN FANDOM, COSPLAY & SUY LUẬN NHIỀU GIẢ THUYẾT
  // =========================================================================
  describe("5. Nhận diện Fandom & Cosplay (Mục 4 & 5)", () => {
    it("Xác nhận Cosplay CONFIRMED khi có nhiều bằng chứng nhất quán (2+ item khớp)", () => {
      const assets = [
        { id: 201, name: "Gojo Satoru Blindfold Black", assetType: { id: 41, name: "FaceAccessory" } },
        { id: 202, name: "Jujutsu Kaisen Gojo Uniform Shirt", assetType: { id: 11, name: "Shirt" } },
      ];

      const res = analyzeFandomAndCosplay(assets, null, null);
      expect(res.identificationStatus).toBe("confirmed");
      expect(res.characterName).toBe("Gojo Satoru");
      expect(res.franchiseName).toBe("Jujutsu Kaisen");
      expect(res.franchiseType).toBe("anime");
      expect(res.confidence).toBeGreaterThanOrEqual(0.85);
      expect(res.supportingEvidence.length).toBeGreaterThanOrEqual(2);
      expect(res.matchingItems.length).toBe(2);
    });

    it("Không vội vàng confirmed khi chỉ có 1 từ khóa đơn lẻ (trả về possible hoặc likely)", () => {
      const assets = [
        { id: 301, name: "Goku Hair", assetType: { id: 41, name: "HairAccessory" } },
        { id: 302, name: "Normal Street Hoodie", assetType: { id: 11, name: "Shirt" } },
      ];

      const res = analyzeFandomAndCosplay(assets, null, null);
      // Chỉ có 1 item khớp tóc, không được vội vàng confirmed
      expect(res.identificationStatus).not.toBe("confirmed");
      expect(["likely", "possible"]).toContain(res.identificationStatus);
      expect(res.unmatchedFeatures.length).toBeGreaterThan(0);
    });

    it("Trả về UNKNOWN khi không có đủ bằng chứng, không bịa nguồn tìm kiếm", () => {
      const assets = [
        { id: 401, name: "Plain White Casual T-Shirt", assetType: { id: 11, name: "Shirt" } },
        { id: 402, name: "Simple Black Jeans", assetType: { id: 12, name: "Pants" } },
      ];

      const res = analyzeFandomAndCosplay(assets, null, null);
      expect(res.identificationStatus).toBe("unknown");
      expect(res.isCosplay).toBe(false);
      expect(res.characterName).toBeNull();
      expect(res.searchSources.length).toBeGreaterThan(0);
      // Không bịa URL giả
      for (const src of res.searchSources) {
        if (src.url) expect(src.url.startsWith("http")).toBe(true);
      }
    });

    it("Nhận diện nhân vật hoạt hình 3D, game và meme nổi tiếng", () => {
      // Shrek
      const shrekAssets = [
        { id: 501, name: "Green Shrek Ogre Ears", assetType: { id: 41, name: "Hat" } },
        { id: 502, name: "Shrek Swamp Leather Vest", assetType: { id: 11, name: "Shirt" } },
      ];
      const shrekRes = analyzeFandomAndCosplay(shrekAssets, null, null);
      expect(shrekRes.characterName).toBe("Shrek");
      expect(shrekRes.franchiseType).toBe("cartoon");
      expect(shrekRes.isMemeOrParody).toBe(true);

      // Skibidi Toilet
      const skibidiAssets = [
        { id: 601, name: "Skibidi Toilet Head Accessory", assetType: { id: 41, name: "Hat" } },
      ];
      const skibidiRes = analyzeFandomAndCosplay(skibidiAssets, null, null);
      expect(skibidiRes.franchiseName).toContain("Skibidi Toilet");
      expect(skibidiRes.humorSignalBonus).toBeGreaterThanOrEqual(80);
    });

    it("Xử lý mâu thuẫn phong cách (contradictingEvidence) khi trộn lẫn phụ kiện không ăn khớp", () => {
      const conflictingAssets = [
        { id: 701, name: "Goku Saiyan Hair", assetType: { id: 41, name: "HairAccessory" } },
        { id: 702, name: "Cyberpunk Neon Visor", assetType: { id: 41, name: "FaceAccessory" } },
      ];

      const res = analyzeFandomAndCosplay(conflictingAssets, null, null);
      expect(res.contradictingEvidence.length).toBeGreaterThan(0);
    });
  });

  // =========================================================================
  // 6. ĐIỀU CHỈNH HUMOR VÀ ORIGINALITY
  // =========================================================================
  describe("6. Điều chỉnh Humor và Originality (Mục 7 & 8)", () => {
    it("Meme viral sao chép nguyên bản đạt Humor cao nhưng Originality vừa phải", () => {
      const profile = createMockProfile({
        avatar: {
          playerAvatarType: "R15",
          assets: [
            { id: 801, name: "Skibidi Toilet Head", assetType: { id: 41, name: "Hat" } },
          ],
          emotes: [],
          scales: null,
          bodyColors: null,
          defaultShirtApplied: false,
          defaultPantsApplied: false,
        },
      });

      const report = calculateAvatarRank(profile);
      // Humor cao vì là meme nổi bật
      expect(report.criteria.humor.score).toBeGreaterThanOrEqual(60);
      // Originality không quá cao vì chỉ sao chép trend có sẵn
      expect(report.criteria.uniqueness.score).toBeLessThanOrEqual(70);
    });

    it("Avatar tỷ lệ cơ thể bất thường (đầu to dị dạng) hỗ trợ tăng Humor khi có chủ ý", () => {
      const profile = createMockProfile({
        avatar: {
          playerAvatarType: "R15",
          assets: [
            { id: 901, name: "Goofy Silly Hat", assetType: { id: 41, name: "Hat" } },
          ],
          emotes: [],
          scales: { height: 1.3, width: 1.0, head: 1.5, depth: 1.0, proportion: 0, bodyType: 0 },
          bodyColors: null,
          defaultShirtApplied: false,
          defaultPantsApplied: false,
        },
      });

      const report = calculateAvatarRank(profile);
      expect(report.criteria.humor.score).toBeGreaterThanOrEqual(40);
      expect(report.criteria.humor.evidence.some((e) => e.includes("đầu bất thường"))).toBe(true);
    });

    it("Sự tương phản hài hước (suit trang trọng + đầu meme) tăng điểm Humor rõ rệt", () => {
      const profile = createMockProfile({
        avatar: {
          playerAvatarType: "R15",
          assets: [
            { id: 1001, name: "Formal Black Tuxedo Suit", assetType: { id: 11, name: "Shirt" } },
            { id: 1002, name: "Formal Suit Pants", assetType: { id: 12, name: "Pants" } },
            { id: 1003, name: "Funny Banana Head Mask", assetType: { id: 41, name: "Hat" } },
          ],
          emotes: [],
          scales: null,
          bodyColors: null,
          defaultShirtApplied: false,
          defaultPantsApplied: false,
        },
      });

      const report = calculateAvatarRank(profile);
      expect(report.criteria.humor.score).toBeGreaterThanOrEqual(50);
      expect(report.criteria.humor.evidence.some((e) => e.includes("Tương phản hài hước"))).toBe(true);
    });
  });

  // =========================================================================
  // 7. ROBUX VALUE CHỈ LÀ PHỤ & LOẠI TRỪ OFF-SALE
  // =========================================================================
  describe("7. Giá Robux đã xác minh & Loại trừ Off-sale/Limited (Mục 11)", () => {
    it("Off-sale và Limited không được tính vào tổng giá Robux", () => {
      const normalItem: RawCatalogItem = { id: 1, price: 150 };
      const offSaleItem: RawCatalogItem = { id: 2, isOffSale: true };
      const limitedItem: RawCatalogItem = { id: 3, price: 80000, itemRestrictions: ["Limited"] };

      expect(classifyCatalogItem(normalItem, 1).status).toBe("priced");
      expect(classifyCatalogItem(offSaleItem, 2).status).toBe("offsale");
      expect(classifyCatalogItem(limitedItem, 3).status).toBe("limited");

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
          { id: 1, status: "priced", price: 150, favoriteCount: 10, restrictions: [] },
          { id: 2, status: "offsale", price: null, favoriteCount: 10, restrictions: [] },
          { id: 3, status: "limited", price: 80000, favoriteCount: 10, restrictions: ["Limited"] },
        ],
      };

      const report = calculateAvatarRank(profile, catalog);
      expect(report.value.totalRobux).toBe(150);
      expect(report.value.pricedCount).toBe(1);
      expect(report.value.excluded.length).toBe(2);
    });

    it("Avatar miễn phí 0 R$ vẫn có thể đạt điểm cao trên Theme & Cohesion (>= 85) và đạt Legendary khi concept xuất sắc", () => {
      // 1. Kiểm tra avatar cosplay miễn phí đạt điểm Theme xuất sắc
      const gojoProfile = createMockProfile({
        avatar: {
          playerAvatarType: "R15",
          assets: [
            { id: 1101, name: "Gojo Satoru Blindfold Black", assetType: { id: 41, name: "FaceAccessory" } },
            { id: 1102, name: "Jujutsu Kaisen Gojo Uniform", assetType: { id: 11, name: "Shirt" } },
            { id: 1103, name: "Jujutsu Kaisen Uniform Pants", assetType: { id: 12, name: "Pants" } },
          ],
          emotes: [],
          scales: null,
          bodyColors: null,
          defaultShirtApplied: false,
          defaultPantsApplied: false,
        },
      });

      const freeCatalog: CatalogSummary = {
        fetchedAt: new Date().toISOString(),
        items: [
          { id: 1101, status: "free", price: 0, favoriteCount: 10, restrictions: [] },
          { id: 1102, status: "free", price: 0, favoriteCount: 10, restrictions: [] },
          { id: 1103, status: "free", price: 0, favoriteCount: 10, restrictions: [] },
        ],
      };

      const gojoReport = calculateAvatarRank(gojoProfile, freeCatalog, null, "EPIC");
      // Theme rất cao nhờ cosplay chuẩn xác dù Robux = 0
      expect(gojoReport.criteria.theme.score).toBeGreaterThanOrEqual(80);
      expect(gojoReport.value.totalRobux).toBe(0);

      // 2. Avatar miễn phí có concept xuất sắc & hài hước (Shrek Parody Tuxedo) kết hợp gu cao có thể đạt LEGENDARY
      const shrekParodyProfile = createMockProfile({
        avatar: {
          playerAvatarType: "R6",
          assets: [
            { id: 1201, name: "Green Shrek Ogre Ears", assetType: { id: 41, name: "Hat" } },
            { id: 1202, name: "Shrek Swamp Vest Shirt", assetType: { id: 11, name: "Shirt" } },
            { id: 1203, name: "Formal Black Tuxedo Pants", assetType: { id: 12, name: "Pants" } },
            { id: 1204, name: "Funny Banana Mascot Peel", assetType: { id: 47, name: "BackAccessory" } },
          ],
          emotes: [
            { assetId: 1, assetName: "Laugh", position: 1 },
            { assetId: 2, assetName: "Cheer", position: 2 },
            { assetId: 3, assetName: "Point", position: 3 },
            { assetId: 4, assetName: "Dance", position: 4 },
            { assetId: 5, assetName: "Wave", position: 5 },
          ],
          scales: { height: 1.3, width: 1.0, head: 1.45, depth: 1.0, proportion: 0, bodyType: 0 },
          bodyColors: {
            headColor3: "A4BD47",
            torsoColor3: "111111",
            rightArmColor3: "A4BD47",
            leftArmColor3: "A4BD47",
            rightLegColor3: "111111",
            leftLegColor3: "111111",
          },
          defaultShirtApplied: false,
          defaultPantsApplied: false,
        },
      });

      const shrekCatalog: CatalogSummary = {
        fetchedAt: new Date().toISOString(),
        items: [
          { id: 1201, status: "free", price: 0, favoriteCount: 10, restrictions: [] },
          { id: 1202, status: "free", price: 0, favoriteCount: 10, restrictions: [] },
          { id: 1203, status: "free", price: 0, favoriteCount: 10, restrictions: [] },
          { id: 1204, status: "free", price: 0, favoriteCount: 10, restrictions: [] },
        ],
      };

      const shrekReport = calculateAvatarRank(shrekParodyProfile, shrekCatalog, null, "MYTHICAL");
      // Cả Theme, Originality và Humor đều cao
      expect(shrekReport.criteria.theme.score).toBeGreaterThanOrEqual(75);
      expect(shrekReport.criteria.humor.score).toBeGreaterThanOrEqual(80);
      // Đạt xếp hạng cao LEGENDARY dù Robux = 0
      expect(shrekReport.total).toBeGreaterThanOrEqual(80);
      expect(shrekReport.rarity.tier).toBe("LEGENDARY");
    });
  });

  // =========================================================================
  // 8. ĐỀ XUẤT NÂNG CẤP OUTFIT THỰC TẾ
  // =========================================================================
  describe("8. Đề xuất nâng cấp outfit cụ thể", () => {
    it("Trả về danh sách đề xuất outfit thực tế trong ScoreReport", () => {
      const profile = createMockProfile();
      const report = calculateAvatarRank(profile);
      expect(Array.isArray(report.outfitRecommendations)).toBe(true);
      expect(report.outfitRecommendations.length).toBeGreaterThan(0);
    });
  });

  // =========================================================================
  // 9. KIỂM THỬ BẮT BUỘC 12 TRƯỜNG HỢP (MỤC 8 YÊU CẦU BỔ SUNG)
  // =========================================================================
  describe("9. Kiểm thử 12 trường hợp bắt buộc (Mục 8)", () => {
    // 1. Avatar có 20 phụ kiện: không được tự động gán Maximalism.
    it("Trường hợp 1: Avatar có đúng 20 phụ kiện -> không được tự động gán Maximalism", () => {
      const assets = [
        { id: 1, name: "Classic Shirt", assetType: { id: 11, name: "Shirt" } },
        { id: 2, name: "Classic Pants", assetType: { id: 12, name: "Pants" } },
      ];
      // Thêm đúng 20 accessories
      for (let i = 1; i <= 20; i++) {
        assets.push({ id: 100 + i, name: `Accessory Item ${i}`, assetType: { id: 8, name: "Hat" } });
      }

      const profile = createMockProfile({
        avatar: {
          playerAvatarType: "R15",
          assets,
          emotes: [],
          scales: null,
          bodyColors: null,
          defaultShirtApplied: false,
          defaultPantsApplied: false,
        },
      });

      const report = calculateAvatarRank(profile);
      const hasMaximalismInStyles = report.styles.some((s) => s.style === "maximalism");
      const hasMaximalismInAesthetics = report.categorizedTags.aestheticTags.some((t) => t.id === "maximalism");

      expect(hasMaximalismInStyles).toBe(false);
      expect(hasMaximalismInAesthetics).toBe(false);
    });

    // 2. Avatar có 21 phụ kiện: đủ điều kiện xem xét Maximalism nhưng vẫn phải kiểm tra hình thức phối đồ.
    it("Trường hợp 2: Avatar có 21 phụ kiện -> đủ điều kiện xem xét Maximalism", () => {
      const assets = [
        { id: 1, name: "Layered Cyber Jacket", assetType: { id: 11, name: "Shirt" } },
        { id: 2, name: "Layered Cyber Pants", assetType: { id: 12, name: "Pants" } },
      ];
      // Thêm đúng 21 accessories
      for (let i = 1; i <= 21; i++) {
        assets.push({ id: 100 + i, name: `Cyber Accessory Layer ${i}`, assetType: { id: 8, name: "Hat" } });
      }

      const profile = createMockProfile({
        avatar: {
          playerAvatarType: "R15",
          assets,
          emotes: [],
          scales: null,
          bodyColors: null,
          defaultShirtApplied: false,
          defaultPantsApplied: false,
        },
      });

      const report = calculateAvatarRank(profile);
      const hasMaximalism = report.styles.some((s) => s.style === "maximalism");
      expect(hasMaximalism).toBe(true);
    });

    // 3. Avatar có 5 phụ kiện và thiết kế tối giản: có thể gán Minimalism.
    it("Trường hợp 3: Avatar có 5 phụ kiện và thiết kế tối giản -> có thể gán Minimalism", () => {
      const assets = [
        { id: 1, name: "Minimalist Black Shirt", assetType: { id: 11, name: "Shirt" } },
        { id: 2, name: "Clean Trousers", assetType: { id: 12, name: "Pants" } },
        { id: 101, name: "Simple Silver Watch", assetType: { id: 8, name: "Hat" } },
        { id: 102, name: "Small Stud Earring", assetType: { id: 41, name: "FaceAccessory" } },
      ];

      const profile = createMockProfile({
        avatar: {
          playerAvatarType: "R15",
          assets,
          emotes: [],
          scales: null,
          bodyColors: null,
          defaultShirtApplied: false,
          defaultPantsApplied: false,
        },
      });

      const report = calculateAvatarRank(profile);
      const hasMinimalism = report.styles.some((s) => s.style === "minimalism");
      expect(hasMinimalism).toBe(true);
    });

    // 4. Avatar có 5 phụ kiện nhưng là avatar mặc định hoặc chưa hoàn thiện: không tự động gán Minimalism.
    it("Trường hợp 4: Avatar có 5 phụ kiện nhưng là avatar mặc định -> không tự động gán Minimalism", () => {
      const assets = [
        { id: 101, name: "Default Hat", assetType: { id: 8, name: "Hat" } },
      ];

      const defaultProfile = createMockProfile({
        avatar: {
          playerAvatarType: "R15",
          assets,
          emotes: [],
          scales: null,
          bodyColors: null,
          defaultShirtApplied: true, // Trang phục mặc định của hệ thống
          defaultPantsApplied: true,
        },
      });

      const report = calculateAvatarRank(defaultProfile);
      const hasMinimalism = report.styles.some((s) => s.style === "minimalism");
      expect(hasMinimalism).toBe(false);
    });

    // 5. Avatar chỉ có Invincible Shirt: chưa đủ cơ sở xác nhận Cosplay.
    it("Trường hợp 5: Avatar chỉ có Invincible Shirt -> chưa đủ cơ sở xác nhận Cosplay (status: unconfirmed)", () => {
      const assets = [
        { id: 1, name: "Invincible Shirt", assetType: { id: 11, name: "Shirt" } },
        { id: 2, name: "Blue Jeans", assetType: { id: 12, name: "Pants" } },
      ];

      const res = analyzeFandomAndCosplay(assets, null, null);
      expect(res.identificationStatus).toBe("unconfirmed");
      expect(res.isCosplay).toBe(false);
      expect(res.confidence).toBeLessThan(0.5);
      expect(res.supportingEvidence.some((e) => e.includes("CẢNH BÁO TỪ KHÓA THÔNG THƯỜNG"))).toBe(true);
    });

    // 6. Avatar có từ hai vật phẩm cùng chứa từ khóa đặc trưng Invincible: kích hoạt tìm kiếm và đối chiếu nhân vật.
    it("Trường hợp 6: Avatar có từ 2 vật phẩm cùng chứa Invincible -> kích hoạt điều tra Cosplay và đối chiếu nhân vật", () => {
      const assets = [
        { id: 1, name: "Invincible Superhero Suit Shirt", assetType: { id: 11, name: "Shirt" } },
        { id: 2, name: "Invincible Mask Goggles", assetType: { id: 41, name: "FaceAccessory" } },
      ];

      const res = analyzeFandomAndCosplay(assets, null, null);
      expect(res.isCosplay).toBe(true);
      expect(["confirmed", "likely"]).toContain(res.identificationStatus);
      expect(res.characterName).toBe("Invincible (Mark Grayson)");
      expect(res.franchiseName).toBe("Invincible");
      expect(res.confidence).toBeGreaterThanOrEqual(0.85);
      expect(res.supportingEvidence.some((e) => e.includes("KÍCH HOẠT ĐIỀU TRA COSPLAY"))).toBe(true);
    });

    // 7. Avatar có nhiều vật phẩm cùng tên nhưng không liên quan đến cùng một fandom: không kết luận Cosplay chỉ dựa vào sự trùng lặp.
    it("Trường hợp 7: Avatar có vật phẩm trùng từ nhưng mâu thuẫn fandom -> phát hiện xung đột và hạ mức tin cậy", () => {
      const conflictingAssets = [
        { id: 1, name: "Goku Saiyan Orange Gi", assetType: { id: 11, name: "Shirt" } },
        { id: 2, name: "Naruto Uzumaki Headband Leaf", assetType: { id: 41, name: "Hat" } },
      ];

      const res = analyzeFandomAndCosplay(conflictingAssets, null, null);
      expect(res.contradictingEvidence.length).toBeGreaterThan(0);
      expect(res.identificationStatus).not.toBe("confirmed");
    });

    // 8. Avatar cosplay nhân vật hoạt hình hoặc động vật 3D: đánh giá Humor theo mức độ hài hước thực tế.
    it("Trường hợp 8: Avatar cosplay động vật 3D (Horse Mask / Inflatable Dino) -> đánh giá Humor cao theo độ hài hước thực tế", () => {
      const horseProfile = createMockProfile({
        avatar: {
          playerAvatarType: "R15",
          assets: [
            { id: 1, name: "Classic Rubber Horse Mask", assetType: { id: 8, name: "Hat" } },
            { id: 2, name: "Brown Fur Jacket", assetType: { id: 11, name: "Shirt" } },
            { id: 3, name: "Brown Fur Pants", assetType: { id: 12, name: "Pants" } },
          ],
          emotes: [],
          scales: null,
          bodyColors: null,
          defaultShirtApplied: false,
          defaultPantsApplied: false,
        },
      });

      const report = calculateAvatarRank(horseProfile);
      expect(report.criteria.humor.score).toBeGreaterThanOrEqual(60);
      expect(report.categorizedTags.categoryTags.some((c) => c.name === "Animal")).toBe(true);
    });

    // 9. Avatar mô phỏng người nổi tiếng hoặc cầu thủ bóng đá: cân nhắc Humor cao hơn nhưng không mặc định Creativity cao.
    it("Trường hợp 9: Avatar mô phỏng cầu thủ bóng đá (CR7 / Ronaldo) -> Humor cân nhắc cao nhưng Creativity không mặc định cao", () => {
      const cr7Profile = createMockProfile({
        avatar: {
          playerAvatarType: "R15",
          assets: [
            { id: 1, name: "Cristiano Ronaldo Real Madrid Jersey 7", assetType: { id: 11, name: "Shirt" } },
            { id: 2, name: "Real Madrid White Shorts", assetType: { id: 12, name: "Pants" } },
          ],
          emotes: [],
          scales: null,
          bodyColors: null,
          defaultShirtApplied: false,
          defaultPantsApplied: false,
        },
      });

      const report = calculateAvatarRank(cr7Profile);
      // Humor được cân nhắc cao hơn
      expect(report.criteria.humor.score).toBeGreaterThanOrEqual(45);
      // Originality/Creativity không bị thổi phồng vì chỉ mặc áo đấu có sẵn
      expect(report.criteria.uniqueness.score).toBeLessThanOrEqual(65);
      expect(report.categorizedTags.categoryTags.some((c) => c.name === "Footballer")).toBe(true);
    });

    // 10. Avatar có nhiều phong cách hợp lệ: hiển thị đầy đủ các Style Tags, không chỉ một tag.
    it("Trường hợp 10: Avatar có nhiều phong cách hợp lệ -> hiển thị đầy đủ Style Tags không chỉ một tag", () => {
      const multiStyleProfile = createMockProfile({
        avatar: {
          playerAvatarType: "R15",
          assets: [
            { id: 1, name: "Cyberpunk Techwear Neon Visor", assetType: { id: 41, name: "FaceAccessory" } },
            { id: 2, name: "Cyberpunk Futuristic Jacket", assetType: { id: 11, name: "Shirt" } },
            { id: 3, name: "Y3K Chrome Silver Boots", assetType: { id: 47, name: "BackAccessory" } },
            { id: 4, name: "Goth Dark Spikes Collar", assetType: { id: 42, name: "NeckAccessory" } },
          ],
          emotes: [],
          scales: null,
          bodyColors: null,
          defaultShirtApplied: false,
          defaultPantsApplied: false,
        },
      });

      const report = calculateAvatarRank(multiStyleProfile);
      // Không được chỉ hiển thị một tag duy nhất
      expect(report.categorizedTags.aestheticTags.length).toBeGreaterThan(1);
      // Có phân biệt rõ Primary và Secondary
      const hasPrimary = report.categorizedTags.aestheticTags.some((t) => t.isPrimary);
      const hasSecondary = report.categorizedTags.aestheticTags.some((t) => t.isSecondary);
      expect(hasPrimary).toBe(true);
      expect(hasSecondary).toBe(true);
    });

    // 11. API tìm kiếm không khả dụng: thông báo giới hạn và sử dụng phương án dự phòng hợp lệ.
    it("Trường hợp 11: API tìm kiếm ngoài không khả dụng -> thông báo giới hạn minh bạch và fallback hợp lệ", async () => {
      const { investigateCosplayKeywords } = await import("@/lib/searchService");
      const searchReport = await investigateCosplayKeywords(["Invincible", "Shirt"], "Invincible", "Invincible");

      // Trong môi trường test không có GOOGLE_SEARCH_API_KEY
      expect(searchReport.isExternalApiConfigured).toBe(false);
      expect(searchReport.statusMessage).toContain("Chưa cấu hình Google Search API Key");
      expect(searchReport.searchesPerformed.length).toBeGreaterThan(0);
      expect(searchReport.searchesPerformed[0].provider).toBe("roblox_catalog_meta");
    });

    // 12. Kết quả tìm kiếm không đủ bằng chứng: sử dụng trạng thái chưa xác nhận thay vì bịa thông tin.
    it("Trường hợp 12: Không đủ bằng chứng -> trả về trạng thái unknown / unconfirmed thay vì bịa thông tin", () => {
      const plainAssets = [
        { id: 1, name: "Casual Striped Sweater", assetType: { id: 11, name: "Shirt" } },
        { id: 2, name: "Blue Denim Pants", assetType: { id: 12, name: "Pants" } },
      ];

      const res = analyzeFandomAndCosplay(plainAssets, null, null);
      expect(res.identificationStatus).toBe("unknown");
      expect(res.characterName).toBeNull();
      expect(res.isCosplay).toBe(false);
      expect(res.searchSources.some((s) => s.supports.includes("Không phát hiện"))).toBe(true);
    });
  });
});

describe("Gu cá nhân nullable — trạng thái “Chưa chọn”", () => {
  it("null: điểm tổng = 100% điểm hệ thống, không bị trừ 25%", () => {
    const report = calculateAvatarRank(createMockProfile(), null, null, null);

    expect(report.personalTier).toBeNull();
    expect(report.personalScore).toBeNull();
    expect(report.personalWeight).toBe(0);
    expect(report.aiWeight).toBe(1);
    expect(report.total).toBe(report.aiScore);

    expect(report.criteria.personal.score).toBeNull();
    expect(report.criteria.personal.weight).toBe(0);
    expect(report.criteria.personal.summary).toContain("100%");
  });

  it("đã chọn RARE: giữ đúng công thức 75% AI + 25% gu", () => {
    const report = calculateAvatarRank(createMockProfile(), null, null, "RARE");
    const expectedTotal = Math.round((report.aiScore * 0.75 + 35 * 0.25) * 100) / 100;

    expect(report.personalTier).toBe("RARE");
    expect(report.personalScore).toBe(35);
    expect(report.personalWeight).toBe(0.25);
    expect(report.aiWeight).toBe(0.75);
    expect(report.total).toBe(expectedTotal);

    expect(report.criteria.personal.score).toBe(35);
    expect(report.criteria.personal.weight).toBe(0.25);
  });

  it("null không làm vỡ rarity hay các trường bắt buộc của report", () => {
    const report = calculateAvatarRank(createMockProfile(), null, null, null);

    expect(TIER_ORDER).toContain(report.rarity.tier);
    expect(report.uncappedTier).toBe(getRarityForScore(report.aiScore));
    expect(Number.isFinite(report.total)).toBe(true);
    expect(report.total).toBeGreaterThanOrEqual(0);
    expect(report.total).toBeLessThanOrEqual(100);
  });

  it("bỏ qua tham số vẫn giữ tương thích ngược với default COMMON", () => {
    const report = calculateAvatarRank(createMockProfile());
    const expectedTotal = Math.round(report.aiScore * 0.75 * 100) / 100;

    expect(report.personalTier).toBe("COMMON");
    expect(report.personalScore).toBe(0);
    expect(report.personalWeight).toBe(0.25);
    expect(report.aiWeight).toBe(0.75);
    expect(report.total).toBe(expectedTotal);
  });
});
