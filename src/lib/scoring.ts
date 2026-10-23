import type {
  AvatarAsset,
  CatalogSummary,
  Confidence,
  CosplayMatchInfo,
  CosplayRecognitionResult,
  CriterionKey,
  CriterionResult,
  DataQuality,
  DetectedStyleInfo,
  PaletteStats,
  RarityTier,
  RobloxProfile,
  ScoreReport,
  StyleKey,
  StyleMatch,
  TierAdvice,
  ValueBreakdown,
} from "@/types";
import { applyDataQualityCap, getRarityForScore, RARITIES, TIER_ORDER } from "./rarity";
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

const clamp = (v: number, min = 0, max = 100) => Math.min(max, Math.max(min, Math.round(v)));

// ==========================================
// A. CHỦ ĐỀ VÀ SỰ HÀI HÒA (THEME & COHESION)
// ==========================================
function evaluateTheme(
  profile: RobloxProfile,
  units: StyleUnit[],
  palette: PaletteStats | null,
  styles: StyleMatch[],
  cosplays: CosplayDetection[] = [],
): CriterionResult {
  const assets = profile.avatar.assets;
  const evidence: string[] = [];
  let score = 50; // Điểm khởi đầu trung tính

  // 1. Phân tích màu sắc thực tế (nếu có palette từ ảnh)
  if (palette) {
    const harmonyBonus = Math.round(palette.harmonyScore * 30);
    score += harmonyBonus - 15; // dao động [-15, +15]
    evidence.push(
      `Bảng màu ảnh: phối kiểu ${palette.harmony} (độ hài hòa ${Math.round(palette.harmonyScore * 100)}%, ${palette.hueClusters} cụm màu chính)`,
    );
  } else {
    evidence.push("Không trích xuất được bảng màu pixel từ ảnh (sử dụng phân tích cấu trúc trang phục)");
  }

  // 2. Nhận diện Cosplay nhân vật Anime, Phim ảnh, Superheroes hoặc Thể loại Fantasy
  if (cosplays.length > 0) {
    const bonus = Math.min(45, cosplays.length * 25);
    score += bonus;
    for (const c of cosplays) {
      evidence.push(
        `⭐ Phát hiện Cosplay nhân vật "${c.character}" (${c.franchise}) từ phụ kiện "${c.assetName}" (từ khóa: "${c.matchedKeyword}") — Tăng mạnh điểm Chủ đề!`,
      );
    }
  }

  // 3. Tính đầy đủ của trang phục
  const completeness = outfitCompleteness(
    assets,
    profile.avatar.defaultShirtApplied,
    profile.avatar.defaultPantsApplied,
  );
  if (completeness.hasTop && completeness.hasBottom) {
    score += 15;
    evidence.push("Trang phục hoàn chỉnh: có đầy đủ áo và quần do người chơi chủ động phối");
  } else if (!completeness.hasTop && !completeness.hasBottom) {
    score -= 15;
    evidence.push("Thiếu cả áo và quần tùy chỉnh (sử dụng trang phục mặc định của hệ thống)");
  } else {
    evidence.push("Trang phục bán phần (chỉ có áo hoặc quần tùy chỉnh)");
  }

  // 4. Sự tập trung vào phong cách chủ đạo
  const nonMemeStyles = styles.filter((s) => s.style !== "meme" && s.style !== "minimalism" && s.style !== "maximalism");
  if (nonMemeStyles.length === 1) {
    const top = nonMemeStyles[0];
    score += Math.min(25, top.itemCount * 8);
    evidence.push(`Định hướng thẩm mỹ rõ nét theo phong cách ${top.label} (${top.itemCount} món đồ củng cố cùng chủ đề)`);
  } else if (nonMemeStyles.length > 1) {
    const primary = nonMemeStyles[0];
    const secondary = nonMemeStyles[1];
    if (primary.itemCount >= secondary.itemCount * 2) {
      score += 12;
      evidence.push(`Phong cách chủ đạo ${primary.label} chiếm ưu thế, kết hợp phụ phong cách ${secondary.label}`);
    } else {
      score -= 8;
      evidence.push(`Trộn lẫn nhiều phong cách khác nhau (${nonMemeStyles.map((s) => s.label).join(", ")}) có thể gây xung đột thị giác`);
    }
  }

  // 5. Kiểm tra sự quá tải phụ kiện không liên kết
  const accessoryCount = units.filter((u) => u.group === "accessory").length;
  if (accessoryCount > 7 && nonMemeStyles.length === 0 && cosplays.length === 0) {
    score -= 12;
    evidence.push(`Đeo nhiều phụ kiện rời rạc (${accessoryCount} món) nhưng không hội tụ về một ý tưởng phong cách cụ thể`);
  }

  const finalScore = clamp(score);
  return {
    key: "theme",
    label: "Theme & Cohesion",
    labelVi: "Chủ đề & Hài hòa (gồm Cosplay)",
    score: finalScore,
    weight: 0.1875,
    confidence: cosplays.length > 0 || palette ? "high" : "medium",
    summary:
      cosplays.length > 0
        ? `Định hướng Cosplay cực kỳ rõ ràng theo hình tượng ${cosplays.map((c) => c.character).join(", ")}.`
        : finalScore >= 75
        ? "Tổng thể trang phục có định hướng thẩm mỹ rất rõ ràng, màu sắc và phụ kiện ăn khớp."
        : finalScore >= 45
        ? "Trang phục có ý tưởng tương đối nhưng các chi tiết hoặc màu sắc chưa thực sự đồng nhất."
        : "Các chi tiết trang phục rời rạc, thiếu sự liên kết chủ đề hoặc phối màu xung đột.",
    evidence,
  };
}

// ==========================================
// B. ĐỘC LẠ VÀ SÁNG TẠO (UNIQUENESS & CREATIVITY)
// ==========================================
function evaluateUniqueness(
  profile: RobloxProfile,
  units: StyleUnit[],
  catalog: CatalogSummary | null,
  styles: StyleMatch[],
): CriterionResult {
  const assets = profile.avatar.assets;
  const evidence: string[] = [];
  let score = 40; // Điểm khởi đầu

  // 1. Nhận diện trường phái Minimalism vs Maximalism
  const stylingUnits = units.filter((u) => u.group === "accessory" || u.group === "layered" || u.group === "classic");
  const stylingCount = stylingUnits.length;

  if (stylingCount <= 2 && stylingCount > 0) {
    // Minimalism
    score += 20;
    evidence.push(`Phong cách Minimalism (${stylingCount} món đồ): tối giản có chủ đích, tạo điểm nhấn gọn gàng`);
  } else if (stylingCount >= 6) {
    // Maximalism: nhiều lớp
    const layeredCount = units.filter((u) => u.group === "layered").length;
    score += Math.min(25, 12 + layeredCount * 5);
    evidence.push(`Phong cách Maximalism: phối nhiều lớp phức tạp (${stylingCount} món, trong đó có ${layeredCount} món layered)`);
  } else {
    evidence.push(`Số lượng phụ kiện ở mức trung bình (${stylingCount} món)`);
  }

  // 2. Định dạng body và tỷ lệ cơ thể (Body Scale & Rig)
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

  // 3. Vật phẩm Off-sale / Not For Sale / Limited đóng góp vào độ hiếm và bản sắc
  if (catalog) {
    const offsaleItems = catalog.items.filter((it) => it.status === "offsale" || it.status === "limited");
    if (offsaleItems.length > 0) {
      const bonus = Math.min(25, offsaleItems.length * 6);
      score += bonus;
      evidence.push(`Sở hữu ${offsaleItems.length} vật phẩm Off-sale hoặc Limited tạo nét độc lạ riêng (không còn phổ biến trong catalog)`);
    }
  }

  // 4. Nhận diện các phong cách ngách ít phổ biến
  const nicheStyles = styles.filter((s) => s.style === "techwear" || s.style === "cyberpunk" || s.style === "goth" || s.style === "oldmoney");
  if (nicheStyles.length > 0) {
    score += 10;
    evidence.push(`Thuộc trường phái thẩm mỹ ngách cá tính (${nicheStyles.map((s) => s.label).join(", ")})`);
  }

  const finalScore = clamp(score);
  return {
    key: "uniqueness",
    label: "Uniqueness & Creativity",
    labelVi: "Độc lạ & Sáng tạo",
    score: finalScore,
    weight: 0.25,
    confidence: "high",
    summary:
      finalScore >= 75
        ? "Avatar có cá tính mạnh mẽ, cấu trúc hoặc phong cách khác biệt hoàn toàn so với số đông."
        : finalScore >= 45
        ? "Có một vài chi tiết hoặc phụ kiện tạo dấu ấn, nhưng cấu trúc tổng thể vẫn mang dáng dấp phổ biến."
        : "Avatar theo khuôn mẫu đại trà, phụ kiện và kiểu dáng rất dễ bắt gặp trong các server.",
    evidence,
  };
}

// ==========================================
// C. HÀI HƯỚC VÀ VĂN HÓA MEME (HUMOR & MEME CULTURE)
// ==========================================
function evaluateHumor(profile: RobloxProfile, units: StyleUnit[]): CriterionResult {
  const assets = profile.avatar.assets;
  const evidence: string[] = [];
  let score = 20; // Khởi điểm cho avatar nghiêm túc/thông thường
  let memeSignalCount = 0;

  // 1. Kiểm tra màu da Noob kinh điển
  if (isClassicNoobPalette(profile.avatar.bodyColors)) {
    score += 45;
    memeSignalCount++;
    evidence.push("Phối màu da Noob kinh điển (đầu/tay vàng, thân xanh dương, chân xanh lá) — biểu tượng meme cốt lõi của Roblox");
  }

  // 2. Kiểm tra meme Roblox cụ thể
  for (const asset of assets) {
    const nameLower = asset.name.toLowerCase();
    for (const km of KNOWN_ROBLOX_MEMES) {
      if (nameLower.includes(km.match)) {
        score += 35;
        memeSignalCount++;
        evidence.push(`Trang bị vật phẩm meme đặc trưng: ${km.label} ("${asset.name}")`);
      }
    }
  }

  // 3. Từ khóa meme trong tên vật phẩm
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
    memeSignalCount += matchedMemeKeywords.size;
  }

  // 4. Nhận diện gợi ý người nổi tiếng / nhân vật giải trí
  const matchedCelebrities = new Set<string>();
  for (const asset of assets) {
    const matches = matchKeywords(asset.name, CELEBRITY_KEYWORDS);
    for (const c of matches) {
      matchedCelebrities.add(c);
      evidence.push(`Tên vật phẩm "${asset.name}" gợi ý nhân vật/người nổi tiếng: "${c}" (lưu ý: chỉ là gợi ý từ khóa, không xác minh danh tính)`);
    }
  }

  if (matchedCelebrities.size > 0) {
    score += Math.min(30, matchedCelebrities.size * 15);
    memeSignalCount += matchedCelebrities.size;
  }

  // 5. Emote số lượng lớn (thể hiện tính tấu hài trong game)
  if (profile.avatar.emotes && profile.avatar.emotes.length >= 5) {
    score += 10;
    evidence.push(`Trang bị nhiều emote tương tác (${profile.avatar.emotes.length} emote), hỗ trợ biểu cảm gây cười trong game`);
  }

  // Nếu không tìm thấy dấu hiệu meme nào, giữ mức điểm thể hiện avatar phong cách nghiêm túc
  if (memeSignalCount === 0) {
    evidence.push("Không phát hiện vật phẩm hoặc yếu tố mang tính meme/châm biếm — avatar thuộc phong cách nghiêm túc");
    score = Math.min(score, 30);
  }

  const finalScore = clamp(score);
  return {
    key: "humor",
    label: "Humor & Meme Culture",
    labelVi: "Hài hước & Văn hóa meme",
    score: finalScore,
    weight: 0.25,
    confidence: memeSignalCount > 0 ? "high" : "medium",
    summary:
      finalScore >= 75
        ? "Ý tưởng meme cực kỳ rõ nét, có chủ đích tấu hài hoặc châm biếm sáng tạo."
        : finalScore >= 45
        ? "Có một vài yếu tố vui nhộn hoặc biểu cảm ngộ nghĩnh, nhưng chưa hoàn toàn định hình phong cách meme."
        : "Avatar được thiết kế theo phong cách nghiêm túc, không nhằm mục đích gây cười.",
    evidence,
  };
}

// ==========================================
// D. GIÁ TRỊ ROBUX (ITEM VALUE & EXPENSE)
// ==========================================
function evaluateValue(
  assets: AvatarAsset[],
  catalog: CatalogSummary | null,
): { criterion: CriterionResult; breakdown: ValueBreakdown } {
  // Lọc lấy danh sách ID vật phẩm trang phục thực tế (bỏ trùng)
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
        label: "Item Value & Expense",
        labelVi: "Giá trị Robux",
        score: null, // Không có dữ liệu catalog → null, không tự đoán
        weight: 0.25,
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
      // Áp trần tối đa 2000 R$ cho 1 vật phẩm đơn lẻ để 1 món cực đắt không tự kéo cả avatar lên
      const cappedItemPrice = Math.min(2000, item.price);
      scoredRobux += cappedItemPrice;
      pricedList.push({ id: asset.id, name: asset.name, price: item.price });
    }
  }

  // Công thức chuẩn hóa điểm số bằng hàm logarit mượt mà
  // 100 R$ ~ 30đ, 500 R$ ~ 55đ, 1500 R$ ~ 75đ, 4000 R$ ~ 90đ, >= 7500 R$ ~ 100đ
  let score = 0;
  if (scoredRobux > 0) {
    score = Math.min(100, Math.round(Math.log10(scoredRobux / 15 + 1) * 36));
  } else if (freeCount > 0 && pricedCount === 0) {
    score = 15; // Toàn đồ miễn phí
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
      label: "Item Value & Expense",
      labelVi: "Giá trị Robux",
      score: finalScore,
      weight: 0.25,
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

  for (const styleDef of AVATAR_STYLES_CATALOG) {
    const evidence: string[] = [];
    const missingEvidence: string[] = [];
    let matchedCount = 0;

    // 1. Quét từ khóa qua các item trang phục (dùng ranh giới từ matchKeywords)
    for (const u of units) {
      const matchedKw = matchKeywords(u.name, styleDef.keywords);
      if (matchedKw.length > 0) {
        matchedCount++;
        evidence.push(`Vật phẩm "${u.name}" khớp từ khóa: ${matchedKw.join(", ")}`);
      }
    }

    // 2. Đặc điểm cấu trúc avatar
    if (styleDef.id === "r6core" && avatarType === "R6") {
      matchedCount += 2;
      evidence.push("Sử dụng bộ khung cơ thể cổ điển R6 (6 bộ phận)");
    }
    if (styleDef.id === "classic-noob" && isClassicNoobPalette(bodyColors)) {
      matchedCount += 3;
      evidence.push("Phối màu da Noob chuẩn xác: Đầu vàng, Thân xanh dương, Chân xanh lá");
    }
    if (styleDef.id === "bacon-hair") {
      const hasPalHair = assets.some((a) => a.name.toLowerCase().includes("pal hair") || a.name.toLowerCase().includes("bacon"));
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
 * Nhận diện Cosplay nhân vật chuẩn Schema Phần VIII Master Prompt
 */
export function buildCosplayRecognition(assets: AvatarAsset[]): CosplayRecognitionResult {
  const detections = detectCosplayInAssets(assets);

  if (detections.length === 0) {
    return {
      identified: false,
      characterName: null,
      franchise: null,
      confidence: 0,
      confidenceLevel: "insufficient",
      supportingDetails: [],
      mismatchedDetails: ["Không tìm thấy phụ kiện đặc trưng của nhân vật cụ thể nào trong catalog."],
      aesthetic: [],
      explanation: "Chưa đủ bằng chứng để xác định đây là trang phục Cosplay của một nhân vật cụ thể.",
    };
  }

  const primary = detections[0];
  const matchingAssetCount = assets.filter((a) =>
    detections.some((d) => matchKeywords(a.name, [d.matchedKeyword]).length > 0)
  ).length;
  const isHigh = matchingAssetCount >= 2 || detections.length >= 2;
  const confidence = isHigh ? 0.9 : 0.75;
  const confidenceLevel = isHigh ? "high" : "medium";

  const supportingDetails = detections.map(
    (d) => `Phụ kiện "${d.assetName}" mang đặc trưng của ${d.character} (${d.matchedKeyword})`,
  );

  return {
    identified: true,
    characterName: primary.character,
    franchise: primary.franchise,
    confidence,
    confidenceLevel,
    supportingDetails,
    mismatchedDetails:
      detections.length === 1
        ? ["Cần bổ sung thêm áo/quần đồng bộ của nhân vật để cosplay hoàn chỉnh hơn."]
        : [],
    aesthetic: ["Anime", "Cosplay", primary.franchise],
    explanation: `Avatar tái hiện rõ nét hình tượng nhân vật ${primary.character} trong tác phẩm "${primary.franchise}" qua các phụ kiện đặc trưng.`,
  };
}

// ==========================================
// TỔNG HỢP VÀ BÁO CÁO TOÀN DIỆN (SCORE REPORT)
// ==========================================
export function calculateAvatarRank(
  profile: RobloxProfile,
  catalog: CatalogSummary | null = null,
  palette: PaletteStats | null = null,
  personalTier: RarityTier = "COMMON",
): ScoreReport {
  const assets = profile.avatar.assets ?? [];
  const units = buildStyleUnits(assets);

  // 1. Nhận diện từ Catalog 270 style chính thức
  const { primaryStyle, secondaryStyles } = detectCatalog270Styles(profile, units, palette);

  // Nhận diện Cosplay theo schema chính thức
  const cosplayResult = buildCosplayRecognition(assets);
  const cosplays = detectCosplayInAssets(assets);

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

  if (cosplays.length > 0) {
    detectedStyles.unshift({
      style: "cosplay",
      label: `Cosplay (${cosplays[0].character} - ${cosplays[0].franchise})`,
      itemCount: cosplays.length,
      evidence: cosplays.map((c) => `Cosplay ${c.character} (${c.franchise}) qua "${c.assetName}"`),
      source: "keywords",
    });
  }

  const stylingCount = units.filter(
    (u) => u.group === "accessory" || u.group === "layered" || u.group === "classic",
  ).length;

  if (stylingCount <= 2 && stylingCount > 0) {
    detectedStyles.push({
      style: "minimalism",
      label: STYLE_LABELS.minimalism,
      itemCount: stylingCount,
      evidence: [`Chỉ sử dụng ${stylingCount} chi tiết trang phục tạo phong cách tối giản`],
      source: "structure",
    });
  } else if (stylingCount >= 6) {
    detectedStyles.push({
      style: "maximalism",
      label: STYLE_LABELS.maximalism,
      itemCount: stylingCount,
      evidence: [`Kết hợp ${stylingCount} chi tiết trang phục đa tầng`],
      source: "structure",
    });
  }

  detectedStyles.sort((a, b) => b.itemCount - a.itemCount);
  const dominantStyle = detectedStyles.length > 0 ? detectedStyles[0] : null;

  // 2. Chấm điểm 4 tiêu chí AI thành phần
  const themeRes = evaluateTheme(profile, units, palette, detectedStyles, cosplays);
  const uniquenessRes = evaluateUniqueness(profile, units, catalog, detectedStyles);
  const humorRes = evaluateHumor(profile, units);
  const { criterion: valueRes, breakdown: valueBreakdown } = evaluateValue(assets, catalog);

  // Đặt trọng số chuẩn xác: Mỗi tiêu chí AI là 18.75% (Tổng 4 tiêu chí = 75%)
  themeRes.weight = 0.1875;
  uniquenessRes.weight = 0.1875;
  humorRes.weight = 0.1875;
  valueRes.weight = 0.1875;

  const scoreTheme = themeRes.score ?? 0;
  const scoreUniqueness = uniquenessRes.score ?? 0;
  const scoreHumor = humorRes.score ?? 0;
  const scoreValue = valueRes.score ?? 0;

  // Điểm AI thuần túy (thang 0-100), tính chính xác số thực để không làm tròn sớm
  const aiScoreNumber = (scoreTheme + scoreUniqueness + scoreHumor + scoreValue) / 4;
  const aiScore = Math.round(aiScoreNumber * 100) / 100;

  // Tiêu chí 5: Chấm theo gu của bạn (chiếm 25% trọng số, mặc định COMMON = 0 điểm)
  const personalScore = RARITIES[personalTier]?.personalScore ?? 0;
  const personalRes: CriterionResult = {
    key: "personal",
    label: "Personal Taste (Your Judge)",
    labelVi: "Chấm theo gu của bạn",
    score: personalScore,
    weight: 0.25,
    confidence: "high",
    summary: `Bạn đã trực tiếp đánh giá avatar này ở mức ${personalTier} (${personalScore} điểm).`,
    evidence: [`Thanh trượt Gu của bạn: Bậc ${personalTier} đóng góp 25% vào kết quả cuối cùng`],
  };

  const criteriaMap: Record<CriterionKey, CriterionResult> = {
    theme: themeRes,
    uniqueness: uniquenessRes,
    humor: humorRes,
    value: valueRes,
    personal: personalRes,
  };

  // 3. Công thức tính điểm tổng:
  // Final Score = AI Score × 0.75 + Personal Score × 0.25
  const rawTotal = aiScoreNumber * 0.75 + personalScore * 0.25;
  const total = Math.round(rawTotal * 100) / 100;

  // 4. Kiểm tra chất lượng dữ liệu
  const qualityIssues: string[] = [];
  if (!palette) {
    qualityIssues.push("Thiếu dữ liệu phân tích bảng màu pixel từ ảnh (dùng quy tắc phân tích cấu trúc thay thế).");
  }
  if (!valueBreakdown.available) {
    qualityIssues.push("Không truy xuất được catalog Roblox để định giá, điểm tiêu chí Đắt tiền được ghi nhận 0 điểm.");
  } else if (valueBreakdown.coverage < 0.6) {
    qualityIssues.push(
      `Độ phủ giá catalog chỉ đạt ${Math.round(valueBreakdown.coverage * 100)}% số lượng vật phẩm trang phục.`,
    );
  }

  let qualityLevel: DataQuality["level"] = "complete";
  if (!valueBreakdown.available || valueBreakdown.coverage < 0.4) {
    qualityLevel = "insufficient";
  } else if (qualityIssues.length > 0) {
    qualityLevel = "partial";
  }

  // 5. Xác định Rarity theo ngưỡng 0/15/35/60/80/92 dùng điểm thực rawTotal
  const uncappedTier = getRarityForScore(rawTotal);
  const { tier: finalTier, capApplied } = applyDataQualityCap(uncappedTier, qualityLevel);
  const finalRarity = RARITIES[finalTier];

  const dataQuality: DataQuality = {
    level: qualityLevel,
    issues: qualityIssues,
    capApplied,
  };

  // 6. Điểm mạnh và Điểm yếu
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (cosplayResult.identified && cosplayResult.characterName) {
    strengths.push(
      `Nhận diện trang phục Cosplay ấn tượng: ${cosplayResult.characterName} (${cosplayResult.franchise}).`,
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

  // 7. Lời khuyên nâng cấp lên bậc kế tiếp và MYTHICAL
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
    if (personalScore < 80) {
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

  const mythicalAdvice: string[] = [
    "Đạt điểm xuất sắc đồng đều (trung bình >= 92 điểm) trên cả hệ thống AI (75%) và Gu cá nhân của bạn (25%).",
    "Cần một định hướng thẩm mỹ đỉnh cao: phối màu hoàn hảo hoặc cosplay xuất chúng, silhouette nhận diện tức thì.",
    "Bắt buộc dữ liệu từ Roblox API và Catalog phải xác minh đầy đủ 100% để vượt qua cơ chế giới hạn chất lượng.",
  ];

  const limitations: string[] = [
    "Hệ thống sử dụng phương pháp phân tích dựa trên quy tắc (Rule-based) từ Roblox Web API kết hợp 25% đánh giá Gu cá nhân của bạn.",
    "Tiêu chí Giá trị chỉ ghi nhận các vật phẩm đang mở bán trên catalog Roblox có giá niêm yết chính thức; vật phẩm Limited và Off-sale không được quy đổi sang giá trị Robux.",
  ];

  return {
    criteria: criteriaMap,
    aiScore,
    aiWeight: 0.75,
    personalScore,
    personalTier,
    personalWeight: 0.25,
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
    cosplayResult,
    cosplayDetections: cosplays,
    strengths,
    weaknesses,
    nextTier: nextTierAdvice,
    mythicalAdvice,
    limitations,
    analysisMethod: "rule-based",
  };
}
