import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Loader2,
  Save,
  Globe,
  Hash,
  Search,
  Code2,
  Image,
  Twitter,
  ToggleRight,
  AlertCircle,
} from "lucide-react";

import makeApiRequest from "@/services/axios";
import { apiUrl } from "@/services/api-end-point";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

// ─── Types ────────────────────────────────────────────────────────────────────
interface FormState {
  meta_title: string;
  meta_description: string;
  og_title: string;
  og_description: string;
  og_image: string;
  twitter_card: string;
  twitter_title: string;
  twitter_description: string;
  twitter_image: string;
  canonical_url: string;
  no_index: boolean;
  no_follow: boolean;
  schema_markup: string;
  is_active: boolean;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

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
  schema_markup: object;
  is_active: boolean;
}

interface SeoDetailApiResponse {
  success: boolean;
  data: SeoDetail;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const TWITTER_CARD_TYPES = ["summary", "summary_large_image", "app", "player"];

// ─── Field wrapper ─────────────────────────────────────────────────────────────
function Field({
  label,
  icon: Icon,
  error,
  required,
  children,
  hint,
}: {
  label: string;
  icon: React.ElementType;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1.5 text-sm font-medium">
        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function EditSeo() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [errors, setErrors] = useState<FormErrors>({});

  const [form, setForm] = useState<FormState>({
    meta_title: "",
    meta_description: "",
    og_title: "",
    og_description: "",
    og_image: "",
    twitter_card: "summary_large_image",
    twitter_title: "",
    twitter_description: "",
    twitter_image: "",
    canonical_url: "",
    no_index: false,
    no_follow: false,
    schema_markup: "",
    is_active: true,
  });

  // ─── Fetch existing data ─────────────────────────────────────────────────────
  const { isLoading, isError, data } = useQuery<SeoDetailApiResponse>({
    queryKey: ["seo-detail", id],
    queryFn: () =>
      makeApiRequest<SeoDetailApiResponse>(`${apiUrl.getSeoById}/${id}`),
    enabled: !!id,
  });

  useEffect(() => {
    if (data?.data) {
      const s = data.data;
      setForm({
        meta_title: s.meta_title ?? "",
        meta_description: s.meta_description ?? "",
        og_title: s.og_title ?? "",
        og_description: s.og_description ?? "",
        og_image: s.og_image ?? "",
        twitter_card: s.twitter_card ?? "summary_large_image",
        twitter_title: s.twitter_title ?? "",
        twitter_description: s.twitter_description ?? "",
        twitter_image: s.twitter_image ?? "",
        canonical_url: s.canonical_url ?? "",
        no_index: s.no_index ?? false,
        no_follow: s.no_follow ?? false,
        schema_markup:
          s.schema_markup && Object.keys(s.schema_markup).length > 0
            ? JSON.stringify(s.schema_markup, null, 2)
            : "",
        is_active: s.is_active ?? true,
      });
    }
  }, [data]);

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) => {
    setForm((p) => ({ ...p, [key]: val }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: undefined }));
  };

  // ── Mutation — PUT
  const { mutate, isPending } = useMutation({
    mutationFn: (payload: object) =>
      makeApiRequest(`${apiUrl.updateSeo}/${id}`, {
        method: "PUT",
        data: payload,
      }),
    onSuccess: () => {
      toast.success("SEO record updated successfully");
      queryClient.invalidateQueries({ queryKey: ["seo-management"] });
      queryClient.invalidateQueries({ queryKey: ["seo-detail", id] });
      navigate("/seo-management");
    },
    onError: () => {
      toast.error("Failed to update SEO record");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let schemaObj: object = {};
    if (form.schema_markup.trim()) {
      try {
        schemaObj = JSON.parse(form.schema_markup);
      } catch {
        setErrors((p) => ({ ...p, schema_markup: "Invalid JSON format" }));
        return;
      }
    }

    mutate({
      meta_title: form.meta_title || null,
      meta_description: form.meta_description || null,
      og_title: form.og_title || null,
      og_description: form.og_description || null,
      og_image: form.og_image || null,
      twitter_card: form.twitter_card || null,
      twitter_title: form.twitter_title || null,
      twitter_description: form.twitter_description || null,
      twitter_image: form.twitter_image || null,
      canonical_url: form.canonical_url || null,
      no_index: form.no_index,
      no_follow: form.no_follow,
      schema_markup: schemaObj,
      is_active: form.is_active,
    });
  };

  // ─── Loading / Error ─────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-destructive">
        <AlertCircle className="w-10 h-10" />
        <p className="text-sm font-medium">Failed to load SEO record</p>
        <Button variant="outline" onClick={() => navigate("/seo-management")}>
          Back to listing
        </Button>
      </div>
    );
  }

  const seo = data?.data;

  return (
    <div className="space-y-6 p-4 sm:p-6 bg-gray-50 min-h-screen">

      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => navigate("/seo-management")}
          className="rounded-full"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit SEO Record</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {seo?.route_label} — #{id}
          </p>
        </div>
      </div>

      {/* ── Read-only route info banner ─────────────────────────────────────── */}
      {seo && (
        <div className="flex flex-wrap gap-4 rounded-lg border bg-muted/40 px-4 py-3 text-xs">
          <span className="text-muted-foreground">
            Slug: <code className="font-mono text-foreground">{seo.route_slug}</code>
          </span>
          <span className="text-muted-foreground">
            Path: <code className="font-mono text-foreground">{seo.route_path}</code>
          </span>
          <span className="text-muted-foreground">
            Group: <code className="font-mono text-foreground">{seo.route_group}</code>
          </span>
          <span className="text-xs text-muted-foreground italic ml-auto">(route fields not editable)</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── Meta SEO ────────────────────────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Search className="w-4 h-4" />
              Meta SEO
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Meta Title" icon={Search} hint="Recommended: 50–60 characters">
                <Input
                  placeholder="e.g. PikPakGo — Vacation Rentals & Hotels"
                  value={form.meta_title}
                  onChange={(e) => set("meta_title", e.target.value)}
                />
              </Field>

              <Field label="Canonical URL" icon={Globe}>
                <Input
                  placeholder="https://pikpakgo.com/"
                  value={form.canonical_url}
                  onChange={(e) => set("canonical_url", e.target.value)}
                />
              </Field>
            </div>

            <Field label="Meta Description" icon={Search} hint="Recommended: 150–160 characters">
              <Textarea
                placeholder="Find the best vacation rentals and hotels worldwide."
                rows={2}
                value={form.meta_description}
                onChange={(e) => set("meta_description", e.target.value)}
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">No Index</p>
                  <p className="text-xs text-muted-foreground">
                    Prevent search engines from indexing
                  </p>
                </div>
                <Switch
                  checked={form.no_index}
                  onCheckedChange={(v) => set("no_index", v)}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium">No Follow</p>
                  <p className="text-xs text-muted-foreground">
                    Prevent following links on this page
                  </p>
                </div>
                <Switch
                  checked={form.no_follow}
                  onCheckedChange={(v) => set("no_follow", v)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── Open Graph ──────────────────────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Open Graph (Social Sharing)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="OG Title" icon={Globe}>
                <Input
                  placeholder="Title for social sharing"
                  value={form.og_title}
                  onChange={(e) => set("og_title", e.target.value)}
                />
              </Field>

              <Field label="OG Image URL" icon={Image}>
                <Input
                  placeholder="https://cdn.pikpakgo.com/og-default.jpg"
                  value={form.og_image}
                  onChange={(e) => set("og_image", e.target.value)}
                />
              </Field>
            </div>

            <Field label="OG Description" icon={Globe}>
              <Textarea
                placeholder="Description for social sharing..."
                rows={2}
                value={form.og_description}
                onChange={(e) => set("og_description", e.target.value)}
              />
            </Field>

            {form.og_image && (
              <div className="rounded-lg border overflow-hidden">
                <p className="text-xs text-muted-foreground font-medium px-3 py-2 bg-muted/40 border-b">
                  OG Image Preview
                </p>
                <img
                  src={form.og_image}
                  alt="OG preview"
                  className="w-full h-40 object-cover"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Twitter Card ────────────────────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Twitter className="w-4 h-4" />
              Twitter Card
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Card Type" icon={Twitter}>
                <Select value={form.twitter_card} onValueChange={(v) => set("twitter_card", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select card type" />
                  </SelectTrigger>
                  <SelectContent>
                    {TWITTER_CARD_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Twitter Image URL" icon={Image}>
                <Input
                  placeholder="https://cdn.pikpakgo.com/twitter.jpg"
                  value={form.twitter_image}
                  onChange={(e) => set("twitter_image", e.target.value)}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Twitter Title" icon={Twitter}>
                <Input
                  placeholder="Title for Twitter sharing"
                  value={form.twitter_title}
                  onChange={(e) => set("twitter_title", e.target.value)}
                />
              </Field>

              <Field label="Twitter Description" icon={Twitter}>
                <Input
                  placeholder="Description for Twitter sharing"
                  value={form.twitter_description}
                  onChange={(e) => set("twitter_description", e.target.value)}
                />
              </Field>
            </div>
          </CardContent>
        </Card>

        {/* ── Schema Markup ───────────────────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Code2 className="w-4 h-4" />
              Schema Markup (JSON-LD)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Field
              label="Schema Markup JSON"
              icon={Code2}
              error={errors.schema_markup}
              hint='Must be valid JSON. e.g. {"@context":"https://schema.org","@type":"WebPage"}'
            >
              <Textarea
                placeholder='{"@context": "https://schema.org", "@type": "WebPage"}'
                rows={5}
                className="font-mono text-xs"
                value={form.schema_markup}
                onChange={(e) => set("schema_markup", e.target.value)}
              />
            </Field>
          </CardContent>
        </Card>

        {/* ── Status ──────────────────────────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <ToggleRight className="w-4 h-4" />
              Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Active</p>
                <p className="text-xs text-muted-foreground">
                  Make this SEO record active and visible
                </p>
              </div>
              <Switch
                checked={form.is_active}
                onCheckedChange={(v) => set("is_active", v)}
              />
            </div>
          </CardContent>
        </Card>

        {/* ── Actions ─────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-3 pb-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/seo-management")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending} className="min-w-44">
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
