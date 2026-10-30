"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import {
  THEME_STORAGE_KEY,
  applyTheme,
  getActiveTheme,
  getStoredTheme,
  getSystemTheme,
  setThemePreference,
  syncThemeColor,
  type Theme,
} from "@/lib/theme";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    const active = getActiveTheme();
    setTheme(active);
    syncThemeColor(active);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystemChange = (event: MediaQueryListEvent) => {
      if (getStoredTheme()) return;
      const next: Theme = event.matches ? "dark" : "light";
      applyTheme(next);
      setTheme(next);
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key !== THEME_STORAGE_KEY) return;
      const next: Theme =
        event.newValue === "light" || event.newValue === "dark"
          ? event.newValue
          : getSystemTheme();
      applyTheme(next);
      setTheme(next);
    };

    media.addEventListener("change", onSystemChange);
    window.addEventListener("storage", onStorage);

    return () => {
      media.removeEventListener("change", onSystemChange);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const toggleTheme = () => {
    const current = getActiveTheme();
    const next: Theme = current === "dark" ? "light" : "dark";
    setThemePreference(next);
    setTheme(next);
  };

  const label =
    theme === null
      ? "Đổi giao diện sáng/tối"
      : theme === "dark"
        ? "Chuyển sang giao diện sáng"
        : "Chuyển sang giao diện tối";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={label}
      aria-pressed={theme === null ? undefined : theme === "dark"}
      title={label}
      className="grid h-11 w-11 shrink-0 place-items-center rounded-nb-sm border-2 border-ink bg-surface text-ink shadow-hard-1 transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5"
    >
      <span className="relative grid h-5 w-5 place-items-center">
        <Sun className="theme-toggle-icon-sun absolute h-5 w-5" aria-hidden />
        <Moon className="theme-toggle-icon-moon absolute h-5 w-5" aria-hidden />
      </span>
    </button>
  );
}
