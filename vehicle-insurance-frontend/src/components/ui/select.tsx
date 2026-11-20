import * as React from "react";
import { cn } from "@/lib/utils";
import { Check, ChevronDown } from "lucide-react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  id?: string;
  value?: string;
  onChange?: (e: { target: { value: string } }) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}

/**
 * A custom listbox rather than a native <select> — there's no Radix/headless-UI
 * in this project, and a native <select>'s open dropdown is rendered by the OS
 * and can't be restyled at all (only its closed-state trigger can), which is
 * why every dropdown in the app looked plain. This preserves the exact same
 * props (value/onChange/options/placeholder) as a drop-in replacement, so no
 * call site needs to change — onChange still receives a { target: { value } }
 * shape like a real <select> event would.
 */
const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  ({ id, value, onChange, options, placeholder, className, disabled, ...aria }, ref) => {
    const [open, setOpen] = React.useState(false);
    const [activeIndex, setActiveIndex] = React.useState(-1);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const listRef = React.useRef<HTMLUListElement>(null);

    const selected = options.find((o) => o.value === value);
    const selectedIndex = options.findIndex((o) => o.value === value);

    React.useEffect(() => {
      function handleClickOutside(e: MouseEvent) {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setOpen(false);
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const openList = () => {
      if (disabled) return;
      setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
      setOpen(true);
    };

    const commit = (index: number) => {
      const option = options[index];
      if (option) onChange?.({ target: { value: option.value } });
      setOpen(false);
    };

    const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(e.key)) {
        e.preventDefault();
        if (!open) openList();
      }
    };

    const handleListKeyDown = (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setActiveIndex((i) => Math.min(i + 1, options.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setActiveIndex((i) => Math.max(i - 1, 0));
          break;
        case "Home":
          e.preventDefault();
          setActiveIndex(0);
          break;
        case "End":
          e.preventDefault();
          setActiveIndex(options.length - 1);
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          commit(activeIndex);
          break;
        case "Escape":
          e.preventDefault();
          setOpen(false);
          break;
      }
    };

    // Keep the active option scrolled into view as the person navigates by keyboard
    React.useEffect(() => {
      if (open && listRef.current) {
        const activeEl = listRef.current.children[activeIndex] as HTMLElement | undefined;
        activeEl?.scrollIntoView({ block: "nearest" });
      }
    }, [activeIndex, open]);

    return (
      <div ref={containerRef} className="relative">
        <button
          ref={ref}
          type="button"
          id={id}
          disabled={disabled}
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-invalid={aria["aria-invalid"]}
          aria-describedby={aria["aria-describedby"]}
          onClick={() => (open ? setOpen(false) : openList())}
          onKeyDown={handleTriggerKeyDown}
          className={cn(
            "flex h-10 w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-2 text-sm text-left ring-offset-background transition-colors hover:border-brand-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
        >
          <span className={cn("truncate", !selected && "text-muted-foreground")}>
            {selected ? selected.label : placeholder || "Select..."}
          </span>
          <ChevronDown className={cn("h-4 w-4 opacity-50 shrink-0 ml-2 transition-transform", open && "rotate-180")} />
        </button>

        {open && (
          <ul
            ref={listRef}
            role="listbox"
            tabIndex={-1}
            onKeyDown={handleListKeyDown}
            className="absolute z-50 mt-1 max-h-56 w-full min-w-[140px] right-0 overflow-auto rounded-xl border bg-popover text-popover-foreground shadow-xl p-1 focus:outline-none"
          >
            {options.map((option, index) => (
              <li
                key={option.value}
                role="option"
                aria-selected={option.value === value}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => commit(index)}
                className={cn(
                  "flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm cursor-pointer select-none",
                  index === activeIndex ? "bg-brand-secondary/10 text-foreground" : "text-foreground/90",
                  option.value === value && "font-medium"
                )}
              >
                {option.label}
                {option.value === value && <Check className="h-4 w-4 text-brand-secondary shrink-0" />}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
