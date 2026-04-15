import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  Code2,
  FileText,
  Globe,
  Image,
  Loader2,
  MessageSquare,
  Plus,
  Save,
  Search,
  Star,
  Tag,
  ToggleRight,
  Trash2,
  Twitter,
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
interface BlogCategory {
  id: number;
  name: string;
  slug: string;
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
}

interface BlogCategoryApiResponse {
  success: boolean;
  data: BlogCategory[];
}

interface PostApiResponse {
  success: boolean;
  data: BlogPost;
}

interface FormState {
  title: string;
  blog_category_id: string;
  excerpt: string;
  content: string;
  featured_image: string;
  gallery: string[];
  tags: string[];
  status: string;
  published_at: string;
  is_featured: boolean;
  allow_comments: boolean;
  meta_title: string;
  meta_description: string;
  og_title: string;
  og_description: string;
  og_image: string;
  twitter_title: string;
  twitter_description: string;
  twitter_image: string;
  canonical_url: string;
  no_index: boolean;
  schema_markup: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

const STATUS_OPTIONS = ["draft", "published", "scheduled", "archived"];

const EDITOR_CONFIG = {
  toolbar: [
    "heading", "|",
    "bold", "italic", "link", "bulletedList", "numberedList", "|",
    "blockQuote", "insertTable", "|",
    "undo", "redo",
  ],
};

// ─── Field wrapper ────────────────────────────────────────────────────────────
function Field({
  label, icon: Icon, error, required, hint, children,
}: {
  label: string;
  icon: React.ElementType;
  error?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
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

// ─── CKEditor wrapper ─────────────────────────────────────────────────────────
function RichEditor({
  label, icon: Icon, value, onChange, required, error,
}: {
  label: string;
  icon: React.ElementType;
  value: string;
  onChange: (html: string) => void;
  required?: boolean;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1.5 text-sm font-medium">
        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </Label>
      <div className="rounded-md border bg-background overflow-hidden">
        <CKEditor
          editor={ClassicEditor}
          data={value}
          onChange={(_event: unknown, editor: { getData: () => string }) => {
            onChange(editor.getData());
          }}
          config={EDITOR_CONFIG}
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function EditBlogPost() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [errors, setErrors] = useState<FormErrors>({});
  const [tagInput, setTagInput] = useState("");
  const [galleryInput, setGalleryInput] = useState("");

  const [form, setForm] = useState<FormState>({
    title: "",
    blog_category_id: "",
    excerpt: "",
    content: "",
    featured_image: "",
    gallery: [],
    tags: [],
    status: "draft",
    published_at: "",
    is_featured: false,
    allow_comments: true,
    meta_title: "",
    meta_description: "",
    og_title: "",
    og_description: "",
    og_image: "",
    twitter_title: "",
    twitter_description: "",
    twitter_image: "",
    canonical_url: "",
    no_index: false,
    schema_markup: "",
  });

  // ── Fetch existing post
  const { isLoading, isError, data } = useQuery<PostApiResponse>({
    queryKey: ["blog-post-detail", id],
    queryFn: () =>
      makeApiRequest<PostApiResponse>(`${apiUrl.getBlogPostById}/${id}`),
    enabled: !!id,
  });

  // ── Pre-fill form when data loads
  useEffect(() => {
    if (data?.data) {
      const p = data.data;
      setForm({
        title: p.title ?? "",
        blog_category_id: String(p.blog_category_id ?? ""),
        excerpt: p.excerpt ?? "",
        content: p.content ?? "",
        featured_image: p.featured_image ?? "",
        gallery: p.gallery ?? [],
        tags: p.tags ?? [],
        status: p.status ?? "draft",
        published_at: p.published_at
          ? new Date(p.published_at).toISOString().slice(0, 16)
          : "",
        is_featured: p.is_featured ?? false,
        allow_comments: p.allow_comments ?? true,
        meta_title: p.meta_title ?? "",
        meta_description: p.meta_description ?? "",
        og_title: p.og_title ?? "",
        og_description: p.og_description ?? "",
        og_image: p.og_image ?? "",
        twitter_title: p.twitter_title ?? "",
        twitter_description: p.twitter_description ?? "",
        twitter_image: p.twitter_image ?? "",
        canonical_url: p.canonical_url ?? "",
        no_index: p.no_index ?? false,
        schema_markup: p.schema_markup
          ? JSON.stringify(p.schema_markup, null, 2)
          : "",
      });
    }
  }, [data]);

  // ── Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ["blog-categories-select"],
    queryFn: () =>
      makeApiRequest<BlogCategoryApiResponse>(apiUrl.getAllBlogCategories),
  });
  const categories = categoriesData?.data ?? [];

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) => {
    setForm((p) => ({ ...p, [key]: val }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: undefined }));
  };

  // ── Tags
  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) set("tags", [...form.tags, t]);
    setTagInput("");
  };
  const removeTag = (tag: string) =>
    set("tags", form.tags.filter((t) => t !== tag));

  // ── Gallery
  const addGalleryImage = () => {
    const url = galleryInput.trim();
    if (url && !form.gallery.includes(url)) set("gallery", [...form.gallery, url]);
    setGalleryInput("");
  };
  const removeGalleryImage = (url: string) =>
    set("gallery", form.gallery.filter((g) => g !== url));

  // ── Validation
  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.blog_category_id) errs.blog_category_id = "Category is required";
    if (!form.content.trim()) errs.content = "Content is required";
    if (!form.status) errs.status = "Status is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── PUT mutation
  const { mutate, isPending } = useMutation({
    mutationFn: (payload: object) =>
      makeApiRequest(`${apiUrl.updateBlogPost}/${id}`, {
        method: "PUT",
        data: payload,
      }),
    onSuccess: () => {
      toast.success("Blog post updated successfully");
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      queryClient.invalidateQueries({ queryKey: ["blog-post-detail", id] });
      navigate("/blog/manage-blog");
    },
    onError: () => {
      toast.error("Failed to update blog post");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    let schemaObj: object | null = null;
    if (form.schema_markup.trim()) {
      try {
        schemaObj = JSON.parse(form.schema_markup);
      } catch {
        setErrors((p) => ({ ...p, schema_markup: "Invalid JSON format" }));
        return;
      }
    }

    mutate({
      title: form.title,
      blog_category_id: Number(form.blog_category_id),
      excerpt: form.excerpt || null,
      content: form.content,
      featured_image: form.featured_image || null,
      gallery: form.gallery,
      tags: form.tags,
      status: form.status,
      published_at: form.published_at
        ? new Date(form.published_at).toISOString()
        : null,
      is_featured: form.is_featured,
      allow_comments: form.allow_comments,
      meta_title: form.meta_title || null,
      meta_description: form.meta_description || null,
      og_title: form.og_title || null,
      og_description: form.og_description || null,
      og_image: form.og_image || null,
      twitter_title: form.twitter_title || null,
      twitter_description: form.twitter_description || null,
      twitter_image: form.twitter_image || null,
      canonical_url: form.canonical_url || null,
      no_index: form.no_index,
      schema_markup: schemaObj,
    });
  };

  // ── Loading / Error states
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
        <p className="text-sm font-medium">Failed to load blog post</p>
        <Button variant="outline" onClick={() => navigate("/blog/manage-blog")}>
          Back to listing
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => navigate("/blog/manage-blog")}
          className="rounded-full"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Blog Post</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Update post — #{id}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── Basic Info ─────────────────────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">

            <Field label="Title" icon={FileText} required error={errors.title}>
              <Input
                placeholder="e.g. Solo Travel Guide 2027"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
              />
            </Field>

            {/* Slug — read only */}
            {data?.data?.slug && (
              <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2.5">
                <span className="text-xs text-muted-foreground">Slug:</span>
                <code className="text-xs font-mono text-foreground">
                  /{data.data.slug}
                </code>
                <span className="text-xs text-muted-foreground ml-auto italic">
                  (not editable)
                </span>
              </div>
            )}

            <Field
              label="Category"
              icon={FileText}
              required
              error={errors.blog_category_id}
            >
              <Select
                value={form.blog_category_id}
                onValueChange={(v) => set("blog_category_id", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Excerpt" icon={FileText} hint="Short summary shown in listings">
              <Textarea
                placeholder="Travel alone with confidence."
                rows={2}
                value={form.excerpt}
                onChange={(e) => set("excerpt", e.target.value)}
              />
            </Field>

            <Field label="Featured Image" icon={Image} hint="Filename or URL">
              <Input
                placeholder="solo.jpg"
                value={form.featured_image}
                onChange={(e) => set("featured_image", e.target.value)}
              />
            </Field>

            {/* Gallery */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-sm font-medium">
                <Image className="w-3.5 h-3.5 text-muted-foreground" />
                Gallery Images
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder="solo1.jpg"
                  value={galleryInput}
                  onChange={(e) => setGalleryInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addGalleryImage())
                  }
                />
                <Button type="button" variant="outline" size="sm" onClick={addGalleryImage}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {form.gallery.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {form.gallery.map((url) => (
                    <div
                      key={url}
                      className="flex items-center gap-1.5 bg-muted px-2.5 py-1 rounded-full text-xs"
                    >
                      <span className="max-w-[160px] truncate">{url}</span>
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(url)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-sm font-medium">
                <Tag className="w-3.5 h-3.5 text-muted-foreground" />
                Tags
              </Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. solo"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addTag())
                  }
                />
                <Button type="button" variant="outline" size="sm" onClick={addTag}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {form.tags.map((tag) => (
                    <div
                      key={tag}
                      className="flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-1 rounded-full text-xs font-medium"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Content ────────────────────────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Code2 className="w-4 h-4" />
              Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RichEditor
              label="Blog Content"
              icon={Code2}
              value={form.content}
              onChange={(html) => set("content", html)}
              required
              error={errors.content}
            />
          </CardContent>
        </Card>

        {/* ── Publishing ─────────────────────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <ToggleRight className="w-4 h-4" />
              Publishing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Status" icon={ToggleRight} required error={errors.status}>
                <Select
                  value={form.status}
                  onValueChange={(v) => set("status", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.map((s) => (
                      <SelectItem key={s} value={s} className="capitalize">
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Published At" icon={CalendarDays}>
                <Input
                  type="datetime-local"
                  value={form.published_at}
                  onChange={(e) => set("published_at", e.target.value)}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 text-yellow-500" />
                    Featured
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Highlight this post on the frontend
                  </p>
                </div>
                <Switch
                  checked={form.is_featured}
                  onCheckedChange={(v) => set("is_featured", v)}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <p className="text-sm font-medium flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                    Allow Comments
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Let readers comment on this post
                  </p>
                </div>
                <Switch
                  checked={form.allow_comments}
                  onCheckedChange={(v) => set("allow_comments", v)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── SEO & Meta ─────────────────────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Search className="w-4 h-4" />
              SEO & Meta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Meta Title" icon={Search} hint="50–60 characters recommended">
                <Input
                  placeholder="Solo Travel"
                  value={form.meta_title}
                  onChange={(e) => set("meta_title", e.target.value)}
                />
              </Field>
              <Field label="Canonical URL" icon={Globe}>
                <Input
                  placeholder="https://example.com/solo-travel-guide-2027"
                  value={form.canonical_url}
                  onChange={(e) => set("canonical_url", e.target.value)}
                />
              </Field>
            </div>
            <Field label="Meta Description" icon={Search} hint="150–160 characters recommended">
              <Textarea
                placeholder="Guide for solo travelers."
                rows={2}
                value={form.meta_description}
                onChange={(e) => set("meta_description", e.target.value)}
              />
            </Field>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">No Index</p>
                <p className="text-xs text-muted-foreground">
                  Prevent search engines from indexing this post
                </p>
              </div>
              <Switch
                checked={form.no_index}
                onCheckedChange={(v) => set("no_index", v)}
              />
            </div>
          </CardContent>
        </Card>

        {/* ── Open Graph ─────────────────────────────────────────────────────── */}
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
                  placeholder="Solo Travel"
                  value={form.og_title}
                  onChange={(e) => set("og_title", e.target.value)}
                />
              </Field>
              <Field label="OG Image" icon={Image}>
                <Input
                  placeholder="solo-og.jpg"
                  value={form.og_image}
                  onChange={(e) => set("og_image", e.target.value)}
                />
              </Field>
            </div>
            <Field label="OG Description" icon={Globe}>
              <Textarea
                placeholder="Travel alone safely."
                rows={2}
                value={form.og_description}
                onChange={(e) => set("og_description", e.target.value)}
              />
            </Field>
          </CardContent>
        </Card>

        {/* ── Twitter Card ───────────────────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Twitter className="w-4 h-4" />
              Twitter Card
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Twitter Title" icon={Twitter}>
                <Input
                  placeholder="Solo Travel"
                  value={form.twitter_title}
                  onChange={(e) => set("twitter_title", e.target.value)}
                />
              </Field>
              <Field label="Twitter Image" icon={Image}>
                <Input
                  placeholder="solo-twitter.jpg"
                  value={form.twitter_image}
                  onChange={(e) => set("twitter_image", e.target.value)}
                />
              </Field>
            </div>
            <Field label="Twitter Description" icon={Twitter}>
              <Textarea
                placeholder="Solo travel tips"
                rows={2}
                value={form.twitter_description}
                onChange={(e) => set("twitter_description", e.target.value)}
              />
            </Field>
          </CardContent>
        </Card>

        {/* ── Schema Markup ──────────────────────────────────────────────────── */}
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
              hint='Must be valid JSON. e.g. {"@context":"https://schema.org","@type":"BlogPosting"}'
            >
              <Textarea
                placeholder='{"@context": "https://schema.org", "@type": "BlogPosting"}'
                rows={5}
                className="font-mono text-xs"
                value={form.schema_markup}
                onChange={(e) => set("schema_markup", e.target.value)}
              />
            </Field>
          </CardContent>
        </Card>

        {/* ── Actions ────────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-3 pb-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/blog/manage-blog")}
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
