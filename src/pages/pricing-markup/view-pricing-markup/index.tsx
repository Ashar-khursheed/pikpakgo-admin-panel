import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Tag,
  Percent,
  DollarSign,
  Globe,
  Hash,
  CalendarDays,
  ToggleRight,
  SlidersHorizontal,
  Pencil,
} from "lucide-react";

import makeApiRequest from "@/services/axios";
import { apiUrl } from "@/services/api-end-point";
import { formatDate } from "@/utils/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PricingMarkup {
  id: number;
  name: string;
  description: string | null;
  markup_type: "percentage" | "fixed" | "tiered";
  markup_percentage: string;
  markup_fixed_amount: string;
  provider: string | null;
  property_type: string | null;
  destination_code: string | null;
  min_price: string | null;
  max_price: string | null;
  valid_from: string | null;
  valid_to: string | null;
  priority: number;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

interface ApiResponse {
  success: boolean;
  data: PricingMarkup;
}

const markupTypeConfig: Record<string, { label: string; color: string }> = {
  percentage: { label: "Percentage", color: "bg-blue-100 text-blue-800 hover:bg-blue-100" },
  fixed:      { label: "Fixed",      color: "bg-purple-100 text-purple-800 hover:bg-purple-100" },
  tiered:     { label: "Tiered",     color: "bg-orange-100 text-orange-800 hover:bg-orange-100" },
};

function InfoRow({ label, icon: Icon, children }: { label: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b last:border-0">
      <div className="flex items-center gap-2 w-44 flex-shrink-0 text-sm text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="text-sm font-medium flex-1">{children}</div>
    </div>
  );
}

export default function ViewPricingMarkup() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery<ApiResponse>({
    queryKey: ["pricing-markup", id],
    queryFn: () =>
      makeApiRequest<ApiResponse>(`${apiUrl.getPricingMarkupById}/${id}`),
    enabled: !!id,
  });

  const markup = data?.data;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !markup) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-destructive">
        <AlertCircle className="w-10 h-10" />
        <p className="text-sm font-medium">Failed to load pricing markup</p>
      </div>
    );
  }

  const typeCfg = markupTypeConfig[markup.markup_type] ?? {
    label: markup.markup_type,
    color: "bg-gray-100 text-gray-800 hover:bg-gray-100",
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
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
            <h1 className="text-2xl font-bold tracking-tight">{markup.name}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Pricing Markup #{markup.id}
            </p>
          </div>
        </div>
        <Button onClick={() => navigate(`/get-all-pricing-markup/${id}/edit`)}>
          <Pencil className="w-4 h-4 mr-2" />
          Edit Markup
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left — main details */}
        <div className="lg:col-span-2 space-y-5">
          {/* Basic Info */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <InfoRow label="Name" icon={Tag}>
                {markup.name}
              </InfoRow>
              <InfoRow label="Description" icon={Tag}>
                {markup.description ?? <span className="text-muted-foreground">—</span>}
              </InfoRow>
              <InfoRow label="Markup Type" icon={SlidersHorizontal}>
                <Badge className={typeCfg.color}>{typeCfg.label}</Badge>
              </InfoRow>
            </CardContent>
          </Card>

          {/* Markup Values */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                Markup Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <InfoRow label="Percentage" icon={Percent}>
                <span className="text-lg font-semibold text-blue-600">
                  {markup.markup_percentage}%
                </span>
              </InfoRow>
              <InfoRow label="Fixed Amount" icon={DollarSign}>
                <span className="text-lg font-semibold text-purple-600">
                  ${markup.markup_fixed_amount}
                </span>
              </InfoRow>
              <InfoRow label="Price Range" icon={DollarSign}>
                {markup.min_price !== null || markup.max_price !== null ? (
                  <span>
                    ${markup.min_price ?? "0"} – ${markup.max_price ?? "∞"}
                  </span>
                ) : (
                  <span className="text-muted-foreground">No range set</span>
                )}
              </InfoRow>
              {(markup.valid_from || markup.valid_to) && (
                <InfoRow label="Valid Period" icon={CalendarDays}>
                  {markup.valid_from ?? "—"} → {markup.valid_to ?? "—"}
                </InfoRow>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right — meta */}
        <div className="space-y-5">
          {/* Status card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <ToggleRight className="w-4 h-4" />
                Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active</span>
                <Badge
                  className={
                    markup.is_active
                      ? "bg-green-100 text-green-800 hover:bg-green-100"
                      : "bg-red-100 text-red-800 hover:bg-red-100"
                  }
                >
                  {markup.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Default</span>
                {markup.is_default ? (
                  <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                    Default
                  </Badge>
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                )}
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
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5" /> Provider
                </span>
                <span className="text-sm font-medium capitalize">
                  {markup.provider ?? "—"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Hash className="h-3.5 w-3.5" /> Priority
                </span>
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-muted text-sm font-semibold">
                  {markup.priority}
                </span>
              </div>
              {markup.property_type && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Property Type</span>
                  <span className="text-sm font-medium capitalize">{markup.property_type}</span>
                </div>
              )}
              {markup.destination_code && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Destination</span>
                  <span className="text-sm font-medium">{markup.destination_code}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                Timestamps
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Created</span>
                <span className="text-xs text-muted-foreground">{formatDate(markup.created_at)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Updated</span>
                <span className="text-xs text-muted-foreground">{formatDate(markup.updated_at)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
