# 🔒 Locksee — Chat App Admin Panel

> A production-grade admin dashboard for managing the **Locksee** real-time chat application. Built with **React + TypeScript + Tailwind CSS + shadcn/ui**.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Modules](#modules)
- [Getting Started](#getting-started)
- [Authentication](#authentication)
- [Environment Variables](#environment-variables)
- [API Integration](#api-integration)
- [Design System](#design-system)
- [Dummy Credentials](#dummy-credentials)

---

## 🌐 Overview

Locksee Admin Panel is a comprehensive internal tool for the Locksee chat platform, supporting:

- **74,000+** registered app users across Pakistan, India, UAE, UK, and USA
- **Multi-region support** — INR, AED, USD currencies
- **Real-time moderation** — reports, CSAM detection, auto-mod rules
- **Finance management** — subscriptions, revenue, promo codes
- **Team management** — internal admin roles & permissions

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Routing | React Router DOM v6 |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Forms | Formik + Yup |
| Charts | Recharts |
| Icons | Lucide React |
| HTTP Client | Axios |
| Auth | JWT (localStorage) |
| Build Tool | Vite |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/                    # shadcn/ui base components
│   ├── layout/
│   │   ├── Sidebar.tsx        # Collapsible sidebar navigation
│   │   └── ProtectedRoute.tsx # Route guard
│   └── shared/
│       ├── StatusBadge.tsx
│       ├── PriorityBadge.tsx
│       └── Toast.tsx
│
├── pages/
│   ├── auth/
│   │   └── Authlogin.tsx      # Login page with JWT
│   ├── dashboard/
│   │   └── Dashboard.tsx
│   ├── users/
│   │   ├── UserManagement.tsx # Admin team users
│   │   └── AppUserManagement.tsx # App customers
│   ├── media/
│   │   ├── MediaManagement.tsx # Storage stats
│   │   └── MediaBrowser.tsx    # Browse all sent files
│   ├── moderation/
│   │   └── ModerationCenter.tsx
│   ├── finance/
│   │   └── Finance.tsx
│   └── errors/
│       └── NotFound.tsx       # 404 page
│
├── context/
│   └── auth.tsx               # Auth context provider
│
├── services/
│   ├── axios.ts               # Axios instance + interceptors
│   └── api-end-point.ts       # All API URLs
│
├── utils/
│   └── utils.ts               # Helpers (notify, formatters)
│
├── App.tsx                    # Routes configuration
└── main.tsx
```

---

## 📦 Modules

### ✅ Completed

#### 🔐 Authentication
- Login with email + password
- Dummy credentials auto-fill (demo mode)
- JWT token generation & localStorage persistence
- Auth context with `login()` / `logout()`
- Protected routes

#### 📊 Dashboard
- Platform stats overview
- Active users, messages, revenue charts
- Recent activity feed

#### 👨‍💼 Admin Team Management (`/users`)
- Create / Edit / Delete admin accounts
- **7 Roles:** Super Admin, Admin, Developer, Finance, Marketing, Moderator, Support
- Per-user module permissions (17 modules)
- Password strength indicator
- 2FA toggle per user
- Ban / Unban with confirmation
- Export team list as CSV

#### 📱 App Users Management (`/app-users`)
- Browse all 74K+ app customers
- **5 filters:** Search, Status, Plan, Platform, Country
- User profile detail with 3 tabs:
  - **Overview** — activity stats, weekly chart, moderation history
  - **Device** — model, OS, app version, RAM, IP, FCM token
  - **Activity** — timeline, usage breakdown bars
- Ban dialog with reason + duration
- Send warning with custom message
- Delete account permanently
- Export CSV

#### 🖼️ Media Browser (`/media/browser`)
- Browse ALL files users have sent (images, videos, voice, docs, links)
- **Grid view** and **List view** toggle
- **5 filters** — type, status, chat type, search
- Click any file → full preview modal with:
  - Sender + receiver info
  - Device, country, sent time
  - AI safety score
  - Flag / Remove / Download actions
- Bulk select + remove
- AI flagged content highlighted

#### 🗂️ Media Management (`/media`)
- Storage growth chart (S3 vs CDN)
- Media type breakdown pie chart
- Daily upload volume bar chart
- CSAM / flagged media moderation table
- CDN edge nodes (latency + cache hit rate)
- Top storage users
- Auto cleanup rules
- Upload limits config per file type

#### 🚨 Moderation Center (`/moderation`)
**Tab 1 — Overview**
- 6 KPI cards
- Weekly reports bar chart (filed vs resolved)
- Category breakdown
- Critical pending list

**Tab 2 — Reports Queue**
- Full report cards with priority color strips
- AI confidence score badges
- Accused user history (prev reports + bans)
- Report detail view with:
  - Dark-theme chat context (reported message highlighted in red)
  - Accused vs Reporter side-by-side cards
  - Take Action dialog (7 actions: Dismiss / Warn / Ban 24h-7d-30d-Permanent / Remove Content)
  - Moderator notes

**Tab 3 — Auto-Mod Rules**
- 8 rules (Phishing URL, Spam, AI Image Scan, Threat Keywords, Banned Words, Mass Message, Suspicious Login, CSAM Hash)
- Toggle on/off per rule
- Severity: BLOCK / WARN / FLAG
- Hit count + last triggered

**Tab 4 — IP Block**
- Block IP with reason
- Permanent vs Temporary
- Hit counter
- Unblock button

**Tab 5 — Banned Words**
- Add word/phrase + category
- Category color coding
- Hit count per word
- Delete on hover

#### 💰 Finance (`/finance`)
- Revenue overview (MRR, ARR, subscriptions)
- Transaction history with status filters
- Subscription plan management
- Promo code management (create, pause, expire)
- Tax by country table
- Export reports (Revenue, Tax, Subscriptions, Refunds)

#### ⚙️ App Settings
- Feature flags
- App version management
- Maintenance mode

#### 🗂️ Sidebar Navigation
- 12 sections, 33+ routes
- Collapsible (260px → 68px icon mode)
- Orange (#F39700) brand color
- Section labels, icon boxes, notification badges
- Search with ⌘K shortcut
- User profile with logout

#### 🚫 404 Page
- Orange gradient `404` text
- Floating "Page not found" badge
- Go Back + Dashboard buttons
- Attempted URL display
- Quick links grid (4 cards)

---

### 🔜 Planned Modules

| Module | Priority |
|---|---|
| 💬 Chat & Message Monitor | 🔴 Critical |
| 👥 Group Management | 🔴 Critical |
| 🔔 Push Notifications | 🔴 Critical |
| 📣 Broadcast & Channels | 🟡 Important |
| 📊 Analytics (DAU/MAU, Retention) | 🟡 Important |
| 🎟️ Support / Tickets | 🟡 Important |
| 📜 Audit Logs | 🟡 Important |
| 🔒 Security Center | 🟡 Important |
| 📖 Story / Status Management | 🔵 Nice to Have |
| 🤖 Bot & Spam Detection | 🔵 Nice to Have |
| 🎨 Sticker Pack Management | 🔵 Nice to Have |
| 🧹 GDPR / Privacy Center | 🔵 Nice to Have |
| 🖥️ Infrastructure Monitor | 🔵 Nice to Have |

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/locksee-admin.git
cd locksee-admin

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will run at `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

---

## 🔐 Authentication

The panel supports two authentication modes:

### Dummy Mode (Development)
No backend needed. Login with demo credentials and a JWT is generated client-side.

### Real API Mode
Connect to your Laravel backend by setting `VITE_API_BASE_URL`. The login flow expects:

```json
{
  "token": "eyJhbGc...",
  "user": {
    "id": 1,
    "full_name": "Admin Name",
    "email": "admin@locksee.app",
    "role": "super_admin"
  }
}
```

Token and user are stored in `localStorage`:
```
locksee_token  →  JWT string
locksee_user   →  JSON stringified user object
```

---

## 🔑 Dummy Credentials

| Role | Email | Password |
|---|---|---|
| Super Admin | `admin@locksee.app` | `admin@123` |
| Developer | `dev@locksee.app` | `dev@123` |

> These credentials work in demo/offline mode and generate a valid-looking JWT locally.

---

## 🌍 Environment Variables

Create a `.env` file in the root:

```env
# API Base URL
VITE_API_BASE_URL=https://api.locksee.app/api/v1

# App Info
VITE_APP_NAME=Locksee Admin
VITE_APP_VERSION=2.4.1

# Feature Flags
VITE_ENABLE_DUMMY_AUTH=true
VITE_ENABLE_ANALYTICS=true
```

---

## 🔌 API Integration

Base Axios instance is in `src/services/axios.ts`:

```typescript
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

// Attach JWT to every request
instance.interceptors.request.use(config => {
  const token = localStorage.getItem('locksee_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto logout on 401
instance.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);
```

All API endpoints are defined in `src/services/api-end-point.ts`:

```typescript
export const apiUrl = {
  login:        '/auth/login',
  logout:       '/auth/logout',
  users:        '/admin/users',
  appUsers:     '/admin/app-users',
  reports:      '/admin/moderation/reports',
  media:        '/admin/media',
  finance:      '/admin/finance',
  // ...
};
```

---

## 🎨 Design System

### Brand Colors

```css
--orange-primary:  #F39700   /* Primary brand, buttons, accents */
--orange-hover:    #e08500   /* Hover state */
--orange-light:    #FFF3E0   /* Backgrounds, badges */
--dark-bg:         #1A1A1A   /* Dark panels */
--dark-accent:     #2D1E00   /* Dark gradient end */
```

### Typography
- **UI Font:** Inter (system-ui fallback)
- **Code/IDs:** font-mono

### Component Conventions

| Element | Style |
|---|---|
| Cards | `rounded-2xl border border-gray-100 shadow-sm` |
| Buttons | `rounded-xl` |
| Inputs | `rounded-xl h-10` |
| Dialogs | `rounded-2xl max-w-*` |
| Badges | `text-[10px] font-bold px-2.5 py-1 rounded-full` |
| Avatars | `rounded-xl` with color derived from name hash |

### Status Colors

| Status | Background | Text |
|---|---|---|
| Active / Safe | `bg-green-100` | `text-green-700` |
| Pending | `bg-yellow-100` | `text-yellow-700` |
| Banned / Removed | `bg-red-100` | `text-red-600` |
| Inactive / Dismissed | `bg-gray-100` | `text-gray-500` |
| Reviewing | `bg-blue-100` | `text-blue-700` |

---

## 📱 Supported Platforms (App Users)

| Platform | Share |
|---|---|
| 🤖 Android | 65% |
| 🍎 iOS | 31% |
| 🌐 Web | 4% |

### Supported Regions

| Country | Currency | Tax |
|---|---|---|
| SAR Saudia Arabia | SAR | 0% |
| 🇮🇳 India | INR | 18% GST |
| 🇦🇪 UAE | AED | 5% VAT |
| 🇬🇧 UK | GBP | 20% VAT |
| 🇺🇸 USA | USD | Varies |

---

## 👥 Admin Roles & Permissions

| Role | Description | Key Access |
|---|---|---|
| Super Admin | Full access | Everything |
| Admin | All except billing & roles | Most modules |
| Developer | Technical access | API, Logs, Settings |
| Finance Admin | Billing only | Finance, Analytics |
| Marketing Admin | Growth tools | Campaigns, Promos |
| Moderator | Content control | Reports, Bans |
| Support Agent | Read-only user data | Users, Support |

---

## 📝 License

Private & Proprietary — Locksee © 2025. All rights reserved.

---

## 🤝 Contributing

Internal project — contact the development team at `dev@locksee.app` for access.

---

*Built with ❤️ by the Locksee Engineering Team*