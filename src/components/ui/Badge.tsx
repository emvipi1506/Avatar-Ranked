import type { HTMLAttributes, ReactNode } from "react";
import { RARITIES } from "@/lib/rarity";
import { cn } from "@/lib/cn";
import type { RarityTier } from "@/types";

export type BadgeVariant = "neutral" | "outline" | "accent" | "lemon" | "mint" | "coral" | "violet" | "cyan";

const VARIANT_CLASSES: Record<Exclude<BadgeVariant, "neutral" | "outline" | "accent">, string> = {
  lemon: "border-[rgba(70,200,255,0.35)] bg-[rgba(70,200,255,0.10)] text-cyan",
  mint: "border-[rgba(112,227,182,0.32)] bg-[rgba(112,227,182,0.09)] text-mint",
  coral: "border-[rgba(255,0,127,0.35)] bg-[rgba(255,0,127,0.10)] text-coral-ink",
  violet: "border-[rgba(168,85,247,0.35)] bg-[rgba(168,85,247,0.10)] text-violet",
  cyan: "border-[rgba(70,200,255,0.35)] bg-[rgba(70,200,255,0.10)] text-cyan",
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
  const rarity = tier ? RARITIES[tier] : null;
  const tierStyle = rarity
    ? {
        backgroundColor: `${rarity.color}1a`,
        borderColor: `${rarity.color}66`,
        color: rarity.color,
        boxShadow: `0 0 18px ${rarity.glowColor}`,
      }
    : undefined;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[length:var(--fs-2xs)] font-bold uppercase tracking-[0.08em]",
        variant === "neutral" && "border-white/10 bg-white/[0.05] text-ink-2",
        variant === "outline" && "border-line bg-transparent text-ink-2",
        variant === "accent" &&
          "border-[rgba(70,200,255,0.35)] bg-[rgba(70,200,255,0.10)] text-cyan shadow-[0_0_18px_rgba(70,200,255,0.12)]",
        !tier && VARIANT_CLASSES[variant as keyof typeof VARIANT_CLASSES],
        className,
      )}
      style={{ ...tierStyle, ...style }}
      {...rest}
    >
      {children}
    </span>
  );
}
