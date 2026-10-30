import { Sparkles } from "lucide-react";

const TICKER = ["ROAST", "RATE", "RANK", "REPEAT"];

export default function Ticker() {
  return (
    <div
      className="nb-marquee overflow-hidden border-y border-white/10 bg-[linear-gradient(90deg,rgba(70,200,255,0.10),rgba(168,85,247,0.12),rgba(255,0,127,0.10))] py-3 text-cyan backdrop-blur"
      aria-label="Roast, rate, rank, repeat"
    >
      <div className="nb-marquee-track">
        {[0, 1].map((copy) => (
          <div key={copy} aria-hidden={copy === 1} className="flex shrink-0 items-center">
            {TICKER.map((word) => (
              <span
                key={`${copy}-${word}`}
                className="mx-5 flex items-center gap-5 font-display text-xl font-extrabold uppercase tracking-[-0.02em]"
              >
                {word}
                <Sparkles className="h-4 w-4 text-coral-ink" aria-hidden />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
