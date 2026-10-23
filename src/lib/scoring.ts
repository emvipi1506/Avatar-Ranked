import type {
  AvatarAsset,
  CatalogSummary,
  Confidence,
  CriterionKey,
  CriterionResult,
  DataQuality,
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
import {
  assetGroup,
  buildStyleUnits,
  CELEBRITY_KEYWORDS,
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

  // 2. Tính đầy đủ của trang phục
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

  // 3. Sự tập trung vào phong cách chủ đạo
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

  // 4. Kiểm tra sự quá tải phụ kiện không liên kết
  const accessoryCount = units.filter((u) => u.group === "accessory").length;
  if (accessoryCount > 7 && nonMemeStyles.length === 0) {
    score -= 12;
    evidence.push(`Đeo nhiều phụ kiện rời rạc (${accessoryCount} món) nhưng không hội tụ về một ý tưởng phong cách cụ thể`);
  }

  const finalScore = clamp(score);
  return {
    key: "theme",
    label: "Theme & Cohesion",
    labelVi: "Chủ đề & Hài hòa",
    score: finalScore,
    weight: 0.25,
    confidence: palette ? "high" : "medium",
    summary:
      finalScore >= 75
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

// ==========================================
// TỔNG HỢP VÀ BÁO CÁO TOÀN DIỆN (SCORE REPORT)
// ==========================================
export function calculateAvatarRank(
  profile: RobloxProfile,
  catalog: CatalogSummary | null = null,
  palette: PaletteStats | null = null,
): ScoreReport {
  const assets = profile.avatar.assets;
  const units = buildStyleUnits(assets);

  // 1. Nhận diện các phong cách xuất hiện
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

  // Nhận diện Minimalism / Maximalism
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

  // 2. Chấm điểm 4 tiêu chí thành phần
  const themeRes = evaluateTheme(profile, units, palette, detectedStyles);
  const uniquenessRes = evaluateUniqueness(profile, units, catalog, detectedStyles);
  const humorRes = evaluateHumor(profile, units);
  const { criterion: valueRes, breakdown: valueBreakdown } = evaluateValue(assets, catalog);

  const criteriaMap: Record<CriterionKey, CriterionResult> = {
    theme: themeRes,
    uniqueness: uniquenessRes,
    humor: humorRes,
    value: valueRes,
  };

  // 3. Công thức tính điểm tổng:
  // Điểm tổng = Chủ đề × 25% + Độc lạ × 25% + Hài hước × 25% + Đắt tiền × 25%
  // Lưu ý: nếu tiêu chí nào có score === null (ví dụ thiếu catalog), nó được tính là 0 và ghi nhận vào cảnh báo dữ liệu.
  const scoreTheme = themeRes.score ?? 0;
  const scoreUniqueness = uniquenessRes.score ?? 0;
  const scoreHumor = humorRes.score ?? 0;
  const scoreValue = valueRes.score ?? 0;

  const rawTotal =
    scoreTheme * themeRes.weight +
    scoreUniqueness * uniquenessRes.weight +
    scoreHumor * humorRes.weight +
    scoreValue * valueRes.weight;

  const total = clamp(rawTotal);

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

  // 5. Xác định Rarity theo ngưỡng 0/15/35/60/80/92
  const uncappedTier = getRarityForScore(total);
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

  const sortedCriteria = [themeRes, uniquenessRes, humorRes, valueRes]
    .filter((c) => c.score !== null)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  if (sortedCriteria.length > 0 && (sortedCriteria[0].score ?? 0) >= 65) {
    strengths.push(`Điểm nổi trội nhất ở "${sortedCriteria[0].labelVi}" (${sortedCriteria[0].score}/100): ${sortedCriteria[0].summary}`);
  }
  if (dominantStyle) {
    strengths.push(`Phong cách thẩm mỹ rõ ràng thuộc trường phái ${dominantStyle.label}.`);
  }

  const lowest = sortedCriteria[sortedCriteria.length - 1];
  if (lowest && (lowest.score ?? 0) < 55) {
    weaknesses.push(`Cần cải thiện tiêu chí "${lowest.labelVi}" (${lowest.score ?? 0}/100): ${lowest.summary}`);
  }

  // 7. Lời khuyên nâng cấp lên bậc kế tiếp (hoặc LEGENDARY) và MYTHICAL
  let nextTierAdvice: TierAdvice | null = null;
  const currentIdx = TIER_ORDER.indexOf(finalTier);
  if (currentIdx < TIER_ORDER.length - 1) {
    const target = TIER_ORDER[currentIdx + 1];
    const targetMin = RARITIES[target].minScore;
    const pointsNeeded = Math.max(1, targetMin - total);

    const steps: string[] = [];
    if (scoreTheme < 70) {
      steps.push("Hài hòa màu sắc: Chọn các phụ kiện có dải màu tương đồng, hạn chế màu tương phản gay gắt không chủ đích.");
    }
    if (scoreUniqueness < 70) {
      steps.push("Tạo bản sắc độc lạ: Thử nghiệm phối nhiều lớp (layered clothing) hoặc chọn phụ kiện độc bản ít người dùng.");
    }
    if (scoreHumor < 60 && dominantStyle?.style === "meme") {
      steps.push("Nhấn mạnh yếu tố meme: Đưa vào các phụ kiện hoặc biểu cảm châm biếm kinh điển thay vì chỉ dùng đồ ngẫu nhiên.");
    }
    if (scoreValue < 60) {
      steps.push("Đầu tư phụ kiện catalog: Bổ sung thêm các vật phẩm đang bán chính thức có giá trị thẩm mỹ cao.");
    }
    if (steps.length === 0) {
      steps.push("Tối ưu hóa các chi tiết nhỏ để tích lũy thêm điểm tổng trên 4 tiêu chí.");
    }

    nextTierAdvice = {
      target,
      pointsNeeded,
      steps,
    };
  }

  const mythicalAdvice: string[] = [
    "Đạt điểm xuất sắc đồng đều (trung bình >= 92 điểm) trên cả 4 tiêu chí Chủ đề, Độc lạ, Hài hước và Giá trị.",
    "Cần một định hướng thẩm mỹ đỉnh cao: phối màu hoàn hảo (monochrome/analogous hài hòa), silhouette nhận diện tức thì.",
    "Bắt buộc dữ liệu từ Roblox API và Catalog phải xác minh đầy đủ 100% để vượt qua cơ chế giới hạn chất lượng.",
  ];

  const limitations: string[] = [
    "Hệ thống sử dụng phương pháp phân tích dựa trên quy tắc (Rule-based) và dữ liệu thực từ Roblox Web API, không sử dụng mô hình AI nhận diện hình ảnh ngoại tuyến.",
    "Tiêu chí Giá trị chỉ ghi nhận các vật phẩm đang mở bán trên catalog Roblox có giá niêm yết chính thức; vật phẩm Limited và Off-sale không được quy đổi sang giá trị Robux.",
  ];

  return {
    criteria: criteriaMap,
    total,
    uncappedTier,
    rarity: finalRarity,
    dataQuality,
    value: valueBreakdown,
    styles: detectedStyles,
    dominantStyle,
    strengths,
    weaknesses,
    nextTier: nextTierAdvice,
    mythicalAdvice,
    limitations,
    analysisMethod: "rule-based",
  };
}
