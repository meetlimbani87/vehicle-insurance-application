import * as React from "react";
import { cn } from "@/lib/utils";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "success" | "warning" | "destructive";
}

function Alert({ className, variant = "default", ...props }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        "relative w-full rounded-xl border px-4 py-3.5 text-sm flex items-start gap-3",
        {
          "bg-secondary/60 border-border text-foreground": variant === "default",
          "bg-brand-accent/[0.08] border-brand-accent/20 text-brand-accent": variant === "success",
          "bg-brand-warn/[0.08] border-brand-warn/20 text-brand-warn": variant === "warning",
          "bg-destructive/[0.08] border-destructive/20 text-destructive": variant === "destructive",
        },
        className
      )}
      {...props}
    />
  );
}

function AlertTitle({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("font-display font-semibold leading-none mb-1", className)} {...props} />;
}

function AlertDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm opacity-90 leading-relaxed", className)} {...props} />;
}

export { Alert, AlertTitle, AlertDescription };
