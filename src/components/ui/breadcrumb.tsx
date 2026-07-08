import { Fragment } from "react";
import { Link } from "react-router";
import { ChevronRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

export default function Breadcrumb({ items, className }: { items: BreadcrumbItem[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center gap-1.5 text-sm", className)}>
      <Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors flex items-center">
        <Home className="h-3.5 w-3.5" />
      </Link>
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <Fragment key={`${item.label}-${i}`}>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
            {item.to && !isLast ? (
              <Link to={item.to} className="text-muted-foreground hover:text-foreground transition-colors truncate max-w-[10rem]">
                {item.label}
              </Link>
            ) : (
              <span className={cn("truncate max-w-[14rem]", isLast ? "text-foreground font-medium" : "text-muted-foreground")}>
                {item.label}
              </span>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
