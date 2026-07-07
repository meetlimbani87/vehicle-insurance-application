import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { cn } from "@/lib/utils";

const TESTIMONIALS = [
  {
    name: "Ananya Patel",
    role: "Policyholder since 2023",
    quote:
      "I filed a claim after a minor accident and had approval within the hour. No calls, no waiting rooms — just the app.",
  },
  {
    name: "Rohan Mehta",
    role: "Fleet owner, Mehta Logistics",
    quote:
      "Managing coverage for 12 vehicles used to mean a folder of paperwork. Now it's one dashboard and renewal reminders that actually work.",
  },
  {
    name: "Priya Nair",
    role: "First-time policyholder",
    quote:
      "The terms analyzer explained my exclusions in plain language before I signed. That alone made me trust this platform.",
  },
  {
    name: "Karan Shah",
    role: "Policyholder since 2022",
    quote:
      "Switched from a traditional insurer mid-year. The application took eight minutes and my premium dropped by 15%.",
  },
];

export default function TestimonialsSection() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive((v) => (v + 1) % TESTIMONIALS.length), 5500);
    return () => clearInterval(t);
  }, []);

  return (
    <section className="relative py-24 sm:py-28 bg-background overflow-hidden">
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[30rem] w-[60rem] rounded-full bg-brand-secondary/[0.05] blur-3xl" />
      <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="text-xs font-semibold tracking-wide text-brand-accent uppercase">
            Loved by drivers
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mt-2.5">
            What our policyholders say
          </h2>
        </motion.div>

        <div className="relative h-[280px] sm:h-[240px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 rounded-3xl bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_20px_60px_rgba(16,24,40,0.08)] p-8 sm:p-10 flex flex-col justify-center"
            >
              <Quote className="h-8 w-8 text-brand-accent/30 mb-4" />
              <p className="font-display text-lg sm:text-xl text-foreground font-medium leading-relaxed">
                "{TESTIMONIALS[active].quote}"
              </p>
              <div className="flex items-center justify-between mt-6">
                <div>
                  <p className="font-semibold text-foreground text-sm">{TESTIMONIALS[active].name}</p>
                  <p className="text-muted-foreground text-xs mt-0.5">{TESTIMONIALS[active].role}</p>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-brand-warn text-brand-warn" />
                  ))}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-center gap-2 mt-7">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Show testimonial ${i + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300 cursor-pointer",
                i === active ? "w-7 bg-brand-accent" : "w-1.5 bg-border hover:bg-muted-foreground/40"
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
