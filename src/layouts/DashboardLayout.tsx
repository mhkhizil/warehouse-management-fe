import { useState, ReactNode } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/core/presentation/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  Menu,
  LayoutDashboard,
  Package,
  Truck,
  Users,
  Settings,
  LogOut,
  ShoppingCart,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardLayoutProps {
  children?: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isOpen, setIsOpen] = useState(true);
  const { logout } = useAuth();
  const location = useLocation();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const menuItems = [
    { text: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { text: "Inventory", icon: Package, path: "/inventory" },
    { text: "Orders", icon: ShoppingCart, path: "/orders" },
    { text: "Shipments", icon: Truck, path: "/shipments" },
    { text: "Users", icon: Users, path: "/users" },
    { text: "Settings", icon: Settings, path: "/settings" },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <motion.aside
        initial={{ width: 240 }}
        animate={{ width: isOpen ? 240 : 80 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="fixed left-0 z-20 flex h-full flex-col border-r bg-card"
      >
        <div className="flex h-16 items-center px-4">
          {isOpen ? (
            <h1 className="text-xl font-bold">CarParts WMS</h1>
          ) : (
            <span className="mx-auto text-xl font-bold">WMS</span>
          )}
        </div>

        <div className="flex flex-col flex-1 overflow-y-auto p-3 space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.text}
                to={item.path}
                className={cn(
                  "flex h-10 items-center rounded-md px-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {isOpen && <span className="ml-3">{item.text}</span>}
              </Link>
            );
          })}
        </div>

        <div className="border-t p-3">
          <Button
            variant="ghost"
            className={cn(
              "flex w-full h-10 items-center justify-start rounded-md px-3 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
            onClick={logout}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {isOpen && <span className="ml-3">Logout</span>}
          </Button>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-3"
          onClick={toggleSidebar}
        >
          <ChevronLeft
            className={cn(
              "h-5 w-5 transition-transform",
              !isOpen && "rotate-180"
            )}
          />
        </Button>
      </motion.aside>

      {/* Main content */}
      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-300 ease-in-out",
          isOpen ? "ml-60" : "ml-20"
        )}
      >
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-16 items-center border-b bg-background/95 px-6 backdrop-blur">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h2 className="ml-2 text-lg font-semibold">
            {menuItems.find((item) => item.path === location.pathname)?.text ||
              "Dashboard"}
          </h2>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-auto p-6">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}
