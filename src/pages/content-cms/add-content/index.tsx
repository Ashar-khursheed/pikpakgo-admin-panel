import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  ArrowLeft,
  Loader2,
  Save,
  FileText,
  Globe, 
  Tag,
  Hash,
  ToggleRight,
  Image,
  Search,
  Code2,
  Plus,
  Trash2,
  Navigation,
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
interface Section {
  type: string;
  html: string;
}

interface FormState {
  title: string;
  type: string;
  template: string;
  slug: string;
  parent_slug: string;
  content_html: string;
  sections: Section[];
  featured_image: string;
  meta_title: string;
  meta_description: string;
  og_title: string;
  og_description: string;
  og_image: string;
  canonical_url: string;
  no_index: boolean;
  schema_markup: string;
  show_in_nav: boolean;
  nav_label: string;
  nav_icon: string;
  sort_order: string;
  is_active: boolean;
  published_at: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const CONTENT_TYPES = ["page", "header", "footer", "section", "nav"];
const TEMPLATES = ["default", "full-width", "sidebar", "landing"];

const EDITOR_CONFIG = {
  toolbar: [
    "heading",
    "|",
    "bold",
    "italic",
    "link",
    "bulletedList",
    "numberedList",
    "|",
    "blockQuote",
    "insertTable",
    "|",
    "undo",
    "redo",
  ],
};

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

// ─── CKEditor wrapper ──────────────────────────────────────────────────────────
function RichEditor({
  label,
  icon: Icon,
  value,
  onChange,
  required,
}: {
  label: string;
  icon: React.ElementType;
  value: string;
  onChange: (html: string) => void;
  required?: boolean;
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
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function AddContent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  const [form, setForm] = useState<FormState>({
    title: "",
    type: "page",
    template: "default",
    slug: "",
    parent_slug: "",
    content_html: "",
    sections: [],
    featured_image: "",
    meta_title: "",
    meta_description: "",
    og_title: "",
    og_description: "",
    og_image: "",
    canonical_url: "",
    no_index: false,
    schema_markup: "",
    show_in_nav: false,
    nav_label: "",
    nav_icon: "",
    sort_order: "1",
    is_active: true,
    published_at: new Date().toISOString().slice(0, 16),
  });

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) => {
    setForm((p) => ({ ...p, [key]: val }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: undefined }));
  };

  // Slug auto-generate from title
  const handleTitleChange = (val: string) => {
    set("title", val);
    if (!form.slug || form.slug === slugify(form.title)) {
      set("slug", slugify(val));
    }
    if (!form.meta_title) set("meta_title", val);
    if (!form.og_title) set("og_title", val);
  };

  function slugify(str: string) {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-");
  }

  // Sections
  const addSection = () => {
    set("sections", [...form.sections, { type: "", html: "" }]);
  };

  const removeSection = (i: number) => {
    set("sections", form.sections.filter((_, idx) => idx !== i));
  };

  const updateSection = (i: number, field: keyof Section, val: string) => {
    const updated = form.sections.map((s, idx) =>
      idx === i ? { ...s, [field]: val } : s
    );
    set("sections", updated);
  };

  // Validation
  const validate = (): boolean => {
    const errs: Partial<Record<keyof FormState, string>> = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.slug.trim()) errs.slug = "Slug is required";
    if (!form.type) errs.type = "Type is required";
    if (!form.template) errs.template = "Template is required";
    if (!form.content_html.trim()) errs.content_html = "Content HTML is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Mutation
  const { mutate, isPending } = useMutation({
    mutationFn: (payload: object) =>
      makeApiRequest(apiUrl.getAllContent, { method: "POST", data: payload }),
    onSuccess: () => {
      toast.success("Content created successfully");
      queryClient.invalidateQueries({ queryKey: ["content-cms"] });
      navigate("/content-cms");
    },
    onError: () => {
      toast.error("Failed to create content");
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
      type: form.type,
      template: form.template,
      slug: form.slug,
      parent_slug: form.parent_slug || null,
      content: { html: form.content_html },
      sections: form.sections.filter((s) => s.type && s.html),
      featured_image: form.featured_image || null,
      meta_title: form.meta_title || null,
      meta_description: form.meta_description || null,
      og_title: form.og_title || null,
      og_description: form.og_description || null,
      og_image: form.og_image || null,
      canonical_url: form.canonical_url || null,
      no_index: form.no_index,
      schema_markup: schemaObj,
      show_in_nav: form.show_in_nav,
      nav_label: form.nav_label || null,
      nav_icon: form.nav_icon || null,
      sort_order: Number(form.sort_order) || 1,
      is_active: form.is_active,
      published_at: form.published_at ? new Date(form.published_at).toISOString() : null,
    });
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => navigate("/content-cms")}
          className="rounded-full"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add Content</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Create a new CMS content page or section
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── Basic Info ───────────────────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Title" icon={FileText} error={errors.title} required>
              <Input
                placeholder="e.g. About Us"
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Slug"
                icon={Tag}
                error={errors.slug}
                required
                hint="URL-friendly identifier, auto-filled from title"
              >
                <Input
                  placeholder="e.g. about-us"
                  value={form.slug}
                  onChange={(e) => set("slug", slugify(e.target.value))}
                />
              </Field>

              <Field label="Parent Slug" icon={Tag} hint="Leave empty if this is a root page">
                <Input
                  placeholder="e.g. company"
                  value={form.parent_slug}
                  onChange={(e) => set("parent_slug", e.target.value)}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Type" icon={FileText} error={errors.type} required>
                <Select value={form.type} onValueChange={(v) => set("type", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTENT_TYPES.map((t) => (
                      <SelectItem key={t} value={t} className="capitalize">
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Template" icon={FileText} error={errors.template} required>
                <Select value={form.template} onValueChange={(v) => set("template", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    {TEMPLATES.map((t) => (
                      <SelectItem key={t} value={t} className="capitalize">
                        {t.charAt(0).toUpperCase() + t.slice(1).replace(/-/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field label="Featured Image URL" icon={Image} hint="Full URL to the banner image">
              <Input
                placeholder="https://example.com/images/banner.jpg"
                value={form.featured_image}
                onChange={(e) => set("featured_image", e.target.value)}
              />
            </Field>
          </CardContent>
        </Card>

        {/* ── Main Content ─────────────────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Code2 className="w-4 h-4" />
              Main Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RichEditor
              label="Content HTML"
              icon={Code2}
              value={form.content_html}
              onChange={(html) => set("content_html", html)}
              required
            />
            {errors.content_html && (
              <p className="text-xs text-destructive mt-1">{errors.content_html}</p>
            )}
          </CardContent>
        </Card>

        {/* ── Sections ─────────────────────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Sections
              </CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addSection}
                className="gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Section
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            {form.sections.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4 border rounded-lg bg-muted/30">
                No sections added. Click "Add Section" to start.
              </p>
            )}
            {form.sections.map((sec, i) => (
              <div key={i} className="border rounded-lg p-4 space-y-3 bg-white">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Section {i + 1}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSection(i)}
                    className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <Field label="Section Type" icon={Tag}>
                  <Input
                    placeholder="e.g. hero, mission, cta"
                    value={sec.type}
                    onChange={(e) => updateSection(i, "type", e.target.value)}
                  />
                </Field>
                <RichEditor
                  label="Section HTML"
                  icon={Code2}
                  value={sec.html}
                  onChange={(html) => updateSection(i, "html", html)}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* ── SEO / Meta ───────────────────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Search className="w-4 h-4" />
              SEO & Meta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Meta Title" icon={Search} hint="Recommended: 50–60 characters">
                <Input
                  placeholder="Page title for search engines"
                  value={form.meta_title}
                  onChange={(e) => set("meta_title", e.target.value)}
                />
              </Field>
              <Field label="Canonical URL" icon={Globe}>
                <Input
                  placeholder="https://example.com/about-us"
                  value={form.canonical_url}
                  onChange={(e) => set("canonical_url", e.target.value)}
                />
              </Field>
            </div>

            <Field label="Meta Description" icon={Search} hint="Recommended: 150–160 characters">
              <Textarea
                placeholder="Short description for search engines..."
                rows={2}
                value={form.meta_description}
                onChange={(e) => set("meta_description", e.target.value)}
              />
            </Field>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">No Index</p>
                <p className="text-xs text-muted-foreground">
                  Prevent search engines from indexing this page
                </p>
              </div>
              <Switch
                checked={form.no_index}
                onCheckedChange={(v) => set("no_index", v)}
              />
            </div>
          </CardContent>
        </Card>

        {/* ── Open Graph ───────────────────────────────────────────────────── */}
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
                  placeholder="https://example.com/images/og.jpg"
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
          </CardContent>
        </Card>

        {/* ── Schema Markup ────────────────────────────────────────────────── */}
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
              hint='Must be valid JSON. e.g. {"@context":"https://schema.org","@type":"AboutPage"}'
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

        {/* ── Navigation ───────────────────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Navigation className="w-4 h-4" />
              Navigation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Show in Navigation</p>
                <p className="text-xs text-muted-foreground">
                  Display this page in the site navigation menu
                </p>
              </div>
              <Switch
                checked={form.show_in_nav}
                onCheckedChange={(v) => set("show_in_nav", v)}
              />
            </div>

            {form.show_in_nav && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="Nav Label" icon={Navigation} hint="Label shown in menu">
                  <Input
                    placeholder="e.g. About"
                    value={form.nav_label}
                    onChange={(e) => set("nav_label", e.target.value)}
                  />
                </Field>
                <Field label="Nav Icon" icon={Navigation} hint="Icon name e.g. info">
                  <Input
                    placeholder="e.g. info"
                    value={form.nav_icon}
                    onChange={(e) => set("nav_icon", e.target.value)}
                  />
                </Field>
                <Field label="Sort Order" icon={Hash} hint="Order in navigation">
                  <Input
                    type="number"
                    min="1"
                    placeholder="1"
                    value={form.sort_order}
                    onChange={(e) => set("sort_order", e.target.value)}
                  />
                </Field>
              </div>
            )}

            {!form.show_in_nav && (
              <Field label="Sort Order" icon={Hash}>
                <Input
                  type="number"
                  min="1"
                  placeholder="1"
                  value={form.sort_order}
                  onChange={(e) => set("sort_order", e.target.value)}
                />
              </Field>
            )}
          </CardContent>
        </Card>

        {/* ── Publishing ───────────────────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <ToggleRight className="w-4 h-4" />
              Publishing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Published At" icon={FileText}>
                <Input
                  type="datetime-local"
                  value={form.published_at}
                  onChange={(e) => set("published_at", e.target.value)}
                />
              </Field>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Active</p>
                <p className="text-xs text-muted-foreground">
                  Make this content visible on the frontend
                </p>
              </div>
              <Switch
                checked={form.is_active}
                onCheckedChange={(v) => set("is_active", v)}
              />
            </div>
          </CardContent>
        </Card>

        {/* ── Actions ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-end gap-3 pb-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/content-cms")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending} className="min-w-40">
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Create Content
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
