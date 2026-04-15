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
  Code2,
  Eye,
  FileText,
  Globe,
  Image,
  MessageSquare,
  Pencil,
  Search,
  Star,
  Tag,
  ToggleRight,
  Twitter,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface BlogCategory {
  id: number;
  name: string;
  slug: string;
  color: string | null;
}

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  blog_category_id: number;
  excerpt: string | null;
  content: string;
  featured_image: string | null;
  gallery: string[];
  tags: string[];
  status: string;
  published_at: string | null;
  is_featured: boolean;
  allow_comments: boolean;
  read_time: number;
  view_count: number;
  meta_title: string | null;
  meta_description: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  twitter_title: string | null;
  twitter_description: string | null;
  twitter_image: string | null;
  canonical_url: string | null;
  no_index: boolean;
  schema_markup: object | null;
  category: BlogCategory | null;
  created_at: string;
  updated_at: string;
}

interface ApiResponse {
  success: boolean;
  data: BlogPost;
}

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
      <div className="flex items-center gap-2 w-44 flex-shrink-0 text-sm text-muted-foreground">
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
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
              <CardContent className="space-y-3">
                {Array.from({ length: 5 }).map((_, j) => (
                  <div key={j} className="flex gap-4">
                    <Skeleton className="h-4 w-28 flex-shrink-0" />
                    <Skeleton className="h-4 flex-1" />
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
export default function ViewBlogPost() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery<ApiResponse>({
    queryKey: ["blog-post-detail", id],
    queryFn: () =>
      makeApiRequest<ApiResponse>(`${apiUrl.getBlogPostById}/${id}`),
    enabled: !!id,
  });

  const post = data?.data;

  if (isLoading) return <PageSkeleton />;

  if (isError || !post) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-destructive">
        <AlertCircle className="w-10 h-10" />
        <p className="text-sm font-medium">Failed to load blog post</p>
        <Button variant="outline" onClick={() => navigate("/blog/manage-blog")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Go back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 bg-gray-50 min-h-screen">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/blog/manage-blog")}
            className="rounded-full"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{post.title}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Post #{post.id} · /{post.slug}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={statusBadge(post.status)}>
            {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
          </Badge>
          {post.is_featured && (
            <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 gap-1">
              <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
              Featured
            </Badge>
          )}
          <Button
            size="sm"
            onClick={() => navigate(`/blog/manage-blog/${post.id}/edit`)}
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
              <InfoRow label="Title" icon={FileText}>{post.title}</InfoRow>
              <InfoRow label="Slug" icon={Tag}>
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                  /{post.slug}
                </code>
              </InfoRow>
              <InfoRow label="Category" icon={FileText}>
                {post.category ? (
                  <div className="flex items-center gap-2">
                    {post.category.color && (
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: post.category.color }}
                      />
                    )}
                    {post.category.name}
                  </div>
                ) : null}
              </InfoRow>
              <InfoRow label="Excerpt" icon={FileText}>{post.excerpt}</InfoRow>
              <InfoRow label="Featured Image" icon={Image}>
                {post.featured_image ? (
                  <span className="text-xs text-blue-600 break-all">{post.featured_image}</span>
                ) : null}
              </InfoRow>

              {/* Tags */}
              {post.tags?.length > 0 && (
                <InfoRow label="Tags" icon={Tag}>
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </InfoRow>
              )}

              {/* Gallery */}
              {post.gallery?.length > 0 && (
                <InfoRow label="Gallery" icon={Image}>
                  <div className="flex flex-col gap-1">
                    {post.gallery.map((url) => (
                      <span key={url} className="text-xs text-blue-600 break-all">{url}</span>
                    ))}
                  </div>
                </InfoRow>
              )}
            </CardContent>
          </Card>

          {/* Content */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Code2 className="w-4 h-4" />
                Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="prose prose-sm max-w-none text-sm leading-relaxed border rounded-lg p-4 bg-white"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Search className="w-4 h-4" />
                SEO & Meta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <InfoRow label="Meta Title" icon={Search}>{post.meta_title}</InfoRow>
              <InfoRow label="Meta Desc" icon={Search}>{post.meta_description}</InfoRow>
              <InfoRow label="Canonical URL" icon={Globe}>
                {post.canonical_url ? (
                  <span className="text-xs text-blue-600 break-all">{post.canonical_url}</span>
                ) : null}
              </InfoRow>
              <InfoRow label="No Index" icon={Search}>
                <Badge className={post.no_index ? "bg-red-100 text-red-800 hover:bg-red-100" : "bg-green-100 text-green-800 hover:bg-green-100"}>
                  {post.no_index ? "No Index" : "Indexable"}
                </Badge>
              </InfoRow>
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
              <InfoRow label="OG Title" icon={Globe}>{post.og_title}</InfoRow>
              <InfoRow label="OG Description" icon={Globe}>{post.og_description}</InfoRow>
              <InfoRow label="OG Image" icon={Image}>
                {post.og_image ? (
                  <span className="text-xs text-blue-600 break-all">{post.og_image}</span>
                ) : null}
              </InfoRow>
            </CardContent>
          </Card>

          {/* Twitter */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Twitter className="w-4 h-4" />
                Twitter Card
              </CardTitle>
            </CardHeader>
            <CardContent>
              <InfoRow label="Twitter Title" icon={Twitter}>{post.twitter_title}</InfoRow>
              <InfoRow label="Twitter Desc" icon={Twitter}>{post.twitter_description}</InfoRow>
              <InfoRow label="Twitter Image" icon={Image}>
                {post.twitter_image ? (
                  <span className="text-xs text-blue-600 break-all">{post.twitter_image}</span>
                ) : null}
              </InfoRow>
            </CardContent>
          </Card>

          {/* Schema */}
          {post.schema_markup && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Code2 className="w-4 h-4" />
                  Schema Markup
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted rounded-lg p-4 overflow-auto font-mono leading-relaxed">
                  {JSON.stringify(post.schema_markup, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
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
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge className={statusBadge(post.status)}>
                  {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Star className="w-3.5 h-3.5" /> Featured
                </span>
                <Badge className={post.is_featured ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" : "bg-gray-100 text-gray-600 hover:bg-gray-100"}>
                  {post.is_featured ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5" /> Comments
                </span>
                <Badge className={post.allow_comments ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-red-100 text-red-800 hover:bg-red-100"}>
                  {post.allow_comments ? "Allowed" : "Disabled"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Views</span>
                <span className="text-sm font-semibold">{post.view_count}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Read Time</span>
                <span className="text-sm font-semibold">{post.read_time} min</span>
              </div>
            </CardContent>
          </Card>

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
                <span className="text-sm text-muted-foreground">Published</span>
                <span className="text-xs text-muted-foreground">
                  {post.published_at ? formatDate(post.published_at) : "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Created</span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(post.created_at)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Updated</span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(post.updated_at)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
