import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User, Lock, Bell, Loader2, ShieldCheck, Mail, Phone, MapPin, CheckCircle2, KeyRound, Sparkles, Smartphone, Inbox } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useProfile, useUpdateProfile, useChangePassword, useUpdateNotificationPreferences } from "@/hooks/useProfile";
import { usePolicies } from "@/hooks/usePolicies";
import { useClaims } from "@/hooks/useClaims";
import PageHeader from "@/components/layout/PageHeader";

const pageVariants = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.25 } } };

export default function ProfilePage() {
  const { data: profile, isLoading } = useProfile();
  const { data: policies } = usePolicies();
  const { data: claims } = useClaims();

  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();
  const updateNotifPrefs = useUpdateNotificationPreferences();

  const [form, setForm] = useState({ name: "", phone: "", address: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  useEffect(() => {
    if (profile) {
      setForm({ name: profile.name, phone: profile.phone, address: profile.address ?? "" });
    }
  }, [profile]);

  const handleSaveProfile = () => {
    updateProfile.mutate(form);
  };

  const handleUpdatePassword = () => {
    changePassword.mutate(passwordForm, {
      onSuccess: () => setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" }),
    });
  };

  const handleTogglePref = (key: "emailNotifications" | "smsNotifications" | "inAppNotifications", value: boolean) => {
    if (!profile) return;
    updateNotifPrefs.mutate({
      emailNotifications: profile.emailNotifications,
      smsNotifications: profile.smsNotifications,
      inAppNotifications: profile.inAppNotifications,
      [key]: value,
    });
  };

  if (isLoading || !profile) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-7 w-7 animate-spin text-brand-primary" />
      </div>
    );
  }

  const activePoliciesCount = (policies || []).length;
  const activeClaimsCount = (claims || []).length;
  const initials = profile.name ? profile.name.charAt(0).toUpperCase() : "M";

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="space-y-6 max-w-6xl mx-auto pb-12">
      <PageHeader title="Profile & Account Settings" description="Manage your personal information, security credentials, and communication preferences" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Identity Sidebar Card (4 Cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Digital Member Card */}
          <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 via-brand-secondary to-brand-primary p-5 text-white shadow-lg overflow-hidden border border-white/10">
            {/* Background Glow Overlay */}
            <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-brand-primary/20 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-cyan-400/20 blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <span className="text-xs font-bold tracking-widest uppercase text-white/80">VehicleInsure Card</span>
              </div>
              <Badge className="bg-white/15 text-white border-white/20 text-[10px] px-2 py-0.5 font-bold">
                Platinum Tier
              </Badge>
            </div>

            <div className="my-6 relative z-10 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-white/70 uppercase tracking-wider font-semibold">Policyholder Name</p>
                <h2 className="text-xl font-extrabold tracking-tight mt-0.5 font-display">{profile.name}</h2>
                <p className="text-xs text-cyan-200 mt-1 font-mono">{profile.email}</p>
              </div>
              <div className="h-14 w-14 rounded-2xl bg-white/10 text-white text-xl font-bold font-display flex items-center justify-center border border-white/20 shrink-0 shadow-inner">
                {initials}
              </div>
            </div>

            <div className="pt-3 border-t border-white/15 flex items-center justify-between text-xs relative z-10">
              <div>
                <p className="text-[10px] text-white/60 uppercase">Member ID</p>
                <p className="font-mono font-bold text-white text-xs mt-0.5">INS-MEM-2026-{profile.id?.slice(-4) || "0881"}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-white/60 uppercase">Active Status</p>
                <p className="font-bold text-emerald-400 text-xs mt-0.5 flex items-center justify-end gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Verified
                </p>
              </div>
            </div>
          </div>

          {/* Policyholder Quick Summary Card */}
          <Card className="border bg-card shadow-xs">
            <CardContent className="p-4 space-y-3">
              <p className="text-xs font-bold text-foreground uppercase tracking-wider">Account Overview</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border bg-muted/30">
                  <p className="text-[11px] text-muted-foreground font-semibold">Active Policies</p>
                  <p className="text-base font-extrabold text-foreground mt-0.5">{activePoliciesCount} Covered</p>
                </div>
                <div className="p-3 rounded-xl border bg-muted/30">
                  <p className="text-[11px] text-muted-foreground font-semibold">Claims History</p>
                  <p className="text-base font-extrabold text-brand-primary mt-0.5">{activeClaimsCount} Claims</p>
                </div>
              </div>

              <div className="pt-2 border-t space-y-2 text-xs">
                <div className="flex items-center justify-between text-muted-foreground py-1">
                  <span className="flex items-center gap-1.5 font-medium">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> Vault Data Protection
                  </span>
                  <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30 bg-emerald-500/10 font-semibold">
                    AES-256 Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-muted-foreground py-1">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Mail className="h-3.5 w-3.5 text-brand-primary" /> Primary Contact
                  </span>
                  <span className="font-semibold text-foreground text-[11px]">{profile.phone || "Verified"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Notification & Alert Preferences (Moved to Left Sidebar) */}
          <Card className="border bg-card shadow-xs">
            <CardHeader className="border-b pb-3">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <Bell className="h-4 w-4 text-brand-accent" /> Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl border bg-muted/20">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-brand-primary/10 text-brand-primary shrink-0">
                    <Inbox className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">Email Updates</p>
                    <p className="text-[10px] text-muted-foreground">Claims & policy notices</p>
                  </div>
                </div>
                <Switch
                  checked={profile.emailNotifications}
                  onCheckedChange={(v) => handleTogglePref("emailNotifications", v)}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border bg-muted/20">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 shrink-0">
                    <Smartphone className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">SMS Alerts</p>
                    <p className="text-[10px] text-muted-foreground">Payout & surveyor SMS</p>
                  </div>
                </div>
                <Switch
                  checked={profile.smsNotifications}
                  onCheckedChange={(v) => handleTogglePref("smsNotifications", v)}
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border bg-muted/20">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-brand-secondary/10 text-brand-secondary shrink-0">
                    <Sparkles className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">In-App AI Push</p>
                    <p className="text-[10px] text-muted-foreground">AI damage scan alerts</p>
                  </div>
                </div>
                <Switch
                  checked={profile.inAppNotifications}
                  onCheckedChange={(v) => handleTogglePref("inAppNotifications", v)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Settings Columns Area (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Section 1: Personal Information */}
          <Card className="border bg-card shadow-xs">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <User className="h-4.5 w-4.5 text-brand-primary" /> Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="profile-name" className="text-xs font-bold text-foreground mb-1.5 block">Full Name</label>
                  <Input id="profile-name" className="text-xs" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div>
                  <label htmlFor="profile-email" className="text-xs font-bold text-foreground mb-1.5 block">Email Address (Primary)</label>
                  <Input id="profile-email" className="text-xs bg-muted/30" value={profile.email} disabled title="Primary account email cannot be edited" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="profile-phone" className="text-xs font-bold text-foreground mb-1.5 block">Phone Number</label>
                  <Input id="profile-phone" className="text-xs" placeholder="+91 98765 43210" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                </div>
                <div>
                  <label htmlFor="profile-address" className="text-xs font-bold text-foreground mb-1.5 block">Residential Address</label>
                  <Input id="profile-address" className="text-xs" placeholder="City, State, Pincode" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  onClick={handleSaveProfile}
                  disabled={updateProfile.isPending}
                  className="bg-brand-primary text-white font-semibold text-xs h-9 px-5 rounded-xl"
                >
                  {updateProfile.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
                  Save Profile Changes
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Security & Password Update */}
          <Card className="border bg-card shadow-xs">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <KeyRound className="h-4.5 w-4.5 text-brand-secondary" /> Change Password
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <label htmlFor="profile-current-password" className="text-xs font-bold text-foreground mb-1.5 block">Current Password</label>
                <Input
                  id="profile-current-password"
                  type="password"
                  className="text-xs"
                  placeholder="••••••••"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="profile-new-password" className="text-xs font-bold text-foreground mb-1.5 block">New Password</label>
                  <Input
                    id="profile-new-password"
                    type="password"
                    className="text-xs"
                    placeholder="••••••••"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="profile-confirm-password" className="text-xs font-bold text-foreground mb-1.5 block">Confirm New Password</label>
                  <Input
                    id="profile-confirm-password"
                    type="password"
                    className="text-xs"
                    placeholder="••••••••"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  onClick={handleUpdatePassword}
                  disabled={changePassword.isPending || !passwordForm.currentPassword || !passwordForm.newPassword}
                  className="bg-brand-secondary text-white font-semibold text-xs h-9 px-5 rounded-xl"
                >
                  {changePassword.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
                  Update Password
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </motion.div>
  );
}
