import { motion } from "framer-motion";
import { UserPlus, FileEdit, ShieldCheck, LifeBuoy } from "lucide-react";

const STEPS = [
  {
    icon: UserPlus,
    title: "Create your account",
    description: "Sign up with your email — no paperwork or branch visits needed.",
  },
  {
    icon: FileEdit,
    title: "Apply for a policy",
    description: "Tell us about your vehicle and pick the coverage that fits.",
  },
  {
    icon: ShieldCheck,
    title: "Get covered instantly",
    description: "Our system reviews and issues your policy in real time.",
  },
  {
    icon: LifeBuoy,
    title: "Manage & claim anytime",
    description: "Track payments, file claims, and renew — all from one dashboard.",
  },
];

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-24 sm:py-28 bg-secondary/40 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mb-16"
        >
          <span className="text-xs font-semibold tracking-wide text-brand-secondary uppercase">
            How it works
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight mt-2.5">
            From sign-up to covered in four steps
          </h2>
        </motion.div>

        <div className="relative grid sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
          {/* Connecting line — desktop only, encodes the sequence */}
          <div className="hidden lg:block absolute top-6 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          {STEPS.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="relative"
            >
              <div className="relative z-10 flex items-center gap-3 mb-4">
                <div className="h-12 w-12 shrink-0 rounded-full bg-brand-primary text-white flex items-center justify-center font-display font-bold shadow-lg shadow-brand-primary/20">
                  {String(i + 1).padStart(2, "0")}
                </div>
                <div className="h-9 w-9 rounded-lg bg-white border border-border flex items-center justify-center shadow-sm lg:hidden">
                  <step.icon className="h-4 w-4 text-brand-accent" />
                </div>
              </div>
              <div className="hidden lg:flex h-10 w-10 rounded-lg bg-white border border-border items-center justify-center shadow-sm mb-3">
                <step.icon className="h-[18px] w-[18px] text-brand-accent" />
              </div>
              <h3 className="font-display text-base font-bold text-foreground tracking-tight">
                {step.title}
              </h3>
              <p className="text-muted-foreground text-sm mt-1.5 leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
