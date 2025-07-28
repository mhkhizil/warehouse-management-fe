import { lazy } from "react";

// Lazy loaded pages
export const LoginPage = lazy(() => import("@/pages/login"));
export const DashboardPage = lazy(() => import("@/pages/Dashboard"));
export const InventoryPage = lazy(() => import("@/pages/Inventory"));
export const OrdersPage = lazy(() => import("@/pages/Orders"));
export const UsersPage = lazy(() => import("@/pages/Users"));
export const CustomersPage = lazy(() => import("@/pages/Customers"));
export const ProfilePage = lazy(() => import("@/pages/Profile"));
