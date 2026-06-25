"use client";
import { useAuth } from "@/context/auth";
import { useAppSelector } from "@/store/hooks";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  FileText,
  LayoutDashboard,
  LogOut,
  LucideIcon,
  Search,
  Settings,
  Shield,
  ShieldAlert
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

// ─── Types ───
interface SubMenuItem {
  name: string;
  href: string;
}
interface NavItem {
  name: string;
  href?: string;
  icon: LucideIcon;
  subItems?: SubMenuItem[];
  badge?: number;
  section: string;
  requiredPermission?: string;
}

// ─── Navigation ───
const navigation: NavItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    section: "Overview",
    // no requiredPermission — always visible
  },
  {
    name: "Properties",
    href: "/get-all-properties-listing",
    icon: LayoutDashboard,
    section: "Overview",
    requiredPermission: "manage-properties",
  },
  {
    name: "Pricing Markup",
    href: "/get-all-pricing-markup",
    icon: LayoutDashboard,
    section: "Overview",
    requiredPermission: "view-financials",
  },
  {
    name: "Price Match Claims",
    href: "/price-match-claims",
    icon: ShieldAlert,
    section: "Overview",
    requiredPermission: "view-financials",
  },
  {
    name: "Users",
    href: "/get-all-users",
    icon: LayoutDashboard,
    section: "Overview",
    requiredPermission: "manage-users",
  },
  {
    name: "Content CMS",
    href: "/content-cms",
    icon: FileText,
    section: "Overview",
    requiredPermission: "manage-seo",
  },
  {
    name: "SEO Management",
    href: "/seo-management",
    icon: Search,
    section: "Overview",
    requiredPermission: "manage-seo",
  },
  {
    name: "Roles & Permissions",
    href: "/roles-permissions",
    icon: Shield,
    section: "System",
    requiredPermission: "manage-roles",
  },
  {
    name: "Settings",
    href: "/admin-settings",
    icon: Settings,
    section: "System",
    requiredPermission: "manage-roles",
  },
  {
    name: "Blogs",
    icon: ShieldAlert,
    section: "Blogs",
    badge: 14,
    subItems: [
      { name: "Manage Blog Categories", href: "/blog/manage-blog-category" },
      { name: "Manage Blog Posts", href: "/blog/manage-blog" },
    ],
    requiredPermission: "manage-blog",
  },
];

// ─── Section order ───
const sectionOrder = [
  "Overview",
  "Messaging",
  "Users",
  "Content",
  "Notifications",
  "Analytics",
  "Finance",
  "System",
  "Blogs",
];

// ─── Design Tokens ───
const T = {
  bg: "#FFFFFF",
  bgHover: "#f0fdf4",
  border: "#EDE8E3",
  borderHover: "#86efac",
  text: "#18181B",
  textMuted: "#78716C",
  textLight: "#A8A29E",
  orange: "#00a63e",
  orangeHover: "#009933",
  orangeBg: "#f0fdf4",
  orangeBgDeep: "#dcfce7",
  iconBg: "#F5F0ED",
  sectionLabel: "#C4B5AD",
  profileBg: "#FAFAF9",
  scrollbar: "#F5F0ED",
};

// ─── Helpers ───
function avatarColor(s: string) {
  const c = ["#00a63e", "#2980B9", "#27AE60", "#8E44AD", "#E74C3C", "#16A085"];
  let h = 0;
  for (const ch of s) h = ch.charCodeAt(0) + ((h << 5) - h);
  return c[Math.abs(h) % c.length];
}

function hoverOn(el: HTMLElement, bg: string, color: string, border?: string) {
  el.style.background = bg;
  el.style.color = color;
  if (border !== undefined) el.style.borderColor = border;
}
function hoverOff(el: HTMLElement, bg: string, color: string, border?: string) {
  el.style.background = bg;
  el.style.color = color;
  if (border !== undefined) el.style.borderColor = border;
}

// ─── Sidebar Skeleton ───
function NavSkeleton({ collapsed }: { collapsed: boolean }) {
  const rows = [1, 2, 3, 4, 5, 6];
  return (
    <div style={{ padding: "8px 10px", display: "flex", flexDirection: "column", gap: 6 }}>
      {rows.map((i) => (
        <div key={i} className="flex items-center rounded-xl" style={{ gap: collapsed ? 0 : 9, padding: collapsed ? "7px 0" : "7px 10px", justifyContent: collapsed ? "center" : "flex-start" }}>
          <Skeleton className="rounded-lg flex-shrink-0" style={{ width: 28, height: 28 }} />
          {!collapsed && <Skeleton className="rounded-md flex-1" style={{ height: 14 }} />}
        </div>
      ))}
    </div>
  );
}

// ─── Main Sidebar ───
export function Sidebar() {
  const { profile, loading: profileLoading } = useAppSelector((state) => state.userProfile);
  const { permissions, fetched, loading: permsLoading } = useAppSelector((state) => state.rolePermissions);
  const [collapsed, setCollapsed] = useState(false);
  const [openMenus, setOpenMenus] = useState<string[]>(["Chats", "Finance"]);
  const { user } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname + location.search;

  const toggle = (n: string) =>
    setOpenMenus((p) => (p.includes(n) ? p.filter((x) => x !== n) : [...p, n]));
  const isOpen = (n: string) => openMenus.includes(n);
  const isActive = (href: string) =>
    href.includes("?") ? currentPath === href : location.pathname === href;
  const hasActive = (subs: SubMenuItem[]) => subs.some((s) => isActive(s.href));

  // Show skeleton while profile or permissions are loading
  const isLoadingNav = profileLoading || permsLoading;

  // Filter nav items by role permissions; before permissions load show all
  const visibleNavigation = !fetched
    ? navigation
    : navigation.filter(
        (item) => !item.requiredPermission || permissions.includes(item.requiredPermission)
      );

  // Grouped
  const grouped = visibleNavigation.reduce(
    (acc, item) => {
      if (!acc[item.section]) acc[item.section] = [];
      acc[item.section].push(item);
      return acc;
    },
    {} as Record<string, NavItem[]>,
  );

  return (
    <div
      className="flex flex-col h-screen flex-shrink-0 transition-all duration-300 ease-in-out"
      style={{
        width: collapsed ? 68 : 260,
        background: T.bg,
        borderRight: `1px solid ${T.border}`,
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* ── LOGO HEADER ── */}
      <div
        className="flex items-center justify-between flex-shrink-0"
        style={{
          padding: "0 16px",
          height: 64,
          borderBottom: `1px solid ${T.border}`,
        }}
      >
        {!collapsed ? (
          <>
            <div className="flex items-center gap-2.5">
              {/* <img
              src={
                "https://locksee-website-eyqq.vercel.app/_next/static/media/logo.f7b278d8.svg"
              }
              alt="Logo"
              className="h-[40px] w-auto"
            /> */}

              <div>
                <p className="text-lg font-bold text-green-600">PickPackgo</p>
              </div>
            </div>
            <button
              onClick={() => setCollapsed(true)}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              style={{
                color: T.textLight,
                border: `1px solid ${T.border}`,
                background: T.bg,
              }}
              onMouseEnter={(e) =>
                hoverOn(
                  e.currentTarget as HTMLElement,
                  T.bgHover,
                  T.orange,
                  T.borderHover,
                )
              }
              onMouseLeave={(e) =>
                hoverOff(
                  e.currentTarget as HTMLElement,
                  T.bg,
                  T.textLight,
                  T.border,
                )
              }
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2.5 w-full">
            <button
              onClick={() => setCollapsed(false)}
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ color: T.textLight, border: `1px solid ${T.border}` }}
              onMouseEnter={(e) =>
                hoverOn(
                  e.currentTarget as HTMLElement,
                  T.bgHover,
                  T.orange,
                  T.borderHover,
                )
              }
              onMouseLeave={(e) =>
                hoverOff(
                  e.currentTarget as HTMLElement,
                  "",
                  T.textLight,
                  T.border,
                )
              }
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* ── SEARCH ── */}
      {!collapsed && (
        <div style={{ padding: "12px 12px 4px" }}>
          <div
            className="flex items-center gap-2 rounded-xl cursor-pointer transition-all"
            style={{
              padding: "9px 12px",
              background: T.profileBg,
              border: `1px solid ${T.border}`,
            }}
            onMouseEnter={(e) =>
              hoverOn(
                e.currentTarget as HTMLElement,
                T.bgHover,
                "",
                T.borderHover,
              )
            }
            onMouseLeave={(e) =>
              hoverOff(
                e.currentTarget as HTMLElement,
                T.profileBg,
                "",
                T.border,
              )
            }
          >
            <Search
              className="w-3.5 h-3.5 flex-shrink-0"
              style={{ color: T.textLight }}
            />
            <span
              className="text-[12px] flex-1 select-none"
              style={{ color: T.textLight }}
            >
              Quick search…
            </span>
            <kbd
              className="text-[10px] font-bold rounded-md px-1.5 py-0.5"
              style={{
                background: T.orangeBg,
                color: T.orange,
                border: `1px solid ${T.orangeBgDeep}`,
              }}
            >
              ⌘K
            </kbd>
          </div>
        </div>
      )}

      {/* ── NAV ── */}
      <nav
        className="flex-1 overflow-y-auto"
        style={{
          padding: "8px 10px 8px",
          scrollbarWidth: "thin",
          scrollbarColor: `${T.scrollbar} transparent`,
        }}
      >
        <style>{`
          nav::-webkit-scrollbar { width: 4px }
          nav::-webkit-scrollbar-track { background: transparent }
          nav::-webkit-scrollbar-thumb { background: ${T.scrollbar}; border-radius: 4px }
        `}</style>

        {isLoadingNav ? (
          <NavSkeleton collapsed={collapsed} />
        ) : sectionOrder.map((sec, si) => {
          const items = grouped[sec];
          if (!items) return null;
          return (
            <div key={sec} style={{ marginTop: si === 0 ? 4 : 16 }}>
              {/* Section label */}
              {!collapsed && (
                <div className="flex items-center gap-2 px-1 mb-2">
                  <span
                    className="text-[10px] font-bold uppercase tracking-[0.1em] whitespace-nowrap"
                    style={{ color: T.sectionLabel }}
                  >
                    {sec}
                  </span>
                  <div
                    className="flex-1 h-px"
                    style={{ background: T.border }}
                  />
                </div>
              )}
              {collapsed && si > 0 && (
                <div className="flex justify-center my-3">
                  <div className="w-5 h-px" style={{ background: T.border }} />
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {items.map((item) => {
                  const active = item.href ? isActive(item.href) : false;
                  const subActive = item.subItems
                    ? hasActive(item.subItems)
                    : false;
                  const highlight = active || subActive;
                  const Icon = item.icon;

                  return (
                    <div key={item.name}>
                      {item.subItems ? (
                        <>
                          {/* Dropdown button */}
                          <button
                            onClick={() => !collapsed && toggle(item.name)}
                            title={collapsed ? item.name : undefined}
                            className="w-full flex items-center rounded-xl transition-all duration-150"
                            style={{
                              gap: collapsed ? 0 : 9,
                              padding: collapsed ? "7px 0" : "7px 10px",
                              justifyContent: collapsed
                                ? "center"
                                : "flex-start",
                              background: highlight
                                ? T.orangeBg
                                : "transparent",
                              color: highlight ? T.orange : T.textMuted,
                              fontSize: 13,
                              fontWeight: 500,
                            }}
                            onMouseEnter={(e) => {
                              if (!highlight)
                                hoverOn(
                                  e.currentTarget as HTMLElement,
                                  T.bgHover,
                                  T.text,
                                );
                            }}
                            onMouseLeave={(e) => {
                              if (!highlight)
                                hoverOff(
                                  e.currentTarget as HTMLElement,
                                  "transparent",
                                  T.textMuted,
                                );
                            }}
                          >
                            {/* Icon box */}
                            <div
                              className="flex items-center justify-center flex-shrink-0 rounded-lg"
                              style={{
                                width: 28,
                                height: 28,
                                background: highlight
                                  ? T.orangeBgDeep
                                  : T.iconBg,
                              }}
                            >
                              <Icon
                                style={{
                                  width: 15,
                                  height: 15,
                                  color: highlight ? T.orange : T.textMuted,
                                }}
                              />
                            </div>
                            {!collapsed && (
                              <>
                                <span style={{ flex: 1, textAlign: "left" }}>
                                  {item.name}
                                </span>
                                {item.badge ? (
                                  <span
                                    className="text-[10px] font-bold rounded-full flex items-center justify-center"
                                    style={{
                                      minWidth: 20,
                                      height: 20,
                                      padding: "0 6px",
                                      background: T.orangeBgDeep,
                                      color: T.orange,
                                    }}
                                  >
                                    {item.badge}
                                  </span>
                                ) : null}
                                {isOpen(item.name) ? (
                                  <ChevronUp
                                    style={{
                                      width: 14,
                                      height: 14,
                                      color: T.textLight,
                                      flexShrink: 0,
                                    }}
                                  />
                                ) : (
                                  <ChevronDown
                                    style={{
                                      width: 14,
                                      height: 14,
                                      color: T.textLight,
                                      flexShrink: 0,
                                    }}
                                  />
                                )}
                              </>
                            )}
                          </button>

                          {/* Sub items */}
                          {!collapsed && isOpen(item.name) && (
                            <div
                              style={{
                                marginTop: 2,
                                marginLeft: 40,
                                display: "flex",
                                flexDirection: "column",
                                gap: 1,
                              }}
                            >
                              {item.subItems.map((sub) => {
                                const sa = isActive(sub.href);
                                return (
                                  <NavLink
                                    key={sub.name}
                                    to={sub.href}
                                    className="flex items-center gap-2 rounded-lg transition-all duration-150"
                                    style={{
                                      padding: "6px 12px",
                                      fontSize: 12.5,
                                      fontWeight: 500,
                                      color: sa ? T.orange : T.textMuted,
                                      background: sa
                                        ? T.orangeBg
                                        : "transparent",
                                      borderLeft: `2px solid ${sa ? T.orange : "transparent"}`,
                                    }}
                                    onMouseEnter={(e) => {
                                      if (!sa)
                                        hoverOn(
                                          e.currentTarget as HTMLElement,
                                          T.bgHover,
                                          T.text,
                                        );
                                    }}
                                    onMouseLeave={(e) => {
                                      if (!sa)
                                        hoverOff(
                                          e.currentTarget as HTMLElement,
                                          "transparent",
                                          T.textMuted,
                                        );
                                    }}
                                  >
                                    <span
                                      className="rounded-full flex-shrink-0"
                                      style={{
                                        width: 5,
                                        height: 5,
                                        background: sa ? T.orange : T.border,
                                      }}
                                    />
                                    {sub.name}
                                  </NavLink>
                                );
                              })}
                            </div>
                          )}
                        </>
                      ) : (
                        /* Regular link */
                        <NavLink
                          to={item.href!}
                          title={collapsed ? item.name : undefined}
                          className="flex items-center rounded-xl transition-all duration-150"
                          style={{
                            gap: collapsed ? 0 : 9,
                            padding: collapsed ? "7px 0" : "7px 10px",
                            justifyContent: collapsed ? "center" : "flex-start",
                            background: active ? T.orangeBg : "transparent",
                            color: active ? T.orange : T.textMuted,
                            fontSize: 13,
                            fontWeight: 500,
                          }}
                          onMouseEnter={(e) => {
                            if (!active)
                              hoverOn(
                                e.currentTarget as HTMLElement,
                                T.bgHover,
                                T.text,
                              );
                          }}
                          onMouseLeave={(e) => {
                            if (!active)
                              hoverOff(
                                e.currentTarget as HTMLElement,
                                "transparent",
                                T.textMuted,
                              );
                          }}
                        >
                          <div
                            className="flex items-center justify-center flex-shrink-0 rounded-lg"
                            style={{
                              width: 28,
                              height: 28,
                              background: active ? T.orangeBgDeep : T.iconBg,
                            }}
                          >
                            <Icon
                              style={{
                                width: 15,
                                height: 15,
                                color: active ? T.orange : T.textMuted,
                              }}
                            />
                          </div>
                          {!collapsed && (
                            <>
                              <span style={{ flex: 1 }}>{item.name}</span>
                              {item.badge ? (
                                <span
                                  className="text-[10px] font-bold rounded-full flex items-center justify-center"
                                  style={{
                                    minWidth: 20,
                                    height: 20,
                                    padding: "0 6px",
                                    background: T.orangeBgDeep,
                                    color: T.orange,
                                  }}
                                >
                                  {item.badge}
                                </span>
                              ) : null}
                            </>
                          )}
                        </NavLink>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* ── USER PROFILE ── */}
      <div
        style={{
          padding: "10px 10px",
          borderTop: `1px solid ${T.border}`,
          flexShrink: 0,
        }}
      >
        <div
          className="flex items-center rounded-xl cursor-pointer transition-all duration-150"
          style={{
            gap: collapsed ? 0 : 10,
            padding: collapsed ? "10px 0" : "10px 12px",
            justifyContent: collapsed ? "center" : "flex-start",
            background: T.profileBg,
            border: `1px solid ${T.border}`,
          }}
          onMouseEnter={(e) =>
            hoverOn(
              e.currentTarget as HTMLElement,
              T.bgHover,
              "",
              T.borderHover,
            )
          }
          onMouseLeave={(e) =>
            hoverOff(e.currentTarget as HTMLElement, T.profileBg, "", T.border)
          }
        >
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-[11px] font-bold"
              style={{
                background: avatarColor(user?.full_name || "Admin"),
                boxShadow: `0 2px 8px rgba(0,0,0,0.15)`,
              }}
            >
              {(`${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() || "AD")
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>
            <span
              className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2"
              style={{ background: "#22c55e", borderColor: T.profileBg }}
            />
          </div>

          {!collapsed && (
            <>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: T.text,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {`${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() || "Admin User"}
                </p>
                <p
                  style={{
                    fontSize: 11,
                    color: T.textLight,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {profile?.email || "admin@locksee.app"}
                </p>
              </div>
              <button
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors flex-shrink-0"
                style={{ color: T.textLight }}
                title="Logout"
                onMouseEnter={(e) =>
                  hoverOn(e.currentTarget as HTMLElement, "#FEF2F2", "#ef4444")
                }
                onMouseLeave={(e) =>
                  hoverOff(
                    e.currentTarget as HTMLElement,
                    "transparent",
                    T.textLight,
                  )
                }
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
