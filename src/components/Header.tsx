
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/auth';
import { apiUrl } from '@/services/api-end-point';
import makeApiRequest from '@/services/axios';
import { notify } from '@/utils/utils';
import {
  LogOut, Settings, User, Bell, Search,
  ChevronDown, Shield, HelpCircle, Moon
} from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';

// ── Page title from route ──
function usePageTitle() {
  const { pathname } = useLocation();
  const map: Record<string, string> = {
    '/dashboard':     'Dashboard',
    '/users':         'User Management',
    '/chats':         'Chat & Messages',
    '/groups':        'Group Management',
    '/media':         'Media & Files',
    '/notifications': 'Push Notifications',
    '/analytics':     'Reports & Analytics',
    '/moderation':    'Moderation & Safety',
    '/settings':      'App Settings',
    '/finance':       'Finance & Billing',
    '/api':           'API & Integrations',
    '/roles':         'Roles & Permissions',
  };
  const key = Object.keys(map).find(k => pathname.startsWith(k));
  return key ? map[key] : 'Admin Panel';
}

export function Header() {
    const { profile, loading, error } = useAppSelector((state) => state.userProfile);
    console.log("User Profile in Sidebar:", profile);
  const { user }    = useAuth();
  const navigate    = useNavigate();
  const pageTitle   = usePageTitle();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen]   = useState(false);
  const [searchVal, setSearchVal]   = useState('');
  const [time, setTime]             = useState(new Date());

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // ESC to close search
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSearchOpen(false);
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true); }
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, []);

  const handleLogout = async () => {
    try {
      const response = await makeApiRequest(apiUrl.LogOut, { method: 'POST' });
      if (response.success === true) {
        notify({ message: response.message, type: 'success' });
        localStorage.clear();
        navigate('/');
      }
    } catch (error) {
      console.error('Logout Error:', error);
    }
  };

  const notifications = [
    { id: 1, icon: '🚨', title: '4 new reports pending',  sub: 'Require immediate review',    time: '2m ago',  unread: true  },
    { id: 2, icon: '👤', title: 'New admin invited',       sub: 'Ali Hassan — Support Agent',  time: '18m ago', unread: true  },
    { id: 3, icon: '💰', title: 'Revenue milestone hit',   sub: '$44K total revenue reached',  time: '1h ago',  unread: false },
    { id: 4, icon: '⚠️', title: 'Apple Pay degraded',     sub: 'Gateway latency is high',     time: '2h ago',  unread: false },
  ];
  const unreadCount = notifications.filter(n => n.unread).length;

  const initials = (profile?.first_name && profile?.last_name ? `${profile.first_name} ${profile.last_name}` : 'Admin')
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      {/* ══════════════════════════════════
          SEARCH OVERLAY
      ══════════════════════════════════ */}
      <div
        className="fixed inset-0 z-50"
        style={{
          opacity:        searchOpen ? 1 : 0,
          pointerEvents:  searchOpen ? 'auto' : 'none',
          transition:     'opacity 0.25s ease',
        }}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setSearchOpen(false)}
        />

        {/* Search Box */}
        <div
          className="absolute top-20 left-1/2 -translate-x-1/2 w-full max-w-xl px-4"
          style={{
            transform:  `translateX(-50%) translateY(${searchOpen ? '0' : '-12px'})`,
            opacity:    searchOpen ? 1 : 0,
            transition: 'transform 0.25s ease, opacity 0.25s ease',
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-50">
              <Search className="w-4 h-4 text-[#00a63e] flex-shrink-0" />
              <input
                autoFocus={searchOpen}
                value={searchVal}
                onChange={e => setSearchVal(e.target.value)}
                placeholder="Search users, groups, transactions…"
                className="flex-1 text-sm text-gray-700 outline-none placeholder-gray-400 bg-transparent"
              />
              <kbd className="text-[10px] font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-md">ESC</kbd>
            </div>
            <div className="p-2">
              {['User Management', 'Finance & Billing', 'Moderation', 'App Settings', 'Push Notifications'].map((item, i) => (
                <button
                  key={i}
                  onClick={() => setSearchOpen(false)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-green-50 transition-colors text-left group"
                  style={{ transitionDuration: '150ms' }}
                >
                  <span className="w-7 h-7 bg-[#f0fdf4] rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#00a63e] transition-colors">
                    <Shield className="w-3.5 h-3.5 text-[#00a63e] group-hover:text-white transition-colors" />
                  </span>
                  <span className="text-sm text-gray-700 font-medium group-hover:text-gray-900 transition-colors">{item}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-300 ml-auto -rotate-90 group-hover:text-[#00a63e] transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════
          HEADER
      ══════════════════════════════════ */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between gap-4">

          {/* ── Left: Page Title ── */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 leading-tight">{pageTitle}</h2>
            <div className="flex items-center gap-2 text-[11px] text-gray-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span>Live</span>
              <span className="text-gray-200">|</span>
              <span>
                {time.toLocaleTimeString('en-PK', {
                  hour: '2-digit', minute: '2-digit', second: '2-digit'
                })}
              </span>
            </div>
          </div>

          {/* ── Right: Actions ── */}
          <div className="flex items-center gap-1.5">

            {/* Search Trigger */}
            <button
              onClick={() => setSearchOpen(true)}
              className="
                group flex items-center gap-2 h-9 px-3 rounded-xl
                border border-gray-200 bg-gray-50
                hover:bg-white hover:border-[#00a63e]/50 hover:shadow-sm
                text-gray-400 hover:text-[#00a63e]
                transition-all duration-200
              "
            >
              <Search className="w-3.5 h-3.5 transition-transform duration-200 group-hover:scale-110" />
              <span className="text-xs hidden sm:block text-gray-400 group-hover:text-gray-500">Search…</span>
              <kbd className="hidden sm:flex text-[10px] font-bold text-gray-300 bg-gray-100 px-1.5 py-0.5 rounded-md ml-1">⌘K</kbd>
            </button>

            {/* Notifications */}
            <DropdownMenu open={notifOpen} onOpenChange={setNotifOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  className={`
                    relative h-9 w-9 rounded-xl flex items-center justify-center border
                    transition-all duration-200
                    ${notifOpen
                      ? 'border-[#00a63e]/50 bg-[#f0fdf4] text-[#00a63e] shadow-sm'
                      : 'border-gray-200 bg-gray-50 text-gray-400 hover:bg-white hover:border-[#00a63e]/40 hover:text-[#00a63e] hover:shadow-sm'
                    }
                  `}
                >
                  <Bell
                    className="w-4 h-4 transition-transform duration-200"
                    style={{ transform: notifOpen ? 'scale(1.15)' : 'scale(1)' }}
                  />
                  {unreadCount > 0 && (
                    <span className="
                      absolute -top-1 -right-1 w-4 h-4
                      bg-red-500 text-white text-[9px] font-black
                      rounded-full flex items-center justify-center
                    ">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="w-80 rounded-2xl shadow-xl border-gray-100 p-0 overflow-hidden"
              >
                {/* Notif Header */}
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm text-gray-900">Notifications</p>
                    <p className="text-[11px] text-gray-400">{unreadCount} unread</p>
                  </div>
                  <button className="text-[11px] font-bold text-[#00a63e] hover:text-green-700 transition-colors">
                    Mark all read
                  </button>
                </div>

                {/* Notif List */}
                <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
                  {notifications.map(n => (
                    <div
                      key={n.id}
                      className={`
                        flex items-start gap-3 px-4 py-3 cursor-pointer
                        hover:bg-gray-50 transition-colors duration-150
                        ${n.unread ? 'bg-green-50/40' : ''}
                      `}
                    >
                      <span className="text-lg flex-shrink-0 mt-0.5">{n.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs leading-tight ${n.unread ? 'font-bold text-gray-900' : 'font-semibold text-gray-600'}`}>
                          {n.title}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5 truncate">{n.sub}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                        <span className="text-[10px] text-gray-400">{n.time}</span>
                        {n.unread && <span className="w-2 h-2 rounded-full bg-[#00a63e]" />}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Notif Footer */}
                <div className="px-4 py-2.5 border-t border-gray-100">
                  <button className="w-full text-xs font-bold text-[#00a63e] hover:text-green-700 transition-colors">
                    View all notifications →
                  </button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Help */}
            <button className="
              h-9 w-9 rounded-xl flex items-center justify-center border
              border-gray-200 bg-gray-50 text-gray-400
              hover:bg-white hover:border-[#00a63e]/40 hover:text-[#00a63e] hover:shadow-sm
              transition-all duration-200
            ">
              <HelpCircle className="w-4 h-4 transition-transform duration-200 hover:scale-110" />
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-gray-200 mx-0.5" />

            {/* Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="
                  group flex items-center gap-2.5 h-9 pl-1.5 pr-3 rounded-xl
                  border border-gray-200 bg-gray-50
                  hover:bg-white hover:border-[#00a63e]/40 hover:shadow-sm
                  transition-all duration-200 outline-none
                ">
                  {/* Avatar */}
                  <div className="
                    w-6 h-6 rounded-lg overflow-hidden flex-shrink-0
                    ring-2 ring-transparent group-hover:ring-[#00a63e]/30
                    transition-all duration-200
                  ">
                    <img
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.first_name ?? 'Admin')}&background=00a63e&color=fff&bold=true&size=64`}
                      className="w-full h-full object-cover"
                      alt={profile?.first_name ?? 'Admin'}
                    />
                  </div>

                  <span className="
                    hidden md:block text-sm font-semibold text-gray-700
                    group-hover:text-gray-900 transition-colors max-w-[120px] truncate
                  ">
                          {`${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() || "Admin User"}

                  </span>

                  <ChevronDown className="
                    w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600
                    transition-all duration-200 group-data-[state=open]:rotate-180
                  " />
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="w-56 rounded-2xl shadow-xl border-gray-100 p-1.5 overflow-hidden"
              >
                {/* User Info Card */}
                <div className="px-3 py-3 mb-1">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#00a63e] flex items-center justify-center text-white text-sm font-black flex-shrink-0 shadow-sm">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{`${profile?.first_name || ""} ${profile?.last_name || ""}`.trim() || "Admin User"}</p>
                      <p className="text-[11px] text-gray-400 truncate">{profile?.email ?? 'admin@locksee.app'}</p>
                    </div>
                  </div>
                  <div className="mt-2.5 flex items-center gap-1.5 bg-green-50 rounded-xl px-2.5 py-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="text-[11px] capitalize font-bold text-green-700">{profile?.user_type}</span>
                    <Shield className="w-3 h-3 text-green-500 ml-auto" />
                  </div>
                </div>

                <DropdownMenuSeparator className="bg-gray-100 my-1" />

                {/* Profile */}
                <DropdownMenuItem className="
                  rounded-xl gap-2.5 px-3 py-2.5 cursor-pointer
                  text-gray-600 hover:text-gray-900 hover:bg-gray-50
                  transition-colors duration-150 focus:bg-gray-50
                ">
                  <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <User className="h-3.5 w-3.5 text-gray-500" />
                  </div>
                  <Link to="/settings/profile" className="flex-1">
                    <p className="font-semibold text-xs">My Profile</p>
                    <p className="text-[10px] text-gray-400">View & edit profile</p>
                  </Link>
                </DropdownMenuItem>

                {/* Settings */}
                <DropdownMenuItem className="
                  rounded-xl gap-2.5 px-3 py-2.5 cursor-pointer
                  text-gray-600 hover:text-gray-900 hover:bg-gray-50
                  transition-colors duration-150 focus:bg-gray-50
                ">
                  <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Settings className="h-3.5 w-3.5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-xs">Settings</p>
                    <p className="text-[10px] text-gray-400">Preferences & security</p>
                  </div>
                </DropdownMenuItem>

                {/* Dark Mode */}
                <DropdownMenuItem className="
                  rounded-xl gap-2.5 px-3 py-2.5 cursor-pointer
                  text-gray-600 hover:text-gray-900 hover:bg-gray-50
                  transition-colors duration-150 focus:bg-gray-50
                ">
                  <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Moon className="h-3.5 w-3.5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-xs">Dark Mode</p>
                    <p className="text-[10px] text-gray-400">Toggle theme</p>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-gray-100 my-1" />

                {/* Logout */}
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="
                    rounded-xl gap-2.5 px-3 py-2.5 cursor-pointer
                    text-red-500 hover:text-red-600 hover:bg-red-50
                    transition-colors duration-150 focus:bg-red-50 focus:text-red-600
                  "
                >
                  <div className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center flex-shrink-0">
                    <LogOut className="h-3.5 w-3.5 text-red-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-xs">Log Out</p>
                    <p className="text-[10px] text-red-400">End your session</p>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
    </>
  );
}