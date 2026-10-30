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
    <section id="bang-diem" className="nb-section relative overflow-hidden border-b border-white/5">
      <div aria-hidden className="cyber-grid pointer-events-none absolute inset-0 opacity-60" />

      <div className="nb-container relative">
        <SectionHeading
          align="center"
          eyebrow="03 — Bảng điểm"
          title="Sáu bậc. Một luật chơi."
          description="Điểm hệ thống đi từ 0 đến 100. Gu cá nhân là tùy chọn: mặc định Chưa chọn, khi chọn sẽ chiếm 25% tổng điểm."
        />

        <ul className="mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 md:grid md:grid-cols-2 md:overflow-visible md:pb-0 lg:grid-cols-3">
          {RARITIES_LIST.map((rarity, index) => (
            <li
              key={rarity.tier}
              className="w-[84vw] max-w-[320px] shrink-0 snap-start md:w-auto md:max-w-none"
            >
              <article
                className="glass-card glass-card-hover group relative h-full overflow-hidden rounded-3xl p-5 sm:p-6"
                style={{ borderColor: `${rarity.color}33` }}
              >
                <div
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-1 transition-all duration-300 group-hover:h-1.5"
                  style={{ background: rarity.gradient }}
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute -bottom-12 -right-12 h-36 w-36 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-40"
                  style={{ backgroundColor: rarity.color }}
                />

                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3
                      className="font-sans text-xl font-black uppercase tracking-tight sm:text-2xl"
                      style={{
                        backgroundImage: rarity.gradient,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                      }}
                    >
                      {rarity.label}
                    </h3>
                    <p className="mt-1 font-mono text-[11px] font-bold text-slate-400">
                      {rangeFor(index)} điểm
                    </p>
                  </div>
                  <span
                    className="shrink-0 rounded-full border px-2.5 py-1 font-mono text-[10px] font-black uppercase tracking-wider"
                    style={{
                      borderColor: `${rarity.color}66`,
                      color: rarity.color,
                      backgroundColor: `${rarity.color}14`,
                    }}
                  >
                    GU {rarity.personalScore}
                  </span>
                </div>

                <p className="mt-4 text-sm font-semibold italic leading-relaxed text-slate-300">
                  &ldquo;{getTierQuote(rarity.tier)}&rdquo;
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{rarity.description}</p>

                <div className="mt-4 flex items-center gap-2 border-t border-white/5 pt-3 text-[11px] text-slate-400">
                  <span
                    aria-hidden
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ backgroundColor: rarity.color, boxShadow: `0 0 10px ${rarity.glowColor}` }}
                  />
                  <span className="truncate">
                    {rarity.tier === "MYTHICAL"
                      ? "Cosmic Rift, camera shake & confetti"
                      : rarity.tier === "LEGENDARY"
                        ? "Golden Aura, fanfare & particle"
                        : rarity.tier === "EPIC"
                          ? "Purple neon glitch & hologram rings"
                          : rarity.tier === "RARE"
                            ? "Azure energy vortex & shimmer"
                            : rarity.tier === "UNCOMMON"
                              ? "Emerald glow & gentle sparkles"
                              : "Minimalist border & soft fade-in"}
                  </span>
                </div>
              </article>
            </li>
          ))}
        </ul>

        <p className="mx-auto mt-6 max-w-[75ch] text-center font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-slate-500 sm:text-[11px]">
          Gợi ý: kéo ngang trên mobile để xem đủ 6 bậc. Điểm gu cá nhân: 0 → 15 → 35 → 60 → 80 → 100.
        </p>
      </div>
    </section>
  );
}
