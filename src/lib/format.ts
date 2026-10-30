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

/**
 * Thời gian tương đối, tiếng Việt. Mốc từ 7 ngày trở lên dùng dd/mm/yyyy
 * để không phụ thuộc locale của môi trường chạy test.
 */
export function formatRelativeTime(timestamp: number, now = Date.now()): string {
  if (!Number.isFinite(timestamp)) return "";

  const diff = now - timestamp;
  if (diff < 60_000) return "vừa xong";

  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return `${minutes} phút trước`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ngày trước`;

  const date = new Date(timestamp);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}`;
}
