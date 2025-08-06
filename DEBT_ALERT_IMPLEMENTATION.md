# Debt Alert System Implementation

This document describes the implementation of a real-time debt alert system for customer and supplier debts in the WMS Frontend application.

## Overview

The debt alert system provides real-time notifications for:

- **Approaching debts**: Due within 3 days
- **Due today**: Debts due on the current date
- **Overdue debts**: Past due date

## Architecture

### Core Components

1. **PusherService** (`src/core/infrastructure/services/PusherService.ts`)

   - Handles real-time communication via Pusher
   - Manages subscriptions and listeners
   - Provides connection status monitoring

2. **DebtAlertService** (`src/core/infrastructure/services/DebtAlertService.ts`)

   - API service for debt alert operations
   - Handles CRUD operations for alerts
   - Manages alert counters and statistics

3. **useDebtAlerts Hook** (`src/hooks/useDebtAlerts.ts`)
   - React hook for managing debt alert state
   - Provides alert filtering and counter management
   - Handles real-time updates

### UI Components

1. **DebtAlertNotification** (`src/components/debt-alerts/DebtAlertNotification.tsx`)

   - Real-time toast notifications
   - Auto-dismissing with manual override
   - Animated entrance/exit effects

2. **DebtAlertDashboard** (`src/components/debt-alerts/DebtAlertDashboard.tsx`)

   - Comprehensive debt management view
   - Live counters and statistics
   - Alert categorization and filtering

3. **DebtAlertBadge** (`src/components/debt-alerts/DebtAlertBadge.tsx`)

   - Navigation badge showing alert count
   - Visual indicators for alert severity
   - Connection status indicator

4. **DebtAlertTest** (`src/components/debt-alerts/DebtAlertTest.tsx`)
   - Testing interface for the alert system
   - Sample data generation
   - Manual alert triggering

## Types and Interfaces

### DebtAlert Interface

```typescript
interface DebtAlert {
  id: number;
  type: "customer" | "supplier";
  entityId: number;
  entityName: string;
  amount: number;
  dueDate: string;
  daysUntilDue: number;
  isOverdue: boolean;
  alertType: "approaching" | "due" | "overdue";
  timestamp: string;
  transactionId?: number;
  description?: string;
}
```

### DebtAlertCounters Interface

```typescript
interface DebtAlertCounters {
  customer: number;
  supplier: number;
  overdue: number;
  dueToday: number;
  approaching: number;
  total: number;
}
```

## Configuration

### Environment Variables

**Frontend (.env)**

```env
VITE_PUSHER_KEY=your_pusher_key
VITE_PUSHER_CLUSTER=us2
```

**Backend (.env)**

```env
PUSHER_APP_ID=your_pusher_app_id
PUSHER_KEY=your_pusher_key
PUSHER_SECRET=your_pusher_secret
PUSHER_CLUSTER=us2
```

### API Endpoints

The system uses the following API endpoints:

```typescript
DEBT_ALERTS: {
  BASE: "/debt-alerts",
  GET_ALL: "/debt-alerts/all",
  GET_ACTIVE: "/debt-alerts/active",
  GET_BY_TYPE: (type: string) => `/debt-alerts/type/${type}`,
  GET_BY_ALERT_TYPE: (alertType: string) => `/debt-alerts/alert-type/${alertType}`,
  MARK_READ: (id: string) => `/debt-alerts/${id}/mark-read`,
  MARK_ALL_READ: "/debt-alerts/mark-all-read",
  GET_COUNTERS: "/debt-alerts/counters",
}
```

## Usage

### Basic Integration

1. **Add to App Component**

```typescript
import { DebtAlertNotification } from "@/components/debt-alerts";

function App() {
  return (
    <div>
      {/* Your app content */}
      <DebtAlertNotification />
    </div>
  );
}
```

2. **Add Badge to Navigation**

```typescript
import { DebtAlertBadge } from "@/components/debt-alerts";

function Navigation() {
  return (
    <nav>
      {/* Your navigation items */}
      <DebtAlertBadge variant="minimal" />
    </nav>
  );
}
```

3. **Add Dashboard to Page**

```typescript
import { DebtAlertDashboard } from "@/components/debt-alerts";

function DebtManagementPage() {
  return (
    <div>
      <DebtAlertDashboard />
    </div>
  );
}
```

### Using the Hook

```typescript
import { useDebtAlerts } from "@/hooks/useDebtAlerts";

function MyComponent() {
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
    <div>
      <p>Total Alerts: {counters.total}</p>
      <p>Overdue: {counters.overdue}</p>
      <p>Due Today: {counters.dueToday}</p>

      {alerts.map((alert) => (
        <div key={alert.id}>
          {alert.entityName} - ${alert.amount}
        </div>
      ))}
    </div>
  );
}
```

## Features

### Real-time Notifications

- Instant alerts via Pusher
- Auto-dismissing after 8 seconds
- Manual dismissal option
- Animated entrance/exit effects

### Alert Management

- Filter by type (customer/supplier)
- Filter by alert type (approaching/due/overdue)
- Mark alerts as read
- Remove alerts from view

### Visual Indicators

- Color-coded severity levels
- Connection status indicators
- Live counters and statistics
- Responsive design

### Testing

- Built-in test panel
- Sample data generation
- Manual alert triggering
- Multiple alert simulation

## Backend Integration

The frontend expects the backend to:

1. **Send Pusher Events**

   - Channel: `debt-alerts`
   - Event: `debt-alert`
   - Data: `DebtAlert` object

2. **Provide API Endpoints**

   - GET `/debt-alerts/all` - All alerts
   - GET `/debt-alerts/active` - Active alerts
   - GET `/debt-alerts/counters` - Alert counters
   - PATCH `/debt-alerts/{id}/mark-read` - Mark as read

3. **Cron Jobs**
   - Hourly checks for approaching debts
   - Daily checks for due/overdue debts
   - Real-time alert triggering

## Demo Page

Access the demo page at `/debt-alerts-demo` to see all components in action:

- **Dashboard Tab**: Full debt management interface
- **Test Panel Tab**: Testing interface with sample data
- **Components Tab**: Individual component showcase

## Testing

### Manual Testing

1. Navigate to the demo page
2. Use the test panel to trigger alerts
3. Observe real-time notifications
4. Test different alert types and scenarios

### Automated Testing

```typescript
// Test alert creation
const testAlert: DebtAlert = {
  id: 1,
  type: "customer",
  entityId: 123,
  entityName: "John Doe",
  amount: 500,
  dueDate: "2025-01-30T00:00:00.000Z",
  daysUntilDue: -5,
  isOverdue: true,
  alertType: "overdue",
  timestamp: new Date().toISOString(),
};

// Trigger test alert
pusherService.triggerTestAlert(testAlert);
```

## Troubleshooting

### Common Issues

1. **No Notifications Appearing**

   - Check Pusher configuration
   - Verify environment variables
   - Check browser console for errors

2. **Connection Issues**

   - Verify Pusher credentials
   - Check network connectivity
   - Review Pusher dashboard

3. **Alerts Not Updating**
   - Check backend cron jobs
   - Verify API endpoints
   - Review Pusher event triggers

### Debug Mode

Enable debug logging by setting:

```typescript
// In PusherService.ts
console.log("Pusher connected successfully");
console.log("Debt alert received:", data);
```

## Performance Considerations

- Alerts are limited to 5 concurrent notifications
- Auto-dismissal prevents notification spam
- Efficient state management with React hooks
- Optimized re-renders with proper dependencies

## Security

- Pusher channels are public (no sensitive data)
- API calls use existing authentication
- No sensitive information in notifications
- Proper error handling and logging

## Future Enhancements

- Email notifications
- SMS alerts
- Alert history and analytics
- Custom alert thresholds
- Alert escalation rules
- Integration with external systems
