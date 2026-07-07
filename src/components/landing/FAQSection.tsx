import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "How fast can I get a policy issued?",
    a: "Most applications are reviewed and issued instantly. In rare cases requiring manual review, it takes under 24 hours.",
  },
  {
    q: "What documents do I need to apply?",
    a: "Just your vehicle registration details and a valid ID. No physical inspection is required for most vehicle categories.",
  },
  {
    q: "How do I file a claim after an accident?",
    a: "Open the claims tab, describe the incident, and upload photos. You'll get a claim ID instantly and can track its status live.",
  },
  {
    q: "Can I manage multiple vehicles under one account?",
    a: "Yes. Add as many vehicles as you need, each with its own policy, payment schedule, and claims history.",
  },
  {
    q: "Is my data secure on this platform?",
    a: "All data is encrypted in transit and at rest, and every account action is logged in an auditable trail.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-24 sm:py-28 bg-secondary/40">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="text-xs font-semibold tracking-wide text-brand-secondary uppercase">
            FAQ
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mt-2.5">
            Questions, answered
          </h2>
        </motion.div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <motion.div
                key={faq.q}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className={cn(
                  "rounded-2xl border bg-card overflow-hidden transition-colors duration-200",
                  isOpen ? "border-brand-secondary/30 shadow-md shadow-black/[0.03]" : "border-border/80"
                )}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-5 sm:px-6 py-4 sm:py-5 text-left cursor-pointer"
                >
                  <span className="font-display font-semibold text-foreground text-[15px] sm:text-base">
                    {faq.q}
                  </span>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25 }}
                    className={cn(
                      "shrink-0 h-7 w-7 rounded-full flex items-center justify-center",
                      isOpen ? "bg-brand-accent/10 text-brand-accent" : "bg-muted text-muted-foreground"
                    )}
                  >
                    <ChevronDown className="h-4 w-4" />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 sm:px-6 pb-5 sm:pb-6 text-muted-foreground text-sm leading-relaxed">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
