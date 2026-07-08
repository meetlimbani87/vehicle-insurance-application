import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, CreditCard, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockPayments } from "@/mock/mockPayments";
import { toast } from "sonner";
import PageHeader from "@/components/layout/PageHeader";

const pageVariants = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.25 } } };

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

export default function PaymentSchedulePage() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 1, 1));
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const pendingPayments = mockPayments.filter((p) => p.status === "Pending" || p.status === "Overdue");
  const upcomingPayments = pendingPayments.slice(0, 3);

  const getDueDatesInMonth = () => {
    const dueDates: Record<number, typeof mockPayments> = {};
    mockPayments.forEach((p) => {
      const d = new Date(p.dueDate);
      if (d.getFullYear() === year && d.getMonth() === month) {
        const day = d.getDate();
        if (!dueDates[day]) dueDates[day] = [];
        dueDates[day].push(p);
      }
    });
    return dueDates;
  };

  const dueDates = getDueDatesInMonth();

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate">
      <PageHeader title="Payment Schedule" description="Track your premium due dates" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">{MONTHS[month]} {year}</CardTitle>
              <div className="flex gap-1">
                <Button variant="outline" size="icon" onClick={() => setCurrentDate(new Date(year, month - 1, 1))}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={() => setCurrentDate(new Date(year, month + 1, 1))}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1">
                {DAYS.map((d) => (
                  <div key={d} className="text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
                ))}
                {Array.from({ length: firstDay }, (_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const payments = dueDates[day];
                  const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
                  const hasOverdue = payments?.some((p) => p.status === "Overdue");
                  const hasPending = payments?.some((p) => p.status === "Pending");

                  return (
                    <div
                      key={day}
                      className={`relative text-center py-2 rounded-lg text-sm ${
                        isToday ? "bg-brand-primary text-white font-bold" :
                        hasOverdue ? "bg-red-100 text-red-800 font-medium" :
                        hasPending ? "bg-amber-100 text-amber-800 font-medium" : "hover:bg-muted"
                      }`}
                    >
                      {day}
                      {payments && (
                        <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-current" />
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" /> Upcoming Payments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingPayments.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No upcoming payments</p>
              ) : (
                upcomingPayments.map((p) => (
                  <div key={p.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium">{p.policyNumber}</p>
                      <Badge variant={p.status === "Overdue" ? "destructive" : "warning"}>{p.status}</Badge>
                    </div>
                    <p className="text-lg font-bold">₹{p.amount.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Due: {p.dueDate}</p>
                    <Button
                      className="w-full mt-3"
                      size="sm"
                      disabled
                      onClick={() => toast.info("Payment gateway coming soon")}
                    >
                      <CreditCard className="h-4 w-4 mr-2" /> Pay Now
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
}
