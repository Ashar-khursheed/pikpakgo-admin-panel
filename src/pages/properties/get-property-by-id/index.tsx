import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import makeApiRequest from "@/services/axios";
import { apiUrl } from "@/services/api-end-point";
import { formatDate } from "@/utils/utils";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Building2,
  Calendar,
  Eye,
  MapPin,
  RefreshCw,
  Star,
  Tag,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Thumbs, FreeMode } from "swiper/modules";
import { useState } from "react";
import type { Swiper as SwiperType } from "swiper";



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

interface PropertyApiResponse {
  success: boolean;
  data: Property;
}
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

function PropertyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);

  const { data, isFetching, refetch } = useQuery({
    queryKey: ["property", id],
    queryFn: () =>
      makeApiRequest<PropertyApiResponse>(`${apiUrl.getPropertyById}/${id}`),
    enabled: !!id,
  });

  const property = data?.data;

  if (isFetching) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
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

        {/* Image slider skeleton */}
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
          {/* Left column skeleton */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview card */}
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

            {/* Amenities card */}
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

          {/* Right column skeleton */}
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

      {/* Image Slider */}
      {images.length > 0 && (
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {/* Main Swiper */}
            <Swiper
              modules={[Navigation, Pagination, Thumbs]}
              navigation
              pagination={{ clickable: true }}
              thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
              className="w-full h-[420px]"
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

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <Swiper
                modules={[FreeMode, Thumbs]}
                onSwiper={setThumbsSwiper}
                freeMode
                watchSlidesProgress
                slidesPerView={6}
                spaceBetween={6}
                className="h-20 px-2 py-2"
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
      )}

      {/* No image fallback */}
      {images.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center h-40 text-muted-foreground">
            <Building2 className="h-10 w-10 mr-2" />
            No images available
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Main Info */}
        <div className="lg:col-span-2 space-y-6">

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

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
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

        {/* Right — Sidebar */}
        <div className="space-y-6">

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
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

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
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

          {/* Ratings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
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
                <span className="text-muted-foreground">Total reviews</span>
                <span className="font-medium">{property.rating_count}</span>
              </div>
            </CardContent>
          </Card>

          {/* Sync Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
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
    </div>
  );
}

export default PropertyDetail;
