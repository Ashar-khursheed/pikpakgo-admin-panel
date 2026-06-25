import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Textarea } from "@/components/ui/textarea";
import { CustomPagination } from "@/components/custom-pagination";
import { DataTable, Column } from "@/components/data-table";
import makeApiRequest from "@/services/axios";
import { formatDate } from "@/utils/utils";
import { apiUrl } from "@/services/api-end-point";
import {
  Activity,
  CalendarDays,
  ChevronDown,
  Clock,
  Download,
  Eye,
  FilePlus,
  RefreshCw,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

// ─── Types ─────────────────────────────────────────────────────────────────────
interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
}

interface Booking {
  id: number;
  booking_reference: string;
  user_id: number | null;
  provider: string;
  provider_booking_id: string | null;
  property_name: string;
  property_city: string | null;
  check_in_date: string;
  check_out_date: string;
  nights: number;
  total_adults: number;
  total_children: number;
  currency: string;
  total_price: number;
  paid_amount: number;
  booking_status: "pending" | "confirmed" | "cancelled" | "completed" | "no_show" | "rejected";
  payment_status: "pending" | "processing" | "paid" | "failed" | "refunded" | "partially_refunded";
  holder_first_name: string;
  holder_last_name: string;
  holder_email: string;
  internal_notes: string | null;
  cancelled_at: string | null;
  cancelled_by: string | null;
  created_at: string;
  user?: User;
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  total: number;
  from: number;
  to: number;
  per_page: number;
}

interface BookingsApiResponse {
  success: boolean;
  data: {
    data: Booking[];
  } & PaginationMeta;
}

const BOOKING_STATUS_OPTIONS = ["All", "pending", "confirmed", "cancelled", "completed", "no_show", "rejected"];
const PAYMENT_STATUS_OPTIONS = ["All", "pending", "processing", "paid", "failed", "refunded", "partially_refunded"];

export default function Orders() {
  const queryClient = useQueryClient();

  const [verticalType, setVerticalType] = useState<"properties" | "flights" | "cars" | "experiences" | "transfers">("properties");
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [paymentFilter, setPaymentFilter] = useState("All");
  const [page, setPage] = useState(1);

  // ─── Dialogs State ─────────────────────────────────────────────────────────
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [statusForm, setStatusForm] = useState({
    booking_status: "pending" as Booking["booking_status"],
    payment_status: "pending" as Booking["payment_status"],
    internal_notes: "",
  });

  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [refundForm, setRefundForm] = useState({
    refund_amount: "",
    reason: "",
    refund_type: "partial" as "full" | "partial",
    internal_notes: "",
  });

  const queryKey = [
    "admin-bookings",
    { verticalType, page, statusFilter, paymentFilter, search: appliedSearch },
  ] as const;

  // ─── Fetch Bookings ────────────────────────────────────────────────────────
  const { data, isFetching, refetch } = useQuery({
    queryKey,
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), per_page: "20" });
      if (statusFilter !== "All") params.append("status", statusFilter);
      if (paymentFilter !== "All" && verticalType === "properties") params.append("payment_status", paymentFilter);
      if (appliedSearch.trim()) params.append("search", appliedSearch.trim());

      const url = verticalType === "properties"
        ? `${apiUrl.getAllBookings}?${params.toString()}`
        : `${apiUrl.getAllBookings}/vertical/${verticalType}?${params.toString()}`;

      return makeApiRequest<any>(url);
    },
  });

  const bookings: any[] = data?.data?.data ?? [];
  const meta: PaginationMeta = {
    current_page: data?.data?.current_page ?? 1,
    last_page: data?.data?.last_page ?? 1,
    total: data?.data?.total ?? 0,
    from: data?.data?.from ?? 0,
    to: data?.data?.to ?? 0,
    per_page: data?.data?.per_page ?? 20,
  };

  // ─── Update Booking Status Mutation ─────────────────────────────────────────
  const { mutate: updateStatus, isPending: isUpdating } = useMutation({
    mutationFn: (payload: typeof statusForm) => {
      if (verticalType === "properties") {
        return makeApiRequest(`${apiUrl.updateBookingStatus}/${selectedBooking?.id}/status`, {
          method: "PUT",
          data: payload,
        });
      } else {
        return makeApiRequest(`${apiUrl.getAllBookings}/vertical/${verticalType}/${selectedBooking?.id}/status`, {
          method: "PUT",
          data: { status: payload.booking_status },
        });
      }
    },
    onSuccess: (res: any) => {
      if (res?.success) {
        toast.success("Booking updated successfully");
        setStatusDialogOpen(false);
        queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
        if (selectedBooking) {
          setSelectedBooking({ ...selectedBooking, ...res.data });
        }
      }
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update booking status");
    },
  });

  // ─── Issue Refund Mutation ──────────────────────────────────────────────────
  const { mutate: issueRefund, isPending: isRefunding } = useMutation({
    mutationFn: (payload: typeof refundForm & { refund_amount: number }) =>
      makeApiRequest(`${apiUrl.refundBooking}/${selectedBooking?.id}/refund`, {
        method: "POST",
        data: payload,
      }),
    onSuccess: (res: any) => {
      if (res?.success) {
        toast.success(res?.message || "Refund issued successfully");
        setRefundDialogOpen(false);
        queryClient.invalidateQueries({ queryKey: ["admin-bookings"] });
        if (selectedBooking) {
          setSelectedBooking({ ...selectedBooking, ...res.data });
        }
      } else {
        toast.error(res?.message || "Failed to issue refund");
      }
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to process refund");
    },
  });

  const handleOpenDetails = (b: any) => {
    setSelectedBooking(b);
    setDetailsDialogOpen(true);
  };

  const handleOpenStatus = (b: any) => {
    setSelectedBooking(b);
    setStatusForm({
      booking_status: b.booking_status || b.status || "pending",
      payment_status: b.payment_status || "pending",
      internal_notes: b.internal_notes || "",
    });
    setStatusDialogOpen(true);
  };

  const handleOpenRefund = (b: any) => {
    setSelectedBooking(b);
    setRefundForm({
      refund_amount: String(b.paid_amount || b.total_price),
      reason: "",
      refund_type: "full",
      internal_notes: "",
    });
    setRefundDialogOpen(true);
  };

  const handleStatusSubmit = () => {
    updateStatus(statusForm);
  };

  const handleRefundSubmit = () => {
    if (!refundForm.reason.trim()) {
      toast.error("Refund reason is required");
      return;
    }
    const amt = Number(refundForm.refund_amount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Valid refund amount is required");
      return;
    }
    issueRefund({ ...refundForm, refund_amount: amt });
  };

  const handleSearch = () => {
    setAppliedSearch(search);
    setPage(1);
  };

  const handleStatusFilterChange = (val: string) => {
    setStatusFilter(val);
    setPage(1);
  };

  const handlePaymentFilterChange = (val: string) => {
    setPaymentFilter(val);
    setPage(1);
  };

  const handleExportCsv = () => {
    const params = new URLSearchParams();
    if (statusFilter !== "All") params.append("status", statusFilter);
    const token = localStorage.getItem("token")?.replace(/^["']|["']$/g, '');

    const downloadUrl = `${import.meta.env.VITE_API_URL}/admin/bookings/export/csv?${params.toString()}`;

    const win = window.open(downloadUrl, "_blank");
    if (!win) {
      toast.error("Popup blocked! Please allow popups to download CSV.");
    } else {
      toast.success("CSV export initiated");
    }
  };

  const getBookingStatusBadge = (status: string) => {
    const configs: Record<string, string> = {
      pending: "bg-amber-100 text-amber-800 border-amber-200",
      confirmed: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
      completed: "bg-blue-100 text-blue-800 border-blue-200",
      no_show: "bg-zinc-100 text-zinc-800 border-zinc-200",
      rejected: "bg-rose-100 text-rose-800 border-rose-200",
    };
    const s = status || "pending";
    return (
      <Badge className={`capitalize border ${configs[s] || "bg-zinc-100 text-zinc-800"}`}>
        {s}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (status: string) => {
    const configs: Record<string, string> = {
      pending: "bg-amber-100 text-amber-800 border-amber-200",
      processing: "bg-indigo-100 text-indigo-800 border-indigo-200",
      paid: "bg-green-100 text-green-800 border-green-200",
      failed: "bg-red-100 text-red-800 border-red-200",
      refunded: "bg-rose-100 text-rose-800 border-rose-200",
      partially_refunded: "bg-orange-100 text-orange-800 border-orange-200",
    };
    const s = status || "pending";
    return (
      <Badge className={`capitalize border ${configs[s] || "bg-zinc-100 text-zinc-800"}`}>
        {s.replace("_", " ")}
      </Badge>
    );
  };

  const columns = (() => {
    if (verticalType === "properties") {
      return [
        {
          header: "Booking Reference",
          render: (b: any) => (
            <div>
              <span className="font-mono text-sm font-semibold text-zinc-800">{b.booking_reference}</span>
              <div className="text-xs text-muted-foreground mt-0.5 capitalize">
                {b.provider} booking
              </div>
            </div>
          ),
        },
        {
          header: "Customer",
          render: (b: any) => (
            <div>
              <div className="font-medium text-sm">
                {b.holder_first_name} {b.holder_last_name}
              </div>
              <div className="text-xs text-muted-foreground">{b.holder_email}</div>
            </div>
          ),
        },
        {
          header: "Property / Destination",
          render: (b: any) => (
            <div>
              <div className="font-medium text-sm max-w-[200px] truncate">{b.property_name}</div>
              <div className="text-xs text-muted-foreground">{b.property_city || "N/A"}</div>
            </div>
          ),
        },
        {
          header: "Stay Dates",
          render: (b: any) => (
            <div>
              <div className="text-xs font-medium text-zinc-700">
                {formatDate(b.check_in_date)} to {formatDate(b.check_out_date)}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">
                {b.nights} Nights ({b.total_adults} Adults)
              </div>
            </div>
          ),
        },
        {
          header: "Status",
          render: (b: any) => getBookingStatusBadge(b.booking_status),
        },
        {
          header: "Payment",
          render: (b: any) => (
            <div>
              <div>{getPaymentStatusBadge(b.payment_status)}</div>
              <div className="text-xs font-semibold text-zinc-700 mt-1">
                ${Number(b.total_price).toFixed(2)}
              </div>
            </div>
          ),
        },
        {
          header: "Booked At",
          render: (b: any) => (
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {formatDate(b.created_at)}
            </span>
          ),
        },
        {
          header: "Actions",
          className: "text-right",
          render: (b: any) => (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleOpenDetails(b)} className="gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleOpenStatus(b)} className="gap-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    Update Status
                  </DropdownMenuItem>
                  {b.payment_status === "paid" && (
                    <DropdownMenuItem onClick={() => handleOpenRefund(b)} className="gap-2 text-destructive focus:text-destructive">
                      <RotateCcw className="h-4 w-4" />
                      Issue Refund
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ),
        },
      ];
    }

    if (verticalType === "flights") {
      return [
        {
          header: "Booking Reference",
          render: (b: any) => <span className="font-mono text-sm font-semibold text-zinc-800">{b.booking_reference}</span>,
        },
        {
          header: "Customer",
          render: (b: any) => (
            <div>
              <div className="font-medium text-sm">
                {b.user ? `${b.user.first_name} ${b.user.last_name}` : "N/A"}
              </div>
              <div className="text-xs text-muted-foreground">{b.user?.email || "N/A"}</div>
            </div>
          ),
        },
        {
          header: "Flight / Airline",
          render: (b: any) => (
            <div>
              <div className="font-medium text-sm">{b.airline}</div>
              <div className="text-xs text-muted-foreground">Flight No: {b.flight_number}</div>
            </div>
          ),
        },
        {
          header: "Route / Times",
          render: (b: any) => (
            <div>
              <div className="text-xs font-semibold text-zinc-700">
                {b.departure_airport} → {b.arrival_airport}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                Dep: {formatDate(b.departure_time)}
              </div>
            </div>
          ),
        },
        {
          header: "Price",
          render: (b: any) => <span className="text-xs font-semibold">${Number(b.total_price).toFixed(2)}</span>,
        },
        {
          header: "Status",
          render: (b: any) => getBookingStatusBadge(b.status),
        },
        {
          header: "Booked At",
          render: (b: any) => <span className="text-xs text-muted-foreground">{formatDate(b.created_at)}</span>,
        },
        {
          header: "Actions",
          className: "text-right",
          render: (b: any) => (
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" className="h-8" onClick={() => handleOpenDetails(b)}>
                <Eye className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => handleOpenStatus(b)}>
                Status
              </Button>
            </div>
          ),
        },
      ];
    }

    if (verticalType === "cars") {
      return [
        {
          header: "Booking Reference",
          render: (b: any) => <span className="font-mono text-sm font-semibold text-zinc-800">{b.booking_reference}</span>,
        },
        {
          header: "Customer",
          render: (b: any) => (
            <div>
              <div className="font-medium text-sm">
                {b.user ? `${b.user.first_name} ${b.user.last_name}` : "N/A"}
              </div>
              <div className="text-xs text-muted-foreground">{b.user?.email || "N/A"}</div>
            </div>
          ),
        },
        {
          header: "Car Details",
          render: (b: any) => (
            <div>
              <div className="font-medium text-sm">{b.car_model}</div>
              <div className="text-xs text-muted-foreground">{b.rental_company} · {b.car_class}</div>
            </div>
          ),
        },
        {
          header: "Locations / Dates",
          render: (b: any) => (
            <div>
              <div className="text-xs font-semibold text-zinc-700">
                {b.pickup_location} → {b.dropoff_location}
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                Pickup: {formatDate(b.pickup_time)}
              </div>
            </div>
          ),
        },
        {
          header: "Price",
          render: (b: any) => <span className="text-xs font-semibold">${Number(b.total_price).toFixed(2)}</span>,
        },
        {
          header: "Status",
          render: (b: any) => getBookingStatusBadge(b.status),
        },
        {
          header: "Booked At",
          render: (b: any) => <span className="text-xs text-muted-foreground">{formatDate(b.created_at)}</span>,
        },
        {
          header: "Actions",
          className: "text-right",
          render: (b: any) => (
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" className="h-8" onClick={() => handleOpenDetails(b)}>
                <Eye className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => handleOpenStatus(b)}>
                Status
              </Button>
            </div>
          ),
        },
      ];
    }

    if (verticalType === "experiences") {
      return [
        {
          header: "Booking Reference",
          render: (b: any) => <span className="font-mono text-sm font-semibold text-zinc-800">{b.booking_reference}</span>,
        },
        {
          header: "Customer",
          render: (b: any) => (
            <div>
              <div className="font-medium text-sm">
                {b.user ? `${b.user.first_name} ${b.user.last_name}` : "N/A"}
              </div>
              <div className="text-xs text-muted-foreground">{b.user?.email || "N/A"}</div>
            </div>
          ),
        },
        {
          header: "Experience Name",
          render: (b: any) => (
            <div>
              <div className="font-medium text-sm max-w-[200px] truncate">{b.experience_name}</div>
              <div className="text-xs text-muted-foreground capitalize">Category: {b.category}</div>
            </div>
          ),
        },
        {
          header: "Date / Tickets",
          render: (b: any) => (
            <div>
              <div className="text-xs font-semibold text-zinc-700">
                Date: {formatDate(b.activity_date)}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">Tickets: {b.quantity}</div>
            </div>
          ),
        },
        {
          header: "Price",
          render: (b: any) => <span className="text-xs font-semibold">${Number(b.total_price).toFixed(2)}</span>,
        },
        {
          header: "Status",
          render: (b: any) => getBookingStatusBadge(b.status),
        },
        {
          header: "Booked At",
          render: (b: any) => <span className="text-xs text-muted-foreground">{formatDate(b.created_at)}</span>,
        },
        {
          header: "Actions",
          className: "text-right",
          render: (b: any) => (
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" className="h-8" onClick={() => handleOpenDetails(b)}>
                <Eye className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => handleOpenStatus(b)}>
                Status
              </Button>
            </div>
          ),
        },
      ];
    }

    if (verticalType === "transfers") {
      return [
        {
          header: "Booking Reference",
          render: (b: any) => <span className="font-mono text-sm font-semibold text-zinc-800">{b.booking_reference}</span>,
        },
        {
          header: "Customer",
          render: (b: any) => (
            <div>
              <div className="font-medium text-sm">
                {b.user ? `${b.user.first_name} ${b.user.last_name}` : "N/A"}
              </div>
              <div className="text-xs text-muted-foreground">{b.user?.email || "N/A"}</div>
            </div>
          ),
        },
        {
          header: "Route / Type",
          render: (b: any) => (
            <div>
              <div className="font-medium text-xs text-zinc-700 max-w-[200px] truncate">
                {b.pickup_location} → {b.dropoff_location}
              </div>
              <div className="text-xs text-muted-foreground capitalize mt-0.5">{b.transfer_type}</div>
            </div>
          ),
        },
        {
          header: "Transfer Time",
          render: (b: any) => (
            <div>
              <div className="text-xs font-semibold text-zinc-700">
                {formatDate(b.transfer_time)}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">Passengers: {b.passenger_count}</div>
            </div>
          ),
        },
        {
          header: "Price",
          render: (b: any) => <span className="text-xs font-semibold">${Number(b.total_price).toFixed(2)}</span>,
        },
        {
          header: "Status",
          render: (b: any) => getBookingStatusBadge(b.status),
        },
        {
          header: "Booked At",
          render: (b: any) => <span className="text-xs text-muted-foreground">{formatDate(b.created_at)}</span>,
        },
        {
          header: "Actions",
          className: "text-right",
          render: (b: any) => (
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" className="h-8" onClick={() => handleOpenDetails(b)}>
                <Eye className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => handleOpenStatus(b)}>
                Status
              </Button>
            </div>
          ),
        },
      ];
    }

    return [];
  })();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Bookings</h1>
          <p className="text-muted-foreground">Manage property & vertical supplier bookings and transactions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportCsv}>
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-zinc-200 gap-2">
        {[
          { key: "properties", label: "Property Bookings" },
          { key: "flights", label: "Flight Bookings" },
          { key: "cars", label: "Car Bookings" },
          { key: "experiences", label: "Experience Bookings" },
          { key: "transfers", label: "Transfer Bookings" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setVerticalType(tab.key as any);
              setPage(1);
              setStatusFilter("All");
              setPaymentFilter("All");
            }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-all -mb-px ${verticalType === tab.key
                ? "border-zinc-950 text-zinc-950 font-semibold"
                : "border-transparent text-zinc-500 hover:text-zinc-800"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border border-zinc-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Total Bookings</CardTitle>
            <CalendarDays className="h-4 w-4 text-zinc-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900">{meta.total}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Across all suppliers</p>
          </CardContent>
        </Card>

        <Card className="border border-zinc-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active Processing</CardTitle>
            <Clock className="h-4 w-4 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900">
              {bookings.filter((b) => b.booking_status === "pending" || b.status === "pending").length}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Awaiting verification</p>
          </CardContent>
        </Card>

        <Card className="border border-zinc-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Settled Revenue</CardTitle>
            <Activity className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900">
              ${bookings
                .filter((b) => b.payment_status === "paid" || (verticalType !== "properties" && b.status !== "cancelled" && b.status !== "rejected"))
                .reduce((acc, b) => acc + Number(b.total_price), 0)
                .toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Successfully captured</p>
          </CardContent>
        </Card>

        <Card className="border border-zinc-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cancellation Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-rose-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900">
              {meta.total > 0
                ? `${((bookings.filter((b) => b.booking_status === "cancelled" || b.status === "cancelled").length / bookings.length) * 100).toFixed(0)}%`
                : "0%"}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Cancelled by admin/guest</p>
          </CardContent>
        </Card>
      </div>

      {/* Main card table logs */}
      <Card className="border border-zinc-200 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-zinc-800">Booking Management</CardTitle>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Ref, email, last name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="w-48"
                />
                <Button variant="outline" onClick={handleSearch} disabled={isFetching}>
                  Search
                </Button>
              </div>

              <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                <SelectTrigger className="w-[125px]">
                  <SelectValue placeholder="Booking Status" />
                </SelectTrigger>
                <SelectContent>
                  {BOOKING_STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt} className="capitalize">
                      {opt === "All" ? "All Booking Status" : opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {verticalType === "properties" && (
                <Select value={paymentFilter} onValueChange={handlePaymentFilterChange}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Payment Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt} value={opt} className="capitalize">
                        {opt === "All" ? "All Payment Status" : opt.replace("_", " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={bookings}
            loading={isFetching}
            rowKey={(b) => b.id}
            emptyMessage="No bookings found."
          />

          {meta.last_page > 1 && (
            <div className="mt-6">
              <CustomPagination
                currentPage={meta.current_page}
                lastPage={meta.last_page}
                onPageChange={setPage}
                total={meta.total}
                from={meta.from}
                to={meta.to}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── Details Dialog ───────────────────────────────────────────────────── */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-6 my-4">
              <div className="grid grid-cols-2 gap-4 bg-muted/40 p-4 rounded-lg border">
                <div>
                  <Label className="text-xs text-muted-foreground uppercase font-bold">Booking Reference</Label>
                  <p className="font-mono font-semibold text-sm mt-0.5 text-zinc-900">{selectedBooking.booking_reference}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground uppercase font-bold">Provider Details</Label>
                  <p className="font-semibold text-sm mt-0.5 capitalize">{selectedBooking.provider || verticalType}</p>
                  {selectedBooking.provider_booking_id && (
                    <p className="text-xs text-muted-foreground mt-0.5">Supplier ID: {selectedBooking.provider_booking_id}</p>
                  )}
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground uppercase font-bold">Guest Contact</Label>
                  <p className="font-semibold text-sm mt-0.5">
                    {selectedBooking.holder_first_name
                      ? `${selectedBooking.holder_first_name} ${selectedBooking.holder_last_name}`
                      : selectedBooking.user
                        ? `${selectedBooking.user.first_name} ${selectedBooking.user.last_name}`
                        : "N/A"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {selectedBooking.holder_email || selectedBooking.user?.email || "N/A"}
                  </p>
                  {selectedBooking.user?.phone && (
                    <p className="text-xs text-muted-foreground">{selectedBooking.user.phone}</p>
                  )}
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground uppercase font-bold">Financial Summary</Label>
                  <p className="font-semibold text-sm mt-0.5">
                    Total: {selectedBooking.currency} {Number(selectedBooking.total_price).toFixed(2)}
                  </p>
                  {verticalType === "properties" && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Paid: {selectedBooking.currency} {Number(selectedBooking.paid_amount || 0).toFixed(2)}
                    </p>
                  )}
                </div>
              </div>

              {verticalType === "properties" && (
                <div>
                  <Label className="text-xs text-muted-foreground uppercase font-bold">Stay Information</Label>
                  <div className="border rounded-lg p-3.5 mt-1.5 space-y-2">
                    <p className="font-semibold text-sm text-zinc-800">{selectedBooking.property_name}</p>
                    <p className="text-xs text-muted-foreground">{selectedBooking.property_city || "Destination location not set"}</p>
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t mt-2 text-center text-xs">
                      <div>
                        <p className="text-muted-foreground font-medium">Check-In</p>
                        <p className="font-bold mt-0.5">{formatDate(selectedBooking.check_in_date)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground font-medium">Check-Out</p>
                        <p className="font-bold mt-0.5">{formatDate(selectedBooking.check_out_date)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground font-medium">Duration</p>
                        <p className="font-bold mt-0.5">{selectedBooking.nights} Nights</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {verticalType === "flights" && (
                <div>
                  <Label className="text-xs text-muted-foreground uppercase font-bold">Flight Information</Label>
                  <div className="border rounded-lg p-3.5 mt-1.5 space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-muted-foreground block text-xs font-semibold">Airline</span>
                        <span className="font-medium text-zinc-800">{selectedBooking.airline}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs font-semibold">Flight Number</span>
                        <span className="font-medium text-zinc-800">{selectedBooking.flight_number}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t mt-2">
                      <div>
                        <span className="text-muted-foreground block text-xs font-semibold">Departure</span>
                        <span className="font-medium text-zinc-800">{selectedBooking.departure_airport}</span>
                        <span className="text-xs text-muted-foreground block mt-0.5">{selectedBooking.departure_time ? formatDate(selectedBooking.departure_time) : "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs font-semibold">Arrival</span>
                        <span className="font-medium text-zinc-800">{selectedBooking.arrival_airport}</span>
                        <span className="text-xs text-muted-foreground block mt-0.5">{selectedBooking.arrival_time ? formatDate(selectedBooking.arrival_time) : "N/A"}</span>
                      </div>
                    </div>
                    {selectedBooking.passenger_details && Array.isArray(selectedBooking.passenger_details) && (
                      <div className="pt-2 border-t mt-2">
                        <span className="text-muted-foreground block text-xs font-semibold mb-1">Passengers</span>
                        <ul className="list-disc list-inside text-xs space-y-1">
                          {selectedBooking.passenger_details.map((passenger: any, idx: number) => (
                            <li key={idx} className="text-zinc-700">
                              {passenger.first_name} {passenger.last_name} {passenger.passport_number ? `(Passport: ${passenger.passport_number})` : ""}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {verticalType === "cars" && (
                <div>
                  <Label className="text-xs text-muted-foreground uppercase font-bold">Car Rental Information</Label>
                  <div className="border rounded-lg p-3.5 mt-1.5 space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-muted-foreground block text-xs font-semibold">Rental Company</span>
                        <span className="font-medium text-zinc-800">{selectedBooking.rental_company}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs font-semibold">Car Model</span>
                        <span className="font-medium text-zinc-800">{selectedBooking.car_model} ({selectedBooking.car_class})</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t mt-2">
                      <div>
                        <span className="text-muted-foreground block text-xs font-semibold">Pickup Location</span>
                        <span className="font-medium text-zinc-800">{selectedBooking.pickup_location}</span>
                        <span className="text-xs text-muted-foreground block mt-0.5">{selectedBooking.pickup_time ? formatDate(selectedBooking.pickup_time) : "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs font-semibold">Dropoff Location</span>
                        <span className="font-medium text-zinc-800">{selectedBooking.dropoff_location}</span>
                        <span className="text-xs text-muted-foreground block mt-0.5">{selectedBooking.dropoff_time ? formatDate(selectedBooking.dropoff_time) : "N/A"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {verticalType === "experiences" && (
                <div>
                  <Label className="text-xs text-muted-foreground uppercase font-bold">Experience Ticket Information</Label>
                  <div className="border rounded-lg p-3.5 mt-1.5 space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground block text-xs font-semibold">Experience Name</span>
                      <span className="font-medium text-zinc-800">{selectedBooking.experience_name}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t mt-2">
                      <div>
                        <span className="text-muted-foreground block text-xs font-semibold">Category</span>
                        <span className="font-medium text-zinc-800 capitalize">{selectedBooking.category}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs font-semibold">Date</span>
                        <span className="font-medium text-zinc-800">{selectedBooking.activity_date ? formatDate(selectedBooking.activity_date) : "N/A"}</span>
                      </div>
                    </div>
                    <div className="pt-2 border-t mt-2">
                      <span className="text-muted-foreground block text-xs font-semibold">Tickets Booked</span>
                      <span className="font-medium text-zinc-800">{selectedBooking.quantity} Tickets</span>
                    </div>
                  </div>
                </div>
              )}

              {verticalType === "transfers" && (
                <div>
                  <Label className="text-xs text-muted-foreground uppercase font-bold">Transfer Booking Information</Label>
                  <div className="border rounded-lg p-3.5 mt-1.5 space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-muted-foreground block text-xs font-semibold">Transfer Type</span>
                        <span className="font-medium text-zinc-800 capitalize">{selectedBooking.transfer_type}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs font-semibold">Passengers</span>
                        <span className="font-medium text-zinc-800">{selectedBooking.passenger_count} Pax</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t mt-2">
                      <div>
                        <span className="text-muted-foreground block text-xs font-semibold">Pickup Location</span>
                        <span className="font-medium text-zinc-800">{selectedBooking.pickup_location}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-xs font-semibold">Dropoff Location</span>
                        <span className="font-medium text-zinc-800">{selectedBooking.dropoff_location}</span>
                      </div>
                    </div>
                    <div className="pt-2 border-t mt-2">
                      <span className="text-muted-foreground block text-xs font-semibold">Scheduled Time</span>
                      <span className="font-medium text-zinc-800">{selectedBooking.transfer_time ? formatDate(selectedBooking.transfer_time) : "N/A"}</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedBooking.internal_notes && (
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground uppercase font-bold">Internal Admin Notes</Label>
                  <div className="p-3 bg-zinc-50 border rounded-lg text-sm text-zinc-700 whitespace-pre-wrap">
                    {selectedBooking.internal_notes}
                  </div>
                </div>
              )}

              {(selectedBooking.booking_status === "cancelled" || selectedBooking.status === "cancelled") && (
                <div className="p-3.5 bg-red-50 border border-red-100 rounded-lg text-xs text-red-800">
                  <p className="font-bold">Cancellation Details:</p>
                  <p className="mt-1">
                    Cancelled {selectedBooking.cancelled_at ? `on ${formatDate(selectedBooking.cancelled_at)}` : ""} {selectedBooking.cancelled_by ? `by ${selectedBooking.cancelled_by}` : "by system/guest"}.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setDetailsDialogOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => {
                  setDetailsDialogOpen(false);
                  handleOpenStatus(selectedBooking);
                }}>
                  Update Status
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Update Status Dialog ─────────────────────────────────────────────── */}
      <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{verticalType === "properties" ? "Update Booking & Payment Status" : "Update Booking Status"}</DialogTitle>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-4 my-3">
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Booking Status</Label>
                <Select
                  value={statusForm.booking_status}
                  onValueChange={(val: any) =>
                    setStatusForm({ ...statusForm, booking_status: val })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BOOKING_STATUS_OPTIONS.filter((o) => o !== "All").map((opt) => (
                      <SelectItem key={opt} value={opt} className="capitalize">
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {verticalType === "properties" && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold">Payment Status</Label>
                    <Select
                      value={statusForm.payment_status}
                      onValueChange={(val: any) =>
                        setStatusForm({ ...statusForm, payment_status: val })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_STATUS_OPTIONS.filter((o) => o !== "All").map((opt) => (
                          <SelectItem key={opt} value={opt} className="capitalize">
                            {opt.replace("_", " ")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm font-semibold">Internal Notes</Label>
                    <Textarea
                      placeholder="Add administrative notes..."
                      value={statusForm.internal_notes}
                      onChange={(e) => setStatusForm({ ...statusForm, internal_notes: e.target.value })}
                      className="min-h-[100px]"
                    />
                  </div>
                </>
              )}

              <DialogFooter className="pt-2">
                <Button variant="outline" onClick={() => setStatusDialogOpen(false)} disabled={isUpdating}>
                  Cancel
                </Button>
                <Button onClick={handleStatusSubmit} disabled={isUpdating}>
                  {isUpdating && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                  Save Changes
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Refund Dialog ────────────────────────────────────────────────────── */}
      <Dialog open={refundDialogOpen} onOpenChange={setRefundDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-700">
              <RotateCcw className="h-5 w-5" />
              Issue Refund
            </DialogTitle>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-4 my-3">
              <div className="bg-rose-50 border border-rose-100 p-3.5 rounded-lg text-xs text-rose-800 space-y-1">
                <p className="font-bold">Refund Eligibility Summary:</p>
                <p>Original Total: {selectedBooking.currency} {Number(selectedBooking.total_price).toFixed(2)}</p>
                <p>Paid Amount: {selectedBooking.currency} {Number(selectedBooking.paid_amount || 0).toFixed(2)}</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Refund Type</Label>
                <Select
                  value={refundForm.refund_type}
                  onValueChange={(val: "full" | "partial") => {
                    const amt = val === "full" ? String(selectedBooking.paid_amount || selectedBooking.total_price) : "";
                    setRefundForm({ ...refundForm, refund_type: val, refund_amount: amt });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Full Refund</SelectItem>
                    <SelectItem value="partial">Partial Refund</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Refund Amount ({selectedBooking.currency})</Label>
                <Input
                  type="number"
                  placeholder="Enter amount..."
                  value={refundForm.refund_amount}
                  onChange={(e) => setRefundForm({ ...refundForm, refund_amount: e.target.value })}
                  disabled={refundForm.refund_type === "full"}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Reason for Refund</Label>
                <Input
                  placeholder="e.g. Customer cancellation, price adjustment..."
                  value={refundForm.reason}
                  onChange={(e) => setRefundForm({ ...refundForm, reason: e.target.value })}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-semibold">Internal Notes</Label>
                <Textarea
                  placeholder="Add internal details regarding this refund request..."
                  value={refundForm.internal_notes}
                  onChange={(e) => setRefundForm({ ...refundForm, internal_notes: e.target.value })}
                  className="min-h-[80px]"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button variant="outline" onClick={() => setRefundDialogOpen(false)} disabled={isRefunding}>
                  Cancel
                </Button>
                <Button className="bg-rose-600 hover:bg-rose-700 text-white" onClick={handleRefundSubmit} disabled={isRefunding}>
                  {isRefunding && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                  Confirm Refund
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
