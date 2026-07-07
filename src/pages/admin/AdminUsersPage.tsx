import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Eye, UserCheck, UserX } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { mockUsers, type User } from "@/mock/mockUsers";
import { toast } from "sonner";

const pageVariants = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.25 } } };

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState(mockUsers);
  const [viewUser, setViewUser] = useState<User | null>(null);

  const filtered = users.filter((u) => {
    if (search.length < 2) return true;
    const s = search.toLowerCase();
    return u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s);
  });

  const toggleStatus = (userId: string) => {
    setUsers(users.map((u) => u.id === userId ? { ...u, status: u.status === "Active" ? "Suspended" as const : "Active" as const } : u));
    toast.success("User status updated");
  };

  return (
    <motion.div variants={pageVariants} initial="initial" animate="animate">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Manage Users</h1>
        <p className="text-muted-foreground">View and manage user accounts</p>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search users (min 2 chars)..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden lg:table-cell">Phone</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Policies</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Claims</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="py-3 px-4 font-medium">{u.name}</td>
                    <td className="py-3 px-4 hidden md:table-cell">{u.email}</td>
                    <td className="py-3 px-4 hidden lg:table-cell">{u.phone}</td>
                    <td className="py-3 px-4">{u.policiesCount}</td>
                    <td className="py-3 px-4">{u.claimsCount}</td>
                    <td className="py-3 px-4">
                      <Badge variant={u.status === "Active" ? "success" : "destructive"}>{u.status}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setViewUser(u)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => toggleStatus(u.id)}>
                          {u.status === "Active" ? <UserX className="h-4 w-4 text-destructive" /> : <UserCheck className="h-4 w-4 text-emerald-600" />}
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

      <Dialog open={!!viewUser} onOpenChange={() => setViewUser(null)}>
        <DialogHeader>
          <DialogTitle>User Profile — {viewUser?.name}</DialogTitle>
        </DialogHeader>
        {viewUser && (
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-2 p-3 border rounded-lg">
              <div><span className="text-muted-foreground">Name:</span> {viewUser.name}</div>
              <div><span className="text-muted-foreground">Email:</span> {viewUser.email}</div>
              <div><span className="text-muted-foreground">Phone:</span> {viewUser.phone}</div>
              <div><span className="text-muted-foreground">Role:</span> {viewUser.role}</div>
              <div><span className="text-muted-foreground">Status:</span> {viewUser.status}</div>
              <div><span className="text-muted-foreground">Joined:</span> {viewUser.joinedDate}</div>
              <div><span className="text-muted-foreground">Policies:</span> {viewUser.policiesCount}</div>
              <div><span className="text-muted-foreground">Claims:</span> {viewUser.claimsCount}</div>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => setViewUser(null)}>Close</Button>
        </DialogFooter>
      </Dialog>
    </motion.div>
  );
}
