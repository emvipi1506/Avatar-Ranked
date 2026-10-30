import { NextResponse, type NextRequest } from "next/server";
import { describeError, getAvatarThumbnail, parseUserId } from "@/lib/roblox";
import type { ThumbnailResponse } from "@/types";

const ALLOWED_SIZES = new Set(["150x150", "420x420", "720x720"]);

/** GET ?userId=&size= -> { userId, imageUrl } */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const userId = parseUserId(params.get("userId"));
  const size = params.get("size") ?? "720x720";

  if (!userId) {
    return NextResponse.json({ error: "userId không hợp lệ." }, { status: 400 });
  }
  if (!ALLOWED_SIZES.has(size)) {
    return NextResponse.json({ error: "Kích thước ảnh không được hỗ trợ." }, { status: 400 });
  }

  try {
    const imageUrl = await getAvatarThumbnail(userId, size);
    const body: ThumbnailResponse = { userId, imageUrl };
    return NextResponse.json(body, {
      // Chỉ cache khi đã có ảnh. Ảnh null thường chỉ là "Pending" tạm thời —
      // cache 5 phút sẽ khiến avatar trống rất lâu dù Roblox đã render xong.
      headers: {
        "Cache-Control": imageUrl
          ? "public, s-maxage=300, stale-while-revalidate=600"
          : "no-store, max-age=0",
      },
    });
  } catch (err) {
    const { status, message } = describeError(err);
    return NextResponse.json(
      { error: message },
      { status, headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  }
}
