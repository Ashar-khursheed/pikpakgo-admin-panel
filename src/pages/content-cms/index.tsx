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
import {
  ChevronDown,
  Eye,
  FileText,
  MoreHorizontal,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface ContentItem {
  id: number;
  slug: string;
  parent_slug: string | null;
  sort_order: number;
  show_in_nav: boolean;
  nav_label: string | null;
  nav_icon: string | null;
  title: string;
  type: string;
  template: string;
  is_active: boolean;
  published_at: string | null;
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

interface ContentApiResponse {
  success: boolean;
  data: { data: ContentItem[] } & PaginationMeta;
}

// ─── Constants ─────────────────────────────────────────────────────────────────
const CONTENT_TYPES = ["All", "page", "header", "footer", "section", "nav"];
const SHOW_IN_NAV_OPTIONS = ["All", "true", "false"];
const PER_PAGE_OPTIONS = ["10", "20", "50", "100"];

const typeConfig: Record<string, string> = {
  page:    "bg-blue-100 text-blue-800 hover:bg-blue-100",
  header:  "bg-purple-100 text-purple-800 hover:bg-purple-100",
  footer:  "bg-orange-100 text-orange-800 hover:bg-orange-100",
  section: "bg-sky-100 text-sky-800 hover:bg-sky-100",
  nav:     "bg-green-100 text-green-800 hover:bg-green-100",
};

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ─── Column definitions ────────────────────────────────────────────────────────
const buildColumns = (
  onView: (id: number) => void,
  onEdit: (id: number) => void,
  onDelete: (item: ContentItem) => void,
  onRestore: (item: ContentItem) => void,
  onToggle: (item: ContentItem) => void,
): Column<ContentItem>[] => [
  {
    header: "Title",
    render: (c) => (
      <div>
        <div className="font-medium text-sm">{c.title}</div>
        <div className="text-xs text-muted-foreground mt-0.5">/{c.slug}</div>
      </div>
    ),
  },
  {
    header: "Type",
    render: (c) => (
      <Badge className={typeConfig[c.type] ?? "bg-gray-100 text-gray-800 hover:bg-gray-100"}>
        {capitalize(c.type)}
      </Badge>
    ),
  },
  {
    header: "Template",
    render: (c) => (
      <span className="text-sm capitalize text-muted-foreground">{c.template}</span>
    ),
  },
  {
    header: "Nav Label",
    render: (c) => (
      <span className="text-sm text-muted-foreground">{c.nav_label ?? "—"}</span>
    ),
  },
  {
    header: "Show in Nav",
    render: (c) =>
      c.show_in_nav ? (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Yes</Badge>
      ) : (
        <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">No</Badge>
      ),
  },
  {
    header: "Sort",
    render: (c) => (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-muted text-sm font-semibold">
        {c.sort_order}
      </span>
    ),
  },
  {
    header: "Status",
    render: (c) =>
      c.deleted_at ? (
        <Badge className="bg-gray-200 text-gray-600 hover:bg-gray-200">Deleted</Badge>
      ) : (
        <Badge
          className={
            c.is_active
              ? "bg-green-100 text-green-800 hover:bg-green-100"
              : "bg-red-100 text-red-800 hover:bg-red-100"
          }
        >
          {c.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
  },
  // {
  //   header: "Active",
  //   render: (c) => (
  //     <Switch
  //       checked={c.is_active}
  //       onCheckedChange={() => onToggle(c)}
  //     />
  //   ),
  // },
  {
    header: "Published",
    render: (c) => (
      <span className="text-sm text-muted-foreground whitespace-nowrap">
        {c.published_at ? formatDate(c.published_at) : "—"}
      </span>
    ),
  },
  {
    header: "Created",
    render: (c) => (
      <span className="text-sm text-muted-foreground whitespace-nowrap">
        {formatDate(c.created_at)}
      </span>
    ),
  },
  {
    header: "Actions",
    className: "text-right",
    render: (c) => (
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(c.id)} className="gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              View
            </DropdownMenuItem>
            {c.deleted_at ? (
              <DropdownMenuItem
                onClick={() => onRestore(c)}
                className="gap-2 text-green-600 focus:text-green-600"
              >
                <RotateCcw className="h-4 w-4" />
                Restore
              </DropdownMenuItem>
            ) : (
              <>
                <DropdownMenuItem onClick={() => onEdit(c.id)} className="gap-2">
                  <Pencil className="h-4 w-4 text-muted-foreground" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(c)}
                  className="gap-2 text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
];
// ──────────────────────────────────────────────────────────────────────────────

// ─── Main Component ────────────────────────────────────────────────────────────
function ContentCmsListing() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // ── Filters
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [showInNavFilter, setShowInNavFilter] = useState("All");
  const [perPage, setPerPage] = useState("20");
  const [page, setPage] = useState(1);

  // ── Modal state
  const [deleteItem, setDeleteItem] = useState<ContentItem | null>(null);
  const [restoreItem, setRestoreItem] = useState<ContentItem | null>(null);
  const [toggleItem, setToggleItem] = useState<ContentItem | null>(null);

  const queryKey = [
    "content-cms",
    { page, perPage, typeFilter, showInNavFilter, search: appliedSearch },
  ] as const;

  // ── Fetch list
  const { data, isFetching } = useQuery({
    queryKey,
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), per_page: perPage });
      if (typeFilter !== "All") params.append("type", typeFilter);
      if (showInNavFilter !== "All") params.append("show_in_nav", showInNavFilter);
      if (appliedSearch.trim()) params.append("search", appliedSearch.trim());
      return makeApiRequest<ContentApiResponse>(`${apiUrl.getAllContent}?${params.toString()}`);
    },
  });

  const contents: ContentItem[] = data?.data?.data ?? [];
  const meta: PaginationMeta = {
    current_page: data?.data?.current_page ?? 1,
    last_page:    data?.data?.last_page ?? 1,
    total:        data?.data?.total ?? 0,
    from:         data?.data?.from ?? 0,
    to:           data?.data?.to ?? 0,
    per_page:     data?.data?.per_page ?? 20,
  };

  // ── Toggle status mutation
  const newStatus = !toggleItem?.is_active;
  const { mutate: doToggleStatus, isPending: isToggling } = useMutation({
    mutationFn: () =>
      makeApiRequest(`${apiUrl.toggleContentStatus}/${toggleItem?.id}/toggle-status`, {
        method: "PUT",
      }),
    onSuccess: () => {
      toast.success(newStatus ? "Content activated successfully" : "Content deactivated successfully");
      queryClient.invalidateQueries({ queryKey: ["content-cms"] });
      setToggleItem(null);
    },
    onError: () => {
      toast.error("Failed to update status");
      setToggleItem(null);
    },
  });

  // ── Restore mutation
  const { mutate: restoreContent, isPending: isRestoring } = useMutation({
    mutationFn: () =>
      makeApiRequest(`${apiUrl.restoreContent}/${restoreItem?.id}/restore`, {
        method: "PUT",
      }),
    onSuccess: () => {
      toast.success("Content restored successfully");
      queryClient.invalidateQueries({ queryKey: ["content-cms"] });
      setRestoreItem(null);
    },
    onError: () => {
      toast.error("Failed to restore content");
    },
  });

  // ── Delete mutation
  const { mutate: deleteContent, isPending: isDeleting } = useMutation({
    mutationFn: () =>
      makeApiRequest(`${apiUrl.deleteContent}/${deleteItem?.id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Content deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["content-cms"] });
      setDeleteItem(null);
    },
    onError: () => {
      toast.error("Failed to delete content");
    },
  });

  const handleSearch = () => {
    setAppliedSearch(search);
    setPage(1);
  };

  const handleTypeChange = (val: string) => { setTypeFilter(val); setPage(1); };
  const handleNavChange = (val: string) => { setShowInNavFilter(val); setPage(1); };
  const handlePerPageChange = (val: string) => { setPerPage(val); setPage(1); };

  return (
    <>
      {/* ── Toggle Status Modal ──────────────────────────────────────────────── */}
      <Modal
        isOpen={toggleItem !== null}
        onClose={() => setToggleItem(null)}
        title={toggleItem?.is_active ? "Deactivate Content" : "Activate Content"}
        width="max-w-md"
        footerBtnText={toggleItem?.is_active ? "Yes, Deactivate" : "Yes, Activate"}
        loading={isToggling}
        onConfirm={() => doToggleStatus()}
      >
        {toggleItem && (
          <div className="space-y-4">
            <div className={`flex items-center gap-3 rounded-lg p-3 ${toggleItem.is_active ? "bg-red-50 border border-red-200" : "bg-green-50 border border-green-200"}`}>
              <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${toggleItem.is_active ? "bg-red-500" : "bg-green-500"}`} />
              <p className={`text-sm font-medium ${toggleItem.is_active ? "text-red-800" : "text-green-800"}`}>
                {toggleItem.is_active
                  ? `"${toggleItem.title}" will be deactivated`
                  : `"${toggleItem.title}" will be activated`}
              </p>
            </div>

            <div className="rounded-lg border bg-muted/40 p-4 space-y-2.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Content Details</p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Slug</span>
                <span className="font-medium">/{toggleItem.slug}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Type</span>
                <span className="font-medium capitalize">{toggleItem.type}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Current Status</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${toggleItem.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                  {toggleItem.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              {toggleItem.is_active
                ? "Deactivating this content will hide it from the frontend. You can re-activate it at any time."
                : "Activating this content will make it visible on the frontend."}
            </p>
          </div>
        )}
      </Modal>

      {/* ── Restore Modal ────────────────────────────────────────────────────── */}
      <Modal
        isOpen={restoreItem !== null}
        onClose={() => setRestoreItem(null)}
        title="Restore Content"
        width="max-w-md"
        footerBtnText="Yes, Restore"
        loading={isRestoring}
        onConfirm={() => restoreContent()}
      >
        {restoreItem && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-lg p-3 bg-green-50 border border-green-200">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-green-500" />
              <p className="text-sm font-medium text-green-800">
                "{restoreItem.title}" will be restored
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              This content was soft-deleted. Restoring it will make it available again.
            </p>
          </div>
        )}
      </Modal>

      {/* ── Delete Modal ─────────────────────────────────────────────────────── */}
      <Modal
        isOpen={deleteItem !== null}
        onClose={() => setDeleteItem(null)}
        title="Delete Content"
        width="max-w-md"
        footerBtnText="Delete"
        loading={isDeleting}
        onConfirm={() => deleteContent()}
      >
        {deleteItem && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-lg p-3 bg-red-50 border border-red-200">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-red-500" />
              <p className="text-sm font-medium text-red-800">This action cannot be undone</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">"{deleteItem.title}"</span>?
              All associated data will be permanently removed.
            </p>
          </div>
        )}
      </Modal>

      {/* ── Main Content ─────────────────────────────────────────────────────── */}
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Content CMS</h1>
            <p className="text-muted-foreground">Manage all CMS content pages and sections</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileText className="h-5 w-5" />
              <span className="text-sm font-medium">{meta.total} total</span>
            </div>
            <Button onClick={() => navigate("/content-cms/add")}>
              <Plus className="mr-2 h-4 w-4" />
              Add Content
            </Button>
          </div>
        </div>

        {/* Table Card */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Content Management</CardTitle>
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
                  placeholder="Search by title or slug..."
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
                    {typeFilter === "All" ? "All Types" : capitalize(typeFilter)}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {CONTENT_TYPES.map((t) => (
                    <DropdownMenuItem key={t} onClick={() => handleTypeChange(t)}>
                      {t === "All" ? "All Types" : capitalize(t)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    {showInNavFilter === "All"
                      ? "Show in Nav: All"
                      : `Show in Nav: ${showInNavFilter === "true" ? "Yes" : "No"}`}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {SHOW_IN_NAV_OPTIONS.map((o) => (
                    <DropdownMenuItem key={o} onClick={() => handleNavChange(o)}>
                      {o === "All" ? "All" : o === "true" ? "Yes" : "No"}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>

          <CardContent>
            <DataTable
              columns={buildColumns(
                (id) => navigate(`/content-cms/${id}`),
                (id) => navigate(`/content-cms/${id}/edit`),
                (item) => setDeleteItem(item),
                (item) => setRestoreItem(item),
                (item) => setToggleItem(item),
              )}
              data={contents}
              loading={isFetching}
              rowKey={(c) => c.id}
              emptyMessage="No content found."
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

export default ContentCmsListing;
