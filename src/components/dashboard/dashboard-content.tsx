import { motion } from "framer-motion";
import {
  BarChart3,
  Package,
  ShoppingCart,
  TrendingUp,
  Truck,
  AlertCircle,
  Check,
  Clock,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ElementType;
  className?: string;
}

const StatCard = ({
  title,
  value,
  change,
  isPositive,
  icon: Icon,
  className,
}: StatCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className={cn(
        "rounded-lg border bg-card p-5 shadow-sm transition-all hover:shadow-md",
        className
      )}
    >
      <div className="flex justify-between space-y-1">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
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
        </div>
        <div className="rounded-full bg-primary/10 p-3">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
    </motion.div>
  );
};

interface ActivityItemProps {
  title: string;
  description: string;
  time: string;
  status: "pending" | "completed" | "in-progress";
}

const ActivityItem = ({
  title,
  description,
  time,
  status,
}: ActivityItemProps) => {
  const statusIcons = {
    pending: <AlertCircle className="h-4 w-4 text-amber-500" />,
    completed: <Check className="h-4 w-4 text-green-500" />,
    "in-progress": <Clock className="h-4 w-4 text-blue-500" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start space-x-3 border-b pb-3 pt-3 last:border-0"
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
        {statusIcons[status]}
      </div>
      <div className="flex-1">
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <p className="whitespace-nowrap text-sm text-muted-foreground">{time}</p>
    </motion.div>
  );
};

export function DashboardContent() {
  const [greeting, setGreeting] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      let newGreeting = "";

      if (hour >= 5 && hour < 12) {
        newGreeting = "Good morning";
      } else if (hour >= 12 && hour < 18) {
        newGreeting = "Good afternoon";
      } else {
        newGreeting = "Good evening";
      }

      setGreeting(newGreeting);

      // Format current time
      const now = new Date();
      const timeString = now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      const dateString = now.toLocaleDateString([], {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      setCurrentTime(`${timeString} · ${dateString}`);
    };

    updateGreeting();

    // Update time every minute
    const timer = setInterval(updateGreeting, 60000);

    return () => clearInterval(timer);
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <div className="flex flex-col space-y-2">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col space-y-1"
        >
          <h2 className="text-3xl font-bold tracking-tight">
            {greeting}, Admin
          </h2>
          <p className="text-muted-foreground">{currentTime}</p>
        </motion.div>
        <div className="flex items-center justify-between pt-4">
          <h3 className="text-xl font-semibold">Dashboard Overview</h3>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground cursor-pointer"
          >
            Generate Report
          </motion.div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Inventory"
          value="2,345"
          change="+12.5% from last month"
          isPositive={true}
          icon={Package}
        />
        <StatCard
          title="Total Orders"
          value="128"
          change="+8.2% from last month"
          isPositive={true}
          icon={ShoppingCart}
        />
        <StatCard
          title="Total Revenue"
          value="$24,780"
          change="-3.1% from last month"
          isPositive={false}
          icon={BarChart3}
        />
        <StatCard
          title="Pending Shipments"
          value="38"
          change="+14.5% from last month"
          isPositive={false}
          icon={Truck}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="rounded-lg border bg-card p-5 shadow-sm"
        >
          <h3 className="mb-4 text-lg font-semibold">Recent Activities</h3>
          <div className="space-y-0">
            <ActivityItem
              title="New order received"
              description="Order #12345 from Toyota Dealership"
              time="15 minutes ago"
              status="pending"
            />
            <ActivityItem
              title="Shipment sent"
              description="Order #12340 to Honda Auto Parts"
              time="2 hours ago"
              status="completed"
            />
            <ActivityItem
              title="Inventory update"
              description="54 new items added to stock"
              time="5 hours ago"
              status="completed"
            />
            <ActivityItem
              title="Payment received"
              description="$3,400 from Auto World"
              time="Yesterday"
              status="completed"
            />
            <ActivityItem
              title="Stock allocation"
              description="Processing order #12342"
              time="Yesterday"
              status="in-progress"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="rounded-lg border bg-card p-5 shadow-sm"
        >
          <h3 className="mb-4 text-lg font-semibold">Popular Products</h3>
          <div className="space-y-4">
            {[
              {
                name: "Front Bumper - Honda Civic 2022",
                quantity: 58,
                percentage: 80,
              },
              {
                name: "Headlight Assembly - Toyota Camry",
                quantity: 45,
                percentage: 65,
              },
              {
                name: "Side Mirror - Nissan Altima",
                quantity: 39,
                percentage: 55,
              },
              {
                name: "Fender - Ford F-150",
                quantity: 32,
                percentage: 45,
              },
              {
                name: "Hood - Chevrolet Silverado",
                quantity: 28,
                percentage: 40,
              },
            ].map((product, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{product.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {product.quantity} units
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${product.percentage}%` }}
                    transition={{ duration: 1, delay: 0.4 + index * 0.1 }}
                    className="h-full bg-primary"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="rounded-lg border bg-card p-5 shadow-sm"
      >
        <h3 className="mb-4 text-lg font-semibold">Customer Overview</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="flex items-center space-x-3 rounded-lg border p-3">
            <div className="rounded-full bg-primary/10 p-2">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Customers
              </p>
              <p className="text-2xl font-bold">1,248</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 rounded-lg border p-3">
            <div className="rounded-full bg-primary/10 p-2">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                New This Month
              </p>
              <p className="text-2xl font-bold">48</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 rounded-lg border p-3">
            <div className="rounded-full bg-primary/10 p-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Repeat Orders
              </p>
              <p className="text-2xl font-bold">68%</p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
