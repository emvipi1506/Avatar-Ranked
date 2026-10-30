import Link from "next/link";
import { ArrowLeft, Search, Sparkles, Zap } from "lucide-react";
import Badge from "@/components/ui/Badge";
import Button, { buttonClasses } from "@/components/ui/Button";
import Card from "@/components/ui/Card";

const EXAMPLES = ["builderman", "Roblox", "Linkmon99", "KreekCraft"];

export default function PreviewScanPage() {
  return (
    <div className="nb-section">
      <div className="nb-container">
        <Link
          href="/preview"
          className="inline-flex items-center gap-2 font-mono text-[length:var(--fs-xs)] font-bold uppercase tracking-[0.06em] text-ink-2 underline-offset-4 hover:text-ink hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Về design preview
        </Link>

        <div className="mt-8 grid items-start gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <Badge variant="accent">SCAN WORKSPACE — PHASE 2</Badge>
            <h1 className="mt-5 max-w-[12ch] font-display text-display-lg font-extrabold uppercase leading-[0.95] tracking-[-0.03em] text-ink">
              Nhập username Roblox
            </h1>
            <p className="mt-4 max-w-[54ch] text-lg leading-[1.6] text-ink-2">
              Tôi sẽ soi avatar của bạn, chấm điểm và nói thật. Không cần đăng nhập.
            </p>

            <Card className="mt-8" padding="lg">
              <label
                htmlFor="preview-username"
                className="font-mono text-[length:var(--fs-xs)] font-bold uppercase tracking-[0.08em] text-ink"
              >
                Roblox username
              </label>
              <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                <div className="relative min-w-0 flex-1">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-mono text-lg font-bold text-muted">
                    @
                  </span>
                  <input
                    id="preview-username"
                    name="username"
                    type="text"
                    maxLength={20}
                    autoComplete="off"
                    spellCheck={false}
                    placeholder="ví dụ: builderman"
                    aria-describedby="preview-username-help"
                    className="h-14 w-full rounded-nb-md border-3 border-ink bg-surface px-4 pl-11 text-base font-semibold text-ink shadow-hard-2 outline-none placeholder:text-muted focus:shadow-hard-3"
                  />
                </div>
                <Button size="lg" iconLeft={<Search className="h-5 w-5" aria-hidden />} className="sm:shrink-0">
                  Quét & chấm điểm
                </Button>
              </div>
              <p id="preview-username-help" className="mt-3 text-sm text-muted">
                Chỉ đọc dữ liệu công khai từ Roblox API. Không lưu mật khẩu, không đăng nhập.
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="font-mono text-[length:var(--fs-2xs)] font-bold uppercase tracking-[0.06em] text-muted">
                  Thử nhanh:
                </span>
                {EXAMPLES.map((name) => (
                  <button
                    key={name}
                    type="button"
                    className="rounded-nb-sm border-2 border-ink bg-surface-2 px-2.5 py-1 font-mono text-xs font-bold text-ink shadow-hard-1 transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5"
                  >
                    @{name}
                  </button>
                ))}
              </div>
            </Card>

            <p className="mt-4 font-mono text-[length:var(--fs-2xs)] font-bold uppercase tracking-[0.06em] text-muted">
              Preview tĩnh — form thật sẽ được nối ở Phase 2.
            </p>
          </div>

          <div className="space-y-6">
            <Card variant="mint" rotate={1}>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" aria-hidden />
                <h2 className="font-display text-xl font-extrabold uppercase">Cách hoạt động</h2>
              </div>
              <ol className="mt-4 space-y-3">
                {["Nhập username", "Hệ thống soi avatar", "Nhận verdict + roast"].map((step, index) => (
                  <li key={step} className="flex items-start gap-3">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-nb-sm border-2 border-ink bg-lemon font-mono text-xs font-bold">
                      {index + 1}
                    </span>
                    <span className="text-sm font-semibold leading-[1.5] text-on-accent">{step}</span>
                  </li>
                ))}
              </ol>
            </Card>

            <Card>
              <h2 className="font-display text-xl font-extrabold uppercase">Personal taste — “Chưa chọn”</h2>
              <p className="mt-2 text-sm leading-[1.6] text-ink-2">
                Mặc định không chọn bậc nào. Điểm tổng = 100% điểm hệ thống. Khi chọn gu, công thức
                chuyển sang 75% AI + 25% gu.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge variant="outline">CHƯA CHỌN</Badge>
                <Badge variant="accent">0% GU</Badge>
                <Badge tier="UNCOMMON">UNCOMMON 15đ</Badge>
                <Badge tier="MYTHICAL">MYTHICAL 100đ</Badge>
              </div>
            </Card>

            <div className="flex flex-wrap gap-3">
              <Link href="/preview" className={buttonClasses({ variant: "secondary", size: "md" })}>
                Quay lại tokens
              </Link>
              <Button variant="primary" size="md" iconLeft={<Zap className="h-4 w-4" aria-hidden />} disabled>
                Nối API ở Phase 2
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
