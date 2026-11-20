import { toast } from "sonner";

function GoogleGlyph(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.67-.22-2.45H12v4.64h6.47a5.53 5.53 0 0 1-2.4 3.63v3h3.87c2.27-2.09 3.56-5.17 3.56-8.82Z" />
      <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.87-3c-1.08.72-2.45 1.14-4.07 1.14-3.13 0-5.78-2.11-6.73-4.96H1.28v3.1A12 12 0 0 0 12 24Z" />
      <path fill="#FBBC05" d="M5.27 14.27a7.2 7.2 0 0 1 0-4.54v-3.1H1.28a12 12 0 0 0 0 10.74l3.99-3.1Z" />
      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0A12 12 0 0 0 1.28 6.63l3.99 3.1C6.22 6.86 8.87 4.75 12 4.75Z" />
    </svg>
  );
}
function AppleGlyph(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M16.36 1c.12 1.1-.31 2.16-.97 2.95-.7.83-1.85 1.47-2.95 1.4-.15-1.06.36-2.17 1.01-2.9C14.16 1.6 15.35 1.02 16.36 1Zm3.5 16.24c-.5 1.12-.74 1.63-1.4 2.62-.9 1.35-2.18 3.03-3.77 3.05-1.4.02-1.77-.92-3.68-.91-1.9.01-2.3.93-3.7.91-1.59-.02-2.8-1.53-3.7-2.88-2.53-3.84-2.8-8.35-1.24-10.76 1.11-1.73 2.86-2.74 4.5-2.74 1.68 0 2.73 1 4.12 1 1.34 0 2.16-1 4.11-1 1.46 0 3 .8 4.1 2.18-3.6 1.98-3.02 7.17.66 8.53Z" />
    </svg>
  );
}

const PROVIDERS = [
  { name: "Google", icon: GoogleGlyph },
  { name: "Apple", icon: AppleGlyph },
];

export default function SocialLoginButtons() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {PROVIDERS.map((provider) => (
        <button
          key={provider.name}
          type="button"
          onClick={() => toast.info(`${provider.name} sign-in isn't wired up in this demo yet`)}
          className="flex items-center justify-center gap-2 h-10 rounded-lg border border-input bg-background text-sm font-medium text-foreground hover:bg-accent hover:border-brand-secondary/40 transition-colors cursor-pointer"
        >
          <provider.icon className="h-4 w-4" />
          {provider.name}
        </button>
      ))}
    </div>
  );
}
