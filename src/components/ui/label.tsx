import { LabelHTMLAttributes, forwardRef } from "react";
import { cn } from "../../lib/utils";

export const Label = forwardRef<HTMLLabelElement, LabelHTMLAttributes<HTMLLabelElement>>(function Label(
  { className, ...props },
  ref
) {
  return (
    <label
      ref={ref}
      className={cn("block text-sm font-semibold text-slate-700 dark:text-slate-200", className)}
      {...props}
    />
  );
});
