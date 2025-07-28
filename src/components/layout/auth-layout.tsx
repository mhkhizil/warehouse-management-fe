import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AuthLayoutProps {
  children: ReactNode;
  className?: string;
}

export function AuthLayout({ children, className }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-muted/40 flex items-center justify-center">
      <div className="container flex min-h-screen items-center justify-center py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={cn(
            "w-full max-w-md rounded-lg border bg-background p-6 shadow-md md:p-8",
            className
          )}
        >
          <div className="flex flex-col items-center justify-center space-y-2 text-center">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-primary"
            >
              <span className="text-lg font-bold text-primary-foreground">
                WMS
              </span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-bold tracking-tight"
            >
              CarParts WMS
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-muted-foreground"
            >
              Warehouse Management System
            </motion.p>
          </div>

          <div className="mt-6">{children}</div>
        </motion.div>
      </div>
    </div>
  );
}
