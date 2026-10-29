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
          "h-14 w-full rounded-nb-md border-3 border-ink bg-surface px-4 text-base font-semibold text-ink shadow-hard-2 outline-none transition-[box-shadow,background-color] duration-[120ms] placeholder:font-normal placeholder:text-muted focus:shadow-hard-3 disabled:cursor-not-allowed disabled:bg-[var(--c-disabled-bg)] disabled:text-[var(--c-disabled-ink)] disabled:shadow-[3px_3px_0_var(--c-disabled-ink)]",
          prefix && "pl-11",
          invalid && "border-danger bg-danger-bg shadow-[3px_3px_0_var(--c-danger)]",
          className,
        )}
        {...rest}
      />
    </div>
  );
});

export default Input;
