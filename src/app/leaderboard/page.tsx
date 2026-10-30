import type { Metadata } from "next";
import { MonitorPlay } from "lucide-react";
import LeaderboardSection from "@/components/leaderboard/LeaderboardSection";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Bảng xếp hạng avatar — Avatar Ranked",
  description:
    "Lịch sử các avatar Roblox đã quét, xếp theo điểm tổng /10. Avatar vừa quét tự động vào bảng, 6 mục mỗi trang.",
  alternates: { canonical: "/leaderboard" },
  robots: { index: false, follow: true },
};

export default function LeaderboardPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-[#080A12] text-white">
      <Header />
      <main id="main-content" className="flex-1 py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <LeaderboardSection
            headingLevel="h1"
            eyebrow="Hall of Fame"
            title="Bảng xếp hạng Avatar"
            description="Lịch sử các avatar đã quét trên hệ thống. Xếp theo điểm tổng /10; avatar vừa quét tự động vào bảng."
            showCta
            className="border-b border-white/10"
          />

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 max-w-[58ch]">
                <p className="inline-flex items-center gap-1.5 font-mono text-xs font-bold uppercase tracking-wider text-cyan-400">
                  <MonitorPlay className="h-4 w-4" aria-hidden />
                  Dành cho streamer
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">
                  Overlay live chạy <strong className="font-semibold text-white">tách riêng khỏi web</strong>.
                  Bật overlay trên máy stream, sau đó thêm URL vào Browser Source của OBS để hiển thị thời gian thực.
                </p>
              </div>

              <div
                aria-label="Cách chạy overlay live"
                className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 font-mono text-xs leading-loose text-slate-300"
              >
                <p>
                  <span className="text-slate-500">1.</span>{" "}
                  <code className="text-cyan-300">npm run live</code>
                </p>
                <p>
                  <span className="text-slate-500">2.</span>{" "}
                  <code className="text-cyan-300">http://localhost:4173/</code>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
