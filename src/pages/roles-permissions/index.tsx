import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  Shield,
  ShieldCheck,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Key,
} from "lucide-react";

import makeApiRequest from "@/services/axios";
import { apiUrl } from "@/services/api-end-point";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Permission {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
}

interface Role {
  id: number;
  name: string;
  guard_name: string;
  permissions: Permission[];
  created_at: string;
  updated_at: string;
}

interface PermissionsApiResponse {
  status: string;
  data: Permission[];
}

interface RolesApiResponse {
  status: string;
  data: Role[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function permissionLabel(name: string) {
  return name.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const PERMISSION_COLOR: Record<string, string> = {
  "manage-users": "bg-blue-100 text-blue-800",
  "manage-roles": "bg-purple-100 text-purple-800",
  "manage-properties": "bg-green-100 text-green-800",
  "approve-properties": "bg-emerald-100 text-emerald-800",
  "view-financials": "bg-yellow-100 text-yellow-800",
  "manage-blog": "bg-orange-100 text-orange-800",
  "manage-seo": "bg-pink-100 text-pink-800",
  "manage-bookings": "bg-cyan-100 text-cyan-800",
  "host-access": "bg-indigo-100 text-indigo-800",
  "agency-access": "bg-rose-100 text-rose-800",
};

function PermBadge({ name }: { name: string }) {
  const cls = PERMISSION_COLOR[name] ?? "bg-gray-100 text-gray-700";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {permissionLabel(name)}
    </span>
  );
}

// ─── Role Form ─────────────────────────────────────────────────────────────────
function RoleForm({
  name,
  setName,
  selectedPerms,
  setSelectedPerms,
  allPermissions,
  loadingPerms,
}: {
  name: string;
  setName: (v: string) => void;
  selectedPerms: number[];
  setSelectedPerms: (v: number[]) => void;
  allPermissions: Permission[];
  loadingPerms: boolean;
}) {
  const toggle = (id: number) =>
    setSelectedPerms(
      selectedPerms.includes(id)
        ? selectedPerms.filter((p) => p !== id)
        : [...selectedPerms, id]
    );

  const allSelected = allPermissions.length > 0 && selectedPerms.length === allPermissions.length;
  const toggleAll = () =>
    setSelectedPerms(allSelected ? [] : allPermissions.map((p) => p.id));

  return (
    <div className="space-y-4 py-2">
      <div className="space-y-1.5">
        <Label>Role Name</Label>
        <Input
          placeholder="e.g. editor, moderator"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>Permissions</Label>
          {!loadingPerms && allPermissions.length > 0 && (
            <button
              type="button"
              onClick={toggleAll}
              className="text-xs text-primary hover:underline"
            >
              {allSelected ? "Deselect all" : "Select all"}
            </button>
          )}
        </div>

        {loadingPerms ? (
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-9 rounded-md" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
            {allPermissions.map((perm) => {
              const checked = selectedPerms.includes(perm.id);
              return (
                <label
                  key={perm.id}
                  className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 cursor-pointer transition-colors text-sm ${
                    checked
                      ? "border-primary bg-primary/5 text-primary font-medium"
                      : "border-muted hover:border-primary/40 hover:bg-muted/40"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="accent-primary w-3.5 h-3.5 shrink-0"
                    checked={checked}
                    onChange={() => toggle(perm.id)}
                  />
                  {permissionLabel(perm.name)}
                </label>
              );
            })}
          </div>
        )}
        {selectedPerms.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {selectedPerms.length} permission{selectedPerms.length > 1 ? "s" : ""} selected
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RolesPermissions() {
  const queryClient = useQueryClient();

  // ── Active tab
  const [activeTab, setActiveTab] = useState<"roles" | "permissions">("roles");

  // ── Add Permission modal
  const [addPermOpen, setAddPermOpen] = useState(false);
  const [addPermName, setAddPermName] = useState("");

  // ── Delete Permission modal
  const [deletePermOpen, setDeletePermOpen] = useState(false);
  const [deletingPerm, setDeletingPerm] = useState<Permission | null>(null);

  // ── Add Role modal
  const [addOpen, setAddOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [addPerms, setAddPerms] = useState<number[]>([]);

  // ── Edit Role modal
  const [editOpen, setEditOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [editName, setEditName] = useState("");
  const [editPerms, setEditPerms] = useState<number[]>([]);

  // ── Delete modal
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);

  // ── Assign Permissions modal
  const [permModalOpen, setPermModalOpen] = useState(false);
  const [permRole, setPermRole] = useState<Role | null>(null);
  const [permSelected, setPermSelected] = useState<string[]>([]);

  // ── Fetch permissions
  const { data: permsData, isLoading: loadingPerms } = useQuery({
    queryKey: ["permissions"],
    queryFn: () => makeApiRequest<PermissionsApiResponse>(apiUrl.getAllPermissions),
  });
  const allPermissions = permsData?.data ?? [];

  // ── Fetch roles
  const { data: rolesData, isLoading: loadingRoles } = useQuery({
    queryKey: ["roles"],
    queryFn: () => makeApiRequest<RolesApiResponse>(apiUrl.getAllRoles),
  });
  const roles = rolesData?.data ?? [];

  // ── Assign permissions to role
  const { mutate: assignPermissions, isPending: isAssigning } = useMutation({
    mutationFn: (payload: { permissions: string[] }) =>
      makeApiRequest(`${apiUrl.assignRolePermissions}/${permRole?.id}/permissions`, {
        method: "POST",
        data: payload,
      }),
    onSuccess: () => {
      toast.success("Permissions updated successfully");
      setPermModalOpen(false);
      setPermRole(null);
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: () => toast.error("Failed to update permissions"),
  });

  const handlePermOpen = (role: Role) => {
    setPermRole(role);
    setPermSelected(role.permissions.map((p) => p.name));
    setPermModalOpen(true);
  };

  const togglePerm = (name: string) =>
    setPermSelected((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );

  const allPermsSelected = allPermissions.length > 0 && permSelected.length === allPermissions.length;

  // ── Create permission
  const { mutate: createPermission, isPending: isCreatingPerm } = useMutation({
    mutationFn: (payload: { name: string }) =>
      makeApiRequest(apiUrl.createPermission, { method: "POST", data: payload }),
    onSuccess: () => {
      toast.success("Permission created successfully");
      setAddPermOpen(false);
      setAddPermName("");
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
    },
    onError: () => toast.error("Failed to create permission"),
  });

  // ── Delete permission
  const { mutate: deletePermission, isPending: isDeletingPerm } = useMutation({
    mutationFn: () =>
      makeApiRequest(`${apiUrl.deletePermission}/${deletingPerm?.id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      toast.success("Permission deleted successfully");
      setDeletePermOpen(false);
      setDeletingPerm(null);
      queryClient.invalidateQueries({ queryKey: ["permissions"] });
    },
    onError: () => toast.error("Failed to delete permission"),
  });

  // ── Create role
  const { mutate: createRole, isPending: isCreating } = useMutation({
    mutationFn: (payload: { name: string; permissions: number[] }) =>
      makeApiRequest(apiUrl.createRole, { method: "POST", data: payload }),
    onSuccess: () => {
      toast.success("Role created successfully");
      setAddOpen(false);
      setAddName("");
      setAddPerms([]);
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: () => toast.error("Failed to create role"),
  });

  // ── Update role
  const { mutate: updateRole, isPending: isUpdating } = useMutation({
    mutationFn: (payload: { name: string; permissions: number[] }) =>
      makeApiRequest(`${apiUrl.updateRole}/${editingRole?.id}`, {
        method: "PUT",
        data: payload,
      }),
    onSuccess: () => {
      toast.success("Role updated successfully");
      setEditOpen(false);
      setEditingRole(null);
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: () => toast.error("Failed to update role"),
  });

  // ── Delete role
  const { mutate: deleteRole, isPending: isDeleting } = useMutation({
    mutationFn: () =>
      makeApiRequest(`${apiUrl.deleteRole}/${deletingRole?.id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      toast.success("Role deleted successfully");
      setDeleteOpen(false);
      setDeletingRole(null);
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
    onError: () => toast.error("Failed to delete role"),
  });

  const handleAddSubmit = () => {
    if (!addName.trim()) { toast.error("Role name is required"); return; }
    createRole({ name: addName.trim(), permissions: addPerms });
  };

  const handleEditOpen = (role: Role) => {
    setEditingRole(role);
    setEditName(role.name);
    setEditPerms(role.permissions.map((p) => p.id));
    setEditOpen(true);
  };

  const handleEditSubmit = () => {
    if (!editName.trim()) { toast.error("Role name is required"); return; }
    updateRole({ name: editName.trim(), permissions: editPerms });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            Roles & Permissions
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage roles and their access permissions
          </p>
        </div>
        {activeTab === "roles" && (
          <Button
            size="sm"
            onClick={() => { setAddName(""); setAddPerms([]); setAddOpen(true); }}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Role
          </Button>
        )}
        {activeTab === "permissions" && (
          <Button
            size="sm"
            onClick={() => { setAddPermName(""); setAddPermOpen(true); }}
          >
            <Plus className="h-4 w-4 mr-1" /> Add Permission
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {(["roles", "permissions"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors -mb-px ${
              activeTab === tab
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "roles" ? (
              <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Roles</span>
            ) : (
              <span className="flex items-center gap-1.5"><Key className="w-3.5 h-3.5" /> Permissions</span>
            )}
          </button>
        ))}
      </div>

      {/* ── ROLES TAB ─────────────────────────────────────────────────────────── */}
      {activeTab === "roles" && (
        <div className="space-y-3">
          {loadingRoles ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))
          ) : roles.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
                <Shield className="h-10 w-10" />
                <p className="text-sm">No roles found. Create the first one.</p>
              </CardContent>
            </Card>
          ) : (
            roles.map((role) => (
              <Card key={role.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="flex items-start justify-between gap-4 py-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                      <span className="font-semibold text-sm capitalize">
                        {role.name.replace(/-/g, " ")}
                      </span>
                      <Badge variant="outline" className="text-xs ml-1">
                        {role.permissions.length} permission{role.permissions.length !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {role.permissions.length === 0 ? (
                        <span className="text-xs text-muted-foreground italic">No permissions assigned</span>
                      ) : (
                        role.permissions.map((p) => (
                          <PermBadge key={p.id} name={p.name} />
                        ))
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-primary hover:text-primary hover:bg-primary/10"
                      title="Assign Permissions"
                      onClick={() => handlePermOpen(role)}
                    >
                      <Key className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleEditOpen(role)}
                    >
                      <Pencil className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => { setDeletingRole(role); setDeleteOpen(true); }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* ── PERMISSIONS TAB ───────────────────────────────────────────────────── */}
      {activeTab === "permissions" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Key className="h-4 w-4" /> All System Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingPerms ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {Array.from({ length: 10 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {allPermissions.map((perm) => (
                  <div
                    key={perm.id}
                    className="rounded-xl border p-3 flex flex-col gap-1 bg-muted/30 group relative"
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Key className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <PermBadge name={perm.name} />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
                        onClick={() => { setDeletingPerm(perm); setDeletePermOpen(true); }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground pl-5">
                      ID: {perm.id} · {perm.guard_name}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Assign Permissions Modal ───────────────────────────────────────── */}
      <Dialog open={permModalOpen} onOpenChange={(o) => { if (!o) { setPermModalOpen(false); setPermRole(null); } }}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              Assign Permissions —{" "}
              <span className="capitalize font-semibold text-primary">
                {permRole?.name.replace(/-/g, " ")}
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Select permissions to assign to this role
              </p>
              {allPermissions.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    setPermSelected(
                      allPermsSelected ? [] : allPermissions.map((p) => p.name)
                    )
                  }
                  className="text-xs text-primary hover:underline"
                >
                  {allPermsSelected ? "Deselect all" : "Select all"}
                </button>
              )}
            </div>

            {loadingPerms ? (
              <div className="grid grid-cols-2 gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-9 rounded-md" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                {allPermissions.map((perm) => {
                  const checked = permSelected.includes(perm.name);
                  return (
                    <label
                      key={perm.id}
                      className={`flex items-center gap-2.5 rounded-lg border px-3 py-2 cursor-pointer transition-colors text-sm ${
                        checked
                          ? "border-primary bg-primary/5 text-primary font-medium"
                          : "border-muted hover:border-primary/40 hover:bg-muted/40"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="accent-primary w-3.5 h-3.5 shrink-0"
                        checked={checked}
                        onChange={() => togglePerm(perm.name)}
                      />
                      {permissionLabel(perm.name)}
                    </label>
                  );
                })}
              </div>
            )}

            {permSelected.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {permSelected.length} permission{permSelected.length > 1 ? "s" : ""} selected
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setPermModalOpen(false); setPermRole(null); }}
              disabled={isAssigning}
            >
              Cancel
            </Button>
            <Button
              onClick={() => assignPermissions({ permissions: permSelected })}
              disabled={isAssigning}
            >
              {isAssigning ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</>
              ) : (
                "Save Permissions"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add Permission Modal ───────────────────────────────────────────── */}
      <Dialog open={addPermOpen} onOpenChange={(o) => { if (!o) setAddPermOpen(false); }}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Key className="h-4 w-4" /> Add Permission
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5 py-2">
            <Label>Permission Name</Label>
            <Input
              placeholder="e.g. manage-reports"
              value={addPermName}
              onChange={(e) => setAddPermName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (!addPermName.trim()) { toast.error("Permission name is required"); return; }
                  createPermission({ name: addPermName.trim() });
                }
              }}
            />
            <p className="text-xs text-muted-foreground">Use kebab-case, e.g. manage-reports</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddPermOpen(false)} disabled={isCreatingPerm}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!addPermName.trim()) { toast.error("Permission name is required"); return; }
                createPermission({ name: addPermName.trim() });
              }}
              disabled={isCreatingPerm}
            >
              {isCreatingPerm ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating...</> : "Create Permission"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Permission Modal ─────────────────────────────────────────── */}
      <Dialog open={deletePermOpen} onOpenChange={(o) => { if (!o) { setDeletePermOpen(false); setDeletingPerm(null); } }}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Permission</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground">
              {deletingPerm?.name}
            </span>
            ? This may affect roles that use this permission.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDeletePermOpen(false); setDeletingPerm(null); }} disabled={isDeletingPerm}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => deletePermission()} disabled={isDeletingPerm}>
              {isDeletingPerm ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Deleting...</> : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add Role Modal ─────────────────────────────────────────────────── */}
      <Dialog open={addOpen} onOpenChange={(o) => { if (!o) setAddOpen(false); }}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-4 w-4" /> Add Role
            </DialogTitle>
          </DialogHeader>
          <RoleForm
            name={addName}
            setName={setAddName}
            selectedPerms={addPerms}
            setSelectedPerms={setAddPerms}
            allPermissions={allPermissions}
            loadingPerms={loadingPerms}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)} disabled={isCreating}>
              Cancel
            </Button>
            <Button onClick={handleAddSubmit} disabled={isCreating}>
              {isCreating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating...</> : "Create Role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Role Modal ─────────────────────────────────────────────────── */}
      <Dialog open={editOpen} onOpenChange={(o) => { if (!o) { setEditOpen(false); setEditingRole(null); } }}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-4 w-4" /> Edit Role
            </DialogTitle>
          </DialogHeader>
          <RoleForm
            name={editName}
            setName={setEditName}
            selectedPerms={editPerms}
            setSelectedPerms={setEditPerms}
            allPermissions={allPermissions}
            loadingPerms={loadingPerms}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditOpen(false); setEditingRole(null); }} disabled={isUpdating}>
              Cancel
            </Button>
            <Button onClick={handleEditSubmit} disabled={isUpdating}>
              {isUpdating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</> : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm Modal ────────────────────────────────────────────── */}
      <Dialog open={deleteOpen} onOpenChange={(o) => { if (!o) { setDeleteOpen(false); setDeletingRole(null); } }}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Role</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-foreground capitalize">
              {deletingRole?.name.replace(/-/g, " ")}
            </span>
            ? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDeleteOpen(false); setDeletingRole(null); }} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => deleteRole()} disabled={isDeleting}>
              {isDeleting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Deleting...</> : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
