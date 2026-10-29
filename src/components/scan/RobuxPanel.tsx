import { Coins } from "lucide-react";
import Accordion from "@/components/ui/Accordion";
import type { ExcludedReason, ValueBreakdown } from "@/types";

const EXCLUDED_LABEL: Record<ExcludedReason, string> = {
  offsale: "Off-sale",
  limited: "Limited",
  "no-price": "Không có giá",
  unverified: "Chưa xác minh",
};

function formatRobux(value: number): string {
  return `R$ ${value.toLocaleString("vi-VN")}`;
}

export interface RobuxPanelProps {
  value: ValueBreakdown;
  className?: string;
}

export default function RobuxPanel({ value, className }: RobuxPanelProps) {
  return (
    <Accordion
      id="robux"
      title="Giá trị Robux"
      eyebrow={`Catalog · ${formatRobux(value.totalRobux)}`}
      icon={<Coins className="h-5 w-5 text-coral-ink" aria-hidden />}
      className={className}
    >
      {!value.available ? (
        <p className="rounded-nb-sm border-2 border-ink bg-warning-bg px-3 py-2.5 text-sm font-semibold leading-[1.6] text-warning">
          Không lấy được giá catalog. Điểm giá trị tạm tính 0 và đã được ghi nhận trong cảnh báo
          chất lượng dữ liệu.
        </p>
      ) : (
        <div className="space-y-5">
          <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="rounded-nb-sm border-2 border-ink bg-lemon px-3 py-2">
              <dt className="font-mono text-[10px] font-bold uppercase tracking-[0.04em] text-ink-2">
                Tổng giá
              </dt>
              <dd className="mt-0.5 font-mono text-sm font-bold text-ink">
                {formatRobux(value.totalRobux)}
              </dd>
            </div>
            <div className="rounded-nb-sm border-2 border-ink bg-surface-2 px-3 py-2">
              <dt className="font-mono text-[10px] font-bold uppercase tracking-[0.04em] text-muted">
                Điểm tính
              </dt>
              <dd className="mt-0.5 font-mono text-sm font-bold text-ink">
                {formatRobux(value.scoredRobux)}
              </dd>
            </div>
            <div className="rounded-nb-sm border-2 border-ink bg-surface-2 px-3 py-2">
              <dt className="font-mono text-[10px] font-bold uppercase tracking-[0.04em] text-muted">
                Độ phủ
              </dt>
              <dd className="mt-0.5 font-mono text-sm font-bold text-ink">
                {Math.round(value.coverage * 100)}%
              </dd>
            </div>
            <div className="rounded-nb-sm border-2 border-ink bg-surface-2 px-3 py-2">
              <dt className="font-mono text-[10px] font-bold uppercase tracking-[0.04em] text-muted">
                Vật phẩm
              </dt>
              <dd className="mt-0.5 font-mono text-sm font-bold text-ink">
                {value.pricedCount} có giá · {value.freeCount} free
              </dd>
            </div>
          </dl>

          <section aria-labelledby="robux-priced-title">
            <h4
              id="robux-priced-title"
              className="font-mono text-xs font-bold uppercase tracking-[0.06em] text-ink"
            >
              Đang mở bán ({value.priced.length})
            </h4>
            {value.priced.length > 0 ? (
              <ul className="mt-2 max-h-56 space-y-1.5 overflow-y-auto pr-1">
                {value.priced.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-3 rounded-nb-sm border-2 border-line-soft bg-surface-2 px-2.5 py-1.5 text-xs"
                  >
                    <span className="min-w-0 truncate font-semibold text-ink">{item.name}</span>
                    <span className="shrink-0 font-mono font-bold text-ink">{formatRobux(item.price)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm italic text-muted">Không có vật phẩm tính phí đang mở bán.</p>
            )}
          </section>

          {value.excluded.length > 0 && (
            <section aria-labelledby="robux-excluded-title" className="border-t-2 border-line-soft pt-4">
              <h4
                id="robux-excluded-title"
                className="font-mono text-xs font-bold uppercase tracking-[0.06em] text-ink"
              >
                Loại khỏi tính giá ({value.excluded.length})
              </h4>
              <ul className="mt-2 max-h-40 space-y-1.5 overflow-y-auto pr-1">
                {value.excluded.map((item, index) => (
                  <li
                    key={`${item.id}-${index}`}
                    className="flex items-center justify-between gap-3 rounded-nb-sm border-2 border-line-soft px-2.5 py-1.5 text-xs"
                  >
                    <span className="min-w-0 truncate text-ink-2">{item.name}</span>
                    <span className="shrink-0 font-mono text-[10px] font-bold uppercase text-muted">
                      {EXCLUDED_LABEL[item.reason]}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <p className="font-mono text-[length:var(--fs-2xs)] font-bold uppercase tracking-[0.04em] text-muted">
            Giá catalog chỉ mang tính tham khảo tại thời điểm quét. Item limited hoặc off-sale có
            thể không được quy đổi.
          </p>
        </div>
      )}
    </Accordion>
  );
}
