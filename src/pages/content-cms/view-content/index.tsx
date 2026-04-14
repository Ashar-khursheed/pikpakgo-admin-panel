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
  FileText,
  Globe,
  Hash,
  Image,
  Layers,
  Navigation,
  Pencil,
  Search,
  ToggleRight,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface Section {
  type: string;
  html: string;
}

interface ContentDetail {
  id: number;
  slug: string;
  parent_slug: string | null;
  sort_order: number;
  show_in_nav: boolean;
  nav_label: string | null;
  nav_icon: string | null;
  title: string;
  content: { html: string };
  type: string;
  template: string;
  featured_image: string | null;
  sections: Section[];
  meta_title: string | null;
  meta_description: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  canonical_url: string | null;
  no_index: boolean;
  schema_markup: object | null;
  is_active: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface ContentDetailApiResponse {
  success: boolean;
  data: ContentDetail;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
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
      <div className="text-sm font-medium flex-1 min-w-0">{children ?? <span className="text-muted-foreground font-normal">—</span>}</div>
    </div>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────
function ContentDetailSkeleton() {
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
          {Array.from({ length: 3 }).map((_, i) => (
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
export default function ViewContent() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery<ContentDetailApiResponse>({
    queryKey: ["content-detail", id],
    queryFn: () =>
      makeApiRequest<ContentDetailApiResponse>(`${apiUrl.getContentById}/${id}`),
    enabled: !!id,
  });

  const content = data?.data;

  if (isLoading) return <ContentDetailSkeleton />;

  if (isError || !content) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-destructive">
        <AlertCircle className="w-10 h-10" />
        <p className="text-sm font-medium">Failed to load content</p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Go back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 bg-gray-50 min-h-screen">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/content-cms")}
            className="rounded-full"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{content.title}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Content #{content.id} · /{content.slug}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={typeConfig[content.type] ?? "bg-gray-100 text-gray-800 hover:bg-gray-100"}>
            {capitalize(content.type)}
          </Badge>
          <Badge
            className={
              content.is_active
                ? "bg-green-100 text-green-800 hover:bg-green-100"
                : "bg-red-100 text-red-800 hover:bg-red-100"
            }
          >
            {content.is_active ? "Active" : "Inactive"}
          </Badge>
          <Button
            size="sm"
            onClick={() => navigate(`/content-cms/${content.id}/edit`)}
            className="gap-1.5 ml-2"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </Button>
        </div>
      </div>

      {/* ── Featured Image ───────────────────────────────────────────────────── */}
      {content.featured_image && (
        <Card className="overflow-hidden">
          <img
            src={content.featured_image}
            alt={content.title}
            className="w-full h-48 object-cover"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Left Column ───────────────────────────────────────────────────── */}
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
              <InfoRow label="Title" icon={FileText}>{content.title}</InfoRow>
              <InfoRow label="Slug" icon={Hash}>
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded">/{content.slug}</code>
              </InfoRow>
              {content.parent_slug && (
                <InfoRow label="Parent Slug" icon={Hash}>
                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded">/{content.parent_slug}</code>
                </InfoRow>
              )}
              <InfoRow label="Type" icon={FileText}>
                <Badge className={typeConfig[content.type] ?? "bg-gray-100 text-gray-800 hover:bg-gray-100"}>
                  {capitalize(content.type)}
                </Badge>
              </InfoRow>
              <InfoRow label="Template" icon={Layers}>
                <span className="capitalize">{content.template}</span>
              </InfoRow>
              <InfoRow label="Sort Order" icon={Hash}>
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-muted text-sm font-semibold">
                  {content.sort_order}
                </span>
              </InfoRow>
            </CardContent>
          </Card>

          {/* Main Content HTML */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Code2 className="w-4 h-4" />
                Main Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border bg-white overflow-hidden">
                {/* Rendered preview */}
                <div className="p-4 border-b">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Preview</p>
                  <div
                    className="prose prose-sm max-w-none text-sm"
                    dangerouslySetInnerHTML={{ __html: content.content?.html ?? "" }}
                  />
                </div>
                {/* Raw HTML */}
                <div className="p-4 bg-muted/30">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">HTML Source</p>
                  <pre className="text-xs text-muted-foreground overflow-x-auto whitespace-pre-wrap break-all font-mono">
                    {content.content?.html ?? "—"}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sections */}
          {content.sections && content.sections.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  Sections ({content.sections.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {content.sections.map((sec, i) => (
                  <div key={i} className="rounded-lg border overflow-hidden bg-white">
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/40 border-b">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Section {i + 1}
                      </span>
                      <Badge className="bg-sky-100 text-sky-800 hover:bg-sky-100 text-xs">
                        {sec.type}
                      </Badge>
                    </div>
                    {/* Preview */}
                    <div className="p-4 border-b">
                      <p className="text-xs text-muted-foreground mb-2">Preview</p>
                      <div
                        className="prose prose-sm max-w-none text-sm"
                        dangerouslySetInnerHTML={{ __html: sec.html }}
                      />
                    </div>
                    {/* Source */}
                    <div className="p-4 bg-muted/20">
                      <p className="text-xs text-muted-foreground mb-1">HTML Source</p>
                      <pre className="text-xs text-muted-foreground overflow-x-auto whitespace-pre-wrap break-all font-mono">
                        {sec.html}
                      </pre>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* SEO */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Search className="w-4 h-4" />
                SEO & Meta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <InfoRow label="Meta Title" icon={Search}>{content.meta_title}</InfoRow>
              <InfoRow label="Meta Desc" icon={Search}>{content.meta_description}</InfoRow>
              <InfoRow label="Canonical" icon={Globe}>
                {content.canonical_url ? (
                  <a
                    href={content.canonical_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    {content.canonical_url}
                  </a>
                ) : null}
              </InfoRow>
              <InfoRow label="No Index" icon={Search}>
                {content.no_index ? (
                  <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Yes</Badge>
                ) : (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">No</Badge>
                )}
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
              <InfoRow label="OG Title" icon={Globe}>{content.og_title}</InfoRow>
              <InfoRow label="OG Description" icon={Globe}>{content.og_description}</InfoRow>
              <InfoRow label="OG Image" icon={Image}>
                {content.og_image ? (
                  <a
                    href={content.og_image}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all text-xs"
                  >
                    {content.og_image}
                  </a>
                ) : null}
              </InfoRow>
            </CardContent>
          </Card>

          {/* Schema Markup */}
          {content.schema_markup && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Code2 className="w-4 h-4" />
                  Schema Markup (JSON-LD)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted/40 rounded-lg p-4 overflow-x-auto font-mono whitespace-pre-wrap break-all">
                  {JSON.stringify(content.schema_markup, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>

        {/* ── Right Column ──────────────────────────────────────────────────── */}
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
                <span className="text-sm text-muted-foreground">Active</span>
                <Badge
                  className={
                    content.is_active
                      ? "bg-green-100 text-green-800 hover:bg-green-100"
                      : "bg-red-100 text-red-800 hover:bg-red-100"
                  }
                >
                  {content.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Published At</span>
                <span className="text-xs text-muted-foreground">
                  {content.published_at ? formatDate(content.published_at) : "—"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Navigation className="w-4 h-4" />
                Navigation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Show in Nav</span>
                {content.show_in_nav ? (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Yes</Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">No</Badge>
                )}
              </div>
              {content.nav_label && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Nav Label</span>
                  <span className="text-sm font-medium">{content.nav_label}</span>
                </div>
              )}
              {content.nav_icon && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Nav Icon</span>
                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{content.nav_icon}</code>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Sort Order</span>
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-muted text-sm font-semibold">
                  {content.sort_order}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Featured Image */}
          {content.featured_image && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  Featured Image
                </CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={content.featured_image}
                  alt="Featured"
                  className="w-full h-32 object-cover rounded-lg border"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
                <p className="text-xs text-muted-foreground mt-2 break-all">{content.featured_image}</p>
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
                <span className="text-xs text-muted-foreground">{formatDate(content.created_at)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Updated</span>
                <span className="text-xs text-muted-foreground">{formatDate(content.updated_at)}</span>
              </div>
              {content.deleted_at && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Deleted</span>
                  <span className="text-xs text-red-500">{formatDate(content.deleted_at)}</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
