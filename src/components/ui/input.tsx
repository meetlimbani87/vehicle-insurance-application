import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground hover:border-brand-secondary/40 focus-visible:outline-none focus-visible:border-brand-secondary focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-input aria-[invalid=true]:border-destructive aria-[invalid=true]:hover:border-destructive aria-[invalid=true]:focus-visible:border-destructive aria-[invalid=true]:focus-visible:ring-destructive/30",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
