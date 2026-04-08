import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useEffect } from "react";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Save,
  Tag,
  Percent,
  DollarSign,
  Globe,
  SlidersHorizontal,
  ToggleRight,
  Hash,
  FileText,
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

// ─── Schema ──────────────────────────────────────────────────────────────────
const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  markup_type: z.enum(["percentage", "fixed", "tiered"], {
    required_error: "Markup type is required",
  }),
  markup_percentage: z
    .string()
    .min(1, "Required")
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 0, "Must be a valid number"),
  markup_fixed_amount: z
    .string()
    .min(1, "Required")
    .refine((v) => !isNaN(Number(v)) && Number(v) >= 0, "Must be a valid number"),
  provider: z.enum(["ownerrez", "hotelbeds"], {
    required_error: "Provider is required",
  }),
  priority: z
    .string()
    .min(1, "Required")
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, "Must be a positive number"),
  is_active: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface PricingMarkup {
  id: number;
  name: string;
  description: string | null;
  markup_type: "percentage" | "fixed" | "tiered";
  markup_percentage: string;
  markup_fixed_amount: string;
  provider: string | null;
  priority: number;
  is_active: boolean;
}

interface ApiResponse {
  success: boolean;
  data: PricingMarkup;
}

// ─── Field wrapper ────────────────────────────────────────────────────────────
function Field({
  label,
  icon: Icon,
  error,
  required,
  children,
}: {
  label: string;
  icon: React.ElementType;
  error?: string;
  required?: boolean;
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
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}

const MARKUP_TYPES = [
  { value: "percentage", label: "Percentage (%)" },
  { value: "fixed", label: "Fixed Amount ($)" },
  { value: "tiered", label: "Tiered Pricing" },
];

const PROVIDERS = [
  { value: "ownerrez", label: "OwnerRez" },
  { value: "hotelbeds", label: "Hotelbeds" },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function EditPricingMarkup() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // ─── Fetch existing data ─────────────────────────────────────────────────────
  const { data, isLoading, isError } = useQuery<ApiResponse>({
    queryKey: ["pricing-markup", id],
    queryFn: () =>
      makeApiRequest<ApiResponse>(`${apiUrl.getPricingMarkupById}/${id}`),
    enabled: !!id,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      markup_type: "percentage",
      provider: "ownerrez",
      is_active: true,
      priority: "1",
      markup_percentage: "",
      markup_fixed_amount: "",
    },
  });

  // ─── Autofill form when data loads ──────────────────────────────────────────
  useEffect(() => {
    if (data?.data) {
      const m = data.data;
      reset({
        name: m.name,
        description: m.description ?? "",
        markup_type: m.markup_type,
        markup_percentage: m.markup_percentage,
        markup_fixed_amount: m.markup_fixed_amount,
        provider: (m.provider as FormValues["provider"]) ?? "ownerrez",
        priority: String(m.priority),
        is_active: m.is_active,
      });
    }
  }, [data, reset]);

  const { mutate, isPending } = useMutation({
    mutationFn: (values: FormValues) =>
      makeApiRequest(`${apiUrl.getPricingMarkupById}/${id}`, {
        method: "PUT",
        data: {
          ...values,
          markup_percentage: Number(values.markup_percentage),
          markup_fixed_amount: Number(values.markup_fixed_amount),
          priority: Number(values.priority),
        },
      }),
    onSuccess: () => {
      toast.success("Pricing markup updated successfully");
      queryClient.invalidateQueries({ queryKey: ["pricing-markups"] });
      queryClient.invalidateQueries({ queryKey: ["pricing-markup", id] });
      navigate("/get-all-pricing-markup");
    },
    onError: () => {
      toast.error("Failed to update pricing markup");
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-destructive">
        <AlertCircle className="w-10 h-10" />
        <p className="text-sm font-medium">Failed to load pricing markup</p>
      </div>
    );
  }

  const isActive = watch("is_active");
  const markupType = watch("markup_type");

  return (
    <div className="space-y-6 p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/get-all-pricing-markup")}
          className="rounded-full"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Pricing Markup</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Update markup rule — #{id}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit((v) => mutate(v))} className="space-y-5">
        {/* Basic Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field label="Markup Name" icon={Tag} error={errors.name?.message} required>
              <Input placeholder="e.g. Standard 10% Markup" {...register("name")} />
            </Field>

            <Field label="Description" icon={FileText} error={errors.description?.message}>
              <Textarea
                placeholder="Optional description for this markup rule..."
                rows={2}
                {...register("description")}
              />
            </Field>
          </CardContent>
        </Card>

        {/* Markup Configuration */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" />
              Markup Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Field
              label="Markup Type"
              icon={SlidersHorizontal}
              error={errors.markup_type?.message}
              required
            >
              <Select
                value={markupType}
                onValueChange={(v) =>
                  setValue("markup_type", v as FormValues["markup_type"], {
                    shouldValidate: true,
                    shouldDirty: true,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select markup type" />
                </SelectTrigger>
                <SelectContent>
                  {MARKUP_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Markup Percentage (%)"
                icon={Percent}
                error={errors.markup_percentage?.message}
                required
              >
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="e.g. 10"
                    className="pr-8"
                    {...register("markup_percentage")}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                    %
                  </span>
                </div>
              </Field>

              <Field
                label="Fixed Amount ($)"
                icon={DollarSign}
                error={errors.markup_fixed_amount?.message}
                required
              >
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                    $
                  </span>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="e.g. 50"
                    className="pl-7"
                    {...register("markup_fixed_amount")}
                  />
                </div>
              </Field>
            </div>
          </CardContent>
        </Card>

        {/* Provider & Priority */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Provider & Priority
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field
                label="Provider"
                icon={Globe}
                error={errors.provider?.message}
                required
              >
                <Select
                  value={watch("provider")}
                  onValueChange={(v) =>
                    setValue("provider", v as FormValues["provider"], {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROVIDERS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field
                label="Priority"
                icon={Hash}
                error={errors.priority?.message}
                required
              >
                <Input
                  type="number"
                  min="1"
                  placeholder="e.g. 1"
                  {...register("priority")}
                />
              </Field>
            </div>
          </CardContent>
        </Card>

        {/* Status */}
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
                  Enable this markup rule to apply it to properties
                </p>
              </div>
              <Switch
                checked={isActive}
                onCheckedChange={(v) => setValue("is_active", v, { shouldDirty: true })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pb-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/get-all-pricing-markup")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending || !isDirty} className="min-w-36">
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
