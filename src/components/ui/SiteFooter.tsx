import Link from "next/link";
import Logo from "./Logo";

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t-3 border-[var(--c-footer-border)] bg-[var(--c-footer-bg)] text-[var(--c-footer-ink)]">
      <div className="nb-container grid gap-10 py-12 md:grid-cols-3">
        <div>
          <Logo href="/" tone="cream" />
          <p className="mt-4 max-w-[34ch] text-sm leading-[1.6] text-[var(--c-footer-muted)]">
            Roast, rate và xếp hạng avatar Roblox. Vui là chính, không phán xét con người.
          </p>
        </div>

        <div>
          <h2 className="font-mono text-[length:var(--fs-xs)] font-bold uppercase tracking-[0.1em] text-[var(--c-footer-accent)]">
            Khám phá
          </h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link
                href="/"
                className="text-[var(--c-footer-muted)] underline-offset-4 hover:text-[var(--c-footer-accent)] hover:underline"
              >
                Trang chủ
              </Link>
            </li>
            <li>
              <Link
                href="/scan"
                className="text-[var(--c-footer-muted)] underline-offset-4 hover:text-[var(--c-footer-accent)] hover:underline"
              >
                Chấm avatar
              </Link>
            </li>
            <li>
              <Link
                href="/leaderboard"
                className="text-[var(--c-footer-muted)] underline-offset-4 hover:text-[var(--c-footer-accent)] hover:underline"
              >
                Bảng xếp hạng
              </Link>
            </li>
            <li>
              <Link
                href="/#bang-diem"
                className="text-[var(--c-footer-muted)] underline-offset-4 hover:text-[var(--c-footer-accent)] hover:underline"
              >
                Bảng điểm
              </Link>
            </li>
            <li>
              <Link
                href="/#faq"
                className="text-[var(--c-footer-muted)] underline-offset-4 hover:text-[var(--c-footer-accent)] hover:underline"
              >
                FAQ
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="font-mono text-[length:var(--fs-xs)] font-bold uppercase tracking-[0.1em] text-[var(--c-footer-accent)]">
            Miễn trừ
          </h2>
          <p className="mt-3 text-sm leading-[1.6] text-[var(--c-footer-muted)]">
            Không liên kết, không được Roblox Corporation bảo trợ. Chỉ mang tính giải trí.
            Chỉ đọc dữ liệu công khai, không yêu cầu đăng nhập.
          </p>
        </div>
      </div>

      <div className="border-t border-[var(--c-footer-border)]">
        <div className="nb-container flex flex-col gap-2 py-5 font-mono text-[length:var(--fs-2xs)] uppercase tracking-[0.06em] text-[var(--c-footer-muted)] sm:flex-row sm:items-center sm:justify-between">
          <span>© {year} Avatar Ranked</span>
          <span>Roast • Rate • Rank • Repeat</span>
        </div>
      </div>
    </footer>
  );
}
