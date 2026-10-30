import { Film, Globe, Sparkles, Tag } from "lucide-react";
import Accordion from "@/components/ui/Accordion";
import { cn } from "@/lib/cn";
import type { Confidence, ScoreReport } from "@/types";

const CONFIDENCE_TEXT: Record<Confidence, string> = {
  high: "cao",
  medium: "vừa",
  low: "thấp",
};

export interface StyleTagsPanelProps {
  report: ScoreReport;
  className?: string;
}

export default function StyleTagsPanel({ report, className }: StyleTagsPanelProps) {
  const aestheticTags = report.categorizedTags?.aestheticTags ?? [];
  const fandomTags = report.categorizedTags?.fandomTags ?? [];
  const categoryTags = report.categorizedTags?.categoryTags ?? [];
  const cosplayTags = report.categorizedTags?.cosplayTags ?? [];
  const total = aestheticTags.length + fandomTags.length + categoryTags.length + cosplayTags.length;

  return (
    <Accordion
      id="style-tags"
      title="Style tags"
      eyebrow={`Phong cách & fandom · ${total} tag`}
      icon={<Tag className="h-5 w-5 text-coral-ink" aria-hidden />}
      className={className}
    >
      <div className="space-y-5">
        <section aria-labelledby="aesthetic-tags-title">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4
              id="aesthetic-tags-title"
              className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-[0.06em] text-ink"
            >
              <Sparkles className="h-3.5 w-3.5 text-coral-ink" aria-hidden />
              Aesthetic tags ({aestheticTags.length})
            </h4>
            {report.dominantStyle && (
              <span className="font-mono text-[10px] font-bold uppercase tracking-[0.04em] text-muted">
                Nổi bật: {report.dominantStyle.label}
              </span>
            )}
          </div>

          {aestheticTags.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {aestheticTags.map((tag) => {
                const onAccent = tag.isPrimary || tag.isSecondary;

                return (
                  <span
                    key={tag.id}
                    className={cn(
                      "inline-flex max-w-full items-center gap-1.5 rounded-nb-sm border-2 border-ink px-2.5 py-1.5 text-xs font-semibold",
                      tag.isPrimary
                        ? "bg-lemon text-on-accent shadow-hard-1"
                        : tag.isSecondary
                          ? "bg-violet text-on-accent"
                          : "bg-surface-2 text-ink",
                    )}
                  >
                    <span className="truncate">{tag.name}</span>
                    {tag.isPrimary && (
                      <span className="rounded-[3px] bg-ink px-1 py-0.5 font-mono text-[8px] font-bold uppercase text-cream">
                        Primary
                      </span>
                    )}
                    {tag.isSecondary && (
                      <span className="rounded-[3px] border border-ink bg-surface px-1 py-0.5 font-mono text-[8px] font-bold uppercase text-ink">
                        Secondary
                      </span>
                    )}
                    <span
                      className={cn(
                        "font-mono text-[9px] font-bold uppercase",
                        onAccent ? "text-on-accent-2" : "text-muted",
                      )}
                    >
                      {CONFIDENCE_TEXT[tag.confidence]}
                    </span>
                  </span>
                );
              })}
            </div>
          ) : (
            <p className="mt-2 text-sm italic leading-[1.6] text-muted">
              Trang phục tự do, chưa xác định aesthetic nổi trội.
            </p>
          )}
        </section>

        <div className="grid gap-5 border-t-2 border-line-soft pt-4 sm:grid-cols-2">
          <section aria-labelledby="fandom-tags-title">
            <h4
              id="fandom-tags-title"
              className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-[0.06em] text-ink"
            >
              <Film className="h-3.5 w-3.5 text-coral-ink" aria-hidden />
              Fandom tags ({fandomTags.length})
            </h4>
            {fandomTags.length > 0 ? (
              <ul className="mt-3 flex flex-wrap gap-2">
                {fandomTags.map((tag, index) => (
                  <li
                    key={`${tag.franchise}-${index}`}
                    className="inline-flex items-center gap-1.5 rounded-nb-sm border-2 border-ink bg-info-bg px-2.5 py-1.5 text-xs font-semibold text-ink"
                  >
                    <Globe className="h-3 w-3 shrink-0" aria-hidden />
                    <span>{tag.franchise}</span>
                    {tag.franchiseType && (
                      <span className="font-mono text-[9px] font-bold uppercase text-muted">
                        {tag.franchiseType}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm italic leading-[1.6] text-muted">
                Không thuộc fandom hay series thương mại nào.
              </p>
            )}
          </section>

          <section aria-labelledby="category-tags-title">
            <h4
              id="category-tags-title"
              className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-[0.06em] text-ink"
            >
              <Sparkles className="h-3.5 w-3.5 text-coral-ink" aria-hidden />
              Category tags ({categoryTags.length})
            </h4>
            {categoryTags.length > 0 ? (
              <ul className="mt-3 flex flex-wrap gap-2">
                {categoryTags.map((tag, index) => (
                  <li
                    key={`${tag.name}-${index}`}
                    className="inline-flex max-w-full items-center gap-1.5 rounded-nb-sm border-2 border-ink bg-warning-bg px-2.5 py-1.5 text-xs font-semibold text-ink"
                  >
                    <span>{tag.name}</span>
                    {tag.evidence[0] && (
                      <span className="truncate font-mono text-[9px] font-normal text-muted">
                        {tag.evidence[0]}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm italic leading-[1.6] text-muted">
                Avatar thiết kế chuẩn mực, không thuộc danh mục đặc biệt.
              </p>
            )}
          </section>
        </div>

        {cosplayTags.length > 0 && (
          <p className="rounded-nb-sm border-2 border-dashed border-line-soft px-3 py-2 text-xs leading-[1.5] text-ink-2">
            Có {cosplayTags.length} tag cosplay. Chi tiết nhận diện nằm ở panel Cosplay bên dưới.
          </p>
        )}
      </div>
    </Accordion>
  );
}
