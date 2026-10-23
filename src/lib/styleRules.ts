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
  cosplay: "Cosplay / Anime / Phim / Fantasy",
  minimalism: "Minimalism",
  maximalism: "Maximalism",
};

type KeywordStyle = Exclude<StyleKey, "minimalism" | "maximalism" | "cosplay">;

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
];

// ---------- HỆ THỐNG NHẬN DIỆN COSPLAY (ANIME, PHIM ẢNH, FANTASY, GAME) ----------

export interface CosplayEntry {
  category: "anime" | "movie" | "fantasy" | "game";
  franchise: string;
  character: string;
  keywords: string[];
}

export const COSPLAY_DATABASE: CosplayEntry[] = [
  // --- ANIME & MANGA ---
  { category: "anime", franchise: "Dragon Ball", character: "Son Goku / Saiyan", keywords: ["goku", "vegeta", "gohan", "saiyan", "super saiyan", "ultra instinct", "kamehameha", "broly"] },
  { category: "anime", franchise: "Naruto", character: "Naruto / Sasuke / Akatsuki", keywords: ["naruto", "sasuke", "kakashi", "itachi", "akatsuki", "sharingan", "hokage", "madara", "obito", "rasengan", "minato"] },
  { category: "anime", franchise: "One Piece", character: "Luffy / Zoro / Straw Hat", keywords: ["luffy", "zoro", "straw hat", "sanji", "gear 5", "nika", "trafalgar law", "ace", "shanks", "roronoa", "kaido"] },
  { category: "anime", franchise: "Demon Slayer", character: "Tanjiro / Nezuko / Hashira", keywords: ["tanjiro", "nezuko", "zenitsu", "inosuke", "rengoku", "giyu", "shinobu", "hashira", "demon slayer", "kimetsu", "nichirin"] },
  { category: "anime", franchise: "Jujutsu Kaisen", character: "Gojo Satoru / Sukuna", keywords: ["gojo", "satoru gojo", "sukuna", "itadori", "megumi", "toji", "fushiguro", "jujutsu kaisen", "domain expansion", "nobara"] },
  { category: "anime", franchise: "Attack on Titan", character: "Eren / Levi / Scout", keywords: ["eren", "levi", "ackerman", "mikasa", "survey corps", "scout regiment", "titan", "shingeki", "aot"] },
  { category: "anime", franchise: "Bleach", character: "Ichigo / Shinigami", keywords: ["ichigo", "bankai", "shinigami", "soul reaper", "bleach", "aizen", "hollow", "zanpakuto"] },
  { category: "anime", franchise: "Chainsaw Man", character: "Denji / Makima / Power", keywords: ["chainsaw man", "denji", "makima", "power", "pochita", "hayakawa"] },
  { category: "anime", franchise: "My Hero Academia", character: "Deku / Bakugo / All Might", keywords: ["deku", "midoriya", "bakugo", "todoroki", "all might", "boku no hero", "shigaraki"] },
  { category: "anime", franchise: "JoJo's Bizarre Adventure", character: "Jotaro / Dio / Stand", keywords: ["jotaro", "kujo", "dio", "brando", "jojo", "stand", "star platinum", "giorno", "za warudo"] },
  { category: "anime", franchise: "Hunter x Hunter", character: "Killua / Gon / Hisoka", keywords: ["killua", "zoldyck", "gon freecss", "hisoka", "kurapika", "phantom troupe"] },
  { category: "anime", franchise: "Genshin Impact / Honkai", character: "Raiden / Hu Tao / Zhongli", keywords: ["raiden", "hu tao", "zhongli", "furina", "genshin", "acheron", "kafka", "scaramouche", "xiao", "kazuha", "honkai"] },
  { category: "anime", franchise: "Solo Leveling", character: "Sung Jinwoo", keywords: ["sung jinwoo", "shadow monarch", "solo leveling", "jinwoo", "arise"] },
  { category: "anime", franchise: "Vocaloid", character: "Hatsune Miku", keywords: ["hatsune miku", "miku", "vocaloid"] },
  { category: "anime", franchise: "Tokyo Ghoul", character: "Kaneki Ken", keywords: ["kaneki", "tokyo ghoul", "ghoul mask", "centipede"] },
  { category: "anime", franchise: "Sword Art Online", character: "Kirito / Asuna", keywords: ["kirito", "asuna", "elucidator", "dark repulser", "sword art online"] },
  { category: "anime", franchise: "Spy x Family", character: "Anya / Yor Forger", keywords: ["anya forger", "yor forger", "spy x family"] },
  { category: "anime", franchise: "Pokémon", character: "Pikachu / Ash Ketchum", keywords: ["pikachu", "charizard", "pokemon", "pokeball", "ash ketchum"] },
  { category: "anime", franchise: "Berserk", character: "Guts / Black Swordsman", keywords: ["guts", "berserk", "dragonslayer", "brand of sacrifice", "griffith"] },

  // --- PHIM ẢNH & SIÊU ANH HÙNG (MOVIES & SUPERHEROES) ---
  { category: "movie", franchise: "Marvel", character: "Spider-Man / Peter Parker / Miles Morales", keywords: ["spiderman", "spider-man", "miles morales", "spider suit", "web shooter", "spider gwen"] },
  { category: "movie", franchise: "Marvel", character: "Iron Man / Tony Stark", keywords: ["iron man", "tony stark", "arc reactor", "hulkbuster"] },
  { category: "movie", franchise: "Marvel", character: "Deadpool / Wolverine", keywords: ["deadpool", "wolverine", "weapon x", "logan"] },
  { category: "movie", franchise: "Marvel", character: "Venom / Symbiote", keywords: ["venom", "symbiote", "carnage"] },
  { category: "movie", franchise: "Marvel", character: "Avengers", keywords: ["captain america", "thor", "thanos", "loki", "doctor strange", "black panther"] },
  { category: "movie", franchise: "DC Comics", character: "Batman / The Dark Knight", keywords: ["batman", "dark knight", "bruce wayne", "bat cowl", "bat suit", "gotham"] },
  { category: "movie", franchise: "DC Comics", character: "The Joker / Harley Quinn", keywords: ["joker", "harley quinn", "clown prince", "arkham"] },
  { category: "movie", franchise: "DC Comics", character: "Superman / Flash", keywords: ["superman", "man of steel", "krypton", "the flash"] },
  { category: "movie", franchise: "Star Wars", character: "Darth Vader / Jedi / Sith", keywords: ["darth vader", "jedi", "sith", "lightsaber", "stormtrooper", "mandalorian", "boba fett", "star wars", "skywalker", "yoda"] },
  { category: "movie", franchise: "Harry Potter", character: "Wizard / Hogwarts", keywords: ["harry potter", "hogwarts", "gryffindor", "slytherin", "voldemort", "death eater"] },
  { category: "movie", franchise: "Lord of the Rings", character: "Gandalf / Legolas / Sauron", keywords: ["gandalf", "lotr", "sauron", "one ring", "nazgul", "middle earth"] },
  { category: "movie", franchise: "The Matrix", character: "Neo", keywords: ["matrix", "neo coat", "morpheus"] },

  // --- THỂ LOẠI FANTASY & THẦN THOẠI (FANTASY ARCHETYPES) ---
  { category: "fantasy", franchise: "Fantasy Knights", character: "Hiệp sĩ Hoàng gia / Paladin", keywords: ["paladin", "crusader", "holy knight", "templar", "royal knight", "silver knight", "greatsword"] },
  { category: "fantasy", franchise: "Dark Fantasy", character: "Hiệp sĩ Bóng đêm / Dark Knight", keywords: ["dark knight", "black knight", "death knight", "dread knight", "shadow knight", "abyss"] },
  { category: "fantasy", franchise: "Magic & Sorcery", character: "Đại pháp sư / Phù thủy Archmage", keywords: ["archmage", "sorcerer", "grand wizard", "spellcaster", "necromancer", "warlock", "elementalist"] },
  { category: "fantasy", franchise: "Angelic / Celestial", character: "Thiên sứ / Thần thoại Seraphim", keywords: ["archangel", "seraphim", "celestial", "angelic wings", "holy halo", "divine"] },
  { category: "fantasy", franchise: "Demonic / Underworld", character: "Chúa quỷ / Ác ma Hell Lord", keywords: ["demon lord", "devil lord", "underworld", "hellfire", "infernal", "lucifer", "archdemon"] },
  { category: "fantasy", franchise: "Eastern Fantasy", character: "Samurai / Ninja Shinobi", keywords: ["samurai", "ronin", "katana", "shinobi", "ninja assassin", "shogun"] },
  { category: "fantasy", franchise: "Mythical Valkyrie", character: "Chiến thần Valkyrie", keywords: ["valkyrie", "valkyrie helm", "valk", "nordic", "valhalla"] },
  { category: "fantasy", franchise: "Dragon Lore", character: "Kỵ sĩ Rồng / Dragon Slayer", keywords: ["dragon slayer", "draconic", "dragon knight", "dragon lord", "dragon wings"] },

  // --- GAME KINH ĐIỂN ---
  { category: "game", franchise: "Nintendo", character: "Mario / Sonic / Zelda", keywords: ["mario", "luigi", "sonic the hedgehog", "link", "zelda", "master sword"] },
  { category: "game", franchise: "Elden Ring / Souls", character: "Tarnished / Malenia", keywords: ["elden ring", "malenia", "tarnished", "dark souls", "ranni"] },
  { category: "game", franchise: "Minecraft", character: "Steve / Creeper", keywords: ["steve", "creeper", "minecraft", "diamond sword"] },
  { category: "game", franchise: "League of Legends", character: "Jinx / Yasuo / Ahri", keywords: ["league of legends", "jinx", "yasuo", "ahri", "arcane"] },
  { category: "game", franchise: "Five Nights at Freddy's", character: "FNAF Animatronic", keywords: ["freddy fazbear", "fnaf", "springtrap", "bonnie"] },
];

export interface CosplayDetection {
  category: "anime" | "movie" | "fantasy" | "game";
  franchise: string;
  character: string;
  matchedKeyword: string;
  assetName: string;
}

/** Quét tất cả vật phẩm và phát hiện xem có cosplay anime/phim/fantasy không. */
export function detectCosplayInAssets(assets: AvatarAsset[]): CosplayDetection[] {
  const detections: CosplayDetection[] = [];
  const seenCombos = new Set<string>();

  for (const asset of assets) {
    const assetLower = asset.name.toLowerCase();
    for (const entry of COSPLAY_DATABASE) {
      for (const kw of entry.keywords) {
        if (keywordRegex(kw).test(assetLower)) {
          const comboKey = `${entry.franchise}:${entry.character}`;
          if (!seenCombos.has(comboKey)) {
            seenCombos.add(comboKey);
            detections.push({
              category: entry.category,
              franchise: entry.franchise,
              character: entry.character,
              matchedKeyword: kw,
              assetName: asset.name,
            });
          }
          break; // Đã khớp 1 từ khóa của entry này cho asset này
        }
      }
    }
  }

  return detections;
}

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
