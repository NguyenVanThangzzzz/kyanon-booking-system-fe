# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> Design reference: Mixivivu.com — minimalist, modern, professional hotel booking UI.
> Stack: React 18 + TypeScript strict + Vite + TailwindCSS + React Router v6 + React Hook Form + Zod + Axios + react-i18next

---

## Rules & Skills

Detailed rules are split into focused files under `.claude/rules/` — Claude Code loads them automatically based on context:

| File | Topic | When loaded |
|---|---|---|
| `01-commands.md` | npm scripts, test commands | always |
| `02-environment.md` | env vars, `.env` setup | always |
| `03-architecture.md` | routing, auth, API, toast | always |
| `04-design-system.md` | colors, typography, spacing, shadows | `*.tsx`, `*.css` |
| `05-component-patterns.md` | buttons, cards, sections, skeletons | `*.tsx`, components/ |
| `06-code-conventions.md` | TS rules, hooks, forms, styling, errors | `*.ts`, `*.tsx` |
| `07-i18n.md` | translations, currency, dates | `*.ts`, `*.tsx`, locales/ |
| `08-performance.md` | lazy loading, images, debounce, pagination | `*.ts`, `*.tsx` |
| `09-git-workflow.md` | commit convention | always |

Custom slash commands (skills) are in `.claude/commands/`:

| Command | Purpose |
|---|---|
| `/new-component <Name>` | Scaffold a shared UI component with index barrel |
| `/new-feature <name>` | Scaffold a full feature module (types + service + hook + page) |
| `/new-page <Name> <path> <layout>` | Create a page and wire it into the router |
| `/new-hook <hookName>` | Create a custom hook (data-fetching, state, or utility) |
| `/new-service <resource>` | Create an API service with correct envelope unwrapping |

---

## Commands

```bash
npm run dev            # Dev server on http://localhost:3000
npm run build          # tsc -b && vite build
npm run type-check     # TypeScript strict check
npm run lint           # ESLint
npm run lint:fix       # Auto-fix
npm run format         # Prettier write
npm run format:check   # Prettier check (CI)
npm test               # Vitest run
npm run test:watch     # Vitest watch
npm run test:coverage  # Coverage (v8)
```

Single test file: `npx vitest run src/common/components/ui/Button/Button.test.tsx`

**Pre-commit**: Husky runs `lint-staged` automatically — ESLint + Prettier execute on staged `*.ts`/`*.tsx` files, Prettier on `*.json`/`*.css`. Never bypass with `--no-verify`.

---

## Environment Setup

Copy `.env.example` to `.env` before running. `VITE_API_BASE_URL` is required and has no default — the app will throw on startup if missing.

```
VITE_API_BASE_URL=http://localhost:3000   # backend base URL (no trailing slash)
VITE_API_TIMEOUT=10000
VITE_APP_NAME=Kyanon Booking System
VITE_APP_VERSION=0.1.0
VITE_ENABLE_MOCK=false                    # set true to skip real API calls
```

All env vars are accessed through `src/config/env.ts` — never read `import.meta.env` directly.

---

## Architecture

### Routing & Layouts

Three layouts handle different user states — adding a route means picking the right layout parent:

| Layout | Paths | Guard | Description |
|---|---|---|---|
| `PublicLayout` | `/`, `/rooms`, `/rooms/:id`, `/booking`, `/bookings/:id`, `/profile` | none / `ProtectedRoute` | Navbar + footer |
| `AuthLayout` | `/login`, `/register` | `PublicRoute` (redirects away if logged in) | Centered auth card |
| `DashboardLayout` | `/dashboard/*` | `RoleBasedRoute` | Collapsible sidebar; ADMIN + STAFF only |

**Dashboard routes and role requirements:**

| Path | ADMIN | STAFF |
|---|---|---|
| `/dashboard` | ✓ | ✓ |
| `/dashboard/bookings` | ✓ | ✓ |
| `/dashboard/rooms` | ✓ | ✓ |
| `/dashboard/blocked-slots` | ✓ | ✓ |
| `/dashboard/customers` | ✓ | ✓ |
| `/dashboard/profile` | ✓ | ✓ |
| `/dashboard/room-types` | ✓ | — |
| `/dashboard/schedules` | ✓ | — |
| `/dashboard/staff` | ✓ | — |
| `/dashboard/reports` | ✓ | — |
| `/dashboard/settings` | ✓ | — |

**Route guards:**
- `ProtectedRoute` — any authenticated user; redirects to `/login` if not authenticated
- `RoleBasedRoute allowedRoles={['ADMIN', 'STAFF']}` — wraps the entire `DashboardLayout`; unauthorized users go to `/403`
- A nested `RoleBasedRoute allowedRoles={['ADMIN']}` inside the dashboard restricts the ADMIN-only routes above

Login/Register on public pages open via **`AuthModal`** (portal rendered in `PublicLayout`), not by navigating to the auth pages. The standalone `/login` and `/register` routes still exist for direct links.

> **Note**: `/profile` currently maps to `BookingListPage` — it is a placeholder, not yet implemented.

### Auth System

Auth state lives in `AuthContext` (`src/contexts/auth/AuthContext.tsx`) and uses a `useReducer` pattern with four actions: `AUTH_INIT_START`, `AUTH_INIT_SUCCESS`, `LOGIN_SUCCESS`, `LOGOUT`.

**Storage keys** (all in `localStorage`):
- `access_token` / `refresh_token` — managed exclusively by `tokenStorage` in `src/lib/axios/interceptors.ts`
- `auth_user` — serialized `AuthUser` object, written by `AuthContext`

**Token refresh**: The Axios response interceptor (`src/lib/axios/interceptors.ts`) automatically retries 401 responses after refreshing via `POST /api/v1/auth/refresh`. Concurrent requests that 401 while a refresh is in flight are queued and replayed. If refresh fails, it dispatches a custom `auth:logout` DOM event, which `AuthContext` listens to in order to clear state.

**Logout**: Call `logout()` from `useAuth()`. It fires-and-forgets a revoke request to the backend, then clears tokens and user from localStorage synchronously.

Consume auth in components:
```ts
const { user, isAuthenticated, isLoading, login, logout } = useAuth();
```

For role checks, use `usePermission` instead of comparing `user.role` directly:
```ts
const { hasRole, isAdmin, isStaff, isCustomer } = usePermission();
if (hasRole(['ADMIN', 'STAFF'])) { /* ... */ }
```

### API Conventions

All requests go through `src/lib/axios/axios.instance.ts` (baseURL from env, auth header injected by interceptor).

Two standard response envelopes from `src/types/api.types.ts`:

```ts
ApiResponse<T>          // { success, data: T, timestamp }
ApiPaginatedResponse<T> // { success, data: { data: T[], pagination: {...} }, timestamp }
```

Services unwrap the envelope before returning to hooks:
- `getRoomById` → returns `Room` (unwrapped)
- `getRooms` → returns the full `ApiPaginatedResponse<Room>` (not unwrapped — hooks read `.data.data` and `.data.pagination`)

All API errors are normalized to `ApiError` shape `{ message, statusCode, errors? }` by the response interceptor — catch these in hooks, not in components.

### Toast System

Provided by `ToastProvider` (wraps the whole app via `AppProvider`). Consume in any component:

```ts
const { showToast } = useToast();
showToast('Message text', 'primary' | 'success' | 'error' | 'info' | 'warning', durationMs);
```

### Domain Features

| Feature | Location | Key exports |
|---|---|---|
| `room` | `src/features/room/` | `roomService`, `useRooms`, `useAvailableRooms`, `useAdminRooms`, `useAdminRoomTypes`, `useRoomTypes`, `useRoomMonthSlots` |
| `booking` | `src/features/booking/` | `bookingService`, `useBookings` |
| `schedule` | `src/features/schedule/` | `scheduleService`, `useRoomSchedules` — weekly open/close per room |
| `blocked-slot` | `src/features/blocked-slot/` | `blockedSlotService`, `useBlockedSlots` — date-range blocks per room |
| `auth` | `src/features/auth/` | `authService`, `useLogin`, `useRegister` |
| `dashboard` | `src/features/dashboard/` | `dashboardService`, `useDashboard` — overview stats |

**Room Slots API** (via `roomService`): Three slot endpoints give per-room availability:
- `getRoomSlotAvailability(id, date)` — single date status
- `getRoomSlotsRange(id, checkIn, checkOut)` — date range with `unavailable_dates[]`
- `getRoomSlotsMonth(id, year, month)` — full month calendar (`useRoomMonthSlots` hook)

`RoomSlotStatus` values: `available | blocked | booked | maintenance | closed | inactive | locked`

**Admin CRUD hooks** (`useAdminRooms`, `useAdminRoomTypes`): These combine data-fetching and mutation in one hook — they expose `createRoom`, `updateRoom`, `updateStatus`, `deleteRoom` alongside `rooms`, `isLoading`, `error`, and a `refetch()` callback that uses an internal `refreshKey` pattern to re-trigger the fetch effect.

**Blocked slots** (`BlockedSlotReason`): `maintenance | cleaning | event | other` — re-exported from `room.types.ts` via `blocked-slot.types.ts`. Use `REASON_LABELS_VI` and `REASON_BADGE` constants from that file for display.

**Schedules** (`Schedule`): weekly recurring open/close times per room (`availableOfWeek` is 0-indexed Sunday). Use `DAY_LABELS_VI` constant from `schedule.types.ts` for display.

### Custom Tailwind Utilities

`container-app` is defined as a custom CSS class (used in layouts for `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`). Custom animation classes in use: `animate-fade-in`, `animate-fade-out`, `animate-modal-in`, `animate-modal-out`, `animate-slide-up`, `animate-wiggle` — these are defined in `tailwind.config.js`.

---

## Design System

### Visual Language

Clean, image-forward, card-based aesthetic:
- Generous white space; photography carries visual weight
- Rounded corners everywhere; teal/cyan (`primary-500: #14b8a6`) as sole brand accent
- Soft shadows only — never `shadow-2xl` or colored shadows

### Color Palette

```
primary-500: #14b8a6  ← main brand (teal)
primary-600: #0d9488  ← hover
primary-700: #0f766e  ← active/pressed

neutral-50:  #fafaf9  ← page background
neutral-100: #f5f5f4  ← card backgrounds
neutral-200: #e7e5e4  ← borders/dividers
neutral-400: #a8a29e  ← placeholder text
neutral-500: #78716c  ← secondary text
neutral-700: #44403c  ← body text
neutral-900: #1c1917  ← headings / footer background

success: #16a34a  warning: #d97706  error: #dc2626  info: #2563eb
```

### Typography & Spacing

Font: **Inter** (Google Fonts, loaded in `index.html`).

Page max-width: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8` (or the `container-app` class).  
Section padding: `py-12 lg:py-16`. Card gap: `gap-4 lg:gap-6`.

### Border Radius

| Element | Radius |
|---|---|
| Buttons | `rounded-full` — always |
| Inputs | `rounded-xl` |
| Cards, modals, images inside cards | `rounded-2xl` |
| Badges, tags, avatars | `rounded-full` |

### Shadows & Transitions

```
card: shadow-sm → hover: shadow-md
modal: shadow-xl   dropdown: shadow-lg
```

All interactive elements: `transition-all duration-200 ease-in-out`.  
Image zoom on card hover: `group-hover:scale-105 transition-transform duration-300`.

---

## Component Patterns

### Buttons

```tsx
<Button variant="primary">Search</Button>   // filled teal pill — main CTAs
<Button variant="outline">View all</Button>  // teal border pill — secondary
<Button variant="ghost">Skip</Button>        // no background — nav/subtle
```

Sizes: `sm` | `md` (default) | `lg`. Always `rounded-full` — never `rounded-lg`.

### Cards

All cards: `group bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden`.  
Image container: `relative aspect-[4/3] overflow-hidden` with `object-cover group-hover:scale-105` on `<img>`.

### Section Header

Every section uses a two-column header: eyebrow label (`text-sm font-medium text-primary-600`), H2, subtitle on the left; "View all" outline button on the right.

### Skeleton Loading

Use `animate-pulse` skeleton screens (not spinners) for content areas. See `src/common/components/ui/Skeleton/Skeleton.tsx`.

---

## Code Conventions

### Path Aliases

Always use `@/` — never `../../`:

```ts
import { Button } from '@/common/components/ui/Button';
import { useAuth } from '@/contexts/auth/useAuth';
import { roomService } from '@/features/room/services/room.service';
```

### TypeScript

- `interface` for object shapes (extendable); `type` for unions / mapped types / aliases
- Explicit return types on all exported functions
- `as const` on all constant objects
- No implicit `any`, no `ts-ignore` without explanation

### Components

- Every component has a typed props interface; destructure immediately in signature
- No prop drilling beyond 2 levels — use context or callbacks
- `forwardRef` when wrapping a native input element
- Use `cn()` (from `@/common/utils/cn`) for conditional classes — never template literal conditionals

### Hooks

One responsibility per hook. Handle `isLoading` / `error` / `data` together. Cancel async effects with a `cancelled` flag on cleanup. Never call services directly in components — always via hooks.

### Forms

React Hook Form + Zod. Define schema → `z.infer<typeof schema>` → `zodResolver(schema)`. All validation messages in Vietnamese.

### Styling Rules

1. No inline styles — Tailwind classes only
2. Mobile-first (`base` = mobile, `md:` / `lg:` for larger)
3. `group` on parent, `group-hover:` on children for interactive image cards
4. Dark text on light bg, light text on dark bg — always check contrast

### Error Handling

- API errors arrive as `ApiError` `{ message, statusCode, errors? }` from the Axios interceptor
- Show Vietnamese user-facing messages; never surface raw API error strings
- Use `ErrorBoundary` at route level (`src/common/components/error-boundary/`)
- Empty states: illustration/message + CTA, never a blank area

---

## i18n

Default language: **Vietnamese (vi)**. Secondary: English (en).

Translation files: `src/i18n/locales/<lang>/<namespace>.json`.  
Currently implemented namespaces: `common`, `auth`. Add `room`, `booking`, `home` files when translating those features.

```ts
const { t } = useTranslation('room');
```

**Currency**: use `formatCurrency(amount, 'VND', 'vi-VN')` from `@/common/utils/format` to get `"500.000 ₫"`. The function defaults to USD — always pass the currency and locale explicitly for Vietnamese display.

**Dates**: `formatDate(isoString)` → `"15/06/2025"`. ISO 8601 for API, `dd/MM/yyyy` for display.

---

## Performance Rules

- All page-level components use `React.lazy()` + `<Suspense>` (already wired in `src/app/router/index.tsx`)
- `<img>` always needs `width`, `height`, `loading="lazy"`
- Debounce search input with `useDebounce(value, 400)` before API calls
- Paginate all lists — never load unbounded data

---

## Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| `rounded-full` on buttons | `rounded-md` on buttons |
| `rounded-2xl` on cards | Mix border radii randomly |
| `primary-500` (teal) as accent | Blue or purple as accent |
| `shadow-sm` → `shadow-md` on hover | `shadow-2xl` or colored shadows |
| `aspect-[4/3]` on room images | Let images stretch/squish |
| Skeleton screens while loading | Block layout with spinners |
| Vietnamese UI copy | English UI labels |
| `cn()` for conditional classes | Template literal conditionals |
| `@/` path aliases | `../../` cross-module imports |
| `formatCurrency(amount, 'VND', 'vi-VN')` | Hardcode currency strings or omit locale |
| Named exports | Default exports (except pages) |
| Services only called from hooks | Services called directly in components |

---

## Commit Convention

```
feat(room): add filter panel with price range and star rating
fix(booking): correct total price calculation for multi-night stays
style(home): adjust hero section spacing on mobile
chore: add @hookform/resolvers dependency
```

Types: `feat` `fix` `refactor` `test` `docs` `chore` `perf` `style` `ci` `revert`
