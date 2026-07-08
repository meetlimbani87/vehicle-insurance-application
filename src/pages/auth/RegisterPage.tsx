import { useState } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { User, Mail, Phone, Lock, Loader2, Eye, EyeOff, Shield, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import AuthVisualPanel from "@/components/auth/AuthVisualPanel";
import PasswordStrengthMeter from "@/components/auth/PasswordStrengthMeter";
import { registerSchema, type RegisterInput } from "@/schemas/authSchemas";
import { useRegister } from "@/hooks/useAuth";
import { ZodError } from "zod";
import { toast } from "sonner";

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterInput>({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const register = useRegister();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
      toast.error("Please accept the Terms & Conditions to continue");
      return;
    }
    try {
      registerSchema.parse(form);
      setErrors({});
      register.mutate(form);
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

  const updateField = (field: keyof RegisterInput, value: string) => {
    setForm({ ...form, [field]: value });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      <AuthVisualPanel
        heading="Get covered in the time it takes to make coffee."
        subtext="Create an account to apply for a policy, manage payments, and track claims in real time."
      />

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
          className="relative w-full max-w-[28rem] py-4"
        >
          <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center">
            <div className="h-10 w-10 rounded-xl bg-brand-primary flex items-center justify-center shadow-md">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <span className="font-display font-bold text-foreground text-lg tracking-tight">VehicleInsure</span>
          </div>

          <div className="rounded-3xl bg-card/90 backdrop-blur-xl border border-border shadow-[0_20px_60px_rgba(16,24,40,0.12)] p-7 sm:p-9">
            <div className="mb-6">
              <h1 className="font-display text-2xl sm:text-[1.75rem] font-extrabold text-foreground tracking-tight">
                Create your account
              </h1>
              <p className="text-muted-foreground mt-1.5 text-sm">
                Start protecting your vehicle today — it takes less than a minute
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
                <label className="text-sm font-medium mb-1.5 block text-foreground">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="John Doe" value={form.name} onChange={(e) => updateField("name", e.target.value)} className="pl-9" />
                </div>
                {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
              </motion.div>

              <div className="grid sm:grid-cols-2 gap-4">
                <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
                  <label className="text-sm font-medium mb-1.5 block text-foreground">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input type="email" placeholder="you@example.com" value={form.email} onChange={(e) => updateField("email", e.target.value)} className="pl-9" />
                  </div>
                  {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
                </motion.div>

                <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
                  <label className="text-sm font-medium mb-1.5 block text-foreground">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="9876543210" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} className="pl-9" />
                  </div>
                  {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone}</p>}
                </motion.div>
              </div>

              <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
                <label className="text-sm font-medium mb-1.5 block text-foreground">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => updateField("password", e.target.value)}
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
                <PasswordStrengthMeter password={form.password} />
                {errors.password && <p className="text-sm text-destructive mt-1">{errors.password}</p>}
              </motion.div>

              <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
                <label className="text-sm font-medium mb-1.5 block text-foreground">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.confirmPassword}
                    onChange={(e) => updateField("confirmPassword", e.target.value)}
                    className="pl-9 pr-10"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                    onClick={() => setShowConfirm(!showConfirm)}
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-sm text-destructive mt-1">{errors.confirmPassword}</p>}
              </motion.div>

              <motion.div
                variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                className="flex items-start gap-2.5 pt-1"
              >
                <Checkbox checked={agreedToTerms} onCheckedChange={setAgreedToTerms} id="terms" className="mt-0.5" />
                <label htmlFor="terms" className="text-sm text-muted-foreground cursor-pointer select-none leading-relaxed" onClick={() => setAgreedToTerms((v) => !v)}>
                  I agree to the <span className="text-brand-secondary font-medium hover:underline">Terms & Conditions</span> and <span className="text-brand-secondary font-medium hover:underline">Privacy Policy</span>
                </label>
              </motion.div>

              <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
                <Button type="submit" className="w-full" size="lg" disabled={register.isPending}>
                  {register.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowRight className="h-4 w-4" />
                  )}
                  Create Account
                </Button>
              </motion.div>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link to="/login" className="text-brand-secondary font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
