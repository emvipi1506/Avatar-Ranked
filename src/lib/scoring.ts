import type { RobloxProfile, ScoreCriterion, ScoreResult, RarityTier } from "@/types";
import { RARITIES, RARITIES_LIST } from "./rarity";

const clamp = (val: number, min = 0, max = 100) => Math.min(max, Math.max(min, Math.round(val)));

/**
 * Tạo một số ngẫu nhiên có trọng số hoặc trong khoảng [min, max]
 */
function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Hệ thống gacha drop rate có kiểm soát:
 * Mặc định:
 * - COMMON: 40%
 * - UNCOMMON: 25%
 * - RARE: 17%
 * - EPIC: 10%
 * - LEGENDARY: 6%
 * - MYTHICAL: 2%
 *
 * Tổng điểm của avatar (0-300) đóng vai trò là "Luck Modifier" (tối đa +15% dịch chuyển trọng số lên cấp cao).
 */
export function rollRarity(totalScore: number): RarityTier {
  // Điểm may mắn tăng nhẹ xác suất cấp cao (0 - 0.25)
  const luckFactor = totalScore / 300; // 0.0 -> 1.0

  // Điều chỉnh trọng số (base weights: 40, 25, 17, 10, 6, 2)
  let wCommon = Math.max(15, 40 - luckFactor * 20);
  let wUncommon = Math.max(15, 25 - luckFactor * 5);
  let wRare = 17 + luckFactor * 5;
  let wEpic = 10 + luckFactor * 8;
  let wLegendary = 6 + luckFactor * 7;
  let wMythical = 2 + luckFactor * 5;

  const totalWeight = wCommon + wUncommon + wRare + wEpic + wLegendary + wMythical;
  const roll = Math.random() * totalWeight;

  let acc = 0;
  if (roll < (acc += wCommon)) return "COMMON";
  if (roll < (acc += wUncommon)) return "UNCOMMON";
  if (roll < (acc += wRare)) return "RARE";
  if (roll < (acc += wEpic)) return "EPIC";
  if (roll < (acc += wLegendary)) return "LEGENDARY";
  return "MYTHICAL";
}

/**
 * Tính điểm 3 tiêu chí: UNIQUENESS, VALUE, HUMOR
 * Dựa trên cấu trúc avatar thật + yếu tố biến thiên ngẫu nhiên theo mỗi lần scan
 */
export function calculateAvatarRank(profile: RobloxProfile): ScoreResult {
  const { assets, emotes, playerAvatarType } = profile.avatar;
  const assetCount = assets.length;
  const isR6 = playerAvatarType === "R6";

  // Phân tích loại đồ
  const hatCount = assets.filter((a) => a.assetType.name.includes("Hat")).length;
  const hairCount = assets.filter((a) => a.assetType.name.includes("Hair")).length;
  const faceAccCount = assets.filter((a) => a.assetType.name.includes("Face")).length;
  const waistOrBackCount = assets.filter((a) => a.assetType.name.includes("Back") || a.assetType.name.includes("Waist")).length;

  // 1. UNIQUENESS (Độ độc lạ)
  // Kết hợp: R6 cổ điển hoặc layer đồ phức tạp, số lượng phụ kiện dị, biến thiên ngẫu nhiên
  const baseUniqueness = 35 + (isR6 ? 18 : 10) + Math.min(25, assetCount * 3.5) + (waistOrBackCount > 0 ? 10 : 0);
  const uniquenessScore = clamp(baseUniqueness + randomBetween(-15, 18));
  const uniquenessDetail =
    uniquenessScore >= 80
      ? "Phong cách cực dị và đột phá, không đụng hàng!"
      : uniquenessScore >= 55
      ? "Nét riêng rõ rệt, kết hợp phụ kiện độc đáo."
      : "Kiểu dáng quen thuộc, cần thêm điểm nhấn sáng tạo.";

  // 2. VALUE (Độ đắt tiền - mang tính giải trí)
  // Kết hợp: số lượng phụ kiện, tài khoản verified/thâm niên, số follower, biến thiên ngẫu nhiên
  const cloutBonus = Math.min(20, Math.log10(profile.followersCount + 1) * 4);
  const baseValue = 30 + Math.min(30, (hatCount + hairCount + faceAccCount) * 6) + cloutBonus + (profile.hasVerifiedBadge ? 15 : 0);
  const valueScore = clamp(baseValue + randomBetween(-18, 20));
  const valueDetail =
    valueScore >= 80
      ? "Trông tựa như khoác lên cả gia tài Robux ảo lấp lánh!"
      : valueScore >= 55
      ? "Trang phục chất lượng, phụ kiện được đầu tư chỉn chu."
      : "Thiết kế mộc mạc, không phô trương tiền bạc.";

  // 3. HUMOR (Độ hài hước)
  // Kết hợp: số lượng emote, tỷ lệ đồ kỳ quặc (R6 thường meme hơn), random
  const baseHumor = 25 + (isR6 ? 22 : 8) + emotes.length * 6 + (assetCount === 0 || assetCount > 8 ? 16 : 5);
  const humorScore = clamp(baseHumor + randomBetween(-20, 22));
  const humorDetail =
    humorScore >= 80
      ? "Năng lượng tấu hài đỉnh cao, xuất hiện là gây cười!"
      : humorScore >= 50
      ? "Có nét hài ngầm thú vị, biểu cảm tự nhiên."
      : "Hình tượng nghiêm túc, phong thái cool ngầu.";

  const totalScore = uniquenessScore + valueScore + humorScore;
  const normalizedScore = Math.round(totalScore / 3);

  // Roll cấp độ Rarity
  const tier = rollRarity(totalScore);
  const rarity = RARITIES[tier];

  return {
    uniqueness: {
      key: "uniqueness",
      title: "UNIQUENESS",
      subtitle: "How unique does your avatar look?",
      score: uniquenessScore,
      detail: uniquenessDetail,
    },
    value: {
      key: "value",
      title: "VALUE",
      subtitle: "How premium does your avatar look?",
      score: valueScore,
      detail: valueDetail,
    },
    humor: {
      key: "humor",
      title: "HUMOR",
      subtitle: "How funny is your avatar's style?",
      score: humorScore,
      detail: humorDetail,
    },
    totalScore,
    normalizedScore,
    rarity,
    quote: rarity.quote,
    timestamp: new Date().toISOString(),
    scanSeed: Math.floor(Math.random() * 1000000),
  };
}
