"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import UsernameSearch from "@/components/UsernameSearch";
import AvatarFoundCard from "@/components/AvatarFoundCard";
import AvatarScanner from "@/components/AvatarScanner";
import RarityReveal from "@/components/RarityReveal";
import ResultCard from "@/components/ResultCard";
import HowItWorks from "@/components/HowItWorks";
import RarityGuide from "@/components/RarityGuide";
import Footer from "@/components/Footer";
import LeaderboardSection from "@/components/leaderboard/LeaderboardSection";
import { fetchCatalogPrices, fetchProfile, fetchThumbnail, lookupUser } from "@/lib/roblox";
import { calculateAvatarRank } from "@/lib/scoring";
import { extractPaletteFromImage } from "@/lib/palette";
import { fadeUp } from "@/lib/motion";
import { createLeaderboardEntry, recordLeaderboardEntry } from "@/lib/leaderboard";
import { publishLiveScan } from "@/lib/liveClient";
import { isSecretAccount } from "@/lib/secretAccount";
import type {
  CatalogSummary,
  PaletteStats,
  RarityTier,
  RobloxProfile,
  RobloxUser,
  ScanPhase,
  ScoreReport,
} from "@/types";

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function HomePageContent() {
  const searchParams = useSearchParams();
  const [phase, setPhase] = useState<ScanPhase>("idle");
  const [error, setError] = useState<string | null>(null);

  // Dữ liệu người chơi
  const [user, setUser] = useState<RobloxUser | null>(null);
  const [profile, setProfile] = useState<RobloxProfile | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [catalog, setCatalog] = useState<CatalogSummary | null>(null);
  const [palette, setPalette] = useState<PaletteStats | null>(null);

  // Báo cáo điểm 4 tiêu chí AI và Gu cá nhân
  const [report, setReport] = useState<ScoreReport | null>(null);
  const [personalTier, setPersonalTier] = useState<RarityTier>("COMMON");

  // Tiến trình quét
  const [progress, setProgress] = useState(0);

  // ID phiên quét tránh race condition
  const scanRunId = useRef(0);
  const isSkipRequested = useRef(false);
  const initialAutoSearched = useRef(false);

  // 1. Tìm user khi nhập username -> Reset sạch kết quả cũ & Hiển thị màn hình TARGET ACQUIRED
  const handleSearch = useCallback(async (username: string) => {
    const currentId = ++scanRunId.current;
    setError(null);
    setUser(null);
    setProfile(null);
    setImageUrl(null);
    setCatalog(null);
    setPalette(null);
    setReport(null);
    setPersonalTier("COMMON");
    setProgress(0);
    setPhase("searching");

    try {
      const foundUser = await lookupUser(username);
      if (currentId !== scanRunId.current) return;

      setUser(foundUser);

      // Tải trước avatar thumbnail
      const thumbUrl = await fetchThumbnail(foundUser.id);
      if (currentId !== scanRunId.current) return;
      setImageUrl(thumbUrl);

      // Chuyển sang phase "found" để người dùng xem avatar, chọn gu và bấm "QUÉT & CHẤM ĐIỂM"
      setPhase("found");
    } catch (err) {
      if (currentId !== scanRunId.current) return;
      setError(err instanceof Error ? err.message : "Không tìm thấy người chơi hoặc lỗi kết nối.");
      setPhase("error");
    }
  }, []);

  // Hỗ trợ deep link: nếu URL có `?u=username`, tự động tìm kiếm
  useEffect(() => {
    if (initialAutoSearched.current) return;
    const urlUser = searchParams.get("u");
    if (urlUser && urlUser.trim()) {
      initialAutoSearched.current = true;
      handleSearch(urlUser.trim());
    }
  }, [searchParams, handleSearch]);

  // 2. Kích hoạt chuỗi quét khi nhấn "SCAN MY AVATAR"
  const handleStartScan = useCallback(async () => {
    if (!user) return;
    const currentId = ++scanRunId.current;
    isSkipRequested.current = false;
    setProgress(0);

    try {
      // Phase 1: INITIALIZING (~1s)
      setPhase("init");
      await wait(1000);
      if (currentId !== scanRunId.current) return;
      if (isSkipRequested.current) return;

      // Phase 2: SCANNING (~2.5s)
      setPhase("scanning");

      const scanStart = performance.now();
      const scanDuration = 2500;

      const progressInterval = setInterval(() => {
        const elapsed = performance.now() - scanStart;
        const pct = Math.min(95, (elapsed / scanDuration) * 100);
        setProgress(pct);
      }, 50);

      // Đồng thời tải profile, catalog giá và trích xuất bảng màu từ ảnh avatar
      const fullProfile = await fetchProfile(user.id);
      const assetIds = (fullProfile.avatar.assets ?? []).map((a) => a.id);

      const [catSummary, palStats] = await Promise.all([
        fetchCatalogPrices(assetIds),
        imageUrl ? extractPaletteFromImage(imageUrl) : Promise.resolve(null),
        wait(Math.max(500, scanDuration - (performance.now() - scanStart))),
      ]);

      clearInterval(progressInterval);
      if (currentId !== scanRunId.current) return;
      if (isSkipRequested.current) return;

      setProgress(100);
      setProfile(fullProfile);
      setCatalog(catSummary);
      setPalette(palStats);

      // Tính điểm tổng hợp: 75% AI + 25% Gu bạn đã chọn trước khi scan
      const scoreReport = calculateAvatarRank(fullProfile, catSummary, palStats, personalTier);
      setReport(scoreReport);

      // Tự động đồng bộ lên Bảng xếp hạng Live và Local (trừ tài khoản bí mật)
      if (!isSecretAccount(user.id)) {
        try {
          const entry = createLeaderboardEntry(user, scoreReport, imageUrl);
          recordLeaderboardEntry(entry);
          publishLiveScan(entry).catch(() => {});
        } catch {
          // Bỏ qua lỗi lưu local/live ngầm
        }
      }

      // Phase 3: CALCULATING RARITY (~1s)
      setPhase("calculating");
      await wait(1100);
      if (currentId !== scanRunId.current) return;
      if (isSkipRequested.current) return;

      // Phase 4: REVEAL
      setPhase("revealing");
    } catch (err) {
      if (currentId !== scanRunId.current) return;
      setError(err instanceof Error ? err.message : "Đã có lỗi khi phân tích avatar.");
      setPhase("error");
    }
  }, [user, imageUrl, personalTier]);

  // Người dùng nhấn BỎ QUA ANIMATION
  const handleSkipAnimation = useCallback(async () => {
    isSkipRequested.current = true;
    if (!profile && user) {
      try {
        const fullProfile = await fetchProfile(user.id);
        const assetIds = (fullProfile.avatar.assets ?? []).map((a) => a.id);
        const [catSummary, palStats] = await Promise.all([
          fetchCatalogPrices(assetIds),
          imageUrl ? extractPaletteFromImage(imageUrl) : Promise.resolve(null),
        ]);
        const scoreReport = calculateAvatarRank(fullProfile, catSummary, palStats, personalTier);
        setProfile(fullProfile);
        setCatalog(catSummary);
        setPalette(palStats);
        setReport(scoreReport);

        if (!isSecretAccount(user.id)) {
          try {
            const entry = createLeaderboardEntry(user, scoreReport, imageUrl);
            recordLeaderboardEntry(entry);
            publishLiveScan(entry).catch(() => {});
          } catch {
            // ignore
          }
        }
        setPhase("done");
      } catch {
        // fallback
      }
    } else if (report) {
      setPhase("done");
    }
  }, [profile, user, imageUrl, report, personalTier]);

  // Thay đổi Gu thẩm mỹ cá nhân (cập nhật kết quả realtime nếu đã có kết quả)
  const handlePersonalTierChange = useCallback(
    (newTier: RarityTier) => {
      setPersonalTier(newTier);
      if (profile && user) {
        const updatedReport = calculateAvatarRank(profile, catalog, palette, newTier);
        setReport(updatedReport);
        if (!isSecretAccount(user.id)) {
          try {
            const entry = createLeaderboardEntry(user, updatedReport, imageUrl);
            recordLeaderboardEntry(entry);
            publishLiveScan(entry).catch(() => {});
          } catch {
            // ignore
          }
        }
      }
    },
    [profile, user, catalog, palette, imageUrl],
  );

  // Khi hoàn thành màn hình Rarity Reveal -> Xem Result Card
  const handleRevealComplete = useCallback(() => {
    setPhase("done");
  }, []);

  // Scan lại với cùng một avatar
  const handleScanAgain = useCallback(async () => {
    if (profile) {
      const recalculated = calculateAvatarRank(profile, catalog, palette, personalTier);
      setReport(recalculated);
      setPhase("revealing");
    } else {
      handleStartScan();
    }
  }, [profile, catalog, palette, personalTier, handleStartScan]);

  // Tìm avatar khác
  const handleNewSearch = useCallback(() => {
    scanRunId.current++;
    setPhase("idle");
    setError(null);
    setUser(null);
    setProfile(null);
    setImageUrl(null);
    setCatalog(null);
    setPalette(null);
    setReport(null);
    setPersonalTier("COMMON");
    setProgress(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <>
      <Header />

      <main className="min-h-screen">
        <Hero>
          {/* Form tìm kiếm hiển thị ở trạng thái idle / searching / error */}
          {(phase === "idle" || phase === "searching" || phase === "error") && (
            <UsernameSearch
              onSearch={handleSearch}
              loading={phase === "searching"}
              disabled={phase === "searching"}
            />
          )}

          {/* Thông báo lỗi nếu có */}
          <AnimatePresence>
            {error && (
              <motion.div
                role="alert"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mx-auto mt-4 max-w-xl rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-300"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Interactive Workspace theo từng Phase */}
          <div className="mt-4">
            <AnimatePresence mode="wait">
              {/* Phase: FOUND -> Hiển thị avatar, thanh chọn Gu và nút "QUÉT & CHẤM ĐIỂM" */}
              {phase === "found" && user && (
                <motion.div key="found" variants={fadeUp} initial="hidden" animate="visible" exit="exit">
                  <AvatarFoundCard
                    user={user}
                    imageUrl={imageUrl}
                    personalTier={personalTier}
                    onPersonalTierChange={setPersonalTier}
                    onScan={handleStartScan}
                    onCancel={handleNewSearch}
                  />
                </motion.div>
              )}

              {/* Phase: INIT / SCANNING / CALCULATING -> AI Scanner */}
              {(phase === "init" || phase === "scanning" || phase === "calculating") && user && (
                <motion.div key="scanning-view" variants={fadeUp} initial="hidden" animate="visible" exit="exit">
                  <AvatarScanner
                    user={user}
                    imageUrl={imageUrl}
                    phase={phase}
                    progress={progress}
                    onSkip={handleSkipAnimation}
                  />
                </motion.div>
              )}

              {/* Phase: REVEALING -> Rarity Reveal hoành tráng */}
              {phase === "revealing" && user && report && (
                <motion.div key="reveal-view" variants={fadeUp} initial="hidden" animate="visible" exit="exit">
                  <RarityReveal
                    user={user}
                    imageUrl={imageUrl}
                    report={report}
                    onComplete={handleRevealComplete}
                  />
                </motion.div>
              )}

              {/* Phase: DONE -> Result Card chi tiết */}
              {phase === "done" && user && profile && report && (
                <motion.div key="result-view" variants={fadeUp} initial="hidden" animate="visible" exit="exit">
                  <ResultCard
                    user={user}
                    profile={profile}
                    imageUrl={imageUrl}
                    report={report}
                    personalTier={personalTier}
                    onPersonalTierChange={handlePersonalTierChange}
                    onScanAgain={handleScanAgain}
                    onNewSearch={handleNewSearch}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Hero>

        {/* Bảng xếp hạng trực tiếp trên trang chủ */}
        <section id="leaderboard" className="relative border-t border-white/10 bg-[#080A12]/80 py-12">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <LeaderboardSection
              headingLevel="h2"
              eyebrow="Hall of Fame"
              title="Bảng xếp hạng Avatar"
              description="Các avatar điểm cao nhất đã được quét trên hệ thống. Kết quả của bạn sẽ tự động xuất hiện tại đây."
              user={user}
              report={report}
              imageUrl={imageUrl}
              showCta={false}
            />
          </div>
        </section>

        {/* How It Works Section */}
        <HowItWorks />

        {/* Rarity Guide Section */}
        <RarityGuide />
      </main>

      <Footer />
    </>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#080A12] text-slate-400">
          Đang tải Avatar Ranked...
        </div>
      }
    >
      <HomePageContent />
    </Suspense>
  );
}
