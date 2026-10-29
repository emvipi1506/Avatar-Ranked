import { Flame, Lightbulb, Sparkles } from "lucide-react";
import SpeechBubble from "@/components/ui/SpeechBubble";
import { getVerdictBubbles } from "@/lib/ui/verdict";
import { cn } from "@/lib/cn";
import type { ScoreReport } from "@/types";

const BUBBLE_ICONS = {
  praise: <Sparkles className="h-3.5 w-3.5 text-success" aria-hidden />,
  roast: <Flame className="h-3.5 w-3.5 text-danger" aria-hidden />,
  tip: <Lightbulb className="h-3.5 w-3.5 text-info" aria-hidden />,
} as const;

export interface VerdictBubblesProps {
  report: ScoreReport;
  className?: string;
}

export default function VerdictBubbles({ report, className }: VerdictBubblesProps) {
  const bubbles = getVerdictBubbles(report);

  return (
    <div className={cn("grid gap-6 lg:grid-cols-3", className)}>
      {bubbles.map((bubble, index) => (
        <SpeechBubble
          key={bubble.tone}
          tone={bubble.tone}
          speaker={bubble.speaker}
          tail={index === 1 ? "right" : "left"}
          icon={BUBBLE_ICONS[bubble.tone]}
          className={cn("mb-3 h-full", index === 1 && "md:mt-6")}
        >
          {bubble.text}
        </SpeechBubble>
      ))}
    </div>
  );
}
