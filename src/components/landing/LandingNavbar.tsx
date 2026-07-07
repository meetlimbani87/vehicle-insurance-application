import { useEffect, useState } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "#home", label: "Home" },
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Contact" },
];

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 inset-x-0 z-50 flex justify-center px-4 pt-3 sm:pt-4"
    >
      <div
        className={cn(
          "w-full max-w-6xl rounded-2xl transition-all duration-300 border",
          scrolled
            ? "bg-brand-primary/70 backdrop-blur-xl border-white/10 shadow-lg shadow-black/20"
            : "bg-white/[0.03] backdrop-blur-md border-white/[0.08]"
        )}
      >
        <nav className="flex items-center justify-between h-14 sm:h-16 px-3 sm:px-5">
          <a
            href="#home"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick("#home");
            }}
            className="flex items-center gap-2 shrink-0"
          >
            <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-xl bg-brand-accent flex items-center justify-center shadow-md shadow-black/20">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <span className="font-display font-bold text-white tracking-tight text-[15px] sm:text-base">
              VehicleInsure
            </span>
          </a>

          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(link.href);
                }}
                className="px-3.5 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-1.5">
            <Link
              to={ROUTES.LOGIN}
              className="px-3.5 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              Login
            </Link>
            <Link
              to={ROUTES.REGISTER}
              className="px-3.5 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              Register
            </Link>
            <Link to={ROUTES.REGISTER} className="ml-1.5">
              <Button size="sm" className="bg-brand-accent hover:bg-brand-accent/90 shadow-brand-accent/30">
                Get Started
              </Button>
            </Link>
          </div>

          <button
            className="lg:hidden h-9 w-9 flex items-center justify-center rounded-lg text-white/90 hover:bg-white/10 transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="lg:hidden overflow-hidden border-t border-white/10"
            >
              <div className="flex flex-col px-3 py-3 gap-1">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(link.href);
                    }}
                    className="px-3 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:bg-white/[0.06] hover:text-white transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
                <div className="h-px bg-white/10 my-1.5" />
                <Link
                  to={ROUTES.LOGIN}
                  className="px-3 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:bg-white/[0.06] hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  to={ROUTES.REGISTER}
                  className="px-3 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:bg-white/[0.06] hover:text-white transition-colors"
                >
                  Register
                </Link>
                <Link to={ROUTES.REGISTER}>
                  <Button className="mt-1.5 w-full bg-brand-accent hover:bg-brand-accent/90">
                    Get Started
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
