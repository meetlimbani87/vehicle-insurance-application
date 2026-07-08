import { useState } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { Search, Inbox, Car, Shield, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { usePolicies } from "@/hooks/usePolicies";
import { useClaims } from "@/hooks/useClaims";
import { ROUTES } from "@/constants/routes";
import PageHeader from "@/components/layout/PageHeader";

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};
const container = { animate: { transition: { staggerChildren: 0.07 } } };
const item = { initial: { opacity: 0, x: -12 }, animate: { opacity: 1, x: 0 } };

export default function ApplicationsPage() {
  const [tab, setTab] = useState("pending");
  const [search, setSearch] = useState("");
  const [vehicleFilter, setVehicleFilter] = useState("");
  const { data: policies, isLoading: pLoading } = usePolicies();
  const { data: claims, isLoading: cLoading } = useClaims();
  const isLoading = pLoading || cLoading;

  const pendingClaims = claims?.filter((c) => c.status === "Filed" || c.status === "Under Review") ?? [];
  const unclaimed = policies?.filter((p) => !claims?.some((c) => c.policyId === p.id)) ?? [];
  const claimed = claims?.filter((c) => c.status === "Approved" || c.status === "Closed") ?? [];
  const rejected = claims?.filter((c) => c.status === "Rejected") ?? [];

  const filterBySearch = <T extends { vehicleMake?: string; vehicleModel?: string; policyNumber?: string; claimNumber?: string; registrationNo?: string }>(items: T[]) => {
    let filtered = items;
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter((i) =>
        [i.vehicleMake, i.vehicleModel, i.policyNumber, i.claimNumber, i.registrationNo]
          .filter(Boolean)
          .some((v) => v!.toLowerCase().includes(s))
      );
    }
    return filtered;
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate">
      <PageHeader title="Applications" description="View all your policies and claims" />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by name, number..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select
          options={[
            { value: "car", label: "Car" },
            { value: "suv", label: "SUV" },
            { value: "two-wheeler", label: "Two Wheeler" },
            { value: "commercial", label: "Commercial" },
          ]}
          placeholder="All Vehicles"
          value={vehicleFilter}
          onChange={(e) => setVehicleFilter(e.target.value)}
          className="w-full sm:w-48"
        />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="w-full sm:w-auto overflow-x-auto">
          <TabsTrigger value="pending">Pending ({pendingClaims.length})</TabsTrigger>
          <TabsTrigger value="unclaimed">Unclaimed ({unclaimed.length})</TabsTrigger>
          <TabsTrigger value="claimed">Claimed ({claimed.length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({rejected.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {isLoading ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
          ) : filterBySearch(pendingClaims).length === 0 ? (
            <EmptyState message="No pending claims" />
          ) : (
            <motion.div variants={container} initial="initial" animate="animate" className="space-y-3">
              {filterBySearch(pendingClaims).map((c) => (
                <motion.div key={c.id} variants={item}>
                  <ClaimCard claim={c} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="unclaimed">
          {isLoading ? (
            <div className="space-y-3">{[1, 2].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
          ) : filterBySearch(unclaimed).length === 0 ? (
            <EmptyState message="All policies have claims" />
          ) : (
            <motion.div variants={container} initial="initial" animate="animate" className="space-y-3">
              {filterBySearch(unclaimed).map((p) => (
                <motion.div key={p.id} variants={item}>
                  <PolicyCard policy={p} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="claimed">
          {isLoading ? (
            <div className="space-y-3">{[1, 2].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
          ) : filterBySearch(claimed).length === 0 ? (
            <EmptyState message="No claimed items" />
          ) : (
            <motion.div variants={container} initial="initial" animate="animate" className="space-y-3">
              {filterBySearch(claimed).map((c) => (
                <motion.div key={c.id} variants={item}>
                  <ClaimCard claim={c} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="rejected">
          {filterBySearch(rejected).length === 0 ? (
            <EmptyState message="No rejected claims" />
          ) : (
            <motion.div variants={container} initial="initial" animate="animate" className="space-y-3">
              {filterBySearch(rejected).map((c) => (
                <motion.div key={c.id} variants={item}>
                  <ClaimCard claim={c} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
      <Inbox className="h-12 w-12 mb-3 opacity-40" />
      <p>{message}</p>
    </div>
  );
}

function ClaimCard({ claim }: { claim: { id: string; claimNumber: string; vehicleMake: string; vehicleModel: string; status: string; accidentDate: string; estimatedAmount: number | null } }) {
  return (
    <Link to={ROUTES.CLAIM_DETAIL(claim.id)}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-brand-secondary/10 flex items-center justify-center shrink-0">
            <FileText className="h-5 w-5 text-brand-secondary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium text-sm">{claim.claimNumber}</p>
              <Badge variant={claim.status === "Approved" ? "success" : claim.status === "Rejected" ? "destructive" : "warning"}>
                {claim.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{claim.vehicleMake} {claim.vehicleModel} • {claim.accidentDate}</p>
          </div>
          {claim.estimatedAmount && <p className="text-sm font-medium">₹{claim.estimatedAmount.toLocaleString()}</p>}
        </CardContent>
      </Card>
    </Link>
  );
}

function PolicyCard({ policy }: { policy: { id: string; policyNumber: string; vehicleMake: string; vehicleModel: string; status: string; endDate: string } }) {
  return (
    <Link to={ROUTES.POLICY_DETAIL(policy.id)}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4 flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-brand-primary/10 flex items-center justify-center shrink-0">
            <Shield className="h-5 w-5 text-brand-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium text-sm">{policy.policyNumber}</p>
              <Badge variant={policy.status === "Active" ? "success" : policy.status === "Expired" ? "destructive" : "secondary"}>
                {policy.status}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{policy.vehicleMake} {policy.vehicleModel} • Expires {policy.endDate}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
