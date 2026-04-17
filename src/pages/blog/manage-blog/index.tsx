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
  FileText,
  MoreHorizontal,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Star,
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
  color: string | null;
}

interface BlogPost {
  id: number;
  blog_category_id: number;
  author_id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  status: string;
  published_at: string | null;
  read_time: number;
  view_count: number;
  is_featured: boolean;
  allow_comments: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  category: BlogCategory | null;
  author: { id: number; first_name: string; last_name: string } | null;
}

interface PaginatedResponse {
  success: boolean;
  data: {
    current_page: number;
    data: BlogPost[];
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
  };
}

interface BlogCategoryApiResponse {
  success: boolean;
  data: BlogCategory[];
}

// ─── Constants ─────────────────────────────────────────────────────────────────
const STATUS_OPTIONS = ["--", "draft", "published", "scheduled", "archived"];
const FEATURED_OPTIONS = ["--", "true", "false"];
const PER_PAGE = 20;

// ─── Helpers ───────────────────────────────────────────────────────────────────
function statusBadge(status: string) {
  const map: Record<string, string> = {
    published: "bg-green-100 text-green-800 hover:bg-green-100",
    draft: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    scheduled: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    archived: "bg-gray-100 text-gray-600 hover:bg-gray-100",
  };
  return map[status] ?? "bg-gray-100 text-gray-600 hover:bg-gray-100";
}

// ─── Column definitions ────────────────────────────────────────────────────────
const buildColumns = (
  onView: (id: number) => void,
  onEdit: (id: number) => void,
  onDelete: (item: BlogPost) => void,
  onRestore: (item: BlogPost) => void,
  onToggleFeatured: (item: BlogPost) => void,
  onChangeStatus: (item: BlogPost) => void,
): Column<BlogPost>[] => [
  {
    header: "Title",
    render: (p) => (
      <div className="max-w-xs">
        <div className="font-medium text-sm line-clamp-1">{p.title}</div>
        <div className="text-xs text-muted-foreground mt-0.5">/{p.slug}</div>
      </div>
    ),
  },
  {
    header: "Category",
    render: (p) =>
      p.category ? (
        <div className="flex items-center gap-2">
          {p.category.color && (
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: p.category.color }}
            />
          )}
          <span className="text-sm">{p.category.name}</span>
        </div>
      ) : (
        <span className="text-muted-foreground text-sm">—</span>
      ),
  },
  {
    header: "Author",
    render: (p) =>
      p.author ? (
        <span className="text-sm">
          {p.author.first_name} {p.author.last_name}
        </span>
      ) : (
        <span className="text-muted-foreground text-sm">—</span>
      ),
  },
  {
    header: "Status",
    render: (p) =>
      p.deleted_at ? (
        <Badge className="bg-gray-200 text-gray-600 hover:bg-gray-200">Deleted</Badge>
      ) : (
        <Badge className={statusBadge(p.status)}>
          {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
        </Badge>
      ),
  },
  {
    header: "Featured",
    render: (p) =>
      p.is_featured ? (
        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
      ) : (
        <Star className="h-4 w-4 text-muted-foreground" />
      ),
  },
  {
    header: "Views",
    render: (p) => (
      <span className="text-sm text-muted-foreground">{p.view_count}</span>
    ),
  },
  {
    header: "Published",
    render: (p) => (
      <span className="text-sm text-muted-foreground whitespace-nowrap">
        {p.published_at ? formatDate(p.published_at) : "—"}
      </span>
    ),
  },
  {
    header: "Created",
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onView(p.id)} className="gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              View
            </DropdownMenuItem>
            {p.deleted_at ? (
              <DropdownMenuItem
                onClick={() => onRestore(p)}
                className="gap-2 text-green-600 focus:text-green-600"
              >
                <RotateCcw className="h-4 w-4" />
                Restore
              </DropdownMenuItem>
            ) : (
              <>
                <DropdownMenuItem onClick={() => onEdit(p.id)} className="gap-2">
                  <Pencil className="h-4 w-4 text-muted-foreground" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onToggleFeatured(p)}
                  className="gap-2"
                >
                  <Star className="h-4 w-4 text-muted-foreground" />
                  {p.is_featured ? "Unfeature" : "Feature"}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onChangeStatus(p)}
                  className="gap-2"
                >
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Change Status
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDelete(p)}
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

// ─── Main Component ────────────────────────────────────────────────────────────
function ManageBlog() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // ── Filters
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("--");
  const [categoryFilter, setCategoryFilter] = useState<number | null>(null);
  const [featuredFilter, setFeaturedFilter] = useState("--");
  const [page, setPage] = useState(1);

  // ── Modal state
  const [deleteItem, setDeleteItem] = useState<BlogPost | null>(null);
  const [restoreItem, setRestoreItem] = useState<BlogPost | null>(null);
  const [featuredItem, setFeaturedItem] = useState<BlogPost | null>(null);
  const [statusItem, setStatusItem] = useState<BlogPost | null>(null);
  const [selectedStatus, setSelectedStatus] = useState("published");

  // ── Fetch categories for filter dropdown
  const { data: categoriesData } = useQuery({
    queryKey: ["blog-categories-filter"],
    queryFn: () =>
      makeApiRequest<BlogCategoryApiResponse>(apiUrl.getAllBlogCategories),
  });
  const categories = categoriesData?.data ?? [];

  // ── Build query key
  const queryKey = [
    "blog-posts",
    { statusFilter, categoryFilter, search: appliedSearch, featuredFilter, page },
  ] as const;

  // ── Fetch posts
  const { data, isFetching } = useQuery({
    queryKey,
    queryFn: () => {
      const params = new URLSearchParams();
      params.append("per_page", String(PER_PAGE));
      params.append("page", String(page));
      if (statusFilter !== "--") params.append("status", statusFilter);
      if (categoryFilter !== null)
        params.append("blog_category_id", String(categoryFilter));
      if (appliedSearch.trim()) params.append("search", appliedSearch.trim());
      if (featuredFilter !== "--") params.append("is_featured", featuredFilter);
      return makeApiRequest<PaginatedResponse>(
        `${apiUrl.getAllBlogPosts}?${params.toString()}`,
      );
    },
  });

  const posts: BlogPost[] = data?.data?.data ?? [];
  const totalPages = data?.data?.last_page ?? 1;
  const total = data?.data?.total ?? 0;

  // ── Delete mutation (soft delete)
  const { mutate: deletePost, isPending: isDeleting } = useMutation({
    mutationFn: () =>
      makeApiRequest(`${apiUrl.deleteBlogPost}/${deleteItem?.id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      toast.success("Blog post deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      setDeleteItem(null);
    },
    onError: () => {
      toast.error("Failed to delete blog post");
    },
  });

  // ── Restore mutation
  const { mutate: restorePost, isPending: isRestoring } = useMutation({
    mutationFn: () =>
      makeApiRequest(
        `${apiUrl.restoreBlogPost}/${restoreItem?.id}/restore`,
        { method: "PUT" },
      ),
    onSuccess: () => {
      toast.success("Blog post restored successfully");
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      setRestoreItem(null);
    },
    onError: () => {
      toast.error("Failed to restore blog post");
    },
  });

  // ── Toggle featured mutation
  const { mutate: toggleFeatured, isPending: isTogglingFeatured } = useMutation({
    mutationFn: () =>
      makeApiRequest(
        `${apiUrl.toggleBlogPostFeatured}/${featuredItem?.id}/toggle-featured`,
        { method: "PUT" },
      ),
    onSuccess: () => {
      toast.success(
        featuredItem?.is_featured
          ? "Post removed from featured"
          : "Post marked as featured",
      );
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      setFeaturedItem(null);
    },
    onError: () => {
      toast.error("Failed to update featured status");
    },
  });

  // ── Change status mutation
  const { mutate: changeStatus, isPending: isChangingStatus } = useMutation({
    mutationFn: () =>
      makeApiRequest(
        `${apiUrl.updateBlogPostStatus}/${statusItem?.id}/status`,
        {
          method: "PUT",
          data: {
            status: selectedStatus,
            published_at: new Date().toISOString(),
          },
        },
      ),
    onSuccess: () => {
      toast.success("Status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      setStatusItem(null);
    },
    onError: () => {
      toast.error("Failed to update status");
    },
  });

  const handleSearch = () => {
    setPage(1);
    setAppliedSearch(search);
  };

  const handleStatusChange = (val: string) => {
    setPage(1);
    setStatusFilter(val);
  };

  const handleCategoryChange = (val: number | null) => {
    setPage(1);
    setCategoryFilter(val);
  };

  const handleFeaturedChange = (val: string) => {
    setPage(1);
    setFeaturedFilter(val);
  };

  return (
    <>
      {/* ── Restore Modal ────────────────────────────────────────────────────── */}
      <Modal
        isOpen={restoreItem !== null}
        onClose={() => setRestoreItem(null)}
        title="Restore Blog Post"
        width="max-w-md"
        footerBtnText="Yes, Restore"
        loading={isRestoring}
        onConfirm={() => restorePost()}
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
              This post was soft-deleted. Restoring it will make it available again.
            </p>
          </div>
        )}
      </Modal>

      {/* ── Toggle Featured Modal ─────────────────────────────────────────────── */}
      <Modal
        isOpen={featuredItem !== null}
        onClose={() => setFeaturedItem(null)}
        title={featuredItem?.is_featured ? "Remove from Featured" : "Mark as Featured"}
        width="max-w-md"
        footerBtnText={featuredItem?.is_featured ? "Yes, Unfeature" : "Yes, Feature"}
        loading={isTogglingFeatured}
        onConfirm={() => toggleFeatured()}
      >
        {featuredItem && (
          <div className="space-y-3">
            <div
              className={`flex items-center gap-3 rounded-lg p-3 ${
                featuredItem.is_featured
                  ? "bg-yellow-50 border border-yellow-200"
                  : "bg-yellow-50 border border-yellow-200"
              }`}
            >
              <Star
                className={`h-4 w-4 flex-shrink-0 ${
                  featuredItem.is_featured
                    ? "text-yellow-500 fill-yellow-500"
                    : "text-yellow-500"
                }`}
              />
              <p className="text-sm font-medium text-yellow-800">
                {featuredItem.is_featured
                  ? `"${featuredItem.title}" will be removed from featured`
                  : `"${featuredItem.title}" will be marked as featured`}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              {featuredItem.is_featured
                ? "This post will no longer appear in the featured section."
                : "This post will appear in the featured section on the frontend."}
            </p>
          </div>
        )}
      </Modal>

      {/* ── Change Status Modal ───────────────────────────────────────────────── */}
      <Modal
        isOpen={statusItem !== null}
        onClose={() => setStatusItem(null)}
        title="Change Post Status"
        width="max-w-md"
        footerBtnText="Update Status"
        loading={isChangingStatus}
        onConfirm={() => changeStatus()}
      >
        {statusItem && (
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/40 p-4 space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Post Details
              </p>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Title</span>
                <span className="font-medium line-clamp-1 max-w-[200px]">
                  {statusItem.title}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Current Status</span>
                <Badge className={statusBadge(statusItem.status)}>
                  {statusItem.status.charAt(0).toUpperCase() +
                    statusItem.status.slice(1)}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">New Status</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {selectedStatus.charAt(0).toUpperCase() +
                      selectedStatus.slice(1)}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-full min-w-[200px]">
                  {["draft", "published", "scheduled", "archived"].map((s) => (
                    <DropdownMenuItem
                      key={s}
                      onClick={() => setSelectedStatus(s)}
                    >
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <p className="text-xs text-muted-foreground">
              Current date and time will be used as <strong>published_at</strong>.
            </p>
          </div>
        )}
      </Modal>

      {/* ── Delete Modal ─────────────────────────────────────────────────────── */}
      <Modal
        isOpen={deleteItem !== null}
        onClose={() => setDeleteItem(null)}
        title="Delete Blog Post"
        width="max-w-md"
        footerBtnText="Delete"
        loading={isDeleting}
        onConfirm={() => deletePost()}
      >
        {deleteItem && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-lg p-3 bg-red-50 border border-red-200">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 bg-red-500" />
              <p className="text-sm font-medium text-red-800">
                This will soft-delete the post (can be restored)
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">
                "{deleteItem.title}"
              </span>
              ? You can restore it later.
            </p>
          </div>
        )}
      </Modal>

      {/* ── Main Content ─────────────────────────────────────────────────────── */}
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Blog Posts</h1>
            <p className="text-muted-foreground">Manage all blog posts</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileText className="h-5 w-5" />
              <span className="text-sm font-medium">{total} total</span>
            </div>
            <Button onClick={() => navigate("/blog/manage-blog/add")}>
              <Plus className="mr-2 h-4 w-4" />
              Add Post
            </Button>
          </div>
        </div>

        {/* Table Card */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle>Posts</CardTitle>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 pt-2">
              {/* Search */}
              <div className="flex gap-2">
                <Input
                  placeholder="Search by title or slug..."
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

              {/* Status filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    {statusFilter === "--"
                      ? "All Status"
                      : statusFilter.charAt(0).toUpperCase() +
                        statusFilter.slice(1)}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {STATUS_OPTIONS.map((s) => (
                    <DropdownMenuItem
                      key={s}
                      onClick={() => handleStatusChange(s)}
                    >
                      {s === "--"
                        ? "All Status"
                        : s.charAt(0).toUpperCase() + s.slice(1)}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Category filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    {categoryFilter === null
                      ? "All Categories"
                      : (categories.find((c) => c.id === categoryFilter)
                          ?.name ?? "Category")}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="max-h-56 overflow-y-auto">
                  <DropdownMenuItem onClick={() => handleCategoryChange(null)}>
                    All Categories
                  </DropdownMenuItem>
                  {categories.map((c) => (
                    <DropdownMenuItem
                      key={c.id}
                      onClick={() => handleCategoryChange(c.id)}
                      className="gap-2"
                    >
                      {c.color && (
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: c.color }}
                        />
                      )}
                      {c.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Featured filter */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    {featuredFilter === "--"
                      ? "All Featured"
                      : featuredFilter === "true"
                      ? "Featured"
                      : "Not Featured"}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {FEATURED_OPTIONS.map((f) => (
                    <DropdownMenuItem
                      key={f}
                      onClick={() => handleFeaturedChange(f)}
                    >
                      {f === "--"
                        ? "All Featured"
                        : f === "true"
                        ? "Featured"
                        : "Not Featured"}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>

          <CardContent>
            <DataTable
              columns={buildColumns(
                (id) => navigate(`/blog/manage-blog/${id}`),
                (id) => navigate(`/blog/manage-blog/${id}/edit`),
                (item) => setDeleteItem(item),
                (item) => setRestoreItem(item),
                (item) => {
                  setFeaturedItem(item);
                },
                (item) => {
                  setSelectedStatus(item.status);
                  setStatusItem(item);
                },
              )}
              data={posts}
              loading={isFetching}
              rowKey={(p) => p.id}
              emptyMessage="No blog posts found."
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1 || isFetching}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || isFetching}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

export default ManageBlog;
