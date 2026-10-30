import type { Metadata } from "next";
import LeaderboardSection from "@/components/leaderboard/LeaderboardSection";
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
      </main>
      <SiteFooter />
    </div>
  );
}
