import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Truck,
  Users,
  Settings,
  FileBox,
  BarChart3,

} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  className?: string;
  collapsed?: boolean;
}

export function Sidebar({
  className,
  collapsed: externalCollapsed,
}: SidebarProps) {
  // Use the external collapsed state if provided, otherwise use internal state
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const collapsed =
    externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;

  const toggleSidebar = () => {
    if (externalCollapsed === undefined) {
      setInternalCollapsed(!internalCollapsed);
    }
  };

  const sidebarVariants = {
    expanded: { width: "240px" },
    collapsed: { width: "80px" },
  };

  const navItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
    },
    {
      label: "Inventory",
      icon: Package,
      href: "/inventory",
    },
    {
      label: "Orders",
      icon: ShoppingCart,
      href: "#",
    },
    {
      label: "Suppliers",
      icon: Truck,
      href: "#",
    },
    {
      label: "Customers",
      icon: Users,
      href: "/customers",
    },
    {
      label: "Body Parts",
      icon: FileBox,
      href: "#",
    },
    {
      label: "Reports",
      icon: BarChart3,
      href: "#",
    },
    {
      label: "Settings",
      icon: Settings,
      href: "#",
    },
  ];

  return (
    <motion.div
      initial="expanded"
      animate={collapsed ? "collapsed" : "expanded"}
      variants={sidebarVariants}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={cn(
        "group relative flex h-screen flex-col border-r bg-background px-3 py-4",
        className
      )}
    >
      <div className="flex items-center justify-between pb-6">
        <motion.h2
          animate={{ opacity: collapsed ? 0 : 1 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "text-xl font-bold text-primary",
            collapsed && "invisible"
          )}
        >
          {collapsed ? "" : "CarParts WMS"}
        </motion.h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="rounded-full"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </Button>
      </div>

      <div className="flex-1 overflow-auto py-2">
        <nav className="flex flex-col gap-1">
          {navItems.map((item, index) => (
            <motion.a
              key={index}
              href={item.href}
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                !collapsed && "justify-start"
              )}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              {item.icon && <item.icon className="h-5 w-5 shrink-0" />}
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="ml-3"
                >
                  {item.label}
                </motion.span>
              )}
            </motion.a>
          ))}
        </nav>
      </div>

      <div className="mt-auto">
        <div
          className={cn(
            "flex items-center rounded-md bg-secondary/30 p-2",
            collapsed ? "justify-center" : "justify-start"
          )}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary">
            <span className="text-sm font-bold text-primary-foreground">
              WMS
            </span>
          </div>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="ml-3"
            >
              <p className="text-sm font-semibold">Admin User</p>
              <p className="text-xs text-muted-foreground">Warehouse Manager</p>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
