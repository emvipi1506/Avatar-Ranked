export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "avatar-ranked-theme";

export const THEME_COLORS: Record<Theme, string> = {
  light: "#FFFDF5",
  dark: "#0B0B0D",
};

/** Chạy trước khi paint để tránh nháy theme khi tải trang. */
export const THEME_INIT_SCRIPT = `(function(){try{var key="${THEME_STORAGE_KEY}";var stored=window.localStorage.getItem(key);var theme=stored==="light"||stored==="dark"?stored:(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");document.documentElement.dataset.theme=theme;document.documentElement.style.colorScheme=theme;}catch(e){}})();`;

export function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function getStoredTheme(): Theme | null {
  if (typeof window === "undefined") return null;
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

/** Theme đang hiển thị, ưu tiên data-theme đã set bởi script init. */
export function getActiveTheme(): Theme {
  if (typeof document === "undefined") return "light";
  const current = document.documentElement.dataset.theme;
  if (current === "light" || current === "dark") return current;
  return getStoredTheme() ?? getSystemTheme();
}

export function syncThemeColor(theme: Theme): void {
  if (typeof document === "undefined") return;
  document
    .querySelectorAll('meta[name="theme-color"]')
    .forEach((meta) => meta.setAttribute("content", THEME_COLORS[theme]));
}

export function applyTheme(theme: Theme): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  syncThemeColor(theme);
}

/** Lưu lựa chọn của người dùng rồi áp dụng ngay. */
export function setThemePreference(theme: Theme): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Trình duyệt chặn storage: vẫn đổi theme cho phiên hiện tại.
  }
  applyTheme(theme);
}
