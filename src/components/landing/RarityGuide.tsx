import SectionHeading from "@/components/ui/SectionHeading";
import { RARITIES_LIST } from "@/lib/rarity";
import { getTierQuote } from "@/lib/ui/verdict";

function rangeFor(index: number): string {
  const rarity = RARITIES_LIST[index];
  const next = RARITIES_LIST[index + 1];
  return next ? `${rarity.minScore}–${next.minScore - 1}` : `${rarity.minScore}–100`;
}

export default function RarityGuide() {
  return (
    <section id="bang-diem" className="nb-section border-b-3 border-ink bg-surface-2">
      <div className="nb-container">
        <SectionHeading
          eyebrow="03 — Bảng điểm"
          title="Sáu bậc. Một luật chơi."
          description="Điểm hệ thống đi từ 0 đến 100. Gu cá nhân là tùy chọn: mặc định Chưa chọn, khi chọn sẽ chiếm 25% tổng điểm."
        />

        <ul className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-2 md:overflow-visible md:pb-0 lg:grid-cols-3">
          {RARITIES_LIST.map((rarity, index) => (
            <li
              key={rarity.tier}
              className="w-[84vw] max-w-[320px] shrink-0 snap-start md:w-auto md:max-w-none"
            >
              <article
                className="h-full rounded-nb-lg border-3 border-ink border-t-8 bg-surface p-4 shadow-hard-3"
                style={{ borderTopColor: rarity.color }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display text-xl font-extrabold uppercase tracking-[-0.01em] text-ink">
                      {rarity.label}
                    </h3>
                    <p className="mt-1 font-mono text-xs font-bold text-muted">{rangeFor(index)} điểm</p>
                  </div>
                  <span
                    className="rounded-nb-sm border-2 border-ink px-2 py-1 font-mono text-[10px] font-bold text-on-accent shadow-hard-1"
                    style={{ backgroundColor: rarity.color }}
                  >
                    GU {rarity.personalScore}đ
                  </span>
                </div>

                <p className="mt-4 text-sm font-semibold italic leading-[1.5] text-ink-2">
                  &ldquo;{getTierQuote(rarity.tier)}&rdquo;
                </p>
                <p className="mt-2 text-sm leading-[1.6] text-muted">{rarity.description}</p>
              </article>
            </li>
          ))}
        </ul>

        <p className="mt-6 max-w-[75ch] font-mono text-[length:var(--fs-2xs)] font-bold uppercase tracking-[0.05em] text-muted">
          Gợi ý: kéo ngang trên mobile để xem đủ 6 bậc. Điểm gu cá nhân: 0 · 15 · 35 · 60 · 80 · 100.
        </p>
      </div>
    </section>
  );
}
