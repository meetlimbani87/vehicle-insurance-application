import { useState } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { Search, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useClaims } from "@/hooks/useClaims";
import { ROUTES } from "@/constants/routes";

const pageVariants = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.25 } } };
const container = { animate: { transition: { staggerChildren: 0.07 } } };
const item = { initial: { opacity: 0, x: -12 }, animate: { opacity: 1, x: 0 } };

export default function ClaimTrackingPage() {
  const [tab, setTab] = useState("active");
  const [search, setSearch] = useState("");
  const { data: claims, isLoading } = useClaims();

  const active = claims?.filter((c) => c.status === "Under Review" || c.status === "Approved") ?? [];
  const pending = claims?.filter((c) => c.status === "Filed") ?? [];
  const closed = claims?.filter((c) => c.status === "Closed") ?? [];
  const unclaimed = claims?.filter((c) => c.status === "Rejected") ?? [];

  const filterClaims = (list: typeof active) => {
    if (!search) return list;
    const s = search.toLowerCase();
    return list.filter((c) => c.claimNumber.toLowerCase().includes(s) || c.location.toLowerCase().includes(s) || c.vehicleMake.toLowerCase().includes(s));
  };

  const renderList = (list: typeof active) => {
    const filtered = filterClaims(list);
    if (isLoading) return <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>;
    if (filtered.length === 0) return <p className="text-center text-muted-foreground py-8">No claims found</p>;
    return (
      <motion.div variants={container} initial="initial" animate="animate" className="space-y-3">
        {filtered.map((c) => (
          <motion.div key={c.id} variants={item}>
            <Link to={ROUTES.CLAIM_DETAIL(c.id)}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-brand-secondary/10 flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5 text-brand-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm">{c.claimNumber}</p>
                      <Badge variant={c.status === "Approved" ? "success" : c.status === "Rejected" ? "destructive" : c.status === "Closed" ? "secondary" : "warning"}>
                        {c.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{c.vehicleMake} {c.vehicleModel} • {c.location}</p>
                  </div>
                  <div className="text-right shrink-0">
                    {c.estimatedAmount && <p className="text-sm font-medium">₹{c.estimatedAmount.toLocaleString()}</p>}
                    <p className="text-xs text-muted-foreground">{c.accidentDate}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    );
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Claim Tracking</h1>
        <p className="text-muted-foreground">Track all your insurance claims</p>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search claims..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="active">Active ({active.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pending.length})</TabsTrigger>
          <TabsTrigger value="closed">Closed ({closed.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({unclaimed.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="active">{renderList(active)}</TabsContent>
        <TabsContent value="pending">{renderList(pending)}</TabsContent>
        <TabsContent value="closed">{renderList(closed)}</TabsContent>
        <TabsContent value="rejected">{renderList(unclaimed)}</TabsContent>
      </Tabs>
    </motion.div>
  );
}
