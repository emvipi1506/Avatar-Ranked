import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import catalog từ avatarStyles.ts
const avatarStylesPath = path.resolve(__dirname, "../src/lib/data/avatarStyles.ts");
const content = fs.readFileSync(avatarStylesPath, "utf-8");

// Parse danh sách styles bằng regex hoặc eval đơn giản
// Trích xuất các objects bên trong AVATAR_STYLES_CATALOG
const regex = /\{\s*index:\s*(\d+),\s*id:\s*"([^"]+)",\s*name:\s*"([^"]+)",\s*description:\s*"([^"]+)",\s*category:\s*"([^"]+)",\s*groups:\s*(\[[^\]]*\]),\s*aliases:\s*(\[[^\]]*\]),\s*evidence:\s*(\[[^\]]*\]),\s*confidenceGuidance:\s*"([^"]+)",\s*keywords:\s*(\[[^\]]*\])\s*\}/g;

const styles = [];
let match;
while ((match = regex.exec(content)) !== null) {
  const [_, indexStr, id, name, description, category, groupsRaw, aliasesRaw, evidenceRaw, confidenceGuidance, keywordsRaw] = match;
  
  let groups = [];
  try { groups = JSON.parse(groupsRaw); } catch(e) {}
  
  let aliases = [];
  try { aliases = JSON.parse(aliasesRaw); } catch(e) {}
  
  let keywords = [];
  try { keywords = JSON.parse(keywordsRaw); } catch(e) {}

  // Tạo các tín hiệu theo nhóm
  const themeSignals = keywords.slice(0, 4);
  const originalitySignals = groups.includes("uniqueness") ? [`Phong cách độc đáo: ${name}`, `Phối hợp item theo định hướng ${name}`] : [];
  const humorSignals = groups.includes("humor") ? [`Yếu tố meme / troll / parody: ${name}`, `Tạo hình hài hước hoặc biến tấu lạ mắt`] : [];
  const valueSignals = groups.includes("value") ? [`Vật phẩm luxury / flex / sưu tầm: ${name}`] : [];
  const relatedStyles = groups.slice(0, 3);
  const recognitionCues = keywords.map(k => `Khớp từ khóa hoặc metadata: "${k}"`);
  const confidenceNotes = confidenceGuidance || "Chỉ xác nhận khi có ít nhất 2 phụ kiện hoặc bằng chứng cấu trúc đồng nhất.";

  styles.push({
    index: parseInt(indexStr, 10),
    id,
    name,
    description,
    aliases,
    category,
    relatedStyles,
    themeSignals,
    originalitySignals,
    humorSignals,
    valueSignals,
    recognitionCues,
    confidenceNotes,
    keywords,
  });
}

console.log(`Parsed ${styles.length} styles from avatarStyles.ts.`);

if (styles.length !== 270) {
  console.error(`ERROR: Expected 270 styles, but got ${styles.length}!`);
  process.exit(1);
}

// Kiểm tra tính duy nhất của ID
const ids = new Set();
for (const s of styles) {
  if (ids.has(s.id)) {
    console.error(`Duplicate ID found: ${s.id}`);
    process.exit(1);
  }
  ids.add(s.id);
}
console.log(`Verified: All 270 IDs are unique and non-empty.`);

// Tạo thư mục server/data nếu chưa có
const serverDataDir = path.resolve(__dirname, "../server/data");
if (!fs.existsSync(serverDataDir)) {
  fs.mkdirSync(serverDataDir, { recursive: true });
}

const serverJsonPath = path.join(serverDataDir, "aesthetics.json");
fs.writeFileSync(serverJsonPath, JSON.stringify(styles, null, 2), "utf-8");
console.log(`Wrote server/data/aesthetics.json (${fs.statSync(serverJsonPath).size} bytes).`);

// Tạo đồng bộ tại src/lib/data/aesthetics.json
const srcDataDir = path.resolve(__dirname, "../src/lib/data");
const srcJsonPath = path.join(srcDataDir, "aesthetics.json");
fs.writeFileSync(srcJsonPath, JSON.stringify(styles, null, 2), "utf-8");
console.log(`Wrote src/lib/data/aesthetics.json (${fs.statSync(srcJsonPath).size} bytes).`);
