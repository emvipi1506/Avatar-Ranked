"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ResultPanel from "@/components/scan/ResultPanel";
import ScanEntry from "@/components/scan/ScanEntry";
import ScanTheatre from "@/components/scan/ScanTheatre";
import TargetCard from "@/components/scan/TargetCard";
import VerdictReveal from "@/components/scan/VerdictReveal";
import SiteFooter from "@/components/ui/SiteFooter";
import SiteHeader from "@/components/ui/SiteHeader";
import SkipLink from "@/components/ui/SkipLink";
import { extractPaletteFromImage } from "@/lib/palette";
import {
  fetchCatalogPrices,
  fetchProfile,
  fetchThumbnail,
  isValidUsername,
  lookupUser,
} from "@/lib/roblox";
import { calculateAvatarRank } from "@/lib/scoring";
import type {
  CatalogSummary,
  PaletteStats,
  PersonalTierSelection,
  RobloxProfile,
  RobloxUser,
  ScanPhase,
  ScoreReport,
} from "@/types";

const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

function replaceUrl(username?: string) {
  if (typeof window === "undefined") return;
  window.history.replaceState(
    null,
    "",
    username ? `/scan?u=${encodeURIComponent(username)}` : "/scan",
  );
}

function scrollToTop() {
  if (typeof window === "undefined") return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
}

function errorMessage(error: unknown): string {
  return error instanceof Error && error.message
    ? error.message
    : "Đã có lỗi khi phân tích avatar. Thử lại sau nhé.";
}

export interface ScanWorkspaceProps {
  initialUsername?: string | null;
}

export default function ScanWorkspace({ initialUsername = null }: ScanWorkspaceProps) {
  const [phase, setPhase] = useState<ScanPhase>("idle");
  const [query, setQuery] = useState(initialUsername ?? "");
  const [error, setError] = useState<string | null>(null);

  const [user, setUser] = useState<RobloxUser | null>(null);
  const [profile, setProfile] = useState<RobloxProfile | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [catalog, setCatalog] = useState<CatalogSummary | null>(null);
  const [palette, setPalette] = useState<PaletteStats | null>(null);
  const [report, setReport] = useState<ScoreReport | null>(null);
  const [personalTier, setPersonalTier] = useState<PersonalTierSelection>(null);

  const [progress, setProgress] = useState(0);
  const [slow, setSlow] = useState(false);

  const scanRunId = useRef(0);
  const skipRequested = useRef(false);
  const autoStarted = useRef(false);
  const previousInitial = useRef(initialUsername);

  const resetReportData = useCallback(() => {
    setUser(null);
    setProfile(null);
    setImageUrl(null);
    setCatalog(null);
    setPalette(null);
    setReport(null);
    setPersonalTier(null);
    setProgress(0);
    setSlow(false);
  }, []);

  const handleSearch = useCallback(
    async (raw: string) => {
      const username = raw.trim();
      if (!isValidUsername(username)) {
        setError("Username hợp lệ gồm 3–20 ký tự: chữ, số hoặc dấu gạch dưới.");
        setPhase("error");
        return;
      }

      const runId = ++scanRunId.current;
      skipRequested.current = false;
      setQuery(username);
      setError(null);
      resetReportData();
      setPhase("searching");
      replaceUrl(username);

      try {
        const foundUser = await lookupUser(username);
        if (runId !== scanRunId.current) return;
        setUser(foundUser);

        const thumbUrl = await fetchThumbnail(foundUser.id);
        if (runId !== scanRunId.current) return;
        setImageUrl(thumbUrl);
        setPhase("found");
        replaceUrl(foundUser.name);
      } catch (err) {
        if (runId !== scanRunId.current) return;
        setError(errorMessage(err));
        setPhase("error");
      }
    },
    [resetReportData],
  );

  useEffect(() => {
    if (!initialUsername || autoStarted.current) return;
    autoStarted.current = true;
    void handleSearch(initialUsername);
  }, [initialUsername, handleSearch]);

  useEffect(() => {
    if (initialUsername === previousInitial.current) return;
    previousInitial.current = initialUsername;

    if (initialUsername) {
      autoStarted.current = true;
      void handleSearch(initialUsername);
    } else {
      scanRunId.current++;
      setPhase("idle");
      setQuery("");
      setError(null);
      resetReportData();
      replaceUrl();
      window.setTimeout(
        () => document.getElementById("username-input")?.focus({ preventScroll: true }),
        80,
      );
    }
  }, [initialUsername, handleSearch, resetReportData]);

  useEffect(() => {
    if (phase === "found") {
      document.getElementById("target-title")?.focus({ preventScroll: true });
    } else if (phase === "revealing") {
      document.getElementById("verdict-reveal-title")?.focus({ preventScroll: true });
    } else if (phase === "done") {
      document.getElementById("verdict-title")?.focus({ preventScroll: true });
    }
  }, [phase]);

  useEffect(() => {
    if (phase !== "init" && phase !== "scanning" && phase !== "calculating") {
      setSlow(false);
      return;
    }
    const timer = window.setTimeout(() => setSlow(true), 8000);
    return () => window.clearTimeout(timer);
  }, [phase]);

  const handleQueryChange = useCallback(
    (value: string) => {
      setQuery(value);
      if (error || phase === "error") {
        setError(null);
        setPhase("idle");
        replaceUrl();
      }
    },
    [error, phase],
  );

  const handleStartScan = useCallback(async () => {
    if (!user) return;

    const runId = ++scanRunId.current;
    skipRequested.current = false;
    setError(null);
    setReport(null);
    setProfile(null);
    setCatalog(null);
    setPalette(null);
    setProgress(0);
    setSlow(false);

    try {
      setPhase("init");
      if (!skipRequested.current) {
        await wait(900);
        if (runId !== scanRunId.current) return;
      }

      setPhase("scanning");
      const scanStart = performance.now();
      const scanDuration = 2200;
      const progressInterval = window.setInterval(() => {
        const elapsed = performance.now() - scanStart;
        const pct = Math.min(95, (elapsed / scanDuration) * 100);
        setProgress((current) => Math.max(current, pct));
      }, 60);

      let fullProfile: RobloxProfile;
      let catalogSummary: CatalogSummary | null;
      let paletteStats: PaletteStats | null;

      try {
        fullProfile = await fetchProfile(user.id);
        const assetIds = (fullProfile.avatar.assets ?? []).map((asset) => asset.id);

        [catalogSummary, paletteStats] = await Promise.all([
          fetchCatalogPrices(assetIds),
          imageUrl ? extractPaletteFromImage(imageUrl) : Promise.resolve(null),
          wait(Math.max(350, scanDuration - (performance.now() - scanStart))),
        ]);
      } finally {
        window.clearInterval(progressInterval);
      }

      if (runId !== scanRunId.current) return;

      setProgress(100);
      setProfile(fullProfile);
      setCatalog(catalogSummary);
      setPalette(paletteStats);

      const scoreReport = calculateAvatarRank(fullProfile, catalogSummary, paletteStats, personalTier);
      setReport(scoreReport);

      if (skipRequested.current) {
        setPhase("done");
        return;
      }

      setPhase("calculating");
      await wait(850);
      if (runId !== scanRunId.current) return;

      if (skipRequested.current) {
        setPhase("done");
        return;
      }

      setPhase("revealing");
    } catch (err) {
      if (runId !== scanRunId.current) return;
      setError(errorMessage(err));
      setPhase("found");
    }
  }, [imageUrl, personalTier, user]);

  const handleSkipAnimation = useCallback(() => {
    skipRequested.current = true;
    if (report) {
      setProgress(100);
      setPhase("done");
    }
  }, [report]);

  const handlePersonalTierChange = useCallback(
    (tier: PersonalTierSelection) => {
      setPersonalTier(tier);
      if (profile) {
        setReport(calculateAvatarRank(profile, catalog, palette, tier));
      }
    },
    [catalog, palette, profile],
  );

  const handleRevealComplete = useCallback(() => {
    setPhase("done");
  }, []);

  const handleScanAgain = useCallback(() => {
    if (profile) {
      setError(null);
      setReport(calculateAvatarRank(profile, catalog, palette, personalTier));
      setPhase("revealing");
      scrollToTop();
      return;
    }
    void handleStartScan();
  }, [catalog, palette, personalTier, profile, handleStartScan]);

  const handleNewSearch = useCallback(() => {
    scanRunId.current++;
    skipRequested.current = false;
    setPhase("idle");
    setQuery("");
    setError(null);
    resetReportData();
    replaceUrl();
    scrollToTop();
    window.setTimeout(() => document.getElementById("username-input")?.focus(), 80);
  }, [resetReportData]);

  const showEntry = phase === "idle" || phase === "searching" || phase === "error";
  const showTheatre = phase === "init" || phase === "scanning" || phase === "calculating";

  return (
    <div className="nb-root flex min-h-dvh flex-col">
      <SkipLink />
      <SiteHeader variant="scan" />
      <main id="main-content" className="flex-1" aria-busy={phase === "searching" || showTheatre}>
        <h1 className="sr-only">Chấm avatar Roblox</h1>

        {showEntry && (
          <ScanEntry
            value={query}
            onValueChange={handleQueryChange}
            onSubmit={(username) => void handleSearch(username)}
            loading={phase === "searching"}
            error={phase === "error" ? error : null}
          />
        )}

        {phase === "found" && user && (
          <TargetCard
            user={user}
            imageUrl={imageUrl}
            personalTier={personalTier}
            onPersonalTierChange={handlePersonalTierChange}
            onScan={() => void handleStartScan()}
            onChangeUsername={handleNewSearch}
            error={error}
          />
        )}

        {showTheatre && user && (
          <ScanTheatre
            user={user}
            imageUrl={imageUrl}
            phase={phase}
            progress={progress}
            slow={slow}
            onSkip={handleSkipAnimation}
          />
        )}

        {phase === "revealing" && user && report && (
          <VerdictReveal
            user={user}
            imageUrl={imageUrl}
            report={report}
            onComplete={handleRevealComplete}
          />
        )}

        {phase === "done" && user && profile && report && (
          <ResultPanel
            user={user}
            imageUrl={imageUrl}
            report={report}
            personalTier={personalTier}
            onPersonalTierChange={handlePersonalTierChange}
            onScanAgain={handleScanAgain}
            onNewSearch={handleNewSearch}
          />
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
