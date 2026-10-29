import { Sparkles } from "lucide-react";

const TICKER = ["ROAST", "RATE", "RANK", "REPEAT"];

export default function Ticker() {
  return (
    <div className="nb-marquee overflow-hidden border-b-3 border-ink bg-lemon py-3" aria-label="Roast, rate, rank, repeat">
      <div className="nb-marquee-track">
        {[0, 1].map((copy) => (
          <div key={copy} aria-hidden={copy === 1} className="flex shrink-0 items-center">
            {TICKER.map((word) => (
              <span
                key={`${copy}-${word}`}
                className="mx-5 flex items-center gap-5 font-display text-xl font-extrabold uppercase tracking-[-0.02em] text-ink"
              >
                {word}
                <Sparkles className="h-4 w-4" aria-hidden />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
