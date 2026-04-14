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
import { DataTable, Column } from "@/components/data-table";
import makeApiRequest from "@/services/axios";
import { formatDate } from "@/utils/utils";
import { apiUrl } from "@/services/api-end-point";
import { Modal } from "@/components/ui/modal";
import toast from "react-hot-toast";
import {
  ChevronDown,
  Eye,
  FolderOpen,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  featured_image: string | null;
  color: string | null;
  sort_order: number;
  is_active: boolean;
  meta_title: string | null;
  meta_description: string | null;
  og_image: string | null;
  created_at: string;
  updated_at: string;
  posts_count: number;
}

interface BlogCategoryApiResponse {
  success: boolean;
  data: BlogCategory[];
}

// ─── Constants ─────────────────────────────────────────────────────────────────
const STATUS_OPTIONS = ["All", "Active", "Inactive"];

// ─── Column definitions ────────────────────────────────────────────────────────
const buildColumns = (
  onView: (id: number) => void,
  onEdit: (id: number) => void,
  onDelete: (item: BlogCategory) => void,
  onToggle: (item: BlogCategory) => void,
): Column<BlogCategory>[] => [
  {
    header: "Category",
    render: (c) => (
      <div className="flex items-center gap-3">
        {c.color && (
          <span
            className="w-3 h-3 rounded-full flex-shrink-0"
            style={{ backgroundColor: c.color }}
          />
        )}
        <div>
          <div className="font-medium text-sm">{c.name}</div>
          <div className="text-xs text-muted-foreground mt-0.5">/{c.slug}</div>
        </div>
      </div>
    ),
  },
  {
    header: "Description",
    render: (c) => (
      <span className="text-sm text-muted-foreground line-clamp-1 max-w-xs">
        {c.description ?? "—"}
      </span>
    ),
  },
  {
    header: "Posts",
    render: (c) => (
      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-muted text-sm font-semibold">
        {c.posts_count}
      </span>
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
    render: (c) => (
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
            <DropdownMenuItem onClick={() => onEdit(c.id)} className="gap-2">
              <Pencil className="h-4 w-4 text-muted-foreground" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onToggle(c)}
              className="gap-2"
            >
              <span
                className={`w-2 h-2 rounded-full flex-shrink-0 ${c.is_active ? "bg-red-500" : "bg-green-500"}`}
              />
              {c.is_active ? "Deactivate" : "Activate"}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onDelete(c)}
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

// ─── Main Component ────────────────────────────────────────────────────────────
function ManageBlogCategory() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // ── Filters
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // ── Modal state
  const [deleteItem, setDeleteItem] = useState<BlogCategory | null>(null);
  const [toggleItem, setToggleItem] = useState<BlogCategory | null>(null);

  const queryKey = [
    "blog-categories",
    { statusFilter, search: appliedSearch },
  ] as const;

  // ── Fetch list
  const { data, isFetching } = useQuery({
    queryKey,
    queryFn: () => {
      const params = new URLSearchParams();
      if (statusFilter === "Active") params.append("is_active", "true");
      if (statusFilter === "Inactive") params.append("is_active", "false");
      if (appliedSearch.trim()) params.append("search", appliedSearch.trim());
      const qs = params.toString();
      return makeApiRequest<BlogCategoryApiResponse>(
        `${apiUrl.getAllBlogCategories}${qs ? `?${qs}` : ""}`,
      );
    },
  });

  const categories: BlogCategory[] = data?.data ?? [];

  // ── Toggle status mutation
  const newStatus = !toggleItem?.is_active;
  const { mutate: doToggleStatus, isPending: isToggling } = useMutation({
    mutationFn: () =>
      makeApiRequest(
        `${apiUrl.toggleBlogCategoryStatus}/${toggleItem?.id}/toggle-status`,
        { method: "PUT" },
      ),
    onSuccess: () => {
      toast.success(
        newStatus
          ? "Category activated successfully"
          : "Category deactivated successfully",
      );
      queryClient.invalidateQueries({ queryKey: ["blog-categories"] });
      setToggleItem(null);
    },
    onError: () => {
      toast.error("Failed to update status");
      setToggleItem(null);
    },
  });

  // ── Delete mutation
  const { mutate: deleteCategory, isPending: isDeleting } = useMutation({
    mutationFn: () =>
      makeApiRequest(`${apiUrl.deleteBlogCategory}/${deleteItem?.id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      toast.success("Category deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["blog-categories"] });
      setDeleteItem(null);
    },
    onError: () => {
      toast.error("Failed to delete category");
    },
  });

  const handleSearch = () => {
    setAppliedSearch(search);
  };

  const handleStatusChange = (val: string) => setStatusFilter(val);

  return (
    <>
      {/* ── Toggle Status Modal ──────────────────────────────────────────────── */}
      <Modal
        isOpen={toggleItem !== null}
        onClose={() => setToggleItem(null)}
        title={toggleItem?.is_active ? "Deactivate Category" : "Activate Category"}
        width="max-w-md"
        footerBtnText={toggleItem?.is_active ? "Yes, Deactivate" : "Yes, Activate"}
        loading={isToggling}
        onConfirm={() => doToggleStatus()}
      >
        {toggleItem && (
          <div className="space-y-4">
            <div
              className={`flex items-center gap-3 rounded-lg p-3 ${
                toggleItem.is_active
                  ? "bg-red-50 border border-red-200"
                  : "bg-green-50 border border-green-200"
              }`}
            >
              <div
                className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                  toggleItem.is_active ? "bg-red-500" : "bg-green-500"
                }`}
              />
              <p
                className={`text-sm font-medium ${
                  toggleItem.is_active ? "text-red-800" : "text-green-800"
                }`}
              >
                {toggleItem.is_active
                  ? `"${toggleItem.name}" will be deactivated`
                  : `"${toggleItem.name}" will be activated`}
              </p>
            </div>

            <div className="rounded-lg border bg-muted/40 p-4 space-y-2.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Category Details
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Slug</span>
                <span className="font-medium">/{toggleItem.slug}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Posts</span>
                <span className="font-medium">{toggleItem.posts_count}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Current Status</span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    toggleItem.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {toggleItem.is_active ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              {toggleItem.is_active
                ? "Deactivating this category will hide it from the frontend. You can re-activate it at any time."
                : "Activating this category will make it visible on the frontend."}
            </p>
          </div>
        )}
      </Modal>

      {/* ── Delete Modal ─────────────────────────────────────────────────────── */}
      <Modal
        isOpen={deleteItem !== null}
        onClose={() => setDeleteItem(null)}
        title="Delete Category"
        width="max-w-md"
        footerBtnText="Delete"
        loading={isDeleting}
        onConfirm={() => deleteCategory()}
      >
        {deleteItem && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-lg p-3 bg-red-50 border border-red-200">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-red-500" />
              <p className="text-sm font-medium text-red-800">
                This action cannot be undone
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">
                "{deleteItem.name}"
              </span>
              ? All associated data will be permanently removed.
            </p>
          </div>
        )}
      </Modal>

      {/* ── Main Content ─────────────────────────────────────────────────────── */}
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Blog Categories
            </h1>
            <p className="text-muted-foreground">
              Manage all blog categories
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <FolderOpen className="h-5 w-5" />
              <span className="text-sm font-medium">
                {categories.length} total
              </span>
            </div>
            <Button onClick={() => navigate("/blog/manage-blog-category/add")}>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </div>
        </div>

        {/* Table Card */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle>Categories</CardTitle>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 pt-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Search by name or slug..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-64"
                />
                <Button
                  variant="outline"
                  onClick={handleSearch}
                  disabled={isFetching}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    {statusFilter === "All" ? "All Status" : statusFilter}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {STATUS_OPTIONS.map((s) => (
                    <DropdownMenuItem
                      key={s}
                      onClick={() => handleStatusChange(s)}
                    >
                      {s === "All" ? "All Status" : s}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>

          <CardContent>
            <DataTable
              columns={buildColumns(
                (id) => navigate(`/blog/manage-blog-category/${id}`),
                (id) => navigate(`/blog/manage-blog-category/${id}/edit`),
                (item) => setDeleteItem(item),
                (item) => setToggleItem(item),
              )}
              data={categories}
              loading={isFetching}
              rowKey={(c) => c.id}
              emptyMessage="No blog categories found."
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default ManageBlogCategory;
