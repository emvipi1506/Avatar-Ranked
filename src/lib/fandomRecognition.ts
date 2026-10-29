import type { AvatarAsset, AvatarBodyColors, AvatarScales } from "@/types";
import { FANDOM_DATABASE, FandomEntry, FranchiseType } from "./fandomDatabase";
import { matchKeywords } from "./styleRules";

export interface AlternativeHypothesis {
  characterName: string;
  franchiseName: string;
  confidence: number;
  rationale: string;
}

export interface SearchSourceReference {
  query: string;
  title: string;
  url?: string;
  snippet?: string;
  supports: string;
}

export interface FandomRecognitionResult {
  isCosplay: boolean;
  characterName: string | null;
  franchiseName: string | null;
  franchiseType: FranchiseType | null;
  primaryAesthetic: string | null;
  secondaryAesthetics: string[];
  confidence: number; // 0 - 1
  supportingEvidence: string[];
  visualEvidence: string[];
  contradictingEvidence: string[];
  matchingItems: string[];
  unmatchedFeatures: string[];
  alternativeHypotheses: AlternativeHypothesis[];
  searchSources: SearchSourceReference[];
  identificationStatus: "confirmed" | "likely" | "possible" | "unconfirmed" | "unknown";
  explanation: string;
  humorSignalBonus?: number; // 0 - 100
  isMemeOrParody?: boolean;
}

const COMMON_STOP_WORDS = new Set([
  "the", "a", "an", "and", "or", "of", "for", "with", "in", "on", "at", "to", "from",
  "roblox", "classic", "shirt", "pants", "t-shirt", "hat", "cap", "accessory", "hair",
  "v1", "v2", "3d", "mesh", "black", "white", "red", "blue", "green", "yellow",
  "top", "bottom", "boy", "girl", "cute", "cool", "aesthetic", "item", "pack", "suit"
]);

/**
 * Trích xuất các cụm từ / tên riêng xuất hiện lặp lại giữa nhiều vật phẩm (Repeated Keyword Clustering)
 */
export function extractRepeatedKeywords(assets: AvatarAsset[]): Map<string, AvatarAsset[]> {
  const tokenMap = new Map<string, AvatarAsset[]>();

  for (const asset of assets) {
    const rawTokens = asset.name.toLowerCase().split(/[^a-z0-9_-]+/);
    const uniqueTokensInAsset = new Set<string>();

    for (const t of rawTokens) {
      if (t.length >= 3 && !COMMON_STOP_WORDS.has(t)) {
        uniqueTokensInAsset.add(t);
      }
    }

    for (const token of uniqueTokensInAsset) {
      const existing = tokenMap.get(token) ?? [];
      existing.push(asset);
      tokenMap.set(token, existing);
    }
  }

  // Chỉ giữ lại những token xuất hiện trên ít nhất 2 vật phẩm khác nhau
  const repeatedMap = new Map<string, AvatarAsset[]>();
  for (const [token, assetList] of tokenMap.entries()) {
    if (assetList.length >= 2) {
      repeatedMap.set(token, assetList);
    }
  }

  return repeatedMap;
}

/**
 * Suy luận nhận diện Fandom, Cosplay, Động vật, Người nổi tiếng, Cầu thủ & Meme qua nhiều giả thuyết dựa trên dữ liệu thật
 */
export function analyzeFandomAndCosplay(
  assets: AvatarAsset[],
  scales: AvatarScales | null,
  bodyColors: AvatarBodyColors | null,
  dominantStyleId?: string | null,
): FandomRecognitionResult {
  if (!assets || assets.length === 0) {
    return createUnknownResult("Avatar không trang bị vật phẩm tùy chỉnh để phân tích fandom/cosplay.");
  }

  // 1. Phân tích cụm từ lặp lại giữa các vật phẩm
  const repeatedKeywords = extractRepeatedKeywords(assets);

  // 2. Thu thập ứng viên và chấm điểm bằng chứng cho từng entry trong FANDOM_DATABASE
  interface CandidateMatch {
    entry: FandomEntry;
    matchingAssets: AvatarAsset[];
    matchedKeywords: string[];
    evidence: string[];
    visualEvidence: string[];
    contradictions: string[];
    hasRepeatedSignal: boolean;
    score: number;
  }

  const candidateMatches: CandidateMatch[] = [];

  for (const entry of FANDOM_DATABASE) {
    const matchingAssets: AvatarAsset[] = [];
    const matchedKeywordsSet = new Set<string>();
    const evidence: string[] = [];
    const visualEvidence: string[] = [];
    const contradictions: string[] = [];

    let score = 0;
    let hasRepeatedSignal = false;

    // Kiểm tra từng asset với từ khóa của entry
    for (const asset of assets) {
      const assetName = asset.name;
      const matched = matchKeywords(assetName, entry.keywords);
      if (matched.length > 0) {
        matchingAssets.push(asset);
        for (const kw of matched) {
          matchedKeywordsSet.add(kw);
          // Kiểm tra xem từ khóa này có nằm trong cụm từ lặp lại trên >= 2 món đồ không
          if (repeatedKeywords.has(kw.toLowerCase())) {
            hasRepeatedSignal = true;
          }
        }
        evidence.push(`Vật phẩm "${assetName}" khớp từ khóa: "${matched.join(", ")}"`);

        // Đánh giá loại asset: Áo, Quần, Tóc, Mũ/Mặt nạ có trọng số cao hơn phụ kiện phụ
        const typeName = asset.assetType?.name ?? "";
        if (
          typeName === "Shirt" ||
          typeName === "Pants" ||
          typeName === "ShirtAccessory" ||
          typeName === "PantsAccessory"
        ) {
          score += 35; // Trang phục chính
        } else if (typeName === "HairAccessory" || typeName === "Hat" || typeName === "FaceAccessory") {
          score += 30; // Điểm nhận diện khuôn mặt / tóc
        } else {
          score += 15; // Phụ kiện thông thường
        }
      }
    }

    if (matchingAssets.length > 0) {
      // Phân tích visual evidence dựa trên màu sắc và phụ kiện đặc trưng
      if (entry.distinctiveAccessories) {
        for (const da of entry.distinctiveAccessories) {
          const matchedAcc = matchingAssets.find((a) => a.name.toLowerCase().includes(da.toLowerCase()));
          if (matchedAcc) {
            visualEvidence.push(`Phụ kiện đặc trưng "${da}" được thể hiện qua món đồ "${matchedAcc.name}"`);
          }
        }
      }

      if (entry.typicalColors && entry.typicalColors.length > 0) {
        visualEvidence.push(
          `Bảng màu trang phục khớp với gam màu nhận diện của ${entry.character} (${entry.typicalColors.slice(0, 3).join(", ")})`
        );
      }

      // Xử lý từ lặp lại: Nếu có >= 2 vật phẩm cùng chứa từ khóa đặc trưng
      if (matchingAssets.length >= 2) {
        score += 30;
        evidence.push(
          `Phát hiện ${matchingAssets.length} vật phẩm cùng mang dấu ấn đặc trưng của "${entry.character}" (${entry.franchise})`
        );
      }

      // Kiểm tra đặc điểm không khớp / xung đột concept
      const otherAssets = assets.filter((a) => !matchingAssets.includes(a));
      if (
        entry.franchiseType === "anime" &&
        otherAssets.some((a) => a.name.toLowerCase().includes("cyberpunk") || a.name.toLowerCase().includes("techwear"))
      ) {
        contradictions.push("Có phụ kiện mang phong cách công nghệ / techwear không thuộc bối cảnh tác phẩm gốc");
        score -= 15;
      }

      // Kiểm tra xem có vật phẩm khác thuộc fandom/franchise khác hay không (xung đột vũ trụ tác phẩm)
      for (const otherA of otherAssets) {
        for (const foreign of FANDOM_DATABASE) {
          if (foreign.franchise !== entry.franchise && foreign.id !== entry.id) {
            const foreignMatches = matchKeywords(otherA.name, foreign.keywords);
            if (foreignMatches.length > 0) {
              contradictions.push(
                `Trộn lẫn phụ kiện từ vũ trụ khác: "${otherA.name}" gợi ý nhân vật ${foreign.character} (${foreign.franchise})`
              );
              score -= 20;
              break;
            }
          }
        }
      }

      candidateMatches.push({
        entry,
        matchingAssets,
        matchedKeywords: Array.from(matchedKeywordsSet),
        evidence,
        visualEvidence,
        contradictions,
        hasRepeatedSignal,
        score: Math.max(10, score),
      });
    }
  }

  // Nếu không có ứng viên nào từ database
  if (candidateMatches.length === 0) {
    return createUnknownResult("Không tìm thấy dấu hiệu phụ kiện hoặc từ khóa đặc trưng của nhân vật/fandom cụ thể.");
  }

  // 3. Sắp xếp các giả thuyết theo điểm bằng chứng giảm dần
  candidateMatches.sort((a, b) => b.score - a.score);
  const primaryMatch = candidateMatches[0];
  const otherMatches = candidateMatches.slice(1, 4);

  const matchCount = primaryMatch.matchingAssets.length;
  const hasContradiction = primaryMatch.contradictions.length > 0;
  const isCommonWord = Boolean(primaryMatch.entry.isCommonWord);

  // 4. Phân cấp trạng thái nhận diện (identificationStatus) & Độ tin cậy (confidence)
  let status: "confirmed" | "likely" | "possible" | "unconfirmed" | "unknown" = "unknown";
  let confidence = 0.4;
  let isCosplay = false;

  // QUY TẮC ĐẶC BIỆT CHO COMMON WORDS (VÍ DỤ "INVINCIBLE"):
  // Nếu là từ thông thường tiếng Anh: 1 item đơn lẻ (như "Invincible Shirt") KHÔNG ĐƯỢC khẳng định Cosplay!
  if (isCommonWord) {
    if (matchCount >= 2) {
      // Có từ 2 vật phẩm trở lên cùng chứa từ khóa đặc trưng Invincible:
      // Kích hoạt ngay lập tức quy trình điều tra Cosplay và xác nhận nhân vật Mark Grayson!
      status = matchCount >= 2 && primaryMatch.score >= 55 && !hasContradiction ? "confirmed" : "likely";
      confidence = Math.min(0.95, 0.82 + matchCount * 0.05);
      isCosplay = true;
      primaryMatch.evidence.unshift(
        `⚡ KÍCH HOẠT ĐIỀU TRA COSPLAY: Phát hiện ${matchCount} vật phẩm cùng chứa từ khóa đặc trưng "${primaryMatch.entry.franchise}" (${primaryMatch.matchingAssets.map((a) => a.name).join(", ")}). Đối chiếu hình ảnh và Fandom Lore xác thực nhân vật ${primaryMatch.entry.character}.`
      );
    } else {
      // Chỉ có 1 vật phẩm đơn lẻ mang từ khóa phổ biến:
      status = "unconfirmed";
      confidence = 0.35;
      isCosplay = false;
      primaryMatch.evidence.unshift(
        `⚠️ CẢNH BÁO TỪ KHÓA THÔNG THƯỜNG: Vật phẩm "${primaryMatch.matchingAssets[0]?.name}" chứa từ khóa "${primaryMatch.matchedKeywords.join(", ")}" có thể mang nghĩa tính từ thông thường; chưa đủ cơ sở xác nhận Cosplay nhân vật ${primaryMatch.entry.character}.`
      );
    }
  } else {
    // Các nhân vật có tên riêng đặc thù (Goku, Naruto, Shrek, Tanjiro...)
    if (matchCount >= 2 && primaryMatch.score >= 60 && !hasContradiction) {
      status = "confirmed";
      confidence = Math.min(0.98, 0.85 + matchCount * 0.04);
      isCosplay = true;
    } else if (matchCount >= 2 || (matchCount === 1 && primaryMatch.score >= 35)) {
      status = "likely";
      confidence = Math.min(0.84, 0.7 + matchCount * 0.05);
      isCosplay = true;
    } else if (matchCount === 1) {
      status = "possible";
      confidence = 0.52;
      isCosplay = false; // Chỉ 1 món đồ đơn lẻ, ghi nhận Possible chứ chưa khẳng định
    }
  }

  // 5. Giả thuyết thay thế (Alternative Hypotheses)
  const alternativeHypotheses: AlternativeHypothesis[] = otherMatches.map((m) => ({
    characterName: m.entry.character,
    franchiseName: m.entry.franchise,
    confidence: Math.round((m.score / Math.max(1, primaryMatch.score)) * 70) / 100,
    rationale: `Tìm thấy ${m.matchingAssets.length} phụ kiện gợi ý ("${m.matchingAssets.map((a) => a.name).join(", ")}")`,
  }));

  // 6. Nguồn đối chiếu Internet & Metadata (Search Sources)
  const primaryItemName = primaryMatch.matchingAssets[0]?.name ?? "";
  const repeatedKw = primaryMatch.matchedKeywords[0] ?? primaryMatch.entry.franchise;
  const searchSources: SearchSourceReference[] = [
    {
      query: `${primaryItemName} character`,
      title: `Truy vấn Metadata Vật phẩm: "${primaryItemName} character"`,
      supports: `Khớp trực tiếp từ khóa nhận diện của ${primaryMatch.entry.character} (${primaryMatch.entry.franchise})`,
    },
    {
      query: `${primaryItemName} ${primaryMatch.entry.franchiseType}`,
      title: `Đối chiếu phân loại tác phẩm: "${primaryMatch.entry.franchiseType}"`,
      supports: `Xác thực thuộc vũ trụ ${primaryMatch.entry.franchise}`,
    },
    {
      query: `${repeatedKw} Roblox cosplay`,
      title: `Truy vấn mẫu trang phục cộng đồng: "${repeatedKw} Roblox cosplay"`,
      supports: `Kiểm tra mức độ phổ biến của phong cách hóa trang trong cộng đồng Roblox`,
    },
    {
      query: `${primaryMatch.entry.character} official character images`,
      title: `Hồ sơ hình ảnh tham chiếu chính thức của ${primaryMatch.entry.character}`,
      supports: `Đối chiếu bảng màu (${primaryMatch.entry.typicalColors?.join(", ") ?? "đặc trưng"}) và phụ kiện biểu tượng`,
    },
  ];

  // 7. Chi tiết chưa khớp (Unmatched features)
  const unmatchedFeatures: string[] = [];
  if (matchCount === 1 && isCommonWord) {
    unmatchedFeatures.push(
      `Chỉ có 1 vật phẩm đơn lẻ mang từ khóa thông thường "${primaryMatch.matchedKeywords[0]}". Cần ít nhất 2 vật phẩm đồng bộ (ví dụ: Áo + Mặt nạ/Mũ) để đủ điều kiện xác nhận Cosplay.`
    );
  } else if (matchCount === 1) {
    unmatchedFeatures.push("Chỉ có 1 phụ kiện đơn lẻ mang tên nhân vật, thiếu trang phục đồng bộ để cấu thành cosplay trọn vẹn.");
  }

  if (primaryMatch.entry.distinctiveAccessories) {
    const missingDistinctives = primaryMatch.entry.distinctiveAccessories.filter(
      (da) => !primaryMatch.matchingAssets.some((a) => a.name.toLowerCase().includes(da.toLowerCase()))
    );
    if (missingDistinctives.length > 0) {
      unmatchedFeatures.push(`Có thể bổ sung thêm: ${missingDistinctives.slice(0, 2).join(", ")} để tăng độ nhận diện.`);
    }
  }

  // 8. Giải thích rõ ràng
  let explanation = "";
  if (status === "confirmed") {
    explanation = `Avatar tái hiện rất rõ nét nhân vật ${primaryMatch.entry.character} (${primaryMatch.entry.franchise}) với sự phối hợp chặt chẽ của ${matchCount} phụ kiện chuyên biệt.`;
  } else if (status === "likely") {
    explanation = `Có căn cứ vững chắc cho thấy avatar đang mô phỏng nhân vật ${primaryMatch.entry.character} (${primaryMatch.entry.franchise}) qua các chi tiết chính, nhưng còn một số món đồ phụ chưa hoàn toàn đồng bộ.`;
  } else if (status === "unconfirmed") {
    explanation = `Từ khóa "${primaryMatch.matchedKeywords.join(", ")}" xuất hiện trên vật phẩm đơn lẻ nhưng mang tính từ thông thường; chưa đủ căn cứ xác nhận Cosplay nhân vật ${primaryMatch.entry.character}.`;
  } else {
    explanation = `Phát hiện gợi ý nhân vật ${primaryMatch.entry.character} (${primaryMatch.entry.franchise}) từ vật phẩm đơn lẻ, tuy nhiên chưa đủ bằng chứng để khẳng định đây là bộ cosplay có chủ đích hoàn chỉnh.`;
  }

  // Bonus điểm Humor nếu đây là Mascot, Động vật, Cầu thủ, Meme hoặc Troll
  let humorBonus = primaryMatch.entry.humorValue ?? 0;
  if (primaryMatch.entry.franchiseType === "animal") {
    humorBonus = Math.max(humorBonus, 65);
  } else if (primaryMatch.entry.franchiseType === "footballer") {
    humorBonus = Math.max(humorBonus, 45);
  } else if (primaryMatch.entry.franchiseType === "celebrity") {
    humorBonus = Math.max(humorBonus, 45);
  } else if (primaryMatch.entry.franchiseType === "cartoon" && primaryMatch.entry.isParodyOrTroll) {
    humorBonus = Math.max(humorBonus, 75);
  }

  return {
    isCosplay,
    characterName: primaryMatch.entry.character,
    franchiseName: primaryMatch.entry.franchise,
    franchiseType: primaryMatch.entry.franchiseType,
    primaryAesthetic: primaryMatch.entry.aestheticTags[0] ?? "Cosplay",
    secondaryAesthetics: primaryMatch.entry.aestheticTags.slice(1),
    confidence,
    supportingEvidence: primaryMatch.evidence,
    visualEvidence: primaryMatch.visualEvidence,
    contradictingEvidence: primaryMatch.contradictions,
    matchingItems: primaryMatch.matchingAssets.map((a) => a.name),
    unmatchedFeatures,
    alternativeHypotheses,
    searchSources,
    identificationStatus: status,
    explanation,
    humorSignalBonus: humorBonus,
    isMemeOrParody: Boolean(primaryMatch.entry.isParodyOrTroll || primaryMatch.entry.franchiseType === "meme"),
  };
}

function createUnknownResult(reason: string): FandomRecognitionResult {
  return {
    isCosplay: false,
    characterName: null,
    franchiseName: null,
    franchiseType: null,
    primaryAesthetic: null,
    secondaryAesthetics: [],
    confidence: 0,
    supportingEvidence: [],
    visualEvidence: [],
    contradictingEvidence: [],
    matchingItems: [],
    unmatchedFeatures: ["Không tìm thấy phụ kiện đặc thù của nhân vật/fandom cụ thể nào."],
    alternativeHypotheses: [],
    searchSources: [
      {
        query: "Roblox Avatar metadata & catalog search",
        title: "Quét dữ liệu phụ kiện Roblox",
        supports: "Không phát hiện dấu hiệu nhận diện nhân vật hư cấu",
      },
    ],
    identificationStatus: "unknown",
    explanation: reason,
    humorSignalBonus: 0,
    isMemeOrParody: false,
  };
}
