export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "avatar-ranked-theme";

/** Site đã cố định dark theo giao diện cũ; giữ type để không phá API cũ. */
export const THEME_COLORS: Record<Theme, string> = {
  light: "#07080f",
  dark: "#07080f",
};

/** Chạy trước khi paint để luôn vào giao diện tối, không nháy theme. */
export const THEME_INIT_SCRIPT = `(function(){try{document.documentElement.dataset.theme="dark";document.documentElement.style.colorScheme="dark";}catch(e){}})();`;

export function getSystemTheme(): Theme {
  return "dark";
}

export function getStoredTheme(): Theme | null {
  return null;
}

/** Theme đang hiển thị — site luôn dark. */
export function getActiveTheme(): Theme {
  return "dark";
}

export function syncThemeColor(theme: Theme = "dark"): void {
  if (typeof document === "undefined") return;
  document
    .querySelectorAll('meta[name="theme-color"]')
    .forEach((meta) => meta.setAttribute("content", THEME_COLORS[theme]));
}

export function applyTheme(theme: Theme = "dark"): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  syncThemeColor(theme);
}

/** Giữ lại để code cũ không vỡ; site không còn chuyển sang light. */
export function setThemePreference(theme: Theme = "dark"): void {
  applyTheme(theme);
}
