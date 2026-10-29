import ActionBar from "./ActionBar";
import CosplayPanel from "./CosplayPanel";
import CriteriaGrid from "./CriteriaGrid";
import DataQualityBanner from "./DataQualityBanner";
import ImprovementPanel from "./ImprovementPanel";
import LimitationsPanel from "./LimitationsPanel";
import PersonalTasteControl from "./PersonalTasteControl";
import RobuxPanel from "./RobuxPanel";
import StyleTagsPanel from "./StyleTagsPanel";
import VerdictBubbles from "./VerdictBubbles";
import VerdictHero from "./VerdictHero";
import { applyDataQualityCap, getRarityForScore } from "@/lib/rarity";
import type { PersonalTierSelection, RobloxUser, ScoreReport } from "@/types";

export interface ResultPanelProps {
  user: RobloxUser;
  imageUrl: string | null;
  report: ScoreReport;
  personalTier: PersonalTierSelection;
  onPersonalTierChange: (tier: PersonalTierSelection) => void;
  onScanAgain: () => void;
  onNewSearch: () => void;
}

export default function ResultPanel({
  user,
  imageUrl,
  report,
  personalTier,
  onPersonalTierChange,
  onScanAgain,
  onNewSearch,
}: ResultPanelProps) {
  const systemTier = applyDataQualityCap(
    getRarityForScore(report.aiScore),
    report.dataQuality.level,
  ).tier;

  return (
    <section id="ket-qua" aria-labelledby="verdict-title" className="nb-section scroll-mt-24">
      <div className="nb-container max-w-5xl">
        <DataQualityBanner dataQuality={report.dataQuality} className="mb-6" />

        <VerdictHero user={user} imageUrl={imageUrl} report={report} />

        <VerdictBubbles report={report} className="mt-9" />

        <CriteriaGrid report={report} className="mt-10" />

        <PersonalTasteControl
          className="mt-6"
          value={personalTier}
          onChange={onPersonalTierChange}
          systemTier={systemTier}
        />

        <div className="mt-8 space-y-3">
          <StyleTagsPanel report={report} />
          <CosplayPanel cosplayResult={report.cosplayResult} />
          <RobuxPanel value={report.value} />
          <ImprovementPanel report={report} />
          <LimitationsPanel report={report} />
        </div>

        <div className="mt-10">
          <ActionBar
            user={user}
            report={report}
            onScanAgain={onScanAgain}
            onNewSearch={onNewSearch}
          />
        </div>
      </div>
    </section>
  );
}
