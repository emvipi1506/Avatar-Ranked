import { ArrowUpRight, Sparkles, TrendingUp } from "lucide-react";
import Accordion from "@/components/ui/Accordion";
import type { ScoreReport } from "@/types";

export interface ImprovementPanelProps {
  report: ScoreReport;
  className?: string;
}

export default function ImprovementPanel({ report, className }: ImprovementPanelProps) {
  const { strengths, weaknesses, outfitRecommendations, nextTier, mythicalAdvice } = report;

  return (
    <Accordion
      id="improvement"
      title="Cách lên bậc"
      eyebrow={
        nextTier ? `Cần thêm ~${nextTier.pointsNeeded} điểm tới ${nextTier.target}` : "Điểm mạnh & gợi ý"
      }
      icon={<TrendingUp className="h-5 w-5 text-coral-ink" aria-hidden />}
      className={className}
    >
      <div className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <section
            aria-labelledby="strengths-title"
            className="rounded-nb-sm border-2 border-ink bg-success-bg px-3 py-2.5"
          >
            <h4
              id="strengths-title"
              className="font-mono text-xs font-bold uppercase tracking-[0.06em] text-success"
            >
              Điểm mạnh
            </h4>
            {strengths.length > 0 ? (
              <ul className="mt-2 space-y-1.5 text-sm leading-[1.55] text-ink-2">
                {strengths.map((item, index) => (
                  <li key={`strength-${index}`} className="flex items-start gap-2">
                    <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-success" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm italic text-muted">
                Chưa có tiêu chí nào đạt mức xuất sắc vượt trội.
              </p>
            )}
          </section>

          <section
            aria-labelledby="weaknesses-title"
            className="rounded-nb-sm border-2 border-ink bg-warning-bg px-3 py-2.5"
          >
            <h4
              id="weaknesses-title"
              className="font-mono text-xs font-bold uppercase tracking-[0.06em] text-warning"
            >
              Cần cải thiện
            </h4>
            {weaknesses.length > 0 ? (
              <ul className="mt-2 space-y-1.5 text-sm leading-[1.55] text-ink-2">
                {weaknesses.map((item, index) => (
                  <li key={`weakness-${index}`} className="flex items-start gap-2">
                    <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-warning" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm italic text-muted">
                Các tiêu chí đang ở mức ổn định hoặc tốt.
              </p>
            )}
          </section>
        </div>

        {outfitRecommendations.length > 0 && (
          <section aria-labelledby="outfit-title" className="border-t-2 border-line-soft pt-4">
            <h4
              id="outfit-title"
              className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-[0.06em] text-ink"
            >
              <Sparkles className="h-3.5 w-3.5 text-coral-ink" aria-hidden />
              Gợi ý nâng cấp outfit
            </h4>
            <ul className="mt-2 space-y-1.5 text-sm leading-[1.55] text-ink-2">
              {outfitRecommendations.map((item, index) => (
                <li key={`outfit-${index}`} className="flex items-start gap-2">
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-coral" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {nextTier && (
          <section
            aria-labelledby="next-tier-title"
            className="rounded-nb-sm border-2 border-ink bg-info-bg px-3 py-2.5"
          >
            <h4
              id="next-tier-title"
              className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-[0.06em] text-info"
            >
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
              Lên {nextTier.target} · cần thêm ~{nextTier.pointsNeeded} điểm
            </h4>
            <ol className="mt-2 space-y-1.5 text-sm leading-[1.55] text-ink-2">
              {nextTier.steps.map((step, index) => (
                <li key={`next-${index}`} className="flex items-start gap-2">
                  <span className="shrink-0 font-mono font-bold text-info">{index + 1}.</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </section>
        )}

        {mythicalAdvice.length > 0 && (
          <section aria-labelledby="mythical-title" className="border-t-2 border-line-soft pt-4">
            <h4
              id="mythical-title"
              className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-[0.06em] text-ink"
            >
              <Sparkles className="h-3.5 w-3.5 text-coral-ink" aria-hidden />
              Điều kiện chạm MYTHICAL
            </h4>
            <ul className="mt-2 space-y-1.5 text-sm leading-[1.55] text-ink-2">
              {mythicalAdvice.map((item, index) => (
                <li key={`mythical-${index}`} className="flex items-start gap-2">
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-coral" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </Accordion>
  );
}
