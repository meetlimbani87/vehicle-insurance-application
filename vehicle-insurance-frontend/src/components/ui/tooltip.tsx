import { useState, useRef, type ReactNode } from "react";
import { AnimatePresence, motion, type TargetAndTransition } from "framer-motion";
import { cn } from "@/lib/utils";

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
  disabled?: boolean;
}

const SIDE_CLASSES: Record<string, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

const SIDE_OFFSET: Record<string, { hidden: TargetAndTransition; visible: TargetAndTransition }> = {
  top: { hidden: { opacity: 0, y: 4 }, visible: { opacity: 1, y: 0 } },
  bottom: { hidden: { opacity: 0, y: -4 }, visible: { opacity: 1, y: 0 } },
  left: { hidden: { opacity: 0, x: 4 }, visible: { opacity: 1, x: 0 } },
  right: { hidden: { opacity: 0, x: -4 }, visible: { opacity: 1, x: 0 } },
};

export default function Tooltip({ content, children, side = "top", className, disabled }: TooltipProps) {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = () => {
    if (disabled) return;
    timeoutRef.current = setTimeout(() => setOpen(true), 250);
  };
  const hide = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setOpen(false);
  };

  return (
    <div className="relative inline-flex" onMouseEnter={show} onMouseLeave={hide} onFocus={show} onBlur={hide}>
      {children}
      <AnimatePresence>
        {open && !disabled && (
          <motion.div
            initial={SIDE_OFFSET[side].hidden}
            animate={SIDE_OFFSET[side].visible}
            exit={SIDE_OFFSET[side].hidden}
            transition={{ duration: 0.12 }}
            className={cn(
              "pointer-events-none absolute z-[60] whitespace-nowrap rounded-md bg-brand-primary px-2.5 py-1.5 text-xs font-medium text-white shadow-lg",
              SIDE_CLASSES[side],
              className
            )}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
