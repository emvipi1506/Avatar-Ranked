import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "accent" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "border-transparent bg-[linear-gradient(110deg,#46c8ff_0%,#a855f7_55%,#ff4fd8_100%)] text-white shadow-[0_0_28px_rgba(70,200,255,0.28)] hover:brightness-110 hover:shadow-[0_0_40px_rgba(168,85,247,0.42)]",
  secondary:
    "border-white/10 bg-white/[0.04] text-ink hover:border-[rgba(70,200,255,0.45)] hover:bg-[rgba(70,200,255,0.08)]",
  accent:
    "border-transparent bg-cyan text-[#050a14] shadow-[0_0_26px_rgba(70,200,255,0.3)] hover:bg-[#7ad8ff]",
  ghost:
    "border-transparent bg-transparent text-ink-2 hover:bg-white/[0.06] hover:text-white",
  danger:
    "border-[rgba(255,138,155,0.35)] bg-danger-bg text-danger hover:bg-[rgba(255,138,155,0.14)]",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "min-h-10 px-3.5 py-2.5 text-xs",
  md: "min-h-12 px-5 py-3.5 text-sm",
  lg: "min-h-14 px-[28px] py-[18px] text-base",
};

export interface ButtonStyleOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  className?: string;
}

/** Dùng chung cho <button> và <Link> để CTA trông giống hệt nhau. */
export function buttonClasses({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
}: ButtonStyleOptions = {}): string {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-xl border font-body font-bold uppercase tracking-[0.04em] transition-[transform,box-shadow,background-color,color,filter] duration-[180ms] ease-[var(--ease-pop)]",
    "hover:-translate-y-px active:translate-y-0",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan",
    "disabled:translate-y-0 disabled:cursor-not-allowed disabled:border-white/5 disabled:bg-[var(--c-disabled-bg)] disabled:bg-none disabled:text-[var(--c-disabled-ink)] disabled:opacity-60 disabled:shadow-none",
    VARIANT_CLASSES[variant],
    SIZE_CLASSES[size],
    fullWidth && "w-full",
    className,
  );
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
}

export default function Button({
  variant = "primary",
  size = "md",
  loading = false,
  iconLeft,
  iconRight,
  fullWidth = false,
  className,
  children,
  disabled,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses({ variant, size, fullWidth, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? (
        <span
          aria-hidden
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      ) : (
        iconLeft
      )}
      <span>{children}</span>
      {!loading && iconRight}
    </button>
  );
}
