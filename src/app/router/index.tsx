import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleBasedRoute } from './RoleBasedRoute';
import { PublicRoute } from './PublicRoute';
import { DashboardLayout } from '@/common/components/layout/DashboardLayout';
import { AuthLayout } from '@/common/components/layout/AuthLayout';
import { PublicLayout } from '@/common/components/layout/PublicLayout';
import { LoadingScreen } from '@/common/components/ui/LoadingScreen';

// Public pages
const HomePage = lazy(() =>
  import('@/features/home/pages/HomePage').then((m) => ({ default: m.HomePage })),
);
const RoomListPage = lazy(() =>
  import('@/features/room/pages/RoomListPage').then((m) => ({ default: m.RoomListPage })),
);
const RoomDetailPage = lazy(() =>
  import('@/features/room/pages/RoomDetailPage').then((m) => ({ default: m.RoomDetailPage })),
);

// Auth pages
const LoginPage = lazy(() =>
  import('@/features/auth/pages/LoginPage').then((m) => ({ default: m.LoginPage })),
);
const RegisterPage = lazy(() =>
  import('@/features/auth/pages/RegisterPage').then((m) => ({ default: m.RegisterPage })),
);

// Protected public-layout pages (customer + any role)
const BookingListPage = lazy(() =>
  import('@/features/booking/pages/BookingListPage').then((m) => ({ default: m.BookingListPage })),
);
const BookingDetailPage = lazy(() =>
  import('@/features/booking/pages/BookingDetailPage').then((m) => ({
    default: m.BookingDetailPage,
  })),
);
const BookingNewPage = lazy(() =>
  import('@/features/booking/pages/BookingNewPage').then((m) => ({
    default: m.BookingNewPage,
  })),
);
const PaymentPage = lazy(() =>
  import('@/features/payment/pages/PaymentPage').then((m) => ({
    default: m.PaymentPage,
  })),
);
const ProfilePage = lazy(() =>
  import('@/features/profile/pages/ProfilePage').then((m) => ({
    default: m.ProfilePage,
  })),
);

// Dashboard pages (admin + staff only)
const DashboardPage = lazy(() =>
  import('@/features/dashboard/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const DashboardBookingsPage = lazy(() =>
  import('@/features/dashboard/pages/DashboardBookingsPage').then((m) => ({
    default: m.DashboardBookingsPage,
  })),
);
const DashboardRoomsPage = lazy(() =>
  import('@/features/dashboard/pages/DashboardRoomsPage').then((m) => ({
    default: m.DashboardRoomsPage,
  })),
);
const DashboardRoomTypesPage = lazy(() =>
  import('@/features/dashboard/pages/DashboardRoomTypesPage').then((m) => ({
    default: m.DashboardRoomTypesPage,
  })),
);
const DashboardCustomersPage = lazy(() =>
  import('@/features/dashboard/pages/DashboardCustomersPage').then((m) => ({
    default: m.DashboardCustomersPage,
  })),
);
const DashboardStaffPage = lazy(() =>
  import('@/features/dashboard/pages/DashboardStaffPage').then((m) => ({
    default: m.DashboardStaffPage,
  })),
);
const DashboardReportsPage = lazy(() =>
  import('@/features/dashboard/pages/DashboardReportsPage').then((m) => ({
    default: m.DashboardReportsPage,
  })),
);
const DashboardSettingsPage = lazy(() =>
  import('@/features/dashboard/pages/DashboardSettingsPage').then((m) => ({
    default: m.DashboardSettingsPage,
  })),
);
const DashboardProfilePage = lazy(() =>
  import('@/features/dashboard/pages/DashboardProfilePage').then((m) => ({
    default: m.DashboardProfilePage,
  })),
);
const DashboardSchedulePage = lazy(() =>
  import('@/features/schedule/pages/DashboardSchedulePage').then((m) => ({
    default: m.DashboardSchedulePage,
  })),
);
const DashboardBlockedSlotsPage = lazy(() =>
  import('@/features/blocked-slot/pages/DashboardBlockedSlotsPage').then((m) => ({
    default: m.DashboardBlockedSlotsPage,
  })),
);
const DashboardLateCheckoutsPage = lazy(() =>
  import('@/features/late-checkout/pages/DashboardLateCheckoutsPage').then((m) => ({
    default: m.DashboardLateCheckoutsPage,
  })),
);
const DevBookingPage = lazy(() =>
  import('@/features/late-checkout/pages/DevBookingPage').then((m) => ({
    default: m.DevBookingPage,
  })),
);

// Error pages
const NotFoundPage = lazy(() =>
  import('@/common/components/error-boundary/NotFoundPage').then((m) => ({
    default: m.NotFoundPage,
  })),
);
const ForbiddenPage = lazy(() =>
  import('@/common/components/error-boundary/ForbiddenPage').then((m) => ({
    default: m.ForbiddenPage,
  })),
);

const PageLoader = () => <LoadingScreen />;

const wrap = (el: React.ReactElement) => <Suspense fallback={<PageLoader />}>{el}</Suspense>;

const router = createBrowserRouter([
  // ── Public pages — navbar + footer (no auth required) ──
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: wrap(<HomePage />) },
      { path: '/rooms', element: wrap(<RoomListPage />) },
      { path: '/rooms/:id', element: wrap(<RoomDetailPage />) },
    ],
  },

  // ── Auth pages — redirect away if already logged in ──
  {
    element: <PublicRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: '/login', element: wrap(<LoginPage />) },
          { path: '/register', element: wrap(<RegisterPage />) },
        ],
      },
    ],
  },

  // ── Customer protected pages — any authenticated role, public layout ──
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <PublicLayout />,
        children: [
          { path: '/bookings', element: wrap(<BookingListPage />) },
          { path: '/bookings/new', element: wrap(<BookingNewPage />) },
          { path: '/bookings/:id', element: wrap(<BookingDetailPage />) },
          { path: '/bookings/:id/payment', element: wrap(<PaymentPage />) },
          { path: '/profile', element: wrap(<ProfilePage />) },
          { path: '/dev/bookings/:id', element: wrap(<DevBookingPage />) },
          { path: '/dev/bookings', element: wrap(<DevBookingPage />) },
        ],
      },
    ],
  },

  // ── Dashboard — admin + staff only ──
  {
    element: <RoleBasedRoute allowedRoles={['ADMIN', 'STAFF']} />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          // Overview — admin + staff
          { path: '/dashboard', element: wrap(<DashboardPage />) },
          // Shared — admin + staff
          { path: '/dashboard/bookings', element: wrap(<DashboardBookingsPage />) },
          { path: '/dashboard/late-checkouts', element: wrap(<DashboardLateCheckoutsPage />) },
          { path: '/dashboard/rooms', element: wrap(<DashboardRoomsPage />) },
          { path: '/dashboard/blocked-slots', element: wrap(<DashboardBlockedSlotsPage />) },
          { path: '/dashboard/customers', element: wrap(<DashboardCustomersPage />) },
          { path: '/dashboard/profile', element: wrap(<DashboardProfilePage />) },

          // Admin-only sub-routes (nested RoleBasedRoute)
          {
            element: <RoleBasedRoute allowedRoles={['ADMIN']} />,
            children: [
              { path: '/dashboard/room-types', element: wrap(<DashboardRoomTypesPage />) },
              { path: '/dashboard/schedules', element: wrap(<DashboardSchedulePage />) },
              { path: '/dashboard/staff', element: wrap(<DashboardStaffPage />) },
              { path: '/dashboard/reports', element: wrap(<DashboardReportsPage />) },
              { path: '/dashboard/settings', element: wrap(<DashboardSettingsPage />) },
            ],
          },
        ],
      },
    ],
  },

  // ── Error pages ──
  { path: '/403', element: wrap(<ForbiddenPage />) },
  { path: '*', element: wrap(<NotFoundPage />) },
]);

export const AppRouter = () => <RouterProvider router={router} />;
