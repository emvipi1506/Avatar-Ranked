"use client";

import { useEffect } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import AvatarFrame from "@/components/ui/AvatarFrame";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ScoreDisplay from "@/components/ui/ScoreDisplay";
import SpeechBubble from "@/components/ui/SpeechBubble";
import Stamp from "@/components/ui/Stamp";
import { soundManager } from "@/lib/sound";
import { getFormulaLabel, getPersonalLabel, getVerdictBubbles, getVerdictView } from "@/lib/ui/verdict";
import type { RobloxUser, ScoreReport } from "@/types";

export interface VerdictRevealProps {
  user: RobloxUser;
  imageUrl: string | null;
  report: ScoreReport;
  onComplete: () => void;
}

export default function VerdictReveal({ user, imageUrl, report, onComplete }: VerdictRevealProps) {
  const verdict = getVerdictView(report);
  const bubble = getVerdictBubbles(report)[0];

  useEffect(() => {
    soundManager.playRarityReveal(report.rarity.tier);

    if (report.rarity.tier !== "LEGENDARY" && report.rarity.tier !== "MYTHICAL") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    import("canvas-confetti")
      .then(({ default: confetti }) => {
        if (cancelled) return;
        const colors =
          report.rarity.tier === "MYTHICAL"
            ? ["#FF007F", "#B590FF", "#5DE2E7", "#FFE600", "#FFFDF5"]
            : ["#FFE600", "#FF6B4A", "#70E3B6", "#FFFDF5"];

        confetti({ particleCount: 90, spread: 80, origin: { y: 0.62 }, colors });
        if (report.rarity.tier === "MYTHICAL") {
          window.setTimeout(() => {
            if (!cancelled) confetti({ particleCount: 60, spread: 120, origin: { y: 0.5 }, colors });
          }, 320);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [report.rarity.tier]);

  return (
    <section className="nb-section" aria-labelledby="verdict-reveal-title">
      <div className="nb-container max-w-4xl">
        <Card variant="mint" padding="lg" className="relative overflow-hidden">
          <div aria-hidden className="nb-grid-pattern absolute inset-0 opacity-30" />

          <div className="relative flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[length:var(--fs-xs)] font-bold uppercase tracking-[0.12em] text-ink-2">
                Rarity decoded
              </p>
              <h2
                id="verdict-reveal-title"
                tabIndex={-1}
                className="mt-1 max-w-[18ch] font-display text-[length:var(--fs-2xl)] font-extrabold uppercase leading-[0.95] tracking-[-0.02em] text-ink focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-ink"
              >
                Avatar của {user.displayName} đã có verdict.
              </h2>
            </div>
            <Stamp label={verdict.stamp} tone={verdict.tone} size="md" rotation={-7} animate />
          </div>

          <div className="relative mt-7 grid items-center gap-7 md:grid-cols-[250px_1fr]">
            <AvatarFrame
              displayName={user.displayName}
              username={user.name}
              imageUrl={imageUrl}
              priority
              showFallbackChip
              className="mx-auto w-full max-w-[260px]"
              sizes="(max-width: 768px) 70vw, 250px"
            />

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tier={report.rarity.tier}>{report.rarity.label}</Badge>
                <span className="font-mono text-xs font-bold text-ink-2">@{user.name}</span>
              </div>

              <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
                <ScoreDisplay score={report.total} label="ĐIỂM TỔNG" animate />
                <div className="max-w-[240px] text-sm leading-[1.5] text-ink-2">
                  <p className="font-semibold text-ink">{getPersonalLabel(report)}</p>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.04em]">
                    {getFormulaLabel(report)}
                  </p>
                </div>
              </div>

              <p className="mt-3 text-sm italic leading-[1.6] text-ink">
                &ldquo;{verdict.quote}&rdquo;
              </p>
              <p className="mt-2 text-xs leading-[1.5] text-ink-2">
                Điểm chính hiển thị /10. Bảng tiêu chí chi tiết vẫn dùng thang /100.
              </p>

              <div className="mt-5">
                <SpeechBubble
                  tone="praise"
                  speaker={bubble.speaker}
                  icon={<Sparkles className="h-3.5 w-3.5 text-success" aria-hidden />}
                >
                  {bubble.text}
                </SpeechBubble>
              </div>
            </div>
          </div>

          <div className="relative mt-7 flex flex-col gap-3 border-t-2 border-ink pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-mono text-[length:var(--fs-2xs)] font-bold uppercase tracking-[0.05em] text-ink-2">
              {report.strengths.length} điểm mạnh · {report.weaknesses.length} điểm cần cải thiện
            </p>
            <Button
              type="button"
              size="lg"
              onClick={onComplete}
              iconRight={<ArrowRight className="h-4 w-4" aria-hidden />}
            >
              Xem chi tiết kết quả
            </Button>
          </div>
        </Card>
      </div>
    </section>
  );
}
