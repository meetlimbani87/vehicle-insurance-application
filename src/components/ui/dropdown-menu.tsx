import * as React from "react";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface DropdownContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}
const DropdownContext = createContext<DropdownContextValue | null>(null);

function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div ref={rootRef} className="relative inline-block text-left">
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

function useDropdown() {
  const ctx = useContext(DropdownContext);
  if (!ctx) throw new Error("DropdownMenu components must be used within <DropdownMenu>");
  return ctx;
}

function DropdownMenuTrigger({ children, className }: { children: React.ReactNode; className?: string }) {
  const { open, setOpen } = useDropdown();
  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      aria-expanded={open}
      aria-haspopup="menu"
      className={cn("cursor-pointer", className)}
    >
      {children}
    </button>
  );
}

function DropdownMenuContent({
  children,
  className,
  align = "end",
}: {
  children: React.ReactNode;
  className?: string;
  align?: "start" | "end";
}) {
  const { open } = useDropdown();
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="menu"
          initial={{ opacity: 0, y: -6, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.97 }}
          transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "absolute z-50 mt-2 min-w-[14rem] rounded-xl border border-border bg-popover p-1.5 text-popover-foreground shadow-[0_16px_40px_rgba(16,24,40,0.14)]",
            align === "end" ? "right-0" : "left-0",
            className
          )}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DropdownMenuItem({
  children,
  className,
  onClick,
  destructive,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  destructive?: boolean;
}) {
  const { setOpen } = useDropdown();
  return (
    <button
      type="button"
      role="menuitem"
      onClick={() => {
        onClick?.();
        setOpen(false);
      }}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors cursor-pointer text-left focus-visible:outline-none focus-visible:bg-muted",
        destructive ? "text-destructive hover:bg-destructive/10" : "text-foreground hover:bg-muted",
        className
      )}
    >
      {children}
    </button>
  );
}

function DropdownMenuLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("px-2.5 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide", className)}>{children}</div>;
}

function DropdownMenuSeparator({ className }: { className?: string }) {
  return <div className={cn("my-1.5 h-px bg-border", className)} />;
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
};
