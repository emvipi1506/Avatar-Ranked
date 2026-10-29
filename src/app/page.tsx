import SiteFooter from "@/components/ui/SiteFooter";
import SiteHeader from "@/components/ui/SiteHeader";
import SkipLink from "@/components/ui/SkipLink";
import FAQ from "@/components/landing/FAQ";
import FinalCTA from "@/components/landing/FinalCTA";
import HowItWorks from "@/components/landing/HowItWorks";
import LandingHero from "@/components/landing/LandingHero";
import RarityGuide from "@/components/landing/RarityGuide";
import Ticker from "@/components/landing/Ticker";
import VerdictPreview from "@/components/landing/VerdictPreview";

export default function LandingPage() {
  return (
    <div className="nb-root flex min-h-dvh flex-col">
      <SkipLink />
      <SiteHeader variant="landing" />
      <main id="main-content" className="flex-1">
        <LandingHero />
        <Ticker />
        <HowItWorks />
        <VerdictPreview />
        <RarityGuide />
        <FAQ />
        <FinalCTA />
      </main>
      <SiteFooter />
    </div>
  );
}
