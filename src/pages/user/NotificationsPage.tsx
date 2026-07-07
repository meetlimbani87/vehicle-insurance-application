import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, CreditCard, FileText, Shield, Settings, CheckCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { mockNotifications, type Notification } from "@/mock/mockNotifications";
import { toast } from "sonner";

const pageVariants = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.25 } } };
const container = { animate: { transition: { staggerChildren: 0.05 } } };
const item = { initial: { opacity: 0, x: -12 }, animate: { opacity: 1, x: 0 } };

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  CreditCard, FileText, Shield, Bell, CheckCircle: FileText, XCircle: FileText, AlertTriangle: Bell, UserPlus: Settings, Upload: FileText,
};

export default function NotificationsPage() {
  const [tab, setTab] = useState("all");
  const [notifications, setNotifications] = useState(mockNotifications);

  const markAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  const markRead = (id: string) => {
    setNotifications(notifications.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const filterByTab = (list: Notification[]) => {
    if (tab === "all") return list;
    return list.filter((n) => n.type === tab);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const renderList = (list: Notification[]) => {
    if (list.length === 0) return <p className="text-center text-muted-foreground py-8">No notifications</p>;
    return (
      <motion.div variants={container} initial="initial" animate="animate" className="space-y-2">
        {list.map((n) => {
          const Icon = iconMap[n.icon] || Bell;
          return (
            <motion.div key={n.id} variants={item}>
              <Card className={`cursor-pointer transition-colors ${!n.read ? "border-brand-secondary/30 bg-brand-secondary/5" : ""}`}
                onClick={() => markRead(n.id)}>
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm ${!n.read ? "font-semibold" : "font-medium"}`}>{n.title}</p>
                      {!n.read && <div className="h-2 w-2 rounded-full bg-amber-500 shrink-0" />}
                    </div>
                    <p className="text-sm text-muted-foreground">{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(n.timestamp).toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>
    );
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">{unreadCount} unread notifications</p>
        </div>
        <Button variant="outline" onClick={markAllRead}>
          <CheckCheck className="h-4 w-4 mr-2" /> Mark All Read
        </Button>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-4 overflow-x-auto">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="claim">Claim</TabsTrigger>
          <TabsTrigger value="policy">Policy</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>
        <TabsContent value={tab}>
          {renderList(filterByTab(notifications))}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
