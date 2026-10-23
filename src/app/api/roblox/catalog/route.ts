import { NextResponse, type NextRequest } from "next/server";
import { fetchCatalogSummary, uniqueAssetIds } from "@/lib/catalog";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json().catch(() => ({}))) as { assetIds?: unknown };
    if (!Array.isArray(body.assetIds)) {
      return NextResponse.json({ error: "assetIds phải là một mảng ID số." }, { status: 400 });
    }

    const ids = uniqueAssetIds(body.assetIds.map((v) => Number(v)));
    if (ids.length === 0) {
      return NextResponse.json({ items: [], fetchedAt: new Date().toISOString() });
    }

    // Giới hạn tối đa 50 vật phẩm trong 1 lần scan để tránh lạm dụng
    const limitedIds = ids.slice(0, 50);
    const summary = await fetchCatalogSummary(limitedIds);

    return NextResponse.json(summary, {
      headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Lỗi khi gọi catalog Roblox.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
