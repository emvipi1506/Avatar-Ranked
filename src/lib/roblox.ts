import type {
  AvatarAsset,
  AvatarBodyColors,
  AvatarEmote,
  AvatarScales,
  CatalogSummary,
  RobloxProfile,
  RobloxUser,
  ThumbnailResponse,
} from "@/types";

const USERS_API = "https://users.roblox.com";
const AVATAR_API = "https://avatar.roblox.com";
const FRIENDS_API = "https://friends.roblox.com";
const THUMBNAILS_API = "https://thumbnails.roblox.com";

const USERNAME_REGEX = /^[A-Za-z0-9_]{3,20}$/;

export class RobloxApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "RobloxApiError";
  }
}

export function isValidUsername(username: string): boolean {
  return USERNAME_REGEX.test(username);
}

export function parseUserId(value: string | null): number | null {
  if (!value || !/^\d{1,15}$/.test(value)) return null;
  const id = Number(value);
  return id > 0 ? id : null;
}

export function describeError(err: unknown): { status: number; message: string } {
  if (err instanceof RobloxApiError) {
    if (err.status === 429) {
      return { status: 429, message: "Roblox đang giới hạn truy cập, thử lại sau ít phút." };
    }
    if (err.status === 404 || err.status === 400) {
      return { status: 404, message: "Không tìm thấy dữ liệu người chơi." };
    }
    return { status: 502, message: "Không kết nối được tới Roblox, thử lại sau." };
  }
  return { status: 500, message: "Đã có lỗi không mong muốn xảy ra." };
}

async function robloxFetch<T>(url: string, init: RequestInit & { revalidate?: number } = {}): Promise<T> {
  const { revalidate = 60, ...rest } = init;
  const res = await fetch(url, {
    ...rest,
    headers: { Accept: "application/json", "Content-Type": "application/json", ...rest.headers },
    ...(rest.method === "POST" ? { cache: "no-store" } : { next: { revalidate } }),
  });
  if (!res.ok) throw new RobloxApiError(`Roblox API ${res.status}: ${url}`, res.status);
  return (await res.json()) as T;
}

export async function getUserByUsername(username: string): Promise<RobloxUser | null> {
  const data = await robloxFetch<{ data: RobloxUser[] }>(`${USERS_API}/v1/usernames/users`, {
    method: "POST",
    body: JSON.stringify({ usernames: [username], excludeBannedUsers: true }),
  });
  const user = data.data[0];
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    displayName: user.displayName,
    hasVerifiedBadge: user.hasVerifiedBadge,
  };
}

interface UserDetailsResponse {
  id: number;
  name: string;
  displayName: string;
  description: string;
  created: string;
  isBanned: boolean;
  hasVerifiedBadge: boolean;
}

interface AvatarV2Response {
  playerAvatarType: "R6" | "R15";
  assets: AvatarAsset[];
  emotes?: AvatarEmote[];
  scales?: AvatarScales;
  bodyColor3s?: AvatarBodyColors;
  defaultShirtApplied?: boolean;
  defaultPantsApplied?: boolean;
}

async function getCount(url: string): Promise<number> {
  try {
    const data = await robloxFetch<{ count: number }>(url, { revalidate: 300 });
    return data.count ?? 0;
  } catch {
    return 0;
  }
}

export async function getProfile(userId: number): Promise<RobloxProfile> {
  const [details, avatarV2, friendsCount, followersCount, followingCount] = await Promise.all([
    robloxFetch<UserDetailsResponse>(`${USERS_API}/v1/users/${userId}`),
    robloxFetch<AvatarV2Response>(`${AVATAR_API}/v2/avatar/users/${userId}/avatar`),
    getCount(`${FRIENDS_API}/v1/users/${userId}/friends/count`),
    getCount(`${FRIENDS_API}/v1/users/${userId}/followers/count`),
    getCount(`${FRIENDS_API}/v1/users/${userId}/followings/count`),
  ]);

  return {
    id: details.id,
    name: details.name,
    displayName: details.displayName,
    description: details.description,
    created: details.created,
    isBanned: details.isBanned,
    hasVerifiedBadge: details.hasVerifiedBadge,
    friendsCount,
    followersCount,
    followingCount,
    avatar: {
      playerAvatarType: avatarV2.playerAvatarType ?? "R15",
      assets: (avatarV2.assets ?? []).map((a) => ({ id: a.id, name: a.name, assetType: a.assetType })),
      emotes: avatarV2.emotes ?? [],
      scales: avatarV2.scales ?? null,
      bodyColors: avatarV2.bodyColor3s ?? null,
      defaultShirtApplied: Boolean(avatarV2.defaultShirtApplied),
      defaultPantsApplied: Boolean(avatarV2.defaultPantsApplied),
    },
  };
}

interface ThumbnailApiResponse {
  data: { targetId: number; state: string; imageUrl: string | null }[];
}

export async function getAvatarThumbnail(userId: number, size = "720x720"): Promise<string | null> {
  const url = `${THUMBNAILS_API}/v1/users/avatar?userIds=${userId}&size=${size}&format=Png&isCircular=false`;
  for (let attempt = 0; attempt < 3; attempt++) {
    const data = await robloxFetch<ThumbnailApiResponse>(url, { revalidate: attempt === 0 ? 300 : 0 });
    const item = data.data[0];
    if (item?.state === "Completed" && item.imageUrl) return item.imageUrl;
    if (item && item.state !== "Pending") return null;
    await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
  }
  return null;
}

// ---------- Client-side Helper ----------

async function apiRequest<T>(input: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(input, init);
  } catch {
    throw new Error("Không kết nối được tới máy chủ. Kiểm tra mạng rồi thử lại.");
  }
  const data: unknown = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (data as { error?: string }).error ?? "Đã có lỗi xảy ra, thử lại sau.";
    throw new Error(message);
  }
  return data as T;
}

export function lookupUser(username: string): Promise<RobloxUser> {
  return apiRequest<RobloxUser>("/api/roblox/user", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }),
  });
}

export function fetchProfile(userId: number): Promise<RobloxProfile> {
  return apiRequest<RobloxProfile>(`/api/roblox/profile?userId=${userId}`);
}

export async function fetchThumbnail(userId: number): Promise<string | null> {
  try {
    const data = await apiRequest<ThumbnailResponse>(`/api/roblox/thumbnail?userId=${userId}`);
    return data.imageUrl;
  } catch {
    return null;
  }
}

export async function fetchCatalogPrices(assetIds: number[]): Promise<CatalogSummary | null> {
  try {
    return await apiRequest<CatalogSummary>("/api/roblox/catalog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assetIds }),
    });
  } catch {
    return null; // Không thể lấy giá -> trả về null để chấm điểm báo thiếu dữ liệu minh bạch
  }
}
