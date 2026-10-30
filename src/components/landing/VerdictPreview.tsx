import Link from "next/link";
import { ArrowRight, Flame, Sparkles } from "lucide-react";
import AvatarFrame from "@/components/ui/AvatarFrame";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import ScoreDisplay from "@/components/ui/ScoreDisplay";
import SectionHeading from "@/components/ui/SectionHeading";
import SpeechBubble from "@/components/ui/SpeechBubble";
import Stamp from "@/components/ui/Stamp";
import { buttonClasses } from "@/components/ui/Button";
import { mockReport, mockUser } from "@/lib/fixtures/mockReport";
import { getVerdictBubbles, getVerdictView } from "@/lib/ui/verdict";

export default function VerdictPreview() {
  const verdict = getVerdictView(mockReport);
  const bubbles = getVerdictBubbles(mockReport);

  return (
    <section id="ket-qua-mau" className="nb-section border-b border-white/5 bg-transparent">
      <div className="nb-container">
        <SectionHeading
          align="center"
          eyebrow="02 — Kết quả mẫu"
          title="Verdict trông như thế này."
          description="Một điểm tổng /10, một con dấu tier, và ba bubble khen — roast — gợi ý. Chi tiết tiêu chí vẫn dùng thang /100."
        />

        <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="relative" padding="lg">
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-[length:var(--fs-2xs)] font-bold uppercase tracking-[0.1em] text-[#FF007F]">
                Sample report
              </span>
              <Badge tier={mockReport.rarity.tier}>{mockReport.rarity.label}</Badge>
            </div>

            <div className="mt-5 grid gap-5 sm:grid-cols-[200px_1fr] sm:items-start">
              <AvatarFrame
                displayName={mockUser.displayName}
                username={mockUser.name}
                imageUrl={null}
                className="mx-auto w-full max-w-[230px] sm:max-w-none"
                sizes="(max-width: 640px) 60vw, 200px"
              />

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-display text-xl font-extrabold uppercase leading-none tracking-[-0.01em] text-ink">
                    {mockUser.displayName}
                  </h3>
                  <span className="font-mono text-xs font-bold text-muted">@{mockUser.name}</span>
                </div>

                <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
                  <ScoreDisplay score={mockReport.total} label="FINAL VERDICT" />
                  <Stamp label={verdict.stamp} tone="roast" size="sm" rotation={-6} />
                </div>

                <p className="mt-3 border-t border-white/10 pt-3 text-sm italic leading-[1.5] text-ink-2">
                  &ldquo;{verdict.quote}&rdquo;
                </p>

                <dl className="mt-4 grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-white/10 bg-[rgba(8,10,18,0.6)] px-3 py-2">
                    <dt className="font-mono text-[10px] font-bold uppercase tracking-[0.04em] text-muted">
                      Hệ thống
                    </dt>
                    <dd className="mt-0.5 font-mono text-sm font-bold text-ink">{mockReport.aiScore}/100</dd>
                  </div>
                  <div className="rounded-xl border border-[rgba(112,227,182,0.3)] bg-[rgba(112,227,182,0.10)] px-3 py-2">
                    <dt className="font-mono text-[10px] font-bold uppercase tracking-[0.04em] text-[rgba(112,227,182,0.75)]">
                      Gu cá nhân
                    </dt>
                    <dd className="mt-0.5 font-mono text-sm font-bold text-mint">Chưa chọn</dd>
                  </div>
                </dl>
              </div>
            </div>

            <p className="mt-5 rounded-xl border border-dashed border-white/15 px-3 py-2 text-xs leading-[1.5] text-ink-2">
              Kết quả mẫu dùng dữ liệu tĩnh. Avatar thật sẽ được tải từ Roblox CDN khi bạn quét.
            </p>
          </Card>

          <div>
            <div className="space-y-8">
              <SpeechBubble
                tone="praise"
                speaker={bubbles[0].speaker}
                icon={<Sparkles className="h-3.5 w-3.5 text-success" aria-hidden />}
              >
                {bubbles[0].text}
              </SpeechBubble>
              <SpeechBubble
                tone="roast"
                speaker={bubbles[1].speaker}
                tail="right"
                icon={<Flame className="h-3.5 w-3.5 text-danger" aria-hidden />}
              >
                {bubbles[1].text}
              </SpeechBubble>
            </div>

            <Card variant="lemon" rotate={1} className="mt-9 text-ink">
              <p className="font-display text-lg font-extrabold uppercase leading-tight text-ink">
                Muốn biết avatar của bạn bị chấm thế nào?
              </p>
              <p className="mt-2 text-sm leading-[1.6] text-ink-2">
                Nhập username, chọn gu nếu muốn, rồi để hệ thống làm phần còn lại.
              </p>
              <Link
                href="/scan"
                className={buttonClasses({ variant: "primary", size: "md", className: "mt-4" })}
              >
                Chấm avatar của tôi
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
