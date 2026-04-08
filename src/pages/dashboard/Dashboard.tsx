
// // import { User, Activity, CalendarDays, FilePlus, LucideIcon } from "lucide-react";
// // import { StatsCard } from "@/components/StatsCard";
// // import {
// //   Card,
// //   CardContent,
// //   CardDescription,
// //   CardHeader,
// //   CardTitle,
// // } from "@/components/ui/card";
// // import {
// //   ResponsiveContainer,
// //   LineChart,
// //   Line,
// //   XAxis,
// //   YAxis,
// //   CartesianGrid,
// //   Tooltip,
// //   BarChart,
// //   Bar,
// // } from "recharts";
// // import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// // import UsageCard from "./UsageCard";
// // import SocketStatusCard from "./SocketStatusCard";
// // import QueueStatusCard from "./QueueStatusCard";
// // import { useEffect, useState } from "react";
// // import makeApiRequest from "@/services/axios";
// // import { apiUrl } from "@/services/api-end-point";

// // // Type definition for API response
// // interface DashboardStats {
// //   total_users: number;
// //   total_clients: number;
// //   total_providers: number;
// //   verified_users: number;
// //   pending_verification: number;
// //   active_users: number;
// //   suspended_users: number;
// //   pending_documents: number;
// // }

// // interface DashboardResponse {
// //   success: boolean;
// //   data: {
// //     stats: DashboardStats;
// //     recent_registrations: Array<{
// //       date: string;
// //       count: number;
// //     }>;
// //   };
// // }

// // interface StatCard {
// //   title: string;
// //   value: string;
// //   change: string;
// //   icon: LucideIcon;
// //   trend: "up" | "down";
// // }

// // const chartData = [
// //   { name: "Jan", revenue: 4000, users: 400 },
// //   { name: "Feb", revenue: 3000, users: 300 },
// //   { name: "Mar", revenue: 5000, users: 500 },
// //   { name: "Apr", revenue: 4500, users: 450 },
// //   { name: "May", revenue: 6000, users: 600 },
// //   { name: "Jun", revenue: 5500, users: 550 },
// // ];

// // export default function Dashboard() {
// //   const [statsData, setStatsData] = useState<StatCard[]>([]);
// //   const [loading, setLoading] = useState(true);

// //   const fetchData = async () => {
// //     try {
// //       setLoading(true);
// //       const response: DashboardResponse = await makeApiRequest(apiUrl.dashboardStats, {
// //         method: "GET",
// //       });

// //       console.log("Dashboard API Response:", response);

// //       if (response?.success && response?.data?.stats) {
// //         const stats = response.data.stats;

// //         // Transform API data to StatsCard format
// //         const transformedStats: StatCard[] = [
// //           {
// //             title: "Total Users",
// //             value: stats.total_users.toString(),
// //             change: `${stats.verified_users} verified`,
// //             icon: User,
// //             trend: "up" as const,
// //           },
// //           {
// //             title: "Pending Verification",
// //             value: stats.pending_verification.toString(),
// //             change: `${stats.pending_documents} documents`,
// //             icon: FilePlus,
// //             trend: "up" as const,
// //           },
// //           {
// //             title: "Active Users",
// //             value: stats.active_users.toString(),
// //             change: "live",
// //             icon: Activity,
// //             trend: "up" as const,
// //           },
// //           {
// //             title: "Total Clients",
// //             value: stats.total_clients.toString(),
// //             change: `${stats.total_clients} clients`,
// //             icon: CalendarDays,
// //             trend: "up" as const,
// //           },
// //           {
// //             title: "Total Providers",
// //             value: stats.total_providers.toString(),
// //             change: `${stats.total_providers} providers`,
// //             icon: CalendarDays,
// //             trend: "up" as const,
// //           },
// //           {
// //             title: "Verified Users",
// //             value: stats.verified_users.toString(),
// //             change: `${stats.verified_users} verified`,
// //             icon: CalendarDays,
// //             trend: "up" as const,
// //           },
// //           {
// //             title: "Suspended Users",
// //             value: stats.suspended_users.toString(),
// //             change: `${stats.suspended_users} suspended`,
// //             icon: CalendarDays,
// //             trend: "up" as const,
// //           },
// //           {
// //             title: "Pending Documents",
// //             value: stats.pending_documents.toString(),
// //             change: `${stats.pending_documents} documents`,
// //             icon: CalendarDays,
// //             trend: "down" as const,
// //           },
// //         ];

// //         setStatsData(transformedStats);
// //       }
// //     } catch (error) {
// //       console.error("Error fetching dashboard data:", error);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     fetchData();
// //   }, []);

// //   return (
// //     <div className="space-y-6">
// //       {/* Stats Cards */}
// //       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
// //         {loading ? (
// //           // Loading skeleton
// //           Array.from({ length: 4 }).map((_, index) => (
// //             <div
// //               key={index}
// //               className="h-32 bg-gray-200 animate-pulse rounded-lg"
// //             />
// //           ))
// //         ) : statsData.length > 0 ? (
// //           statsData.map((stat, index) => <StatsCard key={index} {...stat} />)
// //         ) : (
// //           <div className="col-span-4 text-center text-gray-500">
// //             No data available
// //           </div>
// //         )}
// //       </div>

// //       {/* Charts */}
// //       <div className="grid gap-6 md:grid-cols-2">
// //         <Card>
// //           <CardHeader>
// //             <CardTitle>
// //               <div className="flex items-center justify-between mb-3">
// // //                 App Downloader{" "}
// // //                 <Select>
// // //                   <SelectTrigger className="w-[180px]">
// // //                     <SelectValue placeholder="Select a month" />
// // //                   </SelectTrigger>
// // //                   <SelectContent>
// // //                     <SelectItem value="light">Day</SelectItem>
// // //                     <SelectItem value="dark">Week</SelectItem>
// // //                     <SelectItem value="system">Month</SelectItem>
// // //                   </SelectContent>
// // //                 </Select>
// // //               </div>
// // //             </CardTitle>
// // //           </CardHeader>
// // //           <CardContent>
// // //             <ResponsiveContainer width="100%" height={300}>
// // //               <LineChart data={chartData}>
// // //                 <CartesianGrid strokeDasharray="3 3" />
// // //                 <XAxis dataKey="name" />
// // //                 <YAxis />
// // //                 <Tooltip />
// // //                 <Line
// // //                   type="monotone"
// // //                   dataKey="revenue"
// // //                   stroke="hsl(var(--primary))"
// // //                   strokeWidth={2}
// // //                 />
// // //               </LineChart>
// // //             </ResponsiveContainer>
// // //           </CardContent>
// // //         </Card>

// // //         <Card>
// // //           <CardHeader>
// // //             <CardTitle>User Growth</CardTitle>
// // //             <CardDescription>New users registered each month</CardDescription>
// // //           </CardHeader>
// // //           <CardContent>
// // //             <ResponsiveContainer width="100%" height={300}>
// // //               <BarChart data={chartData}>
// // //                 <CartesianGrid strokeDasharray="3 3" />
// // //                 <XAxis dataKey="name" />
// // //                 <YAxis />
// // //                 <Tooltip />
// // //                 <Bar dataKey="users" fill="hsl(var(--primary))" />
// // //               </BarChart>
// // //             </ResponsiveContainer>
// // //           </CardContent>
// // //         </Card>
// // //       </div>

// // //       {/* Activity Log */}
// // //       <Card>
// // //         <CardHeader>
// // //           <CardTitle className="text-xl">Server Health Monitor</CardTitle>
// // //         </CardHeader>
// // //         <CardContent>
// // //           <div className="bg-white p-6 rounded-xl shadow-md pt-0">
// // //             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
// // //               <UsageCard label="CPU Usage" value={60} />
// // //               <UsageCard label="RAM Usage" value={45} />
// // //               <UsageCard label="Disk Usage" value={75} />
// // //             </div>

// // //             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
// // //               <SocketStatusCard status="connected" socketCount={132} />
// // //             </div>
// // //           </div>
// // //         </CardContent>
// // //       </Card>
// // //     </div>
// // //   );
// // // }
















// import { User, Activity, CalendarDays, FilePlus, LucideIcon, DollarSign, Star, Package, TrendingUp } from "lucide-react";
// import { StatsCard } from "@/components/StatsCard";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   ResponsiveContainer,
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   BarChart,
//   Bar,
// } from "recharts";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import UsageCard from "./UsageCard";
// import SocketStatusCard from "./SocketStatusCard";
// import { useEffect, useState } from "react";
// import makeApiRequest from "@/services/axios";
// import { apiUrl } from "@/services/api-end-point";

// // Type definitions
// interface DashboardData {
//   users: {
//     total: number;
//     new_today: number;
//     new_yesterday: number;
//     active_providers: number;
//   };
//   bookings: {
//     total: number;
//     today: number;
//     pending: number;
//     completed_last_30_days: number;
//   };
//   revenue: {
//     total: number;
//     today: number;
//     last_30_days: number;
//     pending: number;
//   };
//   reviews: {
//     total: number;
//     avg_rating: number;
//     pending: number;
//   };
//   listings: {
//     total: number;
//     active: number;
//     pending: number;
//   };
//   subscriptions: {
//     active: number;
//     trial: number;
//     mrr: number;
//   };
// }

// interface DashboardResponse {
//   success: boolean;
//   data: DashboardData;
// }

// interface StatCard {
//   title: string;
//   value: string;
//   change: string;
//   icon: LucideIcon;
//   trend: "up" | "down";
// }

// const chartData = [
//   { name: "Jan", revenue: 4000, users: 400 },
//   { name: "Feb", revenue: 3000, users: 300 },
//   { name: "Mar", revenue: 5000, users: 500 },
//   { name: "Apr", revenue: 4500, users: 450 },
//   { name: "May", revenue: 6000, users: 600 },
//   { name: "Jun", revenue: 5500, users: 550 },
// ];

// export default function Dashboard() {
//   const [statsData, setStatsData] = useState<StatCard[]>([]);
//   const [loading, setLoading] = useState(true);

//   const fetchData = async () => {
//     try {
//       setLoading(true);
//       const response: DashboardResponse = await makeApiRequest(
//         "admin/analytics/dashboard",
//         {
//           method: "GET",
//         }
//       );

//       console.log("Dashboard API Response:", response);

//       if (response?.success && response?.data) {
//         const data = response.data;

//         // Transform API data to StatsCard format
//         const transformedStats: StatCard[] = [
//           {
//             title: "Total Users",
//             value: data.users.total.toString(),
//             change: `${data.users.new_today} new today`,
//             icon: User,
//             trend: "up" as const,
//           },
//           {
//             title: "Active Service Providers",
//             value: data.users.active_providers.toString(),
//             change: "currently active",
//             icon: Activity,
//             trend: "up" as const,
//           },
//           {
//             title: "Total Bookings",
//             value: data.bookings.total.toString(),
//             change: `${data.bookings.today} today`,
//             icon: CalendarDays,
//             trend: "up" as const,
//           },
//           {
//             title: "Pending Bookings",
//             value: data.bookings.pending.toString(),
//             change: "awaiting action",
//             icon: FilePlus,
//             trend: "up" as const,
//           },
//           {
//             title: "Total Revenue",
//             value: `$${data.revenue.total.toFixed(2)}`,
//             change: `$${data.revenue.today} today`,
//             icon: DollarSign,
//             trend: "up" as const,
//           },
//           {
//             title: "Revenue (30 Days)",
//             value: `$${data.revenue.last_30_days.toFixed(2)}`,
//             change: "last month",
//             icon: TrendingUp,
//             trend: "up" as const,
//           },
//           {
//             title: "Average Rating",
//             value: data.reviews.avg_rating.toFixed(1),
//             change: `${data.reviews.total} reviews`,
//             icon: Star,
//             trend: "up" as const,
//           },
//           {
//             title: "Active Listings",
//             value: data.listings.active.toString(),
//             change: `${data.listings.pending} pending`,
//             icon: Package,
//             trend: "up" as const,
//           },
//           {
//             title: "Active Subscriptions",
//             value: data.subscriptions.active.toString(),
//             change: `$${data.subscriptions.mrr} MRR`,
//             icon: TrendingUp,
//             trend: "up" as const,
//           },
//         ];

//         setStatsData(transformedStats);
//       }
//     } catch (error) {
//       console.error("Error fetching dashboard data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchData();
//   }, []);

//   return (
//     <div className="space-y-6">
//       {/* Stats Cards */}
//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//         {loading ? (
//           // Loading skeleton
//           Array.from({ length: 9 }).map((_, index) => (
//             <div
//               key={index}
//               className="h-32 bg-gray-200 animate-pulse rounded-lg"
//             />
//           ))
//         ) : statsData.length > 0 ? (
//           statsData.map((stat, index) => <StatsCard key={index} {...stat} />)
//         ) : (
//           <div className="col-span-3 text-center text-gray-500">
//             No data available
//           </div>
//         )}
//       </div>

//       {/* Charts */}
//       <div className="grid gap-6 md:grid-cols-2">
//         <Card>
//           <CardHeader>
//             <CardTitle>
//               <div className="flex items-center justify-between mb-3">
//                 App Downloader{" "}
//                 <Select>
//                   <SelectTrigger className="w-[180px]">
//                     <SelectValue placeholder="Select a month" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="day">Day</SelectItem>
//                     <SelectItem value="week">Week</SelectItem>
//                     <SelectItem value="month">Month</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//             </CardTitle>
//           </CardHeader>
//           <CardContent>
//             <ResponsiveContainer width="100%" height={300}>
//               <LineChart data={chartData}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="name" />
//                 <YAxis />
//                 <Tooltip />
//                 <Line
//                   type="monotone"
//                   dataKey="revenue"
//                   stroke="hsl(var(--primary))"
//                   strokeWidth={2}
//                 />
//               </LineChart>
//             </ResponsiveContainer>
//           </CardContent>
//         </Card>

//         <Card>
//           <CardHeader>
//             <CardTitle>User Growth</CardTitle>
//             <CardDescription>New users registered each month</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <ResponsiveContainer width="100%" height={300}>
//               <BarChart data={chartData}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="name" />
//                 <YAxis />
//                 <Tooltip />
//                 <Bar dataKey="users" fill="hsl(var(--primary))" />
//               </BarChart>
//             </ResponsiveContainer>
//           </CardContent>
//         </Card>
//       </div>

//       {/* Activity Log */}
//       <Card>
//         <CardHeader>
//           <CardTitle className="text-xl">Server Health Monitor</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <div className="bg-white p-6 rounded-xl shadow-md pt-0">
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//               <UsageCard label="CPU Usage" value={60} />
//               <UsageCard label="RAM Usage" value={45} />
//               <UsageCard label="Disk Usage" value={75} />
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
//               <SocketStatusCard status="connected" socketCount={132} />
//             </div>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

































"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Activity,
    ArrowDownRight,
    ArrowUpRight,
    Ban, Bell,
    Clock,
    Globe, HardDrive,
    Hash,
    Image,
    MessageSquare,
    Mic,
    Phone,
    ShieldAlert, TrendingUp,
    UserCheck,
    Users,
    Wifi
} from "lucide-react";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis, YAxis
} from "recharts";

// ─────────────────────────────────────────
// DUMMY DATA
// ─────────────────────────────────────────
const userGrowth = [
  { month: "Aug", users: 12400, active: 8200 },
  { month: "Sep", users: 18600, active: 12100 },
  { month: "Oct", users: 24800, active: 17400 },
  { month: "Nov", users: 31200, active: 22600 },
  { month: "Dec", users: 42000, active: 31800 },
  { month: "Jan", users: 58700, active: 44200 },
  { month: "Feb", users: 74300, active: 56100 },
];

const messageVolume = [
  { day: "Mon", messages: 142000, media: 38000 },
  { day: "Tue", messages: 168000, media: 42000 },
  { day: "Wed", messages: 154000, media: 35000 },
  { day: "Thu", messages: 191000, media: 51000 },
  { day: "Fri", messages: 223000, media: 67000 },
  { day: "Sat", messages: 198000, media: 73000 },
  { day: "Sun", messages: 176000, media: 58000 },
];

const messageTypes = [
  { name: "Text", value: 58, color: "#00a63e" },
  { name: "Images", value: 22, color: "#FF6B35" },
  { name: "Voice", value: 11, color: "#1A1A2E" },
  { name: "Video", value: 6, color: "#E84545" },
  { name: "Docs", value: 3, color: "#888" },
];

const retentionData = [
  { period: "Day 1", rate: 82 },
  { period: "Day 7", rate: 61 },
  { period: "Day 14", rate: 48 },
  { period: "Day 30", rate: 37 },
  { period: "Day 60", rate: 29 },
  { period: "Day 90", rate: 24 },
];

const recentActivity = [
  { type: "report", user: "Ali Hassan", action: "Reported for spam", time: "2m ago", badge: "warning" },
  { type: "ban", user: "Unknown_88", action: "Auto-banned — bot detected", time: "8m ago", badge: "danger" },
  { type: "join", user: "Priya Sharma", action: "New registration", time: "12m ago", badge: "success" },
  { type: "group", user: "TechTalk Group", action: "Group dissolved by admin", time: "19m ago", badge: "info" },
  { type: "report", user: "Zara Ahmed", action: "Reported harassment", time: "31m ago", badge: "warning" },
  { type: "join", user: "Mark Johnson", action: "New registration", time: "45m ago", badge: "success" },
  { type: "ban", user: "Spammer_404", action: "Manual ban — fake account", time: "1h ago", badge: "danger" },
];

const topCountries = [
  { country: "Germany", users: 28400, flag: "🇵🇰", pct: 38 },
  { country: "India", users: 19200, flag: "🇮🇳", pct: 26 },
  { country: "UAE", users: 11600, flag: "🇦🇪", pct: 16 },
  { country: "UK", users: 8100, flag: "🇬🇧", pct: 11 },
  { country: "USA", users: 6700, flag: "🇺🇸", pct: 9 },
];

const pendingReports = [
  { id: "#R-4821", type: "Harassment", from: "User A → User B", priority: "High", time: "5m ago" },
  { id: "#R-4820", type: "Spam", from: "Group: Deals Hub", priority: "Medium", time: "23m ago" },
  { id: "#R-4819", type: "Fake Account", from: "Reported by 4 users", priority: "High", time: "1h ago" },
  { id: "#R-4818", type: "Inappropriate Media", from: "Private Chat", priority: "Critical", time: "2h ago" },
];

// ─────────────────────────────────────────
// STAT CARD COMPONENT
// ─────────────────────────────────────────
function StatCard({
  title, value, sub, icon: Icon, trend, trendVal, color = "orange"
}: {
  title: string; value: string; sub: string;
  icon: React.ElementType; trend?: "up" | "down";
  trendVal?: string; color?: string;
}) {
  const colorMap: Record<string, { bg: string; iconBg: string; iconColor: string; text: string }> = {
    orange: { bg: "bg-white", iconBg: "bg-[#f0fdf4]", iconColor: "text-[#00a63e]", text: "text-[#00a63e]" },
    dark:   { bg: "bg-[#1A1A1A]", iconBg: "bg-white/10", iconColor: "text-white", text: "text-white" },
    blue:   { bg: "bg-white", iconBg: "bg-blue-50", iconColor: "text-blue-500", text: "text-blue-500" },
    green:  { bg: "bg-white", iconBg: "bg-green-50", iconColor: "text-green-500", text: "text-green-500" },
    red:    { bg: "bg-white", iconBg: "bg-red-50", iconColor: "text-red-500", text: "text-red-500" },
  };
  const c = colorMap[color];

  return (
    <div className={`${c.bg} rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200`}>
      <div className="flex items-start justify-between">
        <div className={`${c.iconBg} p-2.5 rounded-xl`}>
          <Icon className={`w-5 h-5 ${c.iconColor}`} />
        </div>
        {trend && trendVal && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${trend === "up" ? "text-green-500" : "text-red-500"}`}>
            {trend === "up" ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            {trendVal}
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm font-medium text-gray-500 mt-0.5">{title}</p>
        <p className={`text-xs mt-1 font-medium ${color === "dark" ? "text-gray-400" : c.text}`}>{sub}</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────
// PRIORITY BADGE
// ─────────────────────────────────────────
function PriorityBadge({ p }: { p: string }) {
  const map: Record<string, string> = {
    Critical: "bg-red-100 text-red-700 border-red-200",
    High:     "bg-orange-100 text-orange-700 border-orange-200",
    Medium:   "bg-yellow-100 text-yellow-700 border-yellow-200",
    Low:      "bg-green-100 text-green-700 border-green-200",
  };
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${map[p] ?? "bg-gray-100 text-gray-600"}`}>{p}</span>;
}

function ActivityDot({ badge }: { badge: string }) {
  const map: Record<string, string> = {
    warning: "bg-yellow-400", danger: "bg-red-500",
    success: "bg-green-500",  info: "bg-blue-500",
  };
  return <span className={`w-2 h-2 rounded-full flex-shrink-0 ${map[badge] ?? "bg-gray-400"}`} />;
}

// ─────────────────────────────────────────
// MAIN DASHBOARD
// ─────────────────────────────────────────
export default function Dashboard() {
  return (
    <div className="space-y-6 p-4 sm:p-6 bg-gray-50 min-h-screen">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Locksee Chat App — Admin Overview</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 bg-white border border-gray-200 rounded-xl px-3 py-2 w-fit shadow-sm">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          Live  <span className="text-gray-300 mx-1">|</span>
          <Clock className="w-3.5 h-3.5" />
          {new Date().toLocaleString("en-PK", { dateStyle: "medium", timeStyle: "short" })}
        </div>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard title="Total Users"        value="74,312"  sub="1,240 new today"      icon={Users}        trend="up"   trendVal="+8.4%" color="orange" />
        <StatCard title="Online Right Now"   value="12,847"  sub="17% of total users"   icon={Activity}     trend="up"   trendVal="+3.1%" color="green"  />
        <StatCard title="Messages Today"     value="2.1M"    sub="Peak: 11 AM – 2 PM"   icon={MessageSquare}trend="up"   trendVal="+12%"  color="blue"   />
        <StatCard title="Active Groups"      value="8,934"   sub="342 created today"    icon={Hash}         trend="up"   trendVal="+5.6%" color="orange" />
        <StatCard title="Voice Messages"     value="148K"    sub="Today's voice notes"  icon={Mic}          trend="down" trendVal="-2.3%" color="red"    />
        <StatCard title="Media Shared"       value="312K"    sub="Images & videos"      icon={Image}        trend="up"   trendVal="+9.7%" color="blue"   />
        <StatCard title="Pending Reports"    value="27"      sub="4 critical — urgent"  icon={ShieldAlert}  trend="up"   trendVal="+3"    color="red"    />
        <StatCard title="Banned Accounts"    value="1,284"   sub="18 banned today"      icon={Ban}                                        color="red"    />
        <StatCard title="New Registrations"  value="1,240"   sub="vs 1,108 yesterday"   icon={UserCheck}    trend="up"   trendVal="+11%"  color="green"  />
        <StatCard title="Active Calls"       value="2,341"   sub="Voice + video calls"  icon={Phone}        trend="up"   trendVal="+6.2%" color="blue"   />
        <StatCard title="Push Notifications" value="86K"     sub="Sent in last 24h"     icon={Bell}         trend="up"   trendVal="+4.1%" color="orange" />
        <StatCard title="Storage Used"       value="3.8 TB"  sub="AWS S3 + CloudFront"  icon={HardDrive}    trend="up"   trendVal="+2.1%" color="orange" />
      </div>

      {/* ── Charts Row 1 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* User Growth */}
        <div className="lg:col-span-2">
          <Card className="rounded-2xl border-gray-100 shadow-sm h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-gray-900">User Growth</CardTitle>
                  <CardDescription className="text-xs">Total vs Active users — last 7 months</CardDescription>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[#00a63e] inline-block rounded" /> Total</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[#1A1A1A] inline-block rounded" /> Active</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={userGrowth}>
                  <defs>
                    <linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00a63e" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#00a63e" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gActive" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1A1A1A" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#1A1A1A" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#999" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#999" }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v: number) => v.toLocaleString()} contentStyle={{ borderRadius: 12, border: "1px solid #eee", fontSize: 12 }} />
                  <Area type="monotone" dataKey="users"  stroke="#00a63e" strokeWidth={2.5} fill="url(#gTotal)"  dot={false} />
                  <Area type="monotone" dataKey="active" stroke="#1A1A1A" strokeWidth={2}   fill="url(#gActive)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Message Types Pie */}
        <Card className="rounded-2xl border-gray-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-gray-900">Message Types</CardTitle>
            <CardDescription className="text-xs">Breakdown by content type — today</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={messageTypes} cx="50%" cy="50%" innerRadius={48} outerRadius={72}
                  dataKey="value" paddingAngle={3} strokeWidth={0}>
                  {messageTypes.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(v: number) => `${v}%`} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 mt-2">
              {messageTypes.map((t, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-gray-600">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: t.color }} />
                  {t.name} <span className="ml-auto font-semibold text-gray-800">{t.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Charts Row 2 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Message Volume */}
        <div className="lg:col-span-2">
          <Card className="rounded-2xl border-gray-100 shadow-sm h-full">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-gray-900">Message Volume</CardTitle>
                  <CardDescription className="text-xs">Text messages vs media — this week</CardDescription>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><span className="w-3 h-2.5 bg-[#00a63e] inline-block rounded-sm" /> Messages</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-2.5 bg-[#1A1A2E] inline-block rounded-sm" /> Media</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={messageVolume} barSize={20} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#999" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#999" }} axisLine={false} tickLine={false} tickFormatter={v => `${(v/1000).toFixed(0)}K`} />
                  <Tooltip formatter={(v: number) => v.toLocaleString()} contentStyle={{ borderRadius: 12, border: "1px solid #eee", fontSize: 12 }} />
                  <Bar dataKey="messages" fill="#00a63e" radius={[4,4,0,0]} />
                  <Bar dataKey="media"    fill="#1A1A2E" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Retention */}
        <Card className="rounded-2xl border-gray-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-bold text-gray-900">User Retention</CardTitle>
            <CardDescription className="text-xs">% users still active after sign-up</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={retentionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F0F0F0" />
                <XAxis dataKey="period" tick={{ fontSize: 10, fill: "#999" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#999" }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} domain={[0,100]} />
                <Tooltip formatter={(v: number) => `${v}%`} contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                <Line type="monotone" dataKey="rate" stroke="#00a63e" strokeWidth={2.5} dot={{ r: 4, fill: "#00a63e", strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-3 flex items-center gap-3 bg-green-50 rounded-xl px-3 py-2">
              <TrendingUp className="w-4 h-4 text-[#00a63e]" />
              <p className="text-xs text-gray-600"><span className="font-bold text-[#00a63e]">37%</span> users active at Day 30 — industry avg is 25%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Bottom Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Pending Reports */}
        <Card className="rounded-2xl border-gray-100 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-gray-900">Pending Reports</CardTitle>
              <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full">27 Open</span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingReports.map((r, i) => (
              <div key={i} className="flex items-start justify-between bg-gray-50 rounded-xl px-3 py-2.5 gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[11px] font-bold text-gray-400">{r.id}</span>
                    <PriorityBadge p={r.priority} />
                  </div>
                  <p className="text-sm font-semibold text-gray-800 truncate">{r.type}</p>
                  <p className="text-xs text-gray-500 truncate">{r.from}</p>
                </div>
                <span className="text-[10px] text-gray-400 flex-shrink-0 mt-1">{r.time}</span>
              </div>
            ))}
            <button className="w-full text-xs font-semibold text-[#00a63e] hover:text-green-700 transition-colors py-1">
              View all reports →
            </button>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="rounded-2xl border-gray-100 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-gray-900">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity.map((a, i) => (
              <div key={i} className="flex items-center gap-3">
                <ActivityDot badge={a.badge} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{a.user}</p>
                  <p className="text-xs text-gray-500 truncate">{a.action}</p>
                </div>
                <span className="text-[10px] text-gray-400 flex-shrink-0">{a.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Countries + Server Health */}
        <div className="space-y-4">
          <Card className="rounded-2xl border-gray-100 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#00a63e]" />
                <CardTitle className="text-base font-bold text-gray-900">Top Countries</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {topCountries.map((c, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="flex items-center gap-2 font-medium text-gray-700">
                      <span className="text-base">{c.flag}</span> {c.country}
                    </span>
                    <span className="text-xs font-bold text-gray-500">{c.users.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#00a63e] to-[#009933] rounded-full transition-all duration-500"
                      style={{ width: `${c.pct}%` }} />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Server Health */}
          <Card className="rounded-2xl border-gray-100 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-green-500" />
                  <CardTitle className="text-base font-bold text-gray-900">Server Health</CardTitle>
                </div>
                <span className="text-[10px] font-bold bg-green-100 text-green-600 px-2 py-0.5 rounded-full">All OK</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: "CPU Usage",    value: 42, color: "bg-green-500" },
                { label: "RAM Usage",    value: 68, color: "bg-[#00a63e]" },
                { label: "Disk Usage",   value: 55, color: "bg-blue-500" },
                { label: "Bandwidth",    value: 31, color: "bg-green-500" },
              ].map((s, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600 font-medium">{s.label}</span>
                    <span className={`font-bold ${s.value > 80 ? "text-red-500" : s.value > 60 ? "text-orange-500" : "text-green-600"}`}>
                      {s.value}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${s.color} rounded-full transition-all duration-500`} style={{ width: `${s.value}%` }} />
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-2 mt-2 bg-green-50 rounded-xl px-3 py-2">
                <Activity className="w-3.5 h-3.5 text-green-500" />
                <span className="text-xs text-gray-600"><span className="font-bold text-green-600">132</span> active WebSocket connections</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}