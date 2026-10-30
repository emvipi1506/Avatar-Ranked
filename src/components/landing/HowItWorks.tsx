import Link from "next/link";
import { ArrowRight, ScanSearch, Search, Sparkles } from "lucide-react";
import SectionHeading from "@/components/ui/SectionHeading";
import { buttonClasses } from "@/components/ui/Button";

const STEPS = [
  {
    icon: Search,
    title: "Nhập username",
    body: "Gõ username Roblox hoặc chọn một ví dụ. Không cần mật khẩu, không cần đăng nhập.",
    note: "3–20 ký tự",
    tone: "text-[#46C8FF]",
    glow: "shadow-[0_0_24px_rgba(70,200,255,0.25)]",
  },
  {
    icon: ScanSearch,
    title: "Hệ thống soi avatar",
    body: "Đọc trang phục, phụ kiện, bảng màu từ ảnh và đối chiếu 270 aesthetics trong catalog.",
    note: "Dữ liệu công khai",
    tone: "text-[#A855F7]",
    glow: "shadow-[0_0_24px_rgba(168,85,247,0.25)]",
  },
  {
    icon: Sparkles,
    title: "Nhận verdict + roast",
    body: "Xem điểm /10, con dấu verdict, 4 tiêu chí chi tiết và gợi ý nâng cấp outfit.",
    note: "Kết quả tức thì",
    tone: "text-[#FF007F]",
    glow: "shadow-[0_0_24px_rgba(255,0,127,0.22)]",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="nb-section relative overflow-hidden border-b border-white/5">
      <div aria-hidden className="nb-dots pointer-events-none absolute inset-0" />
      <div className="nb-container relative">
        <SectionHeading
          align="center"
          eyebrow="01 — Cách hoạt động"
          title="Ba bước. Không cần đăng nhập."
          description="Từ username đến verdict chỉ mất một vài giây. Toàn bộ dữ liệu được lấy từ API công khai của Roblox."
        />

        <ol className="mt-12 grid gap-5 md:grid-cols-3">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <li key={step.title}>
                <article className="glass-card glass-card-hover group relative h-full overflow-hidden rounded-3xl p-6 sm:p-7">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,transparent,rgba(70,200,255,0.5),transparent)] opacity-60"
                  />

                  <div className="flex items-center justify-between gap-3">
                    <span
                      className={`grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-[#080A12] ${step.glow}`}
                    >
                      <Icon className={`h-6 w-6 ${step.tone}`} aria-hidden />
                    </span>
                    <span className="font-mono text-3xl font-black leading-none text-white/15 transition-colors duration-300 group-hover:text-[#46C8FF]/40">
                      0{index + 1}
                    </span>
                  </div>

                  <h3 className="mt-5 font-sans text-lg font-black uppercase tracking-tight text-white">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{step.body}</p>
                  <p className="mt-4 inline-flex rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-slate-400">
                    {step.note}
                  </p>
                </article>
              </li>
            );
          })}
        </ol>

        <div className="mt-9 flex justify-center">
          <Link href="/scan" className={buttonClasses({ variant: "secondary", size: "md" })}>
            Bắt đầu quét
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
