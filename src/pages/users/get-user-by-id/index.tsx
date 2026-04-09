import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import makeApiRequest from "@/services/axios";
import { apiUrl } from "@/services/api-end-point";
import { formatDate } from "@/utils/utils";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Globe,
  Mail,
  MapPin,
  Phone,
  Shield,
  User,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface UserDetail {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  phone_country_code: string | null;
  email_verified_at: string | null;
  user_type: string;
  status: string;
  profile_image: string | null;
  date_of_birth: string | null;
  gender: string | null;
  country: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  address: string | null;
  preferred_currency: string;
  preferred_language: string;
  reset_token_expires_at: string | null;
  last_login_at: string | null;
  last_login_ip: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  host_profile: unknown;
  agency_profile: unknown;
  booking_stats: {
    total_bookings: number;
    confirmed_bookings: number;
    total_spent: number;
  };
}

interface UserDetailApiResponse {
  success: boolean;
  data: UserDetail;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

const userTypeConfig: Record<string, string> = {
  customer: "bg-blue-100 text-blue-800 hover:bg-blue-100",
  host: "bg-purple-100 text-purple-800 hover:bg-purple-100",
  agency: "bg-orange-100 text-orange-800 hover:bg-orange-100",
  admin: "bg-gray-100 text-gray-800 hover:bg-gray-100",
};

const statusConfig: Record<string, string> = {
  active: "bg-green-100 text-green-800 hover:bg-green-100",
  inactive: "bg-red-100 text-red-800 hover:bg-red-100",
  suspended: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
  pending: "bg-sky-100 text-sky-800 hover:bg-sky-100",
};

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between text-sm py-2 border-b border-gray-100 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value ?? "—"}</span>
    </div>
  );
}

// ─── Skeleton ──────────────────────────────────────────────────────────────────
function UserDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-md" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>

      {/* Profile card skeleton */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-5">
            <Skeleton className="h-20 w-20 rounded-full flex-shrink-0" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-56" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}>
              <CardHeader><Skeleton className="h-5 w-28" /></CardHeader>
              <CardContent className="space-y-3">
                {Array.from({ length: 4 }).map((_, j) => (
                  <div key={j} className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="space-y-6">
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
function UserDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isFetching } = useQuery({
    queryKey: ["user-detail", id],
    queryFn: () =>
      makeApiRequest<UserDetailApiResponse>(`${apiUrl.getUserById}/${id}`),
    enabled: !!id,
  });

  const user = data?.data;

  if (isFetching) return <UserDetailSkeleton />;

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">User not found.</p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Go back
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {user.first_name} {user.last_name}
            </h1>
            <p className="text-sm text-muted-foreground">User #{user.id}</p>
          </div>
        </div>
      </div>

      {/* Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-muted-foreground">
                {user.first_name.charAt(0).toUpperCase()}
                {user.last_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="space-y-1.5">
              <p className="text-xl font-semibold">
                {user.first_name} {user.last_name}
              </p>
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                {user.email}
              </p>
              {user.phone && (
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  {user.phone}
                </p>
              )}
              <div className="flex gap-2 pt-1">
                <Badge className={userTypeConfig[user.user_type] ?? "bg-gray-100 text-gray-800 hover:bg-gray-100"}>
                  {capitalize(user.user_type)}
                </Badge>
                <Badge className={statusConfig[user.status] ?? "bg-gray-100 text-gray-800 hover:bg-gray-100"}>
                  {capitalize(user.status)}
                </Badge>
                {user.email_verified_at ? (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    Email Verified
                  </Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                    Email Unverified
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — Main Info */}
        <div className="lg:col-span-2 space-y-6">

          {/* Personal Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" /> Personal Info
              </CardTitle>
            </CardHeader>
            <CardContent>
              <InfoRow label="First Name" value={user.first_name} />
              <InfoRow label="Last Name" value={user.last_name} />
              <InfoRow label="Date of Birth" value={user.date_of_birth} />
              <InfoRow label="Gender" value={user.gender ? capitalize(user.gender) : null} />
              <InfoRow
                label="Phone"
                value={
                  user.phone
                    ? `${user.phone_country_code ?? ""} ${user.phone}`.trim()
                    : null
                }
              />
            </CardContent>
          </Card>

          {/* Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Address
              </CardTitle>
            </CardHeader>
            <CardContent>
              <InfoRow label="Address" value={user.address} />
              <InfoRow label="City" value={user.city} />
              <InfoRow label="State" value={user.state} />
              <InfoRow label="Country" value={user.country} />
              <InfoRow label="Zip Code" value={user.zip_code} />
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-4 w-4" /> Preferences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <InfoRow label="Currency" value={user.preferred_currency} />
              <InfoRow label="Language" value={user.preferred_language?.toUpperCase()} />
            </CardContent>
          </Card>
        </div>

        {/* Right — Sidebar */}
        <div className="space-y-6">

          {/* Booking Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> Booking Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 gap-3">
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold">{user.booking_stats.total_bookings}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Total Bookings</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold">{user.booking_stats.confirmed_bookings}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Confirmed</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-muted/50">
                  <div className="text-2xl font-bold">${user.booking_stats.total_spent}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Total Spent</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-4 w-4" /> Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <InfoRow
                label="Email Verified"
                value={
                  user.email_verified_at
                    ? formatDate(user.email_verified_at)
                    : <span className="text-red-500 text-xs">Not verified</span>
                }
              />
              <InfoRow
                label="Last Login"
                value={user.last_login_at ? formatDate(user.last_login_at) : null}
              />
              <InfoRow label="Last Login IP" value={user.last_login_ip} />
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Timestamps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <InfoRow label="Joined" value={formatDate(user.created_at)} />
              <InfoRow label="Updated" value={formatDate(user.updated_at)} />
              {user.deleted_at && (
                <InfoRow
                  label="Deleted"
                  value={
                    <span className="text-red-500">{formatDate(user.deleted_at)}</span>
                  }
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default UserDetail;
