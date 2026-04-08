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
import { Switch } from "@/components/ui/switch";
import { Building2, ChevronDown, Eye, MapPin, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

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
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {p.api_data?.propertyUrl && (
              <DropdownMenuItem onClick={() => window.open(p.api_data.propertyUrl, "_blank")}>
                View on Provider
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => onViewDetails(p.id)}>View Details</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
];
// ──────────────────────────────────────────────────────────────────────────────

function PropertiesListing() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [provider, setProvider] = useState("ownerrez");
  const [statusFilter, setStatusFilter] = useState("All");
  const [perPage, setPerPage] = useState("20");
  const [page, setPage] = useState(1);
  const [togglingId, setTogglingId] = useState<number | null>(null);

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
  const { data, isFetching, refetch } = useQuery({
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
      // Optimistically update cached list without a full refetch
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Properties</h1>
          <p className="text-muted-foreground">Manage your property listings</p>
        </div>
        <Button variant="outline" onClick={() => syncProperties()} disabled={isSyncing || isFetching}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? "animate-spin" : ""}`} />
          {isSyncing ? "Syncing..." : "Sync Properties"}
        </Button>
      </div>

      {/* Table Card */}
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
            columns={buildColumns(handleToggleStatus, togglingId, handleViewDetails)}
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
    </div>
  );
}

export default PropertiesListing;
