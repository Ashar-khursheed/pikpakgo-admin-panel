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
import { ChevronDown, Eye, Globe, MoreHorizontal, Plus, Search } from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface SeoItem {
  id: number;
  route_slug: string;
  route_path: string;
  route_label: string;
  route_group: string;
  meta_title: string | null;
  meta_description: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  twitter_card: string | null;
  twitter_title: string | null;
  twitter_description: string | null;
  twitter_image: string | null;
  canonical_url: string | null;
  no_index: boolean;
  no_follow: boolean;
  schema_markup: object[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  total: number;
  from: number;
  to: number;
  per_page: number;
}

interface SeoApiResponse {
  success: boolean;
  data: { data: SeoItem[] } & PaginationMeta;
}

// ─── Constants ─────────────────────────────────────────────────────────────────
const SEO_GROUPS = ["All", "Core", "Search", "Booking", "Account", "Blog", "Dynamic"];
const PER_PAGE_OPTIONS = ["10", "20", "50", "100"];

const groupConfig: Record<string, string> = {
  Core:    "bg-blue-100 text-blue-800 hover:bg-blue-100",
  Search:  "bg-purple-100 text-purple-800 hover:bg-purple-100",
  Booking: "bg-orange-100 text-orange-800 hover:bg-orange-100",
  Account: "bg-sky-100 text-sky-800 hover:bg-sky-100",
  Blog:    "bg-green-100 text-green-800 hover:bg-green-100",
  Dynamic: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
};

// ─── Column definitions ────────────────────────────────────────────────────────
const buildColumns = (
  onView: (id: number) => void,
): Column<SeoItem>[] => [
  {
    header: "Route",
    render: (s) => (
      <div>
        <div className="font-medium text-sm">{s.route_label}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{s.route_path}</div>
      </div>
    ),
  },
  {
    header: "Group",
    render: (s) => (
      <Badge className={groupConfig[s.route_group] ?? "bg-gray-100 text-gray-800 hover:bg-gray-100"}>
        {s.route_group}
      </Badge>
    ),
  },
  {
    header: "Meta Title",
    render: (s) => (
      <span className="text-sm text-muted-foreground line-clamp-1 max-w-xs">
        {s.meta_title ?? "—"}
      </span>
    ),
  },
  {
    header: "Canonical URL",
    render: (s) =>
      s.canonical_url ? (
        <span className="text-xs text-blue-600 truncate max-w-[160px] block">
          {s.canonical_url}
        </span>
      ) : (
        <span className="text-muted-foreground text-sm">—</span>
      ),
  },
  {
    header: "No Index",
    render: (s) =>
      s.no_index ? (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Yes</Badge>
      ) : (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">No</Badge>
      ),
  },
  {
    header: "No Follow",
    render: (s) =>
      s.no_follow ? (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Yes</Badge>
      ) : (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">No</Badge>
      ),
  },
  {
    header: "Status",
    render: (s) => (
      <Badge
        className={
          s.is_active
            ? "bg-green-100 text-green-800 hover:bg-green-100"
            : "bg-red-100 text-red-800 hover:bg-red-100"
        }
      >
        {s.is_active ? "Active" : "Inactive"}
      </Badge>
    ),
  },
  {
    header: "Updated",
    render: (s) => (
      <span className="text-sm text-muted-foreground whitespace-nowrap">
        {formatDate(s.updated_at)}
      </span>
    ),
  },
  {
    header: "Actions",
    className: "text-right",
    render: (s) => (
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(s.id)} className="gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              View
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
];

// ─── Main Component ────────────────────────────────────────────────────────────
function SeoManagementListing() {
  const navigate = useNavigate();

  // ── Filters
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [groupFilter, setGroupFilter] = useState("All");
  const [perPage, setPerPage] = useState("50");
  const [page, setPage] = useState(1);

  const queryKey = [
    "seo-management",
    { page, perPage, groupFilter, search: appliedSearch },
  ] as const;

  // ── Fetch list
  const { data, isFetching } = useQuery({
    queryKey,
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), per_page: perPage });
      if (groupFilter !== "All") params.append("group", groupFilter);
      if (appliedSearch.trim()) params.append("search", appliedSearch.trim());
      return makeApiRequest<SeoApiResponse>(`${apiUrl.getAllSeo}?${params.toString()}`);
    },
  });

  const seoItems: SeoItem[] = data?.data?.data ?? [];
  const meta: PaginationMeta = {
    current_page: data?.data?.current_page ?? 1,
    last_page:    data?.data?.last_page ?? 1,
    total:        data?.data?.total ?? 0,
    from:         data?.data?.from ?? 0,
    to:           data?.data?.to ?? 0,
    per_page:     data?.data?.per_page ?? 50,
  };

  const handleSearch = () => {
    setAppliedSearch(search);
    setPage(1);
  };

  const handleGroupChange = (val: string) => { setGroupFilter(val); setPage(1); };
  const handlePerPageChange = (val: string) => { setPerPage(val); setPage(1); };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SEO Management</h1>
          <p className="text-muted-foreground">Manage meta tags, Open Graph, and SEO settings for all routes</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Globe className="h-5 w-5" />
            <span className="text-sm font-medium">{meta.total} total routes</span>
          </div>
          <Button onClick={() => navigate("/seo-management/add")}>
            <Plus className="mr-2 h-4 w-4" />
            Add SEO
          </Button>
        </div>
      </div>

      {/* Table Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>SEO Routes</CardTitle>
              {meta.total > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  Showing {meta.from} to {meta.to} of {meta.total} items
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
                placeholder="Search by slug, label or meta_title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-72"
              />
              <Button variant="outline" onClick={handleSearch} disabled={isFetching}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  {groupFilter === "All" ? "All Groups" : groupFilter}
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {SEO_GROUPS.map((g) => (
                  <DropdownMenuItem key={g} onClick={() => handleGroupChange(g)}>
                    {g === "All" ? "All Groups" : g}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent>
          <DataTable
            columns={buildColumns((id) => navigate(`/seo-management/${id}`))}
            data={seoItems}
            loading={isFetching}
            rowKey={(s) => s.id}
            emptyMessage="No SEO routes found."
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
  );
}

export default SeoManagementListing;
