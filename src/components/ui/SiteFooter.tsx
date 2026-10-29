import Link from "next/link";
import Logo from "./Logo";

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t-3 border-ink bg-ink text-cream">
      <div className="nb-container grid gap-10 py-12 md:grid-cols-3">
        <div>
          <Logo href="/" tone="cream" />
          <p className="mt-4 max-w-[34ch] text-sm leading-[1.6] text-line-soft">
            Roast, rate và xếp hạng avatar Roblox. Vui là chính, không phán xét con người.
          </p>
        </div>

        <div>
          <h2 className="font-mono text-[length:var(--fs-xs)] font-bold uppercase tracking-[0.1em] text-lemon">
            Khám phá
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/" className="text-line-soft underline-offset-4 hover:text-lemon hover:underline">
                Trang chủ
              </Link>
            </li>
            <li>
              <Link href="/scan" className="text-line-soft underline-offset-4 hover:text-lemon hover:underline">
                Chấm avatar
              </Link>
            </li>
            <li>
              <Link href="/#bang-diem" className="text-line-soft underline-offset-4 hover:text-lemon hover:underline">
                Bảng điểm
              </Link>
            </li>
            <li>
              <Link href="/#faq" className="text-line-soft underline-offset-4 hover:text-lemon hover:underline">
                FAQ
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-mono text-[length:var(--fs-xs)] font-bold uppercase tracking-[0.1em] text-lemon">
            Miễn trừ
          </h2>
          <p className="mt-3 text-sm leading-[1.6] text-line-soft">
            Không liên kết, không được Roblox Corporation bảo trợ. Chỉ mang tính giải trí.
            Chỉ đọc dữ liệu công khai, không yêu cầu đăng nhập.
          </p>
        </div>
      </div>

      <div className="border-t border-ink-2">
        <div className="nb-container flex flex-col gap-2 py-5 font-mono text-[length:var(--fs-2xs)] uppercase tracking-[0.06em] text-line-soft sm:flex-row sm:items-center sm:justify-between">
          <span>© {year} Avatar Ranked</span>
          <span>Roast • Rate • Rank • Repeat</span>
        </div>
      </div>
    </footer>
  );
}
