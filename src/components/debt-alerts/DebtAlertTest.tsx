import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { pusherService } from "@/core/infrastructure/services/PusherService";
import { DebtAlert } from "@/core/domain/types/debt-alerts";

export const DebtAlertTest: React.FC = () => {
  const createTestAlert = (
    type: "customer" | "supplier",
    alertType: "approaching" | "due" | "overdue"
  ): DebtAlert => {
    const now = new Date();
    let dueDate: Date;
    let daysUntilDue: number;

    switch (alertType) {
      case "overdue":
        dueDate = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000); // 5 days ago
        daysUntilDue = -5;
        break;
      case "due":
        dueDate = now;
        daysUntilDue = 0;
        break;
      case "approaching":
        dueDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days from now
        daysUntilDue = 3;
        break;
    }

    return {
      id: Math.floor(Math.random() * 10000),
      type,
      entityId: Math.floor(Math.random() * 1000),
      entityName: `${
        type === "customer" ? "Customer" : "Supplier"
      } ${Math.floor(Math.random() * 100)}`,
      amount: Math.floor(Math.random() * 5000) + 100,
      dueDate: dueDate.toISOString(),
      daysUntilDue,
      isOverdue: alertType === "overdue",
      alertType,
      timestamp: now.toISOString(),
      description: `Test ${alertType} alert for ${type}`,
    };
  };

  const triggerTestAlert = (
    type: "customer" | "supplier",
    alertType: "approaching" | "due" | "overdue"
  ) => {
    const testAlert = createTestAlert(type, alertType);
    console.log("🔔 Test button clicked - triggering alert:", testAlert);
    pusherService.triggerTestAlert(testAlert);
  };

  const triggerMultipleAlerts = () => {
    // Trigger a variety of test alerts to test the queue (more than 4)
    setTimeout(() => triggerTestAlert("customer", "overdue"), 0);
    setTimeout(() => triggerTestAlert("supplier", "due"), 500);
    setTimeout(() => triggerTestAlert("customer", "approaching"), 1000);
    setTimeout(() => triggerTestAlert("supplier", "overdue"), 1500);
    setTimeout(() => triggerTestAlert("customer", "due"), 2000);
    setTimeout(() => triggerTestAlert("supplier", "approaching"), 2500);
    setTimeout(() => triggerTestAlert("customer", "overdue"), 3000);
    setTimeout(() => triggerTestAlert("supplier", "due"), 3500);
    setTimeout(() => triggerTestAlert("customer", "approaching"), 4000);
    setTimeout(() => triggerTestAlert("supplier", "overdue"), 4500);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Debt Alert Test Panel</CardTitle>
        <CardDescription>
          Test the debt alert system with sample notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-medium">Customer Alerts</h4>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => triggerTestAlert("customer", "approaching")}
            >
              Approaching
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => triggerTestAlert("customer", "due")}
            >
              Due Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => triggerTestAlert("customer", "overdue")}
            >
              Overdue
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Supplier Alerts</h4>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => triggerTestAlert("supplier", "approaching")}
            >
              Approaching
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => triggerTestAlert("supplier", "due")}
            >
              Due Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => triggerTestAlert("supplier", "overdue")}
            >
              Overdue
            </Button>
          </div>
        </div>

        <div className="pt-4 border-t">
          <Button
            onClick={triggerMultipleAlerts}
            className="w-full"
            variant="secondary"
          >
            Trigger Multiple Alerts
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>• Alerts will appear in the top-right corner (max 4 at a time)</p>
          <p>
            • Additional alerts will be queued and shown 4 at a time when space
            is available
          </p>
          <p>• Queue continues until all alerts are displayed</p>
          <p>• They will auto-dismiss after 8 seconds</p>
          <p>• You can manually dismiss them by clicking the X</p>
        </div>
      </CardContent>
    </Card>
  );
};
