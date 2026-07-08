import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import PageHeader from "@/components/layout/PageHeader";

const pageVariants = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.25 } } };

const claimsByMonth = [
  { month: "Jan", count: 12 }, { month: "Feb", count: 8 }, { month: "Mar", count: 15 },
  { month: "Apr", count: 10 }, { month: "May", count: 18 }, { month: "Jun", count: 14 },
  { month: "Jul", count: 20 }, { month: "Aug", count: 16 }, { month: "Sep", count: 22 },
  { month: "Oct", count: 11 }, { month: "Nov", count: 9 }, { month: "Dec", count: 13 },
];

const policyStatus = [
  { status: "Active", count: 120, color: "#16A085" },
  { status: "Expired", count: 45, color: "#ef4444" },
  { status: "Renewed", count: 30, color: "#2E75B6" },
  { status: "Cancelled", count: 15, color: "#F59E0B" },
];

const vehicleCategories = [
  { type: "Car", count: 85 },
  { type: "SUV", count: 45 },
  { type: "Two Wheeler", count: 60 },
  { type: "Commercial", count: 20 },
];

const settlementTime = [
  { month: "Jan", days: 15 }, { month: "Feb", days: 12 }, { month: "Mar", days: 18 },
  { month: "Apr", days: 10 }, { month: "May", days: 14 }, { month: "Jun", days: 8 },
  { month: "Jul", days: 11 }, { month: "Aug", days: 9 }, { month: "Sep", days: 13 },
  { month: "Oct", days: 7 }, { month: "Nov", days: 10 }, { month: "Dec", days: 12 },
];

export default function AnalyticsPage() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const maxClaims = Math.max(...claimsByMonth.map((d) => d.count));
  const maxVehicle = Math.max(...vehicleCategories.map((d) => d.count));
  const totalPolicies = policyStatus.reduce((s, p) => s + p.count, 0);
  const maxDays = Math.max(...settlementTime.map((d) => d.days));

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate">
      <PageHeader
        title="Analytics"
        description="Detailed system analytics and trends"
        actions={
          <>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-36" />
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-36" />
          </>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Claims by Month - Horizontal Bars */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Claims by Month</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {claimsByMonth.map((d, i) => (
                <motion.div
                  key={d.month}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3"
                >
                  <span className="text-xs w-8 text-right text-muted-foreground">{d.month}</span>
                  <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-brand-secondary rounded-full flex items-center justify-end pr-2"
                      initial={{ width: 0 }}
                      animate={{ width: `${(d.count / maxClaims) * 100}%` }}
                      transition={{ duration: 0.5, delay: i * 0.05 }}
                    >
                      <span className="text-xs text-white font-medium">{d.count}</span>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Policy Status Donut */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Policy Status Breakdown</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center gap-5">
              <div className="relative w-40 h-40">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  {(() => {
                    let offset = 0;
                    return policyStatus.map((p) => {
                      const pct = (p.count / totalPolicies) * 100;
                      const dashArray = `${pct * 2.51} ${251.2 - pct * 2.51}`;
                      const el = (
                        <circle key={p.status} cx="50" cy="50" r="40" fill="none"
                          stroke={p.color} strokeWidth="12"
                          strokeDasharray={dashArray} strokeDashoffset={-offset * 2.512} />
                      );
                      offset += pct;
                      return el;
                    });
                  })()}
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <p className="text-2xl font-bold">{totalPolicies}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
              <div className="space-y-3">
                {policyStatus.map((p) => (
                  <div key={p.status} className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-sm">{p.status}</span>
                    <span className="text-sm font-bold ml-auto">{p.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vehicle Categories Bar */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Vehicle Categories</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-end gap-4 h-48 px-4">
              {vehicleCategories.map((v, i) => (
                <div key={v.type} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-sm font-bold">{v.count}</span>
                  <motion.div
                    className="w-full bg-brand-primary rounded-t-lg"
                    initial={{ height: 0 }}
                    animate={{ height: `${(v.count / maxVehicle) * 100}%` }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                  />
                  <span className="text-xs text-muted-foreground text-center">{v.type}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Average Settlement Time Line */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Avg Settlement Time (days)</CardTitle></CardHeader>
          <CardContent>
            <div className="relative h-48">
              <svg viewBox="0 0 480 200" className="w-full h-full" preserveAspectRatio="none">
                {/* Grid lines */}
                {[0, 50, 100, 150].map((y) => (
                  <line key={y} x1="0" y1={y} x2="480" y2={y} stroke="#e2e8f0" strokeWidth="0.5" />
                ))}
                {/* Line */}
                <motion.polyline
                  fill="none"
                  stroke="#2E75B6"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1 }}
                  points={settlementTime.map((d, i) => `${i * (480 / 11)},${200 - (d.days / maxDays) * 180}`).join(" ")}
                />
                {/* Dots */}
                {settlementTime.map((d, i) => (
                  <motion.circle
                    key={d.month}
                    cx={i * (480 / 11)}
                    cy={200 - (d.days / maxDays) * 180}
                    r="4"
                    fill="#2E75B6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.08 }}
                  />
                ))}
              </svg>
              <div className="flex justify-between mt-1">
                {settlementTime.map((d) => (
                  <span key={d.month} className="text-xs text-muted-foreground">{d.month}</span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
