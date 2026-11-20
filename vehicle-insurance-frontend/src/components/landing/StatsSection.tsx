import { motion } from "framer-motion";
import AnimatedCounter from "./AnimatedCounter";

const STATS = [
  { value: 40, suffix: "K+", label: "Active policyholders" },
  { value: 98.2, suffix: "%", label: "Claims settled on time", decimals: 1 },
  { value: 4, suffix: " min", label: "Average approval time" },
  { value: 24, suffix: "/7", label: "Support availability" },
];

export default function StatsSection() {
  return (
    <section className="relative py-20 sm:py-24 bg-brand-primary overflow-hidden">
      <div className="pointer-events-none absolute -top-24 right-1/4 h-96 w-96 rounded-full border-[40px] border-brand-secondary/[0.06]" />
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-6">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center lg:text-left"
            >
              <p className="font-display text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} decimals={stat.decimals ?? 0} />
              </p>
              <p className="text-white/50 text-sm mt-2">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
