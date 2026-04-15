import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  User, Mail, Phone, Globe, MapPin, Home,
  CalendarDays, Languages, DollarSign,
  Loader2, AlertCircle, Save, UserCircle, ArrowLeft,
} from "lucide-react";

import makeApiRequest from "@/services/axios";
import { apiUrl } from "@/services/api-end-point";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// ─── Types ───────────────────────────────────────────────
interface UserProfile {
  id: number;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  user_type: string;
  status: string;
  email_verified: boolean;
  country: string;
  city?: string;
  state?: string;
  zip_code?: string;
  address?: string;
  date_of_birth?: string;
  gender?: string;
  preferred_currency: string;
  preferred_language: string;
}

interface MeResponse {
  success: boolean;
  data: UserProfile;
}

// ─── Zod Schema ──────────────────────────────────────────
const profileSchema = z.object({
  first_name: z.string().min(1, "Required"),
  last_name: z.string().min(1, "Required"),
  phone: z.string().min(1, "Required"),
  country: z.string().min(1, "Required"),
  city: z.string().min(1, "Required"),
  state: z.string().min(1, "Required"),
  zip_code: z.string().optional(),
  address: z.string().min(1, "Required"),
  date_of_birth: z.string().min(1, "Required"),
  gender: z.enum(["male", "female", "other"]),
  preferred_currency: z.enum(["USD", "EUR", "GBP", "AED", "PKR", "INR"]),
  preferred_language: z.enum(["en", "fr", "ar", "es", "ur", "hi"]),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

// ─── Constants ───────────────────────────────────────────
const CURRENCIES = [
  { value: "USD", label: "USD — US Dollar" },
  { value: "EUR", label: "EUR — Euro" },
  { value: "GBP", label: "GBP — British Pound" },
  { value: "AED", label: "AED — UAE Dirham" },
  { value: "PKR", label: "PKR — Pakistani Rupee" },
  { value: "INR", label: "INR — Indian Rupee" },
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "fr", label: "French" },
  { value: "ar", label: "Arabic" },
  { value: "es", label: "Spanish" },
  { value: "ur", label: "Urdu" },
  { value: "hi", label: "Hindi" },
];

// ─── Field wrapper ────────────────────────────────────────
function FieldGroup({
  label, icon: Icon, error, children,
}: {
  label: string;
  icon: React.ElementType;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1.5 text-sm font-medium">
        <Icon className="w-3.5 h-3.5 text-muted-foreground" />
        {label}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────
export default function EditProfile() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: meData, isLoading, isError, error } = useQuery<MeResponse>({
    queryKey: ["profile"],
    queryFn: () => makeApiRequest<MeResponse>(apiUrl.me),
    staleTime: 1000 * 60 * 5,
  });

  const profile = meData?.data;

  const {
    register, handleSubmit, setValue, watch, reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      gender: "male",
      preferred_currency: "USD",
      preferred_language: "en",
    },
  });

  useEffect(() => {
    if (profile) {
      reset({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        phone: profile.phone || "",
        country: profile.country || "",
        city: profile.city || "",
        state: profile.state || "",
        zip_code: profile.zip_code || "",
        address: profile.address || "",
        date_of_birth: profile.date_of_birth || "",
        gender: (profile.gender as ProfileFormValues["gender"]) || "male",
        preferred_currency: (profile.preferred_currency as ProfileFormValues["preferred_currency"]) || "USD",
        preferred_language: (profile.preferred_language as ProfileFormValues["preferred_language"]) || "en",
      });
    }
  }, [profile, reset]);

  const mutation = useMutation({
    mutationFn: (values: ProfileFormValues) =>
      makeApiRequest(apiUrl.updateProfile, { method: "PUT", data: values }),
    onSuccess: () => {
      toast.success("Profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      navigate("/settings/profile");
    },
    onError: () => {
      toast.error("Failed to update profile");
    },
  });

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
        <p className="text-sm font-medium">
          {(error as Error)?.message || "Failed to load profile"}
        </p>
      </div>
    );
  }

  return (
    <div className=" space-y-6 p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/settings/profile")}
            className="rounded-full"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Profile</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Update your personal information
            </p>
          </div>
        </div>
        {/* Read-only name pill */}
        {profile && (
          <div className="hidden sm:flex items-center gap-2 bg-muted px-3 py-1.5 rounded-full">
            <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">
              {(profile.first_name || "").slice(0, 1).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-muted-foreground">{profile.first_name} {profile.last_name}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-5">
        {/* Personal Info */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <UserCircle className="w-4 h-4" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FieldGroup label="First Name" icon={User} error={errors.first_name?.message}>
                <Input placeholder="John" {...register("first_name")} />
              </FieldGroup>
              <FieldGroup label="Last Name" icon={User} error={errors.last_name?.message}>
                <Input placeholder="Doe" {...register("last_name")} />
              </FieldGroup>
            </div>

            {/* Email — read-only */}
            <FieldGroup label="Email" icon={Mail} >
              <Input value={profile?.email || ""} readOnly disabled className="bg-muted cursor-not-allowed" />
            </FieldGroup>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FieldGroup label="Phone" icon={Phone} error={errors.phone?.message}>
                <Input placeholder="+1 234 567 8900" {...register("phone")} />
              </FieldGroup>
              <FieldGroup label="Date of Birth" icon={CalendarDays} error={errors.date_of_birth?.message}>
                <Input type="date" {...register("date_of_birth")} />
              </FieldGroup>
            </div>

            <FieldGroup label="Gender" icon={User} error={errors.gender?.message}>
              <Select
                value={watch("gender")}
                onValueChange={(v) => setValue("gender", v as ProfileFormValues["gender"], { shouldDirty: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <FieldGroup label="Country" icon={Globe} error={errors.country?.message}>
                <Input placeholder="USA" {...register("country")} />
              </FieldGroup>
              <FieldGroup label="State" icon={MapPin} error={errors.state?.message}>
                <Input placeholder="California" {...register("state")} />
              </FieldGroup>
              <FieldGroup label="City" icon={MapPin} error={errors.city?.message}>
                <Input placeholder="Los Angeles" {...register("city")} />
              </FieldGroup>
              <FieldGroup label="Zip Code" icon={MapPin} error={errors.zip_code?.message}>
                <Input placeholder="90001" {...register("zip_code")} />
              </FieldGroup>
            </div>
            <FieldGroup label="Address" icon={Home} error={errors.address?.message}>
              <Textarea placeholder="123 Main Street, Apt 4B" rows={2} {...register("address")} />
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Preferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FieldGroup label="Preferred Currency" icon={DollarSign} error={errors.preferred_currency?.message}>
                <Select
                  value={watch("preferred_currency")}
                  onValueChange={(v) => setValue("preferred_currency", v as ProfileFormValues["preferred_currency"], { shouldDirty: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCIES.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldGroup>

              <FieldGroup label="Preferred Language" icon={Languages} error={errors.preferred_language?.message}>
                <Select
                  value={watch("preferred_language")}
                  onValueChange={(v) => setValue("preferred_language", v as ProfileFormValues["preferred_language"], { shouldDirty: true })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((l) => (
                      <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldGroup>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/settings/profile")}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending || !isDirty} className="min-w-32">
            {mutation.isPending ? (
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
