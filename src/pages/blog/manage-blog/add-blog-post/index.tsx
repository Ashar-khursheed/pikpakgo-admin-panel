import { useCallback, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  ToggleRight,
  Image,
  Search,
  Code2,
  Plus,
  Trash2,
  Twitter,
  Star,
  MessageSquare,
  CalendarDays,
  Upload,
  X,
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

interface BlogCategoryApiResponse {
  success: boolean;
  data: BlogCategory[];
}

interface FormState {
  title: string;
  slug: string;
  blog_category_id: string;
  excerpt: string;
  content: string;
  featured_image: File | null;
  gallery: File[];
  tags: string[];
  status: string;
  published_at: string;
  is_featured: boolean;
  allow_comments: boolean;
  meta_title: string;
  meta_description: string;
  og_title: string;
  og_description: string;
  og_image: File | null;
  twitter_title: string;
  twitter_description: string;
  twitter_image: File | null;
  canonical_url: string;
  no_index: boolean;
  schema_markup: string;
}

type FormErrors = Partial<Record<keyof FormState, string>>;

const STATUS_OPTIONS = ["draft", "published", "scheduled", "archived"];

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

// ─── Helpers ──────────────────────────────────────────────────────────────────
function slugify(str: string) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

// ─── Single Image Drop Zone ────────────────────────────────────────────────────
function ImageDropZone({
  value,
  onChange,
  label,
}: {
  value: File | null;
  onChange: (file: File | null) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const preview = value ? URL.createObjectURL(value) : null;

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) onChange(file);
    },
    [onChange]
  );

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onChange(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-2">
      {label && (
        <Label className="flex items-center gap-1.5 text-sm font-medium">
          <Image className="w-3.5 h-3.5 text-muted-foreground" />
          {label}
        </Label>
      )}
      {preview ? (
        <div className="relative w-full rounded-lg overflow-hidden border bg-muted">
          <img
            src={preview}
            alt="preview"
            className="w-full h-44 object-cover"
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <p className="text-xs text-muted-foreground px-3 py-1.5 truncate bg-background border-t">
            {value?.name}
          </p>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center gap-2 h-36 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
            dragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 bg-muted/40 hover:border-primary/50 hover:bg-primary/5"
          }`}
        >
          <Upload className="w-6 h-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground text-center">
            Drag & drop an image here, or{" "}
            <span className="text-primary font-medium">choose file</span>
          </p>
          <p className="text-xs text-muted-foreground">PNG, JPG, WEBP</p>
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}

// ─── Gallery Drop Zone ─────────────────────────────────────────────────────────
function GalleryDropZone({
  files,
  onChange,
}: {
  files: File[];
  onChange: (files: File[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const newFiles = Array.from(incoming).filter((f) =>
        f.type.startsWith("image/")
      );
      const merged = [
        ...files,
        ...newFiles.filter((n) => !files.some((f) => f.name === n.name)),
      ];
      onChange(merged);
    },
    [files, onChange]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
    e.target.value = "";
  };

  const remove = (name: string) => onChange(files.filter((f) => f.name !== name));

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-1.5 text-sm font-medium">
        <Image className="w-3.5 h-3.5 text-muted-foreground" />
        Gallery Images
      </Label>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`flex flex-col items-center justify-center gap-2 h-28 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${
          dragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 bg-muted/40 hover:border-primary/50 hover:bg-primary/5"
        }`}
      >
        <Upload className="w-5 h-5 text-muted-foreground" />
        <p className="text-sm text-muted-foreground text-center">
          Drag & drop images or{" "}
          <span className="text-primary font-medium">choose files</span>
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFileInput}
      />
      {files.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mt-1">
          {files.map((file) => {
            const url = URL.createObjectURL(file);
            return (
              <div
                key={file.name}
                className="relative group rounded-md overflow-hidden border aspect-square"
              >
                <img src={url} alt={file.name} className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => remove(file.name)}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Field wrapper ────────────────────────────────────────────────────────────
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

// ─── CKEditor wrapper ──────────────────────────────────────────────────────────
function RichEditor({
  label,
  icon: Icon,
  value,
  onChange,
  required,
  error,
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
export default function AddBlogPost() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [errors, setErrors] = useState<FormErrors>({});
  const [tagInput, setTagInput] = useState("");

  const [form, setForm] = useState<FormState>({
    title: "",
    slug: "",
    blog_category_id: "",
    excerpt: "",
    content: "",
    featured_image: null,
    gallery: [],
    tags: [],
    status: "draft",
    published_at: new Date().toISOString().slice(0, 16),
    is_featured: false,
    allow_comments: true,
    meta_title: "",
    meta_description: "",
    og_title: "",
    og_description: "",
    og_image: null,
    twitter_title: "",
    twitter_description: "",
    twitter_image: null,
    canonical_url: "",
    no_index: false,
    schema_markup: "",
  });

  const set = <K extends keyof FormState>(key: K, val: FormState[K]) => {
    setForm((p) => ({ ...p, [key]: val }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: undefined }));
  };

  // ── Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ["blog-categories-select"],
    queryFn: () =>
      makeApiRequest<BlogCategoryApiResponse>(apiUrl.getAllBlogCategories),
  });
  const categories = categoriesData?.data ?? [];

  // ── Title → auto-fill slug / meta / og
  const handleTitleChange = (val: string) => {
    set("title", val);
    if (!form.slug || form.slug === slugify(form.title)) {
      setForm((p) => ({ ...p, title: val, slug: slugify(val) }));
    }
    if (!form.meta_title) setForm((p) => ({ ...p, meta_title: val }));
    if (!form.og_title) setForm((p) => ({ ...p, og_title: val }));
    if (!form.twitter_title) setForm((p) => ({ ...p, twitter_title: val }));
    if (errors.title) setErrors((p) => ({ ...p, title: undefined }));
  };

  // ── Tags
  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) set("tags", [...form.tags, t]);
    setTagInput("");
  };

  const removeTag = (tag: string) =>
    set("tags", form.tags.filter((t) => t !== tag));

  // ── Validation
  const validate = (): boolean => {
    const errs: FormErrors = {};
    if (!form.title.trim()) errs.title = "Title is required";
    if (!form.slug.trim()) errs.slug = "Slug is required";
    if (!form.blog_category_id) errs.blog_category_id = "Category is required";
    if (!form.content.trim()) errs.content = "Content is required";
    if (!form.status) errs.status = "Status is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Mutation (multipart/form-data)
  const { mutate, isPending } = useMutation({
    mutationFn: (fd: FormData) =>
      makeApiRequest(apiUrl.createBlogPost, {
        method: "POST",
        data: fd,
        headers: { "Content-Type": "multipart/form-data" },
      }),
    onSuccess: () => {
      toast.success("Blog post created successfully");
      queryClient.invalidateQueries({ queryKey: ["blog-posts"] });
      navigate("/blog/manage-blog");
    },
    onError: () => toast.error("Failed to create blog post"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    let schemaObj: string | null = null;
    if (form.schema_markup.trim()) {
      try {
        schemaObj = JSON.stringify(JSON.parse(form.schema_markup));
      } catch {
        setErrors((p) => ({ ...p, schema_markup: "Invalid JSON format" }));
        return;
      }
    }

    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("slug", form.slug);
    fd.append("blog_category_id", form.blog_category_id);
    if (form.excerpt) fd.append("excerpt", form.excerpt);
    fd.append("content", form.content);
    if (form.featured_image) fd.append("featured_image", form.featured_image);
    form.gallery.forEach((f) => fd.append("gallery[]", f));
    form.tags.forEach((t) => fd.append("tags[]", t));
    fd.append("status", form.status);
    if (form.published_at) fd.append("published_at", new Date(form.published_at).toISOString());
    fd.append("is_featured", String(form.is_featured));
    fd.append("allow_comments", String(form.allow_comments));
    if (form.meta_title) fd.append("meta_title", form.meta_title);
    if (form.meta_description) fd.append("meta_description", form.meta_description);
    if (form.og_title) fd.append("og_title", form.og_title);
    if (form.og_description) fd.append("og_description", form.og_description);
    if (form.og_image) fd.append("og_image", form.og_image);
    if (form.twitter_title) fd.append("twitter_title", form.twitter_title);
    if (form.twitter_description) fd.append("twitter_description", form.twitter_description);
    if (form.twitter_image) fd.append("twitter_image", form.twitter_image);
    if (form.canonical_url) fd.append("canonical_url", form.canonical_url);
    fd.append("no_index", String(form.no_index));
    if (schemaObj) fd.append("schema_markup", schemaObj);

    mutate(fd);
  };

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
          <h1 className="text-2xl font-bold tracking-tight">Add Blog Post</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Create a new blog post</p>
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
                onChange={(e) => handleTitleChange(e.target.value)}
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Slug" icon={Tag} required error={errors.slug} hint="Auto-filled from title">
                <Input
                  placeholder="solo-travel-guide-2027"
                  value={form.slug}
                  onChange={(e) => set("slug", slugify(e.target.value))}
                />
              </Field>

              <Field label="Category" icon={FileText} required error={errors.blog_category_id}>
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
            </div>

            <Field label="Excerpt" icon={FileText} hint="Short summary shown in listings">
              <Textarea
                placeholder="Travel alone with confidence."
                rows={2}
                value={form.excerpt}
                onChange={(e) => set("excerpt", e.target.value)}
              />
            </Field>

            {/* Featured Image — drag & drop */}
            <ImageDropZone
              label="Featured Image"
              value={form.featured_image}
              onChange={(f) => set("featured_image", f)}
            />

            {/* Gallery — drag & drop multi */}
            <GalleryDropZone
              files={form.gallery}
              onChange={(files) => set("gallery", files)}
            />

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
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
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
                <Select value={form.status} onValueChange={(v) => set("status", v)}>
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
              <Field label="OG Description" icon={Globe}>
                <Input
                  placeholder="Travel alone safely."
                  value={form.og_description}
                  onChange={(e) => set("og_description", e.target.value)}
                />
              </Field>
            </div>
            <ImageDropZone
              label="OG Image"
              value={form.og_image}
              onChange={(f) => set("og_image", f)}
            />
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
              <Field label="Twitter Description" icon={Twitter}>
                <Input
                  placeholder="Solo travel tips"
                  value={form.twitter_description}
                  onChange={(e) => set("twitter_description", e.target.value)}
                />
              </Field>
            </div>
            <ImageDropZone
              label="Twitter Image"
              value={form.twitter_image}
              onChange={(f) => set("twitter_image", f)}
            />
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
                Creating...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Create Blog Post
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
