import React from "react";
import { motion } from "framer-motion";
import { AlertCircle, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebtAlerts } from "@/hooks/useDebtAlerts";

interface DebtAlertBadgeProps {
  className?: string;
  showCount?: boolean;
  variant?: "default" | "minimal";
  onClick?: () => void;
}

export const DebtAlertBadge: React.FC<DebtAlertBadgeProps> = ({
  className,
  showCount = true,
  variant = "default",
  onClick,
}) => {
  const { counters, isConnected } = useDebtAlerts();

  const totalAlerts = counters.total;
  const hasOverdue = counters.overdue > 0;
  const hasDueToday = counters.dueToday > 0;

  const getBadgeColor = () => {
    if (hasOverdue) return "bg-red-500 text-white";
    if (hasDueToday) return "bg-yellow-500 text-white";
    if (totalAlerts > 0) return "bg-blue-500 text-white";
    return "bg-gray-300 text-gray-600";
  };

  const getIconColor = () => {
    if (hasOverdue) return "text-red-500";
    if (hasDueToday) return "text-yellow-500";
    if (totalAlerts > 0) return "text-blue-500";
    return "text-gray-400";
  };

  if (variant === "minimal") {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "relative inline-flex items-center justify-center",
          className
        )}
        onClick={onClick}
      >
        <Bell className={cn("h-5 w-5", getIconColor())} />
        {totalAlerts > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={cn(
              "absolute -top-1 -right-1 h-4 w-4 rounded-full text-xs font-bold flex items-center justify-center",
              getBadgeColor()
            )}
          >
            {showCount ? (totalAlerts > 99 ? "99+" : totalAlerts) : ""}
          </motion.div>
        )}
        {!isConnected && (
          <div className="absolute -bottom-1 -right-1 h-2 w-2 rounded-full bg-red-500" />
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "relative inline-flex items-center space-x-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors",
        hasOverdue
          ? "border-red-200 bg-red-50 hover:bg-red-100"
          : hasDueToday
          ? "border-yellow-200 bg-yellow-50 hover:bg-yellow-100"
          : totalAlerts > 0
          ? "border-blue-200 bg-blue-50 hover:bg-blue-100"
          : "border-gray-200 bg-gray-50 hover:bg-gray-100",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center space-x-2">
        {hasOverdue ? (
          <AlertCircle className="h-4 w-4 text-red-500" />
        ) : (
          <Bell className={cn("h-4 w-4", getIconColor())} />
        )}

        {showCount && (
          <span className="text-sm font-medium">
            {totalAlerts} {totalAlerts === 1 ? "Alert" : "Alerts"}
          </span>
        )}
      </div>

      {hasOverdue && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="px-2 py-1 rounded-full bg-red-500 text-white text-xs font-bold"
        >
          {counters.overdue} Overdue
        </motion.div>
      )}

      {!isConnected && (
        <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-red-500" />
      )}
    </motion.div>
  );
};
