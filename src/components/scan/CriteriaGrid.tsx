import { Coins, Heart, Palette, Smile, Sparkles } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { formatScore100 } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { Confidence, CriterionKey, ScoreReport } from "@/types";

const CRITERIA: {
  key: CriterionKey;
  accent: string;
  icon: typeof Palette;
}[] = [
  { key: "theme", accent: "var(--c-violet)", icon: Palette },
  { key: "uniqueness", accent: "var(--c-coral)", icon: Sparkles },
  { key: "humor", accent: "var(--c-lemon)", icon: Smile },
  { key: "value", accent: "var(--c-mint)", icon: Coins },
  { key: "personal", accent: "var(--c-cyan)", icon: Heart },
];

const CONFIDENCE_LABEL: Record<Confidence, string> = {
  high: "Tin cậy cao",
  medium: "Tin cậy vừa",
  low: "Tin cậy thấp",
};

export interface CriteriaGridProps {
  report: ScoreReport;
  className?: string;
}

export default function CriteriaGrid({ report, className }: CriteriaGridProps) {
  return (
    <section aria-labelledby="criteria-title" className={className}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[length:var(--fs-xs)] font-bold uppercase tracking-[0.1em] text-coral-ink">
            Score breakdown
          </p>
          <h3
            id="criteria-title"
            className="mt-1 font-display text-xl font-extrabold uppercase leading-none tracking-[-0.01em] text-ink"
          >
            Bốn tiêu chí hệ thống
          </h3>
        </div>
        <Badge variant="lemon">{formatScore100(report.aiScore)}/100 hệ thống</Badge>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {CRITERIA.map(({ key, accent, icon: Icon }) => {
          const criterion = report.criteria[key];
          const isPersonal = key === "personal";
          const unselected = isPersonal && criterion.score === null;
          const score = criterion.score;
          const percent = score ?? 0;

          return (
            <article
              key={key}
              className={cn(
                "rounded-nb-md border-3 border-ink bg-surface p-4 shadow-hard-2",
                isPersonal && "md:col-span-2",
              )}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2">
                  <span
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-nb-sm border-2 border-ink"
                    style={{ backgroundColor: accent }}
                  >
                    <Icon className="h-4 w-4 text-on-accent" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <h4 className="font-body text-sm font-bold leading-tight text-ink">
                      {criterion.labelVi}
                    </h4>
                    <p className="font-mono text-[10px] font-bold uppercase tracking-[0.05em] text-muted">
                      Trọng số {Math.round(criterion.weight * 100)}% · {CONFIDENCE_LABEL[criterion.confidence]}
                    </p>
                  </div>
                </div>

                <p className="shrink-0 font-mono text-sm font-bold tabular-nums text-ink">
                  {unselected ? "Chưa chọn" : `${formatScore100(percent)}/100`}
                </p>
              </div>

              <div
                role="progressbar"
                aria-label={`${criterion.labelVi}: ${unselected ? "chưa chọn" : `${formatScore100(percent)} trên 100`}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={unselected ? undefined : Math.round(percent)}
                className={cn(
                  "mt-3 h-3 w-full rounded-[4px] border-2 border-ink p-[1px]",
                  unselected ? "border-dashed bg-surface-2" : "bg-surface-2",
                )}
              >
                {!unselected && (
                  <div
                    className="h-full rounded-[2px]"
                    style={{ width: `${percent}%`, backgroundColor: accent }}
                  />
                )}
              </div>

              <p className="mt-3 text-sm leading-[1.6] text-ink-2">{criterion.summary}</p>

              {unselected && (
                <p className="mt-2 rounded-nb-sm border-2 border-dashed border-line-soft px-2.5 py-2 text-xs leading-[1.5] text-muted">
                  Chưa chọn gu — điểm tổng hiện tính 100% từ hệ thống. Chọn một nấc ở panel Gu cá
                  nhân để bật trọng số 25%.
                </p>
              )}

              {criterion.evidence.length > 0 && (
                <details className="group mt-3 border-t-2 border-line-soft pt-2.5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.05em] text-ink-2 [&::-webkit-details-marker]:hidden">
                    <span>Bằng chứng ({criterion.evidence.length})</span>
                    <span className="transition-transform duration-200 group-open:rotate-45" aria-hidden>
                      +
                    </span>
                  </summary>
                  <ul className="mt-2 space-y-1.5 text-xs leading-[1.55] text-ink-2">
                    {criterion.evidence.map((item, index) => (
                      <li key={`${key}-${index}`} className="flex items-start gap-2">
                        <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-ink" aria-hidden />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </article>
          );
        })}
      </div>

      <p className="mt-4 font-mono text-[length:var(--fs-2xs)] font-bold uppercase tracking-[0.05em] text-muted">
        Chưa chọn gu: 100% hệ thống. Đã chọn: 75% hệ thống + 25% gu cá nhân.
      </p>
    </section>
  );
}
