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
  Globe,
  Hash,
  Image,
  Search,
  Twitter,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface SeoDetail {
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

interface SeoDetailApiResponse {
  success: boolean;
  data: SeoDetail;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
const groupConfig: Record<string, string> = {
  Core:    "bg-blue-100 text-blue-800 hover:bg-blue-100",
  Search:  "bg-purple-100 text-purple-800 hover:bg-purple-100",
  Booking: "bg-orange-100 text-orange-800 hover:bg-orange-100",
  Account: "bg-sky-100 text-sky-800 hover:bg-sky-100",
  Blog:    "bg-green-100 text-green-800 hover:bg-green-100",
  Dynamic: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
};

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
function SeoDetailSkeleton() {
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
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-5 w-32" /></CardHeader>
              <CardContent className="space-y-3">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-48" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="space-y-5">
          {Array.from({ length: 2 }).map((_, i) => (
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
export default function ViewSeo() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery<SeoDetailApiResponse>({
    queryKey: ["seo-detail", id],
    queryFn: () =>
      makeApiRequest<SeoDetailApiResponse>(`${apiUrl.getSeoById}/${id}`),
    enabled: !!id,
  });

  const seo = data?.data;

  if (isLoading) return <SeoDetailSkeleton />;

  if (isError || !seo) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-destructive">
        <AlertCircle className="w-10 h-10" />
        <p className="text-sm font-medium">Failed to load SEO record</p>
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
            onClick={() => navigate("/seo-management")}
            className="rounded-full"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{seo.route_label}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              SEO #{seo.id} · {seo.route_path}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={groupConfig[seo.route_group] ?? "bg-gray-100 text-gray-800 hover:bg-gray-100"}>
            {seo.route_group}
          </Badge>
          <Badge
            className={
              seo.is_active
                ? "bg-green-100 text-green-800 hover:bg-green-100"
                : "bg-red-100 text-red-800 hover:bg-red-100"
            }
          >
            {seo.is_active ? "Active" : "Inactive"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* ── Left Column ───────────────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Route Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-4 h-4" />
                Route Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <InfoRow label="Route Label" icon={Globe}>{seo.route_label}</InfoRow>
              <InfoRow label="Route Slug" icon={Hash}>
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{seo.route_slug}</code>
              </InfoRow>
              <InfoRow label="Route Path" icon={Hash}>
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{seo.route_path}</code>
              </InfoRow>
              <InfoRow label="Group" icon={Globe}>
                <Badge className={groupConfig[seo.route_group] ?? "bg-gray-100 text-gray-800 hover:bg-gray-100"}>
                  {seo.route_group}
                </Badge>
              </InfoRow>
            </CardContent>
          </Card>

          {/* Meta SEO */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Search className="w-4 h-4" />
                Meta SEO
              </CardTitle>
            </CardHeader>
            <CardContent>
              <InfoRow label="Meta Title" icon={Search}>{seo.meta_title}</InfoRow>
              <InfoRow label="Meta Description" icon={Search}>{seo.meta_description}</InfoRow>
              <InfoRow label="Canonical URL" icon={Globe}>
                {seo.canonical_url ? (
                  <a
                    href={seo.canonical_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    {seo.canonical_url}
                  </a>
                ) : null}
              </InfoRow>
              <InfoRow label="No Index" icon={Search}>
                <Badge className={seo.no_index ? "bg-red-100 text-red-800 hover:bg-red-100" : "bg-green-100 text-green-800 hover:bg-green-100"}>
                  {seo.no_index ? "Yes" : "No"}
                </Badge>
              </InfoRow>
              <InfoRow label="No Follow" icon={Search}>
                <Badge className={seo.no_follow ? "bg-red-100 text-red-800 hover:bg-red-100" : "bg-green-100 text-green-800 hover:bg-green-100"}>
                  {seo.no_follow ? "Yes" : "No"}
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
              <InfoRow label="OG Title" icon={Globe}>{seo.og_title}</InfoRow>
              <InfoRow label="OG Description" icon={Globe}>{seo.og_description}</InfoRow>
              <InfoRow label="OG Image" icon={Image}>
                {seo.og_image ? (
                  <a
                    href={seo.og_image}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all text-xs"
                  >
                    {seo.og_image}
                  </a>
                ) : null}
              </InfoRow>
            </CardContent>
          </Card>

          {/* Twitter Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Twitter className="w-4 h-4" />
                Twitter Card
              </CardTitle>
            </CardHeader>
            <CardContent>
              <InfoRow label="Card Type" icon={Twitter}>{seo.twitter_card}</InfoRow>
              <InfoRow label="Twitter Title" icon={Twitter}>{seo.twitter_title}</InfoRow>
              <InfoRow label="Twitter Desc" icon={Twitter}>{seo.twitter_description}</InfoRow>
              <InfoRow label="Twitter Image" icon={Image}>
                {seo.twitter_image ? (
                  <a
                    href={seo.twitter_image}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all text-xs"
                  >
                    {seo.twitter_image}
                  </a>
                ) : null}
              </InfoRow>
            </CardContent>
          </Card>

          {/* Schema Markup */}
          {seo.schema_markup && seo.schema_markup.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Code2 className="w-4 h-4" />
                  Schema Markup (JSON-LD)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs bg-muted/40 rounded-lg p-4 overflow-x-auto font-mono whitespace-pre-wrap break-all">
                  {JSON.stringify(seo.schema_markup, null, 2)}
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
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active</span>
                <Badge className={seo.is_active ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-red-100 text-red-800 hover:bg-red-100"}>
                  {seo.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">No Index</span>
                <Badge className={seo.no_index ? "bg-red-100 text-red-800 hover:bg-red-100" : "bg-green-100 text-green-800 hover:bg-green-100"}>
                  {seo.no_index ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">No Follow</span>
                <Badge className={seo.no_follow ? "bg-red-100 text-red-800 hover:bg-red-100" : "bg-green-100 text-green-800 hover:bg-green-100"}>
                  {seo.no_follow ? "Yes" : "No"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* OG Image Preview */}
          {seo.og_image && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  OG Image Preview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={seo.og_image}
                  alt="OG"
                  className="w-full h-32 object-cover rounded-lg border"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
                <p className="text-xs text-muted-foreground mt-2 break-all">{seo.og_image}</p>
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
                <span className="text-xs text-muted-foreground">{formatDate(seo.created_at)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Updated</span>
                <span className="text-xs text-muted-foreground">{formatDate(seo.updated_at)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
