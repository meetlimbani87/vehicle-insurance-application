import { motion } from "framer-motion";
import { Link } from "react-router";
import { Shield, ShieldCheck, Zap, TrendingUp } from "lucide-react";

interface AuthVisualPanelProps {
  heading: string;
  subtext: string;
}

const POINTS = [
  { icon: Zap, text: "Policy issued in minutes, not days" },
  { icon: ShieldCheck, text: "IRDAI registered & bank-grade encryption" },
  { icon: TrendingUp, text: "98.2% of claims settled on time" },
];

export default function AuthVisualPanel({ heading, subtext }: AuthVisualPanelProps) {
  return (
    <div className="relative hidden lg:flex flex-col justify-between h-full w-full overflow-hidden bg-brand-primary px-12 py-12 xl:px-16">
      {/* Layered mesh gradient — replaces flat navy with depth */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(65% 55% at 15% 10%, rgba(46,109,164,0.35), transparent 60%), radial-gradient(55% 50% at 90% 85%, rgba(14,156,136,0.22), transparent 65%)",
        }}
      />
      {/* Coverage-ring motif, tinted (not white) and masked so it never crosses the copy */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{ maskImage: "radial-gradient(60% 60% at 30% 40%, transparent 40%, black 78%)" }}
      >
        <div className="absolute -top-32 -right-32 h-[28rem] w-[28rem] rounded-full border-[44px] border-brand-secondary/[0.12] animate-float-slow" />
        <div className="absolute -bottom-40 -left-24 h-[24rem] w-[24rem] rounded-full border-[52px] border-brand-accent/[0.1] animate-float-slower" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative w-fit"
      >
        <Link to="/" className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-xl bg-brand-accent flex items-center justify-center shadow-lg shadow-black/20">
            <Shield className="h-5 w-5 text-white" />
          </div>
          <span className="font-display font-bold text-white text-lg tracking-tight">VehicleInsure</span>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative max-w-md"
      >
        <h2 className="font-display text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-tight">
          {heading}
        </h2>
        <p className="text-white/65 mt-3.5 text-base leading-relaxed">{subtext}</p>

        <div className="mt-8 space-y-3.5">
          {POINTS.map((point, i) => (
            <motion.div
              key={point.text}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.25 + i * 0.1 }}
              className="flex items-center gap-3 rounded-xl bg-white/[0.06] border border-white/10 px-4 py-3 backdrop-blur-sm"
            >
              <div className="h-8 w-8 shrink-0 rounded-lg bg-brand-accent/20 flex items-center justify-center">
                <point.icon className="h-4 w-4 text-brand-accent" />
              </div>
              <span className="text-sm text-white/85 font-medium">{point.text}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="relative text-white/35 text-xs"
      >
        © {new Date().getFullYear()} VehicleInsure. All rights reserved.
      </motion.p>
    </div>
  );
}
