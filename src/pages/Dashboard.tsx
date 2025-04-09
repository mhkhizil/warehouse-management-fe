import { Package, Truck, CheckSquare, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function Dashboard() {
  // Mock data - would come from API in real app
  const stats = [
    {
      title: "Total Inventory",
      value: "1,245",
      icon: Package,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Pending Shipments",
      value: "37",
      icon: Truck,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
    {
      title: "Completed Orders",
      value: "254",
      icon: CheckSquare,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Low Stock Items",
      value: "23",
      icon: AlertCircle,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight mb-5">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <motion.div
            key={stat.title}
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="h-full">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {stat.title}
                    </p>
                    <h3 className="text-3xl font-bold mt-1">{stat.value}</h3>
                  </div>
                  <div className={cn("p-2 rounded-full", stat.bgColor)}>
                    <stat.icon className={cn("h-6 w-6", stat.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        <div className="md:col-span-5">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium">Recent Activity</h3>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Activity chart will go here
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <h3 className="text-lg font-medium">Inventory Status</h3>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Inventory pie chart will go here
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
