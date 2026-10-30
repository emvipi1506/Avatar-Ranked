import { NextResponse } from "next/server";
import { parseLiveScan } from "@/lib/live";
import { clearLiveEntries, getLiveSnapshot, recordLiveEntry } from "@/lib/liveStore";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

/** Chặn website khác gọi POST/DELETE bằng trình duyệt của người dùng. */
function isTrustedWrite(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === request.headers.get("host");
  } catch {
    return false;
  }
}

export async function GET() {
  try {
    const snapshot = await getLiveSnapshot();
    return NextResponse.json(
      { ...snapshot, total: snapshot.entries.length },
      { headers: NO_STORE },
    );
  } catch (error) {
    console.error("[live] Không đọc được bảng live:", error);
    return NextResponse.json(
      { error: "Không đọc được bảng live." },
      { status: 500, headers: NO_STORE },
    );
  }
}

export async function POST(request: Request) {
  if (!isTrustedWrite(request)) {
    return NextResponse.json(
      { error: "Nguồn gửi không hợp lệ." },
      { status: 403, headers: NO_STORE },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Body phải là JSON hợp lệ." },
      { status: 400, headers: NO_STORE },
    );
  }

  const parsed = parseLiveScan(body);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400, headers: NO_STORE });
  }

  try {
    const result = await recordLiveEntry(parsed.entry);
    return NextResponse.json(result, { headers: NO_STORE });
  } catch (error) {
    console.error("[live] Không ghi được bảng live:", error);
    return NextResponse.json(
      { error: "Không lưu được bảng live." },
      { status: 500, headers: NO_STORE },
    );
  }
}

export async function DELETE(request: Request) {
  if (!isTrustedWrite(request)) {
    return NextResponse.json(
      { error: "Nguồn gửi không hợp lệ." },
      { status: 403, headers: NO_STORE },
    );
  }

  try {
    const snapshot = await clearLiveEntries();
    return NextResponse.json(
      { ok: true, ...snapshot, total: 0 },
      { headers: NO_STORE },
    );
  } catch (error) {
    console.error("[live] Không xóa được bảng live:", error);
    return NextResponse.json(
      { error: "Không xóa được bảng live." },
      { status: 500, headers: NO_STORE },
    );
  }
}
