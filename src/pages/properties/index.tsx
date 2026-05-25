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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { CustomPagination } from "@/components/custom-pagination";
import { DataTable, Column } from "@/components/data-table";
import makeApiRequest from "@/services/axios";
import { formatDate } from "@/utils/utils";
import { apiUrl } from "@/services/api-end-point";
import { Switch } from "@/components/ui/switch";
import {
  Building2,
  CheckCircle,
  ChevronDown,
  Clock,
  Eye,
  MapPin,
  MoreHorizontal,
  Plus,
  RefreshCw,
  Trash2,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface PendingProperty {
  id: number;
  name: string;
  description: string | null;
  property_type: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  address: string | null;
  postal_code: string | null;
  featured_image: string | null;
  images: string[];
  provider: string;
  provider_property_id: string;
  price_from: number | null;
  price_currency: string;
  amenities: string[];
  created_at: string;
}

interface Property {
  id: number;
  provider: string;
  provider_property_id: string;
  name: string;
  description: string | null;
  property_type: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  address: string | null;
  postal_code: string | null;
  images: string[];
  featured_image: string | null;
  amenities: string[];
  price_from: number | null;
  price_currency: string;
  is_active: boolean;
  is_featured: boolean;
  view_count: number;
  booking_count: number;
  rating_average: number | null;
  rating_count: number;
  last_synced_at: string | null;
  created_at: string;
  api_data: {
    propertyUrl?: string;
  };
}

interface PropertyFee {
  id: number;
  fee_type: string;
  fee_name: string;
  amount: number;
  amount_type: string;
  applies_to: string;
  is_mandatory: boolean;
  is_taxable: boolean;
  is_active: boolean;
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  total: number;
  from: number;
  to: number;
  per_page: number;
}

interface PropertiesApiResponse {
  success: boolean;
  data: { data: Property[] } & PaginationMeta;
}

const PROVIDERS = ["All", "ownerrez", "lodgify", "hostaway", "guesty"];
const PER_PAGE_OPTIONS = ["10", "20", "50", "100"];

// ─── Column definitions ────────────────────────────────────────────────────────
const buildColumns = (
  onToggleStatus: (id: number, newStatus: boolean) => void,
  togglingId: number | null,
  onViewDetails: (id: number) => void,
  onAddPricing: (id: number) => void,
  onDeletePricing: (id: number) => void,
): Column<Property>[] => [
  {
    header: "Property",
    render: (p) => (
      <div className="flex items-center gap-3">
        {p.featured_image ? (
          <img
            src={p.featured_image}
            alt={p.name}
            className="h-10 w-14 rounded object-cover flex-shrink-0"
            onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
          />
        ) : (
          <div className="h-10 w-14 rounded bg-muted flex items-center justify-center flex-shrink-0">
            <Building2 className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
        <div>
          <div className="font-medium text-sm">{p.name}</div>
          <div className="text-xs text-muted-foreground">{p.provider_property_id}</div>
        </div>
      </div>
    ),
  },
  {
    header: "Type",
    render: (p) => (
      <span className="text-sm capitalize">
        {p.property_type
          ? p.property_type.charAt(0).toUpperCase() + p.property_type.slice(1).replace(/_/g, " ")
          : "N/A"}
      </span>
    ),
  },
  {
    header: "Location",
    render: (p) => {
      const location = [p.city, p.state, p.country].filter(Boolean).join(", ") || "N/A";
      return (
        <div>
          <div className="flex items-center gap-1 text-sm">
            <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            <span>{location}</span>
          </div>
          {p.postal_code && (
            <div className="text-xs text-muted-foreground mt-0.5 ml-5">{p.postal_code}</div>
          )}
        </div>
      );
    },
  },
  {
    header: "Status",
    render: (p) => (
      <Badge
        className={
          p.is_active
            ? "bg-green-100 text-green-800 hover:bg-green-100"
            : "bg-red-100 text-red-800 hover:bg-red-100"
        }
      >
        {p.is_active ? "active" : "inactive"}
      </Badge>
    ),
  },
  {
    header: "Featured",
    render: (p) =>
      p.is_featured ? (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Featured</Badge>
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
      ),
  },
  {
    header: "Pricing Fee",
    render: (p) => (
      <div className="flex justify-start">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onAddPricing(p.id)} className="gap-2">
              <Plus className="h-4 w-4 text-muted-foreground" />
              Add
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDeletePricing(p.id)}
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
  {
    header: "Active",
    render: (p) => (
      <Switch
        checked={p.is_active}
        disabled={togglingId === p.id}
        onCheckedChange={(checked) => onToggleStatus(p.id, checked)}
      />
    ),
  },
  {
    header: "Last Synced",
    render: (p) => (
      <span className="text-sm text-muted-foreground whitespace-nowrap">
        {formatDate(p.last_synced_at)}
      </span>
    ),
  },
  {
    header: "Actions",
    className: "text-right",
    render: (p) => (
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onViewDetails(p.id)} className="gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              View Details
            </DropdownMenuItem>
            {p.api_data?.propertyUrl && (
              <DropdownMenuItem
                onClick={() => window.open(p.api_data.propertyUrl, "_blank")}
                className="gap-2"
              >
                <Eye className="h-4 w-4 text-muted-foreground" />
                View on Provider
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
];
// ─── Pending Approval Columns ──────────────────────────────────────────────────
const buildPendingColumns = (
  onViewDetails: (p: PendingProperty) => void,
): Column<PendingProperty>[] => [
  {
    header: "Property",
    render: (p) => (
      <div className="flex items-center gap-3">
        {p.featured_image ? (
          <img
            src={p.featured_image}
            alt={p.name}
            className="h-10 w-14 rounded object-cover flex-shrink-0"
            onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
          />
        ) : (
          <div className="h-10 w-14 rounded bg-muted flex items-center justify-center flex-shrink-0">
            <Building2 className="h-5 w-5 text-muted-foreground" />
          </div>
        )}
        <div>
          <div className="font-medium text-sm">{p.name}</div>
          <div className="text-xs text-muted-foreground">{p.provider_property_id}</div>
        </div>
      </div>
    ),
  },
  {
    header: "Type",
    render: (p) => (
      <span className="text-sm capitalize">
        {p.property_type
          ? p.property_type.charAt(0).toUpperCase() + p.property_type.slice(1).replace(/_/g, " ")
          : "N/A"}
      </span>
    ),
  },
  {
    header: "Location",
    render: (p) => {
      const location = [p.city, p.state, p.country].filter(Boolean).join(", ") || "N/A";
      return (
        <div className="flex items-center gap-1 text-sm">
          <MapPin className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
          <span>{location}</span>
        </div>
      );
    },
  },
  {
    header: "Status",
    render: () => (
      <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 gap-1">
        <Clock className="h-3 w-3" />
        Pending
      </Badge>
    ),
  },
  {
    header: "Submitted",
    render: (p) => (
      <span className="text-sm text-muted-foreground whitespace-nowrap">
        {formatDate(p.created_at)}
      </span>
    ),
  },
  {
    header: "Actions",
    className: "text-right",
    render: (p) => (
      <div className="flex justify-end">
        <Button size="sm" variant="outline" onClick={() => onViewDetails(p)} className="gap-1">
          <Eye className="h-3.5 w-3.5" />
          View Details
        </Button>
      </div>
    ),
  },
];
// ──────────────────────────────────────────────────────────────────────────────

function PropertiesListing() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState<"all" | "pending">("all");

  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [provider, setProvider] = useState("ownerrez");
  const [statusFilter, setStatusFilter] = useState("All");
  const [perPage, setPerPage] = useState("20");
  const [page, setPage] = useState(1);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // ─── Pending approvals state ─────────────────────────────────────────────────
  const [pendingDetailsOpen, setPendingDetailsOpen] = useState(false);
  const [selectedPending, setSelectedPending] = useState<PendingProperty | null>(null);
  const [approveConfirmOpen, setApproveConfirmOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // ─── Add Pricing Modal state ─────────────────────────────────────────────────
  const [pricingModalOpen, setPricingModalOpen] = useState(false);
  const [pricingPropertyId, setPricingPropertyId] = useState<number | null>(null);
  const [pricingForm, setPricingForm] = useState({
    fee_type: "cleaning_fee",
    fee_name: "",
    amount: "",
    amount_type: "fixed",
    applies_to: "per_stay",
    is_mandatory: true,
    is_taxable: false,
    is_active: true,
  });

  // ─── Delete Pricing Modal state ──────────────────────────────────────────────
  const [deleteFeesModalOpen, setDeleteFeesModalOpen] = useState(false);
  const [deleteFeesPropertyId, setDeleteFeesPropertyId] = useState<number | null>(null);
  const [deletingFeeId, setDeletingFeeId] = useState<number | null>(null);

  const queryKey = [
    "properties",
    { page, perPage, provider, statusFilter, search: appliedSearch },
  ] as const;

  // ─── Sync properties mutation ────────────────────────────────────────────────
  const { mutate: syncProperties, isPending: isSyncing } = useMutation({
    mutationFn: () =>
      makeApiRequest(apiUrl.syncProperties, { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["properties"] });
    },
  });

  // ─── Fetch properties ────────────────────────────────────────────────────────
  const { data, isFetching } = useQuery({
    queryKey,
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), per_page: perPage });
      if (provider !== "All") params.append("provider", provider);
      if (appliedSearch.trim()) params.append("search", appliedSearch.trim());
      if (statusFilter !== "All")
        params.append("is_active", statusFilter === "Active" ? "1" : "0");

      return makeApiRequest<PropertiesApiResponse>(
        `${apiUrl.getAllPropertiesListing}?${params.toString()}`
      );
    },
  });

  const properties: Property[] = data?.data?.data ?? [];
  const meta: PaginationMeta = {
    current_page: data?.data?.current_page ?? 1,
    last_page: data?.data?.last_page ?? 1,
    total: data?.data?.total ?? 0,
    from: data?.data?.from ?? 0,
    to: data?.data?.to ?? 0,
    per_page: data?.data?.per_page ?? 20,
  };

  // ─── Toggle status mutation ──────────────────────────────────────────────────
  const { mutate: toggleStatus } = useMutation({
    mutationFn: ({ id, newStatus }: { id: number; newStatus: boolean }) =>
      makeApiRequest(`${apiUrl.updatePropertyStatus}/${id}/status`, {
        method: "PUT",
        data: { is_active: newStatus },
      }),
    onMutate: ({ id }) => {
      setTogglingId(id);
    },
    onSuccess: (_res, { id, newStatus }) => {
      queryClient.setQueryData<PropertiesApiResponse>(queryKey, (old) => {
        if (!old) return old;
        return {
          ...old,
          data: {
            ...old.data,
            data: old.data.data.map((p) =>
              p.id === id ? { ...p, is_active: newStatus } : p
            ),
          },
        };
      });
    },
    onSettled: () => {
      setTogglingId(null);
    },
  });

  const handleToggleStatus = (id: number, newStatus: boolean) => {
    toggleStatus({ id, newStatus });
  };

  const handleViewDetails = (id: number) => {
    navigate(`/get-all-properties-listing/${id}`);
  };

  // ─── Pending approvals query ─────────────────────────────────────────────────
  const { data: pendingData, isFetching: isFetchingPending, refetch: refetchPending } = useQuery({
    queryKey: ["pending-approvals"],
    queryFn: () =>
      makeApiRequest<{ success: boolean; data: PendingProperty[] }>(apiUrl.pendingApprovals),
    enabled: viewMode === "pending",
  });

  const pendingProperties: PendingProperty[] =
    ((pendingData?.data as { data?: PendingProperty[] })?.data) ?? [];

  // ─── Approve mutation ────────────────────────────────────────────────────────
  const { mutate: approveProperty, isPending: isApproving } = useMutation({
    mutationFn: (id: number) =>
      makeApiRequest(`${apiUrl.approveProperty}/${id}/approve`, { method: "POST" }),
    onSuccess: () => {
      toast.success("Property approved successfully");
      setApproveConfirmOpen(false);
      setPendingDetailsOpen(false);
      setSelectedPending(null);
      refetchPending();
    },
    onError: () => {
      toast.error("Failed to approve property");
    },
  });

  // ─── Reject mutation ─────────────────────────────────────────────────────────
  const { mutate: rejectProperty, isPending: isRejecting } = useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) =>
      makeApiRequest(`${apiUrl.rejectProperty}/${id}/reject`, {
        method: "POST",
        data: { reason },
      }),
    onSuccess: () => {
      toast.success("Property rejected successfully");
      setRejectDialogOpen(false);
      setPendingDetailsOpen(false);
      setSelectedPending(null);
      setRejectReason("");
      refetchPending();
    },
    onError: () => {
      toast.error("Failed to reject property");
    },
  });

  const handleOpenPendingDetails = (p: PendingProperty) => {
    setSelectedPending(p);
    setPendingDetailsOpen(true);
  };

  const handleApproveClick = () => {
    setApproveConfirmOpen(true);
  };

  const handleApproveConfirm = () => {
    if (selectedPending) approveProperty(selectedPending.id);
  };

  const handleRejectClick = () => {
    setRejectReason("");
    setRejectDialogOpen(true);
  };

  const handleRejectSubmit = () => {
    if (!rejectReason.trim()) {
      toast.error("Please enter a reason for rejection");
      return;
    }
    if (selectedPending) rejectProperty({ id: selectedPending.id, reason: rejectReason });
  };

  const handleSearch = () => {
    setAppliedSearch(search);
    setPage(1);
  };

  const handleProviderChange = (val: string) => {
    setProvider(val);
    setPage(1);
  };

  const handleStatusFilterChange = (val: string) => {
    setStatusFilter(val);
    setPage(1);
  };

  const handlePerPageChange = (val: string) => {
    setPerPage(val);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  // ─── Add Pricing ─────────────────────────────────────────────────────────────
  const { mutate: submitPricing, isPending: isSubmittingPricing } = useMutation({
    mutationFn: (payload: typeof pricingForm & { amount: number }) =>
      makeApiRequest(`${apiUrl.addPropertyFee}/${pricingPropertyId}/fees`, {
        method: "POST",
        data: payload,
      }),
    onSuccess: () => {
      toast.success("Pricing fee added successfully");
      setPricingModalOpen(false);
      resetPricingForm();
    },
    onError: () => {
      toast.error("Failed to add pricing fee");
    },
  });

  const resetPricingForm = () => {
    setPricingForm({
      fee_type: "cleaning_fee",
      fee_name: "",
      amount: "",
      amount_type: "fixed",
      applies_to: "per_stay",
      is_mandatory: true,
      is_taxable: false,
      is_active: true,
    });
  };

  const handleOpenPricingModal = (id: number) => {
    setPricingPropertyId(id);
    resetPricingForm();
    setPricingModalOpen(true);
  };

  const handlePricingSubmit = () => {
    if (!pricingForm.fee_name.trim() || !pricingForm.amount) {
      toast.error("Fee name and amount are required");
      return;
    }
    submitPricing({ ...pricingForm, amount: Number(pricingForm.amount) });
  };

  // ─── Delete Pricing — fetch fees list ────────────────────────────────────────
  const {
    data: feesData,
    isFetching: isFetchingFees,
    refetch: refetchFees,
  } = useQuery({
    queryKey: ["property-fees", deleteFeesPropertyId],
    queryFn: () =>
      makeApiRequest<{ success: boolean; data: PropertyFee[] }>(
        `${apiUrl.addPropertyFee}/${deleteFeesPropertyId}/fees`
      ),
    enabled: deleteFeesModalOpen && deleteFeesPropertyId != null,
  });

  const fees: PropertyFee[] = (feesData?.data as { fees?: PropertyFee[] })?.fees ?? [];

  const { mutate: deleteFee } = useMutation({
    mutationFn: (feeId: number) =>
      makeApiRequest(`${apiUrl.addPropertyFee}/${deleteFeesPropertyId}/fees/${feeId}`, {
        method: "DELETE",
      }),
    onMutate: (feeId) => setDeletingFeeId(feeId),
    onSuccess: () => {
      toast.success("Fee deleted successfully");
      refetchFees();
    },
    onError: () => {
      toast.error("Failed to delete fee");
    },
    onSettled: () => setDeletingFeeId(null),
  });

  const handleOpenDeleteFeesModal = (id: number) => {
    setDeleteFeesPropertyId(id);
    setDeleteFeesModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Properties</h1>
          <p className="text-muted-foreground">Manage your property listings</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-md border overflow-hidden">
            <Button
              variant={viewMode === "all" ? "default" : "ghost"}
              size="sm"
              className="rounded-none"
              onClick={() => setViewMode("all")}
            >
              All Properties
            </Button>
            <Button
              variant={viewMode === "pending" ? "default" : "ghost"}
              size="sm"
              className="rounded-none gap-1"
              onClick={() => setViewMode("pending")}
            >
              <Clock className="h-3.5 w-3.5" />
              Pending Approvals
            </Button>
          </div>
          {viewMode === "all" && (
            <Button variant="outline" onClick={() => syncProperties()} disabled={isSyncing || isFetching}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
              {isSyncing ? "Syncing..." : "Sync Properties"}
            </Button>
          )}
        </div>
      </div>

      {/* Pending Approvals Card */}
      {viewMode === "pending" && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Pending Approvals</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Properties awaiting admin review
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => refetchPending()} disabled={isFetchingPending}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isFetchingPending ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={buildPendingColumns(handleOpenPendingDetails)}
              data={pendingProperties}
              loading={isFetchingPending}
              rowKey={(p) => p.id}
              emptyMessage="No pending properties found."
            />
          </CardContent>
        </Card>
      )}

      {/* Table Card */}
      {viewMode === "all" && (
        <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Property Management</CardTitle>
              {meta.total > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  Showing {meta.from} to {meta.to} of {meta.total} properties
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
                placeholder="Search by name or city..."
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
                  {provider === "All" ? "All Providers" : provider}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {PROVIDERS.map((p) => (
                  <DropdownMenuItem key={p} onClick={() => handleProviderChange(p)}>
                    {p === "All" ? "All Providers" : p}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  {statusFilter === "All" ? "All Status" : statusFilter}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleStatusFilterChange("All")}>
                  All Status
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusFilterChange("Active")}>
                  Active
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusFilterChange("Inactive")}>
                  Inactive
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent>
          <DataTable
            columns={buildColumns(
              handleToggleStatus,
              togglingId,
              handleViewDetails,
              handleOpenPricingModal,
              handleOpenDeleteFeesModal,
            )}
            data={properties}
            loading={isFetching}
            rowKey={(p) => p.id}
            emptyMessage="No properties found."
          />

          {meta.last_page > 1 && (
            <div className="mt-6">
              <CustomPagination
                currentPage={meta.current_page}
                lastPage={meta.last_page}
                onPageChange={handlePageChange}
                total={meta.total}
                from={meta.from}
                to={meta.to}
              />
            </div>
          )}
        </CardContent>
        </Card>
      )}

      {/* ─── Add Pricing Modal ─────────────────────────────────────────────── */}
      <Dialog
        open={pricingModalOpen}
        onOpenChange={(open) => {
          if (!open) { setPricingModalOpen(false); resetPricingForm(); }
        }}
      >
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Add Pricing Fee</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Fee Type</Label>
              <Select
                value={pricingForm.fee_type}
                onValueChange={(val) => setPricingForm((f) => ({ ...f, fee_type: val }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cleaning_fee">Cleaning Fee</SelectItem>
                  <SelectItem value="service_fee">Service Fee</SelectItem>
                  <SelectItem value="pet_fee">Pet Fee</SelectItem>
                  <SelectItem value="resort_fee">Resort Fee</SelectItem>
                  <SelectItem value="parking_fee">Parking Fee</SelectItem>
                  <SelectItem value="extra_guest_fee">Extra Guest Fee</SelectItem>
                  <SelectItem value="security_deposit">Security Deposit</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Fee Name</Label>
              <Input
                className="col-span-3"
                placeholder="e.g. Cleaning Fee"
                value={pricingForm.fee_name}
                onChange={(e) => setPricingForm((f) => ({ ...f, fee_name: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Amount</Label>
              <Input
                className="col-span-3"
                type="number"
                min={0}
                placeholder="e.g. 75"
                value={pricingForm.amount}
                onChange={(e) => setPricingForm((f) => ({ ...f, amount: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Amount Type</Label>
              <Select
                value={pricingForm.amount_type}
                onValueChange={(val) => setPricingForm((f) => ({ ...f, amount_type: val }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed</SelectItem>
                  <SelectItem value="percentage">Percentage</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Applies To</Label>
              <Select
                value={pricingForm.applies_to}
                onValueChange={(val) => setPricingForm((f) => ({ ...f, applies_to: val }))}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="per_stay">Per Stay</SelectItem>
                  <SelectItem value="per_night">Per Night</SelectItem>
                  <SelectItem value="per_guest">Per Guest</SelectItem>
                  <SelectItem value="per_guest_per_night">Per Guest Per Night</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Mandatory</Label>
              <div className="col-span-3 flex items-center">
                <Switch
                  checked={pricingForm.is_mandatory}
                  onCheckedChange={(val) => setPricingForm((f) => ({ ...f, is_mandatory: val }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Taxable</Label>
              <div className="col-span-3 flex items-center">
                <Switch
                  checked={pricingForm.is_taxable}
                  onCheckedChange={(val) => setPricingForm((f) => ({ ...f, is_taxable: val }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Active</Label>
              <div className="col-span-3 flex items-center">
                <Switch
                  checked={pricingForm.is_active}
                  onCheckedChange={(val) => setPricingForm((f) => ({ ...f, is_active: val }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setPricingModalOpen(false); resetPricingForm(); }}
              disabled={isSubmittingPricing}
            >
              Cancel
            </Button>
            <Button onClick={handlePricingSubmit} disabled={isSubmittingPricing}>
              {isSubmittingPricing ? "Saving..." : "Save Fee"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Pricing Fees Modal ─────────────────────────────────────── */}
      <Dialog
        open={deleteFeesModalOpen}
        onOpenChange={(open) => {
          if (!open) { setDeleteFeesModalOpen(false); setDeleteFeesPropertyId(null); }
        }}
      >
        <DialogContent className="sm:max-w-[540px]">
          <DialogHeader>
            <DialogTitle>Delete Pricing Fee</DialogTitle>
          </DialogHeader>

          <div className="py-2">
            {isFetchingFees ? (
              <p className="text-sm text-muted-foreground text-center py-6">Loading fees...</p>
            ) : fees.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No pricing fees found for this property.
              </p>
            ) : (
              <div className="divide-y">
                {fees.map((fee) => (
                  <div key={fee.id} className="flex items-center justify-between py-3 gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{fee.fee_name}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {fee.fee_type.replace(/_/g, " ")} &middot;{" "}
                        {fee.amount_type === "percentage"
                          ? `${fee.amount}%`
                          : `$${fee.amount}`}{" "}
                        &middot; {fee.applies_to.replace(/_/g, " ")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge
                        className={
                          fee.is_active
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : "bg-red-100 text-red-800 hover:bg-red-100"
                        }
                      >
                        {fee.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        disabled={deletingFeeId === fee.id}
                        onClick={() => deleteFee(fee.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setDeleteFeesModalOpen(false); setDeleteFeesPropertyId(null); }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Pending Property Details Modal ───────────────────────────────── */}
      <Dialog
        open={pendingDetailsOpen}
        onOpenChange={(open) => {
          if (!open) { setPendingDetailsOpen(false); setSelectedPending(null); }
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Property Details</DialogTitle>
          </DialogHeader>

          {selectedPending && (
            <div className="space-y-4 py-2">
              {selectedPending.featured_image && (
                <img
                  src={selectedPending.featured_image}
                  alt={selectedPending.name}
                  className="w-full h-48 object-cover rounded-md"
                />
              )}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Name</p>
                  <p className="font-medium">{selectedPending.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Type</p>
                  <p className="font-medium capitalize">
                    {selectedPending.property_type?.replace(/_/g, " ") ?? "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Provider</p>
                  <p className="font-medium capitalize">{selectedPending.provider}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Provider ID</p>
                  <p className="font-medium">{selectedPending.provider_property_id}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="font-medium">
                    {[selectedPending.address, selectedPending.city, selectedPending.state, selectedPending.country]
                      .filter(Boolean)
                      .join(", ") || "N/A"}
                  </p>
                </div>
                {selectedPending.price_from && (
                  <div>
                    <p className="text-xs text-muted-foreground">Price From</p>
                    <p className="font-medium">
                      {selectedPending.price_currency} {selectedPending.price_from}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">Submitted</p>
                  <p className="font-medium">{formatDate(selectedPending.created_at)}</p>
                </div>
                {selectedPending.description && (
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground">Description</p>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {selectedPending.description}
                    </p>
                  </div>
                )}
                {selectedPending.amenities?.length > 0 && (
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground mb-1">Amenities</p>
                    <div className="flex flex-wrap gap-1">
                      {selectedPending.amenities.map((a) => (
                        <Badge key={a} variant="secondary" className="text-xs">{a}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => { setPendingDetailsOpen(false); setSelectedPending(null); }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectClick}
              disabled={isApproving || isRejecting}
              className="gap-1"
            >
              <XCircle className="h-4 w-4" />
              Reject
            </Button>
            <Button
              onClick={handleApproveClick}
              disabled={isApproving || isRejecting}
              className="gap-1 bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4" />
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Approve Confirmation Modal ───────────────────────────────────── */}
      <Dialog open={approveConfirmOpen} onOpenChange={setApproveConfirmOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Approve Property</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Are you sure you want to approve{" "}
            <span className="font-medium text-foreground">{selectedPending?.name}</span>?
            This will make the property active on the platform.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setApproveConfirmOpen(false)}
              disabled={isApproving}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApproveConfirm}
              disabled={isApproving}
              className="bg-green-600 hover:bg-green-700"
            >
              {isApproving ? "Approving..." : "OK, Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Reject Reason Modal ──────────────────────────────────────────── */}
      <Dialog
        open={rejectDialogOpen}
        onOpenChange={(open) => {
          if (!open) { setRejectDialogOpen(false); setRejectReason(""); }
        }}
      >
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>Reject Property</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              Please provide a reason for rejecting{" "}
              <span className="font-medium text-foreground">{selectedPending?.name}</span>.
            </p>
            <div className="space-y-1.5">
              <Label>Reason</Label>
              <Textarea
                placeholder="e.g. Missing high-quality images"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setRejectDialogOpen(false); setRejectReason(""); }}
              disabled={isRejecting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectSubmit}
              disabled={isRejecting || !rejectReason.trim()}
            >
              {isRejecting ? "Rejecting..." : "Reject Property"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PropertiesListing;
