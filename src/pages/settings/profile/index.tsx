import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Mail, Phone, Globe, DollarSign, Languages,
  ShieldCheck, BadgeCheck, Loader2, AlertCircle,
  Pencil, User,
} from "lucide-react";
import makeApiRequest from "@/services/axios";
import { apiUrl } from "@/services/api-end-point";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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
  preferred_currency: string;
  preferred_language: string;
}

interface MeResponse {
  success: boolean;
  data: UserProfile;
}

function getInitials(name: string) {
  return (name || "")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function InfoRow({
  icon: Icon,
  label,
  value,
  extra,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  extra?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between py-3.5">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-muted-foreground" />
        </div>
        <span className="text-sm font-medium text-foreground">{label}</span>
      </div>
      <div className="flex flex-col items-end gap-0.5">
        <span className="text-sm text-muted-foreground">{value}</span>
        {extra}
      </div>
    </div>
  );
}

export default function MYProfile() {
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useQuery<MeResponse>({
    queryKey: ["profile"],
    queryFn: () => makeApiRequest<MeResponse>(apiUrl.me),
    staleTime: 1000 * 60 * 5,
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

  const profile = data?.data;
  if (!profile) return null;

  const rows = [
    {
      icon: Mail,
      label: "Email",
      value: profile.email,
      extra: profile.email_verified ? (
        <span className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
          <BadgeCheck className="w-3.5 h-3.5" /> Verified
        </span>
      ) : (
        <span className="text-xs text-amber-500 font-medium">Not verified</span>
      ),
    },
    { icon: Phone, label: "Phone", value: profile.phone || "—" },
    { icon: Globe, label: "Country", value: profile.country || "—" },
    { icon: DollarSign, label: "Currency", value: profile.preferred_currency || "—" },
    { icon: Languages, label: "Language", value: profile.preferred_language || "—" },
    {
      icon: ShieldCheck,
      label: "User Type",
      value: <span className="capitalize">{profile.user_type}</span>,
    },
  ];

  return (
    <div className=" space-y-6 py-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">Your account information</p>
        </div>
        <Button onClick={() => navigate("/settings/profile/edit")}>
          <Pencil className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      </div>

      {/* Avatar Card */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-primary/5 to-emerald-50">
        <CardContent className="pt-6 pb-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-primary text-white flex items-center justify-center text-2xl font-bold shadow-md flex-shrink-0">
              {getInitials(profile.first_name + " " + profile.last_name)}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold truncate">{profile.first_name} {profile.last_name}</h2>
              <p className="text-sm text-muted-foreground truncate mt-0.5">{profile.email}</p>
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                <Badge
                  variant="secondary"
                  className={
                    profile.status === "active"
                      ? "bg-emerald-100 text-emerald-700 capitalize"
                      : "bg-red-100 text-red-700 capitalize"
                  }
                >
                  {profile.status}
                </Badge>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 capitalize">
                  {profile.user_type}
                </Badge>
                {profile.email_verified && (
                  <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                    <BadgeCheck className="w-3 h-3 mr-1" />
                    Email Verified
                  </Badge>
                )}
              </div>
            </div>
            <div className="hidden sm:flex flex-col items-end gap-1">
              <span className="text-xs text-muted-foreground">ID</span>
              <span className="text-sm font-mono font-semibold text-muted-foreground">#{profile.id}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details */}
      <Card>
        <CardContent className="pt-5 pb-5 px-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
            <User className="w-3.5 h-3.5" />
            Account Details
          </p>
          <div>
            {rows.map((row, i) => (
              <div key={row.label}>
                <InfoRow {...row} />
                {i < rows.length - 1 && <Separator className="opacity-50" />}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
