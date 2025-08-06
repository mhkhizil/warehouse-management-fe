import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, Clock, AlertCircle, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DebtAlert,
  DebtAlertNotification as DebtAlertNotificationType,
} from "@/core/domain/types/debt-alerts";
import { useDebtAlerts } from "@/hooks/useDebtAlerts";

interface DebtAlertNotificationProps {
  maxNotifications?: number;
  autoDismiss?: boolean;
  dismissDelay?: number;
}

export const DebtAlertNotification: React.FC<DebtAlertNotificationProps> = ({
  maxNotifications = 4,
  autoDismiss = true,
  dismissDelay = 8000,
}) => {
  const { alerts, removeAlert } = useDebtAlerts();
  const [visibleAlerts, setVisibleAlerts] = useState<DebtAlert[]>([]);
  const [queuedAlerts, setQueuedAlerts] = useState<DebtAlert[]>([]);

  useEffect(() => {
    console.log("🔔 DebtAlertNotification component mounted");
  }, []);

  useEffect(() => {
    console.log(
      "🔔 DebtAlertNotification - alerts:",
      alerts,
      "visibleAlerts:",
      visibleAlerts,
      "queuedAlerts:",
      queuedAlerts
    );

    // Get all alerts that are not currently visible
    const newAlerts = alerts.filter(
      (alert) => !visibleAlerts.some((visible) => visible.id === alert.id)
    );

    // If we have space for more alerts, show them
    if (visibleAlerts.length < maxNotifications && newAlerts.length > 0) {
      const alertsToShow = newAlerts.slice(
        0,
        maxNotifications - visibleAlerts.length
      );
      setVisibleAlerts((prev) => [...prev, ...alertsToShow]);

      // Queue the remaining alerts
      const remainingAlerts = newAlerts.slice(
        maxNotifications - visibleAlerts.length
      );
      if (remainingAlerts.length > 0) {
        setQueuedAlerts((prev) => {
          const existingIds = prev.map((a) => a.id);
          const newQueuedAlerts = remainingAlerts.filter(
            (alert) => !existingIds.includes(alert.id)
          );
          return [...prev, ...newQueuedAlerts];
        });
      }
    } else if (
      visibleAlerts.length >= maxNotifications &&
      newAlerts.length > 0
    ) {
      // Queue new alerts when we're at max capacity
      setQueuedAlerts((prev) => {
        const existingIds = prev.map((a) => a.id);
        const newQueuedAlerts = newAlerts.filter(
          (alert) => !existingIds.includes(alert.id)
        );
        return [...prev, ...newQueuedAlerts];
      });
    }
  }, [alerts, maxNotifications, visibleAlerts.length]);

  // Handle showing queued alerts when space becomes available
  useEffect(() => {
    if (visibleAlerts.length < maxNotifications && queuedAlerts.length > 0) {
      const spaceAvailable = maxNotifications - visibleAlerts.length;
      const alertsToShow = queuedAlerts.slice(0, spaceAvailable);

      if (alertsToShow.length > 0) {
        setVisibleAlerts((prev) => [...prev, ...alertsToShow]);
        setQueuedAlerts((prev) => prev.slice(alertsToShow.length));
      }
    }
  }, [visibleAlerts.length, queuedAlerts, maxNotifications]);

  useEffect(() => {
    if (!autoDismiss) return;

    const timeouts: NodeJS.Timeout[] = [];

    visibleAlerts.forEach((alert) => {
      const timeout = setTimeout(() => {
        // Remove the alert from visible alerts
        setVisibleAlerts((prev) => prev.filter((a) => a.id !== alert.id));

        // The queued alerts will be handled by the separate useEffect

        // Also remove from the main alerts list
        removeAlert(alert.id);
      }, dismissDelay);

      timeouts.push(timeout);
    });

    return () => {
      timeouts.forEach((timeout) => clearTimeout(timeout));
    };
  }, [visibleAlerts, autoDismiss, dismissDelay, removeAlert]);

  const createNotification = (alert: DebtAlert): DebtAlertNotificationType => {
    if (alert.isOverdue) {
      return {
        title: "🚨 OVERDUE DEBT ALERT",
        message: `${alert.type.toUpperCase()} ${
          alert.entityName
        } has an overdue debt of $${alert.amount.toFixed(2)}`,
        severity: "error",
        icon: "AlertCircle",
      };
    } else if (alert.alertType === "due") {
      return {
        title: "⚠️ DEBT DUE TODAY",
        message: `${alert.type.toUpperCase()} ${
          alert.entityName
        } has a debt of $${alert.amount.toFixed(2)} due today`,
        severity: "warning",
        icon: "Clock",
      };
    } else {
      return {
        title: "📅 DEBT APPROACHING",
        message: `${alert.type.toUpperCase()} ${
          alert.entityName
        } has a debt of $${alert.amount.toFixed(2)} due in ${
          alert.daysUntilDue
        } days`,
        severity: "info",
        icon: "AlertTriangle",
      };
    }
  };

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "AlertCircle":
        return <AlertCircle className="h-5 w-5" />;
      case "Clock":
        return <Clock className="h-5 w-5" />;
      case "AlertTriangle":
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <DollarSign className="h-5 w-5" />;
    }
  };

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case "error":
        return "border-red-200 bg-red-50 text-red-900 border-l-red-500";
      case "warning":
        return "border-yellow-200 bg-yellow-50 text-yellow-900 border-l-yellow-500";
      case "info":
        return "border-blue-200 bg-blue-50 text-blue-900 border-l-blue-500";
      default:
        return "border-gray-200 bg-gray-50 text-gray-900 border-l-gray-500";
    }
  };

  return (
    <div className="fixed top-4 right-4 z-[9999] max-w-sm space-y-2">
      {/* Queue indicator */}
      {queuedAlerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-500 text-white text-xs px-3 py-1 rounded-full text-center shadow-lg font-medium"
        >
          ⏳ {queuedAlerts.length} more alert
          {queuedAlerts.length > 1 ? "s" : ""} waiting
        </motion.div>
      )}

      <AnimatePresence>
        {visibleAlerts.map((alert, index) => {
          const notification = createNotification(alert);

          return (
            <motion.div
              key={`${alert.id}-${index}`}
              initial={{ opacity: 0, x: 300, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 300, scale: 0.8 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={cn(
                "relative rounded-lg border p-4 shadow-lg backdrop-blur-sm",
                getSeverityStyles(notification.severity)
              )}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 relative">
                  {getIcon(notification.icon || "DollarSign")}
                  {queuedAlerts.length > 0 &&
                    index === visibleAlerts.length - 1 && (
                      <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {queuedAlerts.length}
                      </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold mb-1">
                    {notification.title}
                  </h4>
                  <p className="text-sm mb-2">{notification.message}</p>
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>
                      Due: {new Date(alert.dueDate).toLocaleDateString()}
                    </span>
                    <span>
                      {alert.isOverdue ? "Overdue" : "Due in"}:{" "}
                      {Math.abs(alert.daysUntilDue)} days
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    // Remove the alert from visible alerts
                    setVisibleAlerts((prev) =>
                      prev.filter((a) => a.id !== alert.id)
                    );

                    // The queued alerts will be handled by the separate useEffect

                    // Also remove from the main alerts list
                    removeAlert(alert.id);
                  }}
                  className="flex-shrink-0 p-1 rounded-full hover:bg-black/10 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
