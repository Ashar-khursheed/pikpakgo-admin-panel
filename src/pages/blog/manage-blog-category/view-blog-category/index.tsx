import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import makeApiRequest from "@/services/axios";
import { apiUrl } from "@/services/api-end-point";
import { formatDate } from "@/utils/utils";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  FileText,
  Globe,
  Hash,
  Image,
  Palette,
  Pencil,
  Search,
  ToggleRight,
  AlignLeft,
  Tag,
  BarChart2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

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

interface ApiResponse {
  success: boolean;
  data: BlogCategory;
}

// ─── InfoRow ───────────────────────────────────────────────────────────────────
function InfoRow({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 py-3 border-b last:border-0">
      <div className="flex items-center gap-2 w-40 flex-shrink-0 text-sm text-muted-foreground">
        <Icon className="h-3.5 w-3.5 flex-shrink-0" />
        {label}
      </div>
      <div className="text-sm font-medium flex-1 min-w-0">
        {children ?? <span className="text-muted-foreground font-normal">—</span>}
      </div>
    </div>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────
function PageSkeleton() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-9 w-9 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-52" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
              <CardContent className="space-y-3">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="space-y-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-5 w-24" /></CardHeader>
              <CardContent className="space-y-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function ViewBlogCategory() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery<ApiResponse>({
    queryKey: ["blog-category-detail", id],
    queryFn: () =>
      makeApiRequest<ApiResponse>(`${apiUrl.getBlogCategoryById}/${id}`),
    enabled: !!id,
  });

  const category = data?.data;

  if (isLoading) return <PageSkeleton />;

  if (isError || !category) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-destructive">
        <AlertCircle className="w-10 h-10" />
        <p className="text-sm font-medium">Failed to load category</p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Go back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 bg-gray-50 min-h-screen">

      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/blog/manage-blog-category")}
            className="rounded-full"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{category.name}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Category #{category.id} · /{category.slug}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            className={
              category.is_active
                ? "bg-green-100 text-green-800 hover:bg-green-100"
                : "bg-red-100 text-red-800 hover:bg-red-100"
            }
          >
            {category.is_active ? "Active" : "Inactive"}
          </Badge>
          <Button
            size="sm"
            onClick={() => navigate(`/blog/manage-blog-category/${category.id}/edit`)}
            className="gap-1.5 ml-2"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Left Column ─────────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Basic Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <InfoRow label="Name" icon={FileText}>{category.name}</InfoRow>
              <InfoRow label="Slug" icon={Tag}>
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                  /{category.slug}
                </code>
              </InfoRow>
              <InfoRow label="Description" icon={AlignLeft}>
                {category.description ?? null}
              </InfoRow>
              <InfoRow label="Sort Order" icon={Hash}>
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-muted text-sm font-semibold">
                  {category.sort_order}
                </span>
              </InfoRow>
              <InfoRow label="Posts" icon={BarChart2}>
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-muted text-sm font-semibold">
                  {category.posts_count}
                </span>
              </InfoRow>
              <InfoRow label="Color" icon={Palette}>
                {category.color ? (
                  <div className="flex items-center gap-2">
                    <span
                      className="w-5 h-5 rounded-full border flex-shrink-0"
                      style={{ backgroundColor: category.color }}
                    />
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                      {category.color}
                    </code>
                  </div>
                ) : null}
              </InfoRow>
            </CardContent>
          </Card>

          {/* SEO & Meta */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Search className="w-4 h-4" />
                SEO & Meta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <InfoRow label="Meta Title" icon={Search}>{category.meta_title}</InfoRow>
              <InfoRow label="Meta Desc" icon={Search}>{category.meta_description}</InfoRow>
            </CardContent>
          </Card>

          {/* Open Graph */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Open Graph
              </CardTitle>
            </CardHeader>
            <CardContent>
              <InfoRow label="OG Image" icon={Image}>
                {category.og_image ? (
                  <span className="text-xs text-blue-600 break-all">
                    {category.og_image}
                  </span>
                ) : null}
              </InfoRow>
            </CardContent>
          </Card>
        </div>

        {/* ── Right Column ────────────────────────────────────────────────────── */}
        <div className="space-y-5">

          {/* Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <ToggleRight className="w-4 h-4" />
                Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active</span>
                <Badge
                  className={
                    category.is_active
                      ? "bg-green-100 text-green-800 hover:bg-green-100"
                      : "bg-red-100 text-red-800 hover:bg-red-100"
                  }
                >
                  {category.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Featured Image */}
          {category.featured_image && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  Featured Image
                </CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={category.featured_image}
                  alt={category.name}
                  className="w-full h-32 object-cover rounded-lg border"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                  }}
                />
                <p className="text-xs text-muted-foreground mt-2 break-all">
                  {category.featured_image}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Color Preview */}
          {category.color && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Color
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="w-full h-16 rounded-lg border"
                  style={{ backgroundColor: category.color }}
                />
                <p className="text-xs text-center text-muted-foreground mt-2 font-mono">
                  {category.color}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Timestamps */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Timestamps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Created</span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(category.created_at)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Updated</span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(category.updated_at)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
