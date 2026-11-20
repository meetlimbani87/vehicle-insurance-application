import React, { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  id?: string;
  value?: string; // YYYY-MM-DD format
  onChange: (value: string) => void;
  min?: string; // YYYY-MM-DD format
  max?: string; // YYYY-MM-DD format
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
}

const MONTH_NAMES_FULL = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const MONTH_NAMES_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

type ViewMode = "days" | "months" | "years";

export const DatePicker: React.FC<DatePickerProps> = ({
  id,
  value,
  onChange,
  min,
  max,
  placeholder = "Select date",
  className,
  disabled = false,
  "aria-invalid": ariaInvalid,
  "aria-describedby": ariaDescribedby,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("days");
  const containerRef = useRef<HTMLDivElement>(null);
  const yearsListRef = useRef<HTMLDivElement>(null);

  // Parse current selected date
  const selectedDate = value ? new Date(value + "T00:00:00") : null;
  const isValidSelected = selectedDate && !isNaN(selectedDate.getTime());

  // Current calendar view month and year
  const initialViewDate = isValidSelected ? selectedDate : new Date();
  const [viewYear, setViewYear] = useState(initialViewDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialViewDate.getMonth());

  // Update view when value changes
  useEffect(() => {
    if (value) {
      const parsed = new Date(value + "T00:00:00");
      if (!isNaN(parsed.getTime())) {
        setViewYear(parsed.getFullYear());
        setViewMonth(parsed.getMonth());
      }
    }
  }, [value]);

  // Close calendar popover on click outside or ESC
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setViewMode("days");
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        setViewMode("days");
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Scroll active year into view when years mode opens
  useEffect(() => {
    if (viewMode === "years" && yearsListRef.current) {
      const activeYearBtn = yearsListRef.current.querySelector("[data-selected='true']");
      if (activeYearBtn) {
        activeYearBtn.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    }
  }, [viewMode]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleDateSelect = (day: number) => {
    const m = String(viewMonth + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    const formatted = `${viewYear}-${m}-${d}`;
    onChange(formatted);
    setIsOpen(false);
    setViewMode("days");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
  };

  const handleToday = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const d = String(today.getDate()).padStart(2, "0");
    const formatted = `${y}-${m}-${d}`;
    onChange(formatted);
    setViewYear(y);
    setViewMonth(today.getMonth());
    setIsOpen(false);
    setViewMode("days");
  };

  // Calculate days in month
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay();

  // Range helper
  const isDateDisabled = (day: number) => {
    const m = String(viewMonth + 1).padStart(2, "0");
    const d = String(day).padStart(2, "0");
    const iso = `${viewYear}-${m}-${d}`;
    if (min && iso < min) return true;
    if (max && iso > max) return true;
    return false;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getFullYear() === viewYear &&
      today.getMonth() === viewMonth &&
      today.getDate() === day
    );
  };

  const isSelected = (day: number) => {
    if (!isValidSelected) return false;
    return (
      selectedDate.getFullYear() === viewYear &&
      selectedDate.getMonth() === viewMonth &&
      selectedDate.getDate() === day
    );
  };

  // Generate Year options (1970 to +20 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 75 }, (_, i) => currentYear - 55 + i);

  return (
    <div ref={containerRef} className={cn("relative inline-block w-full", className)}>
      {/* Input Trigger Box */}
      <div
        id={id}
        tabIndex={disabled ? -1 : 0}
        role="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-invalid={ariaInvalid}
        aria-describedby={ariaDescribedby}
        onClick={() => {
          if (!disabled) {
            setIsOpen(!isOpen);
            if (!isOpen) setViewMode("days");
          }
        }}
        onKeyDown={(e) => {
          if (!disabled && (e.key === "Enter" || e.key === " ")) {
            e.preventDefault();
            setIsOpen(!isOpen);
            if (!isOpen) setViewMode("days");
          }
        }}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-xs transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          disabled && "cursor-not-allowed opacity-50",
          ariaInvalid && "border-destructive focus-visible:ring-destructive",
          !value && "text-muted-foreground"
        )}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <CalendarIcon className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="truncate">
            {isValidSelected ? value : placeholder}
          </span>
        </div>
        {value && !disabled && (
          <button
            type="button"
            aria-label="Clear date"
            onClick={handleClear}
            className="text-muted-foreground hover:text-foreground rounded p-0.5"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Custom Popover Calendar Overlay */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Date Picker Calendar"
          className="absolute z-50 mt-1.5 w-[280px] rounded-xl border border-border bg-card p-3 shadow-xl animate-in fade-in-50 zoom-in-95"
        >
          {/* Header Controls */}
          <div className="flex items-center justify-between gap-1 mb-3">
            {viewMode === "days" ? (
              <button
                type="button"
                onClick={handlePrevMonth}
                aria-label="Previous Month"
                className="h-7 w-7 rounded-md border border-input flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setViewMode("days")}
                aria-label="Back to Days View"
                className="h-7 px-2 text-xs font-semibold rounded-md border border-input flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                ← Back
              </button>
            )}

            {/* Custom Month & Year Title Triggers */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewMode(viewMode === "months" ? "days" : "months")}
                className={cn(
                  "flex items-center gap-1 text-xs font-semibold text-foreground px-2 py-1 rounded-md hover:bg-muted transition-colors cursor-pointer",
                  viewMode === "months" && "bg-brand-primary/10 text-brand-primary"
                )}
              >
                <span>{MONTH_NAMES_FULL[viewMonth]}</span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </button>

              <button
                type="button"
                onClick={() => setViewMode(viewMode === "years" ? "days" : "years")}
                className={cn(
                  "flex items-center gap-1 text-xs font-semibold text-foreground px-2 py-1 rounded-md hover:bg-muted transition-colors cursor-pointer",
                  viewMode === "years" && "bg-brand-primary/10 text-brand-primary"
                )}
              >
                <span>{viewYear}</span>
                <ChevronDown className="h-3 w-3 opacity-60" />
              </button>
            </div>

            {viewMode === "days" ? (
              <button
                type="button"
                onClick={handleNextMonth}
                aria-label="Next Month"
                className="h-7 w-7 rounded-md border border-input flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <div className="w-7" />
            )}
          </div>

          {/* VIEW MODE 1: DAY GRID */}
          {viewMode === "days" && (
            <>
              {/* Weekday Headers */}
              <div className="grid grid-cols-7 gap-1 text-center mb-1">
                {DAY_NAMES.map((day) => (
                  <span key={day} className="text-[11px] font-semibold text-muted-foreground">
                    {day}
                  </span>
                ))}
              </div>

              {/* Day Grid */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="h-8 w-8" />
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const disabledDay = isDateDisabled(dayNum);
                  const selectedDay = isSelected(dayNum);
                  const todayDay = isToday(dayNum);

                  return (
                    <button
                      key={dayNum}
                      type="button"
                      disabled={disabledDay}
                      onClick={() => handleDateSelect(dayNum)}
                      className={cn(
                        "h-8 w-8 rounded-lg text-xs font-medium transition-colors flex items-center justify-center cursor-pointer",
                        selectedDay && "bg-brand-primary text-white font-bold shadow-xs",
                        !selectedDay && todayDay && "border border-brand-accent text-brand-accent font-semibold",
                        !selectedDay && !todayDay && "hover:bg-muted text-foreground",
                        disabledDay && "text-muted-foreground/40 cursor-not-allowed hover:bg-transparent"
                      )}
                    >
                      {dayNum}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* VIEW MODE 2: CUSTOM MONTH SELECTOR GRID */}
          {viewMode === "months" && (
            <div className="grid grid-cols-3 gap-2 py-2">
              {MONTH_NAMES_SHORT.map((monthName, idx) => {
                const isCurrentMonth = idx === viewMonth;
                return (
                  <button
                    key={monthName}
                    type="button"
                    onClick={() => {
                      setViewMonth(idx);
                      setViewMode("days");
                    }}
                    className={cn(
                      "py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer text-center",
                      isCurrentMonth
                        ? "bg-brand-primary text-white border-brand-primary font-bold"
                        : "border-border hover:bg-muted text-foreground"
                    )}
                  >
                    {monthName}
                  </button>
                );
              })}
            </div>
          )}

          {/* VIEW MODE 3: CUSTOM YEAR SELECTOR SCROLLABLE GRID */}
          {viewMode === "years" && (
            <div
              ref={yearsListRef}
              className="grid grid-cols-3 gap-1.5 max-h-[190px] overflow-y-auto py-1 pr-1 custom-scrollbar"
            >
              {yearOptions.map((y) => {
                const isCurrentYear = y === viewYear;
                return (
                  <button
                    key={y}
                    type="button"
                    data-selected={isCurrentYear}
                    onClick={() => {
                      setViewYear(y);
                      setViewMode("days");
                    }}
                    className={cn(
                      "py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer text-center",
                      isCurrentYear
                        ? "bg-brand-primary text-white border-brand-primary font-bold"
                        : "border-border hover:bg-muted text-foreground"
                    )}
                  >
                    {y}
                  </button>
                );
              })}
            </div>
          )}

          {/* Footer Shortcuts: Today & Clear */}
          <div className="flex items-center justify-between border-t border-border mt-3 pt-2">
            <button
              type="button"
              onClick={handleToday}
              className="text-xs font-medium text-brand-accent hover:underline cursor-pointer"
            >
              Today
            </button>
            {value && (
              <button
                type="button"
                onClick={handleClear}
                className="text-xs font-medium text-muted-foreground hover:text-destructive hover:underline cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
