import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

function getStrength(password: string) {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return Math.min(score, 4);
}

const LABELS = ["Too weak", "Weak", "Fair", "Good", "Strong"];
const COLORS = ["bg-destructive", "bg-destructive", "bg-brand-warn", "bg-brand-secondary", "bg-brand-accent"];

export default function PasswordStrengthMeter({ password }: { password: string }) {
  const strength = getStrength(password);
  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: i < strength ? "100%" : "0%" }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={cn("h-full rounded-full", COLORS[strength])}
            />
          </div>
        ))}
      </div>
      <p className={cn("text-xs mt-1.5 font-medium", strength <= 1 ? "text-destructive" : "text-muted-foreground")}>
        {LABELS[strength]}
      </p>
    </div>
  );
}
