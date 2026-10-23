import type { AvatarAsset, AvatarBodyColors, StyleKey } from "@/types";

// ---------- Nhóm loại vật phẩm (theo assetType.name của Roblox) ----------

export const LAYERED_CLOTHING = new Set([
  "TShirtAccessory",
  "ShirtAccessory",
  "PantsAccessory",
  "JacketAccessory",
  "SweaterAccessory",
  "ShortsAccessory",
  "DressSkirtAccessory",
  "LeftShoeAccessory",
  "RightShoeAccessory",
]);
export const CLASSIC_CLOTHING = new Set(["Shirt", "Pants", "TShirt"]);
export const ACCESSORIES = new Set([
  "Hat",
  "HairAccessory",
  "FaceAccessory",
  "NeckAccessory",
  "ShoulderAccessory",
  "FrontAccessory",
  "BackAccessory",
  "WaistAccessory",
  "EyebrowAccessory",
  "EyelashAccessory",
]);
export const BODY_PARTS = new Set(["Torso", "RightArm", "LeftArm", "LeftLeg", "RightLeg", "Head", "DynamicHead"]);
const TOPS = new Set(["Shirt", "TShirt", "TShirtAccessory", "ShirtAccessory", "JacketAccessory", "SweaterAccessory", "DressSkirtAccessory"]);
const BOTTOMS = new Set(["Pants", "PantsAccessory", "ShortsAccessory", "DressSkirtAccessory"]);
const HEADWEAR = new Set(["Hat", "HairAccessory"]);

export type AssetGroup = "layered" | "classic" | "accessory" | "face" | "body" | "animation" | "other";

export function assetGroup(typeName: string): AssetGroup {
  if (LAYERED_CLOTHING.has(typeName)) return "layered";
  if (CLASSIC_CLOTHING.has(typeName)) return "classic";
  if (ACCESSORIES.has(typeName)) return "accessory";
  if (typeName === "Face") return "face";
  if (BODY_PARTS.has(typeName)) return "body";
  if (typeName.endsWith("Animation")) return "animation";
  return "other";
}

/** Vật phẩm "trang phục" thực sự do người chơi chọn để tạo phong cách. */
export function isStylingAsset(a: AvatarAsset): boolean {
  const g = assetGroup(a.assetType.name);
  return g === "layered" || g === "classic" || g === "accessory" || g === "face";
}

/** Có giá riêng trên catalog hay thường đi kèm bundle (body part, animation, mood). */
export function isPriceableAsset(a: AvatarAsset): boolean {
  return isStylingAsset(a);
}

export function outfitCompleteness(assets: AvatarAsset[], defaultShirt: boolean, defaultPants: boolean) {
  const types = new Set(assets.map((a) => a.assetType.name));
  const hasTop = !defaultShirt && [...types].some((t) => TOPS.has(t));
  const hasBottom = !defaultPants && [...types].some((t) => BOTTOMS.has(t));
  const hasHeadwear = [...types].some((t) => HEADWEAR.has(t));
  return { hasTop, hasBottom, hasHeadwear, score: (hasTop ? 0.35 : 0) + (hasBottom ? 0.35 : 0) + (hasHeadwear ? 0.3 : 0) };
}

// ---------- "Đơn vị trang phục": gom các phần của cùng một bundle ----------

export interface StyleUnit {
  name: string;
  group: AssetGroup;
  assetIds: number[];
}

/** "Mini Me R6 Bundle - Torso" → "Mini Me R6 Bundle". */
function bundleBaseName(name: string): string {
  const idx = name.lastIndexOf(" - ");
  return idx > 0 ? name.slice(0, idx).trim() : name.trim();
}

export function buildStyleUnits(assets: AvatarAsset[]): StyleUnit[] {
  const units = new Map<string, StyleUnit>();
  for (const a of assets) {
    const group = assetGroup(a.assetType.name);
    const grouped = group === "body" || group === "animation" || a.assetType.name === "MoodAnimation";
    const key = grouped ? `${group}:${bundleBaseName(a.name).toLowerCase()}` : `asset:${a.id}`;
    const existing = units.get(key);
    if (existing) existing.assetIds.push(a.id);
    else units.set(key, { name: grouped ? bundleBaseName(a.name) : a.name, group, assetIds: [a.id] });
  }
  return [...units.values()];
}

// ---------- Từ điển từ khóa phong cách ----------

export const STYLE_LABELS: Record<StyleKey, string> = {
  y2k: "Y2K",
  goth: "Goth",
  cyberpunk: "Cyberpunk",
  streetwear: "Streetwear",
  oldmoney: "Old Money",
  grunge: "Grunge / Emo",
  fantasy: "Fantasy",
  techwear: "Techwear",
  coquette: "Coquette",
  kawaii: "Kawaii",
  sporty: "Sporty",
  meme: "Humor / Meme",
  minimalism: "Minimalism",
  maximalism: "Maximalism",
};

type KeywordStyle = Exclude<StyleKey, "minimalism" | "maximalism">;

export const STYLE_KEYWORDS: Record<KeywordStyle, string[]> = {
  y2k: ["y2k", "butterfly", "rhinestone", "bling", "glitter", "2000s", "flip phone", "baby tee", "low rise", "frosted", "juicy"],
  goth: ["goth", "gothic", "vampire", "bat wings", "coffin", "skull", "spiked", "spikes", "corset", "raven", "demon", "occult", "black lace", "crucifix"],
  cyberpunk: ["cyber", "cyberpunk", "neon", "robot", "android", "cyborg", "mecha", "hologram", "glitch", "visor", "futuristic", "circuit", "hacker", "synthwave"],
  streetwear: ["streetwear", "hoodie", "sneaker", "sneakers", "drip", "puffer", "bucket hat", "snapback", "durag", "oversized", "baggy", "grillz", "hype"],
  oldmoney: ["old money", "polo", "sweater vest", "cardigan", "blazer", "loafers", "pearl", "pearls", "preppy", "trench", "cashmere", "monocle", "gentleman", "country club"],
  grunge: ["grunge", "flannel", "ripped", "distressed", "torn", "band tee", "plaid", "combat boots", "emo", "scene"],
  fantasy: ["fantasy", "wizard", "witch", "elf", "fairy", "dragon", "angel", "wings", "knight", "sword", "magic", "mage", "crown", "halo", "horns", "valkyrie", "unicorn", "armor", "armour", "dominus", "phoenix"],
  techwear: ["techwear", "tactical", "utility", "cargo", "harness", "gas mask", "respirator", "windbreaker"],
  coquette: ["coquette", "bow", "bows", "ribbon", "frilly", "frills", "ballet", "lolita", "cherry", "strawberry", "soft girl"],
  kawaii: ["kawaii", "cute", "bunny", "kitty", "cat ears", "neko", "chibi", "plush", "pastel", "anime", "uwu", "kuromi", "cinnamoroll"],
  sporty: ["sport", "jersey", "football", "soccer", "basketball", "athletic", "tracksuit", "goalkeeper", "baseball"],
  meme: [
    "meme", "noob", "troll", "trollface", "shrek", "banana", "chicken", "cheems", "doge", "clown", "derp",
    "potato", "hotdog", "hot dog", "rubber duck", "goose", "toilet", "skibidi", "sigma", "rizz", "ohio",
    "amogus", "among us", "nugget", "pickle", "mini me", "annoying", "goofy", "silly", "funny", "epic face",
    "oof", "capybara", "pepe", "grimace", "bacon",
  ],
};

/** Từ khóa gợi ý nhân vật/người nổi tiếng — chỉ là gợi ý từ tên vật phẩm, KHÔNG xác minh danh tính. */
export const CELEBRITY_KEYWORDS: string[] = [
  "ronaldo", "cr7", "siuu", "messi", "neymar", "mbappe", "haaland", "lebron", "mrbeast", "elon", "kanye", "drake",
  "spongebob", "patrick star", "shrek", "mario", "sonic", "goku", "naruto", "pikachu", "batman", "spiderman", "spider-man",
];

/** Vật phẩm gắn với meme Roblox kinh điển (khớp tên chính xác hơn từ khóa). */
export const KNOWN_ROBLOX_MEMES: { match: string; label: string }[] = [
  { match: "pal hair", label: "\"Bacon Hair\" — meme người chơi mới kinh điển của Roblox" },
  { match: "epic face", label: "\"Epic Face\" — gương mặt meme lâu đời của Roblox" },
];

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

const regexCache = new Map<string, RegExp>();
function keywordRegex(keyword: string): RegExp {
  let re = regexCache.get(keyword);
  if (!re) {
    re = new RegExp(`(^|[^a-z0-9])${escapeRegExp(keyword)}($|[^a-z0-9])`, "i");
    regexCache.set(keyword, re);
  }
  return re;
}

/** Trả về các từ khóa khớp trong tên (so khớp theo ranh giới từ để tránh "bow" khớp "elbow"). */
export function matchKeywords(name: string, keywords: readonly string[]): string[] {
  return keywords.filter((k) => keywordRegex(k).test(name));
}

// ---------- Màu cơ thể ----------

/** Bộ màu "noob" cổ điển: đầu/tay vàng, thân xanh dương, chân xanh lá. */
const NOOB_YELLOW = ["F5CD30", "FDEA8D", "FFC9C9".slice(0, 0)].filter(Boolean);
const NOOB_BLUE = ["0D69AC", "1B2A35".slice(0, 0)].filter(Boolean);
const NOOB_GREEN = ["A4BD47", "4B974B"];

function hexClose(a: string, b: string, tolerance = 40): boolean {
  const pa = parseInt(a, 16);
  const pb = parseInt(b, 16);
  if (Number.isNaN(pa) || Number.isNaN(pb)) return false;
  const dr = ((pa >> 16) & 255) - ((pb >> 16) & 255);
  const dg = ((pa >> 8) & 255) - ((pb >> 8) & 255);
  const db = (pa & 255) - (pb & 255);
  return Math.sqrt(dr * dr + dg * dg + db * db) <= tolerance;
}

const matchesAny = (hex: string, palette: string[]) => palette.some((p) => hexClose(hex, p));

export function isClassicNoobPalette(c: AvatarBodyColors | null): boolean {
  if (!c) return false;
  return (
    matchesAny(c.headColor3, NOOB_YELLOW) &&
    matchesAny(c.leftArmColor3, NOOB_YELLOW) &&
    matchesAny(c.rightArmColor3, NOOB_YELLOW) &&
    matchesAny(c.torsoColor3, NOOB_BLUE) &&
    matchesAny(c.leftLegColor3, NOOB_GREEN) &&
    matchesAny(c.rightLegColor3, NOOB_GREEN)
  );
}
