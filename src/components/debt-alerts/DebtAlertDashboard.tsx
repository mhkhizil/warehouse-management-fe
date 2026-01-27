import React from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Clock,
  AlertCircle,
  Users,
  Truck,
  DollarSign,
  TrendingUp,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebtAlerts } from "@/hooks/useDebtAlerts";
import { DebtAlert } from "@/core/domain/types/debt-alerts";

interface DebtAlertCardProps {
  title: string;
  value: number;
  change?: string;
  isPositive?: boolean;
  icon: React.ElementType;
  className?: string;
  variant?: "default" | "warning" | "error" | "success";
}

const DebtAlertCard = ({
  title,
  value,
  change,
  isPositive = true,
  icon: Icon,
  className,
  variant = "default",
}: DebtAlertCardProps) => {
  const getVariantStyles = () => {
    switch (variant) {
      case "error":
        return "border-red-200 bg-red-50 text-red-900";
      case "warning":
        return "border-yellow-200 bg-yellow-50 text-yellow-900";
      case "success":
        return "border-green-200 bg-green-50 text-green-900";
      default:
        return "border-gray-200 bg-white text-gray-900";
    }
  };

  const getIconStyles = () => {
    switch (variant) {
      case "error":
        return "bg-red-100 text-red-600";
      case "warning":
        return "bg-yellow-100 text-yellow-600";
      case "success":
        return "bg-green-100 text-green-600";
      default:
        return "bg-primary/10 text-primary";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className={cn(
        "rounded-lg border p-5 shadow-sm transition-all hover:shadow-md",
        getVariantStyles(),
        className
      )}
    >
      <div className="flex justify-between space-y-1">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
          {change && (
            <div className="mt-1 flex items-center">
              {isPositive ? (
                <TrendingUp className="mr-1 h-3 w-3 text-green-500" />
              ) : (
                <TrendingUp className="mr-1 h-3 w-3 rotate-180 text-red-500" />
              )}
              <span
                className={
                  isPositive ? "text-sm text-green-500" : "text-sm text-red-500"
                }
              >
                {change}
              </span>
            </div>
          )}
        </div>
        <div className={cn("rounded-full p-3", getIconStyles())}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
};

interface DebtAlertItemProps {
  alert: DebtAlert;
  onRemove?: (id: number) => void;
}

const DebtAlertItem = ({ alert, onRemove }: DebtAlertItemProps) => {
  const getAlertIcon = () => {
    if (alert.isOverdue) {
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    } else if (alert.alertType === "due") {
      return <Clock className="h-4 w-4 text-yellow-500" />;
    } else {
      return <AlertTriangle className="h-4 w-4 text-blue-500" />;
    }
  };

  const getAlertStyles = () => {
    if (alert.isOverdue) {
      return "border-l-red-500 bg-red-50";
    } else if (alert.alertType === "due") {
      return "border-l-yellow-500 bg-yellow-50";
    } else {
      return "border-l-blue-500 bg-blue-50";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn(
        "flex items-start space-x-3 border-b border-l-4 p-3 last:border-0",
        getAlertStyles()
      )}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
        {getAlertIcon()}
      </div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="font-medium capitalize">{alert.type}</p>
          <span className="text-sm font-semibold text-green-600">
            ${alert.amount.toFixed(2)}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{alert.entityName}</p>
        <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
          <span>Due: {new Date(alert.dueDate).toLocaleDateString()}</span>
          <span>
            {alert.isOverdue ? "Overdue" : "Due in"}:{" "}
            {Math.abs(alert.daysUntilDue)} days
          </span>
        </div>
      </div>
      {onRemove && (
        <button
          onClick={() => onRemove(alert.id)}
          className="flex-shrink-0 p-1 rounded-full hover:bg-black/10 transition-colors"
        >
          <Check className="h-4 w-4" />
        </button>
      )}
    </motion.div>
  );
};

export const DebtAlertDashboard: React.FC = () => {
  const {
    alerts,
    counters,
    isConnected,
    removeAlert,
    getOverdueAlerts,
    getDueTodayAlerts,
  } = useDebtAlerts();

  const overdueAlerts = getOverdueAlerts();
  const dueTodayAlerts = getDueTodayAlerts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Debt Management Dashboard</h2>
        <div className="flex items-center space-x-2">
          <div
            className={cn(
              "w-2 h-2 rounded-full",
              isConnected ? "bg-green-500" : "bg-red-500"
            )}
          />
          <span className="text-sm text-muted-foreground">
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>

      {/* Counters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DebtAlertCard
          title="Customer Debts"
          value={counters.customer}
          icon={Users}
          variant="default"
        />
        <DebtAlertCard
          title="Supplier Debts"
          value={counters.supplier}
          icon={Truck}
          variant="default"
        />
        <DebtAlertCard
          title="Overdue"
          value={counters.overdue}
          icon={AlertCircle}
          variant="error"
        />
        <DebtAlertCard
          title="Due Today"
          value={counters.dueToday}
          icon={Clock}
          variant="warning"
        />
      </div>

      {/* Recent Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overdue Alerts */}
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              Overdue Alerts
            </h3>
            <span className="text-sm text-muted-foreground">
              {overdueAlerts.length} items
            </span>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {overdueAlerts.length > 0 ? (
              overdueAlerts.map((alert) => (
                <DebtAlertItem
                  key={alert.id}
                  alert={alert}
                  onRemove={removeAlert}
                />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Check className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p>No overdue debts</p>
              </div>
            )}
          </div>
        </div>

        {/* Due Today Alerts */}
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <Clock className="h-5 w-5 text-yellow-500 mr-2" />
              Due Today
            </h3>
            <span className="text-sm text-muted-foreground">
              {dueTodayAlerts.length} items
            </span>
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {dueTodayAlerts.length > 0 ? (
              dueTodayAlerts.map((alert) => (
                <DebtAlertItem
                  key={alert.id}
                  alert={alert}
                  onRemove={removeAlert}
                />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Check className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p>No debts due today</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* All Recent Alerts */}
      {alerts.length > 0 && (
        <div className="rounded-lg border bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <DollarSign className="h-5 w-5 text-primary mr-2" />
              Recent Alerts
            </h3>
            <span className="text-sm text-muted-foreground">
              {alerts.length} total alerts
            </span>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {alerts.slice(0, 10).map((alert) => (
              <DebtAlertItem
                key={alert.id}
                alert={alert}
                onRemove={removeAlert}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
