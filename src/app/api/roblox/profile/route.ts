import { NextResponse, type NextRequest } from "next/server";
import { describeError, getProfile, parseUserId } from "@/lib/roblox";

/** GET ?userId= -> RobloxProfile (thông tin, avatar, bạn bè, follower) */
export async function GET(request: NextRequest) {
  const userId = parseUserId(request.nextUrl.searchParams.get("userId"));
  if (!userId) {
    return NextResponse.json({ error: "userId không hợp lệ." }, { status: 400 });
  }

  try {
    const profile = await getProfile(userId);
    return NextResponse.json(profile, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (err) {
    const { status, message } = describeError(err);
    return NextResponse.json({ error: message }, { status });
  }
}
