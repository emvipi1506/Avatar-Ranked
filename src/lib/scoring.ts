import type {
  AvatarAsset,
  AvatarBodyColors,
  AvatarScales,
  CatalogSummary,
  CategorizedStyleTags,
  Confidence,
  CosplayMatchInfo,
  CosplayRecognitionResult,
  CriterionKey,
  CriterionResult,
  DataQuality,
  DetectedStyleInfo,
  PaletteStats,
  PersonalTierSelection,
  RarityTier,
  RobloxProfile,
  ScoreReport,
  StyleKey,
  StyleMatch,
  TierAdvice,
  ValueBreakdown,
} from "@/types";
import { applyDataQualityCap, getRarityForScore, RARITIES, TIER_ORDER } from "./rarity";
import { applySecretAccountBoost, isSecretAccount } from "./secretAccount";
import { AVATAR_STYLES_CATALOG, AVATAR_STYLE_MAP, TOTAL_STYLES_COUNT } from "./data/avatarStyles";
import { STYLE_GROUPS } from "./data/styleGroups";
import {
  assetGroup,
  buildStyleUnits,
  CELEBRITY_KEYWORDS,
  CosplayDetection,
  detectCosplayInAssets,
  isClassicNoobPalette,
  isPriceableAsset,
  isStylingAsset,
  KNOWN_ROBLOX_MEMES,
  matchKeywords,
  outfitCompleteness,
  STYLE_KEYWORDS,
  STYLE_LABELS,
  StyleUnit,
} from "./styleRules";
import { analyzeFandomAndCosplay, FandomRecognitionResult } from "./fandomRecognition";

const clamp = (v: number, min = 0, max = 100) => Math.min(max, Math.max(min, Math.round(v)));

// ==========================================
// A. CHỦ ĐỀ VÀ SỰ HÀI HÒA (THEME & COHESION - 35%)
// ==========================================
function evaluateTheme(
  profile: RobloxProfile,
  units: StyleUnit[],
  palette: PaletteStats | null,
  styles: StyleMatch[],
  fandomRes: FandomRecognitionResult,
  cosplays: CosplayDetection[] = [],
): CriterionResult {
  const assets = profile.avatar.assets;
  const evidence: string[] = [];
  let score = 50; // Điểm khởi đầu trung tính

  // 1. Nhận diện Fandom & Cosplay
  if (fandomRes.identificationStatus === "confirmed") {
    score = 78;
    evidence.push(
      `⭐ Nhận diện Cosplay xác thực (CONFIRMED): "${fandomRes.characterName}" (${fandomRes.franchiseName}) — Độ tin cậy ${Math.round(fandomRes.confidence * 100)}%`
    );
    for (const ev of fandomRes.supportingEvidence.slice(0, 3)) {
      evidence.push(`  • ${ev}`);
    }
  } else if (fandomRes.identificationStatus === "likely") {
    score = 70;
    evidence.push(
      `⭐ Phát hiện dấu hiệu Cosplay rõ nét (LIKELY): "${fandomRes.characterName}" (${fandomRes.franchiseName})`
    );
    for (const ev of fandomRes.supportingEvidence.slice(0, 2)) {
      evidence.push(`  • ${ev}`);
    }
  } else if (fandomRes.identificationStatus === "possible") {
    score = 58;
    evidence.push(
      `Gợi ý tạo hình nhân vật (POSSIBLE): "${fandomRes.characterName}" (${fandomRes.franchiseName}) từ phụ kiện đơn lẻ`
    );
  } else if (fandomRes.identificationStatus === "unconfirmed") {
    score = 52;
    evidence.push(
      `⚠️ Chưa thể xác nhận Cosplay (UNCONFIRMED): "${fandomRes.characterName}" do từ khóa có thể mang nghĩa thông thường`
    );
  } else if (cosplays.length > 0) {
    score = 65;
    for (const c of cosplays.slice(0, 2)) {
      evidence.push(`Gợi ý phong cách "${c.character}" (${c.franchise}) qua phụ kiện "${c.assetName}"`);
    }
  }

  // 2. Tính đầy đủ của trang phục
  const completeness = outfitCompleteness(
    assets,
    profile.avatar.defaultShirtApplied,
    profile.avatar.defaultPantsApplied
  );
  if (completeness.hasTop && completeness.hasBottom) {
    score += 12;
    evidence.push("Trang phục hoàn chỉnh: có đầy đủ áo và quần do người chơi chủ động phối");
  } else if (!completeness.hasTop && !completeness.hasBottom) {
    score -= 15;
    evidence.push("Thiếu cả áo và quần tùy chỉnh (sử dụng trang phục mặc định của hệ thống Roblox)");
  } else {
    evidence.push("Trang phục bán phần (chỉ có áo hoặc quần tùy chỉnh)");
  }

  // 3. Phân tích màu sắc thực tế từ bảng màu pixel
  if (palette) {
    const harmonyBonus = Math.round(palette.harmonyScore * 24);
    score += harmonyBonus - 12;
    evidence.push(
      `Bảng màu ảnh: phối kiểu ${palette.harmony} (độ hài hòa ${Math.round(palette.harmonyScore * 100)}%, ${palette.hueClusters} cụm màu chính)`
    );
  } else {
    evidence.push("Không trích xuất được bảng màu pixel từ ảnh (sử dụng phân tích cấu trúc trang phục)");
  }

  // 4. Sự tập trung vào phong cách chủ đạo
  const nonMemeStyles = styles.filter(
    (s) => s.style !== "meme" && s.style !== "minimalism" && s.style !== "maximalism"
  );
  if (nonMemeStyles.length === 1) {
    const top = nonMemeStyles[0];
    score += Math.min(20, top.itemCount * 6);
    evidence.push(`Định hướng thẩm mỹ rõ nét theo phong cách ${top.label} (${top.itemCount} món đồ củng cố cùng chủ đề)`);
  } else if (nonMemeStyles.length > 1) {
    const primary = nonMemeStyles[0];
    const secondary = nonMemeStyles[1];
    if (primary.itemCount >= secondary.itemCount * 2) {
      score += 10;
      evidence.push(`Phong cách chủ đạo ${primary.label} chiếm ưu thế, kết hợp phụ phong cách ${secondary.label}`);
    } else {
      score -= 6;
      evidence.push(`Trộn lẫn nhiều phong cách (${nonMemeStyles.map((s) => s.label).join(", ")}) có thể gây xung đột thị giác`);
    }
  }

  // 5. Mâu thuẫn concept
  if (fandomRes.contradictingEvidence.length > 0) {
    score -= 10;
    for (const contra of fandomRes.contradictingEvidence) {
      evidence.push(`⚠️ Mâu thuẫn concept: ${contra}`);
    }
  }

  const accessoryCount = assets.filter((a) => assetGroup(a.assetType?.name ?? "") === "accessory").length;
  if (accessoryCount > 10 && nonMemeStyles.length === 0 && !fandomRes.isCosplay) {
    score -= 12;
    evidence.push(`Đeo nhiều phụ kiện rời rạc (${accessoryCount} món) nhưng không hội tụ về một ý tưởng phong cách cụ thể`);
  }

  const finalScore = clamp(score);
  return {
    key: "theme",
    label: "Theme & Cohesion",
    labelVi: "Chủ đề & Hài hòa (gồm Cosplay)",
    score: finalScore,
    weight: 0.35,
    confidence: fandomRes.identificationStatus === "confirmed" || palette ? "high" : "medium",
    summary:
      fandomRes.identificationStatus === "confirmed"
        ? `Định hướng Cosplay xuất sắc theo hình tượng ${fandomRes.characterName} (${fandomRes.franchiseName}) với độ hoàn thiện cao.`
        : fandomRes.identificationStatus === "likely"
        ? `Tái hiện rõ nét hình mẫu ${fandomRes.characterName} (${fandomRes.franchiseName}), phong cách ăn khớp.`
        : finalScore >= 80
        ? "Tổng thể trang phục có định hướng thẩm mỹ rất rõ ràng, màu sắc và phụ kiện ăn khớp chuẩn mực."
        : finalScore >= 50
        ? "Trang phục có concept tương đối nhưng các chi tiết hoặc màu sắc chưa thực sự đồng nhất."
        : "Các chi tiết trang phục rời rạc, thiếu sự liên kết chủ đề hoặc phối màu xung đột.",
    evidence,
  };
}

// ==========================================
// B. ĐỘC LẠ VÀ SÁNG TẠO (ORIGINALITY & CREATIVITY - 30%)
// ==========================================
function evaluateUniqueness(
  profile: RobloxProfile,
  units: StyleUnit[],
  catalog: CatalogSummary | null,
  styles: StyleMatch[],
  fandomRes: FandomRecognitionResult,
): CriterionResult {
  const assets = profile.avatar.assets;
  const evidence: string[] = [];
  let score = 45; // Điểm khởi đầu

  // 1. Tương quan: Trend phổ biến vs Biến tấu sáng tạo
  // Nguyên tắc: Nếu avatar mô phỏng một meme, danh thủ hoặc viral trend phổ biến nhưng không có sự sáng tạo đáng kể:
  // tăng Humor nhưng KHÔNG mặc định cho Creativity cao.
  // Nếu có biến tấu độc đáo, phối hợp bất ngờ: có thể chấm Creativity cao.
  if (fandomRes.franchiseType === "footballer" || fandomRes.franchiseType === "celebrity" || fandomRes.isMemeOrParody) {
    const hasUnexpectedCombo = assets.some((a) => {
      const n = a.name.toLowerCase();
      return n.includes("tuxedo") || n.includes("suit") || n.includes("blazer") || n.includes("formal");
    });
    const layeredCount = units.filter((u) => u.group === "layered").length;

    if (hasUnexpectedCombo || layeredCount >= 2) {
      score += 24;
      evidence.push("Mô phỏng trend/nhân vật được biến tấu bất ngờ: kết hợp trang phục sang trọng hoặc nhiều lớp phá cách");
    } else {
      score = 40;
      evidence.push("Mô phỏng meme / trend / danh thủ theo khuôn mẫu phổ biến; tính độc bản ở mức vừa phải");
    }
  } else if (fandomRes.isCosplay) {
    const hasLayeredCreative = units.some((u) => u.group === "layered");
    const hasUniqueSilhouette =
      profile.avatar.scales &&
      (profile.avatar.scales.height !== 1 || profile.avatar.scales.proportion !== 0);

    if (hasLayeredCreative || hasUniqueSilhouette) {
      score += 20;
      evidence.push("Cosplay có sự biến tấu sáng tạo: phối nhiều lớp (layered) hoặc tùy chỉnh silhouette riêng biệt");
    } else {
      score += 8;
      evidence.push("Cosplay tái hiện chuẩn xác nguyên mẫu; tính nguyên bản ở mức vừa phải do bám sát tạo hình có sẵn");
    }
  } else {
    // Concept tự do độc lập
    score += 15;
    evidence.push("Concept tự do không rập khuôn theo nhân vật có sẵn — thể hiện dấu ấn cá nhân");
  }

  // 2. Nhận diện trường phái Minimalism vs Maximalism theo NGƯỠNG MỚI:
  const accessoryCount = assets.filter((a) => assetGroup(a.assetType?.name ?? "") === "accessory").length;
  const completeness = outfitCompleteness(
    assets,
    profile.avatar.defaultShirtApplied,
    profile.avatar.defaultPantsApplied
  );

  const isPlainUniform = fandomRes.franchiseType === "footballer" || fandomRes.franchiseType === "celebrity";
  if (accessoryCount <= 5) {
    const isCompleted = completeness.hasTop && completeness.hasBottom && !profile.avatar.defaultShirtApplied && !profile.avatar.defaultPantsApplied;
    if (isCompleted && !isPlainUniform) {
      score += 18;
      evidence.push(`Phong cách Minimalism (${accessoryCount} phụ kiện, đạt ngưỡng <= 5): tối giản có chủ đích, bố cục gọn gàng`);
    } else if (isCompleted && isPlainUniform) {
      score += 8;
      evidence.push(`Trang phục danh thủ gọn gàng với ${accessoryCount} phụ kiện`);
    } else {
      evidence.push(`Avatar có ${accessoryCount} phụ kiện nhưng trang phục chưa hoàn thiện/mặc định — không gán Minimalism`);
    }
  } else if (accessoryCount >= 21) {
    const layeredCount = units.filter((u) => u.group === "layered").length;
    score += Math.min(22, 14 + layeredCount * 3);
    evidence.push(`Phong cách Maximalism: trang bị ${accessoryCount} phụ kiện (đạt ngưỡng nghiêm ngặt >= 21 món) phối đa tầng dày đặc`);
  } else {
    evidence.push(`Số lượng phụ kiện ở mức trung bình (${accessoryCount} phụ kiện) — không thuộc trường phái Minimalism hay Maximalism`);
  }

  // 3. Định dạng body và tỷ lệ cơ thể (Body Scale & Rig)
  if (profile.avatar.playerAvatarType === "R6") {
    score += 10;
    evidence.push("Sử dụng Rig R6 cổ điển — phong cách mang đậm tính hoài niệm và bản sắc riêng trong Roblox hiện đại");
  }

  if (profile.avatar.scales) {
    const s = profile.avatar.scales;
    if (s.height !== 1 || s.width !== 1 || s.head !== 1 || s.proportion !== 0 || s.bodyType !== 0) {
      score += 8;
      evidence.push(`Tỷ lệ cơ thể tùy biến (Height: ${s.height}, Width: ${s.width}, Proportion: ${s.proportion})`);
    }
  }

  // 4. Vật phẩm Off-sale / Limited đóng góp vào độ hiếm
  if (catalog) {
    const offsaleItems = catalog.items.filter((it) => it.status === "offsale" || it.status === "limited");
    if (offsaleItems.length > 0) {
      const bonus = Math.min(15, offsaleItems.length * 5);
      score += bonus;
      evidence.push(`Sở hữu ${offsaleItems.length} vật phẩm Off-sale hoặc Limited tạo nét độc lạ riêng`);
    }
  }

  // 5. Nhận diện các phong cách ngách ít phổ biến
  const nicheStyles = styles.filter(
    (s) => s.style === "techwear" || s.style === "cyberpunk" || s.style === "goth" || s.style === "oldmoney"
  );
  if (nicheStyles.length > 0) {
    score += 8;
    evidence.push(`Thuộc trường phái thẩm mỹ ngách cá tính (${nicheStyles.map((s) => s.label).join(", ")})`);
  }

  const finalScore = clamp(score);
  return {
    key: "uniqueness",
    label: "Originality & Creativity",
    labelVi: "Độc lạ & Sáng tạo",
    score: finalScore,
    weight: 0.30,
    confidence: "high",
    summary:
      finalScore >= 80
        ? "Avatar có cá tính mạnh mẽ, cách phối đồ và silhouette khác biệt hoàn toàn so với số đông."
        : finalScore >= 55
        ? "Có dấu ấn sáng tạo riêng trong việc kết hợp item, dù vẫn mang một số dáng dấp quen thuộc."
        : "Avatar theo khuôn mẫu đại trà hoặc sao chép trend có sẵn mà chưa có nhiều biến tấu đột phá.",
    evidence,
  };
}

// ==========================================
// C. HÀI HƯỚC VÀ VĂN HÓA MEME (HUMOR & MEME CULTURE - 25%)
// ==========================================
function evaluateHumor(
  profile: RobloxProfile,
  units: StyleUnit[],
  fandomRes: FandomRecognitionResult,
): CriterionResult {
  const assets = profile.avatar.assets;
  const evidence: string[] = [];
  let score = 15; // Khởi điểm cho avatar nghiêm túc/thông thường
  let humorSignalCount = 0;

  // 1. Kiểm tra màu da Noob kinh điển
  if (isClassicNoobPalette(profile.avatar.bodyColors)) {
    score += 48;
    humorSignalCount++;
    evidence.push("Phối màu da Noob kinh điển (đầu/tay vàng, thân xanh dương, chân xanh lá) — biểu tượng meme cốt lõi của Roblox");
  }

  // 2. Ưu tiên Fandom & Cosplay: Động vật, Hoạt hình châm biếm, Meme, Cầu thủ, Người nổi tiếng
  if (fandomRes.franchiseType === "animal") {
    // Cosplay động vật 3D (chó, mèo, ngựa, cá, khủng long, capybara...)
    score += 45;
    humorSignalCount++;
    evidence.push(
      `🐾 Động vật & Cosplay 3D: "${fandomRes.characterName}" (${fandomRes.franchiseName}) — Tạo hình ngộ nghĩnh, hài hước và gây cười.`
    );
  } else if (fandomRes.franchiseType === "footballer") {
    // Cầu thủ bóng đá
    score += 35;
    humorSignalCount++;
    evidence.push(
      `⚽ Cầu thủ bóng đá: "${fandomRes.characterName}" — Hóa trang thành danh thủ sân cỏ tạo không khí vui nhộn trong game.`
    );
  } else if (fandomRes.franchiseType === "celebrity") {
    // Người nổi tiếng / Streamer / YouTuber
    score += 40;
    humorSignalCount++;
    evidence.push(
      `🌟 Người nổi tiếng / Streamer: "${fandomRes.characterName}" (${fandomRes.franchiseName}) — Tái hiện hình tượng nổi tiếng trên mạng.`
    );
  } else if (fandomRes.franchiseType === "cartoon" && (fandomRes.isMemeOrParody || (fandomRes.humorSignalBonus ?? 0) >= 50)) {
    // Nhân vật hoạt hình có ngoại hình hài hước (Shrek, Minion, SpongeBob, South Park...)
    score += 50;
    humorSignalCount++;
    evidence.push(
      `🎭 Hoạt hình châm biếm: "${fandomRes.characterName}" (${fandomRes.franchiseName}) — Ngoại hình độc lạ và gây cười kinh điển.`
    );
  } else if (fandomRes.isMemeOrParody || (fandomRes.humorSignalBonus && fandomRes.humorSignalBonus > 0)) {
    const bonus = fandomRes.humorSignalBonus ?? 45;
    score += Math.min(65, bonus);
    humorSignalCount++;
    evidence.push(
      `⭐ Meme & Viral Trend: "${fandomRes.characterName}" (${fandomRes.franchiseName}) — Đậm chất châm biếm, tấu hài văn hóa Internet.`
    );
  }

  // 3. Quét phát hiện tên động vật trong trang phục/phụ kiện (Animal Keywords)
  const animalPattern = /\b(dog|shiba|corgi|puppy|cat|kitty|feline|horse|dinosaur|dino|t-rex|raptor|capybara|shark|fish|duck|chicken|frog|penguin|monkey|gorilla|bear|pig|cow)\b/i;
  const matchedAnimals = new Set<string>();
  for (const asset of assets) {
    const m = asset.name.match(animalPattern);
    if (m) {
      matchedAnimals.add(m[0].toLowerCase());
      evidence.push(`Phụ kiện "${asset.name}" chứa yếu tố động vật/linh vật: "${m[0]}"`);
    }
  }
  if (matchedAnimals.size > 0 && fandomRes.franchiseType !== "animal") {
    score += Math.min(40, matchedAnimals.size * 18);
    humorSignalCount += matchedAnimals.size;
  }

  // 4. Quét phát hiện cầu thủ bóng đá & người nổi tiếng trong trang phục
  const celebPattern = /\b(ronaldo|cr7|messi|neymar|mbappe|ishowspeed|speed|kai cenat|walter white|heisenberg|homelander|mrbeast)\b/i;
  const matchedCelebs = new Set<string>();
  for (const asset of assets) {
    const m = asset.name.match(celebPattern);
    if (m) {
      matchedCelebs.add(m[0].toLowerCase());
      evidence.push(`Phụ kiện "${asset.name}" mang dấu ấn người nổi tiếng / cầu thủ: "${m[0]}"`);
    }
  }
  if (matchedCelebs.size > 0 && fandomRes.franchiseType !== "footballer" && fandomRes.franchiseType !== "celebrity") {
    score += Math.min(35, matchedCelebs.size * 15);
    humorSignalCount += matchedCelebs.size;
  }

  // 5. Kiểm tra meme Roblox cụ thể (Known Roblox Memes)
  for (const asset of assets) {
    const nameLower = asset.name.toLowerCase();
    for (const km of KNOWN_ROBLOX_MEMES) {
      if (nameLower.includes(km.match)) {
        score += 35;
        humorSignalCount++;
        evidence.push(`Trang bị vật phẩm meme đặc trưng: ${km.label} ("${asset.name}")`);
      }
    }
  }

  // 6. Từ khóa meme trong tên vật phẩm
  const matchedMemeKeywords = new Set<string>();
  for (const asset of assets) {
    const matches = matchKeywords(asset.name, STYLE_KEYWORDS.meme);
    for (const m of matches) {
      matchedMemeKeywords.add(m);
      evidence.push(`Vật phẩm "${asset.name}" chứa từ khóa meme: "${m}"`);
    }
  }
  if (matchedMemeKeywords.size > 0) {
    score += Math.min(45, matchedMemeKeywords.size * 18);
    humorSignalCount += matchedMemeKeywords.size;
  }

  // 7. Thiết kế bất thường: Chiều cao, tỷ lệ cơ thể cố tình gây cười (Body Scales)
  if (profile.avatar.scales) {
    const s = profile.avatar.scales;
    let scaleComedy = false;

    // Kích thước đầu bất thường
    if (s.head >= 1.30 || s.head <= 0.75) {
      score += 22;
      scaleComedy = true;
      humorSignalCount++;
      evidence.push(`Kích thước đầu bất thường có chủ đích gây cười (Head scale: ${s.head})`);
    }

    // Chiều cao và chiều rộng bất thường (quá béo, quá lùn hoặc quá cao dị dạng)
    if (s.height >= 1.25 || s.height <= 0.82 || s.width >= 1.25 || s.width <= 0.75) {
      score += 18;
      scaleComedy = true;
      humorSignalCount++;
      evidence.push(`Tỷ lệ cơ thể dị thường tạo hiệu ứng thị giác kỳ quặc, gây cười (Height: ${s.height}, Width: ${s.width})`);
    }

    if (scaleComedy && profile.avatar.playerAvatarType === "R6") {
      score += 8;
      evidence.push("Kết hợp hình thể dị dạng với khung R6 cổ điển làm tăng tính tấu hài");
    }
  }

  // 8. Tương phản hài hước (Contrast Parody): Áo vest / tuxedo lịch lãm kết hợp đầu meme / động vật
  const hasFormalWear = assets.some((a) => {
    const n = a.name.toLowerCase();
    return n.includes("suit") || n.includes("tuxedo") || n.includes("formal") || n.includes("blazer") || n.includes("tie");
  });
  const hasGoofyHead =
    assets.some((a) => {
      const n = a.name.toLowerCase();
      return (
        n.includes("banana") ||
        n.includes("doge") ||
        n.includes("chicken") ||
        n.includes("toilet") ||
        n.includes("duck") ||
        n.includes("horse") ||
        n.includes("dino") ||
        n.includes("capybara") ||
        n.includes("mask")
      );
    }) || isClassicNoobPalette(profile.avatar.bodyColors);

  if (hasFormalWear && hasGoofyHead) {
    score += 25;
    humorSignalCount++;
    evidence.push("Tương phản hài hước (Contrast Parody): diện trang phục vest lịch lãm kết hợp đầu meme / linh vật ngộ nghĩnh");
  }

  // 9. Emote số lượng lớn
  if (profile.avatar.emotes && profile.avatar.emotes.length >= 5) {
    score += 10;
    evidence.push(`Trang bị nhiều emote tương tác (${profile.avatar.emotes.length} emote), hỗ trợ biểu cảm gây cười trong game`);
  }

  // Avatar nghiêm túc
  if (humorSignalCount === 0) {
    evidence.push("Không phát hiện vật phẩm hoặc yếu tố mang tính meme/động vật/hài hước — avatar thuộc phong cách nghiêm túc");
    score = Math.min(score, 25);
  }

  const finalScore = clamp(score);
  return {
    key: "humor",
    label: "Humor & Meme Culture",
    labelVi: "Hài hước & Văn hóa meme",
    score: finalScore,
    weight: 0.25,
    confidence: humorSignalCount > 0 ? "high" : "medium",
    summary:
      finalScore >= 80
        ? "Concept hài hước xuất sắc, tấu hài kinh điển hoặc parody cực kỳ hiệu quả và bắt mắt."
        : finalScore >= 60
        ? "Meme, động vật 3D, parody hoặc hình thể gây cười rõ rệt, dễ dàng tạo tiếng cười khi xuất hiện trong server."
        : finalScore >= 40
        ? "Có ý tưởng hài hước tương đối dễ nhận ra nhưng chưa đẩy mạnh tối đa hiệu ứng."
        : finalScore >= 20
        ? "Có một vài chi tiết vui nhộn nhẹ, nhưng nhìn chung vẫn giữ nét trung tính."
        : "Avatar được thiết kế theo phong cách nghiêm túc, không nhằm mục đích gây cười.",
    evidence,
  };
}

// ==========================================
// D. GIÁ TRỊ ROBUX (VERIFIED ROBUX VALUE - 10%)
// ==========================================
function evaluateValue(
  assets: AvatarAsset[],
  catalog: CatalogSummary | null,
): { criterion: CriterionResult; breakdown: ValueBreakdown } {
  const stylingAssets = assets.filter(isPriceableAsset);
  const seenIds = new Set<number>();
  const uniqueStylingAssets: AvatarAsset[] = [];
  let duplicatesRemoved = 0;

  for (const a of stylingAssets) {
    if (seenIds.has(a.id)) {
      duplicatesRemoved++;
    } else {
      seenIds.add(a.id);
      uniqueStylingAssets.push(a);
    }
  }

  if (!catalog || catalog.items.length === 0) {
    return {
      criterion: {
        key: "value",
        label: "Verified Robux Value",
        labelVi: "Giá trị Robux",
        score: null,
        weight: 0.10,
        confidence: "low",
        summary: "Không thể lấy dữ liệu catalog từ Roblox API. Tiêu chí này được đánh dấu chưa xác minh.",
        evidence: ["Thiếu dữ liệu phản hồi từ catalog.roblox.com"],
      },
      breakdown: {
        available: false,
        totalRobux: 0,
        scoredRobux: 0,
        pricedCount: 0,
        freeCount: 0,
        priced: [],
        excluded: [],
        coverage: 0,
        duplicatesRemoved,
      },
    };
  }

  const catalogMap = new Map<number, (typeof catalog.items)[0]>();
  for (const it of catalog.items) {
    catalogMap.set(it.id, it);
  }

  let totalRobux = 0;
  let scoredRobux = 0;
  let pricedCount = 0;
  let freeCount = 0;
  const pricedList: { id: number; name: string; price: number }[] = [];
  const excludedList: { id: number; name: string; reason: "offsale" | "limited" | "no-price" | "unverified" }[] = [];

  for (const asset of uniqueStylingAssets) {
    const item = catalogMap.get(asset.id);
    if (!item || item.status === "unverified") {
      excludedList.push({ id: asset.id, name: asset.name, reason: "unverified" });
    } else if (item.status === "offsale") {
      excludedList.push({ id: asset.id, name: asset.name, reason: "offsale" });
    } else if (item.status === "limited") {
      excludedList.push({ id: asset.id, name: asset.name, reason: "limited" });
    } else if (item.status === "no-price") {
      excludedList.push({ id: asset.id, name: asset.name, reason: "no-price" });
    } else if (item.status === "free") {
      freeCount++;
    } else if (item.status === "priced" && typeof item.price === "number") {
      pricedCount++;
      totalRobux += item.price;
      const cappedItemPrice = Math.min(2000, item.price);
      scoredRobux += cappedItemPrice;
      pricedList.push({ id: asset.id, name: asset.name, price: item.price });
    }
  }

  let score = 0;
  if (scoredRobux > 0) {
    score = Math.min(100, Math.round(Math.log10(scoredRobux / 15 + 1) * 36));
  } else if (freeCount > 0 && pricedCount === 0) {
    score = 15;
  }

  const verifiedCount = pricedCount + freeCount;
  const coverage = uniqueStylingAssets.length > 0 ? verifiedCount / uniqueStylingAssets.length : 1;
  const confidence: Confidence = coverage >= 0.7 ? "high" : coverage >= 0.4 ? "medium" : "low";

  const evidence: string[] = [
    `Tổng giá trị Robux đã xác minh: R$ ${totalRobux.toLocaleString("vi-VN")} (tính trên ${pricedCount} vật phẩm đang mở bán)`,
    `Số vật phẩm miễn phí (0 R$): ${freeCount}`,
    `Số vật phẩm bị loại trừ khỏi tính giá: ${excludedList.length} (gồm vật phẩm Off-sale, Limited hoặc không có giá riêng)`,
  ];
  if (duplicatesRemoved > 0) {
    evidence.push(`Đã loại trừ ${duplicatesRemoved} ID vật phẩm trùng lặp`);
  }

  const finalScore = clamp(score);
  return {
    criterion: {
      key: "value",
      label: "Verified Robux Value",
      labelVi: "Giá trị Robux",
      score: finalScore,
      weight: 0.10,
      confidence,
      summary:
        finalScore >= 75
          ? `Khoác lên trang phục cao cấp với tổng giá trị catalog xác minh đạt R$ ${totalRobux.toLocaleString("vi-VN")}.`
          : finalScore >= 40
          ? `Trang phục mức giá tầm trung (R$ ${totalRobux.toLocaleString("vi-VN")}), có sự đầu tư trang bị nhất định.`
          : `Trang phục tiết kiệm hoặc chủ yếu dùng vật phẩm cơ bản/miễn phí (R$ ${totalRobux.toLocaleString("vi-VN")}).`,
      evidence,
    },
    breakdown: {
      available: true,
      totalRobux,
      scoredRobux,
      pricedCount,
      freeCount,
      priced: pricedList,
      excluded: excludedList,
      coverage: Math.round(coverage * 100) / 100,
      duplicatesRemoved,
    },
  };
}

/**
 * Nhận diện phong cách từ Catalog 270 Styles chính thức
 */
export function detectCatalog270Styles(
  profile: RobloxProfile,
  units: StyleUnit[],
  palette: PaletteStats | null,
): {
  primaryStyle: DetectedStyleInfo | null;
  secondaryStyles: DetectedStyleInfo[];
  allDetected: DetectedStyleInfo[];
} {
  const assets = profile.avatar.assets ?? [];
  const bodyColors = profile.avatar.bodyColors;
  const avatarType = profile.avatar.playerAvatarType;
  const results: DetectedStyleInfo[] = [];

  const accessoryCount = assets.filter((a) => assetGroup(a.assetType?.name ?? "") === "accessory").length;
  const completeness = outfitCompleteness(
    assets,
    profile.avatar.defaultShirtApplied,
    profile.avatar.defaultPantsApplied
  );

  for (const styleDef of AVATAR_STYLES_CATALOG) {
    // Điều kiện đặc biệt cho Minimalism và Maximalism:
    if (styleDef.id === "minimalism" || styleDef.id === "clean-minimal") {
      // Chỉ xem xét gán tag Minimalism khi avatar có 5 phụ kiện trở xuống VÀ trang phục hoàn chỉnh
      if (
        accessoryCount <= 5 &&
        completeness.hasTop &&
        completeness.hasBottom &&
        !profile.avatar.defaultShirtApplied &&
        !profile.avatar.defaultPantsApplied
      ) {
        results.push({
          id: styleDef.id,
          name: styleDef.name,
          confidence: "high",
          confidenceScore: 0.88,
          evidence: [
            `Avatar có ${accessoryCount} phụ kiện (ngưỡng <= 5) với trang phục hoàn chỉnh có chủ đích tối giản`,
          ],
          missingEvidence: [],
          itemCount: accessoryCount,
        });
      }
      continue;
    }

    if (styleDef.id === "maximalism" || styleDef.id === "cyber-maximalism") {
      // Chỉ xem xét gán tag Maximalism khi avatar có hơn 20 phụ kiện (từ 21 phụ kiện trở lên)
      if (accessoryCount >= 21) {
        results.push({
          id: styleDef.id,
          name: styleDef.name,
          confidence: "high",
          confidenceScore: 0.92,
          evidence: [
            `Avatar có ${accessoryCount} phụ kiện (đạt ngưỡng nghiêm ngặt >= 21 món) với bố cục dày đặc nhiều lớp`,
          ],
          missingEvidence: [],
          itemCount: accessoryCount,
        });
      }
      continue;
    }

    const evidence: string[] = [];
    const missingEvidence: string[] = [];
    let matchedCount = 0;

    // Quét từ khóa qua các item trang phục
    for (const u of units) {
      const matchedKw = matchKeywords(u.name, styleDef.keywords);
      if (matchedKw.length > 0) {
        matchedCount++;
        evidence.push(`Vật phẩm "${u.name}" khớp từ khóa: ${matchedKw.join(", ")}`);
      }
    }

    // Đặc điểm cấu trúc avatar
    if (styleDef.id === "r6core" && avatarType === "R6") {
      matchedCount += 2;
      evidence.push("Sử dụng bộ khung cơ thể cổ điển R6 (6 bộ phận)");
    }
    if (styleDef.id === "classic-noob" && isClassicNoobPalette(bodyColors)) {
      matchedCount += 3;
      evidence.push("Phối màu da Noob chuẩn xác: Đầu vàng, Thân xanh dương, Chân xanh lá");
    }
    if (styleDef.id === "bacon-hair") {
      const hasPalHair = assets.some(
        (a) => a.name.toLowerCase().includes("pal hair") || a.name.toLowerCase().includes("bacon")
      );
      if (hasPalHair) {
        matchedCount += 2;
        evidence.push("Trang bị kiểu tóc Bacon kinh điển (Pal Hair)");
      }
    }
    if (styleDef.id === "headless") {
      const hasHeadless = assets.some((a) => a.name.toLowerCase().includes("headless"));
      if (hasHeadless) {
        matchedCount += 3;
        evidence.push("Sở hữu trang bị Headless Horseman (Đầu vô hình)");
      }
    }
    if (styleDef.id === "korblox" || styleDef.id === "korblox-flex") {
      const hasKorblox = assets.some((a) => a.name.toLowerCase().includes("korblox"));
      if (hasKorblox) {
        matchedCount += 3;
        evidence.push("Trang bị gói Korblox Deathspeaker (Chân xương bay)");
      }
    }
    if (styleDef.id === "all-black" && palette?.harmony === "monochrome") {
      const dominant = palette.colors[0];
      if (dominant && dominant.share >= 0.6) {
        matchedCount += 1;
        evidence.push("Bảng màu thị giác đơn sắc tối màu chiếm ưu thế");
      }
    }

    if (matchedCount > 0) {
      let confidence: Confidence = "low";
      let confidenceScore = 0.45;
      if (matchedCount >= 3) {
        confidence = "high";
        confidenceScore = Math.min(0.95, 0.75 + matchedCount * 0.05);
      } else if (matchedCount === 2) {
        confidence = "medium";
        confidenceScore = 0.7;
      }

      if (matchedCount === 1) {
        missingEvidence.push("Chỉ có 1 chi tiết đại diện, cần bổ sung thêm trang phục/phụ kiện đồng điệu.");
      }

      results.push({
        id: styleDef.id,
        name: styleDef.name,
        confidence,
        confidenceScore,
        evidence,
        missingEvidence,
        itemCount: matchedCount,
      });
    }
  }

  results.sort((a, b) => b.itemCount - a.itemCount || b.confidenceScore - a.confidenceScore);

  const primaryStyle = results.length > 0 ? results[0] : null;
  const secondaryStyles = results.slice(1, 4);

  return {
    primaryStyle,
    secondaryStyles,
    allDetected: results,
  };
}

/**
 * Phân loại toàn bộ Style Tags thành 4 nhóm rõ ràng theo Mục 2:
 * - Aesthetic Tags: phong cách thẩm mỹ từ Catalog 270 style
 * - Cosplay Tags: nhân vật được hóa trang / mô phỏng
 * - Fandom Tags: anime, phim, truyện, game hoặc vũ trụ liên quan
 * - Category Tags: Meme, Animal, Celebrity, Footballer, Cartoon
 */
export function buildCategorizedStyleTags(
  allDetectedStyles: DetectedStyleInfo[],
  cosplayResult: CosplayRecognitionResult,
  fandomRes: FandomRecognitionResult,
  assets: AvatarAsset[],
  accessoryCount: number,
  completeness: { hasTop: boolean; hasBottom: boolean; defaultShirtApplied: boolean; defaultPantsApplied: boolean }
): CategorizedStyleTags {
  // 1. Aesthetic Tags: hiển thị tất cả các phong cách thẩm mỹ có bằng chứng, sắp xếp từ cao xuống thấp
  const aestheticTags: CategorizedStyleTags["aestheticTags"] = [];

  for (let i = 0; i < allDetectedStyles.length; i++) {
    const s = allDetectedStyles[i];
    aestheticTags.push({
      id: s.id,
      name: s.name,
      confidence: s.confidence,
      isPrimary: i === 0,
      isSecondary: i === 1,
      evidence: s.evidence,
    });
  }

  // 2. Cosplay Tags
  const cosplayTags: CategorizedStyleTags["cosplayTags"] = [];
  if (cosplayResult.characterName) {
    cosplayTags.push({
      character: cosplayResult.characterName,
      status: cosplayResult.identificationStatus,
      confidence: cosplayResult.confidence,
      evidence: cosplayResult.supportingEvidence,
    });
  }

  // 3. Fandom Tags
  const fandomTags: CategorizedStyleTags["fandomTags"] = [];
  if (cosplayResult.franchiseName) {
    fandomTags.push({
      franchise: cosplayResult.franchiseName,
      franchiseType: cosplayResult.franchiseType ?? undefined,
      evidence: cosplayResult.searchSources.map((s) => s.title),
    });
  }

  // 4. Category Tags: Meme, Animal, Celebrity, Footballer, Cartoon
  const categoryTags: CategorizedStyleTags["categoryTags"] = [];

  // Cartoon
  if (
    cosplayResult.franchiseType === "cartoon" ||
    assets.some((a) => /cartoon|disney|pixar|shrek|spongebob|minion|buzz|woody|adventure time/i.test(a.name))
  ) {
    categoryTags.push({
      name: "Cartoon",
      evidence: [
        cosplayResult.characterName
          ? `Mô phỏng nhân vật hoạt hình: ${cosplayResult.characterName}`
          : "Trang bị phụ kiện hoạt hình 2D/3D",
      ],
    });
  }

  // Animal
  if (
    cosplayResult.franchiseType === "animal" ||
    assets.some((a) => /dog|shiba|corgi|cat|kitty|horse|shark|fish|dino|t-rex|capybara|animal/i.test(a.name))
  ) {
    categoryTags.push({
      name: "Animal",
      evidence: [
        cosplayResult.characterName
          ? `Cosplay động vật / linh vật: ${cosplayResult.characterName}`
          : "Trang bị phụ kiện hoặc cosplay động vật 3D",
      ],
    });
  }

  // Celebrity
  if (
    cosplayResult.franchiseType === "celebrity" ||
    assets.some((a) => /ishowspeed|speed|kai cenat|streamer|celebrity|singer|walter white/i.test(a.name))
  ) {
    categoryTags.push({
      name: "Celebrity",
      evidence: [
        cosplayResult.characterName
          ? `Mô phỏng người nổi tiếng / Streamer: ${cosplayResult.characterName}`
          : "Phụ kiện gợi ý người nổi tiếng",
      ],
    });
  }

  // Footballer
  if (
    cosplayResult.franchiseType === "footballer" ||
    assets.some((a) => /ronaldo|cr7|messi|neymar|mbappe|jersey|football/i.test(a.name))
  ) {
    categoryTags.push({
      name: "Footballer",
      evidence: [
        cosplayResult.characterName
          ? `Mô phỏng cầu thủ bóng đá: ${cosplayResult.characterName}`
          : "Trang phục áo đấu cầu thủ bóng đá",
      ],
    });
  }

  // Meme
  if (
    cosplayResult.franchiseType === "meme" ||
    fandomRes.isMemeOrParody ||
    assets.some((a) => /noob|bacon|doge|pepe|skibidi|gigachad|tung tung|meme|troll/i.test(a.name))
  ) {
    categoryTags.push({
      name: "Meme",
      evidence: [
        cosplayResult.characterName
          ? `Mô phỏng meme / viral trend: ${cosplayResult.characterName}`
          : "Trang bị vật phẩm mang tính văn hóa meme",
      ],
    });
  }

  return {
    aestheticTags,
    cosplayTags,
    fandomTags,
    categoryTags,
  };
}

/**
 * Nhận diện Cosplay nhân vật chuẩn Schema 14 trường
 */
export function buildCosplayRecognition(
  assets: AvatarAsset[],
  scales: AvatarScales | null = null,
  bodyColors: AvatarBodyColors | null = null,
): CosplayRecognitionResult {
  const result = analyzeFandomAndCosplay(assets, scales, bodyColors);

  return {
    ...result,
    identified: result.isCosplay,
    franchise: result.franchiseName,
    confidenceLevel:
      result.identificationStatus === "confirmed"
        ? "high"
        : result.identificationStatus === "likely"
        ? "medium"
        : "insufficient",
    supportingDetails: result.supportingEvidence,
    mismatchedDetails: result.contradictingEvidence.concat(result.unmatchedFeatures),
    aesthetic: [result.primaryAesthetic, ...result.secondaryAesthetics].filter(Boolean) as string[],
  };
}

/**
 * Tạo các đề xuất nâng cấp outfit cụ thể dựa trên trang phục thật của avatar
 */
function generateOutfitRecommendations(
  profile: RobloxProfile,
  fandomRes: FandomRecognitionResult,
  palette: PaletteStats | null,
  primaryStyle: DetectedStyleInfo | null,
): string[] {
  const recommendations: string[] = [];
  const avatar = profile.avatar;

  if (avatar.defaultShirtApplied || avatar.defaultPantsApplied) {
    recommendations.push(
      "Thay thế áo/quần mặc định của hệ thống bằng trang phục tùy chỉnh có thiết kế đồng nhất để tăng độ hoàn thiện."
    );
  }

  if (fandomRes.isCosplay && fandomRes.unmatchedFeatures.length > 0) {
    recommendations.push(
      `Nâng cấp Cosplay ${fandomRes.characterName}: ${fandomRes.unmatchedFeatures[0]}`
    );
  }

  if (palette) {
    if (palette.harmonyScore < 0.5) {
      recommendations.push(
        `Điều chỉnh gam màu: Avatar đang có ${palette.hueClusters} cụm màu xung đột; hãy chọn phụ kiện có tông màu tương đồng hoặc bổ trợ để tạo sự hài hòa.`
      );
    } else if (palette.averageSaturation > 0.85) {
      recommendations.push(
        "Cân bằng độ rực màu: Các phụ kiện có độ bão hòa rất gắt, có thể kết hợp thêm màu trung tính để tạo điểm nhấn."
      );
    }
  }

  const accessories = avatar.assets.filter((a) => assetGroup(a.assetType?.name ?? "") === "accessory");
  if (accessories.length > 10) {
    recommendations.push(
      "Giảm bớt phụ kiện dư thừa không liên quan đến concept chính để silhouette không bị rối mắt."
    );
  } else if (accessories.length <= 1 && !fandomRes.isCosplay) {
    recommendations.push(
      "Bổ sung 1-2 phụ kiện điểm nhấn (như kính, mũ hoặc túi đeo chéo) phù hợp với phong cách chính."
    );
  }

  if (primaryStyle && primaryStyle.missingEvidence.length > 0) {
    recommendations.push(
      `Củng cố phong cách ${primaryStyle.name}: ${primaryStyle.missingEvidence[0]}`
    );
  }

  if (recommendations.length === 0) {
    recommendations.push(
      "Phối đồ tổng thể đã rất hài hòa! Bạn có thể thử nghiệm thêm hiệu ứng layered clothing để tăng chiều sâu cho avatar."
    );
  }

  return recommendations;
}

// ==========================================
// TỔNG HỢP VÀ BÁO CÁO TOÀN DIỆN (SCORE REPORT)
// ==========================================
export function calculateAvatarRank(
  profile: RobloxProfile,
  catalog: CatalogSummary | null = null,
  palette: PaletteStats | null = null,
  personalTier: PersonalTierSelection = "COMMON",
): ScoreReport {
  const assets = profile.avatar.assets ?? [];
  const units = buildStyleUnits(assets);

  // 1. Nhận diện từ Catalog 270 style chính thức
  const { primaryStyle, secondaryStyles, allDetected } = detectCatalog270Styles(profile, units, palette);

  // 2. Nhận diện Fandom & Cosplay qua phân tích đa giả thuyết
  const fandomRes = analyzeFandomAndCosplay(
    assets,
    profile.avatar.scales,
    profile.avatar.bodyColors,
    primaryStyle?.id,
  );

  const cosplayResult: CosplayRecognitionResult = {
    ...fandomRes,
    identified: fandomRes.isCosplay,
    franchise: fandomRes.franchiseName,
    confidenceLevel:
      fandomRes.identificationStatus === "confirmed"
        ? "high"
        : fandomRes.identificationStatus === "likely"
        ? "medium"
        : "insufficient",
    supportingDetails: fandomRes.supportingEvidence,
    mismatchedDetails: fandomRes.contradictingEvidence.concat(fandomRes.unmatchedFeatures),
    aesthetic: [fandomRes.primaryAesthetic, ...fandomRes.secondaryAesthetics].filter(Boolean) as string[],
  };

  const cosplays = detectCosplayInAssets(assets);

  // Đếm số phụ kiện thực tế (chỉ tính nhóm accessory, không tính shirt, pants, limbs)
  const accessoryCount = assets.filter((a) => assetGroup(a.assetType?.name ?? "") === "accessory").length;
  const completeness = outfitCompleteness(
    assets,
    profile.avatar.defaultShirtApplied,
    profile.avatar.defaultPantsApplied
  );

  // 1b. Tương thích ngược với detectedStyles cũ
  const detectedStyles: StyleMatch[] = [];
  const keywordStyles = Object.keys(STYLE_KEYWORDS) as (keyof typeof STYLE_KEYWORDS)[];

  for (const styleKey of keywordStyles) {
    const keywords = STYLE_KEYWORDS[styleKey];
    const matchingEvidence: string[] = [];
    const matchedUnits = new Set<string>();

    for (const u of units) {
      const matches = matchKeywords(u.name, keywords);
      if (matches.length > 0) {
        matchedUnits.add(u.name);
        matchingEvidence.push(`"${u.name}" khớp từ khóa: ${matches.join(", ")}`);
      }
    }

    if (matchedUnits.size > 0) {
      detectedStyles.push({
        style: styleKey,
        label: STYLE_LABELS[styleKey],
        itemCount: matchedUnits.size,
        evidence: matchingEvidence,
        source: "keywords",
      });
    }
  }

  if (cosplayResult.isCosplay && cosplayResult.characterName) {
    detectedStyles.unshift({
      style: "cosplay",
      label: `Cosplay (${cosplayResult.characterName} - ${cosplayResult.franchiseName})`,
      itemCount: Math.max(1, cosplayResult.matchingItems.length),
      evidence: cosplayResult.supportingEvidence,
      source: "keywords",
    });
  } else if (cosplays.length > 0) {
    detectedStyles.unshift({
      style: "cosplay",
      label: `Cosplay (${cosplays[0].character} - ${cosplays[0].franchise})`,
      itemCount: cosplays.length,
      evidence: cosplays.map((c) => `Cosplay ${c.character} (${c.franchise}) qua "${c.assetName}"`),
      source: "keywords",
    });
  }

  // Áp dụng chuẩn xác quy tắc ngưỡng Minimalism và Maximalism theo Mục 3:
  // - Maximalism: CHỈ khi accessoryCount >= 21
  // - Minimalism: CHỈ khi accessoryCount <= 5 VÀ outfit hoàn chỉnh có chủ đích
  // - Nếu 6-20 phụ kiện: KHÔNG tự động gán!
  if (accessoryCount <= 5) {
    const isCompletedOutfit =
      completeness.hasTop &&
      completeness.hasBottom &&
      !profile.avatar.defaultShirtApplied &&
      !profile.avatar.defaultPantsApplied;

    if (isCompletedOutfit) {
      detectedStyles.push({
        style: "minimalism",
        label: STYLE_LABELS.minimalism,
        itemCount: accessoryCount,
        evidence: [
          `Avatar có ${accessoryCount} phụ kiện (ngưỡng <= 5) với trang phục hoàn chỉnh, thể hiện phong cách tối giản có chủ đích`,
        ],
        source: "structure",
      });
    }
  } else if (accessoryCount >= 21) {
    detectedStyles.push({
      style: "maximalism",
      label: STYLE_LABELS.maximalism,
      itemCount: accessoryCount,
      evidence: [
        `Avatar trang bị ${accessoryCount} phụ kiện (đạt ngưỡng nghiêm ngặt >= 21 phụ kiện) với thiết kế dày đặc, nhiều tầng lớp phong phú`,
      ],
      source: "structure",
    });
  }

  detectedStyles.sort((a, b) => b.itemCount - a.itemCount);
  const dominantStyle = detectedStyles.length > 0 ? detectedStyles[0] : null;

  // Xây dựng CategorizedStyleTags hiển thị tất cả các phong cách của avatar
  const categorizedTags = buildCategorizedStyleTags(
    allDetected,
    cosplayResult,
    fandomRes,
    assets,
    accessoryCount,
    {
      hasTop: completeness.hasTop,
      hasBottom: completeness.hasBottom,
      defaultShirtApplied: profile.avatar.defaultShirtApplied,
      defaultPantsApplied: profile.avatar.defaultPantsApplied,
    }
  );

  // 3. Chấm điểm 4 tiêu chí AI thành phần với Trọng số mới chuẩn xác:
  // - Theme & Cohesion: 35% (0.35)
  // - Originality & Creativity: 30% (0.30)
  // - Humor & Meme: 25% (0.25)
  // - Verified Robux Value: 10% (0.10)
  const themeRes = evaluateTheme(profile, units, palette, detectedStyles, fandomRes, cosplays);
  const uniquenessRes = evaluateUniqueness(profile, units, catalog, detectedStyles, fandomRes);
  const humorRes = evaluateHumor(profile, units, fandomRes);
  const { criterion: valueRes, breakdown: valueBreakdown } = evaluateValue(assets, catalog);

  themeRes.weight = 0.35;
  uniquenessRes.weight = 0.30;
  humorRes.weight = 0.25;
  valueRes.weight = 0.10;

  const scoreTheme = themeRes.score ?? 0;
  const scoreUniqueness = uniquenessRes.score ?? 0;
  const scoreHumor = humorRes.score ?? 0;
  const scoreValue = valueRes.score ?? 0;

  // AI Score = Theme × 0.35 + Originality × 0.30 + Humor × 0.25 + VerifiedValue × 0.10
  const aiScoreNumber = scoreTheme * 0.35 + scoreUniqueness * 0.30 + scoreHumor * 0.25 + scoreValue * 0.10;
  const aiScore = Math.round(aiScoreNumber * 100) / 100;

  // Tiêu chí 5: Chấm theo gu của bạn.
  // null = "Chưa chọn": không có điểm gu, trọng số 0, điểm tổng tính 100% từ hệ thống.
  const personalScore = personalTier === null ? null : RARITIES[personalTier]?.personalScore ?? 0;
  const personalWeight = personalScore === null ? 0 : 0.25;
  const personalRes: CriterionResult = {
    key: "personal",
    label: "Personal Taste (Your Judge)",
    labelVi: "Chấm theo gu của bạn",
    score: personalScore,
    weight: personalWeight,
    confidence: "high",
    summary:
      personalScore === null
        ? "Bạn chưa chọn mức đánh giá. Điểm tổng tính 100% từ hệ thống."
        : `Bạn đã trực tiếp đánh giá avatar này ở mức ${personalTier} (${personalScore} điểm).`,
    evidence:
      personalScore === null
        ? ["Chưa chọn gu cá nhân — điểm tổng hiện tính 100% từ hệ thống."]
        : [`Thanh trượt Gu của bạn: Bậc ${personalTier} đóng góp 25% vào kết quả cuối cùng`],
  };

  const criteriaMap: Record<CriterionKey, CriterionResult> = {
    theme: themeRes,
    uniqueness: uniquenessRes,
    humor: humorRes,
    value: valueRes,
    personal: personalRes,
  };

  // 4. Công thức tính điểm tổng:
  // - Chưa chọn gu: Final Score = AI Score (100% hệ thống)
  // - Đã chọn gu:  Final Score = AI Score × 0.75 + Personal Score × 0.25
  const aiWeight = personalScore === null ? 1 : 0.75;
  const rawTotal = personalScore === null ? aiScoreNumber : aiScoreNumber * 0.75 + personalScore * 0.25;
  const total = Math.round(rawTotal * 100) / 100;

  // 5. Kiểm tra chất lượng dữ liệu
  const qualityIssues: string[] = [];
  if (!palette) {
    qualityIssues.push("Thiếu dữ liệu phân tích bảng màu pixel từ ảnh (dùng quy tắc phân tích cấu trúc thay thế).");
  }
  if (!valueBreakdown.available) {
    qualityIssues.push("Không truy xuất được catalog Roblox để định giá, điểm tiêu chí Giá trị Robux được ghi nhận 0 điểm.");
  } else if (valueBreakdown.coverage < 0.6) {
    qualityIssues.push(
      `Độ phủ giá catalog chỉ đạt ${Math.round(valueBreakdown.coverage * 100)}% số lượng vật phẩm trang phục.`
    );
  }

  let qualityLevel: DataQuality["level"] = "complete";
  if (!valueBreakdown.available || valueBreakdown.coverage < 0.4) {
    qualityLevel = "insufficient";
  } else if (qualityIssues.length > 0) {
    qualityLevel = "partial";
  }

  // 6. Xác định Rarity theo ngưỡng 0/15/35/60/80/92 dùng điểm thực rawTotal
  const uncappedTier = getRarityForScore(rawTotal);
  const { tier: finalTier, capApplied } = applyDataQualityCap(uncappedTier, qualityLevel);
  const finalRarity = RARITIES[finalTier];

  const dataQuality: DataQuality = {
    level: qualityLevel,
    issues: qualityIssues,
    capApplied,
  };

  // 7. Điểm mạnh và Điểm yếu
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (cosplayResult.isCosplay && cosplayResult.characterName) {
    strengths.push(
      `Nhận diện trang phục Cosplay ấn tượng: ${cosplayResult.characterName} (${cosplayResult.franchiseName}) — Trạng thái: ${cosplayResult.identificationStatus.toUpperCase()}.`
    );
  }

  const sortedCriteria = [themeRes, uniquenessRes, humorRes, valueRes]
    .filter((c) => c.score !== null)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  if (sortedCriteria.length > 0 && (sortedCriteria[0].score ?? 0) >= 65) {
    strengths.push(`Điểm nổi trội nhất ở "${sortedCriteria[0].labelVi}" (${sortedCriteria[0].score}/100): ${sortedCriteria[0].summary}`);
  }
  if (primaryStyle) {
    strengths.push(`Phong cách thẩm mỹ rõ ràng thuộc trường phái ${primaryStyle.name} (Độ tin cậy: ${primaryStyle.confidence.toUpperCase()}).`);
  } else if (dominantStyle) {
    strengths.push(`Phong cách thẩm mỹ rõ ràng thuộc trường phái ${dominantStyle.label}.`);
  }

  const lowest = sortedCriteria[sortedCriteria.length - 1];
  if (lowest && (lowest.score ?? 0) < 55) {
    weaknesses.push(`Cần cải thiện tiêu chí "${lowest.labelVi}" (${lowest.score ?? 0}/100): ${lowest.summary}`);
  }

  // 8. Đề xuất nâng cấp outfit cụ thể
  const outfitRecommendations = generateOutfitRecommendations(profile, fandomRes, palette, primaryStyle);

  // 9. Lời khuyên nâng cấp lên bậc kế tiếp và MYTHICAL
  let nextTierAdvice: TierAdvice | null = null;
  const currentIdx = TIER_ORDER.indexOf(finalTier);
  if (currentIdx < TIER_ORDER.length - 1) {
    const target = TIER_ORDER[currentIdx + 1];
    const targetMin = RARITIES[target].minScore;
    const pointsNeeded = Math.max(1, Math.ceil(targetMin - rawTotal));

    const steps: string[] = [];
    if (scoreTheme < 70) {
      steps.push("Hài hòa màu sắc hoặc cosplay: Chọn các phụ kiện có cùng chủ đề hoặc mô phỏng nhân vật rõ nét hơn.");
    }
    if (scoreUniqueness < 70) {
      steps.push("Tạo bản sắc độc lạ: Thử nghiệm phối nhiều lớp (layered clothing) hoặc chọn phụ kiện độc bản ít người dùng.");
    }
    if (scoreHumor < 60 && (dominantStyle?.style === "meme" || primaryStyle?.id === "meme")) {
      steps.push("Nhấn mạnh yếu tố meme: Đưa vào các phụ kiện hoặc biểu cảm châm biếm kinh điển.");
    }
    if (scoreValue < 60) {
      steps.push("Đầu tư phụ kiện catalog: Bổ sung thêm các vật phẩm đang bán chính thức có giá trị thẩm mỹ cao.");
    }
    if (personalScore !== null && personalScore < 80) {
      steps.push(`Nâng đánh giá gu cá nhân: Bạn đang chấm mức ${personalTier} (${personalScore}đ). Nếu cảm thấy avatar xứng đáng hơn, hãy nâng thanh trượt.`);
    }
    if (steps.length === 0) {
      steps.push("Tối ưu hóa các chi tiết nhỏ để tích lũy thêm điểm tổng trên các tiêu chí.");
    }

    nextTierAdvice = {
      target,
      pointsNeeded,
      steps,
    };
  }

  const mythicalAdvice: string[] =
    personalScore === null
      ? [
          "Đạt điểm xuất sắc đồng đều (trung bình >= 92 điểm) trên hệ thống AI.",
          "Cần một định hướng thẩm mỹ đỉnh cao: phối màu hoàn hảo hoặc cosplay xuất chúng, silhouette nhận diện tức thì.",
          "Bắt buộc dữ liệu từ Roblox API và Catalog phải xác minh đầy đủ 100% để vượt qua cơ chế giới hạn chất lượng.",
        ]
      : [
          "Đạt điểm xuất sắc đồng đều (trung bình >= 92 điểm) trên cả hệ thống AI (75%) và Gu cá nhân của bạn (25%).",
          "Cần một định hướng thẩm mỹ đỉnh cao: phối màu hoàn hảo hoặc cosplay xuất chúng, silhouette nhận diện tức thì.",
          "Bắt buộc dữ liệu từ Roblox API và Catalog phải xác minh đầy đủ 100% để vượt qua cơ chế giới hạn chất lượng.",
        ];

  const limitations: string[] = [
    personalScore === null
      ? "Hệ thống phân tích dựa trên metadata phụ kiện, tên item, bảng màu pixel avatar thực tế; bạn chưa chọn gu cá nhân nên điểm tổng tính 100% từ hệ thống."
      : "Hệ thống phân tích dựa trên metadata phụ kiện, tên item, bảng màu pixel avatar thực tế kết hợp 25% đánh giá Gu cá nhân của bạn.",
    "Tiêu chí Giá trị chỉ chiếm 10% điểm AI và chỉ ghi nhận các vật phẩm đang mở bán trên catalog Roblox có giá niêm yết chính thức; vật phẩm Limited và Off-sale không được quy đổi sang giá trị Robux.",
  ];

  const report: ScoreReport = {
    criteria: criteriaMap,
    aiScore,
    aiWeight,
    personalScore,
    personalTier,
    personalWeight,
    total,
    rawTotal,
    uncappedTier,
    rarity: finalRarity,
    dataQuality,
    value: valueBreakdown,
    styles: detectedStyles,
    dominantStyle,
    primaryStyle,
    secondaryStyles,
    categorizedTags,
    cosplayResult,
    cosplayDetections: cosplays,
    strengths,
    weaknesses,
    outfitRecommendations,
    nextTier: nextTierAdvice,
    mythicalAdvice,
    limitations,
    analysisMethod: "rule-based",
  };

  return isSecretAccount(profile.id) ? applySecretAccountBoost(report) : report;
}
