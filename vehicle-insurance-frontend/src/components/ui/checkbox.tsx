import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  id?: string;
  className?: string;
  disabled?: boolean;
}

function Checkbox({ checked, onCheckedChange, id, className, disabled }: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      id={id}
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "h-[18px] w-[18px] shrink-0 rounded-[6px] border flex items-center justify-center transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        checked ? "bg-brand-accent border-brand-accent" : "bg-transparent border-input hover:border-brand-secondary/50",
        className
      )}
    >
      <motion.span
        initial={false}
        animate={checked ? { scale: 1, opacity: 1 } : { scale: 0.5, opacity: 0 }}
        transition={{ duration: 0.15 }}
      >
        <Check className="h-3 w-3 text-white" strokeWidth={3} />
      </motion.span>
    </button>
  );
}

export { Checkbox };
