import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
  prefix?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { invalid = false, prefix, className, ...rest },
  ref,
) {
  return (
    <div className="relative">
      {prefix && (
        <span
          aria-hidden
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-mono text-lg font-bold text-muted"
        >
          {prefix}
        </span>
      )}
      <input
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          "h-14 w-full rounded-xl border border-white/10 bg-[rgba(9,14,28,0.82)] px-4 text-base font-semibold text-ink outline-none transition-[border-color,box-shadow,background-color] duration-[140ms] placeholder:font-normal placeholder:text-muted focus:border-[rgba(70,200,255,0.55)] focus:shadow-[0_0_0_3px_rgba(70,200,255,0.12),0_0_28px_rgba(70,200,255,0.12)] disabled:cursor-not-allowed disabled:bg-[var(--c-disabled-bg)] disabled:text-[var(--c-disabled-ink)]",
          prefix && "pl-11",
          invalid &&
            "border-[rgba(255,138,155,0.55)] bg-danger-bg shadow-[0_0_0_3px_rgba(255,138,155,0.10)]",
          className,
        )}
        {...rest}
      />
    </div>
  );
});

export default Input;
