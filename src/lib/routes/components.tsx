import CarPartsLoader from "@/components/reassembledComps/car-parts-loader";
import DashboardLayout from "@/layouts/DashboardLayout";
import { AuthGuard } from "./guards";
import { Outlet } from "react-router-dom";
import { Suspense } from "react";

// Loading fallback component
export const Loader = () => (
  <div className="flex h-screen w-full items-center justify-center bg-background">
    <CarPartsLoader size="lg" text="Loading CarParts WMS..." />
  </div>
);

// Layout wrapper for authenticated pages
export const AuthenticatedLayout = () => (
  <AuthGuard>
    <DashboardLayout>
      <Suspense fallback={<Loader />}>
        <Outlet />
      </Suspense>
    </DashboardLayout>
  </AuthGuard>
);
