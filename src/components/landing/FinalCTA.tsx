import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { buttonClasses } from "@/components/ui/Button";

export default function FinalCTA() {
  return (
    <section className="nb-section bg-cream">
      <div className="nb-container">
        <div className="relative overflow-hidden rounded-nb-lg border-3 border-ink bg-coral p-6 shadow-hard-4 md:p-10">
          <span
            aria-hidden
            className="absolute -right-6 -top-6 h-24 w-24 rotate-12 rounded-nb-md border-3 border-ink bg-lemon"
          />
          <div className="relative grid items-center gap-8 md:grid-cols-[1fr_auto]">
            <div>
              <p className="font-mono text-[length:var(--fs-xs)] font-bold uppercase tracking-[0.1em] text-ink">
                Sẵn sàng chưa?
              </p>
              <h2 className="mt-2 max-w-[16ch] font-display text-[length:var(--fs-2xl)] font-extrabold uppercase leading-[0.95] tracking-[-0.02em] text-ink sm:text-display-md">
                Sẵn sàng bị roast?
              </h2>
              <p className="mt-3 max-w-[60ch] text-base leading-[1.6] text-ink">
                Nhập username, nhận verdict và một tràng nhận xét. Miễn phí, không cần đăng nhập.
              </p>
            </div>
            <div className="flex flex-col items-start gap-3 md:items-end">
              <Link href="/scan" className={buttonClasses({ variant: "accent", size: "lg" })}>
                <Sparkles className="h-4 w-4" aria-hidden />
                Chấm avatar ngay
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <a
                href="#bang-diem"
                className="font-mono text-[length:var(--fs-2xs)] font-bold uppercase tracking-[0.06em] text-ink underline decoration-2 underline-offset-4 hover:no-underline"
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
