import Link from "next/link";
import Logo from "./Logo";

const LINKS = [
  { href: "/", label: "Trang chủ" },
  { href: "/scan", label: "Chấm avatar" },
  { href: "/leaderboard", label: "Bảng xếp hạng" },
  { href: "/#bang-diem", label: "Bảng điểm" },
  { href: "/#faq", label: "FAQ" },
];

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-[#080A12]/90">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 px-4 py-10 text-center sm:px-6">
        <Logo href="/" tone="cream" />

        <nav aria-label="Liên kết chân trang" className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-400 transition-colors hover:text-[#46C8FF]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="space-y-1 text-xs leading-relaxed text-slate-500">
          <p className="font-bold text-slate-400">
            AVATAR RANKED © {year} — Your Avatar. Your Rarity. Your Legend.
          </p>
          <p>Hệ thống chấm điểm mô phỏng và xếp hạng Rarity mang tính chất giải trí cộng đồng.</p>
          <p>
            Không liên kết, không được Roblox Corporation bảo trợ. Chỉ đọc dữ liệu công khai, không yêu cầu
            đăng nhập.
          </p>
          <p className="text-[11px] text-slate-600">
            This project is not affiliated, endorsed, or sponsored by Roblox Corporation. Roblox is a
            registered trademark of Roblox Corporation.
          </p>
        </div>
      </div>
    </footer>
  );
}
