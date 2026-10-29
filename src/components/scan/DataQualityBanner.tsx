import { AlertTriangle } from "lucide-react";
import Alert from "@/components/ui/Alert";
import type { DataQuality } from "@/types";

export interface DataQualityBannerProps {
  dataQuality: DataQuality;
  className?: string;
}

export default function DataQualityBanner({ dataQuality, className }: DataQualityBannerProps) {
  if (dataQuality.level === "complete" && dataQuality.issues.length === 0) return null;

  return (
    <Alert
      variant={dataQuality.level === "insufficient" ? "danger" : "warning"}
      title="Kết quả dựa trên dữ liệu chưa đầy đủ"
      className={className}
    >
      {dataQuality.issues.length > 0 && (
        <ul className="list-disc space-y-1 pl-4">
          {dataQuality.issues.map((issue) => (
            <li key={issue}>{issue}</li>
          ))}
        </ul>
      )}
      {dataQuality.capApplied && (
        <p className="mt-2 flex items-start gap-1.5 font-semibold">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          Bậc tự động bị giới hạn tối đa ở LEGENDARY cho tới khi dữ liệu được xác minh đầy đủ.
        </p>
      )}
    </Alert>
  );
}
