import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Eye, UserCheck, UserX, ArrowUp, ArrowDown, UserPlus, Shield, Lock, Mail, Phone, User as UserIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { type User } from "@/mock/mockUsers";
import { useAdminUsers, useUpdateUserStatus, useCreateAdminUser } from "@/hooks/useAdminUsers";
import PageHeader from "@/components/layout/PageHeader";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const pageVariants = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.25 } } };

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [sortField, setSortField] = useState<"name" | "policiesCount" | "claimsCount" | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const { data: users = [], isLoading } = useAdminUsers();
  const updateStatus = useUpdateUserStatus();
  const createAdmin = useCreateAdminUser();

  const [viewUser, setViewUser] = useState<User | null>(null);
  const [showCreateAdminModal, setShowCreateAdminModal] = useState(false);

  // New Admin Form State
  const [adminForm, setAdminForm] = useState({ name: "", email: "", password: "", phone: "" });

  const setSorting = (field: "name" | "policiesCount" | "claimsCount", order: "asc" | "desc") => {
    setSortField(field);
    setSortOrder(order);
  };

  const handleCreateAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminForm.name || !adminForm.email) {
      toast.error("Name and email are required");
      return;
    }
    createAdmin.mutate(adminForm, {
      onSuccess: () => {
        setShowCreateAdminModal(false);
        setAdminForm({ name: "", email: "", password: "", phone: "" });
      },
    });
  };

  const filtered = users.filter((u) => {
    if (statusFilter && u.status !== statusFilter) return false;
    if (roleFilter && u.role !== roleFilter) return false;
    if (search.trim()) {
      const s = search.toLowerCase();
      if (!u.name.toLowerCase().includes(s) && !u.email.toLowerCase().includes(s) && !u.phone.includes(s)) return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (!sortField) return 0;
    if (sortField === "name") {
      return sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
    }
    if (sortField === "policiesCount") {
      return sortOrder === "asc" ? a.policiesCount - b.policiesCount : b.policiesCount - a.policiesCount;
    }
    if (sortField === "claimsCount") {
      return sortOrder === "asc" ? a.claimsCount - b.claimsCount : b.claimsCount - a.claimsCount;
    }
    return 0;
  });

  const toggleStatus = (user: User) => {
    updateStatus.mutate({ id: user.id, status: user.status === "Active" ? "Suspended" : "Active" });
  };

  const customerCount = users.filter((u) => u.role === "user").length;
  const adminCount = users.filter((u) => u.role === "admin").length;

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate" className="space-y-5 max-w-6xl mx-auto pb-12">
      <PageHeader
        title="Manage Users"
        description="View and manage user accounts, status standing, and administrative roles"
        actions={
          <Button
            size="sm"
            onClick={() => setShowCreateAdminModal(true)}
            className="bg-brand-primary hover:bg-brand-primary/90 text-white font-semibold text-xs h-9 px-4 shadow-xs"
          >
            <UserPlus className="h-4 w-4 mr-1.5" /> Create Admin Account
          </Button>
        }
      />

      {/* Account Type Segmented Tab Bar */}
      <div className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-xl border border-border w-fit">
        <button
          onClick={() => setRoleFilter("")}
          className={cn(
            "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
            !roleFilter ? "bg-background text-foreground shadow-xs border" : "text-muted-foreground hover:text-foreground"
          )}
        >
          All Accounts ({users.length})
        </button>
        <button
          onClick={() => setRoleFilter("user")}
          className={cn(
            "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
            roleFilter === "user" ? "bg-background text-foreground shadow-xs border" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Customer Accounts ({customerCount})
        </button>
        <button
          onClick={() => setRoleFilter("admin")}
          className={cn(
            "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
            roleFilter === "admin" ? "bg-background text-foreground shadow-xs border" : "text-muted-foreground hover:text-foreground"
          )}
        >
          Admin Accounts ({adminCount})
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search users by name, email, or phone..." className="pl-9 text-xs" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <Select
          options={[
            { value: "", label: "All Statuses" },
            { value: "Active", label: "Active" },
            { value: "Suspended", label: "Suspended / Blocked" },
          ]}
          placeholder="All Statuses"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="sm:w-44 text-xs bg-background"
        />
      </div>

      <Card className="border bg-card shadow-xs">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/40 text-muted-foreground uppercase font-bold text-[11px]">
                  
                  {/* Sortable Name Column with Dual Arrow Buttons */}
                  <th scope="col" className="text-left py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <span>Name</span>
                      <div className="inline-flex items-center gap-0.5">
                        <button
                          onClick={() => setSorting("name", "asc")}
                          className={cn(
                            "p-0.5 rounded hover:bg-muted transition-colors cursor-pointer",
                            sortField === "name" && sortOrder === "asc" ? "text-brand-primary font-bold" : "opacity-35 hover:opacity-100"
                          )}
                          title="Sort Ascending (A-Z)"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setSorting("name", "desc")}
                          className={cn(
                            "p-0.5 rounded hover:bg-muted transition-colors cursor-pointer",
                            sortField === "name" && sortOrder === "desc" ? "text-brand-primary font-bold" : "opacity-35 hover:opacity-100"
                          )}
                          title="Sort Descending (Z-A)"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </th>

                  <th scope="col" className="text-left py-3 px-4 hidden md:table-cell">Email</th>
                  <th scope="col" className="text-left py-3 px-4 hidden lg:table-cell">Phone</th>

                  {/* Sortable Policies Column with Dual Arrow Buttons */}
                  <th scope="col" className="text-left py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <span>Policies</span>
                      <div className="inline-flex items-center gap-0.5">
                        <button
                          onClick={() => setSorting("policiesCount", "asc")}
                          className={cn(
                            "p-0.5 rounded hover:bg-muted transition-colors cursor-pointer",
                            sortField === "policiesCount" && sortOrder === "asc" ? "text-brand-primary font-bold" : "opacity-35 hover:opacity-100"
                          )}
                          title="Sort Ascending (Low to High)"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setSorting("policiesCount", "desc")}
                          className={cn(
                            "p-0.5 rounded hover:bg-muted transition-colors cursor-pointer",
                            sortField === "policiesCount" && sortOrder === "desc" ? "text-brand-primary font-bold" : "opacity-35 hover:opacity-100"
                          )}
                          title="Sort Descending (High to Low)"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </th>

                  {/* Sortable Claims Column with Dual Arrow Buttons */}
                  <th scope="col" className="text-left py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <span>Claims</span>
                      <div className="inline-flex items-center gap-0.5">
                        <button
                          onClick={() => setSorting("claimsCount", "asc")}
                          className={cn(
                            "p-0.5 rounded hover:bg-muted transition-colors cursor-pointer",
                            sortField === "claimsCount" && sortOrder === "asc" ? "text-brand-primary font-bold" : "opacity-35 hover:opacity-100"
                          )}
                          title="Sort Ascending (Low to High)"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setSorting("claimsCount", "desc")}
                          className={cn(
                            "p-0.5 rounded hover:bg-muted transition-colors cursor-pointer",
                            sortField === "claimsCount" && sortOrder === "desc" ? "text-brand-primary font-bold" : "opacity-35 hover:opacity-100"
                          )}
                          title="Sort Descending (High to Low)"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </th>

                  <th scope="col" className="text-left py-3 px-4">Status</th>
                  <th scope="col" className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {isLoading ? (
                  <tr><td colSpan={7} className="py-8 text-center text-muted-foreground">Loading user directory...</td></tr>
                ) : sorted.length === 0 ? (
                  <tr><td colSpan={7} className="py-8 text-center text-muted-foreground">No users match your criteria</td></tr>
                ) : sorted.map((u) => (
                  <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-semibold text-foreground flex items-center gap-2">
                      <span>{u.name}</span>
                      {u.role === "admin" && <Badge variant="warning" className="text-[9px] px-1.5 py-0">Admin</Badge>}
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell font-mono text-muted-foreground">{u.email}</td>
                    <td className="py-3 px-4 hidden lg:table-cell text-muted-foreground">{u.phone}</td>
                    <td className="py-3 px-4 font-bold text-foreground">{u.policiesCount}</td>
                    <td className="py-3 px-4 font-bold text-foreground">{u.claimsCount}</td>
                    <td className="py-3 px-4">
                      {u.status === "Active" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-slate-100 border border-slate-700 shadow-2xs">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active
                        </span>
                      ) : (
                        <Badge variant="destructive" className="text-[10px] px-2 py-0.5">
                          {u.status}
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-lg border border-border bg-background hover:bg-brand-primary hover:text-white hover:border-brand-primary text-muted-foreground transition-all cursor-pointer shadow-2xs"
                          title="View Profile Details"
                          onClick={() => setViewUser(u)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            "h-8 w-8 p-0 rounded-lg transition-all cursor-pointer shadow-2xs",
                            u.status === "Active"
                              ? "border-destructive/30 bg-destructive/5 text-destructive hover:bg-destructive hover:text-white hover:border-destructive"
                              : "border-emerald-500/30 bg-emerald-500/5 text-emerald-600 hover:bg-emerald-600 hover:text-white hover:border-emerald-600"
                          )}
                          title={u.status === "Active" ? "Suspend user" : "Reactivate user"}
                          disabled={updateStatus.isPending}
                          onClick={() => toggleStatus(u)}
                        >
                          {u.status === "Active" ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* User Profile View Dialog */}
      <Dialog open={!!viewUser} onOpenChange={() => setViewUser(null)}>
        <DialogHeader>
          <DialogTitle className="text-base font-bold">User Account Profile &bull; {viewUser?.name}</DialogTitle>
        </DialogHeader>
        {viewUser && (
          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3 p-4 border rounded-xl bg-muted/20">
              <div><span className="text-muted-foreground font-medium block">Full Name</span> <strong className="text-foreground text-sm">{viewUser.name}</strong></div>
              <div><span className="text-muted-foreground font-medium block">Email Address</span> <strong className="text-foreground">{viewUser.email}</strong></div>
              <div><span className="text-muted-foreground font-medium block">Phone Number</span> <strong className="text-foreground">{viewUser.phone}</strong></div>
              <div><span className="text-muted-foreground font-medium block">Account Role</span> <Badge variant="outline" className="mt-0.5 capitalize">{viewUser.role}</Badge></div>
              <div><span className="text-muted-foreground font-medium block">Account Status</span> <Badge variant={viewUser.status === "Active" ? "success" : "destructive"} className="mt-0.5">{viewUser.status}</Badge></div>
              <div><span className="text-muted-foreground font-medium block">Registration Date</span> <strong className="text-foreground">{viewUser.joinedDate}</strong></div>
              <div><span className="text-muted-foreground font-medium block">Active Policies</span> <strong className="text-brand-primary">{viewUser.policiesCount}</strong></div>
              <div><span className="text-muted-foreground font-medium block">Claims Filed</span> <strong className="text-brand-secondary">{viewUser.claimsCount}</strong></div>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => setViewUser(null)} className="text-xs">Close Profile</Button>
        </DialogFooter>
      </Dialog>

      {/* Create Admin Dialog */}
      <Dialog open={showCreateAdminModal} onOpenChange={setShowCreateAdminModal}>
        <DialogHeader>
          <DialogTitle className="text-base font-bold flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-brand-primary" /> Create New Admin Account
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Register a new system administrator with full access privileges.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleCreateAdminSubmit} className="space-y-3 py-2 text-xs">
          <div>
            <label className="font-semibold text-foreground mb-1 block">Full Name</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="e.g. Admin Officer"
                className="pl-9 text-xs"
                value={adminForm.name}
                onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-foreground mb-1 block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="admin.officer@vehicle.com"
                className="pl-9 text-xs"
                value={adminForm.email}
                onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-foreground mb-1 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="••••••••"
                className="pl-9 text-xs"
                value={adminForm.password}
                onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-foreground mb-1 block">Phone Number (Optional)</label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="9999999999"
                className="pl-9 text-xs"
                value={adminForm.phone}
                onChange={(e) => setAdminForm({ ...adminForm, phone: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter className="pt-3">
            <Button variant="outline" size="sm" type="button" onClick={() => setShowCreateAdminModal(false)} className="text-xs">
              Cancel
            </Button>
            <Button size="sm" type="submit" disabled={createAdmin.isPending} className="bg-brand-primary text-white text-xs px-4">
              {createAdmin.isPending ? "Creating..." : "Register Admin"}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </motion.div>
  );
}
