/** Chuẩn hóa điểm 0–100; NaN/Infinity → 0. */
export function clampScore(score: number): number {
  if (!Number.isFinite(score)) return 0;
  return Math.min(100, Math.max(0, score));
}

/** Hiển thị điểm chính dạng `8.5` (từ thang 100). */
export function formatScore10(score: number): string {
  return (clampScore(score) / 10).toFixed(1);
}

/** Hiển thị điểm thang 100, giữ tối đa 2 chữ số thập phân. */
export function formatScore100(score: number): string {
  return String(Math.round(clampScore(score) * 100) / 100);
}

/** Nhãn đọc cho screen reader: "85 trên 100, tương đương 8.5 trên 10". */
export function scoreAriaLabel(score: number): string {
  const safe = clampScore(score);
  return `${formatScore100(safe)} trên 100, tương đương ${formatScore10(safe)} trên 10`;
}
