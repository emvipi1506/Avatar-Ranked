"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ScanLine, Search, ShieldCheck, Sparkles, Trophy } from "lucide-react";
import { isValidUsername } from "@/lib/roblox";
import { soundManager } from "@/lib/sound";

const EXAMPLES = ["builderman", "Roblox", "Linkmon99", "KreekCraft"];

const STATS = [
  { icon: ScanLine, label: "270 aesthetics", value: "đối chiếu catalog" },
  { icon: Trophy, label: "6 bậc rarity", value: "Common → Mythical" },
  { icon: ShieldCheck, label: "100% công khai", value: "không cần đăng nhập" },
];

export default function LandingHero() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [touched, setTouched] = useState(false);
  const [pending, setPending] = useState(false);

  const trimmed = value.trim();
  const invalid = touched && trimmed.length > 0 && !isValidUsername(trimmed);
  const empty = touched && trimmed.length === 0;

  const go = (username: string) => {
    if (pending) return;
    setPending(true);
    soundManager.playClick();
    router.push(`/scan?u=${encodeURIComponent(username)}`);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched(true);
    if (!isValidUsername(trimmed)) return;
    go(trimmed);
  };

  const handlePickExample = (name: string) => {
    if (pending) return;
    setValue(name);
    setTouched(false);
    go(name);
  };

  return (
    <section className="relative overflow-hidden pb-12 pt-14 sm:pb-20 sm:pt-20">
      <div aria-hidden className="cyber-grid pointer-events-none absolute inset-0" />

      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-10 h-[350px] w-[500px] max-w-full -translate-x-1/2 rounded-full bg-[#46C8FF]/15 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-1/4 top-32 h-[300px] w-[400px] rounded-full bg-[#A855F7]/15 blur-[120px]"
      />

      <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#46C8FF]/30 bg-[#101528]/80 px-4 py-1.5 shadow-[0_0_15px_rgba(70,200,255,0.2)]">
          <Sparkles className="h-3.5 w-3.5 animate-pulse text-[#46C8FF]" aria-hidden />
          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-300 sm:text-xs">
            Your avatar. Your rarity. Your legend.
          </span>
        </div>

        <h1 className="mx-auto mt-6 max-w-[16ch] font-sans text-[clamp(2.1rem,9vw,4.5rem)] font-black uppercase leading-[0.95] tracking-tight text-white">
          How rare is your
          <br />
          <span className="text-neon-title">Roblox avatar?</span>
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-lg">
          Nhập username Roblox và khám phá độ hiếm avatar của bạn. Hệ thống phân tích trang phục, phụ kiện,
          bảng màu và gu thẩm mỹ để hé lộ cấp bậc từ Common đến Mythical.
        </p>

        <form onSubmit={handleSubmit} noValidate className="mx-auto mt-9 w-full max-w-2xl">
          <label htmlFor="hero-username" className="sr-only">
            Username Roblox
          </label>

          <div
            className={`relative flex items-center rounded-2xl border bg-[#101528]/90 p-2 shadow-2xl backdrop-blur-xl transition duration-300 focus-within:border-[#46C8FF] focus-within:shadow-[0_0_30px_rgba(70,200,255,0.35)] ${
              invalid || empty
                ? "border-rose-500/80 shadow-[0_0_20px_rgba(244,63,94,0.3)]"
                : "border-white/15"
            }`}
          >
            <span aria-hidden className="pl-3 pr-1 font-mono text-lg font-bold text-[#46C8FF]">
              @
            </span>
            <input
              id="hero-username"
              type="text"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              onBlur={() => setTouched(true)}
              placeholder="Nhập Roblox username (ví dụ: builderman)..."
              autoComplete="off"
              autoCapitalize="off"
              spellCheck={false}
              maxLength={20}
              disabled={pending}
              aria-invalid={invalid || empty}
              aria-describedby="hero-username-hint"
              className="min-w-0 flex-1 bg-transparent px-2 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none disabled:opacity-50 sm:text-base"
            />

            <button
              type="submit"
              disabled={pending || !trimmed}
              className="btn-gaming-primary inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-extrabold uppercase tracking-wide text-white disabled:cursor-not-allowed disabled:opacity-40 sm:px-5 sm:text-sm"
            >
              {pending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Search className="h-4 w-4" aria-hidden />
              )}
              <span className="hidden sm:inline">{pending ? "Đang mở..." : "Tìm avatar"}</span>
              <span className="sm:hidden">{pending ? "..." : "Tìm"}</span>
            </button>
          </div>

          <p
            id="hero-username-hint"
            className={`mt-3 min-h-5 text-center text-xs font-medium sm:text-sm ${
              invalid || empty ? "text-rose-400" : "text-slate-400"
            }`}
          >
            {invalid || empty
              ? "Username hợp lệ gồm 3–20 ký tự (chữ, số hoặc gạch dưới)."
              : "An toàn 100%: chỉ truy vấn dữ liệu công khai từ Roblox API, không yêu cầu mật khẩu."}
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
            <span className="flex items-center gap-1 font-mono uppercase tracking-wider text-slate-500">
              <Sparkles className="h-3 w-3 text-[#46C8FF]" aria-hidden /> Thử nhanh:
            </span>
            {EXAMPLES.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => handlePickExample(name)}
                disabled={pending}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-medium text-slate-300 transition hover:border-[#46C8FF]/50 hover:bg-[#46C8FF]/10 hover:text-white disabled:opacity-40"
              >
                @{name}
              </button>
            ))}
          </div>
        </form>

        <div className="mx-auto mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
          {STATS.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="glass-card flex items-center gap-3 rounded-2xl px-4 py-3 text-left"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 bg-[#080A12]">
                  <Icon className="h-4 w-4 text-[#46C8FF]" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-mono text-[11px] font-bold uppercase tracking-[0.06em] text-white">
                    {stat.label}
                  </span>
                  <span className="mt-0.5 block truncate text-[11px] text-slate-400">{stat.value}</span>
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
