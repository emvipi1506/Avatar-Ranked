import { Info } from "lucide-react";
import Accordion from "@/components/ui/Accordion";
import type { ScoreReport } from "@/types";

export interface LimitationsPanelProps {
  report: ScoreReport;
  className?: string;
}

export default function LimitationsPanel({ report, className }: LimitationsPanelProps) {
  return (
    <Accordion
      id="limitations"
      title="Giới hạn & phương pháp"
      eyebrow="Minh bạch cách chấm"
      icon={<Info className="h-5 w-5 text-coral-ink" aria-hidden />}
      className={className}
    >
      <div className="space-y-3 text-sm leading-[1.6] text-ink-2">
        <p>
          Phương pháp: <strong className="text-ink">{report.analysisMethod}</strong> — chấm từ
          metadata vật phẩm, tên item, catalog và bảng màu pixel. Không dùng mô hình học máy để suy
          diễn nội dung không có trong dữ liệu.
        </p>

        {report.limitations.length > 0 ? (
          <ul className="space-y-1.5">
            {report.limitations.map((item, index) => (
              <li key={`limitation-${index}`} className="flex items-start gap-2">
                <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-muted" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="italic text-muted">Không có giới hạn bổ sung được ghi nhận cho lần quét này.</p>
        )}

        <p className="border-t-2 border-line-soft pt-3 font-mono text-[length:var(--fs-2xs)] font-bold uppercase tracking-[0.04em] text-muted">
          Kết quả mang tính giải trí, không phải đánh giá chính thức của Roblox Corporation.
        </p>
      </div>
    </Accordion>
  );
}
