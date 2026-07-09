import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

function Dialog({ open, onOpenChange, children }: DialogProps) {
  const panelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    // Move focus into the dialog for keyboard and screen reader users.
    const raf = requestAnimationFrame(() => panelRef.current?.focus());
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      cancelAnimationFrame(raf);
    };
  }, [open, onOpenChange]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => onOpenChange(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <motion.div
              ref={panelRef}
              role="dialog"
              aria-modal="true"
              tabIndex={-1}
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 6 }}
              transition={{ type: "spring", stiffness: 420, damping: 34 }}
              className="relative w-full max-w-lg rounded-2xl border border-border bg-background p-5 sm:p-6 shadow-[0_24px_70px_rgba(16,24,40,0.22)] focus:outline-none"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => onOpenChange(false)}
                aria-label="Close dialog"
                className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <X className="h-4 w-4" />
              </button>
              {children}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}

function DialogHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left mb-4", className)} {...props} />;
}

function DialogTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />;
}

function DialogDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />;
}

function DialogFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4", className)} {...props} />;
}

export { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter };
