import { BadgeCheck } from "lucide-react";
import AvatarFrame from "@/components/ui/AvatarFrame";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import ScoreDisplay from "@/components/ui/ScoreDisplay";
import Stamp from "@/components/ui/Stamp";
import { formatScore100 } from "@/lib/format";
import {
  getFormulaLabel,
  getPersonalLabel,
  getVerdictView,
} from "@/lib/ui/verdict";
import type { RobloxUser, ScoreReport } from "@/types";

export interface VerdictHeroProps {
  user: RobloxUser;
  imageUrl: string | null;
  report: ScoreReport;
}

export default function VerdictHero({ user, imageUrl, report }: VerdictHeroProps) {
  const verdict = getVerdictView(report);

  return (
    <Card padding="lg" className="relative overflow-hidden">
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-2 border-b-3 border-ink"
        style={{ backgroundColor: report.rarity.color }}
      />

      <div className="grid gap-7 md:grid-cols-[235px_1fr] md:items-start">
        <div className="mx-auto w-full max-w-[270px] md:mx-0">
          <AvatarFrame
            displayName={user.displayName}
            username={user.name}
            imageUrl={imageUrl}
            priority
            showFallbackChip
            className="w-full"
            sizes="(max-width: 768px) 70vw, 235px"
          />
          <div className="mt-3 flex items-center justify-between gap-2 rounded-nb-sm border-2 border-ink bg-surface-2 px-2.5 py-2">
            <span className="truncate font-mono text-xs font-bold text-ink">@{user.name}</span>
            <span className="shrink-0 font-mono text-[10px] font-bold uppercase tracking-[0.04em] text-muted">
              #{user.id}
            </span>
          </div>
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[length:var(--fs-xs)] font-bold uppercase tracking-[0.12em] text-coral-ink">
              Final verdict
            </span>
            <Badge tier={report.rarity.tier}>{report.rarity.label}</Badge>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <h2
              id="verdict-title"
              tabIndex={-1}
              className="font-display text-[length:var(--fs-2xl)] font-extrabold uppercase leading-[0.95] tracking-[-0.02em] text-ink focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-ink"
            >
              {user.displayName}
            </h2>
            {user.hasVerifiedBadge && (
              <BadgeCheck className="h-6 w-6 text-info" aria-label="Tài khoản Roblox đã xác minh" />
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-end justify-between gap-4 border-b-2 border-line-soft pb-4">
            <ScoreDisplay score={report.total} label="Điểm tổng" />
            <Stamp label={verdict.stamp} tone={verdict.tone} size="md" rotation={-7} />
          </div>

          <p className="mt-4 text-[length:var(--fs-md)] font-semibold italic leading-[1.55] text-ink">
            &ldquo;{verdict.quote}&rdquo;
          </p>
          <p className="mt-2 text-sm leading-[1.6] text-ink-2">{report.rarity.description}</p>

          <dl className="mt-5 grid gap-2 sm:grid-cols-3">
            <div className="rounded-nb-sm border-2 border-ink bg-surface-2 px-3 py-2">
              <dt className="font-mono text-[10px] font-bold uppercase tracking-[0.05em] text-muted">
                Hệ thống
              </dt>
              <dd className="mt-0.5 font-mono text-sm font-bold tabular-nums text-ink">
                {formatScore100(report.aiScore)}/100
              </dd>
            </div>
            <div className="rounded-nb-sm border-2 border-ink bg-mint px-3 py-2 text-on-accent">
              <dt className="font-mono text-[10px] font-bold uppercase tracking-[0.05em] text-on-accent-2">
                Gu cá nhân
              </dt>
              <dd className="mt-0.5 font-mono text-sm font-bold text-on-accent">
                {getPersonalLabel(report)}
              </dd>
            </div>
            <div className="rounded-nb-sm border-2 border-ink bg-lemon px-3 py-2 text-on-accent">
              <dt className="font-mono text-[10px] font-bold uppercase tracking-[0.05em] text-on-accent-2">
                Điểm gốc
              </dt>
              <dd className="mt-0.5 font-mono text-sm font-bold tabular-nums text-on-accent">
                {formatScore100(report.total)}/100
              </dd>
            </div>
          </dl>

          <p className="mt-3 font-mono text-[length:var(--fs-2xs)] font-bold uppercase tracking-[0.05em] text-muted">
            {getFormulaLabel(report)} · Điểm chính hiển thị /10, bảng tiêu chí dùng /100.
          </p>
        </div>
      </div>
    </Card>
  );
}
