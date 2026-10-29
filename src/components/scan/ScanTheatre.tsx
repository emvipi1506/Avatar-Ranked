import { CheckCircle2, Circle, FastForward, Loader2 } from "lucide-react";
import AvatarFrame from "@/components/ui/AvatarFrame";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ProgressBar from "@/components/ui/ProgressBar";
import type { RobloxUser, ScanPhase } from "@/types";

export interface ScanTheatreProps {
  user: RobloxUser;
  imageUrl: string | null;
  phase: Extract<ScanPhase, "init" | "scanning" | "calculating">;
  progress: number;
  slow?: boolean;
  onSkip: () => void;
}

export default function ScanTheatre({
  user,
  imageUrl,
  phase,
  progress,
  slow = false,
  onSkip,
}: ScanTheatreProps) {
  const status =
    phase === "init"
      ? "Đang kết nối Roblox API..."
      : phase === "calculating"
        ? "Đang tính điểm và kiểm tra dữ liệu..."
        : progress < 35
          ? "Đang lấy dữ liệu avatar..."
          : progress < 70
            ? "Đang đối chiếu 270 aesthetics..."
            : "Đang kiểm tra catalog và bảng màu...";

  const steps = [
    {
      label: "Lấy dữ liệu avatar",
      active: phase === "init",
      done: phase === "scanning" || phase === "calculating",
    },
    {
      label: "Đối chiếu 270 aesthetics",
      active: phase === "scanning",
      done: phase === "calculating",
    },
    {
      label: "Tính điểm & kiểm tra dữ liệu",
      active: phase === "calculating",
      done: false,
    },
  ];

  return (
    <section className="nb-section" aria-labelledby="scan-theatre-title">
      <div className="nb-container max-w-4xl">
        <Card padding="lg" className="relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-line-soft pb-4">
            <span className="inline-flex items-center gap-2 rounded-nb-sm border-2 border-ink bg-lemon px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-ink shadow-hard-1">
              <span className="h-2 w-2 animate-pulse rounded-full bg-danger" aria-hidden />
              Đang quét
            </span>
            <Button type="button" variant="ghost" size="sm" onClick={onSkip} iconLeft={<FastForward className="h-3.5 w-3.5" aria-hidden />}>
              Bỏ qua animation
            </Button>
          </div>

          <div className="mt-7 grid items-center gap-8 md:grid-cols-[280px_1fr]">
            <div className="relative mx-auto w-[min(72vw,280px)]">
              <AvatarFrame
                displayName={user.displayName}
                username={user.name}
                imageUrl={imageUrl}
                priority
                showFallbackChip
                className="w-full"
                sizes="(max-width: 768px) 72vw, 280px"
              />
              {phase === "scanning" && (
                <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-nb-md">
                  <div className="nb-scanline absolute inset-x-0 h-16 border-y-4 border-coral bg-coral/20" />
                </div>
              )}
              {phase === "calculating" && (
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 grid place-items-center rounded-nb-md bg-ink/55"
                >
                  <span className="nb-stamp grid h-24 w-24 place-items-center rounded-full border-3 border-ink bg-lemon font-display text-sm font-extrabold uppercase leading-none text-ink shadow-hard-2">
                    Tính điểm
                  </span>
                </div>
              )}
            </div>

            <div>
              <h2
                id="scan-theatre-title"
                className="max-w-[18ch] font-display text-[length:var(--fs-2xl)] font-extrabold uppercase leading-[0.95] tracking-[-0.02em] text-ink"
              >
                Đang soi avatar của {user.displayName}
              </h2>
              <p className="mt-2 font-mono text-xs font-bold text-muted">@{user.name}</p>

              <p className="mt-4 min-h-6 text-sm font-semibold leading-[1.5] text-ink" aria-live="polite">
                {status}
              </p>

              <ProgressBar className="mt-3" value={progress} label="Tiến trình quét" tone="coral" />

              <ol className="mt-5 space-y-3">
                {steps.map((step) => (
                  <li key={step.label} className="flex items-center gap-2.5">
                    {step.done ? (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-success" aria-hidden />
                    ) : step.active ? (
                      <Loader2 className="h-5 w-5 shrink-0 animate-spin text-ink" aria-hidden />
                    ) : (
                      <Circle className="h-5 w-5 shrink-0 text-line-soft" aria-hidden />
                    )}
                    <span
                      className={`text-sm leading-[1.4] ${step.active || step.done ? "font-semibold text-ink" : "text-muted"}`}
                    >
                      {step.label}
                    </span>
                    <span className="sr-only">
                      {step.done ? "đã xong" : step.active ? "đang chạy" : "chưa bắt đầu"}
                    </span>
                  </li>
                ))}
              </ol>

              {slow && (
                <p className="mt-4 rounded-nb-sm border-2 border-ink bg-warning-bg px-3 py-2 text-xs font-semibold leading-[1.5] text-warning">
                  Vẫn đang xử lý... Bạn có thể bỏ qua animation để xem kết quả sớm hơn.
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
