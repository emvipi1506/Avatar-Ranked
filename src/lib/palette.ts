import type { PaletteColor, PaletteHarmony, PaletteStats } from "@/types";

const HUE_BINS = 12; // 30° mỗi ô
const MIN_ALPHA = 200;
const MIN_SAMPLED_PIXELS = 50;
const SIGNIFICANT_BIN_SHARE = 0.06;

export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === rn) h = (gn - bn) / d + (gn < bn ? 6 : 0);
  else if (max === gn) h = (bn - rn) / d + 2;
  else h = (rn - gn) / d + 4;
  return [h * 60, s, l];
}

export function hueDistance(a: number, b: number): number {
  const d = Math.abs(a - b) % 360;
  return d > 180 ? 360 - d : d;
}

function toHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
}

function circularMean(hues: { hue: number; weight: number }[]): number {
  let x = 0;
  let y = 0;
  for (const { hue, weight } of hues) {
    x += Math.cos((hue * Math.PI) / 180) * weight;
    y += Math.sin((hue * Math.PI) / 180) * weight;
  }
  const deg = (Math.atan2(y, x) * 180) / Math.PI;
  return (deg + 360) % 360;
}

interface Bin {
  count: number;
  r: number;
  g: number;
  b: number;
}

/** Phân loại độ hài hòa dựa trên các cụm màu chính (lý thuyết vòng tròn màu). */
export function classifyHarmony(
  clusterHues: number[],
  chromaticShare: number,
  averageSaturation: number,
): { harmony: PaletteHarmony; score: number } {
  const k = clusterHues.length;
  let harmony: PaletteHarmony;
  let score: number;

  if (chromaticShare < 0.15) {
    harmony = "neutral";
    score = 0.85;
  } else if (k === 0) {
    harmony = "mixed";
    score = 0.3;
  } else if (k === 1) {
    harmony = "monochrome";
    score = 0.95;
  } else if (k === 2) {
    const d = hueDistance(clusterHues[0], clusterHues[1]);
    if (d <= 60) [harmony, score] = ["analogous", 0.9];
    else if (d >= 150) [harmony, score] = ["complementary", 0.85];
    else [harmony, score] = ["mixed", 0.6];
  } else if (k === 3) {
    const sorted = [...clusterHues].sort((a, b) => a - b);
    const gaps = [sorted[1] - sorted[0], sorted[2] - sorted[1], 360 - sorted[2] + sorted[0]];
    const arc = 360 - Math.max(...gaps);
    if (arc <= 100) [harmony, score] = ["analogous", 0.85];
    else if (gaps.every((g) => g >= 90 && g <= 150)) [harmony, score] = ["triadic", 0.75];
    else [harmony, score] = ["mixed", 0.5];
  } else {
    harmony = "mixed";
    score = Math.max(0.2, 0.5 - 0.08 * (k - 4));
  }

  // Nhiều màu neon bão hòa cùng lúc dễ gây "chói" và xung đột.
  if (k >= 3 && averageSaturation > 0.7) score -= 0.1;
  // Nền trung tính + 1–2 màu nhấn là cách phối có chủ đích.
  if (harmony !== "neutral" && k <= 2 && chromaticShare <= 0.35) score += 0.05;

  return { harmony, score: Math.round(Math.min(1, Math.max(0, score)) * 100) / 100 };
}

/**
 * Phân tích mảng pixel RGBA (ví dụ từ canvas getImageData). Bỏ qua pixel trong suốt (nền).
 * Trả về null nếu quá ít pixel để kết luận — không đoán.
 */
export function analyzePixels(data: ArrayLike<number>, step = 1): PaletteStats | null {
  const bins: Bin[] = Array.from({ length: HUE_BINS }, () => ({ count: 0, r: 0, g: 0, b: 0 }));
  let sampled = 0;
  let chromatic = 0;
  let satSum = 0;
  const stride = 4 * Math.max(1, Math.floor(step));

  for (let i = 0; i + 3 < data.length; i += stride) {
    if (data[i + 3] < MIN_ALPHA) continue;
    sampled++;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const [h, s, l] = rgbToHsl(r, g, b);
    if (s < 0.2 || l < 0.12 || l > 0.9) continue;
    chromatic++;
    satSum += s;
    const bin = bins[Math.floor(h / (360 / HUE_BINS)) % HUE_BINS];
    bin.count++;
    bin.r += r;
    bin.g += g;
    bin.b += b;
  }

  if (sampled < MIN_SAMPLED_PIXELS) return null;

  const chromaticShare = chromatic / sampled;
  const averageSaturation = chromatic > 0 ? satSum / chromatic : 0;
  const significant = bins.map((b) => chromatic > 0 && b.count / chromatic >= SIGNIFICANT_BIN_SHARE);

  // Gom các ô màu liền kề (vòng tròn) thành cụm.
  const clusters: number[][] = [];
  if (significant.some(Boolean) && !significant.every(Boolean)) {
    const start = significant.findIndex((s, i) => !s && significant[(i + 1) % HUE_BINS]) + 1;
    let current: number[] = [];
    for (let n = 0; n < HUE_BINS; n++) {
      const idx = (start + n) % HUE_BINS;
      if (significant[idx]) current.push(idx);
      else if (current.length) {
        clusters.push(current);
        current = [];
      }
    }
    if (current.length) clusters.push(current);
  } else if (significant.every(Boolean)) {
    clusters.push(bins.map((_, i) => i));
  }

  const colors: PaletteColor[] = clusters
    .map((idxs) => {
      const count = idxs.reduce((s, i) => s + bins[i].count, 0);
      const r = idxs.reduce((s, i) => s + bins[i].r, 0) / count;
      const g = idxs.reduce((s, i) => s + bins[i].g, 0) / count;
      const b = idxs.reduce((s, i) => s + bins[i].b, 0) / count;
      const hue = circularMean(idxs.map((i) => ({ hue: (i + 0.5) * (360 / HUE_BINS), weight: bins[i].count })));
      return { hex: toHex(r, g, b), hue: Math.round(hue), share: Math.round((count / chromatic) * 100) / 100 };
    })
    .sort((a, b) => b.share - a.share);

  const { harmony, score } = classifyHarmony(
    colors.map((c) => c.hue),
    chromaticShare,
    averageSaturation,
  );

  return {
    sampledPixels: sampled,
    colors,
    hueClusters: colors.length,
    chromaticShare: Math.round(chromaticShare * 100) / 100,
    averageSaturation: Math.round(averageSaturation * 100) / 100,
    harmony,
    harmonyScore: score,
  };
}

/**
 * (Chỉ chạy trên trình duyệt) Tải ảnh avatar qua image optimizer của Next (cùng origin
 * nên canvas đọc được pixel) rồi phân tích. Lỗi → null, kết quả sẽ được đánh dấu thiếu dữ liệu.
 */
export async function extractPaletteFromImage(imageUrl: string, timeoutMs = 8000): Promise<PaletteStats | null> {
  if (typeof window === "undefined" || !imageUrl) return null;
  try {
    const img = new Image();
    img.decoding = "async";
    await new Promise<void>((resolve, reject) => {
      const timer = window.setTimeout(() => reject(new Error("timeout")), timeoutMs);
      img.onload = () => {
        window.clearTimeout(timer);
        resolve();
      };
      img.onerror = () => {
        window.clearTimeout(timer);
        reject(new Error("load error"));
      };
      img.src = `/_next/image?url=${encodeURIComponent(imageUrl)}&w=256&q=75`;
    });

    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, size, size);
    return analyzePixels(ctx.getImageData(0, 0, size, size).data);
  } catch {
    return null;
  }
}
