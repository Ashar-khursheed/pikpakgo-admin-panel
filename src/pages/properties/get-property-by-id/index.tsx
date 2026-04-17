import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import makeApiRequest from "@/services/axios";
import { apiUrl } from "@/services/api-end-point";
import { formatDate } from "@/utils/utils";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Eye,
  MapPin,
  Pencil,
  Plus,
  RefreshCw,
  Star,
  Tag,
  Trash2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Thumbs, FreeMode } from "swiper/modules";
import { useState } from "react";
import type { Swiper as SwiperType } from "swiper";
import toast from "react-hot-toast";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Bathroom {
  roomSubType: string;
  amenities?: {
    amenity: { count: string; bathroomFeatureName: string } | { count: string; bathroomFeatureName: string }[];
  };
}

interface Bedroom {
  roomSubType: string;
  amenities?: {
    amenity: { count: string; bedroomFeatureName: string } | { count: string; bedroomFeatureName: string }[];
  };
}

interface Property {
  id: number;
  provider: string;
  provider_property_id: string;
  name: string;
  description: string | null;
  property_type: string | null;
  category: string | null;
  star_rating: number | null;
  country: string | null;
  state: string | null;
  city: string | null;
  address: string | null;
  postal_code: string | null;
  latitude: string | null;
  longitude: string | null;
  images: string[];
  featured_image: string | null;
  amenities: string[];
  price_from: number | null;
  price_currency: string;
  is_active: boolean;
  is_featured: boolean;
  view_count: number;
  booking_count: number;
  rating_average: number | null;
  rating_count: number;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
  api_data: {
    propertyUrl?: string;
    location?: {
      address?: {
        addressLine1?: string;
        city?: string;
        stateOrProvince?: string;
        country?: string;
        postalCode?: string;
      };
    };
    units?: {
      unit?: {
        area?: string;
        areaUnit?: string;
        bathrooms?: { bathroom: Bathroom | Bathroom[] };
        bedrooms?: { bedroom: Bedroom | Bedroom[] };
        propertyType?: string;
      };
    };
  };
}

interface PropertyFee {
  id: number;
  fee_type: string;
  fee_name: string;
  amount: number;
  amount_type: string;
  applies_to: string;
  is_mandatory: boolean;
  is_taxable: boolean;
  is_active: boolean;
}

interface PropertyApiResponse {
  success: boolean;
  data: Property;
}

interface FeesApiResponse {
  success: boolean;
  data: {
    property: { id: number; name: string; provider_property_id: string };
    fees: PropertyFee[];
  };
}

// ─── Default fee form ─────────────────────────────────────────────────────────
const DEFAULT_FEE_FORM = {
  fee_type: "cleaning_fee",
  fee_name: "",
  amount: "",
  amount_type: "fixed",
  applies_to: "per_stay",
  is_mandatory: true,
  is_taxable: false,
  is_active: true,
};
// ─────────────────────────────────────────────────────────────────────────────

function formatAmenityLabel(key: string) {
  return key
    .replace(/^[A-Z_]+?_/, "")
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());
}

function toArray<T>(val: T | T[] | undefined): T[] {
  if (!val) return [];
  return Array.isArray(val) ? val : [val];
}

// ─── Fee Form Fields (shared between Add & Edit modals) ───────────────────────
function FeeFormFields({
  form,
  onChange,
}: {
  form: typeof DEFAULT_FEE_FORM;
  onChange: (updated: typeof DEFAULT_FEE_FORM) => void;
}) {
  const set = (patch: Partial<typeof DEFAULT_FEE_FORM>) =>
    onChange({ ...form, ...patch });

  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Fee Type</Label>
        <Select value={form.fee_type} onValueChange={(v) => set({ fee_type: v })}>
          <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="cleaning_fee">Cleaning Fee</SelectItem>
            <SelectItem value="service_fee">Service Fee</SelectItem>
            <SelectItem value="pet_fee">Pet Fee</SelectItem>
            <SelectItem value="resort_fee">Resort Fee</SelectItem>
            <SelectItem value="parking_fee">Parking Fee</SelectItem>
            <SelectItem value="extra_guest_fee">Extra Guest Fee</SelectItem>
            <SelectItem value="security_deposit">Security Deposit</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Fee Name</Label>
        <Input
          className="col-span-3"
          placeholder="e.g. Cleaning Fee"
          value={form.fee_name}
          onChange={(e) => set({ fee_name: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Amount</Label>
        <Input
          className="col-span-3"
          type="number"
          min={0}
          placeholder="e.g. 75"
          value={form.amount}
          onChange={(e) => set({ amount: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Amount Type</Label>
        <Select value={form.amount_type} onValueChange={(v) => set({ amount_type: v })}>
          <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="fixed">Fixed</SelectItem>
            <SelectItem value="percentage">Percentage</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Applies To</Label>
        <Select value={form.applies_to} onValueChange={(v) => set({ applies_to: v })}>
          <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="per_stay">Per Stay</SelectItem>
            <SelectItem value="per_night">Per Night</SelectItem>
            <SelectItem value="per_guest">Per Guest</SelectItem>
            <SelectItem value="per_guest_per_night">Per Guest Per Night</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Mandatory</Label>
        <div className="col-span-3">
          <Switch
            checked={form.is_mandatory}
            onCheckedChange={(v) => set({ is_mandatory: v })}
          />
        </div>
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Taxable</Label>
        <div className="col-span-3">
          <Switch
            checked={form.is_taxable}
            onCheckedChange={(v) => set({ is_taxable: v })}
          />
        </div>
      </div>

      <div className="grid grid-cols-4 items-center gap-4">
        <Label className="text-right">Active</Label>
        <div className="col-span-3">
          <Switch
            checked={form.is_active}
            onCheckedChange={(v) => set({ is_active: v })}
          />
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);

  // ─── Modal state ─────────────────────────────────────────────────────────────
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({ ...DEFAULT_FEE_FORM });

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<PropertyFee | null>(null);
  const [editForm, setEditForm] = useState({ ...DEFAULT_FEE_FORM });

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingFee, setDeletingFee] = useState<PropertyFee | null>(null);

  // ─── Fetch property ───────────────────────────────────────────────────────────
  const { data, isFetching, refetch } = useQuery({
    queryKey: ["property", id],
    queryFn: () =>
      makeApiRequest<PropertyApiResponse>(`${apiUrl.getPropertyById}/${id}`),
    enabled: !!id,
  });

  // ─── Fetch fees ───────────────────────────────────────────────────────────────
  const { data: feesData, isFetching: isFetchingFees, refetch: refetchFees } = useQuery({
    queryKey: ["property-fees", id],
    queryFn: () =>
      makeApiRequest<FeesApiResponse>(`${apiUrl.addPropertyFee}/${id}/fees`),
    enabled: !!id,
  });

  const property = data?.data;
  const fees: PropertyFee[] = (feesData?.data as { fees?: PropertyFee[] })?.fees ?? [];

  // ─── Add fee mutation ─────────────────────────────────────────────────────────
  const { mutate: addFee, isPending: isAdding } = useMutation({
    mutationFn: (payload: typeof DEFAULT_FEE_FORM & { amount: number }) =>
      makeApiRequest(`${apiUrl.addPropertyFee}/${id}/fees`, {
        method: "POST",
        data: payload,
      }),
    onSuccess: () => {
      toast.success("Fee added successfully");
      setAddModalOpen(false);
      setAddForm({ ...DEFAULT_FEE_FORM });
      queryClient.invalidateQueries({ queryKey: ["property-fees", id] });
    },
    onError: () => toast.error("Failed to add fee"),
  });

  // ─── Edit fee mutation ────────────────────────────────────────────────────────
  const { mutate: updateFee, isPending: isUpdating } = useMutation({
    mutationFn: (payload: typeof DEFAULT_FEE_FORM & { amount: number }) =>
      makeApiRequest(`${apiUrl.addPropertyFee}/${id}/fees/${editingFee?.id}`, {
        method: "PUT",
        data: payload,
      }),
    onSuccess: () => {
      toast.success("Fee updated successfully");
      setEditModalOpen(false);
      setEditingFee(null);
      queryClient.invalidateQueries({ queryKey: ["property-fees", id] });
    },
    onError: () => toast.error("Failed to update fee"),
  });

  // ─── Delete fee mutation ──────────────────────────────────────────────────────
  const { mutate: deleteFee, isPending: isDeleting } = useMutation({
    mutationFn: () =>
      makeApiRequest(`${apiUrl.addPropertyFee}/${id}/fees/${deletingFee?.id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      toast.success("Fee deleted successfully");
      setDeleteModalOpen(false);
      setDeletingFee(null);
      queryClient.invalidateQueries({ queryKey: ["property-fees", id] });
    },
    onError: () => toast.error("Failed to delete fee"),
  });

  // ─── Handlers ────────────────────────────────────────────────────────────────
  const handleAddSubmit = () => {
    if (!addForm.fee_name.trim() || !addForm.amount) {
      toast.error("Fee name and amount are required");
      return;
    }
    addFee({ ...addForm, amount: Number(addForm.amount) });
  };

  const handleEditOpen = (fee: PropertyFee) => {
    setEditingFee(fee);
    setEditForm({
      fee_type: fee.fee_type,
      fee_name: fee.fee_name,
      amount: String(fee.amount),
      amount_type: fee.amount_type,
      applies_to: fee.applies_to,
      is_mandatory: fee.is_mandatory,
      is_taxable: fee.is_taxable,
      is_active: fee.is_active,
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = () => {
    if (!editForm.fee_name.trim() || !editForm.amount) {
      toast.error("Fee name and amount are required");
      return;
    }
    updateFee({ ...editForm, amount: Number(editForm.amount) });
  };

  const handleDeleteOpen = (fee: PropertyFee) => {
    setDeletingFee(fee);
    setDeleteModalOpen(true);
  };

  // ─────────────────────────────────────────────────────────────────────────────

  if (isFetching) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-7 w-56" />
              <Skeleton className="h-4 w-36" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-9 rounded-md" />
            <Skeleton className="h-9 w-36 rounded-md" />
          </div>
        </div>
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <Skeleton className="w-full h-[420px] rounded-none" />
            <div className="flex gap-1.5 px-2 py-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-20 flex-1 rounded" />
              ))}
            </div>
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader><Skeleton className="h-5 w-24" /></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <div className="grid grid-cols-4 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 rounded-lg" />
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><Skeleton className="h-5 w-24" /></CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <Skeleton key={i} className="h-6 w-24 rounded-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader><Skeleton className="h-5 w-20" /></CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">Property not found.</p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Go back
        </Button>
      </div>
    );
  }

  const images = property.images?.length ? property.images : [];
  const unit = property.api_data?.units?.unit;
  const bathrooms = toArray(unit?.bathrooms?.bathroom);
  const bedrooms = toArray(unit?.bedrooms?.bedroom);
  const address = property.api_data?.location?.address;

  const bedroomCount = bedrooms.filter((b) => b.roomSubType === "BEDROOM").length;
  const bathroomCount = bathrooms.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{property.name}</h1>
            <p className="text-sm text-muted-foreground capitalize">
              {property.provider} · {property.provider_property_id}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => { setAddForm({ ...DEFAULT_FEE_FORM }); setAddModalOpen(true); }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Pricing Fee
          </Button>
          {property.api_data?.propertyUrl && (
            <Button
              size="sm"
              onClick={() => window.open(property.api_data.propertyUrl, "_blank")}
            >
              <Eye className="h-4 w-4 mr-2" />
              View on Provider
            </Button>
          )}
        </div>
      </div>

      {/* ── Top: Image (left half) + Overview & Info (right half) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* Left — Image Slider */}
        <div>
          {images.length > 0 ? (
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <Swiper
                  modules={[Navigation, Pagination, Thumbs]}
                  navigation
                  pagination={{ clickable: true }}
                  thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                  className="w-full h-[320px]"
                >
                  {images.map((src, i) => (
                    <SwiperSlide key={i}>
                      <img
                        src={src}
                        alt={`${property.name} image ${i + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
                {images.length > 1 && (
                  <Swiper
                    modules={[FreeMode, Thumbs]}
                    onSwiper={setThumbsSwiper}
                    freeMode
                    watchSlidesProgress
                    slidesPerView={5}
                    spaceBetween={6}
                    className="h-16 px-2 py-2"
                  >
                    {images.map((src, i) => (
                      <SwiperSlide key={i} className="cursor-pointer rounded overflow-hidden opacity-60 [&.swiper-slide-thumb-active]:opacity-100 [&.swiper-slide-thumb-active]:ring-2 [&.swiper-slide-thumb-active]:ring-primary transition-opacity">
                        <img
                          src={src}
                          alt={`thumb-${i}`}
                          className="w-full h-full object-cover"
                          onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                        />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-40 text-muted-foreground">
                <Building2 className="h-10 w-10 mr-2" />
                No images available
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right — Overview + Sidebar Cards */}
        <div className="space-y-4">

          {/* Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge className={property.is_active ? "bg-green-100 text-green-800 hover:bg-green-100" : "bg-red-100 text-red-800 hover:bg-red-100"}>
                  {property.is_active ? "Active" : "Inactive"}
                </Badge>
                {property.is_featured && (
                  <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Featured</Badge>
                )}
                {property.property_type && (
                  <Badge variant="outline" className="capitalize">
                    <Tag className="h-3 w-3 mr-1" />
                    {property.property_type.replace(/_/g, " ")}
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold">{bedroomCount}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Bedrooms</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold">{bathroomCount}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Bathrooms</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold">{property.view_count}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Views</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold">{property.booking_count}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Bookings</div>
                </div>
              </div>

              {property.description && (
                <>
                  <Separator />
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {property.description}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-sm">
              {address?.addressLine1 && <div>{address.addressLine1}</div>}
              <div className="text-muted-foreground">
                {[property.city, property.state, property.country].filter(Boolean).join(", ")}
              </div>
              {property.postal_code && (
                <div className="text-muted-foreground">{property.postal_code}</div>
              )}
              {property.latitude && property.longitude && (
                <div className="text-xs text-muted-foreground pt-1">
                  {property.latitude}, {property.longitude}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Pricing + Ratings side by side */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Pricing</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Price from</span>
                  <span className="font-medium">
                    {property.price_from != null
                      ? `${property.price_currency} ${property.price_from}`
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Currency</span>
                  <span className="font-medium">{property.price_currency}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Star className="h-4 w-4" /> Ratings
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Average</span>
                  <span className="font-medium">
                    {property.rating_average != null ? property.rating_average : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reviews</span>
                  <span className="font-medium">{property.rating_count}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sync Info */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" /> Sync Info
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last synced</span>
                <span className="font-medium">{formatDate(property.last_synced_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created</span>
                <span className="font-medium">{formatDate(property.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Updated</span>
                <span className="font-medium">{formatDate(property.updated_at)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Bottom: Pricing Fees, Amenities, Rooms (full width) ── */}
      <div className="space-y-6">

        {/* Pricing Fees */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Pricing Fees</CardTitle>
              <Button
                size="sm"
                variant="outline"
                onClick={() => { setAddForm({ ...DEFAULT_FEE_FORM }); setAddModalOpen(true); }}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Fee
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isFetchingFees ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-lg" />
                ))}
              </div>
            ) : fees.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No pricing fees added yet.
              </div>
            ) : (
              <div className="divide-y">
                {fees?.map((fee) => (
                  <div key={fee.id} className="flex items-center justify-between py-3 gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{fee.fee_name}</p>
                      <p className="text-xs text-muted-foreground capitalize mt-0.5">
                        {fee.fee_type.replace(/_/g, " ")}
                        {" · "}
                        {fee.amount_type === "percentage"
                          ? `${fee.amount}%`
                          : `$${fee.amount}`}
                        {" · "}
                        {fee.applies_to.replace(/_/g, " ")}
                        {fee.is_mandatory && " · Mandatory"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge
                        className={
                          fee.is_active
                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                            : "bg-red-100 text-red-800 hover:bg-red-100"
                        }
                      >
                        {fee.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleEditOpen(fee)}
                      >
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteOpen(fee)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Amenities */}
        {property.amenities?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Amenities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {property.amenities.map((a) => (
                  <Badge key={a} variant="secondary" className="text-xs">
                    {formatAmenityLabel(a)}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bedrooms */}
        {bedrooms.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Rooms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {bedrooms.map((br, i) => {
                const beds = toArray(br.amenities?.amenity as never);
                return (
                  <div key={i} className="p-3 rounded-lg border text-sm">
                    <div className="font-medium capitalize mb-1">
                      {br.roomSubType.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
                    </div>
                    {beds.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {beds.map((bed: { count: string; bedroomFeatureName: string }, j: number) => (
                          <Badge key={j} variant="outline" className="text-xs">
                            {bed.count}x {bed.bedroomFeatureName.replace(/^AMENITY_/, "").replace(/_/g, " ").toLowerCase()}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </div>

      {/* ─── Add Fee Modal ──────────────────────────────────────────────────── */}
      <Dialog open={addModalOpen} onOpenChange={(open) => { if (!open) setAddModalOpen(false); }}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Add Pricing Fee</DialogTitle>
          </DialogHeader>
          <FeeFormFields form={addForm} onChange={setAddForm} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddModalOpen(false)} disabled={isAdding}>
              Cancel
            </Button>
            <Button onClick={handleAddSubmit} disabled={isAdding}>
              {isAdding ? "Saving..." : "Save Fee"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Edit Fee Modal ─────────────────────────────────────────────────── */}
      <Dialog open={editModalOpen} onOpenChange={(open) => { if (!open) { setEditModalOpen(false); setEditingFee(null); } }}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Edit Pricing Fee</DialogTitle>
          </DialogHeader>
          <FeeFormFields form={editForm} onChange={setEditForm} />
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditModalOpen(false); setEditingFee(null); }} disabled={isUpdating}>
              Cancel
            </Button>
            <Button onClick={handleEditSubmit} disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Update Fee"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Delete Confirm Modal ───────────────────────────────────────────── */}
      <Dialog open={deleteModalOpen} onOpenChange={(open) => { if (!open) { setDeleteModalOpen(false); setDeletingFee(null); } }}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Pricing Fee</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground py-2">
            Are you sure you want to delete{" "}
            <span className="font-medium text-foreground">{deletingFee?.fee_name}</span>?
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDeleteModalOpen(false); setDeletingFee(null); }} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => deleteFee()} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default PropertyDetail;
