import { useState } from "react";
import { motion } from "framer-motion";
import { User, Lock, Bell } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useCurrentUser } from "@/hooks/useAuth";
import { toast } from "sonner";
import PageHeader from "@/components/layout/PageHeader";

const pageVariants = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.25 } } };

export default function ProfilePage() {
  const user = useCurrentUser();
  const [profile, setProfile] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: "123 Main St, Mumbai, MH 400001",
  });
  const [notifPrefs, setNotifPrefs] = useState({ email: true, sms: false, inApp: true });

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="max-w-2xl mx-auto">
      <PageHeader title="Profile Settings" className="mb-4" />

      <div className="space-y-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" /> Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="profile-name" className="text-sm font-medium mb-1.5 block">Full Name</label>
                  <Input id="profile-name" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
                </div>
                <div>
                  <label htmlFor="profile-email" className="text-sm font-medium mb-1.5 block">Email</label>
                  <Input id="profile-email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="profile-phone" className="text-sm font-medium mb-1.5 block">Phone</label>
                  <Input id="profile-phone" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
                </div>
                <div>
                  <label htmlFor="profile-address" className="text-sm font-medium mb-1.5 block">Address</label>
                  <Input id="profile-address" value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} />
                </div>
              </div>
              <Button onClick={() => toast.success("Profile updated successfully")}>Save Changes</Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lock className="h-5 w-5" /> Change Password
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label htmlFor="profile-current-password" className="text-sm font-medium mb-1.5 block">Current Password</label>
                <Input id="profile-current-password" type="password" autoComplete="current-password" placeholder="••••••••" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="profile-new-password" className="text-sm font-medium mb-1.5 block">New Password</label>
                  <Input id="profile-new-password" type="password" autoComplete="new-password" placeholder="••••••••" />
                </div>
                <div>
                  <label htmlFor="profile-confirm-password" className="text-sm font-medium mb-1.5 block">Confirm New Password</label>
                  <Input id="profile-confirm-password" type="password" autoComplete="new-password" placeholder="••••••••" />
                </div>
              </div>
              <Button onClick={() => toast.success("Password changed successfully")}>Update Password</Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-5 w-5" /> Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p id="notif-email-label" className="text-sm font-medium">Email Notifications</p>
                  <p className="text-xs text-muted-foreground">Receive updates via email</p>
                </div>
                <Switch aria-labelledby="notif-email-label" checked={notifPrefs.email} onCheckedChange={(v) => setNotifPrefs({ ...notifPrefs, email: v })} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p id="notif-sms-label" className="text-sm font-medium">SMS Notifications</p>
                  <p className="text-xs text-muted-foreground">Receive updates via SMS</p>
                </div>
                <Switch aria-labelledby="notif-sms-label" checked={notifPrefs.sms} onCheckedChange={(v) => setNotifPrefs({ ...notifPrefs, sms: v })} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p id="notif-inapp-label" className="text-sm font-medium">In-App Notifications</p>
                  <p className="text-xs text-muted-foreground">Receive in-app push notifications</p>
                </div>
                <Switch aria-labelledby="notif-inapp-label" checked={notifPrefs.inApp} onCheckedChange={(v) => setNotifPrefs({ ...notifPrefs, inApp: v })} />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
