import { useState } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";
import { Search, Car, Bike, Truck, CarFront, Shield, FileText, Plus, ChevronRight, AlertCircle, CheckCircle2, ArrowUpDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import EmptyState from "@/components/ui/empty-state";
import { usePolicies } from "@/hooks/usePolicies";
import { useClaims } from "@/hooks/useClaims";
import { ROUTES } from "@/constants/routes";
import PageHeader from "@/components/layout/PageHeader";
import { formatPolicyTimeRemaining } from "@/lib/utils";

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25 } },
};
const container = { animate: { transition: { staggerChildren: 0.07 } } };
const item = { initial: { opacity: 0, x: -12 }, animate: { opacity: 1, x: 0 } };

export default function ApplicationsPage() {
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [vehicleFilter, setVehicleFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const { data: rawPolicies, isLoading: pLoading } = usePolicies();
  const { data: rawClaims, isLoading: cLoading } = useClaims();
  const isLoading = pLoading || cLoading;

  const policies = Array.isArray(rawPolicies) ? rawPolicies : [];
  const claims = Array.isArray(rawClaims) ? rawClaims : [];

  const activePolicies = policies.filter((p) => p.status === "Active" || p.status === "Renewed");
  const expiredPolicies = policies.filter((p) => p.status === "Expired" || p.status === "Cancelled");

  const filterPolicies = (items: typeof policies) => {
    let filtered = [...items];

    if (vehicleFilter) {
      filtered = filtered.filter((p) => {
        const str = `${p.vehicleType || ""} ${p.vehicleMake || ""} ${p.vehicleModel || ""}`.toLowerCase();
        if (vehicleFilter === "car") return str.includes("car") || str.includes("sedan") || str.includes("hatchback");
        if (vehicleFilter === "suv") return str.includes("suv") || str.includes("crossover");
        if (vehicleFilter === "two-wheeler") return str.includes("bike") || str.includes("motorcycle") || str.includes("scooter") || str.includes("two");
        if (vehicleFilter === "commercial") return str.includes("truck") || str.includes("van") || str.includes("commercial");
        return true;
      });
    }

    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter((p) =>
        [p.policyNumber, p.vehicleMake, p.vehicleModel, p.registrationNo, p.insuranceCompany]
          .filter(Boolean)
          .some((val) => String(val).toLowerCase().includes(s))
      );
    }

    // Policy Sorting Options
    if (sortBy === "newest") {
      filtered.sort((a, b) => new Date(b.startDate || 0).getTime() - new Date(a.startDate || 0).getTime());
    } else if (sortBy === "oldest") {
      filtered.sort((a, b) => new Date(a.startDate || 0).getTime() - new Date(b.startDate || 0).getTime());
    } else if (sortBy === "expiring_soon") {
      filtered.sort((a, b) => new Date(a.endDate || 0).getTime() - new Date(b.endDate || 0).getTime());
    } else if (sortBy === "premium_desc") {
      filtered.sort((a, b) => (b.premiumAmount || 0) - (a.premiumAmount || 0));
    } else if (sortBy === "premium_asc") {
      filtered.sort((a, b) => (a.premiumAmount || 0) - (b.premiumAmount || 0));
    } else if (sortBy === "vehicle") {
      filtered.sort((a, b) => `${a.vehicleMake} ${a.vehicleModel}`.localeCompare(`${b.vehicleMake} ${b.vehicleModel}`));
    }

    return filtered;
  };

  const getTabCount = (tabValue: string) => {
    if (tabValue === "active") return filterPolicies(activePolicies).length;
    if (tabValue === "expired") return filterPolicies(expiredPolicies).length;
    return filterPolicies(policies).length;
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="space-y-4 max-w-6xl mx-auto pb-12">
      <PageHeader
        title="Policies & Applications"
        description="View, manage, and apply for vehicle insurance policies"
        actions={
          <Link to={ROUTES.POLICY_CREATE}>
            <Button size="sm" className="bg-brand-primary text-white font-semibold cursor-pointer">
              <Plus className="h-4 w-4 mr-1.5" /> New Policy Application
            </Button>
          </Link>
        }
      />

      {/* Search, Filter & Order Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search by policy number, vehicle model, insurer..." className="pl-9 text-xs" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select
          options={[
            { value: "", label: "All Vehicles" },
            { value: "car", label: "Cars / Sedans" },
            { value: "suv", label: "SUVs / Crossovers" },
            { value: "two-wheeler", label: "Two Wheelers / Bikes" },
            { value: "commercial", label: "Commercial / Trucks" },
          ]}
          placeholder="All Vehicles"
          value={vehicleFilter}
          onChange={(val) => setVehicleFilter(val)}
          className="w-full sm:w-48"
        />
        <Select
          options={[
            { value: "newest", label: "Sort: Newest First" },
            { value: "oldest", label: "Sort: Oldest First" },
            { value: "expiring_soon", label: "Sort: Expiring Soonest" },
            { value: "premium_desc", label: "Sort: Premium (High to Low)" },
            { value: "premium_asc", label: "Sort: Premium (Low to High)" },
            { value: "vehicle", label: "Sort: Vehicle Name (A-Z)" },
          ]}
          placeholder="Sort Policies By"
          value={sortBy}
          onChange={(val) => setSortBy(val)}
          className="w-full sm:w-56"
        />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid w-full grid-cols-3 max-w-md bg-muted/60">
          <TabsTrigger value="all" className="text-xs">
            All Policies ({getTabCount("all")})
          </TabsTrigger>
          <TabsTrigger value="active" className="text-xs">
            Active ({getTabCount("active")})
          </TabsTrigger>
          <TabsTrigger value="expired" className="text-xs">
            Expired / Inactive ({getTabCount("expired")})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <RenderPolicyList isLoading={isLoading} policies={filterPolicies(policies)} allClaims={claims} />
        </TabsContent>

        <TabsContent value="active">
          <RenderPolicyList isLoading={isLoading} policies={filterPolicies(activePolicies)} allClaims={claims} />
        </TabsContent>

        <TabsContent value="expired">
          <RenderPolicyList isLoading={isLoading} policies={filterPolicies(expiredPolicies)} allClaims={claims} />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

function RenderPolicyList({ isLoading, policies, allClaims }: { isLoading: boolean; policies: any[]; allClaims: any[] }) {
  if (isLoading) {
    return (
      <div className="space-y-3 mt-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-28 rounded-2xl w-full" />
        ))}
      </div>
    );
  }

  if (policies.length === 0) {
    return (
      <EmptyState
        icon={Shield}
        title="No Policies Found"
        description="No insurance policies match your selected filters or search criteria."
        actionLabel="Add New Policy"
        onAction={() => (window.location.hash = "#" + ROUTES.POLICY_CREATE)}
      />
    );
  }

  return (
    <motion.div variants={container} initial="initial" animate="animate" className="space-y-3 mt-3">
      {policies.map((p) => {
        const linkedClaims = allClaims.filter(
          (c) =>
            c.policyId === p.id ||
            c.policyNumber === p.policyNumber ||
            (c.vehicleMake?.toLowerCase() === p.vehicleMake?.toLowerCase() && c.vehicleModel?.toLowerCase() === p.vehicleModel?.toLowerCase())
        );

        return (
          <motion.div key={p.id} variants={item}>
            <PolicyCard policy={p} linkedClaimsCount={linkedClaims.length} />
          </motion.div>
        );
      })}
    </motion.div>
  );
}

function getVehicleIcon(type?: string, make?: string, model?: string) {
  const str = `${type || ""} ${make || ""} ${model || ""}`.toLowerCase();
  if (
    str.includes("two wheeler") ||
    str.includes("bike") ||
    str.includes("motorcycle") ||
    str.includes("scooter") ||
    str.includes("yamaha") ||
    str.includes("fz") ||
    str.includes("royal enfield") ||
    str.includes("bullet") ||
    str.includes("ktm") ||
    str.includes("pulsar") ||
    str.includes("activa")
  ) {
    return Bike;
  }
  if (
    str.includes("suv") ||
    str.includes("crossover") ||
    str.includes("fortuner") ||
    str.includes("creta") ||
    str.includes("thar") ||
    str.includes("harrier") ||
    str.includes("xuv")
  ) {
    return CarFront;
  }
  if (
    str.includes("truck") ||
    str.includes("commercial") ||
    str.includes("bus") ||
    str.includes("van")
  ) {
    return Truck;
  }
  return Car;
}

function PolicyCard({ policy, linkedClaimsCount }: { policy: any; linkedClaimsCount: number }) {
  const VehicleIcon = getVehicleIcon(policy.vehicleType, policy.vehicleMake, policy.vehicleModel);
  const maxClaimsAllowed = policy.maxClaimsPerYear || 2;
  const remainingClaims = Math.max(0, maxClaimsAllowed - linkedClaimsCount);
  const durationDisplay = formatPolicyTimeRemaining(policy.endDate, policy.status);

  return (
    <Link to={ROUTES.POLICY_DETAIL(policy.id)}>
      <Card className="hover:border-brand-primary/50 transition-all duration-200 shadow-xs border hover:shadow-md cursor-pointer group">
        <CardContent className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-11 w-11 rounded-xl bg-brand-primary/10 text-brand-primary flex items-center justify-center shrink-0 shadow-2xs group-hover:bg-brand-primary group-hover:text-white transition-colors">
              <VehicleIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold text-sm text-foreground group-hover:text-brand-primary transition-colors">
                  {policy.policyNumber}
                </p>
                <Badge variant={policy.status === "Active" || policy.status === "Renewed" ? "success" : policy.status === "Expired" ? "destructive" : "secondary"} className="text-[10px] px-2 py-0.5">
                  {policy.status}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {policy.vehicleMake} {policy.vehicleModel} ({policy.vehicleYear || "2022"}) &bull; Reg: <strong className="text-foreground">{policy.registrationNo || "N/A"}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap self-end sm:self-center">
            {/* Policy Time Remaining Duration Tag */}
            <div className="text-left sm:text-right bg-muted/40 px-3 py-1.5 rounded-xl border">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase">Coverage Validity</p>
              <p className={`text-xs ${durationDisplay.colorClass}`}>
                {durationDisplay.label}
              </p>
            </div>

            {/* Claims Allowance Capacity Tag */}
            <div className="text-left sm:text-right bg-muted/40 px-3 py-1.5 rounded-xl border">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase">Claims Allowance</p>
              <p className="text-xs font-bold text-foreground">
                {linkedClaimsCount} / {maxClaimsAllowed} per yr{" "}
                <span className={`text-[10px] font-medium ${remainingClaims > 0 ? "text-emerald-600" : "text-amber-600"}`}>
                  ({remainingClaims > 0 ? `${remainingClaims} left` : "Cap reached"})
                </span>
              </p>
            </div>

            <div className="text-right">
              <p className="text-[10px] text-muted-foreground uppercase font-semibold">Insurer & Premium</p>
              <p className="text-xs font-bold text-brand-primary">
                {policy.insuranceCompany || "Insurer"} &bull; {policy.premiumAmount ? `₹${policy.premiumAmount.toLocaleString()}/yr` : "₹12,500/yr"}
              </p>
            </div>

            <Button size="sm" variant="outline" className="text-xs h-8 px-3 rounded-lg group-hover:border-brand-primary group-hover:text-brand-primary">
              Details <ChevronRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
