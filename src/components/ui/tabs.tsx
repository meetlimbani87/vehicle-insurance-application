import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

function Tabs({ value, onValueChange, children, className }: TabsProps) {
  const groupId = React.useId();
  return (
    <div className={cn("w-full", className)} data-value={value} data-onchange={onValueChange as unknown as string}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(
            child as React.ReactElement<{ value?: string; activeValue?: string; onValueChange?: (v: string) => void; groupId?: string }>,
            { activeValue: value, onValueChange, groupId }
          );
        }
        return child;
      })}
    </div>
  );
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
  activeValue?: string;
  onValueChange?: (value: string) => void;
  groupId?: string;
}

function TabsList({ children, className, activeValue, onValueChange, groupId }: TabsListProps) {
  const listRef = React.useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)) return;
    const triggers = Array.from(listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]') ?? []);
    if (triggers.length === 0) return;
    const currentIndex = triggers.findIndex((t) => t === document.activeElement);
    let nextIndex = currentIndex;
    if (e.key === "ArrowRight") nextIndex = (currentIndex + 1 + triggers.length) % triggers.length;
    if (e.key === "ArrowLeft") nextIndex = (currentIndex - 1 + triggers.length) % triggers.length;
    if (e.key === "Home") nextIndex = 0;
    if (e.key === "End") nextIndex = triggers.length - 1;
    e.preventDefault();
    triggers[nextIndex]?.focus();
    triggers[nextIndex]?.click();
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      onKeyDown={handleKeyDown}
      className={cn("inline-flex h-10 items-center justify-start rounded-lg bg-muted p-1 text-muted-foreground gap-1", className)}
    >
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(
            child as React.ReactElement<{ activeValue?: string; onValueChange?: (v: string) => void; groupId?: string }>,
            { activeValue, onValueChange, groupId }
          );
        }
        return child;
      })}
    </div>
  );
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  activeValue?: string;
  onValueChange?: (value: string) => void;
  groupId?: string;
}

function TabsTrigger({ value, children, className, activeValue, onValueChange, groupId }: TabsTriggerProps) {
  const isActive = activeValue === value;
  return (
    <button
      type="button"
      role="tab"
      id={groupId ? `tab-${groupId}-${value}` : undefined}
      aria-selected={isActive}
      aria-controls={groupId ? `tabpanel-${groupId}-${value}` : undefined}
      tabIndex={isActive ? 0 : -1}
      onClick={() => onValueChange?.(value)}
      className={cn(
        "relative inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground/80",
        className
      )}
    >
      {isActive && (
        <motion.span
          layoutId={`tabs-active-bg-${groupId}`}
          transition={{ type: "spring", stiffness: 450, damping: 34 }}
          className="absolute inset-0 rounded-md bg-background shadow-sm"
        />
      )}
      <span className="relative">{children}</span>
    </button>
  );
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  activeValue?: string;
  groupId?: string;
}

function TabsContent({ value, children, className, activeValue, groupId }: TabsContentProps) {
  return (
    <AnimatePresence mode="wait">
      {activeValue === value && (
        <motion.div
          key={value}
          role="tabpanel"
          id={groupId ? `tabpanel-${groupId}-${value}` : undefined}
          aria-labelledby={groupId ? `tab-${groupId}-${value}` : undefined}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
          className={cn("mt-4", className)}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
