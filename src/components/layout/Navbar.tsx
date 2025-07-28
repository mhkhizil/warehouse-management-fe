import { motion } from "framer-motion";
import { Bell, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { cn } from "@/lib/utils";

interface NavbarProps {
  className?: string;
  sidebarCollapsed?: boolean;
  toggleSidebar?: () => void;
}

export function Navbar({
  className,
  sidebarCollapsed,
  toggleSidebar,
}: NavbarProps) {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b bg-background/95 px-6 backdrop-blur transition-all",
        className
      )}
    >
      <div className="flex items-center gap-2">
        {toggleSidebar && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="mr-2"
            aria-label={
              sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
          >
            <Menu
              className={cn(
                "h-5 w-5",
                sidebarCollapsed && "rotate-90 transition-transform"
              )}
            />
          </Button>
        )}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="h-9 w-64 rounded-md border border-input bg-background pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 10,
              delay: 0.2,
            }}
            className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-destructive"
          />
        </Button>
        <ThemeToggle />
        <div className="ml-4 flex items-center gap-3">
          <div className="hidden md:block">
            <p className="text-sm font-medium">Admin User</p>
            <p className="text-xs text-muted-foreground">admin@carparts.com</p>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="h-9 w-9 overflow-hidden rounded-full bg-primary"
          >
            <div className="flex h-full w-full items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">
                AU
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}
