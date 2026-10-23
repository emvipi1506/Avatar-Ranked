import type { CatalogItemInfo, CatalogPriceStatus, CatalogSummary } from "@/types";

const CATALOG_DETAILS_URL = "https://catalog.roblox.com/v1/catalog/items/details";
const BATCH_SIZE = 100;
const LIMITED_RESTRICTIONS = new Set(["Limited", "LimitedUnique", "Collectible"]);

/** Dạng thô (một phần) của phần tử trong response catalog/items/details. */
export interface RawCatalogItem {
  id: number;
  price?: number | null;
  priceStatus?: string | null;
  isOffSale?: boolean | null;
  itemRestrictions?: string[] | null;
  favoriteCount?: number | null;
}

/**
 * Phân loại trạng thái giá của một vật phẩm. Không bao giờ suy đoán giá:
 * - Limited/Collectible bị loại vì trường `price` là giá gốc, không phải giá thị trường.
 * - Off-sale bị loại dù `price` vẫn còn giá trị cũ.
 * - Không có giá → "no-price" (khác với "free").
 */
export function classifyCatalogItem(raw: RawCatalogItem | undefined, id: number): CatalogItemInfo {
  if (!raw) {
    return { id, status: "unverified", price: null, favoriteCount: null, restrictions: [] };
  }

  const restrictions = Array.isArray(raw.itemRestrictions) ? raw.itemRestrictions : [];
  const favoriteCount = typeof raw.favoriteCount === "number" ? raw.favoriteCount : null;
  const base = { id, favoriteCount, restrictions };
  const priceStatus = (raw.priceStatus ?? "").toLowerCase();

  let status: CatalogPriceStatus;
  let price: number | null = null;

  if (restrictions.some((r) => LIMITED_RESTRICTIONS.has(r))) {
    status = "limited";
  } else if (raw.isOffSale === true || priceStatus === "off sale" || priceStatus === "not for sale") {
    status = "offsale";
  } else if (priceStatus === "free" || raw.price === 0) {
    status = "free";
    price = 0;
  } else if (typeof raw.price === "number" && Number.isFinite(raw.price) && raw.price > 0) {
    status = "priced";
    price = raw.price;
  } else {
    status = "no-price";
  }

  return { ...base, status, price };
}

/** Bỏ ID trùng và ID không hợp lệ, giữ thứ tự xuất hiện. */
export function uniqueAssetIds(ids: readonly number[]): number[] {
  const seen = new Set<number>();
  const out: number[] = [];
  for (const id of ids) {
    if (Number.isSafeInteger(id) && id > 0 && !seen.has(id)) {
      seen.add(id);
      out.push(id);
    }
  }
  return out;
}

export class CatalogApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "CatalogApiError";
  }
}

async function postDetails(ids: number[], csrfToken: string | null): Promise<Response> {
  return fetch(CATALOG_DETAILS_URL, {
    method: "POST",
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(csrfToken ? { "x-csrf-token": csrfToken } : {}),
    },
    body: JSON.stringify({ items: ids.map((id) => ({ itemType: "Asset", id })) }),
  });
}

/**
 * Gọi catalog Roblox (server-side). Endpoint yêu cầu CSRF token: lần gọi đầu trả 403 kèm
 * header x-csrf-token, sau đó gọi lại với token đó.
 */
export async function fetchCatalogSummary(rawIds: readonly number[]): Promise<CatalogSummary> {
  const ids = uniqueAssetIds(rawIds);
  const byId = new Map<number, RawCatalogItem>();
  let csrfToken: string | null = null;

  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const batch = ids.slice(i, i + BATCH_SIZE);
    let res = await postDetails(batch, csrfToken);
    if (res.status === 403 && res.headers.get("x-csrf-token")) {
      csrfToken = res.headers.get("x-csrf-token");
      res = await postDetails(batch, csrfToken);
    }
    if (!res.ok) throw new CatalogApiError(`Catalog API ${res.status}`, res.status);
    const json = (await res.json()) as { data?: RawCatalogItem[] };
    for (const item of json.data ?? []) {
      if (typeof item?.id === "number") byId.set(item.id, item);
    }
  }

  return {
    items: ids.map((id) => classifyCatalogItem(byId.get(id), id)),
    fetchedAt: new Date().toISOString(),
  };
}
