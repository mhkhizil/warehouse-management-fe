import { Navigate, RouteObject } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Outlet } from "react-router-dom";

// Auth Guards
import { AuthGuard, GuestGuard } from "./guards";

// Import the new DashboardLayout
import DashboardLayout from "@/layouts/DashboardLayout";

// Lazy loaded pages
const LoginPage = lazy(() => import("@/pages/login"));
const RegisterPage = lazy(() => import("@/pages/register"));
const DashboardPage = lazy(() => import("@/pages/Dashboard"));
const InventoryPage = lazy(() => import("@/pages/Inventory"));
const OrdersPage = lazy(() => import("@/pages/Orders"));

// Loading fallback
const Loader = () => (
  <div className="flex h-screen w-full items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
  </div>
);

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
  {
    path: "register",
    element: (
      <GuestGuard>
        <Suspense fallback={<Loader />}>
          <RegisterPage />
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
    ],
  },

  // Catch-all route - redirect to login
  {
    path: "*",
    element: <Navigate to="/login" replace />,
  },
];
