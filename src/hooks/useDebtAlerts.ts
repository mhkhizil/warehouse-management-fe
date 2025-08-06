import { useState, useEffect, useCallback } from "react";
import { pusherService } from "@/core/infrastructure/services/PusherService";
import { DebtAlert, DebtAlertCounters } from "@/core/domain/types/debt-alerts";

export const useDebtAlerts = () => {
  const [alerts, setAlerts] = useState<DebtAlert[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [counters, setCounters] = useState<DebtAlertCounters>({
    customer: 0,
    supplier: 0,
    overdue: 0,
    dueToday: 0,
    approaching: 0,
    total: 0,
  });

  useEffect(() => {
    const subscriptionId = pusherService.subscribe((alert: DebtAlert) => {
      console.log("🎯 Received alert in useDebtAlerts:", alert);
      setAlerts((prev) => [alert, ...prev]);
      updateCounters(alert, "add");
    });

    setIsConnected(pusherService.getConnectionStatus());

    return () => {
      pusherService.unsubscribe(subscriptionId);
    };
  }, []);

  const updateCounters = useCallback(
    (alert: DebtAlert, action: "add" | "remove") => {
      setCounters((prev) => {
        const multiplier = action === "add" ? 1 : -1;

        return {
          ...prev,
          [alert.type]: prev[alert.type] + multiplier,
          overdue: alert.isOverdue ? prev.overdue + multiplier : prev.overdue,
          dueToday:
            alert.alertType === "due"
              ? prev.dueToday + multiplier
              : prev.dueToday,
          approaching:
            alert.alertType === "approaching"
              ? prev.approaching + multiplier
              : prev.approaching,
          total: prev.total + multiplier,
        };
      });
    },
    []
  );

  const clearAlerts = useCallback(() => {
    setAlerts([]);
    setCounters({
      customer: 0,
      supplier: 0,
      overdue: 0,
      dueToday: 0,
      approaching: 0,
      total: 0,
    });
  }, []);

  const removeAlert = useCallback(
    (alertId: number) => {
      setAlerts((prev) => {
        const alertToRemove = prev.find((alert) => alert.id === alertId);
        if (alertToRemove) {
          updateCounters(alertToRemove, "remove");
        }
        return prev.filter((alert) => alert.id !== alertId);
      });
    },
    [updateCounters]
  );

  const getAlertsByType = useCallback(
    (type: "customer" | "supplier") => {
      return alerts.filter((alert) => alert.type === type);
    },
    [alerts]
  );

  const getAlertsByAlertType = useCallback(
    (alertType: "approaching" | "due" | "overdue") => {
      return alerts.filter((alert) => alert.alertType === alertType);
    },
    [alerts]
  );

  const getOverdueAlerts = useCallback(() => {
    return alerts.filter((alert) => alert.isOverdue);
  }, [alerts]);

  const getDueTodayAlerts = useCallback(() => {
    return alerts.filter((alert) => alert.alertType === "due");
  }, [alerts]);

  return {
    alerts,
    isConnected,
    counters,
    clearAlerts,
    removeAlert,
    getAlertsByType,
    getAlertsByAlertType,
    getOverdueAlerts,
    getDueTodayAlerts,
  };
};
