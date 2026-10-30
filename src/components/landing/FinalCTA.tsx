import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { buttonClasses } from "@/components/ui/Button";

export default function FinalCTA() {
  return (
    <section className="nb-section bg-transparent">
      <div className="nb-container">
        <div className="neon-panel relative overflow-hidden rounded-[28px] px-6 py-10 md:px-12 md:py-14">
          <span
            aria-hidden
            className="pointer-events-none absolute -left-16 -top-20 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(70,200,255,0.22),transparent_68%)] blur-2xl"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(168,85,247,0.2),transparent_68%)] blur-2xl"
          />
          <div className="relative grid items-center gap-8 md:grid-cols-[1fr_auto]">
            <div>
              <p className="neon-kicker">Sẵn sàng chưa?</p>
              <h2 className="mt-3 max-w-[16ch] font-display text-[length:var(--fs-2xl)] font-extrabold uppercase leading-[0.95] tracking-[-0.03em] text-ink sm:text-display-md">
                Sẵn sàng bị <span className="neon-title">roast</span>?
              </h2>
              <p className="mt-4 max-w-[60ch] text-base leading-[1.65] text-ink-2">
                Nhập username, nhận verdict và một tràng nhận xét. Miễn phí, không cần đăng nhập.
              </p>
            </div>
            <div className="flex flex-col items-start gap-3 md:items-end">
              <Link href="/scan" className={buttonClasses({ variant: "primary", size: "lg" })}>
                <Sparkles className="h-4 w-4" aria-hidden />
                Chấm avatar ngay
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <a
                href="#bang-diem"
                className="font-mono text-[length:var(--fs-2xs)] font-bold uppercase tracking-[0.06em] text-ink-2 underline decoration-[rgba(70,200,255,0.5)] decoration-2 underline-offset-4 transition-colors hover:text-cyan"
              >
                Xem lại bảng điểm
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
