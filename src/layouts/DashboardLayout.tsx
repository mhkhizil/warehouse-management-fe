import { useState, ReactNode } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/core/presentation/hooks/useAuth";
import { cn } from "@/lib/utils";
import {
  Menu,
  LayoutDashboard,
  Package,
  Truck,
  Users,
  Settings,
  LogOut,
  ShoppingCart,
  User,
  CircleUser,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
// import { ThemeToggle } from "@/components/theme/theme-toggle";
import packageJson from "../../package.json";

interface DashboardLayoutProps {
  children?: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isOpen, setIsOpen] = useState(true);
  const { t } = useTranslation();
  const { user: currentUser, logout } = useAuth();
  const location = useLocation();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Base menu items for all users
  const baseMenuItems = [
    {
      text: t("navigation.dashboard"),
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    { text: t("navigation.inventory"), icon: Package, path: "/inventory" },
    { text: t("navigation.orders"), icon: ShoppingCart, path: "/orders" },
    { text: t("navigation.customers"), icon: Users, path: "/customers" },
    { text: t("navigation.suppliers"), icon: Building2, path: "/suppliers" },
    { text: t("navigation.supplierDebts") || "Supplier Debts", icon: Truck, path: "/supplier-debts" },
    { text: t("navigation.customerDebts") || "Customer Debts", icon: Truck, path: "/customer-debts" },
    { text: "Shipments", icon: Truck, path: "/shipments" },
    { text: t("navigation.profile"), icon: CircleUser, path: "/profile" },
    { text: "Settings", icon: Settings, path: "/settings" },
  ];

  // Admin-only menu items
  const adminMenuItems = [
    { text: t("navigation.users"), icon: User, path: "/users" },
  ];

  // Combine menu items based on user role
  const menuItems = currentUser?.isAdmin()
    ? [
        ...baseMenuItems.slice(0, 4),
        ...adminMenuItems,
        ...baseMenuItems.slice(4),
      ]
    : baseMenuItems;

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
          <button
            onClick={toggleSidebar}
            className="flex items-center hover:opacity-80 transition-all duration-200 cursor-pointer rounded-md p-1 hover:bg-accent/50 hover:scale-105"
            aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isOpen ? (
              <div className="flex items-center">
                <img
                  src="/pnglogo-1.png"
                  alt="NZ Auto Logo"
                  className="h-16 w-auto mr-2"
                />
                <h1 className="text-xl font-bold">NZ Auto</h1>
              </div>
            ) : (
              <div className="mx-auto">
                <img
                  src="/pnglogo-1.png"
                  alt="NZ Auto Logo"
                  className="h-8 w-auto"
                />
              </div>
            )}
          </button>
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
            {isOpen && (
              <span className="ml-3">{t("common.logout") || "Logout"}</span>
            )}
          </Button>
        </div>
      </motion.aside>

      {/* Main content */}
      <div
        className={cn(
          "flex flex-1 flex-col transition-all duration-300 ease-in-out",
          isOpen ? "ml-60" : "ml-20"
        )}
      >
        {/* Header */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/95 px-6 backdrop-blur">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Logo for mobile when sidebar is collapsed */}
            {!isOpen && (
              <div className="mr-4 md:hidden">
                <img
                  src="/pnglogo-1.png"
                  alt="NZ Auto Logo"
                  className="h-16 w-auto"
                />
              </div>
            )}

            <h2 className="ml-2 text-lg font-semibold">
              {menuItems.find((item) => item.path === location.pathname)
                ?.text || "Dashboard"}
            </h2>
          </div>

          {/* Header actions */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            {/* <ThemeToggle /> */}
            <div className="text-xs text-muted-foreground font-mono">
              v{packageJson.version}
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-auto p-6">
          {children || <Outlet />}
        </main>
      </div>
    </div>
  );
}
