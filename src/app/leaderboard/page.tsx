import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import LeaderboardSection from "@/components/leaderboard/LeaderboardSection";
import { buttonClasses } from "@/components/ui/Button";
import SiteFooter from "@/components/ui/SiteFooter";
import SiteHeader from "@/components/ui/SiteHeader";
import SkipLink from "@/components/ui/SkipLink";

export const metadata: Metadata = {
  title: "Bảng xếp hạng avatar — Avatar Ranked",
  description:
    "Lịch sử các avatar Roblox đã quét, xếp theo điểm tổng /10. Avatar vừa quét tự động vào đúng hạng, 6 mục mỗi trang.",
  alternates: { canonical: "/leaderboard" },
  robots: { index: false, follow: true },
};

export default function LeaderboardPage() {
  return (
    <div className="nb-root flex min-h-dvh flex-col">
      <SkipLink />
      <SiteHeader variant="scan" />
      <main id="main-content" className="flex-1">
        <LeaderboardSection
          headingLevel="h1"
          eyebrow="Hall of drip"
          title="Bảng xếp hạng"
          description="Lịch sử các avatar đã quét trên trình duyệt này. Xếp theo điểm tổng /10; avatar vừa quét tự động vào đúng hạng."
          showCta
          className="border-b-3 border-ink"
        />

        <div className="bg-surface-2">
          <div className="nb-container flex max-w-5xl flex-wrap items-center justify-between gap-3 py-5">
            <div>
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-coral-ink">
                Dành cho streamer
              </p>
              <p className="mt-1 max-w-[58ch] text-sm leading-[1.5] text-ink-2">
                Bảng live đọc dữ liệu chung từ server, tự cập nhật và tự xoay trang —
                dùng làm Browser Source trong OBS.
              </p>
            </div>
            <Link
              href="/live"
              target="_blank"
              rel="noreferrer"
              className={buttonClasses({ variant: "ghost", size: "sm" })}
            >
              Mở bảng live
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
