import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
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
  AlignLeft,
  Palette,
} from "lucide-react";

import makeApiRequest from "@/services/axios";
import { apiUrl } from "@/services/api-end-point";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

// ─── Types ────────────────────────────────────────────────────────────────────
interface FormState {
  name: string;
  slug: string;
  description: string;
  featured_image: string;
  color: string;
  sort_order: string;
  is_active: boolean;
  meta_title: string;
  meta_description: string;
  og_image: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

// ─── Field wrapper ─────────────────────────────────────────────────────────────
function Field({
  label,
  icon: Icon,
  error,
  required,
  hint,
  children,
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

// ─── Slugify helper ────────────────────────────────────────────────────────────
function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function AddBlogCategory() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [errors, setErrors] = useState<FormErrors>({});

  const [form, setForm] = useState<FormState>({
    name: "",
    slug: "",
    description: "",
    featured_image: "",
    color: "#3B82F6",
    sort_order: "1",
    is_active: true,
    meta_title: "",
    meta_description: "",
    og_image: "",
  });

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) => {
    setForm((p) => ({ ...p, [key]: val }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const handleNameChange = (val: string) => {
    set("name", val);
    if (!form.slug || form.slug === slugify(form.name)) {
      setForm((p) => ({ ...p, name: val, slug: slugify(val) }));
    }
    if (!form.meta_title) setForm((p) => ({ ...p, meta_title: val }));
  };

  // ── Validation
  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.name.trim()) errs.name = "Name is required";
    if (!form.slug.trim()) errs.slug = "Slug is required";
    if (form.sort_order !== "" && isNaN(Number(form.sort_order)))
      errs.sort_order = "Sort order must be a number";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Mutation
  const { mutate, isPending } = useMutation({
    mutationFn: (payload: object) =>
      makeApiRequest(apiUrl.createBlogCategory, { method: "POST", data: payload }),
    onSuccess: () => {
      toast.success("Blog category created successfully");
      queryClient.invalidateQueries({ queryKey: ["blog-categories"] });
      navigate("/blog/manage-blog-category");
    },
    onError: () => {
      toast.error("Failed to create blog category");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    mutate({
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim() || null,
      featured_image: form.featured_image.trim() || null,
      color: form.color || null,
      sort_order: Number(form.sort_order) || 1,
      is_active: form.is_active,
      meta_title: form.meta_title.trim() || null,
      meta_description: form.meta_description.trim() || null,
      og_image: form.og_image.trim() || null,
    });
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* ── Header ── */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => navigate("/blog/manage-blog-category")}
          className="rounded-full"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add Blog Category</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Create a new blog category
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── Basic Information ─────────────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">

            {/* Name */}
            <Field label="Name" icon={FileText} required error={errors.name}>
              <Input
                placeholder="e.g. Travel Tips"
                value={form.name}
                onChange={(e) => handleNameChange(e.target.value)}
              />
            </Field>

            {/* Slug */}
            <Field
              label="Slug"
              icon={Tag}
              required
              error={errors.slug}
              hint="URL-friendly identifier, auto-filled from name"
            >
              <Input
                placeholder="e.g. travel-tips"
                value={form.slug}
                onChange={(e) => set("slug", slugify(e.target.value))}
              />
            </Field>

            {/* Description */}
            <Field label="Description" icon={AlignLeft} hint="Short description of this category">
              <Textarea
                placeholder="e.g. Helpful tips for smart and safe travel"
                rows={3}
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
              />
            </Field>

            {/* Featured Image + Color */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Featured Image"
                icon={Image}
                hint="Filename or URL (e.g. travel.jpg)"
              >
                <Input
                  placeholder="travel.jpg"
                  value={form.featured_image}
                  onChange={(e) => set("featured_image", e.target.value)}
                />
              </Field>

              <Field
                label="Color"
                icon={Palette}
                hint="Category accent color"
              >
                <div className="flex gap-2 items-center">
                  {/* Native color picker */}
                  <label
                    className="w-10 h-10 rounded-lg border cursor-pointer flex-shrink-0 overflow-hidden"
                    style={{ backgroundColor: form.color }}
                  >
                    <input
                      type="color"
                      value={form.color}
                      onChange={(e) => set("color", e.target.value)}
                      className="opacity-0 w-0 h-0"
                    />
                  </label>
                  {/* Hex text input */}
                  <Input
                    placeholder="#3B82F6"
                    value={form.color}
                    maxLength={7}
                    onChange={(e) => {
                      const v = e.target.value;
                      set("color", v);
                    }}
                    className="font-mono"
                  />
                </div>
              </Field>
            </div>

            {/* Sort Order + Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Sort Order"
                icon={Hash}
                error={errors.sort_order}
                hint="Lower number = shown first"
              >
                <Input
                  type="number"
                  min="1"
                  placeholder="1"
                  value={form.sort_order}
                  onChange={(e) => set("sort_order", e.target.value)}
                />
              </Field>
            </div>
          </CardContent>
        </Card>

        {/* ── SEO & Meta ───────────────────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Search className="w-4 h-4" />
              SEO & Meta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field
              label="Meta Title"
              icon={Search}
              hint="Recommended: 50–60 characters"
            >
              <Input
                placeholder="e.g. Travel Tips Guide"
                value={form.meta_title}
                onChange={(e) => set("meta_title", e.target.value)}
              />
            </Field>

            <Field
              label="Meta Description"
              icon={Search}
              hint="Recommended: 150–160 characters"
            >
              <Textarea
                placeholder="e.g. Explore the best travel tips for your journey"
                rows={3}
                value={form.meta_description}
                onChange={(e) => set("meta_description", e.target.value)}
              />
            </Field>
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
          <CardContent>
            <Field
              label="OG Image"
              icon={Image}
              hint="Filename or URL used when shared on social media"
            >
              <Input
                placeholder="travel-og.jpg"
                value={form.og_image}
                onChange={(e) => set("og_image", e.target.value)}
              />
            </Field>
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
          <CardContent>
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Active</p>
                <p className="text-xs text-muted-foreground">
                  Make this category visible on the frontend
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
            onClick={() => navigate("/blog/manage-blog-category")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending} className="min-w-44">
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Create Category
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
