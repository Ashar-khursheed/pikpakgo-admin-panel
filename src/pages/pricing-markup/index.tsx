import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Switch } from "@/components/ui/switch";
import {
  ChevronDown,
  Percent,
  DollarSign,
  Plus,
  Eye,
  Pencil,
  Trash2,
  MoreHorizontal,
} from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Modal } from "@/components/ui/modal";
import toast from "react-hot-toast";

interface PricingMarkup {
  id: number;
  name: string;
  description: string | null;
  markup_type: "percentage" | "fixed" | "tiered";
  markup_percentage: string;
  markup_fixed_amount: string;
  tiered_pricing: unknown;
  provider: string | null;
  property_type: string | null;
  destination_code: string | null;
  min_price: string | null;
  max_price: string | null;
  valid_from: string | null;
  valid_to: string | null;
  priority: number;
  is_active: boolean;
  is_default: boolean;
  created_by: number;
  updated_by: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  total: number;
  from: number;
  to: number;
  per_page: number;
}

interface PricingMarkupsApiResponse {
  success: boolean;
  data: { data: PricingMarkup[] } & PaginationMeta;
}

const PROVIDERS = ["All", "ownerrez", "lodgify", "hostaway", "guesty"];
const PER_PAGE_OPTIONS = ["10", "20", "50", "100"];

const markupTypeConfig: Record<string, { label: string; color: string }> = {
  percentage: {
    label: "Percentage",
    color: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  },
  fixed: {
    label: "Fixed",
    color: "bg-purple-100 text-purple-800 hover:bg-purple-100",
  },
  tiered: {
    label: "Tiered",
    color: "bg-orange-100 text-orange-800 hover:bg-orange-100",
  },
};

// ─── Column definitions ────────────────────────────────────────────────────────
const buildColumns = (
  onToggleClick: (markup: PricingMarkup) => void,
  onView: (id: number) => void,
  onEdit: (id: number) => void,
  onDelete: (id: number) => void,
  onSetDefault: (markup: PricingMarkup) => void,
): Column<PricingMarkup>[] => [
  {
    header: "Name",
    render: (m) => (
      <div>
        <div className="font-medium text-sm">{m.name}</div>
        {m.description && (
          <div className="text-xs text-muted-foreground mt-0.5">
            {m.description}
          </div>
        )}
      </div>
    ),
  },
  {
    header: "Type",
    render: (m) => {
      const cfg = markupTypeConfig[m.markup_type] ?? {
        label: m.markup_type,
        color: "bg-gray-100 text-gray-800 hover:bg-gray-100",
      };
      return <Badge className={cfg.color}>{cfg.label}</Badge>;
    },
  },
  {
    header: "Markup Value",
    render: (m) => (
      <div className="space-y-0.5">
        <div className="flex items-center gap-1 text-sm font-medium">
          <Percent className="h-3.5 w-3.5 text-muted-foreground" />
          <span>{m.markup_percentage}%</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <DollarSign className="h-3 w-3" />
          <span>{m.markup_fixed_amount}</span>
        </div>
      </div>
    ),
  },
  {
    header: "Provider",
    render: (m) => (
      <span className="text-sm capitalize">{m.provider ?? "—"}</span>
    ),
  },
  {
    header: "Price Range",
    render: (m) => {
      const hasRange = m.min_price !== null || m.max_price !== null;
      if (!hasRange)
        return <span className="text-xs text-muted-foreground">—</span>;
      return (
        <span className="text-sm">
          {m.min_price ?? "0"} – {m.max_price ?? "∞"}
        </span>
      );
    },
  },
  {
    header: "Priority",
    render: (m) => (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-muted text-sm font-semibold">
        {m.priority}
      </span>
    ),
  },
  {
    header: "Default",
    render: (m) =>
      m.is_default ? (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          Default
        </Badge>
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
      ),
  },
  {
    header: "Status",
    render: (m) => (
      <Badge
        className={
          m.is_active
            ? "bg-green-100 text-green-800 hover:bg-green-100"
            : "bg-red-100 text-red-800 hover:bg-red-100"
        }
      >
        {m.is_active ? "Active" : "Inactive"}
      </Badge>
    ),
  },
  {
    header: "Active",
    render: (m) => (
      <Switch
        checked={m.is_active}
        onCheckedChange={() => onToggleClick(m)}
      />
    ),
  },
  {
    header: "Created",
    render: (m) => (
      <span className="text-sm text-muted-foreground whitespace-nowrap">
        {formatDate(m.created_at)}
      </span>
    ),
  },
  {
    header: "Actions",
    className: "text-right",
    render: (m) => (
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onSetDefault(m)} className="gap-2">
              <Plus className="h-4 w-4 text-muted-foreground" />
              Set as Default
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onView(m.id)} className="gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEdit(m.id)} className="gap-2">
              <Pencil className="h-4 w-4 text-muted-foreground" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(m.id)}
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

function PricingMarkupListing() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [provider, setProvider] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [perPage, setPerPage] = useState("20");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [defaultMarkup, setDefaultMarkup] = useState<PricingMarkup | null>(null);
  const [toggleMarkup, setToggleMarkup] = useState<PricingMarkup | null>(null);

  const queryKey = [
    "pricing-markups",
    { page, perPage, provider, statusFilter },
  ] as const;

  // ─── Fetch markups ────────────────────────────────────────────────────────────
  const { data, isFetching } = useQuery({
    queryKey,
    queryFn: () => {
      const params = new URLSearchParams({
        page: String(page),
        per_page: perPage,
      });
      if (provider !== "All") params.append("provider", provider);
      if (statusFilter !== "All")
        params.append(
          "is_active",
          statusFilter === "Active" ? "true" : "false",
        );

      return makeApiRequest<PricingMarkupsApiResponse>(
        `${apiUrl.getAllPricingMarkups}?${params.toString()}`,
      );
    },
  });

  const markups: PricingMarkup[] = data?.data?.data ?? [];
  const meta: PaginationMeta = {
    current_page: data?.data?.current_page ?? 1,
    last_page: data?.data?.last_page ?? 1,
    total: data?.data?.total ?? 0,
    from: data?.data?.from ?? 0,
    to: data?.data?.to ?? 0,
    per_page: data?.data?.per_page ?? 20,
  };

  // ─── Toggle status mutation ──────────────────────────────────────────────────
  const { mutate: toggleStatus, isPending: isToggling } = useMutation({
    mutationFn: (id: number) =>
      makeApiRequest(`${apiUrl.togglePricingMarkupStatus}/${id}/toggle-status`, {
        method: "PUT",
      }),
    onSuccess: () => {
      toast.success(
        toggleMarkup?.is_active
          ? "Markup deactivated successfully"
          : "Markup activated successfully",
      );
      queryClient.invalidateQueries({ queryKey: ["pricing-markups"] });
      setToggleMarkup(null);
    },
    onError: () => {
      toast.error("Failed to update status");
      setToggleMarkup(null);
    },
  });

  // ─── Set default mutation ────────────────────────────────────────────────────
  const { mutate: setAsDefault, isPending: isSettingDefault } = useMutation({
    mutationFn: (id: number) =>
      makeApiRequest(apiUrl.setDefaultMarkup, {
        method: "POST",
        data: { markup_id: id },
      }),
    onSuccess: () => {
      toast.success("Default markup updated successfully");
      queryClient.invalidateQueries({ queryKey: ["pricing-markups"] });
      setDefaultMarkup(null);
    },
    onError: () => {
      toast.error("Failed to set default markup");
      setDefaultMarkup(null);
    },
  });

  // ─── Delete mutation ─────────────────────────────────────────────────────────
  const { mutate: deleteMarkup, isPending: isDeleting } = useMutation({
    mutationFn: (id: number) =>
      makeApiRequest(`${apiUrl.deletePricingMarkup}/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      toast.success("Markup deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["pricing-markups"] });
      setDeleteId(null);
    },
    onError: () => {
      toast.error("Failed to delete markup");
      setDeleteId(null);
    },
  });

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

  return (
    <>
      {/* ── Toggle Status Modal ─────────────────────────────────────────── */}
      <Modal
        isOpen={toggleMarkup !== null}
        onClose={() => setToggleMarkup(null)}
        title={toggleMarkup?.is_active ? "Deactivate Markup" : "Activate Markup"}
        width="max-w-md"
        footerBtnText={toggleMarkup?.is_active ? "Yes, Deactivate" : "Yes, Activate"}
        loading={isToggling}
        onConfirm={() => { if (toggleMarkup) toggleStatus(toggleMarkup.id); }}
      >
        {toggleMarkup && (
          <div className="space-y-4">
            <div className={`flex items-center gap-3 rounded-lg p-3 ${toggleMarkup.is_active ? "bg-red-50 border border-red-200" : "bg-green-50 border border-green-200"}`}>
              <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${toggleMarkup.is_active ? "bg-red-500" : "bg-green-500"}`} />
              <p className={`text-sm font-medium ${toggleMarkup.is_active ? "text-red-800" : "text-green-800"}`}>
                {toggleMarkup.is_active
                  ? `"${toggleMarkup.name}" will be deactivated`
                  : `"${toggleMarkup.name}" will be activated`}
              </p>
            </div>

            <div className="rounded-lg border bg-muted/40 p-4 space-y-2.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Markup Details</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Current Status</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${toggleMarkup.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {toggleMarkup.is_active ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Percentage</span>
                <span className="font-semibold text-blue-600">{toggleMarkup.markup_percentage}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Fixed Amount</span>
                <span className="font-semibold text-purple-600">${toggleMarkup.markup_fixed_amount}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Provider</span>
                <span className="font-medium capitalize">{toggleMarkup.provider ?? "—"}</span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              {toggleMarkup.is_active
                ? "Deactivating this rule will stop it from being applied to any properties. You can re-activate it at any time."
                : "Activating this rule will allow it to be applied to properties based on priority order."}
            </p>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={defaultMarkup !== null}
        onClose={() => setDefaultMarkup(null)}
        title="Set as Default Markup"
        width="max-w-lg"
        footerBtnText="Yes, Set as Default"
        loading={isSettingDefault}
        onConfirm={() => { if (defaultMarkup) setAsDefault(defaultMarkup.id); }}
      >
        {defaultMarkup && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You are about to set <span className="font-semibold text-foreground">"{defaultMarkup.name}"</span> as the default markup rule. This will automatically apply to all properties.
            </p>

            <div className="rounded-lg border bg-muted/40 p-4 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Markup Details</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium capitalize">{defaultMarkup.markup_type}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Percentage</span>
                <span className="font-semibold text-blue-600">{defaultMarkup.markup_percentage}%</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Fixed Amount</span>
                <span className="font-semibold text-purple-600">${defaultMarkup.markup_fixed_amount}</span>
              </div>
              {defaultMarkup.provider && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Provider</span>
                  <span className="font-medium capitalize">{defaultMarkup.provider}</span>
                </div>
              )}
            </div>

            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 space-y-1">
              <p className="font-semibold">What will change?</p>
              <ul className="list-disc list-inside space-y-0.5 text-amber-700">
                <li>All properties without a specific markup will use this rule.</li>
                <li>Prices will be recalculated based on the new default percentage.</li>
                <li>Any previously set default markup will be replaced.</li>
              </ul>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        title="Delete Pricing Markup"
        width="max-w-md"
        footerBtnText="Delete"
        loading={isDeleting}
        onConfirm={() => {
          if (deleteId !== null) deleteMarkup(deleteId);
        }}
      >
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete this markup rule? This action cannot
          be undone.
        </p>
      </Modal>

      <div className="space-y-6">
        {/* Header */}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Pricing Markups
            </h1>
            <p className="text-muted-foreground">
              Manage pricing markup rules for properties
            </p>
          </div>
          <Button onClick={() => navigate("/get-all-pricing-markup/add")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Markup Price
          </Button>
        </div>

        {/* Table Card */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Markup Management</CardTitle>
                {meta.total > 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Showing {meta.from} to {meta.to} of {meta.total} markups
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    {provider === "All" ? "All Providers" : provider}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {PROVIDERS.map((p) => (
                    <DropdownMenuItem
                      key={p}
                      onClick={() => handleProviderChange(p)}
                    >
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
                  <DropdownMenuItem
                    onClick={() => handleStatusFilterChange("All")}
                  >
                    All Status
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleStatusFilterChange("Active")}
                  >
                    Active
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleStatusFilterChange("Inactive")}
                  >
                    Inactive
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>

          <CardContent>
            <DataTable
              columns={buildColumns(
                (markup) => setToggleMarkup(markup),
                (id) => navigate(`/get-all-pricing-markup/${id}`),
                (id) => navigate(`/get-all-pricing-markup/${id}/edit`),
                (id) => setDeleteId(id),
                (markup) => setDefaultMarkup(markup),
              )}
              data={markups}
              loading={isFetching}
              rowKey={(m) => m.id}
              emptyMessage="No pricing markups found."
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

export default PricingMarkupListing;
