import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  Globe,
  Sparkles,
} from "lucide-react";
import Accordion from "@/components/ui/Accordion";
import Badge, { type BadgeVariant } from "@/components/ui/Badge";
import type { CosplayRecognitionResult } from "@/types";

type Status = CosplayRecognitionResult["identificationStatus"];

const STATUS_META: Record<Status, { label: string; variant: BadgeVariant }> = {
  confirmed: { label: "Đã xác nhận", variant: "mint" },
  likely: { label: "Khả năng cao", variant: "cyan" },
  possible: { label: "Có thể", variant: "lemon" },
  unconfirmed: { label: "Chưa xác nhận", variant: "neutral" },
  unknown: { label: "Chưa rõ", variant: "neutral" },
};

export interface CosplayPanelProps {
  cosplayResult: CosplayRecognitionResult | null | undefined;
  className?: string;
}

export default function CosplayPanel({ cosplayResult, className }: CosplayPanelProps) {
  const status = cosplayResult?.identificationStatus ?? "unknown";
  const statusMeta = STATUS_META[status] ?? STATUS_META.unknown;
  const hasCosplay = Boolean(cosplayResult?.characterName || cosplayResult?.isCosplay);
  const confidence = Math.round((cosplayResult?.confidence ?? 0) * 100);

  return (
    <Accordion
      id="cosplay"
      title="Cosplay recognition"
      eyebrow="Nhận diện nhân vật & fandom"
      icon={<Sparkles className="h-5 w-5 text-coral-ink" aria-hidden />}
      className={className}
    >
      {!cosplayResult || !hasCosplay ? (
        <div className="space-y-2 text-sm leading-[1.6] text-ink-2">
          <p className="font-semibold text-ink">Không có dấu hiệu cosplay nhân vật cụ thể.</p>
          <p>
            Hệ thống không tự gán nhân vật khi thiếu phụ kiện đặc thù như tóc, vũ khí hoặc trang
            phục nhận diện.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="font-display text-lg font-extrabold uppercase leading-none text-ink">
              {cosplayResult.characterName}
            </h4>
            <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-nb-sm border-2 border-ink bg-surface-2 px-3 py-2">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.05em] text-muted">
                Nhân vật
              </p>
              <p className="mt-0.5 text-sm font-bold text-ink">
                {cosplayResult.characterName ?? "Chưa xác định"}
              </p>
            </div>
            <div className="rounded-nb-sm border-2 border-ink bg-surface-2 px-3 py-2">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.05em] text-muted">
                Fandom / Series
              </p>
              <p className="mt-0.5 text-sm font-bold text-ink">
                {cosplayResult.franchiseName ?? "Chưa xác định"}
                {cosplayResult.franchiseType && (
                  <span className="ml-1 font-mono text-[10px] font-normal text-muted">
                    ({cosplayResult.franchiseType})
                  </span>
                )}
              </p>
            </div>
            <div className="rounded-nb-sm border-2 border-ink bg-lemon px-3 py-2 text-on-accent">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.05em] text-on-accent-2">
                Độ tin cậy
              </p>
              <p className="mt-0.5 font-mono text-sm font-bold text-on-accent">{confidence}%</p>
            </div>
          </div>

          {cosplayResult.explanation && (
            <p className="rounded-nb-sm border-2 border-dashed border-line-soft px-3 py-2.5 text-sm italic leading-[1.6] text-ink-2">
              &ldquo;{cosplayResult.explanation}&rdquo;
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <section aria-labelledby="cosplay-matching-title">
              <h5
                id="cosplay-matching-title"
                className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-[0.06em] text-success"
              >
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                Vật phẩm khớp ({cosplayResult.matchingItems?.length ?? 0})
              </h5>
              {cosplayResult.matchingItems?.length ? (
                <ul className="mt-2 space-y-1.5 text-sm leading-[1.5] text-ink-2">
                  {cosplayResult.matchingItems.map((item, index) => (
                    <li key={`matching-${index}`} className="flex items-start gap-2">
                      <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-success" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm italic text-muted">Không có vật phẩm khớp tên trực tiếp.</p>
              )}
            </section>

            <section aria-labelledby="cosplay-visual-title">
              <h5
                id="cosplay-visual-title"
                className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-[0.06em] text-info"
              >
                <Eye className="h-3.5 w-3.5" aria-hidden />
                Bằng chứng hình ảnh ({cosplayResult.visualEvidence?.length ?? 0})
              </h5>
              {cosplayResult.visualEvidence?.length ? (
                <ul className="mt-2 space-y-1.5 text-sm leading-[1.5] text-ink-2">
                  {cosplayResult.visualEvidence.map((item, index) => (
                    <li key={`visual-${index}`} className="flex items-start gap-2">
                      <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-info" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm italic text-muted">Chưa có dữ liệu hình ảnh bổ sung.</p>
              )}
            </section>
          </div>

          {(cosplayResult.unmatchedFeatures?.length > 0 ||
            cosplayResult.contradictingEvidence?.length > 0) && (
            <section
              aria-labelledby="cosplay-mismatch-title"
              className="rounded-nb-sm border-2 border-ink bg-warning-bg px-3 py-2.5"
            >
              <h5
                id="cosplay-mismatch-title"
                className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-[0.06em] text-warning"
              >
                <AlertTriangle className="h-3.5 w-3.5" aria-hidden />
                Điểm chưa khớp
              </h5>
              <ul className="mt-2 space-y-1 text-sm leading-[1.5] text-ink-2">
                {cosplayResult.unmatchedFeatures?.map((item, index) => (
                  <li key={`unmatched-${index}`}>{item}</li>
                ))}
                {cosplayResult.contradictingEvidence?.map((item, index) => (
                  <li key={`contradicting-${index}`}>{item}</li>
                ))}
              </ul>
            </section>
          )}

          {cosplayResult.alternativeHypotheses?.length > 0 && (
            <section aria-labelledby="cosplay-alt-title">
              <h5
                id="cosplay-alt-title"
                className="font-mono text-xs font-bold uppercase tracking-[0.06em] text-ink"
              >
                Giả thuyết khác
              </h5>
              <ul className="mt-2 space-y-1.5 text-sm leading-[1.5] text-ink-2">
                {cosplayResult.alternativeHypotheses.map((item, index) => (
                  <li key={`alt-${index}`}>
                    <span className="font-semibold text-ink">
                      {item.characterName} ({item.franchiseName})
                    </span>{" "}
                    — {Math.round(item.confidence * 100)}% · {item.rationale}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {cosplayResult.searchSources?.length > 0 && (
            <section aria-labelledby="cosplay-source-title">
              <h5
                id="cosplay-source-title"
                className="flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-[0.06em] text-ink"
              >
                <Globe className="h-3.5 w-3.5" aria-hidden />
                Nguồn đối chiếu
              </h5>
              <ul className="mt-2 space-y-2">
                {cosplayResult.searchSources.map((source, index) => (
                  <li
                    key={`source-${index}`}
                    className="rounded-nb-sm border-2 border-line-soft px-3 py-2 text-xs leading-[1.5] text-ink-2"
                  >
                    <p className="font-semibold text-ink">{source.title}</p>
                    <p className="mt-0.5">{source.supports}</p>
                    <p className="mt-0.5 font-mono text-[10px] text-muted">Query: {source.query}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </Accordion>
  );
}
