import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomPagination } from "@/components/custom-pagination";
import { DataTable, Column } from "@/components/data-table";
import makeApiRequest from "@/services/axios";
import { formatDate } from "@/utils/utils";
import { apiUrl } from "@/services/api-end-point";
import { Modal } from "@/components/ui/modal";
import { Switch } from "@/components/ui/switch";
import toast from "react-hot-toast";
import { ChevronDown, Eye, MoreHorizontal, Pencil, Shield, Trash2, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  user_type: string;
  status: string;
  country: string | null;
  email_verified_at: string | null;
  last_login_at: string | null;
  created_at: string;
  role_id: number | null;
  role_name: string | null;
}

interface Role {
  id: number;
  name: string;
  guard_name: string;
}

interface RolesApiResponse {
  status: string;
  data: Role[];
}

interface UserDetail {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  user_type: string;
  status: string;
  country: string | null;
  city: string | null;
  email_verified_at: string | null;
  last_login_at: string | null;
  created_at: string;
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  total: number;
  from: number;
  to: number;
  per_page: number;
}

interface UsersApiResponse {
  success: boolean;
  data: { data: User[] } & PaginationMeta;
}

interface UserDetailApiResponse {
  success: boolean;
  data: UserDetail;
}

interface UpdateUserPayload {
  first_name: string;
  last_name: string;
  phone: string;
  country: string;
  city: string;
}

// ─── Constants ─────────────────────────────────────────────────────────────────
const USER_TYPES = ["All", "customer", "host", "agency", "admin"];
const USER_STATUSES = ["All", "active", "inactive", "suspended", "pending"];
const PER_PAGE_OPTIONS = ["10", "20", "50", "100"];

const userTypeConfig: Record<string, string> = {
  customer: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  host: "bg-purple-100 text-purple-800 hover:bg-purple-100",
  agency: "bg-orange-100 text-orange-800 hover:bg-orange-100",
  admin: "bg-gray-100 text-gray-800 hover:bg-gray-100",
};

const statusConfig: Record<string, string> = {
  active: "bg-green-100 text-green-800 hover:bg-green-100",
  inactive: "bg-red-100 text-red-800 hover:bg-red-100",
  suspended: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  pending: "bg-sky-100 text-sky-800 hover:bg-sky-100",
};

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ─── Column definitions ────────────────────────────────────────────────────────
const buildColumns = (
  onView: (id: number) => void,
  onEdit: (id: number) => void,
  onDelete: (id: number) => void,
  onToggle: (user: User) => void,
  onChangeRole: (user: User) => void,
): Column<User>[] => [
  {
    header: "User",
    render: (u) => (
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-semibold text-muted-foreground">
            {u.first_name.charAt(0).toUpperCase()}
            {u.last_name.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <div className="font-medium text-sm">
            {u.first_name} {u.last_name}
          </div>
          <div className="text-xs text-muted-foreground">{u.email}</div>
        </div>
      </div>
    ),
  },
  {
    header: "Phone",
    render: (u) => (
      <span className="text-sm text-muted-foreground">{u.phone ?? "—"}</span>
    ),
  },
  {
    header: "Country",
    render: (u) => (
      <span className="text-sm text-muted-foreground">{u.country ?? "—"}</span>
    ),
  },
  {
    header: "User Type",
    render: (u) => (
      <Badge className={userTypeConfig[u.user_type] ?? "bg-gray-100 text-gray-800 hover:bg-gray-100"}>
        {capitalize(u.user_type)}
      </Badge>
    ),
  },
  {
    header: "Role",
    render: (u) =>
      u.role_name ? (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
          <Shield className="h-3 w-3" />
          {u.role_name.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
        </span>
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
      ),
  },
  {
    header: "Status",
    render: (u) => (
      <Badge className={statusConfig[u.status] ?? "bg-gray-100 text-gray-800 hover:bg-gray-100"}>
        {capitalize(u.status)}
      </Badge>
    ),
  },
  {
    header: "Email Verified",
    render: (u) =>
      u.email_verified_at ? (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Verified</Badge>
      ) : (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Unverified</Badge>
      ),
  },
  {
    header: "Last Login",
    render: (u) => (
      <span className="text-sm text-muted-foreground whitespace-nowrap">
        {u.last_login_at ? formatDate(u.last_login_at) : "—"}
      </span>
    ),
  },
  {
    header: "Joined",
    render: (u) => (
      <span className="text-sm text-muted-foreground whitespace-nowrap">
        {formatDate(u.created_at)}
      </span>
    ),
  },
  {
    header: "Active",
    render: (u) => (
      <Switch
        checked={u.status === "active"}
        onCheckedChange={() => onToggle(u)}
      />
    ),
  },
  {
    header: "Actions",
    className: "text-right",
    render: (u) => (
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(u.id)} className="gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(u.id)} className="gap-2">
              <Pencil className="h-4 w-4 text-muted-foreground" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onChangeRole(u)} className="gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              Change Role
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(u.id)}
              className="gap-2 text-destructive focus:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
];
// ──────────────────────────────────────────────────────────────────────────────

// ─── Edit Form ─────────────────────────────────────────────────────────────────
function EditUserForm({
  form,
  onChange,
}: {
  form: UpdateUserPayload;
  onChange: (field: keyof UpdateUserPayload, value: string) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">First Name</label>
          <Input
            value={form.first_name}
            onChange={(e) => onChange("first_name", e.target.value)}
            placeholder="First name"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Last Name</label>
          <Input
            value={form.last_name}
            onChange={(e) => onChange("last_name", e.target.value)}
            placeholder="Last name"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-gray-700">Phone</label>
        <Input
          value={form.phone}
          onChange={(e) => onChange("phone", e.target.value)}
          placeholder="Phone number"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">Country</label>
          <Input
            value={form.country}
            onChange={(e) => onChange("country", e.target.value)}
            placeholder="Country"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-gray-700">City</label>
          <Input
            value={form.city}
            onChange={(e) => onChange("city", e.target.value)}
            placeholder="City"
          />
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
function GetAllUsers() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // ── List filters
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [perPage, setPerPage] = useState("20");
  const [page, setPage] = useState(1);

  // ── Modal state
  const [editId, setEditId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [toggleUser, setToggleUser] = useState<User | null>(null);
  const [roleUser, setRoleUser] = useState<User | null>(null);
  const [selectedRoleName, setSelectedRoleName] = useState<string>("");

  // ── Edit form state
  const [editForm, setEditForm] = useState<UpdateUserPayload>({
    first_name: "",
    last_name: "",
    phone: "",
    country: "",
    city: "",
  });

  const listQueryKey = [
    "users",
    { page, perPage, userTypeFilter, statusFilter, search: appliedSearch },
  ] as const;

  // ── Fetch list
  const { data, isFetching } = useQuery({
    queryKey: listQueryKey,
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), per_page: perPage });
      if (userTypeFilter !== "All") params.append("user_type", userTypeFilter);
      if (statusFilter !== "All") params.append("status", statusFilter);
      if (appliedSearch.trim()) params.append("search", appliedSearch.trim());
      return makeApiRequest<UsersApiResponse>(`${apiUrl.getAllUsers}?${params.toString()}`);
    },
  });

  const users: User[] = data?.data?.data ?? [];
  const meta: PaginationMeta = {
    current_page: data?.data?.current_page ?? 1,
    last_page: data?.data?.last_page ?? 1,
    total: data?.data?.total ?? 0,
    from: data?.data?.from ?? 0,
    to: data?.data?.to ?? 0,
    per_page: data?.data?.per_page ?? 20,
  };

  // ── Fetch user detail for edit autofill
  const { data: detailData, isFetching: isFetchingDetail } = useQuery({
    queryKey: ["user-detail", editId],
    queryFn: () =>
      makeApiRequest<UserDetailApiResponse>(`${apiUrl.getUserById}/${editId}`),
    enabled: editId !== null,
  });

  const userDetail = detailData?.data ?? null;

  // ── Autofill edit form when detail loads
  useEffect(() => {
    if (editId !== null && userDetail) {
      setEditForm({
        first_name: userDetail.first_name ?? "",
        last_name: userDetail.last_name ?? "",
        phone: userDetail.phone ?? "",
        country: userDetail.country ?? "",
        city: userDetail.city ?? "",
      });
    }
  }, [editId, userDetail]);

  // ── Update mutation
  const { mutate: updateUser, isPending: isUpdating } = useMutation({
    mutationFn: (payload: UpdateUserPayload) =>
      makeApiRequest(`${apiUrl.updateUser}/${editId}`, {
        method: "PUT",
        data: payload,
      }),
    onSuccess: () => {
      toast.success("User updated successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user-detail", editId] });
      setEditId(null);
    },
    onError: () => {
      toast.error("Failed to update user");
    },
  });

  // ── Toggle status mutation
  const newStatus = toggleUser?.status === "active" ? "inactive" : "active";
  const { mutate: doToggleStatus, isPending: isToggling } = useMutation({
    mutationFn: () =>
      makeApiRequest(`${apiUrl.toggleUserStatus}/${toggleUser?.id}/status`, {
        method: "PUT",
        data: { status: newStatus },
      }),
    onSuccess: () => {
      toast.success(`User ${newStatus === "active" ? "activated" : "deactivated"} successfully`);
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setToggleUser(null);
    },
    onError: () => {
      toast.error("Failed to update status");
      setToggleUser(null);
    },
  });

  // ── Delete mutation
  const { mutate: deleteUser, isPending: isDeleting } = useMutation({
    mutationFn: () =>
      makeApiRequest(`${apiUrl.deleteUser}/${deleteId}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("User deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setDeleteId(null);
    },
    onError: () => {
      toast.error("Failed to delete user");
    },
  });

  // ── Fetch all roles (for Change Role modal)
  const { data: rolesData, isFetching: isFetchingRoles } = useQuery({
    queryKey: ["roles"],
    queryFn: () => makeApiRequest<RolesApiResponse>(apiUrl.getAllRoles),
    enabled: roleUser !== null,
  });
  const allRoles: Role[] = rolesData?.data ?? [];

  // ── Change role mutation
  const { mutate: doChangeRole, isPending: isChangingRole } = useMutation({
    mutationFn: () =>
      makeApiRequest(`${apiUrl.changeUserRole}/${roleUser?.id}/role`, {
        method: "PUT",
        data: { user_type: selectedRoleName },
      }),
    onSuccess: () => {
      toast.success("Role updated successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setRoleUser(null);
      setSelectedRoleName("");
    },
    onError: () => toast.error("Failed to update role"),
  });

  const handleChangeRoleOpen = (user: User) => {
    setRoleUser(user);
    setSelectedRoleName(user.role_name ?? "");
  };

  const handleFormChange = (field: keyof UpdateUserPayload, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    setAppliedSearch(search);
    setPage(1);
  };

  const handleUserTypeChange = (val: string) => { setUserTypeFilter(val); setPage(1); };
  const handleStatusFilterChange = (val: string) => { setStatusFilter(val); setPage(1); };
  const handlePerPageChange = (val: string) => { setPerPage(val); setPage(1); };

  return (
    <>
      {/* ── Edit Modal ──────────────────────────────────────────────────────── */}
      <Modal
        isOpen={editId !== null}
        onClose={() => setEditId(null)}
        title="Edit User"
        width="max-w-md"
        footerBtnText="Save Changes"
        loading={isUpdating || isFetchingDetail}
        onConfirm={() => updateUser(editForm)}
      >
        {isFetchingDetail ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <EditUserForm form={editForm} onChange={handleFormChange} />
        )}
      </Modal>

      {/* ── Toggle Status Modal ──────────────────────────────────────────────── */}
      <Modal
        isOpen={toggleUser !== null}
        onClose={() => setToggleUser(null)}
        title={toggleUser?.status === "active" ? "Deactivate User" : "Activate User"}
        width="max-w-md"
        footerBtnText={toggleUser?.status === "active" ? "Yes, Deactivate" : "Yes, Activate"}
        loading={isToggling}
        onConfirm={() => doToggleStatus()}
      >
        {toggleUser && (
          <div className="space-y-4">
            <div className={`flex items-center gap-3 rounded-lg p-3 ${toggleUser.status === "active" ? "bg-red-50 border border-red-200" : "bg-green-50 border border-green-200"}`}>
              <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${toggleUser.status === "active" ? "bg-red-500" : "bg-green-500"}`} />
              <p className={`text-sm font-medium ${toggleUser.status === "active" ? "text-red-800" : "text-green-800"}`}>
                {toggleUser.status === "active"
                  ? `"${toggleUser.first_name} ${toggleUser.last_name}" will be deactivated`
                  : `"${toggleUser.first_name} ${toggleUser.last_name}" will be activated`}
              </p>
            </div>

            <div className="rounded-lg border bg-muted/40 p-4 space-y-2.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">User Details</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium">{toggleUser.email}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">User Type</span>
                <span className="font-medium capitalize">{toggleUser.user_type}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Current Status</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${toggleUser.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {capitalize(toggleUser.status)}
                </span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              {toggleUser.status === "active"
                ? "Deactivating this user will prevent them from logging in. You can re-activate them at any time."
                : "Activating this user will restore their access to the platform."}
            </p>
          </div>
        )}
      </Modal>

      {/* ── Delete Modal ─────────────────────────────────────────────────────── */}
      <Modal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        title="Delete User"
        width="max-w-md"
        footerBtnText="Delete"
        loading={isDeleting}
        onConfirm={() => deleteUser()}
      >
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-lg p-3 bg-red-50 border border-red-200">
            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-red-500" />
            <p className="text-sm font-medium text-red-800">
              This action cannot be undone
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this user? All associated data will be permanently removed.
          </p>
        </div>
      </Modal>

      {/* ── Change Role Modal ────────────────────────────────────────────────── */}
      <Modal
        isOpen={roleUser !== null}
        onClose={() => { setRoleUser(null); setSelectedRoleName(""); }}
        title="Change Role"
        width="max-w-md"
        footerBtnText="Save Role"
        loading={isChangingRole || isFetchingRoles}
        onConfirm={() => {
          if (!selectedRoleName) { toast.error("Please select a role"); return; }
          doChangeRole();
        }}
      >
        {roleUser && (
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/40 p-3 flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-semibold text-muted-foreground">
                  {roleUser.first_name.charAt(0).toUpperCase()}{roleUser.last_name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium">{roleUser.first_name} {roleUser.last_name}</p>
                <p className="text-xs text-muted-foreground">{roleUser.email}</p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Select Role</p>
              {isFetchingRoles ? (
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {allRoles.map((role) => {
                    const checked = selectedRoleName === role.name;
                    return (
                      <label
                        key={role.id}
                        className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors ${
                          checked
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-muted hover:border-primary/40 hover:bg-muted/40"
                        }`}
                      >
                        <input
                          type="radio"
                          name="role"
                          className="accent-primary w-3.5 h-3.5 shrink-0"
                          checked={checked}
                          onChange={() => setSelectedRoleName(role.name)}
                        />
                        <div>
                          <p className="text-sm font-medium capitalize">
                            {role.name.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                          </p>
                        </div>
                        {roleUser.role_name === role.name && (
                          <span className="ml-auto text-[10px] font-semibold bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                            Current
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* ── Main Content ─────────────────────────────────────────────────────── */}
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Users</h1>
            <p className="text-muted-foreground">Manage all registered users</p>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-5 w-5" />
            <span className="text-sm font-medium">{meta.total} total</span>
          </div>
        </div>

        {/* Table Card */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>User Management</CardTitle>
                {meta.total > 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Showing {meta.from} to {meta.to} of {meta.total} users
                  </p>
                )}
              </div>

              <Select value={perPage} onValueChange={handlePerPageChange}>
                <SelectTrigger className="w-[110px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PER_PAGE_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      Show: {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 pt-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Search by name or email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-64"
                />
                <Button variant="outline" onClick={handleSearch} disabled={isFetching}>
                  Search
                </Button>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    {userTypeFilter === "All" ? "All Types" : capitalize(userTypeFilter)}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {USER_TYPES.map((t) => (
                    <DropdownMenuItem key={t} onClick={() => handleUserTypeChange(t)}>
                      {t === "All" ? "All Types" : capitalize(t)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    {statusFilter === "All" ? "All Status" : capitalize(statusFilter)}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {USER_STATUSES.map((s) => (
                    <DropdownMenuItem key={s} onClick={() => handleStatusFilterChange(s)}>
                      {s === "All" ? "All Status" : capitalize(s)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>

          <CardContent>
            <DataTable
              columns={buildColumns(
                (id) => navigate(`/get-all-users/${id}`),
                (id) => setEditId(id),
                (id) => setDeleteId(id),
                (user) => setToggleUser(user),
                (user) => handleChangeRoleOpen(user),
              )}
              data={users}
              loading={isFetching}
              rowKey={(u) => u.id}
              emptyMessage="No users found."
            />

            {meta.last_page > 1 && (
              <div className="mt-6">
                <CustomPagination
                  currentPage={meta.current_page}
                  lastPage={meta.last_page}
                  onPageChange={setPage}
                  total={meta.total}
                  from={meta.from}
                  to={meta.to}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default GetAllUsers;
