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
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  ExternalLink,
  MoreHorizontal,
  RefreshCw,
  XCircle,
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
}

interface Booking {
  id: number;
  booking_reference: string;
  total_price: number;
}

interface Claim {
  id: number;
  user_id: number;
  booking_reference: string;
  competitor_url: string;
  competitor_price: number;
  screenshot_path: string | null;
  status: "pending" | "approved" | "rejected";
  refund_amount: number | null;
  verification_notes: string | null;
  created_at: string;
  user?: User;
  booking?: Booking;
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  total: number;
  from: number;
  to: number;
  per_page: number;
}

interface ClaimsApiResponse {
  success: boolean;
  data: {
    data: Claim[];
  } & PaginationMeta;
}

const STATUS_OPTIONS = ["All", "pending", "approved", "rejected"];

export default function PriceMatchClaims() {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);

  // ─── Moderation Dialog state ───────────────────────────────────────────────
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [verificationNotes, setVerificationNotes] = useState("");
  const [actionType, setActionType] = useState<"approved" | "rejected">("approved");
  const [confirmationOpen, setConfirmationOpen] = useState(false);

  const queryKey = [
    "price-match-claims",
    { page, statusFilter, search: appliedSearch },
  ] as const;

  // ─── Fetch claims ─────────────────────────────────────────────────────────
  const { data, isFetching, refetch } = useQuery({
    queryKey,
    queryFn: () => {
      const params = new URLSearchParams({ page: String(page), per_page: "20" });
      if (statusFilter !== "All") params.append("status", statusFilter);
      if (appliedSearch.trim()) params.append("search", appliedSearch.trim());

      return makeApiRequest<ClaimsApiResponse>(
        `${apiUrl.getPriceMatchClaims}?${params.toString()}`
      );
    },
  });

  const claims: Claim[] = data?.data?.data ?? [];
  const meta: PaginationMeta = {
    current_page: data?.data?.current_page ?? 1,
    last_page: data?.data?.last_page ?? 1,
    total: data?.data?.total ?? 0,
    from: data?.data?.from ?? 0,
    to: data?.data?.to ?? 0,
    per_page: data?.data?.per_page ?? 20,
  };

  // ─── Verify claim mutation ─────────────────────────────────────────────────
  const { mutate: verifyClaim, isPending: isVerifying } = useMutation({
    mutationFn: ({ id, status, notes }: { id: number; status: "approved" | "rejected"; notes: string }) =>
      makeApiRequest(`${apiUrl.verifyPriceMatchClaim}/${id}/verify`, {
        method: "POST",
        data: { status, verification_notes: notes },
      }),
    onSuccess: (res: any) => {
      if (res?.success) {
        toast.success(`Claim ${actionType} successfully.`);
        setReviewDialogOpen(false);
        setConfirmationOpen(false);
        setSelectedClaim(null);
        setVerificationNotes("");
        queryClient.invalidateQueries({ queryKey: ["price-match-claims"] });
      } else {
        toast.error(res?.message || "Failed to process claim");
      }
    },
    onError: (err: any) => {
      toast.error(err?.message || "An error occurred during verification.");
    },
  });

  const handleOpenReview = (claim: Claim) => {
    setSelectedClaim(claim);
    setVerificationNotes(claim.verification_notes || "");
    setReviewDialogOpen(true);
  };

  const handleActionClick = (type: "approved" | "rejected") => {
    setActionType(type);
    setConfirmationOpen(true);
  };

  const handleConfirmAction = () => {
    if (selectedClaim) {
      verifyClaim({
        id: selectedClaim.id,
        status: actionType,
        notes: verificationNotes,
      });
    }
  };

  const handleSearch = () => {
    setAppliedSearch(search);
    setPage(1);
  };

  const handleStatusFilterChange = (val: string) => {
    setStatusFilter(val);
    setPage(1);
  };

  const columns: Column<Claim>[] = [
    {
      header: "User Details",
      render: (c) => (
        <div>
          <div className="font-medium text-sm">
            {c.user ? `${c.user.first_name} ${c.user.last_name}` : "Guest User"}
          </div>
          <div className="text-xs text-muted-foreground">
            {c.user?.email || "N/A"}
          </div>
        </div>
      ),
    },
    {
      header: "Booking Reference",
      render: (c) => (
        <div>
          <span className="font-mono text-sm font-semibold text-green-700">
            {c.booking_reference}
          </span>
          {c.booking && (
            <div className="text-xs text-muted-foreground">
              Total Price: ${c.booking.total_price}
            </div>
          )}
        </div>
      ),
    },
    {
      header: "Competitor Rates",
      render: (c) => (
        <div>
          <div className="text-sm font-semibold text-red-600">
            ${c.competitor_price}
          </div>
          <a
            href={c.competitor_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-blue-600 hover:underline mt-0.5"
          >
            Visit Competitor <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      ),
    },
    {
      header: "Potential Refund",
      render: (c) => {
        if (c.status === "approved" && c.refund_amount !== null) {
          return (
            <span className="font-semibold text-green-600">
              Refunded: ${c.refund_amount}
            </span>
          );
        }
        if (c.booking) {
          const diff = Number(c.booking.total_price) - Number(c.competitor_price);
          return (
            <span className="font-medium text-amber-600">
              Diff: ${diff > 0 ? diff.toFixed(2) : "0.00"}
            </span>
          );
        }
        return <span className="text-muted-foreground">—</span>;
      },
    },
    {
      header: "Status",
      render: (c) => {
        let variant: "default" | "secondary" | "destructive" = "default";
        let icon = <Clock className="h-3 w-3 mr-1" />;
        let styles = "bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200";

        if (c.status === "approved") {
          icon = <CheckCircle className="h-3 w-3 mr-1" />;
          styles = "bg-green-100 text-green-800 hover:bg-green-100 border-green-200";
        } else if (c.status === "rejected") {
          icon = <XCircle className="h-3 w-3 mr-1" />;
          styles = "bg-red-100 text-red-800 hover:bg-red-100 border-red-200";
        }

        return (
          <Badge className={`capitalize border ${styles}`}>
            {icon}
            {c.status}
          </Badge>
        );
      },
    },
    {
      header: "Submitted At",
      render: (c) => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {formatDate(c.created_at)}
        </span>
      ),
    },
    {
      header: "Actions",
      className: "text-right",
      render: (c) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleOpenReview(c)} className="gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                Review Claim
              </DropdownMenuItem>
              {c.competitor_url && (
                <DropdownMenuItem
                  onClick={() => window.open(c.competitor_url, "_blank")}
                  className="gap-2"
                >
                  <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  Visit Competitor URL
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Price Match Claims</h1>
          <p className="text-muted-foreground">Approve, reject and refund competitor price match submissions</p>
        </div>
        <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Main content table card */}
      <Card className="border border-zinc-200 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-zinc-800">Claims Log</CardTitle>
              {meta.total > 0 && (
                <p className="text-sm text-muted-foreground mt-1">
                  Showing {meta.from} to {meta.to} of {meta.total} claims
                </p>
              )}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Booking reference..."
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
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt} className="capitalize">
                      {opt === "All" ? "All Status" : opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={claims}
            loading={isFetching}
            rowKey={(c) => c.id}
            emptyMessage="No price match claims found."
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

      {/* ─── Claim Review Dialog ──────────────────────────────────────────────── */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Price Match Claim</DialogTitle>
          </DialogHeader>

          {selectedClaim && (
            <div className="space-y-6 my-4">
              <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-lg border">
                <div>
                  <Label className="text-xs text-muted-foreground uppercase font-bold">User Information</Label>
                  <p className="font-semibold text-sm mt-0.5">
                    {selectedClaim.user ? `${selectedClaim.user.first_name} ${selectedClaim.user.last_name}` : "Guest User"}
                  </p>
                  <p className="text-xs text-muted-foreground">{selectedClaim.user?.email || "No email available"}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground uppercase font-bold">Booking Details</Label>
                  <p className="font-semibold text-sm mt-0.5 text-green-700">{selectedClaim.booking_reference}</p>
                  {selectedClaim.booking && (
                    <p className="text-xs text-muted-foreground">Original Charged Rate: ${selectedClaim.booking.total_price}</p>
                  )}
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground uppercase font-bold">Competitor Rate</Label>
                  <p className="font-semibold text-sm mt-0.5 text-red-600">${selectedClaim.competitor_price}</p>
                  <a
                    href={selectedClaim.competitor_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-blue-600 hover:underline mt-0.5"
                  >
                    Inspect Deal Link <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground uppercase font-bold">Status</Label>
                  <div className="mt-0.5">
                    <Badge variant={selectedClaim.status === "approved" ? "default" : "secondary"}>
                      {selectedClaim.status}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Screenshot Proof */}
              {selectedClaim.screenshot_path && (
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground uppercase font-bold">Proof Screenshot</Label>
                  <div className="border rounded-lg overflow-hidden max-h-60 bg-black flex items-center justify-center">
                    <img
                      src={`${import.meta.env.VITE_API_URL?.replace('/api/v1', '')}/storage/${selectedClaim.screenshot_path}`}
                      alt="Price Match Screenshot"
                      className="max-h-60 max-w-full object-contain cursor-zoom-in"
                      onClick={() => window.open(`${import.meta.env.VITE_API_URL?.replace('/api/v1', '')}/storage/${selectedClaim.screenshot_path}`, "_blank")}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground text-center">Click image to open in full size.</p>
                </div>
              )}

              {/* Notes Input */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-zinc-800">Verification Notes</Label>
                <Textarea
                  placeholder="Enter detailed validation notes (e.g. details of lower rates found, reasons for rejection, refund approvals)..."
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  disabled={selectedClaim.status !== "pending"}
                  className="min-h-[100px]"
                />
              </div>

              {selectedClaim.status === "pending" ? (
                <div className="flex justify-end gap-3 pt-2">
                  <Button variant="destructive" onClick={() => handleActionClick("rejected")}>
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject Claim
                  </Button>
                  <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleActionClick("approved")}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Approve & Refund
                  </Button>
                </div>
              ) : (
                <div className="bg-muted p-3.5 rounded-lg border text-center text-sm text-muted-foreground">
                  This claim has already been resolved and cannot be changed.
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ─── Confirmation Dialog ─────────────────────────────────────────────── */}
      <Dialog open={confirmationOpen} onOpenChange={setConfirmationOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Confirm {actionType === "approved" ? "Approval" : "Rejection"}
            </DialogTitle>
          </DialogHeader>
          <div className="py-3 text-sm text-zinc-600">
            {actionType === "approved" ? (
              <p>
                Are you sure you want to approve this claim? This will <strong>automatically trigger a refund</strong> of the price difference via the payment gateway directly to the user's card. This action cannot be undone.
              </p>
            ) : (
              <p>Are you sure you want to reject this claim? No refund will be initialized.</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmationOpen(false)} disabled={isVerifying}>
              Cancel
            </Button>
            <Button
              className={actionType === "approved" ? "bg-green-600 hover:bg-green-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"}
              onClick={handleConfirmAction}
              disabled={isVerifying}
            >
              {isVerifying && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
              Yes, Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
