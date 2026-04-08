import { useNavigate, useLocation } from "react-router-dom";
import { Home, ArrowLeft, MessageCircle, Search, LayoutDashboard, Users, BarChart3, DollarSign } from "lucide-react";

const QUICK_LINKS = [
  { label: "Dashboard",  href: "/dashboard",       icon: LayoutDashboard },
  { label: "Users",      href: "/dashboard/users",  icon: Users           },
  { label: "Analytics",  href: "/dashboard/analytics/users", icon: BarChart3 },
  { label: "Finance",    href: "/dashboard/finance", icon: DollarSign     },
];

const NotFound = () => {
  const navigate  = useNavigate();
  const location  = useLocation();

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{
        background: "#FAFAF9",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* ── Background decorations ── */}
      <div
        className="absolute top-[-120px] right-[-120px] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(0,166,62,0.08) 0%, transparent 70%)" }}
      />
      <div
        className="absolute bottom-[-100px] left-[-100px] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(0,166,62,0.06) 0%, transparent 70%)" }}
      />

      {/* ── Subtle grid ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: "linear-gradient(#00a63e 1px, transparent 1px), linear-gradient(90deg, #00a63e 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      {/* ── Main card ── */}
      <div className="relative z-10 w-full max-w-lg text-center">

        {/* Logo */}
        <div className="flex items-center justify-center gap-2.5 mb-10">
          <div
            className="w-9 h-9 rounded-[12px] flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #00a63e 0%, #34d068 100%)",
              boxShadow: "0 8px 20px rgba(0,166,62,0.35)",
            }}
          >
            <MessageCircle className="w-[18px] h-[18px] text-white" />
          </div>
          <span className="font-extrabold text-[16px] text-gray-900 tracking-tight">Locksee Admin</span>
        </div>

        {/* 404 number */}
        <div className="relative mb-4 select-none">
          <p
            className="text-[130px] sm:text-[160px] font-black leading-none tracking-tighter"
            style={{
              background: "linear-gradient(135deg, #00a63e 0%, #34d068 40%, #86efac 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              filter: "drop-shadow(0 8px 24px rgba(0,166,62,0.25))",
            }}
          >
            404
          </p>

          {/* Floating badge over 404 */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2 px-4 py-2 rounded-2xl"
            style={{
              background: "rgba(255,255,255,0.92)",
              border: "1.5px solid #EDE8E3",
              boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
              backdropFilter: "blur(12px)",
            }}
          >
            <Search className="w-4 h-4" style={{ color: "#00a63e" }} />
            <span className="text-[13px] font-bold text-gray-600 whitespace-nowrap">Page not found</span>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-[22px] sm:text-[26px] font-black text-gray-900 tracking-tight mb-3">
          Oops! Wrong turn.
        </h1>
        <p className="text-[14.5px] text-gray-500 leading-relaxed mb-2">
          The page you're looking for doesn't exist or has been moved.
        </p>

        {/* Attempted path */}
        {location.pathname && (
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl mb-8"
            style={{ background: "#F5F0ED", border: "1px solid #EDE8E3" }}
          >
            <span className="text-[12px] font-semibold text-gray-400">Tried to visit:</span>
            <code className="text-[12px] font-bold text-[#00a63e] truncate max-w-[220px]">
              {location.pathname}
            </code>
          </div>
        )}

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl text-[14px] font-semibold transition-all duration-200 w-full sm:w-auto justify-center"
            style={{
              background: "#fff",
              border: "1.5px solid #EDE8E3",
              color: "#78716C",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = "#86efac";
              (e.currentTarget as HTMLElement).style.color = "#00a63e";
              (e.currentTarget as HTMLElement).style.background = "#f0fdf4";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = "#EDE8E3";
              (e.currentTarget as HTMLElement).style.color = "#78716C";
              (e.currentTarget as HTMLElement).style.background = "#fff";
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>

          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl text-[14px] font-bold text-white transition-all duration-200 w-full sm:w-auto justify-center"
            style={{
              background: "linear-gradient(135deg, #00a63e 0%, #34d068 100%)",
              boxShadow: "0 8px 20px rgba(0,166,62,0.35)",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = "0 12px 28px rgba(0,166,62,0.45)";
              (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 20px rgba(0,166,62,0.35)";
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            }}
          >
            <Home className="w-4 h-4" />
            Go to Dashboard
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px" style={{ background: "#EDE8E3" }} />
          <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Quick Links</span>
          <div className="flex-1 h-px" style={{ background: "#EDE8E3" }} />
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_LINKS.map((link, i) => {
            const Icon = link.icon;
            return (
              <button
                key={i}
                onClick={() => navigate(link.href)}
                className="flex flex-col items-center gap-2 px-3 py-4 rounded-2xl transition-all duration-200 group"
                style={{
                  background: "#fff",
                  border: "1.5px solid #EDE8E3",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "#86efac";
                  (e.currentTarget as HTMLElement).style.background = "#f0fdf4";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 20px rgba(0,166,62,0.15)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "#EDE8E3";
                  (e.currentTarget as HTMLElement).style.background = "#fff";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)";
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: "#f0fdf4" }}
                >
                  <Icon className="w-[17px] h-[17px]" style={{ color: "#00a63e" }} />
                </div>
                <span className="text-[12px] font-semibold text-gray-600">{link.label}</span>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <p className="text-[12px] text-gray-400 mt-10">
          Locksee Admin · v2.4.1 ·{" "}
          <span style={{ color: "#00a63e" }}>© 2025</span>
        </p>
      </div>
    </div>
  );
};

export default NotFound;
