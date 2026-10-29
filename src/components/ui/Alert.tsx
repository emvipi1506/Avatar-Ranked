import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, Info, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/cn";

export type AlertVariant = "danger" | "warning" | "success" | "info";

const VARIANT = {
  danger: {
    box: "bg-danger-bg",
    title: "text-danger",
    icon: <ShieldAlert className="h-5 w-5" aria-hidden />,
  },
  warning: {
    box: "bg-warning-bg",
    title: "text-warning",
    icon: <AlertTriangle className="h-5 w-5" aria-hidden />,
  },
  success: {
    box: "bg-success-bg",
    title: "text-success",
    icon: <CheckCircle2 className="h-5 w-5" aria-hidden />,
  },
  info: {
    box: "bg-info-bg",
    title: "text-info",
    icon: <Info className="h-5 w-5" aria-hidden />,
  },
} as const;

export interface AlertProps {
  variant?: AlertVariant;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export default function Alert({
  variant = "info",
  title,
  children,
  action,
  className,
}: AlertProps) {
  const config = VARIANT[variant];

  return (
    <div
      role={variant === "danger" ? "alert" : "status"}
      className={cn(
        "flex items-start gap-3 rounded-nb-md border-3 border-ink p-4 shadow-hard-2",
        config.box,
        className,
      )}
    >
      <span className={cn("mt-0.5 shrink-0", config.title)}>{config.icon}</span>
      <div className="min-w-0 flex-1">
        <p className={cn("font-body text-sm font-bold", config.title)}>{title}</p>
        {children && <div className="mt-1 text-sm leading-[1.5] text-ink-2">{children}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
