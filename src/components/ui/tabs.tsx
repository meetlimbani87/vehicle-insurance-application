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
  return (
    <div className={cn("inline-flex h-10 items-center justify-start rounded-lg bg-muted p-1 text-muted-foreground gap-1", className)}>
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
      onClick={() => onValueChange?.(value)}
      className={cn(
        "relative inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors cursor-pointer",
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
}

function TabsContent({ value, children, className, activeValue }: TabsContentProps) {
  return (
    <AnimatePresence mode="wait">
      {activeValue === value && (
        <motion.div
          key={value}
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
