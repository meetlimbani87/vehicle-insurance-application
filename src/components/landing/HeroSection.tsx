import { Link } from "react-router";
import { motion } from "framer-motion";
import { ArrowRight, PlayCircle, ShieldCheck, Zap, TrendingUp, Car, Star, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

export default function HeroSection() {
  return (
    <section
      id="home"
      className="relative overflow-hidden bg-brand-primary pt-32 pb-24 sm:pt-40 sm:pb-32"
    >
      {/* Coverage-ring backdrop — tinted (not white) and masked away from the copy column so it never fights the headline for contrast */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ maskImage: "radial-gradient(55% 60% at 22% 45%, transparent 45%, black 80%)" }}
      >
        <div className="absolute -top-40 -right-40 h-[34rem] w-[34rem] rounded-full border-[56px] border-brand-secondary/[0.14] animate-float-slow" />
        <div className="absolute -bottom-56 -left-48 h-[38rem] w-[38rem] rounded-full border-[70px] border-brand-accent/[0.1] animate-float-slower" />
        <div className="absolute top-1/4 left-[8%] h-40 w-40 rounded-full border border-white/[0.06] animate-float-slow hidden sm:block" />
      </div>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, rgba(46,109,164,0.25), transparent 70%)",
        }}
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 grid lg:grid-cols-[1.05fr_0.95fr] gap-14 lg:gap-8 items-center">
        {/* Copy column */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } } }}
        >
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] border border-white/10 px-3.5 py-1.5 mb-6"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-brand-accent animate-pulse" />
            <span className="text-xs font-medium text-white/80">Trusted by 40,000+ drivers</span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            transition={{ duration: 0.55 }}
            className="font-display text-[2.5rem] leading-[1.05] sm:text-6xl sm:leading-[1.05] font-extrabold text-white tracking-tight"
          >
            Vehicle coverage
            <br />
            that moves as
            <span className="relative inline-block px-2 ml-1">
              <span className="relative z-10 text-brand-accent">fast</span>
              <span className="absolute inset-x-0 bottom-1 h-3 bg-brand-accent/20 rounded-full blur-[2px]" />
            </span>
            as you do.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.55 }}
            className="mt-5 text-lg text-white/60 max-w-xl leading-relaxed"
          >
            Apply, manage, and claim — all from one dashboard. No agents, no
            paperwork, no waiting on hold. Real-time policy tracking built for
            drivers who don't have time to lose.
          </motion.p>

          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.55 }}
            className="mt-9 flex flex-col sm:flex-row items-start sm:items-center gap-3.5"
          >
            <Link to={ROUTES.REGISTER} className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-brand-accent hover:bg-brand-accent/90 shadow-lg shadow-brand-accent/20 text-base">
                Get Started Free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>
            <a href="#how-it-works" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-white/15 bg-white/[0.04] text-white hover:bg-white/10 hover:text-white hover:border-white/25 text-base"
              >
                <PlayCircle className="h-4 w-4" />
                See How It Works
              </Button>
            </a>
          </motion.div>

          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.55 }}
            className="mt-11 flex flex-wrap items-center gap-x-7 gap-y-3"
          >
            {[
              { icon: ShieldCheck, label: "IRDAI Registered" },
              { icon: Lock, label: "256-bit Encryption" },
              { icon: Star, label: "4.8/5 rated" },
            ].map((badge) => (
              <div key={badge.label} className="flex items-center gap-2 text-white/50 text-sm">
                <badge.icon className="h-4 w-4 text-white/40" />
                {badge.label}
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Illustration column */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full max-w-md lg:max-w-none"
        >
          {/* Orbit rings */}
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="h-[110%] w-[110%] rounded-full border border-white/[0.08]" />
            <div className="absolute h-[80%] w-[80%] rounded-full border border-dashed border-white/[0.1] animate-[spin_60s_linear_infinite]" />
          </div>

          {/* Central dashboard mock card */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="relative mx-auto w-[280px] sm:w-[320px] rounded-2xl bg-white/[0.07] backdrop-blur-xl border border-white/[0.12] shadow-2xl shadow-black/40 p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-brand-accent/20 flex items-center justify-center">
                  <Car className="h-4 w-4 text-brand-accent" />
                </div>
                <div>
                  <p className="text-[11px] text-white/40 leading-none">Policy</p>
                  <p className="text-sm font-semibold text-white leading-tight">VI-2049-KX</p>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-brand-accent bg-brand-accent/15 rounded-full px-2 py-1">
                Active
              </span>
            </div>

            <div className="space-y-2.5 mb-4">
              <div className="h-2 rounded-full bg-white/[0.08] overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{ width: "82%" }}
                  transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full bg-gradient-to-r from-brand-accent to-brand-secondary"
                />
              </div>
              <div className="flex justify-between text-[11px] text-white/40">
                <span>Coverage used</span>
                <span className="text-white/70 font-medium">82%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-xl bg-white/[0.05] border border-white/[0.06] p-3">
                <p className="text-[10px] text-white/40 mb-1">Premium</p>
                <p className="text-sm font-bold text-white">₹8,400</p>
              </div>
              <div className="rounded-xl bg-white/[0.05] border border-white/[0.06] p-3">
                <p className="text-[10px] text-white/40 mb-1">Next due</p>
                <p className="text-sm font-bold text-white">12 days</p>
              </div>
            </div>
          </motion.div>

          {/* Floating stat cards */}
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
            className="hidden sm:flex absolute -left-6 top-6 items-center gap-2.5 rounded-xl bg-white/95 backdrop-blur-xl shadow-xl shadow-black/20 px-3.5 py-3"
          >
            <div className="h-8 w-8 rounded-lg bg-brand-accent/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-brand-accent" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground leading-none">Claims settled</p>
              <p className="text-sm font-bold text-foreground leading-tight">98.2%</p>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, -14, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
            className="hidden sm:flex absolute -right-4 bottom-12 items-center gap-2.5 rounded-xl bg-white/95 backdrop-blur-xl shadow-xl shadow-black/20 px-3.5 py-3"
          >
            <div className="h-8 w-8 rounded-lg bg-brand-warn/10 flex items-center justify-center">
              <Zap className="h-4 w-4 text-brand-warn" />
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground leading-none">Avg. approval</p>
              <p className="text-sm font-bold text-foreground leading-tight">4 minutes</p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
