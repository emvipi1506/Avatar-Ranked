import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getAvatarThumbnail } from "@/lib/roblox";

function thumbnailResponse(state: string, imageUrl: string | null = null) {
  return new Response(JSON.stringify({ data: [{ targetId: 1, state, imageUrl }] }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

describe("getAvatarThumbnail", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("hỏi lại khi Roblox còn Pending rồi trả ảnh", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(thumbnailResponse("Pending"))
      .mockResolvedValueOnce(thumbnailResponse("Completed", "https://tr.rbxcdn.com/a.png"));
    vi.stubGlobal("fetch", fetchMock);

    const promise = getAvatarThumbnail(1);
    await vi.advanceTimersByTimeAsync(1000);

    await expect(promise).resolves.toBe("https://tr.rbxcdn.com/a.png");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("trả null ngay với avatar bị chặn, không thử lại", async () => {
    const fetchMock = vi.fn().mockResolvedValue(thumbnailResponse("Blocked"));
    vi.stubGlobal("fetch", fetchMock);

    await expect(getAvatarThumbnail(1)).resolves.toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("thử lại khi Roblox lỗi tạm thời", async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce(thumbnailResponse("Completed", "https://tr.rbxcdn.com/b.png"));
    vi.stubGlobal("fetch", fetchMock);

    const promise = getAvatarThumbnail(1);
    await vi.advanceTimersByTimeAsync(1000);

    await expect(promise).resolves.toBe("https://tr.rbxcdn.com/b.png");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("bỏ cuộc sau 4 lần vẫn Pending", async () => {
    const fetchMock = vi.fn().mockImplementation(() => Promise.resolve(thumbnailResponse("Pending")));
    vi.stubGlobal("fetch", fetchMock);

    const promise = getAvatarThumbnail(1);
    await vi.advanceTimersByTimeAsync(4000);

    await expect(promise).resolves.toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });
});
