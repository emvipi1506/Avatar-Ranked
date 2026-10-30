import type { Metadata } from "next";
import { MonitorPlay } from "lucide-react";
import LeaderboardSection from "@/components/leaderboard/LeaderboardSection";
import SiteFooter from "@/components/ui/SiteFooter";
import SiteHeader from "@/components/ui/SiteHeader";
import SkipLink from "@/components/ui/SkipLink";

export const metadata: Metadata = {
  title: "Bảng xếp hạng avatar — Avatar Ranked",
  description:
    "Lịch sử các avatar Roblox đã quét, xếp theo điểm tổng /10. Avatar vừa quét tự động vào bảng, 6 mục mỗi trang.",
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
          description="Lịch sử các avatar đã quét trên trình duyệt này. Xếp theo điểm tổng /10; avatar vừa quét tự động vào bảng."
          showCta
          className="border-b border-white/10"
        />

        <div className="border-b border-white/10 bg-white/[0.02]">
          <div className="nb-container flex max-w-5xl flex-wrap items-start justify-between gap-4 py-5">
            <div className="min-w-0 max-w-[58ch]">
              <p className="inline-flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-cyan">
                <MonitorPlay className="h-3 w-3" aria-hidden />
                Dành cho streamer
              </p>
              <p className="mt-1.5 text-sm leading-[1.55] text-ink-2">
                Overlay live chạy <strong className="font-semibold text-ink">tách riêng khỏi web</strong>.
                Bật overlay trên máy stream, sau đó thêm URL vào Browser Source của OBS.
              </p>
            </div>

            <div
              aria-label="Cách chạy overlay live"
              className="rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 font-mono text-[10px] leading-[1.8] text-ink-2"
            >
              <p>
                <span className="text-muted">1.</span>{" "}
                <code className="text-cyan">npm run live</code>
              </p>
              <p>
                <span className="text-muted">2.</span>{" "}
                <code className="text-cyan">http://localhost:4173/</code>
              </p>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
