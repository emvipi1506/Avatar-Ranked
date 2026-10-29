import { ArrowRight, BadgeCheck, Flame, Search } from "lucide-react";
import Alert from "@/components/ui/Alert";
import AvatarFrame from "@/components/ui/AvatarFrame";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import PersonalTasteControl from "./PersonalTasteControl";
import type { PersonalTierSelection, RobloxUser } from "@/types";

export interface TargetCardProps {
  user: RobloxUser;
  imageUrl: string | null;
  personalTier: PersonalTierSelection;
  onPersonalTierChange: (tier: PersonalTierSelection) => void;
  onScan: () => void;
  onChangeUsername: () => void;
  error?: string | null;
}

export default function TargetCard({
  user,
  imageUrl,
  personalTier,
  onPersonalTierChange,
  onScan,
  onChangeUsername,
  error,
}: TargetCardProps) {
  return (
    <section className="nb-section" aria-labelledby="target-title">
      <div className="nb-container max-w-5xl">
        <div className="grid items-start gap-8 lg:grid-cols-[260px_1fr]">
          <Card variant="lemon" padding="sm" rotate={-1} className="mx-auto w-full max-w-[280px] lg:mx-0">
            <AvatarFrame
              displayName={user.displayName}
              username={user.name}
              imageUrl={imageUrl}
              priority
              showFallbackChip
              className="w-full"
              sizes="(max-width: 1024px) 70vw, 250px"
            />
            <p className="mt-3 truncate rounded-nb-sm border-2 border-ink bg-surface px-2.5 py-1.5 text-center font-mono text-xs font-bold text-ink">
              @{user.name}
            </p>
          </Card>

          <div>
            <Badge variant="accent">TARGET ACQUIRED</Badge>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <h2
                id="target-title"
                tabIndex={-1}
                className="font-display text-[length:var(--fs-2xl)] font-extrabold uppercase leading-[0.95] tracking-[-0.02em] text-ink focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-ink"
              >
                {user.displayName}
              </h2>
              {user.hasVerifiedBadge && (
                <span title="Tài khoản đã xác minh">
                  <BadgeCheck className="h-6 w-6 text-info" aria-label="Đã xác minh" />
                </span>
              )}
            </div>
            <p className="mt-1 font-mono text-sm font-bold text-muted">
              @{user.name} · ID #{user.id}
            </p>
            <p className="mt-3 max-w-[58ch] text-base leading-[1.6] text-ink-2">
              Đã tìm thấy avatar. Chọn gu cá nhân nếu bạn muốn, hoặc để hệ thống chấm 100% — sau đó
              bấm roast.
            </p>

            {error && (
              <div className="mt-5">
                <Alert
                  variant="danger"
                  title="Quét avatar chưa thành công"
                  action={
                    <Button type="button" size="sm" variant="secondary" onClick={onScan}>
                      Thử lại
                    </Button>
                  }
                >
                  {error}
                </Alert>
              </div>
            )}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                size="lg"
                onClick={onScan}
                iconLeft={<Flame className="h-5 w-5" aria-hidden />}
                iconRight={<ArrowRight className="h-4 w-4" aria-hidden />}
              >
                Roast &amp; chấm điểm
              </Button>
              <Button
                type="button"
                size="lg"
                variant="ghost"
                onClick={onChangeUsername}
                iconLeft={<Search className="h-4 w-4" aria-hidden />}
              >
                Đổi username
              </Button>
            </div>

            <PersonalTasteControl
              className="mt-7"
              value={personalTier}
              onChange={onPersonalTierChange}
            />

            <p className="mt-3 font-mono text-[length:var(--fs-2xs)] font-bold uppercase tracking-[0.05em] text-muted">
              Có thể đổi gu sau khi có kết quả — điểm sẽ cập nhật ngay.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
