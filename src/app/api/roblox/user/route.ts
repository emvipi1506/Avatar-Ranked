import { NextResponse } from "next/server";
import { describeError, getUserByUsername, isValidUsername } from "@/lib/roblox";

/** POST { username } -> RobloxUser */
export async function POST(request: Request) {
  let username: unknown;
  try {
    ({ username } = (await request.json()) as { username?: unknown });
  } catch {
    return NextResponse.json({ error: "Body phải là JSON hợp lệ." }, { status: 400 });
  }

  if (typeof username !== "string" || !isValidUsername(username.trim())) {
    return NextResponse.json(
      { error: "Username gồm 3–20 ký tự: chữ, số hoặc dấu gạch dưới." },
      { status: 400 },
    );
  }

  try {
    const user = await getUserByUsername(username.trim());
    if (!user) {
      return NextResponse.json({ error: `Không tìm thấy người chơi "${username.trim()}".` }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (err) {
    const { status, message } = describeError(err);
    return NextResponse.json({ error: message }, { status });
  }
}
