import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface PolicyDurationDisplay {
  label: string;
  colorClass: string;
  badgeVariant: "success" | "destructive" | "warning" | "secondary";
  isExpired: boolean;
}

/**
 * Formats policy remaining duration according to user specifications:
 * - Active / Unexpired: MUST BE GREEN
 * - > 12 Months (365 days): Display in Years (e.g. "2 Years Left")
 * - > 28 Days: Display in Months (e.g. "5 Months Left")
 * - <= 28 Days: Display in Days (e.g. "14 Days Left")
 * - Expired (<= 0 days): Display "Expired" in RED
 */
export function formatPolicyTimeRemaining(endDateStr?: string, status?: string): PolicyDurationDisplay {
  if (status === "Expired" || status === "Cancelled") {
    return {
      label: "Expired",
      colorClass: "text-destructive font-semibold",
      badgeVariant: "destructive",
      isExpired: true,
    };
  }

  if (!endDateStr) {
    return {
      label: "Active",
      colorClass: "text-emerald-600 font-semibold",
      badgeVariant: "success",
      isExpired: false,
    };
  }

  const end = new Date(endDateStr);
  const now = new Date();
  const diffTime = end.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return {
      label: "Expired",
      colorClass: "text-destructive font-semibold",
      badgeVariant: "destructive",
      isExpired: true,
    };
  }

  // Active / Unexpired policies MUST BE GREEN
  const colorClass = "text-emerald-600 font-semibold";

  // Greater than 12 months (365 days) -> Format in Years
  if (diffDays >= 365) {
    const years = Math.floor(diffDays / 365);
    const label = `${years} ${years === 1 ? "Year" : "Years"} Left`;
    return { label, colorClass, badgeVariant: "success", isExpired: false };
  }

  // Greater than 28 days -> Format in Months
  if (diffDays > 28) {
    const months = Math.round(diffDays / 30);
    const label = `${months} ${months === 1 ? "Month" : "Months"} Left`;
    return { label, colorClass, badgeVariant: "success", isExpired: false };
  }

  // 28 days or less -> Format in Days
  const label = `${diffDays} ${diffDays === 1 ? "Day" : "Days"} Left`;
  return { label, colorClass, badgeVariant: "success", isExpired: false };
}
