"use client";

import { useState, type FormEvent } from "react";
import { Search, Loader2, Sparkles, UserCheck } from "lucide-react";
import { isValidUsername } from "@/lib/roblox";
import { soundManager } from "@/lib/sound";

interface UsernameSearchProps {
  onSearch: (username: string) => void;
  loading?: boolean;
  disabled?: boolean;
}

const EXAMPLES = ["builderman", "Roblox", "Linkmon99", "KreekCraft"];

export default function UsernameSearch({
  onSearch,
  loading = false,
  disabled = false,
}: UsernameSearchProps) {
  const [value, setValue] = useState("");
  const [touched, setTouched] = useState(false);

  const trimmed = value.trim();
  const invalid = touched && trimmed.length > 0 && !isValidUsername(trimmed);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setTouched(true);
    if (disabled || loading || !isValidUsername(trimmed)) return;
    soundManager.playClick();
    onSearch(trimmed);
  };

  const handlePickExample = (name: string) => {
    if (disabled || loading) return;
    setValue(name);
    setTouched(false);
    soundManager.playClick();
    onSearch(name);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="mx-auto w-full max-w-xl">
      <label htmlFor="username-input" className="sr-only">
        Username Roblox
      </label>

      {/* Cyber Input Box */}
      <div
        className={`relative flex items-center rounded-2xl border bg-[#101528]/90 p-2 shadow-2xl backdrop-blur-xl transition duration-300 focus-within:border-[#46C8FF] focus-within:shadow-[0_0_30px_rgba(70,200,255,0.35)] ${
          invalid ? "border-rose-500/80 shadow-[0_0_20px_rgba(244,63,94,0.3)]" : "border-white/15"
        }`}
      >
        <span aria-hidden className="pl-3.5 pr-1 font-mono text-lg font-bold text-[#46C8FF]">
          @
        </span>
        <input
          id="username-input"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder="Nhập Roblox username (ví dụ: builderman)..."
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          maxLength={20}
          disabled={disabled || loading}
          aria-invalid={invalid}
          aria-describedby="username-hint"
          className="min-w-0 flex-1 bg-transparent py-3 text-base text-white placeholder:text-slate-500 focus:outline-none disabled:opacity-50"
        />

        <button
          id="find-avatar-btn"
          type="submit"
          disabled={disabled || loading || !trimmed}
          className="btn-gaming-primary inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-extrabold tracking-wide text-white uppercase disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-white" />
              <span>SEARCHING...</span>
            </>
          ) : (
            <>
              <Search className="h-4 w-4 text-white" />
              <span>FIND MY AVATAR</span>
            </>
          )}
        </button>
      </div>

      {/* Gợi ý lỗi hoặc thông điệp bảo mật */}
      <p id="username-hint" className={`mt-3 min-h-5 text-center text-xs font-medium sm:text-sm ${invalid ? "text-rose-400" : "text-slate-400"}`}>
        {invalid
          ? "Username hợp lệ gồm 3–20 ký tự (chữ, số hoặc gạch dưới)."
          : "An toàn 100%: Chỉ truy vấn dữ liệu công khai từ Roblox API, không yêu cầu mật khẩu."}
      </p>

      {/* Các tài khoản mẫu thử nhanh */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
        <span className="flex items-center gap-1 font-mono uppercase tracking-wider text-slate-500">
          <Sparkles className="h-3 w-3 text-[#46C8FF]" /> Thử nhanh:
        </span>
        {EXAMPLES.map((name) => (
          <button
            key={name}
            id={`example-${name.toLowerCase()}`}
            type="button"
            onClick={() => handlePickExample(name)}
            disabled={disabled || loading}
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-medium text-slate-300 transition hover:border-[#46C8FF]/50 hover:bg-[#46C8FF]/10 hover:text-white disabled:opacity-40"
          >
            @{name}
          </button>
        ))}
      </div>
    </form>
  );
}
