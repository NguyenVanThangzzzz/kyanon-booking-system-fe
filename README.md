# Kyanon Booking System — Frontend

Enterprise-grade React frontend for the Kyanon room reservation management system.

## Tech Stack

| Category     | Tool                                                         |
| ------------ | ------------------------------------------------------------ |
| Build        | Vite 6                                                       |
| Language     | TypeScript 5 (strict mode)                                   |
| Framework    | React 18                                                     |
| Routing      | React Router v6 (lazy loading + protected routes)            |
| State        | Context API + custom hooks                                   |
| HTTP Client  | Axios (interceptors for auth, token refresh, error handling) |
| Styling      | TailwindCSS (custom component system, no UI library)         |
| Forms        | React Hook Form + Zod                                        |
| i18n         | react-i18next (EN + VI)                                      |
| Testing      | Vitest + React Testing Library                               |
| Code Quality | ESLint + Prettier + Husky + lint-staged + Commitlint         |

## Getting Started

### Prerequisites

- Node.js 20+
- Backend API running (see `kyanon-booking-system-be`)

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.development
# Edit VITE_API_BASE_URL to point to your backend

# 3. Start development server
npm run dev
```

App will be available at `http://localhost:3000`.

## Scripts

```bash
npm run dev            # Start dev server with HMR (port 3000)
npm run build          # Type-check + production build
npm run preview        # Preview production build locally
npm run type-check     # TypeScript check without emit
npm run lint           # ESLint check
npm run lint:fix       # Auto-fix ESLint issues
npm run format         # Prettier format src/
npm run format:check   # Check formatting (CI)
npm test               # Run tests once
npm run test:watch     # Watch mode
npm run test:coverage  # Coverage report (v8)
```

## Project Structure

```
src/
├── app/
│   ├── App.tsx                  # Root component (ErrorBoundary → AppProvider → Router)
│   ├── AppProvider.tsx          # Composes all context providers
│   └── router/
│       ├── index.tsx            # Route definitions with lazy loading
│       ├── ProtectedRoute.tsx   # Redirects unauthenticated users to /login
│       └── PublicRoute.tsx      # Redirects authenticated users to /dashboard
├── common/
│   ├── components/
│   │   ├── error-boundary/      # ErrorBoundary (class), NotFoundPage, ForbiddenPage
│   │   ├── layout/              # MainLayout (nav + outlet), AuthLayout (centered card)
│   │   └── ui/                  # Button, Input, Modal, Spinner — custom Tailwind components
│   ├── hooks/
│   │   ├── useDebounce.ts       # Debounce value with configurable delay
│   │   └── usePagination.ts     # Page/limit state with helpers
│   └── utils/
│       ├── cn.ts                # Tailwind class merger utility
│       └── format.ts            # formatCurrency, formatDate, formatDateTime, truncate
├── config/
│   └── env.ts                   # Type-safe environment variable access
├── contexts/
│   └── auth/
│       ├── AuthContext.tsx       # AuthProvider + reducer (LOGIN_SUCCESS, LOGOUT, INIT)
│       └── useAuth.ts           # Hook to consume AuthContext
├── features/
│   ├── auth/                    # Login, Register (forms, hooks, service, pages)
│   ├── booking/                 # Booking list, detail, cancel (hooks, service, pages)
│   ├── dashboard/               # Stats overview (hook, service, page)
│   └── room/                    # Room list, detail (hooks, service, pages)
├── i18n/
│   ├── index.ts                 # i18next config (LanguageDetector + ReactI18next)
│   └── locales/
│       ├── en/                  # common.json, auth.json
│       └── vi/                  # common.json, auth.json
├── lib/
│   └── axios/
│       ├── axios.instance.ts    # Axios instance with base URL and timeout
│       └── interceptors.ts      # Auth header injection + 401 refresh token flow
├── styles/
│   └── index.css                # Tailwind directives + base/component layers
├── test/
│   └── setup.ts                 # Vitest + Testing Library global setup
├── types/
│   ├── api.types.ts             # ApiResponse<T>, ApiPaginatedResponse<T>, ApiError
│   └── global.d.ts              # Window type augmentations
└── main.tsx                     # React 18 createRoot entry point
```

## Architecture Decisions

### Feature-Based Modules

Each feature under `src/features/<name>/` is fully self-contained:

```
features/auth/
  types/        # TypeScript interfaces for this domain
  services/     # Axios calls — returns typed data, no UI concerns
  hooks/        # Custom hooks wrapping services + local state
  components/   # Feature-specific React components
  pages/        # Route-level components (thin — compose hooks + components)
```

### Auth Flow

1. On app load, `AuthProvider` reads `access_token` + `auth_user` from `localStorage`.
2. Every Axios request attaches `Authorization: Bearer <token>` via request interceptor.
3. On 401 response: interceptor pauses the request queue, calls `/auth/refresh`, retries all queued requests with the new token.
4. On refresh failure: tokens are cleared, `auth:logout` event fires, `AuthProvider` dispatches `LOGOUT`.
5. `ProtectedRoute` reads `isAuthenticated` from `AuthContext` — redirects to `/login` if false.

### Axios Interceptor — Token Queue

When multiple requests 401 simultaneously and a refresh is in progress, all subsequent failures are queued and replayed once the single refresh resolves. This prevents multiple simultaneous refresh calls.

### Path Aliases

`@/` maps to `src/` — configured in both `tsconfig.app.json` and `vite.config.ts`. Never use `../../` across feature or layer boundaries.

## Environment Variables

| Variable            | Required | Default                 | Purpose                   |
| ------------------- | -------- | ----------------------- | ------------------------- |
| `VITE_API_BASE_URL` | Yes      | —                       | Backend API base URL      |
| `VITE_API_TIMEOUT`  | No       | `10000`                 | Request timeout (ms)      |
| `VITE_APP_NAME`     | No       | `Kyanon Booking System` | App display name          |
| `VITE_APP_VERSION`  | No       | `0.1.0`                 | App version               |
| `VITE_ENABLE_MOCK`  | No       | `false`                 | Enable mock API responses |

All variables must be prefixed with `VITE_` to be exposed to the browser. They are validated in `src/config/env.ts` — missing required variables throw at startup.

## Code Conventions

### Naming

| Thing      | Convention                 | Example                                                      |
| ---------- | -------------------------- | ------------------------------------------------------------ |
| Components | `PascalCase`               | `LoginForm`, `BookingCard`                                   |
| Hooks      | `camelCase` prefixed `use` | `useLogin`, `useRooms`                                       |
| Services   | `camelCase` object         | `authService.login()`                                        |
| Files      | `kebab-case`               | `login-form.tsx` → exception: keep PascalCase for components |
| Constants  | `SCREAMING_SNAKE_CASE`     | — (in `config/env.ts`)                                       |

### Commit Messages

Enforced by Commitlint:

```
feat(auth): add password reset flow
fix(router): redirect to dashboard after register
chore: upgrade vite to v6
```

Valid types: `feat` `fix` `refactor` `test` `docs` `chore` `perf` `style` `ci` `revert`

### Adding a New Feature

1. Create `src/features/<name>/` with `types/`, `services/`, `hooks/`, `components/`, `pages/`.
2. Add route(s) to `src/app/router/index.tsx` using `lazy()`.
3. Wrap lazy-loaded pages in `<Suspense fallback={<PageLoader />}>`.
4. If the route requires auth, nest inside the `<ProtectedRoute />` element.
5. Add nav link to `MainLayout.tsx` if it appears in the top bar.

## CI/CD

GitHub Actions runs on push to `main`/`develop` and all PRs:

```
type-check → lint → format:check → test:coverage → build
```

Build artifacts are uploaded for 7 days. All steps must pass before merge.

## Testing

```bash
# Run all tests
npm test

# Run a single file
npx vitest run src/common/components/ui/Button/Button.test.tsx

# Watch mode (re-runs on save)
npm run test:watch

# Coverage HTML report → open coverage/index.html
npm run test:coverage
```

Tests use `jsdom` environment. Global setup in `src/test/setup.ts` imports `@testing-library/jest-dom` matchers.
