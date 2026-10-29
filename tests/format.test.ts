import { describe, it, expect } from "vitest";
import { clampScore, formatScore10, formatScore100, scoreAriaLabel } from "@/lib/format";

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
