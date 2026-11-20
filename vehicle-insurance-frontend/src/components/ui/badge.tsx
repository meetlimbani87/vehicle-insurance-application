import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
  dot?: boolean;
}

function Badge({ className, variant = "default", dot, children, ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "font-display inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-tight transition-colors",
        {
          "border-transparent bg-primary text-primary-foreground": variant === "default",
          "border-transparent bg-secondary text-secondary-foreground": variant === "secondary",
          "border-transparent bg-destructive text-destructive-foreground": variant === "destructive",
          "text-foreground": variant === "outline",
          "border-transparent bg-brand-accent/10 text-brand-accent": variant === "success",
          "border-transparent bg-brand-warn/10 text-brand-warn": variant === "warning",
        },
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn("h-1.5 w-1.5 rounded-full", {
            "bg-primary-foreground": variant === "default",
            "bg-secondary-foreground": variant === "secondary",
            "bg-destructive-foreground": variant === "destructive",
            "bg-foreground": variant === "outline",
            "bg-brand-accent": variant === "success",
            "bg-brand-warn": variant === "warning",
          })}
        />
      )}
      {children}
    </div>
  );
}

export { Badge };
