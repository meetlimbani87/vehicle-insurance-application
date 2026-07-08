import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  compact?: boolean;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
  compact,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center rounded-xl border border-dashed border-border bg-muted/30",
        compact ? "py-8 px-4" : "py-14 px-6",
        className
      )}
    >
      <div className={cn("rounded-full bg-muted flex items-center justify-center mb-3.5", compact ? "h-10 w-10" : "h-14 w-14")}>
        <Icon className={cn("text-muted-foreground", compact ? "h-5 w-5" : "h-6 w-6")} />
      </div>
      <p className="font-display font-semibold text-foreground text-sm">{title}</p>
      {description && <p className="text-muted-foreground text-xs mt-1 max-w-xs">{description}</p>}
      {actionLabel && onAction && (
        <Button size="sm" variant="outline" className="mt-4" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
