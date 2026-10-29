import { Heart, RotateCcw } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { RARITIES, TIER_ORDER } from "@/lib/rarity";
import { cn } from "@/lib/cn";
import type { PersonalTierSelection, RarityTier } from "@/types";

export interface PersonalTasteControlProps {
  value: PersonalTierSelection;
  onChange: (tier: PersonalTierSelection) => void;
  systemTier?: RarityTier | null;
  className?: string;
}

export default function PersonalTasteControl({
  value,
  onChange,
  systemTier = null,
  className,
}: PersonalTasteControlProps) {
  const selected = value === null ? null : RARITIES[value];

  return (
    <section
      className={cn("rounded-nb-md border-3 border-ink bg-surface p-4 shadow-hard-2 sm:p-5", className)}
      aria-labelledby="personal-taste-title"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-nb-sm border-2 border-ink bg-coral">
            <Heart className="h-4 w-4 text-ink" aria-hidden />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2
                id="personal-taste-title"
                className="font-display text-lg font-extrabold uppercase leading-none tracking-[-0.01em] text-ink"
              >
                Gu cá nhân
              </h2>
              <Badge variant="outline">Tùy chọn</Badge>
            </div>
            <p className="mt-1 text-xs leading-[1.5] text-muted">
              6 nấc từ COMMON đến MYTHICAL. Không chọn cũng không sao.
            </p>
          </div>
        </div>

        {value !== null && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-nb-sm border-2 border-ink bg-surface-2 px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.04em] text-ink shadow-hard-1 transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            Bỏ chọn
          </button>
        )}
      </div>

      <div
        className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6"
        role="group"
        aria-label="Chọn bậc gu cá nhân"
      >
        {TIER_ORDER.map((tier) => {
          const rarity = RARITIES[tier];
          const active = value === tier;
          const isSystem = systemTier === tier;

          return (
            <button
              key={tier}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(active ? null : tier)}
              title={`${rarity.label} — ${rarity.description}`}
              className={cn(
                "relative flex min-h-[62px] flex-col items-center justify-center rounded-nb-sm border-2 border-ink px-1.5 py-2 text-center transition-[transform,box-shadow,background-color] duration-[120ms]",
                active
                  ? "-translate-y-0.5 text-ink shadow-hard-2"
                  : "bg-surface-2 text-ink shadow-hard-1 hover:-translate-y-0.5 hover:bg-surface hover:shadow-hard-2",
              )}
              style={active ? { backgroundColor: rarity.color } : undefined}
            >
              {isSystem && (
                <span className="absolute -right-1.5 -top-1.5 rounded-[3px] border-2 border-ink bg-lemon px-1 py-0.5 font-mono text-[8px] font-bold uppercase leading-none text-ink">
                  Hệ thống
                </span>
              )}
              <span className="font-mono text-[9px] font-bold uppercase leading-none tracking-[0.04em]">
                {rarity.label}
              </span>
              <span className="mt-1 font-display text-base font-extrabold leading-none">
                {rarity.personalScore}đ
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-xs leading-[1.5] text-ink-2" role="status">
        {value === null ? (
          <>
            <strong className="text-ink">Chưa chọn gu.</strong> Điểm tổng sẽ tính 100% từ hệ thống.
          </>
        ) : (
          <>
            <strong className="text-ink">Đã chọn {selected?.label}.</strong> Gu của bạn chiếm 25%
            tổng điểm; hệ thống chiếm 75%.
          </>
        )}
      </p>
    </section>
  );
}
