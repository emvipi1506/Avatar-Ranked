"use client";

import { useCallback, useRef, useState } from "react";
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
import { fetchProfile, fetchThumbnail, lookupUser } from "@/lib/roblox";
import { calculateAvatarRank } from "@/lib/scoring";
import { fadeUp } from "@/lib/motion";
import type { RobloxProfile, RobloxUser, ScanPhase, ScoreResult } from "@/types";

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export default function HomePage() {
  const [phase, setPhase] = useState<ScanPhase>("idle");
  const [error, setError] = useState<string | null>(null);

  // Dữ liệu người chơi
  const [user, setUser] = useState<RobloxUser | null>(null);
  const [profile, setProfile] = useState<RobloxProfile | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [result, setResult] = useState<ScoreResult | null>(null);

  // Tiến trình quét
  const [progress, setProgress] = useState(0);

  // ID phiên quét tránh race condition
  const scanRunId = useRef(0);
  const isSkipRequested = useRef(false);

  // 1. Tìm user khi nhập username -> Hiển thị màn hình TARGET ACQUIRED
  const handleSearch = useCallback(async (username: string) => {
    const currentId = ++scanRunId.current;
    setError(null);
    setPhase("searching");

    try {
      const foundUser = await lookupUser(username);
      if (currentId !== scanRunId.current) return;

      setUser(foundUser);

      // Tải trước avatar thumbnail
      const thumbUrl = await fetchThumbnail(foundUser.id);
      if (currentId !== scanRunId.current) return;
      setImageUrl(thumbUrl);

      // Chuyển sang phase "found" để người dùng xem avatar và bấm "SCAN MY AVATAR"
      setPhase("found");
    } catch (err) {
      if (currentId !== scanRunId.current) return;
      setError(err instanceof Error ? err.message : "Không tìm thấy người chơi hoặc lỗi kết nối.");
      setPhase("error");
    }
  }, []);

  // 2. Kích hoạt chuỗi quét AI khi nhấn "SCAN MY AVATAR"
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

      // Bắt đầu timer tăng progress bar từ 0 đến 100%
      const scanStart = performance.now();
      const scanDuration = 2500;

      const progressInterval = setInterval(() => {
        const elapsed = performance.now() - scanStart;
        const pct = Math.min(95, (elapsed / scanDuration) * 100);
        setProgress(pct);
      }, 50);

      // Đồng thời gọi profile API đầy đủ và tính điểm
      const [fullProfile] = await Promise.all([
        fetchProfile(user.id),
        wait(scanDuration),
      ]);

      clearInterval(progressInterval);
      if (currentId !== scanRunId.current) return;
      if (isSkipRequested.current) return;

      setProgress(100);
      setProfile(fullProfile);

      // Tính điểm và Rarity
      const scoreResult = calculateAvatarRank(fullProfile);
      setResult(scoreResult);

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
  }, [user]);

  // Người dùng nhấn BỎ QUA ANIMATION
  const handleSkipAnimation = useCallback(async () => {
    isSkipRequested.current = true;
    if (!profile && user) {
      try {
        const fullProfile = await fetchProfile(user.id);
        const scoreResult = calculateAvatarRank(fullProfile);
        setProfile(fullProfile);
        setResult(scoreResult);
        setPhase("done");
      } catch {
        // fallback
      }
    } else if (result) {
      setPhase("done");
    }
  }, [profile, user, result]);

  // Khi hoàn thành màn hình Rarity Reveal -> Xem Result Card
  const handleRevealComplete = useCallback(() => {
    setPhase("done");
  }, []);

  // Scan lại với cùng một avatar
  const handleScanAgain = useCallback(async () => {
    if (profile) {
      // Roll điểm và rarity mới
      const newScore = calculateAvatarRank(profile);
      setResult(newScore);
      // Chạy nhanh animation reveal
      setPhase("revealing");
    } else {
      handleStartScan();
    }
  }, [profile, handleStartScan]);

  // Tìm avatar khác
  const handleNewSearch = useCallback(() => {
    scanRunId.current++;
    setPhase("idle");
    setError(null);
    setUser(null);
    setProfile(null);
    setImageUrl(null);
    setResult(null);
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
              {/* Phase: FOUND -> Hiển thị avatar & nút "SCAN MY AVATAR" */}
              {phase === "found" && user && (
                <motion.div key="found" variants={fadeUp} initial="hidden" animate="visible" exit="exit">
                  <AvatarFoundCard
                    user={user}
                    imageUrl={imageUrl}
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
              {phase === "revealing" && user && result && (
                <motion.div key="reveal-view" variants={fadeUp} initial="hidden" animate="visible" exit="exit">
                  <RarityReveal
                    user={user}
                    imageUrl={imageUrl}
                    result={result}
                    onComplete={handleRevealComplete}
                  />
                </motion.div>
              )}

              {/* Phase: DONE -> Result Card chi tiết */}
              {phase === "done" && user && profile && result && (
                <motion.div key="result-view" variants={fadeUp} initial="hidden" animate="visible" exit="exit">
                  <ResultCard
                    user={user}
                    profile={profile}
                    imageUrl={imageUrl}
                    result={result}
                    onScanAgain={handleScanAgain}
                    onNewSearch={handleNewSearch}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Hero>

        {/* How It Works Section */}
        <HowItWorks />

        {/* Rarity Guide Section */}
        <RarityGuide />
      </main>

      <Footer />
    </>
  );
}
