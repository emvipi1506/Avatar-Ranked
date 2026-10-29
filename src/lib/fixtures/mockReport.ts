import { RARITIES } from "@/lib/rarity";
import { calculateAvatarRank } from "@/lib/scoring";
import type { RobloxProfile, RobloxUser, ScoreReport } from "@/types";

/** Profile cố định dùng cho preview UI, không gọi Roblox API. */
export const mockProfile: RobloxProfile = {
  id: 156,
  name: "builderman",
  displayName: "Builderman",
  description: "Classic Roblox builder. Không cần API để preview UI.",
  created: "2006-02-01T00:00:00Z",
  isBanned: false,
  hasVerifiedBadge: true,
  friendsCount: 1200,
  followersCount: 250000,
  followingCount: 12,
  avatar: {
    playerAvatarType: "R6",
    assets: [
      { id: 1001, name: "Classic Noob Head", assetType: { id: 79, name: "Head" } },
      { id: 1002, name: "Classic Blue Torso", assetType: { id: 17, name: "Torso" } },
      { id: 1003, name: "Classic Green Legs", assetType: { id: 19, name: "LeftLeg" } },
      { id: 1004, name: "Pal Hair", assetType: { id: 8, name: "HairAccessory" } },
      { id: 1005, name: "Retro Shades", assetType: { id: 41, name: "FaceAccessory" } },
      { id: 1006, name: "Blue Portfolio", assetType: { id: 42, name: "NeckAccessory" } },
    ],
    emotes: [
      { assetId: 2001, assetName: "Wave", position: 1 },
      { assetId: 2002, assetName: "Cheer", position: 2 },
      { assetId: 2003, assetName: "Point", position: 3 },
      { assetId: 2004, assetName: "Dance", position: 4 },
      { assetId: 2005, assetName: "Laugh", position: 5 },
    ],
    scales: { height: 1, width: 1, head: 1, depth: 1, proportion: 0, bodyType: 0 },
    bodyColors: {
      headColor3: "F5CD30",
      torsoColor3: "0D69AC",
      rightArmColor3: "F5CD30",
      leftArmColor3: "F5CD30",
      rightLegColor3: "4B974B",
      leftLegColor3: "4B974B",
    },
    defaultShirtApplied: false,
    defaultPantsApplied: false,
  },
};

export const mockUser: RobloxUser = {
  id: mockProfile.id,
  name: mockProfile.name,
  displayName: mockProfile.displayName,
  hasVerifiedBadge: mockProfile.hasVerifiedBadge,
};

const base = calculateAvatarRank(mockProfile, null, null, null);

/**
 * Report cố định cho UI preview:
 * - tổng 85/100 → 8.5/10, LEGENDARY
 * - gu cá nhân "Chưa chọn" → 100% điểm hệ thống
 */
export const mockReport: ScoreReport = {
  ...base,
  criteria: {
    ...base.criteria,
    theme: {
      ...base.criteria.theme,
      score: 90,
      summary: "Concept classic-noob được đẩy thành một tuyên ngôn thẩm mỹ có chủ đích.",
      evidence: [
        "Bảng màu noob kinh điển: đầu vàng, thân xanh, chân xanh lá.",
        "Phụ kiện Pal Hair + Retro Shades tạo silhouette nhận diện tức thì.",
        "Trang phục hoàn chỉnh, không dùng item mặc định.",
      ],
    },
    uniqueness: {
      ...base.criteria.uniqueness,
      score: 86,
      summary: "Không chạy theo trend hiện tại; độc lạ nhờ chất hoài niệm R6 rất rõ.",
      evidence: [
        "Rig R6 cổ điển giữa thời đại R15.",
        "Palette noob được dùng như một statement, không phải tai nạn.",
      ],
    },
    humor: {
      ...base.criteria.humor,
      score: 82,
      summary: "Meme tự thân, không cần cố gắng. Người xem hiểu ngay trong 0.5 giây.",
      evidence: ["Classic noob palette là meme gốc của Roblox.", "Retro Shades làm tổng thể bớt nghiêm túc."],
    },
    value: {
      ...base.criteria.value,
      score: 72,
      summary: "Trang phục có đầu tư vừa phải nhưng chủ yếu dựa vào item cổ điển.",
      evidence: ["3 vật phẩm đang mở bán có giá xác minh.", "1 vật phẩm miễn phí."],
    },
    personal: {
      ...base.criteria.personal,
      score: null,
      weight: 0,
      summary: "Bạn chưa chọn mức đánh giá. Điểm tổng tính 100% từ hệ thống.",
      evidence: ["Chưa chọn gu cá nhân — điểm tổng hiện tính 100% từ hệ thống."],
    },
  },
  aiScore: 85,
  aiWeight: 1,
  personalScore: null,
  personalTier: null,
  personalWeight: 0,
  total: 85,
  rawTotal: 85,
  uncappedTier: "LEGENDARY",
  rarity: RARITIES.LEGENDARY,
  dataQuality: { level: "complete", issues: [], capApplied: false },
  value: {
    available: true,
    totalRobux: 4250,
    scoredRobux: 3650,
    pricedCount: 3,
    freeCount: 1,
    priced: [
      { id: 1004, name: "Pal Hair", price: 1500 },
      { id: 1005, name: "Retro Shades", price: 1750 },
      { id: 1006, name: "Blue Portfolio", price: 1000 },
    ],
    excluded: [],
    coverage: 1,
    duplicatesRemoved: 0,
  },
  strengths: [
    "Classic noob palette được dùng có chủ đích, không lẫn tạp.",
    "R6 + Pal Hair + Retro Shades tạo bộ nhận diện cực mạnh.",
    "Trang phục hoàn chỉnh, không có item mặc định.",
  ],
  weaknesses: [
    "Giá trị Robux ở mức trung bình, chưa có item limited thực sự đắt.",
    "Nếu muốn lên MYTHICAL cần thêm một điểm nhấn silhouette hoặc cosplay rõ hơn.",
  ],
  outfitRecommendations: [
    "Thêm một lớp áo khoác tối màu để tăng chiều sâu nhưng giữ nguyên palette noob.",
    "Thử một phụ kiện lưng có hình khối lớn để silhouette đọc tốt hơn từ xa.",
  ],
  nextTier: {
    target: "MYTHICAL",
    pointsNeeded: 7,
    steps: [
      "Tăng độ hiếm catalog bằng một item limited có silhouette rõ.",
      "Giữ nguyên palette noob nhưng thêm layered clothing để tăng chiều sâu.",
    ],
  },
  mythicalAdvice: [
    "Đạt điểm xuất sắc đồng đều (trung bình >= 92 điểm) trên hệ thống AI.",
    "Cần một định hướng thẩm mỹ đỉnh cao: phối màu hoàn hảo hoặc cosplay xuất chúng.",
    "Dữ liệu Roblox API và Catalog phải xác minh đầy đủ 100%.",
  ],
  limitations: [
    "Report mẫu dùng dữ liệu tĩnh, không gọi Roblox API.",
    "Điểm Robux trong fixture chỉ để minh họa UI, không phải giá thật tại thời điểm chạy.",
  ],
};
