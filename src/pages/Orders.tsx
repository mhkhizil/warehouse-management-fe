import { useState } from "react";
import {
  PlusCircle,
  Search,
  Filter,
  Eye,
  Package,
  Truck,
  MoreHorizontal,
} from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Types
interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  date: string;
  items: number;
  total: number;
  status: "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
}

// Mock data
const mockOrders: Order[] = [
  {
    id: "1",
    orderNumber: "ORD-2023-001",
    customer: "Acme Corporation",
    date: "2023-10-05",
    items: 5,
    total: 1250.0,
    status: "Pending",
  },
  {
    id: "2",
    orderNumber: "ORD-2023-002",
    customer: "TechSolutions Inc.",
    date: "2023-10-04",
    items: 2,
    total: 475.5,
    status: "Processing",
  },
  {
    id: "3",
    orderNumber: "ORD-2023-003",
    customer: "Global Enterprises",
    date: "2023-10-03",
    items: 10,
    total: 3200.75,
    status: "Shipped",
  },
  {
    id: "4",
    orderNumber: "ORD-2023-004",
    customer: "Local Business LLC",
    date: "2023-10-02",
    items: 1,
    total: 125.99,
    status: "Delivered",
  },
  {
    id: "5",
    orderNumber: "ORD-2023-005",
    customer: "StartUp Co.",
    date: "2023-10-01",
    items: 3,
    total: 850.25,
    status: "Cancelled",
  },
  {
    id: "6",
    orderNumber: "ORD-2023-006",
    customer: "Mega Industries",
    date: "2023-09-30",
    items: 7,
    total: 1875.0,
    status: "Shipped",
  },
  {
    id: "7",
    orderNumber: "ORD-2023-007",
    customer: "City Services",
    date: "2023-09-29",
    items: 4,
    total: 950.5,
    status: "Processing",
  },
];

// Get the color based on status
const getStatusVariant = (status: string) => {
  switch (status) {
    case "Pending":
      return "warning";
    case "Processing":
      return "secondary";
    case "Shipped":
      return "default";
    case "Delivered":
      return "success";
    case "Cancelled":
      return "destructive";
    default:
      return "secondary";
  }
};

export default function Orders() {
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage] = useState(5);
  const [search, setSearch] = useState("");

  // Filter orders based on tab and search
  let filteredOrders = mockOrders;

  // Filter by tab
  if (activeTab === "in-progress") {
    filteredOrders = mockOrders.filter((order) =>
      ["Pending", "Processing"].includes(order.status)
    );
  } else if (activeTab === "shipped") {
    filteredOrders = mockOrders.filter((order) => order.status === "Shipped");
  } else if (activeTab === "delivered") {
    filteredOrders = mockOrders.filter((order) => order.status === "Delivered");
  } else if (activeTab === "cancelled") {
    filteredOrders = mockOrders.filter((order) => order.status === "Cancelled");
  }

  // Filter by search
  filteredOrders = filteredOrders.filter(
    (order) =>
      order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      order.customer.toLowerCase().includes(search.toLowerCase())
  );

  // Calculate displayed rows for pagination
  const displayedOrders = filteredOrders.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  // For pagination
  const totalPages = Math.ceil(filteredOrders.length / rowsPerPage);

  // Go to previous page
  const goToPreviousPage = () => {
    setPage((prev) => Math.max(0, prev - 1));
  };

  // Go to next page
  const goToNextPage = () => {
    setPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Order Management</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Order
        </Button>
      </div>

      <Card>
        <Tabs defaultValue="all" onValueChange={setActiveTab} value={activeTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All Orders</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="shipped">Shipped</TabsTrigger>
            <TabsTrigger value="delivered">Delivered</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>

          <div className="p-4 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search orders..."
                  className="w-full pl-8"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(0);
                  }}
                />
              </div>
              <Button variant="outline" size="sm" className="h-9">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order Number</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Items</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayedOrders.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="h-32 text-center text-muted-foreground"
                      >
                        No orders found
                      </TableCell>
                    </TableRow>
                  ) : (
                    displayedOrders.map((order) => (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="border-b transition-colors hover:bg-muted/50 group"
                      >
                        <TableCell className="font-medium">
                          {order.orderNumber}
                        </TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell>{order.date}</TableCell>
                        <TableCell className="text-right">
                          {order.items}
                        </TableCell>
                        <TableCell className="text-right">
                          ${order.total.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={getStatusVariant(order.status) as any}
                            className="capitalize"
                          >
                            {order.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>

                            {order.status === "Pending" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                title="Process Order"
                              >
                                <Package className="h-4 w-4" />
                              </Button>
                            )}

                            {order.status === "Processing" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                title="Ship Order"
                              >
                                <Truck className="h-4 w-4" />
                              </Button>
                            )}

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem className="cursor-pointer">
                                  View Details
                                </DropdownMenuItem>
                                {order.status !== "Cancelled" && (
                                  <DropdownMenuItem className="cursor-pointer text-destructive">
                                    Cancel Order
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {filteredOrders.length > 0 && (
              <div className="flex items-center justify-between py-4">
                <div className="text-sm text-muted-foreground">
                  Showing{" "}
                  <strong>
                    {page * rowsPerPage + 1}-
                    {Math.min((page + 1) * rowsPerPage, filteredOrders.length)}
                  </strong>{" "}
                  of <strong>{filteredOrders.length}</strong> orders
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToPreviousPage}
                    disabled={page === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={goToNextPage}
                    disabled={page >= totalPages - 1}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Tabs>
      </Card>
    </div>
  );
}
