import { Navigate, RouteObject } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Outlet } from "react-router-dom";

// Auth Guards
import { AuthGuard, GuestGuard } from "./guards";
import { useAuth } from "@/core/presentation/hooks/useAuth";

// Import the new DashboardLayout
import DashboardLayout from "@/layouts/DashboardLayout";

// Custom loader component
import CarPartsLoader from "@/components/reassembledComps/car-parts-loader";

// Lazy loaded pages
const LoginPage = lazy(() => import("@/pages/login"));
const DashboardPage = lazy(() => import("@/pages/Dashboard"));
const InventoryPage = lazy(() => import("@/pages/Inventory"));
const OrdersPage = lazy(() => import("@/pages/Orders"));
const UsersPage = lazy(() => import("@/pages/Users"));
const CustomersPage = lazy(() => import("@/pages/Customers"));
const ProfilePage = lazy(() => import("@/pages/Profile"));

// Loading fallback
const Loader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-background">
    <CarPartsLoader size="lg" text="Loading CarParts WMS..." />
  </div>
);

// Admin-only route guard
const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();

  if (!user?.isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Layout wrapper for authenticated pages
const AuthenticatedLayout = () => (
  <AuthGuard>
    <DashboardLayout>
      <Suspense fallback={<Loader />}>
        <Outlet />
      </Suspense>
    </DashboardLayout>
  </AuthGuard>
);

export const routes: RouteObject[] = [
  // Auth routes (only accessible if NOT authenticated)
  {
    path: "login",
    element: (
      <GuestGuard>
        <Suspense fallback={<Loader />}>
          <LoginPage />
        </Suspense>
      </GuestGuard>
    ),
  },

  // Protected routes (only accessible if authenticated)
  {
    path: "/",
    element: <AuthenticatedLayout />,
    children: [
      { path: "", element: <Navigate to="/dashboard" /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "inventory", element: <InventoryPage /> },
      { path: "orders", element: <OrdersPage /> },
      { path: "customers", element: <CustomersPage /> },
      { path: "profile", element: <ProfilePage /> },
      {
        path: "users",
        element: (
          <AdminGuard>
            <UsersPage />
          </AdminGuard>
        ),
      },
    ],
  },

  // Catch-all route - redirect to login
  {
    path: "*",
    element: <Navigate to="/login" replace />,
  },
];
