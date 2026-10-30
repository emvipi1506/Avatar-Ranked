import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "accent" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-coral text-on-accent shadow-hard-2 hover:shadow-hard-3",
  secondary: "bg-surface text-ink shadow-hard-2 hover:shadow-hard-3",
  accent: "bg-lemon text-on-accent shadow-hard-2 hover:shadow-hard-3",
  ghost:
    "border-2 bg-transparent text-ink shadow-none hover:bg-surface-2 hover:shadow-none",
  danger: "bg-danger-bg text-danger shadow-hard-2 hover:shadow-hard-3",
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
    "inline-flex items-center justify-center gap-2 rounded-nb-md border-3 border-ink font-body font-bold uppercase tracking-[0.04em] transition-[transform,box-shadow,background-color,color] duration-[180ms] ease-[var(--ease-pop)]",
    "hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-hard-1",
    "focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-ink",
    "disabled:translate-none disabled:cursor-not-allowed disabled:border-[var(--c-disabled-ink)] disabled:bg-[var(--c-disabled-bg)] disabled:text-[var(--c-disabled-ink)] disabled:shadow-[3px_3px_0_var(--c-disabled-ink)]",
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
