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
      headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" },
    });
  } catch (err) {
    const { status, message } = describeError(err);
    return NextResponse.json({ error: message }, { status });
  }
}
