import { motion } from "framer-motion";
import {
  Zap,
  FileSearch,
  Bell,
  BarChart3,
  ShieldCheck,
  BookOpen,
} from "lucide-react";

const FEATURES = [
  {
    icon: Zap,
    title: "Instant policy issuance",
    description:
      "Get covered in minutes, not days. Our engine validates and issues your policy the moment you apply.",
    accent: "text-brand-accent bg-brand-accent/10",
  },
  {
    icon: FileSearch,
    title: "One-tap claim filing",
    description:
      "Upload photos, describe the incident, and track your claim status live — no phone calls required.",
    accent: "text-brand-secondary bg-brand-secondary/10",
  },
  {
    icon: Bell,
    title: "Smart reminders",
    description:
      "Renewal dates, payment schedules, and document expiries land in your inbox before they become a problem.",
    accent: "text-brand-warn bg-brand-warn/10",
  },
  {
    icon: BarChart3,
    title: "Transparent reporting",
    description:
      "Every premium, payout, and adjustment is logged and exportable — full visibility into your coverage history.",
    accent: "text-brand-accent bg-brand-accent/10",
  },
  {
    icon: ShieldCheck,
    title: "Fraud-grade security",
    description:
      "Bank-level encryption and audit trails protect your data and every action taken on your policy.",
    accent: "text-brand-secondary bg-brand-secondary/10",
  },
  {
    icon: BookOpen,
    title: "Plain-language terms",
    description:
      "Our terms analyzer breaks down clauses and exclusions in plain English before you ever sign.",
    accent: "text-brand-warn bg-brand-warn/10",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};
const item = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0 },
};

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 sm:py-28 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mb-14"
        >
          <span className="text-xs font-semibold tracking-wide text-brand-accent uppercase">
            Why VehicleInsure
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mt-2.5">
            Everything a modern policy needs, nothing it doesn't
          </h2>
          <p className="text-muted-foreground mt-4 text-base sm:text-lg leading-relaxed">
            Built for people who want their insurance to work like their
            favorite apps — fast, clear, and always within reach.
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {FEATURES.map((f) => (
            <motion.div
              key={f.title}
              variants={item}
              transition={{ duration: 0.45 }}
              whileHover={{ y: -6 }}
              className="group relative rounded-2xl border border-border/80 bg-card p-6 shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-all duration-300 hover:shadow-[0_16px_40px_rgba(16,24,40,0.1)] hover:border-brand-secondary/30"
            >
              <div
                className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${f.accent} transition-transform duration-300 group-hover:scale-110`}
              >
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground mt-4 tracking-tight">
                {f.title}
              </h3>
              <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                {f.description}
              </p>
              <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-brand-accent/[0.03] to-transparent" />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
