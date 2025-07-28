import { Navigate, RouteObject } from "react-router-dom";
import { Suspense } from "react";

// Auth Guards
import { GuestGuard, AdminGuard } from "./guards";

// Import components from separate file
import { Loader, AuthenticatedLayout } from "./components";

// Import lazy loaded pages
import {
  LoginPage,
  DashboardPage,
  InventoryPage,
  OrdersPage,
  UsersPage,
  CustomersPage,
  ProfilePage,
} from "./lazy-pages";

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
