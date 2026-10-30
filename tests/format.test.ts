import { describe, it, expect } from "vitest";
import {
  clampScore,
  formatRelativeTime,
  formatScore10,
  formatScore100,
  scoreAriaLabel,
} from "@/lib/format";

describe("Score formatting", () => {
  it("formatScore10 trả về một chữ số thập phân trên thang 10", () => {
    expect(formatScore10(85)).toBe("8.5");
    expect(formatScore10(100)).toBe("10.0");
    expect(formatScore10(0)).toBe("0.0");
  });

  it("clamp và fallback an toàn cho NaN/Infinity/out of range", () => {
    expect(clampScore(-10)).toBe(0);
    expect(clampScore(110)).toBe(100);
    expect(clampScore(Number.NaN)).toBe(0);
    expect(clampScore(Number.POSITIVE_INFINITY)).toBe(0);
    expect(formatScore10(Number.NaN)).toBe("0.0");
  });

  it("formatScore100 giữ tối đa 2 chữ số thập phân", () => {
    expect(formatScore100(85)).toBe("85");
    expect(formatScore100(85.456)).toBe("85.46");
    expect(formatScore100(Number.NaN)).toBe("0");
  });

  it("scoreAriaLabel đọc được cả thang 100 và thang 10", () => {
    expect(scoreAriaLabel(85)).toBe("85 trên 100, tương đương 8.5 trên 10");
  });
});

describe("Relative time", () => {
  const now = new Date(2026, 9, 30, 12, 0, 0).getTime();

  it("hiển thị mốc thời gian ngắn bằng tiếng Việt", () => {
    expect(formatRelativeTime(now - 30_000, now)).toBe("vừa xong");
    expect(formatRelativeTime(now - 5 * 60_000, now)).toBe("5 phút trước");
    expect(formatRelativeTime(now - 3 * 3_600_000, now)).toBe("3 giờ trước");
    expect(formatRelativeTime(now - 2 * 86_400_000, now)).toBe("2 ngày trước");
  });

  it("dùng dd/mm/yyyy từ 7 ngày trở lên", () => {
    const old = new Date(2026, 8, 1, 12, 0, 0).getTime();
    expect(formatRelativeTime(old, now)).toBe("01/09/2026");
  });

  it("không trả về thời gian âm cho mốc ở tương lai", () => {
    expect(formatRelativeTime(now + 60_000, now)).toBe("vừa xong");
  });
});
