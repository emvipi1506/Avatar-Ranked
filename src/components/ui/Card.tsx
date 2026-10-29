import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type CardVariant = "surface" | "lemon" | "mint" | "violet" | "cyan" | "flat";
export type CardPadding = "none" | "sm" | "md" | "lg";

const VARIANT_CLASSES: Record<CardVariant, string> = {
  surface: "bg-surface",
  lemon: "bg-lemon",
  mint: "bg-mint",
  violet: "bg-violet",
  cyan: "bg-cyan",
  flat: "bg-surface-2",
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
        "rounded-nb-lg border-3 border-ink",
        VARIANT_CLASSES[variant],
        PADDING_CLASSES[padding],
        variant !== "flat" && "shadow-hard-3",
        interactive &&
          "transition-[transform,box-shadow] duration-[180ms] ease-[var(--ease-pop)] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-hard-4 active:translate-x-0.5 active:translate-y-0.5 active:shadow-hard-2",
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
