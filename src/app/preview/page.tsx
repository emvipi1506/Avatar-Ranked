import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Check,
  Copy,
  Heart,
  Sparkles,
  VolumeX,
  Zap,
} from "lucide-react";
import Alert from "@/components/ui/Alert";
import Badge from "@/components/ui/Badge";
import Button, { buttonClasses } from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ProgressBar from "@/components/ui/ProgressBar";
import ScoreDisplay from "@/components/ui/ScoreDisplay";
import SectionHeading from "@/components/ui/SectionHeading";
import SpeechBubble from "@/components/ui/SpeechBubble";
import Stamp from "@/components/ui/Stamp";
import { mockReport, mockUser } from "@/lib/fixtures/mockReport";
import { TIER_ORDER } from "@/lib/rarity";

const COLOR_TOKENS = [
  { name: "bg", value: "var(--c-bg)", note: "Page" },
  { name: "surface", value: "var(--c-surface)", note: "Card" },
  { name: "surface-2", value: "var(--c-surface-2)", note: "Track / chip" },
  { name: "ink", value: "var(--c-ink)", note: "Text / border" },
  { name: "lemon", value: "var(--c-lemon)", note: "Avatar / highlight" },
  { name: "coral", value: "var(--c-coral)", note: "CTA / roast" },
  { name: "mint", value: "var(--c-mint)", note: "Verdict / praise" },
  { name: "violet", value: "var(--c-violet)", note: "Tag" },
  { name: "cyan", value: "var(--c-cyan)", note: "Tip" },
  { name: "danger", value: "var(--c-danger)", note: "Error text" },
  { name: "warning", value: "var(--c-warning)", note: "Warning text" },
  { name: "success", value: "var(--c-success)", note: "Success text" },
];

const SHADOWS = [
  { name: "hard-1", className: "shadow-hard-1" },
  { name: "hard-2", className: "shadow-hard-2" },
  { name: "hard-3", className: "shadow-hard-3" },
  { name: "hard-4", className: "shadow-hard-4" },
];

const TICKER = ["ROAST", "RATE", "RANK", "REPEAT"];

export default function PreviewPage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b-3 border-ink bg-cream">
        <div className="nb-container grid gap-10 py-16 md:grid-cols-[1.15fr_0.85fr] md:items-center md:py-24">
          <div>
            <Badge variant="accent">DESIGN SYSTEM v1</Badge>
            <h1 className="mt-5 max-w-[11ch] font-display text-display-lg font-extrabold uppercase leading-[0.95] tracking-[-0.03em] text-ink">
              Neo-Brutalism, không blur.
            </h1>
            <p className="mt-5 max-w-[56ch] text-lg leading-[1.6] text-ink-2">
              Token, primitive và component contract cho Avatar Ranked. Tất cả dùng hard shadow,
              border ink 3px và bảng màu kem — lemon — coral — mint.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href="/preview/scan" className={buttonClasses({ variant: "primary", size: "lg" })}>
                Xem scan demo
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <a href="#components" className={buttonClasses({ variant: "secondary", size: "lg" })}>
                Bộ component
              </a>
            </div>
            <p className="mt-4 font-mono text-[length:var(--fs-2xs)] font-bold uppercase tracking-[0.08em] text-muted">
              Preview nội bộ • Không index • Chưa thay route chính
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-sm">
            <Card variant="lemon" padding="md" rotate={-2} className="relative">
              <div className="nb-checkerboard relative overflow-hidden rounded-nb-sm border-3 border-ink p-3">
                <div className="mx-auto flex h-52 w-40 items-center justify-center rounded-nb-sm border-3 border-ink bg-surface p-1">
                  <Image
                    src="/samples/avatar-blocky.svg"
                    alt={`Avatar minh họa của ${mockUser.displayName}`}
                    width={160}
                    height={227}
                    unoptimized
                    priority
                    className="h-full w-auto object-contain"
                  />
                </div>
                <div className="mt-3 flex items-center justify-between gap-2 rounded-nb-sm border-2 border-ink bg-surface px-2 py-1.5">
                  <span className="font-mono text-[10px] font-bold text-ink">@{mockUser.name}</span>
                  <Badge tier={mockReport.rarity.tier}>{mockReport.rarity.label}</Badge>
                </div>
              </div>
              <div className="mt-5 flex items-end justify-between gap-3">
                <ScoreDisplay score={mockReport.total} label="KẾT QUẢ MẪU" />
                <Stamp label="DRIP OVERFLOW" tone="roast" size="sm" rotation={6} />
              </div>
            </Card>
            <span className="absolute -left-4 -top-4 rotate-[-8deg] rounded-nb-sm border-2 border-ink bg-mint px-3 py-1.5 font-mono text-[10px] font-bold uppercase shadow-hard-1">
              100% dữ liệu công khai
            </span>
          </div>
        </div>
      </section>

      {/* Ticker */}
      <div className="nb-marquee overflow-hidden border-b-3 border-ink bg-lemon py-3" aria-label="Roast, rate, rank, repeat">
        <div className="nb-marquee-track">
          {[0, 1].map((copy) => (
            <div key={copy} aria-hidden={copy === 1} className="flex shrink-0 items-center">
              {TICKER.map((word) => (
                <span
                  key={`${copy}-${word}`}
                  className="mx-5 flex items-center gap-5 font-display text-xl font-extrabold uppercase tracking-[-0.02em] text-ink"
                >
                  {word}
                  <Sparkles className="h-4 w-4" aria-hidden />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Tokens */}
      <section id="tokens" className="nb-section border-b-3 border-ink">
        <div className="nb-container">
          <SectionHeading
            eyebrow="01 — Tokens"
            title="Màu, chữ, shadow"
            description="Raw hex chỉ tồn tại trong tokens.css. Component chỉ dùng biến semantic."
          />

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {COLOR_TOKENS.map((color) => (
              <div key={color.name} className="rounded-nb-md border-3 border-ink bg-surface shadow-hard-2">
                <div className="h-20 rounded-t-[12px] border-b-3 border-ink" style={{ background: color.value }} />
                <div className="p-3">
                  <p className="font-mono text-xs font-bold text-ink">--c-{color.name}</p>
                  <p className="mt-0.5 text-xs text-muted">{color.note}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-2">
            <Card>
              <p className="font-mono text-[length:var(--fs-xs)] font-bold uppercase tracking-[0.1em] text-coral-ink">
                Type scale
              </p>
              <p className="mt-3 font-display text-display-lg font-extrabold uppercase leading-[0.95] tracking-[-0.03em]">
                Drip check
              </p>
              <p className="mt-3 font-display text-display-md font-extrabold uppercase leading-none tracking-[-0.02em]">
                Avatar Ranked
              </p>
              <p className="mt-3 text-[length:var(--fs-lg)] leading-[1.55] text-ink-2">
                Be Vietnam Pro cho body tiếng Việt. Bricolage Grotesque cho display. JetBrains Mono
                cho score và username.
              </p>
              <p className="mt-3 rounded-nb-sm border-2 border-ink bg-surface-2 p-3 font-mono text-sm font-bold">
                @builderman • 8.5/10 • LEGENDARY
              </p>
            </Card>

            <Card>
              <p className="font-mono text-[length:var(--fs-xs)] font-bold uppercase tracking-[0.1em] text-coral-ink">
                Hard shadows
              </p>
              <div className="mt-4 grid grid-cols-2 gap-4">
                {SHADOWS.map((shadow) => (
                  <div
                    key={shadow.name}
                    className={`grid h-20 place-items-center rounded-nb-md border-3 border-ink bg-surface font-mono text-xs font-bold ${shadow.className}`}
                  >
                    {shadow.name}
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm leading-[1.6] text-muted">
                Không blur, không glow, không backdrop-filter. Hover nâng -2px và tăng shadow;
                active lún +2px và giảm shadow.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Components */}
      <section id="components" className="nb-section border-b-3 border-ink bg-surface-2">
        <div className="nb-container">
          <SectionHeading
            eyebrow="02 — Components"
            title="Primitive đã sẵn sàng"
            description="Mỗi component có states rõ ràng: default, hover, active, focus, disabled, loading."
          />

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            <Card>
              <h3 className="font-display text-xl font-extrabold uppercase">Buttons</h3>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button variant="primary" iconRight={<Zap className="h-4 w-4" aria-hidden />}>
                  Chấm avatar
                </Button>
                <Button variant="accent">Accent</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="danger">Danger</Button>
                <Button variant="primary" loading>
                  Đang quét
                </Button>
                <Button variant="primary" disabled>
                  Disabled
                </Button>
              </div>
              <div className="mt-4 flex flex-wrap items-end gap-3">
                <Button size="sm">Size sm</Button>
                <Button size="md">Size md</Button>
                <Button size="lg">Size lg</Button>
              </div>
            </Card>

            <Card>
              <h3 className="font-display text-xl font-extrabold uppercase">Badges & stamps</h3>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Badge>Neutral</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="accent">Accent</Badge>
                {TIER_ORDER.map((tier) => (
                  <Badge key={tier} tier={tier}>
                    {tier}
                  </Badge>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-4">
                <Stamp label="Approved" tone="praise" size="sm" rotation={-6} />
                <Stamp label="Drip overflow" tone="roast" size="sm" rotation={5} />
                <Stamp label="Hall of fame" tone="legendary" size="sm" rotation={-4} />
              </div>
            </Card>

            <Card>
              <h3 className="font-display text-xl font-extrabold uppercase">Speech bubbles</h3>
              <div className="mt-4 space-y-7">
                <SpeechBubble tone="praise" speaker="Hệ thống khen" icon={<Sparkles className="h-3.5 w-3.5 text-success" aria-hidden />}>
                  Outfit này có chủ đích. Tôi hơi sợ.
                </SpeechBubble>
                <SpeechBubble tone="roast" speaker="Hệ thống roast" tail="right" icon={<Heart className="h-3.5 w-3.5 text-danger" aria-hidden />}>
                  Phối màu như một tai nạn giao thông có chủ đích.
                </SpeechBubble>
                <SpeechBubble tone="tip" speaker="Gợi ý" icon={<Zap className="h-3.5 w-3.5 text-info" aria-hidden />}>
                  Thêm một phụ kiện tối màu là đủ để cứu silhouette.
                </SpeechBubble>
              </div>
            </Card>

            <Card>
              <h3 className="font-display text-xl font-extrabold uppercase">Alerts & progress</h3>
              <div className="mt-4 space-y-4">
                <Alert variant="success" title="Đã copy kết quả">
                  Dán vào Discord hoặc gửi cho hội bạn.
                </Alert>
                <Alert variant="warning" title="Dữ liệu catalog chưa đầy đủ">
                  Điểm Robux có thể thấp hơn thực tế. Các tiêu chí khác vẫn chính xác.
                </Alert>
                <Alert variant="danger" title="Không tìm thấy username">
                  Kiểm tra lại chính tả hoặc thử một username khác.
                </Alert>
                <ProgressBar value={68} label="Đang soi avatar" />
                <ProgressBar value={100} label="Hoàn tất" tone="mint" />
              </div>
            </Card>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
            <Card variant="lemon" rotate={-1}>
              <h3 className="font-display text-xl font-extrabold uppercase">Score display</h3>
              <div className="mt-5 rounded-nb-sm border-3 border-ink bg-surface p-5 shadow-hard-2">
                <ScoreDisplay score={mockReport.total} />
                <div className="mt-3 flex items-center gap-2">
                  <Badge tier="LEGENDARY">LEGENDARY</Badge>
                  <span className="text-sm font-semibold text-ink-2">“Your fit belongs in the hall of fame.”</span>
                </div>
              </div>
              <p className="mt-4 text-sm leading-[1.6] text-ink-2">
                Hiển thị <strong>8.5/10</strong>; breakdown chi tiết vẫn dùng thang <strong>/100</strong>.
              </p>
            </Card>

            <Card>
              <h3 className="font-display text-xl font-extrabold uppercase">Action bar mẫu</h3>
              <div className="mt-4 flex flex-wrap gap-3">
                <Button variant="primary" iconLeft={<Zap className="h-4 w-4" aria-hidden />}>
                  Roast lại
                </Button>
                <Button variant="secondary" iconLeft={<Copy className="h-4 w-4" aria-hidden />}>
                  Copy
                </Button>
                <Button variant="secondary" iconLeft={<Check className="h-4 w-4" aria-hidden />}>
                  Đã copy
                </Button>
                <Button variant="ghost" iconLeft={<VolumeX className="h-4 w-4" aria-hidden />}>
                  Sound off
                </Button>
              </div>
              <p className="mt-4 text-sm leading-[1.6] text-muted">
                Action bar dùng button thật, focus ring 3px, không icon-only nếu thiếu aria-label.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Next */}
      <section className="nb-section">
        <div className="nb-container">
          <div className="grid items-center gap-8 rounded-nb-lg border-3 border-ink bg-coral p-6 shadow-hard-4 md:grid-cols-[1fr_auto] md:p-10">
            <div>
              <p className="font-mono text-[length:var(--fs-xs)] font-bold uppercase tracking-[0.1em] text-ink">
                Phase 1 gate
              </p>
              <h2 className="mt-2 font-display text-display-sm font-extrabold uppercase leading-none tracking-[-0.02em] text-ink">
                Tokens + primitives + /preview đã dựng.
              </h2>
              <p className="mt-3 max-w-[60ch] text-base leading-[1.6] text-ink">
                Tiếp theo: landing page tại <code className="font-mono font-bold">/</code> và scan
                workspace tại <code className="font-mono font-bold">/scan</code>, sau đó QA và swap route.
              </p>
            </div>
            <Link href="/preview/scan" className={buttonClasses({ variant: "accent", size: "lg" })}>
              Mở scan demo
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
