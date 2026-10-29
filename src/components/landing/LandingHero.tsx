import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap } from "lucide-react";
import AvatarFrame from "@/components/ui/AvatarFrame";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import ScoreDisplay from "@/components/ui/ScoreDisplay";
import Stamp from "@/components/ui/Stamp";
import { buttonClasses } from "@/components/ui/Button";
import { mockReport, mockUser } from "@/lib/fixtures/mockReport";
import { getVerdictView } from "@/lib/ui/verdict";

export default function LandingHero() {
  const verdict = getVerdictView(mockReport);

  return (
    <section className="relative overflow-hidden border-b-3 border-ink bg-cream">
      <div aria-hidden className="nb-dots absolute inset-0" />
      <div className="nb-container relative grid gap-10 py-12 md:grid-cols-[1.08fr_0.92fr] md:items-center md:gap-8 md:py-16 lg:gap-12 lg:py-20">
        <div>
          <Badge variant="accent">ROBLOX AVATAR ROAST &amp; RATE</Badge>

          <h1 className="mt-5 max-w-[12ch] font-display text-[length:var(--fs-3xl)] font-extrabold uppercase leading-[0.95] tracking-[-0.03em] text-ink sm:text-display-lg">
            Avatar của bạn có drip không?
          </h1>

          <p className="mt-5 max-w-[56ch] text-[length:var(--fs-lg)] leading-[1.6] text-ink-2">
            Nhập username Roblox. Nhận điểm, con dấu verdict và một tràng roast (hoặc khen) trong
            vài giây. Không cần đăng nhập, không lưu mật khẩu.
          </p>

          <div className="mt-7 flex flex-col gap-3 lg:flex-row lg:flex-wrap">
            <Link href="/scan" className={buttonClasses({ variant: "primary", size: "lg" })}>
              Chấm avatar của tôi
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <a href="#how-it-works" className={buttonClasses({ variant: "secondary", size: "lg" })}>
              Xem cách hoạt động
            </a>
          </div>

          <p className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[length:var(--fs-2xs)] font-bold uppercase tracking-[0.05em] text-muted">
            <span>Miễn phí</span>
            <span aria-hidden>•</span>
            <span>Không cần đăng nhập</span>
            <span aria-hidden>•</span>
            <span>Chỉ dùng dữ liệu công khai</span>
          </p>

          <div className="mt-7 flex items-start gap-3 rounded-nb-md border-2 border-ink bg-surface px-4 py-3 shadow-hard-1 sm:max-w-md">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden />
            <p className="text-sm leading-[1.5] text-ink-2">
              Hệ thống chấm theo rule-based, đối chiếu catalog và bảng màu thật. Kết quả để giải
              trí, không phải bảng xếp hạng chính thức của Roblox.
            </p>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[420px] lg:max-w-[450px]">
          <span className="absolute -left-3 -top-4 z-10 rotate-[-6deg] rounded-nb-sm border-2 border-ink bg-mint px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-ink shadow-hard-1">
            Kết quả mẫu
          </span>
          <span className="absolute -bottom-4 -right-3 z-10 rotate-[5deg] rounded-nb-sm border-2 border-ink bg-coral px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-ink shadow-hard-1">
            Drip overflow
          </span>

          <Card variant="surface" padding="md" rotate={-2} className="relative">
            <div className="rounded-nb-sm border-3 border-ink bg-surface p-3 shadow-hard-2">
              <AvatarFrame
                displayName={mockUser.displayName}
                username={mockUser.name}
                imageUrl={null}
                priority
                className="mx-auto w-full max-w-[270px]"
                sizes="(max-width: 1024px) 70vw, 270px"
              />
              <div className="mt-3 flex items-center justify-between gap-2 border-t-2 border-ink pt-2.5">
                <span className="truncate font-mono text-xs font-bold text-ink">@{mockUser.name}</span>
                <Badge tier={mockReport.rarity.tier}>{mockReport.rarity.label}</Badge>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
              <ScoreDisplay score={mockReport.total} label="ĐIỂM MẪU" />
              <Stamp label={verdict.stamp} tone="roast" size="sm" rotation={6} />
            </div>

            <p className="mt-3 border-t-2 border-line-soft pt-3 text-sm italic leading-[1.5] text-ink-2">
              &ldquo;{verdict.quote}&rdquo;
            </p>
          </Card>

          <span className="absolute -right-4 top-1/3 z-10 grid h-11 w-11 rotate-12 place-items-center rounded-full border-3 border-ink bg-lemon shadow-hard-1">
            <Zap className="h-5 w-5 text-ink" aria-hidden />
          </span>
        </div>
      </div>
    </section>
  );
}
