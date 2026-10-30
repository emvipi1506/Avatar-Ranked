import type { HTMLAttributes, ReactNode } from "react";
import { RARITIES } from "@/lib/rarity";
import { cn } from "@/lib/cn";
import type { RarityTier } from "@/types";

export type BadgeVariant = "neutral" | "outline" | "accent" | "lemon" | "mint" | "coral" | "violet" | "cyan";

const VARIANT_CLASSES: Record<Exclude<BadgeVariant, "neutral" | "outline" | "accent">, string> = {
  lemon: "bg-lemon text-on-accent",
  mint: "bg-mint text-on-accent",
  coral: "bg-coral text-on-accent",
  violet: "bg-violet text-on-accent",
  cyan: "bg-cyan text-on-accent",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  tier?: RarityTier;
  children?: ReactNode;
}

export default function Badge({
  variant = "neutral",
  tier,
  className,
  children,
  style,
  ...rest
}: BadgeProps) {
  const tierStyle = tier
    ? { backgroundColor: RARITIES[tier].color, color: "var(--c-on-accent)" }
    : undefined;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-nb-sm border-2 border-ink px-2 py-1 font-mono text-[length:var(--fs-2xs)] font-bold uppercase tracking-[0.06em]",
        variant === "neutral" && "bg-surface-2 text-ink shadow-hard-1",
        variant === "outline" && "bg-transparent text-ink",
        variant === "accent" && "bg-lemon text-on-accent shadow-hard-1",
        tier ? "shadow-hard-1" : VARIANT_CLASSES[variant as keyof typeof VARIANT_CLASSES],
        className,
      )}
      style={{ ...tierStyle, ...style }}
      {...rest}
    >
      {children}
    </span>
  );
}
