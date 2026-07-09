import { useState } from "react";
import { motion } from "framer-motion";
import { Wrench, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import PageHeader from "@/components/layout/PageHeader";

const pageVariants = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.25 } } };

export default function MaintenancePage() {
  const [enabled, setEnabled] = useState(false);
  const [message, setMessage] = useState("We're currently performing scheduled maintenance. We'll be back shortly. Thank you for your patience.");

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="max-w-2xl mx-auto">
      <PageHeader title="Maintenance Settings" description="Control system maintenance mode" />

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Wrench className="h-5 w-5" /> Maintenance Mode
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p id="maintenance-toggle-label" className="font-medium">Enable Maintenance Mode</p>
                <p className="text-sm text-muted-foreground">Users will see a maintenance message</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={enabled ? "destructive" : "success"}>{enabled ? "ON" : "OFF"}</Badge>
                <Switch aria-labelledby="maintenance-toggle-label" checked={enabled} onCheckedChange={setEnabled} />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1.5 block">Maintenance Message</label>
              <Textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} />
            </div>

            <Button className="mt-4" onClick={() => toast.success("Settings saved")}>Save Settings</Button>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {enabled ? (
              <div className="border-2 border-brand-warn/20 rounded-xl p-5 bg-brand-warn/[0.08] text-center">
                <AlertTriangle className="h-12 w-12 text-brand-warn mx-auto mb-3" />
                <h3 className="text-lg font-bold text-brand-warn mb-2">Under Maintenance</h3>
                <p className="text-sm text-brand-warn/90">{message}</p>
              </div>
            ) : (
              <div className="border-2 border-dashed border-muted rounded-xl p-5 text-center">
                <p className="text-muted-foreground">Maintenance mode is disabled. Enable it to see the preview.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
