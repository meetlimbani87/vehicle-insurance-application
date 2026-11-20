import { Link } from "react-router";
import { Shield } from "lucide-react";
import { ROUTES } from "@/constants/routes";

// Lucide dropped brand/social marks, so these are hand-drawn minimal glyphs
// kept intentionally simple to match the rest of the icon system.
function XGlyph(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M13.6 10.6 20.3 3h-2l-5.8 6.6L7.9 3H3l7 10-7 8h2l6.1-7 4.9 7H21l-7.4-10.4Zm-2.2 2.5-.7-1L5.8 4.5h2.2l4.5 6.4.7 1 5.9 8.4h-2.2l-4.9-7Z" />
    </svg>
  );
}
function LinkedInGlyph(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M6.94 5a2 2 0 1 1-4-.02 2 2 0 0 1 4 .02ZM3.3 8.75h3.28V21H3.3V8.75Zm5.7 0h3.14v1.68h.04c.44-.83 1.5-1.7 3.1-1.7 3.31 0 3.92 2.18 3.92 5.01V21h-3.28v-5.68c0-1.36-.02-3.1-1.89-3.1-1.9 0-2.19 1.48-2.19 3v5.78H9V8.75Z" />
    </svg>
  );
}
function InstagramGlyph(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function FacebookGlyph(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V8c0-.9.25-1.5 1.55-1.5H17V3.7c-.3-.04-1.3-.13-2.46-.13-2.44 0-4.1 1.49-4.1 4.22v2.1H8v3.1h2.44V21h3.06Z" />
    </svg>
  );
}

const FOOTER_LINKS = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "FAQ", href: "#faq" },
  ],
  Company: [
    { label: "Contact", href: "#contact" },
    { label: "Login", to: ROUTES.LOGIN },
    { label: "Register", to: ROUTES.REGISTER },
  ],
};

const SOCIALS = [
  { icon: XGlyph, label: "X (Twitter)" },
  { icon: LinkedInGlyph, label: "LinkedIn" },
  { icon: InstagramGlyph, label: "Instagram" },
  { icon: FacebookGlyph, label: "Facebook" },
];

export default function LandingFooter() {
  return (
    <footer className="bg-brand-primary pt-16 pb-8 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-9 w-9 rounded-xl bg-brand-accent flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="font-display font-bold text-white text-lg tracking-tight">
                VehicleInsure
              </span>
            </div>
            <p className="text-white/50 text-sm max-w-xs leading-relaxed">
              Vehicle insurance built for the way people actually drive —
              fast applications, transparent claims, no waiting rooms.
            </p>
            <div className="flex items-center gap-2 mt-6">
              {SOCIALS.map((social) => (
                <a
                  key={social.label}
                  href="#"
                  aria-label={social.label}
                  className="h-9 w-9 rounded-lg bg-white/[0.06] border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="font-display font-semibold text-white text-sm mb-4">{heading}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    {"to" in link && link.to ? (
                      <Link to={link.to} className="text-white/50 text-sm hover:text-white transition-colors">
                        {link.label}
                      </Link>
                    ) : (
                      <a href={link.href} className="text-white/50 text-sm hover:text-white transition-colors">
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6">
          <p className="text-white/40 text-xs">
            © {new Date().getFullYear()} VehicleInsure. All rights reserved.
          </p>
          <p className="text-white/40 text-xs">IRDAI Registration No. XX-XXXXXXX</p>
        </div>
      </div>
    </footer>
  );
}
