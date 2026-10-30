import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type CardVariant = "surface" | "lemon" | "mint" | "violet" | "cyan" | "flat";
export type CardPadding = "none" | "sm" | "md" | "lg";

const VARIANT_CLASSES: Record<CardVariant, string> = {
  surface: "glass-card border-[rgba(70,200,255,0.15)] bg-[rgba(16,21,40,0.65)]",
  lemon: "border-[rgba(70,200,255,0.30)] bg-[rgba(70,200,255,0.09)]",
  mint: "border-[rgba(112,227,182,0.28)] bg-[rgba(112,227,182,0.08)]",
  violet: "border-[rgba(168,85,247,0.30)] bg-[rgba(168,85,247,0.09)]",
  cyan: "border-[rgba(70,200,255,0.30)] bg-[rgba(70,200,255,0.09)]",
  flat: "border-line-soft bg-surface-2/70",
};

const PADDING_CLASSES: Record<CardPadding, string> = {
  none: "",
  sm: "p-4",
  md: "p-5 sm:p-6",
  lg: "p-6 sm:p-8",
};

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  /** Chỉ dùng cho sticker ngắn; không xoay card chứa text dài. */
  rotate?: number;
  interactive?: boolean;
  children?: ReactNode;
}

export default function Card({
  variant = "surface",
  padding = "md",
  rotate,
  interactive = false,
  className,
  children,
  style,
  ...rest
}: CardProps) {
  return (
    <div
      className={cn(
        "relative rounded-nb-lg border text-ink backdrop-blur-xl",
        VARIANT_CLASSES[variant],
        PADDING_CLASSES[padding],
        variant !== "flat" && "shadow-[0_0_38px_rgba(70,200,255,0.10),0_16px_44px_rgba(0,0,0,0.42)]",
        interactive &&
          "transition-[transform,box-shadow,border-color] duration-[180ms] ease-[var(--ease-pop)] hover:-translate-y-0.5 hover:border-[rgba(70,200,255,0.4)] hover:shadow-hard-4 active:translate-y-0",
        className,
      )}
      style={
        rotate
          ? ({ ...style, transform: `rotate(${rotate}deg)` } as CSSProperties)
          : style
      }
      {...rest}
    >
      {children}
    </div>
  );
}
