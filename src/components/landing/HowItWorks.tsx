import Link from "next/link";
import { ArrowRight, ScanSearch, Search, Sparkles } from "lucide-react";
import Card from "@/components/ui/Card";
import SectionHeading from "@/components/ui/SectionHeading";
import { buttonClasses } from "@/components/ui/Button";

const STEPS = [
  {
    icon: Search,
    title: "Nhập username",
    body: "Gõ username Roblox hoặc chọn một ví dụ. Không cần mật khẩu, không cần đăng nhập.",
    note: "3–20 ký tự",
  },
  {
    icon: ScanSearch,
    title: "Hệ thống soi avatar",
    body: "Đọc trang phục, phụ kiện, bảng màu từ ảnh và đối chiếu 270 aesthetics trong catalog.",
    note: "Dữ liệu công khai",
  },
  {
    icon: Sparkles,
    title: "Nhận verdict + roast",
    body: "Xem điểm /10, con dấu verdict, 4 tiêu chí chi tiết và gợi ý nâng cấp outfit.",
    note: "Kết quả tức thì",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="nb-section border-b-3 border-ink bg-surface-2">
      <div className="nb-container">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="01 — Cách hoạt động"
            title="Ba bước. Không cần đăng nhập."
            description="Từ username đến verdict chỉ mất vài giây. Toàn bộ dữ liệu đọc từ API công khai của Roblox."
          />
          <Link href="/scan" className={buttonClasses({ variant: "secondary", size: "md", className: "shrink-0" })}>
            Bắt đầu quét
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        <ol className="mt-10 grid gap-5 md:grid-cols-3">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            return (
              <li key={step.title}>
                <Card className="h-full" padding="md">
                  <div className="flex items-center justify-between gap-3">
                    <span className="grid h-12 w-12 place-items-center rounded-nb-sm border-3 border-ink bg-lemon shadow-hard-1">
                      <Icon className="h-6 w-6 text-ink" aria-hidden />
                    </span>
                    <span className="font-display text-4xl font-extrabold leading-none text-muted">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-xl font-extrabold uppercase tracking-[-0.01em] text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-[1.6] text-ink-2">{step.body}</p>
                  <p className="mt-4 inline-flex rounded-nb-sm border-2 border-ink bg-surface-2 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.05em] text-ink">
                    {step.note}
                  </p>
                </Card>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
