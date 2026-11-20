import { Link } from "react-router";
import { motion } from "framer-motion";
import { ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

export default function CTASection() {
  return (
    <section id="contact" className="relative py-24 sm:py-28 px-4 sm:px-6 overflow-hidden">
      <div className="relative max-w-6xl mx-auto rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-br from-brand-primary via-brand-primary to-brand-secondary/90 px-6 sm:px-16 py-16 sm:py-20 overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ maskImage: "radial-gradient(45% 55% at 50% 45%, transparent 40%, black 80%)" }}
        >
          <div className="absolute -top-32 -right-24 h-96 w-96 rounded-full border-[48px] border-brand-secondary/[0.1] animate-float-slow" />
          <div className="absolute -bottom-40 -left-24 h-[26rem] w-[26rem] rounded-full border-[56px] border-brand-accent/[0.12] animate-float-slower" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="relative text-center max-w-2xl mx-auto"
        >
          <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Coverage that's ready before you are
          </h2>
          <p className="text-white/60 mt-4 text-base sm:text-lg leading-relaxed">
            Join thousands of drivers who switched to insurance that fits into
            their day, not the other way around.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link to={ROUTES.REGISTER} className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto bg-brand-accent hover:bg-brand-accent/90 shadow-lg shadow-brand-accent/20 text-base">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="mailto:hello@vehicleinsure.example" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-white/15 bg-white/[0.04] text-white hover:bg-white/10 hover:text-white hover:border-white/25 text-base"
              >
                <Mail className="h-4 w-4" />
                Contact Us
              </Button>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
