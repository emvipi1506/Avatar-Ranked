"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowRight, Search, ShieldCheck, Sparkles } from "lucide-react";
import Alert from "@/components/ui/Alert";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { isValidUsername } from "@/lib/roblox";

const EXAMPLES = ["builderman", "Roblox", "Linkmon99", "KreekCraft"];

export interface ScanEntryProps {
  value: string;
  onValueChange: (value: string) => void;
  onSubmit: (username: string) => void;
  loading?: boolean;
  error?: string | null;
}

export default function ScanEntry({
  value,
  onValueChange,
  onSubmit,
  loading = false,
  error,
}: ScanEntryProps) {
  const [touched, setTouched] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const trimmed = value.trim();
  const formatInvalid = touched && trimmed.length > 0 && !isValidUsername(trimmed);
  const empty = touched && trimmed.length === 0;
  const invalid = formatInvalid || empty;

  useEffect(() => {
    if (!error) return;
    inputRef.current?.focus();
  }, [error]);

  const helper = formatInvalid
    ? "Username hợp lệ gồm 3–20 ký tự: chữ, số hoặc dấu gạch dưới."
    : empty
      ? "Nhập username để bắt đầu."
      : "Chỉ đọc dữ liệu công khai từ Roblox API. Không lưu mật khẩu, không đăng nhập.";

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTouched(true);
    if (loading || !isValidUsername(trimmed)) {
      inputRef.current?.focus();
      return;
    }
    onSubmit(trimmed);
  };

  const pickExample = (name: string) => {
    if (loading) return;
    setTouched(false);
    onValueChange(name);
    onSubmit(name);
  };

  const errorVariant = error?.toLowerCase().includes("giới hạn") ? "warning" : "danger";

  return (
    <div className="nb-section relative overflow-hidden">
      <div aria-hidden className="cyber-grid pointer-events-none absolute inset-0 opacity-60" />

      <div className="nb-container relative">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="accent">SCAN WORKSPACE</Badge>
          <h2 className="mt-5 font-sans text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
            Nhập username Roblox
          </h2>
          <p className="mx-auto mt-4 max-w-[54ch] text-sm leading-relaxed text-slate-400 sm:text-base">
            Tôi sẽ soi avatar của bạn, chấm điểm và nói thật. Không cần đăng nhập, không lưu mật
            khẩu.
          </p>
        </div>

        <Card className="mx-auto mt-8 max-w-2xl" padding="lg">
          <form onSubmit={submit} noValidate>
            <label
              htmlFor="username-input"
              className="font-mono text-[length:var(--fs-xs)] font-bold uppercase tracking-[0.08em] text-ink"
            >
              Roblox username
            </label>

            <div className="mt-2 flex flex-col gap-3 sm:flex-row">
              <div className="min-w-0 flex-1">
                <Input
                  ref={inputRef}
                  id="username-input"
                  name="username"
                  type="text"
                  value={value}
                  onChange={(event) => onValueChange(event.target.value)}
                  onBlur={() => setTouched(true)}
                  placeholder="ví dụ: builderman"
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  maxLength={20}
                  disabled={loading}
                  invalid={invalid}
                  prefix="@"
                  aria-describedby={`username-help${error ? " username-error" : ""}`}
                />
              </div>
              <Button
                type="submit"
                size="lg"
                loading={loading}
                disabled={!trimmed}
                iconLeft={!loading ? <Search className="h-5 w-5" aria-hidden /> : undefined}
                className="sm:shrink-0"
              >
                {loading ? "Đang tìm..." : "Quét & chấm điểm"}
              </Button>
            </div>

            <p
              id="username-help"
              className={`mt-2.5 text-sm leading-[1.5] ${invalid ? "font-semibold text-danger" : "text-muted"}`}
            >
              {helper}
            </p>

            {error && (
              <div id="username-error" className="mt-4">
                <Alert variant={errorVariant} title="Chưa quét được avatar">
                  {error}
                </Alert>
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
              <span className="font-mono text-[length:var(--fs-2xs)] font-bold uppercase tracking-[0.06em] text-muted">
                Thử nhanh:
              </span>
              {EXAMPLES.map((name) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => pickExample(name)}
                  disabled={loading}
                  className="inline-flex min-h-9 items-center rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-xs font-bold text-ink transition-colors hover:border-[rgba(70,200,255,0.45)] hover:text-cyan disabled:cursor-not-allowed disabled:opacity-50"
                >
                  @{name}
                </button>
              ))}
            </div>
          </form>
        </Card>

        <p className="mt-4 flex items-center justify-center gap-2 font-mono text-[length:var(--fs-2xs)] font-bold uppercase tracking-[0.05em] text-muted">
          <ShieldCheck className="h-4 w-4 text-success" aria-hidden />
          Chỉ đọc dữ liệu công khai. Không yêu cầu quyền tài khoản.
        </p>

        <div className="mx-auto mt-10 grid max-w-4xl gap-5 md:grid-cols-2">
          <Card variant="mint">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-mint" aria-hidden />
              <h2 className="font-sans text-lg font-black uppercase leading-none text-white">
                Cách hoạt động
              </h2>
            </div>
            <ol className="mt-5 space-y-4">
              {[
                "Nhập username và xem trước avatar.",
                "Chọn gu cá nhân nếu muốn — hoặc để hệ thống chấm 100%.",
                "Nhận verdict, điểm /10 và báo cáo chi tiết.",
              ].map((step, index) => (
                <li key={step} className="flex items-start gap-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-[rgba(112,227,182,0.35)] bg-[rgba(112,227,182,0.12)] font-mono text-xs font-bold text-mint">
                    {index + 1}
                  </span>
                  <span className="text-sm font-semibold leading-[1.5] text-ink-2">{step}</span>
                </li>
              ))}
            </ol>
          </Card>

          <Card>
            <p className="font-mono text-[length:var(--fs-2xs)] font-bold uppercase tracking-[0.08em] text-[#FF007F]">
              Minh bạch
            </p>
            <h2 className="mt-1 font-sans text-lg font-black uppercase leading-tight text-white">
              Không phải AI, không phải trò may rủi
            </h2>
            <p className="mt-2 text-sm leading-[1.6] text-ink-2">
              Hệ thống chấm rule-based từ metadata vật phẩm, tên item, catalog và bảng màu pixel
              của avatar. Kết quả mang tính giải trí, không phải đánh giá chính thức của Roblox.
            </p>
            <a
              href="/#faq"
              className="mt-3 inline-flex items-center gap-1 font-mono text-xs font-bold uppercase tracking-[0.04em] text-cyan underline-offset-4 hover:underline"
            >
              Đọc FAQ
              <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </a>
          </Card>
        </div>
      </div>
    </div>
  );
}
