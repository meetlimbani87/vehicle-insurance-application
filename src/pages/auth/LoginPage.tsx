import { useState } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { Mail, Lock, Loader2, Eye, EyeOff, Shield, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import AuthVisualPanel from "@/components/auth/AuthVisualPanel";
import SocialLoginButtons from "@/components/auth/SocialLoginButtons";
import { loginSchema, type LoginInput } from "@/schemas/authSchemas";
import { useLogin } from "@/hooks/useAuth";
import { ZodError } from "zod";
import { toast } from "sonner";

export default function LoginPage() {
  const [form, setForm] = useState<LoginInput>({ email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const login = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      loginSchema.parse(form);
      setErrors({});
      login.mutate(form);
    } catch (err) {
      if (err instanceof ZodError) {
        const fieldErrors: Record<string, string> = {};
        err.issues.forEach((issue) => {
          if (issue.path[0]) fieldErrors[issue.path[0] as string] = issue.message;
        });
        setErrors(fieldErrors);
      }
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <AuthVisualPanel
        heading="Insurance that keeps pace with your life."
        subtext="Sign in to track policies, file claims, and manage payments — all from a single dashboard."
      />

      {/* Auth column — layered background so it's never flat white */}
      <div className="relative flex items-center justify-center overflow-hidden px-4 py-10 sm:p-8">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(50% 40% at 85% 0%, rgba(46,109,164,0.08), transparent 70%), radial-gradient(45% 35% at 0% 100%, rgba(14,156,136,0.07), transparent 70%)",
          }}
        />
        <div className="pointer-events-none absolute inset-0 bg-secondary/30" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-[26rem]"
        >
          <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
            <div className="h-10 w-10 rounded-xl bg-brand-primary flex items-center justify-center shadow-md">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="font-display font-bold text-foreground text-lg tracking-tight">VehicleInsure</span>
          </div>

          <div className="rounded-3xl bg-card/90 backdrop-blur-xl border border-border shadow-[0_20px_60px_rgba(16,24,40,0.12)] p-7 sm:p-9">
            <div className="mb-7">
              <h1 className="font-display text-2xl sm:text-[1.75rem] font-extrabold text-foreground tracking-tight">
                Welcome back
              </h1>
              <p className="text-muted-foreground mt-1.5 text-sm">
                Sign in to manage your coverage and claims
              </p>
            </div>

            <motion.form
              onSubmit={handleSubmit}
              className="space-y-4"
              initial="hidden"
              animate="show"
              variants={{ hidden: {}, show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } } }}
            >
              <motion.div
                variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                animate={errors.email ? { x: [0, -6, 5, -4, 3, 0] } : undefined}
                transition={errors.email ? { duration: 0.4 } : undefined}
              >
                <label className="text-sm font-medium mb-1.5 block text-foreground">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="pl-9"
                  />
                </div>
                {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
              </motion.div>

              <motion.div
                variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                animate={errors.password ? { x: [0, -6, 5, -4, 3, 0] } : undefined}
                transition={errors.password ? { duration: 0.4 } : undefined}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-medium text-foreground">Password</label>
                  <button
                    type="button"
                    onClick={() => toast.info("Password reset isn't wired up in this demo yet")}
                    className="text-xs font-semibold text-brand-secondary hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="pl-9 pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-destructive mt-1">{errors.password}</p>}
              </motion.div>

              <motion.div
                variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                className="flex items-center gap-2.5"
              >
                <Checkbox checked={remember} onCheckedChange={setRemember} id="remember" />
                <label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer select-none" onClick={() => setRemember((v) => !v)}>
                  Remember me for 30 days
                </label>
              </motion.div>

              <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
                <Button type="submit" className="w-full" size="lg" disabled={login.isPending}>
                  {login.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                  Sign In
                </Button>
              </motion.div>
            </motion.form>

            <div className="flex items-center gap-3 my-6">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs text-muted-foreground">or continue with</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <SocialLoginButtons />

            <div className="mt-5 rounded-xl bg-muted px-3.5 py-2.5 text-center text-xs text-muted-foreground">
              Demo access — any email signs in as a customer,{" "}
              <span className="font-medium text-foreground">admin@example.com</span> signs in as admin
            </div>

            <p className="mt-5 text-center text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link to="/register" className="text-brand-secondary font-semibold hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
