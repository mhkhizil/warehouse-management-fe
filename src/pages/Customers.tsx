import React, { useState, useEffect } from "react";
import { useCustomerManagement } from "../core/presentation/hooks/useCustomerManagement";
import { useAuth } from "../core/presentation/hooks/useAuth";
import { Customer } from "../core/domain/entities/Customer";
import {
  CreateCustomerDTO,
  UpdateCustomerDTO,
} from "../core/application/dtos/CustomerDTO";
import {
  Plus,
  Users,
  DollarSign,
  AlertTriangle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import CarPartsLoader from "@/components/reassembledComps/car-parts-loader";
import {
  DataTable,
  ConfirmModal,
  Header,
  HeaderButton,
  HeaderNotice,
  StatsCard,
  StatsGrid,
  SearchSorts,
  useFilterIndicators,
} from "@/components/reassembledComps";
import {
  getCustomerColumns,
  getCustomerActions,
  getDeletedCustomerActions,
  CustomerModal,
} from "@/components/customers";
import { useToast } from "@/hooks/use-toast";
import { useCustomerExport } from "@/hooks/useExport";
import { useCustomerDataLoader } from "@/hooks/useDataLoader";

export default function Customers() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const {
    customers,
    totalCustomers,
    isLoading,
    error,
    createCustomer,
    getCustomers,
    updateCustomer,
    deleteCustomer,
    restoreCustomer,
    searchCustomersByName,
    searchCustomersByEmail,
    searchCustomersByPhone,
    searchCustomersByAddress,
    getCustomersWithDebts,
    getCustomersWithOverdueDebts,
    getDeletedCustomers,
    getCustomerById,
    clearError,
  } = useCustomerManagement();

  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState<
    "name" | "email" | "phone" | "address"
  >("name");
  const [debtFilter, setDebtFilter] = useState<"ALL" | "WITH_DEBT" | "OVERDUE">(
    "ALL"
  );
  const [viewMode, setViewMode] = useState<"active" | "deleted">("active");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [sortBy, setSortBy] = useState<
    | "name"
    | "email"
    | "phone"
    | "address"
    | "debtStatus"
    | "createdAt"
    | "updatedAt"
  >("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalVariant, setModalVariant] = useState<"create" | "edit" | "view">(
    "create"
  );
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(
    null
  );
  const [showRestoreConfirm, setShowRestoreConfirm] = useState<number | null>(
    null
  );
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);

  // Filter indicators hook
  const filterIndicators = useFilterIndicators();

  // Export functionality
  const { handleExport, isExportDisabled } = useCustomerExport(
    customers,
    currentUser
  );

  // Data loading functionality
  const { loadData } = useCustomerDataLoader(
    searchCustomersByName,
    searchCustomersByEmail,
    searchCustomersByPhone,
    searchCustomersByAddress,
    getCustomersWithDebts,
    getCustomersWithOverdueDebts,
    getDeletedCustomers,
    getCustomers
  );

  // Load customers on component mount and when filters change
  useEffect(() => {
    loadCustomersData();
  }, [currentPage, debtFilter, sortBy, sortOrder, searchTerm, viewMode]);

  const loadCustomersData = async () => {
    await loadData(
      searchTerm,
      searchType,
      debtFilter,
      currentPage,
      pageSize,
      sortBy,
      sortOrder,
      viewMode
    );
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    await loadCustomersData();
  };

  const handleDebtFilter = async (filter: "ALL" | "WITH_DEBT" | "OVERDUE") => {
    setDebtFilter(filter);
    setCurrentPage(1);
    setSearchTerm("");

    // Update filter indicators
    if (filter !== "ALL") {
      filterIndicators.addFilter("debt", "Debt Status", filter, () =>
        handleClearDebt()
      );
    } else {
      filterIndicators.clearFilter("debt");
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
    filterIndicators.clearFilter("search");
  };

  const handleClearDebt = () => {
    setDebtFilter("ALL");
    setCurrentPage(1);
    filterIndicators.clearFilter("debt");
  };

  const handleClearSort = () => {
    setSortBy("createdAt");
    setSortOrder("desc");
    setCurrentPage(1);
    filterIndicators.clearFilter("sort");
  };

  const handleClearAllFilters = () => {
    setSearchTerm("");
    setDebtFilter("ALL");
    setSortBy("createdAt");
    setSortOrder("desc");
    setCurrentPage(1);
    filterIndicators.clearAllFilters();
  };

  const handleSort = (field: string) => {
    const validFields = [
      "name",
      "email",
      "phone",
      "address",
      "debtStatus",
      "createdAt",
      "updatedAt",
    ] as const;
    const validField = validFields.find((f) => f === field);

    if (validField) {
      if (sortBy === validField) {
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
      } else {
        setSortBy(validField);
        setSortOrder("asc");
      }

      // Update filter indicators
      filterIndicators.addFilter(
        "sort",
        "Sort",
        `${validField} (${sortOrder})`,
        () => handleClearSort()
      );
    }
    setCurrentPage(1);
  };

  // Update filter indicators when search term changes
  React.useEffect(() => {
    if (searchTerm.trim()) {
      filterIndicators.addFilter("search", searchType, searchTerm, () =>
        handleClearSearch()
      );
    } else {
      filterIndicators.clearFilter("search");
    }
  }, [searchTerm, searchType]);

  const getSortIcon = (field: string) => {
    const validFields = [
      "name",
      "email",
      "phone",
      "address",
      "debtStatus",
      "createdAt",
      "updatedAt",
    ] as const;
    const validField = validFields.find((f) => f === field);

    if (!validField || sortBy !== validField) {
      return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="h-4 w-4 text-primary" />
    ) : (
      <ArrowDown className="h-4 w-4 text-primary" />
    );
  };

  const handleEditCustomer = (customer: Customer) => {
    if (!currentUser?.isAdmin()) {
      toast({
        title: "Access Denied",
        description: "Only administrators can edit customers",
        variant: "destructive",
      });
      return;
    }
    setEditingCustomer(customer);
    setIsModalOpen(true);
    setModalVariant("edit");
  };

  const handleAddCustomer = () => {
    // Check if current user is admin
    if (!currentUser?.isAdmin()) {
      toast({
        title: "Access Denied",
        description: "Only administrators can create new customers",
        variant: "destructive",
      });
      return;
    }
    setEditingCustomer(null);
    setIsModalOpen(true);
    setModalVariant("create");
  };

  const handleSaveCustomer = async (
    customerData: CreateCustomerDTO | UpdateCustomerDTO
  ) => {
    try {
      if (editingCustomer) {
        // Update existing customer
        await updateCustomer(
          editingCustomer.id,
          customerData as UpdateCustomerDTO
        );
        toast({
          title: "Success",
          description: "Customer updated successfully",
          variant: "success",
        });
      } else {
        // Create new customer
        if (!customerData.name || !customerData.email) {
          throw new Error("Name and email are required");
        }
        await createCustomer(customerData as CreateCustomerDTO);
        toast({
          title: "Success",
          description: "Customer created successfully",
          variant: "success",
        });
      }
      setIsModalOpen(false);
      setEditingCustomer(null);
      await loadCustomersData();
    } catch (error) {
      console.error("Error saving customer:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save customer",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCustomer = async (customerId: number) => {
    try {
      await deleteCustomer(customerId);
      setShowDeleteConfirm(null);
      toast({
        title: "Success",
        description: "Customer deleted successfully",
        variant: "success",
      });
      await loadCustomersData();
    } catch (error) {
      console.error("Error deleting customer:", error);
      toast({
        title: "Error",
        description: "Failed to delete customer",
        variant: "destructive",
      });
    }
  };

  const handleRestoreCustomer = async (customerId: number) => {
    try {
      await restoreCustomer(customerId);
      setShowRestoreConfirm(null);
      toast({
        title: "Success",
        description: "Customer restored successfully",
        variant: "success",
      });
      await loadCustomersData();
    } catch (error) {
      console.error("Error restoring customer:", error);
      toast({
        title: "Error",
        description: "Failed to restore customer",
        variant: "destructive",
      });
    }
  };

  const handleViewCustomer = async (customerId: number) => {
    try {
      await getCustomerById(customerId);
      const customerToView = customers.find(
        (customer) => customer.id === customerId
      );
      if (customerToView) {
        setViewingCustomer(customerToView);
      }
    } catch (error) {
      console.error("Error loading customer details:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to load customer details",
        variant: "destructive",
      });
    }
  };

  const totalPages = Math.ceil(totalCustomers / pageSize);

  const getDebtBadgeVariant = (hasDebt: boolean, isOverdue: boolean) => {
    if (!hasDebt) return "secondary";
    if (isOverdue) return "destructive";
    return "default";
  };

  const formatDate = (date: string | undefined) => {
    if (!date) return "-";
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(date));
  };

  // Stats for dashboard-like cards
  const stats =
    viewMode === "deleted"
      ? [
          {
            title: "Deleted Customers",
            value: customers.length.toString(),
            icon: Users,
            color: "text-red-500",
            bgColor: "bg-red-500/10",
          },
        ]
      : [
          {
            title: "Total Customers",
            value: totalCustomers.toString(),
            icon: Users,
            color: "text-primary",
            bgColor: "bg-primary/10",
          },
          {
            title: "With Debts",
            value: customers
              .filter((c) => c.hasOutstandingDebt())
              .length.toString(),
            icon: DollarSign,
            color: "text-orange-500",
            bgColor: "bg-orange-500/10",
          },
          {
            title: "Overdue",
            value: customers
              .filter((c) => c.getOverdueDebts().length > 0)
              .length.toString(),
            icon: AlertTriangle,
            color: "text-red-500",
            bgColor: "bg-red-500/10",
          },
        ];

  return (
    <div className="space-y-6 min-w-0">
      {/* Header */}
      <Header
        title="Customer Management"
        description={
          currentUser?.isAdmin()
            ? "Manage customers and their debt information. Only administrators can create new customers."
            : "View customers and their information. Contact an administrator to create new customers."
        }
      >
        <div className="flex gap-2">
          <div className="flex items-center">
            <div className="flex rounded-lg border border-border bg-muted/50 p-1 shadow-sm">
              <button
                onClick={() => setViewMode("active")}
                className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                  viewMode === "active"
                    ? "bg-background text-foreground shadow-sm ring-1 ring-ring/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                }`}
              >
                <Users className="h-4 w-4" />
                Active Customers
              </button>
              <button
                onClick={() => setViewMode("deleted")}
                className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                  viewMode === "deleted"
                    ? "bg-background text-foreground shadow-sm ring-1 ring-ring/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                }`}
              >
                <AlertTriangle className="h-4 w-4" />
                Deleted Customers
              </button>
            </div>
          </div>
          {viewMode === "active" && (
            <HeaderButton
              onClick={handleAddCustomer}
              disabled={!currentUser?.isAdmin()}
              className={
                !currentUser?.isAdmin() ? "opacity-50 cursor-not-allowed" : ""
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Customer
              {!currentUser?.isAdmin() && (
                <span className="ml-2 text-xs">(Admin Only)</span>
              )}
            </HeaderButton>
          )}
        </div>
      </Header>

      {/* Admin Only Notice */}
      {!currentUser?.isAdmin() && (
        <HeaderNotice
          variant="warning"
          icon={<Users className="h-5 w-5" />}
          message="Admin Access Required: Only administrators can create, edit, or delete customers. You can view customer information but cannot make changes."
        />
      )}

      {/* Error Alert */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <p className="text-destructive">{error}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearError}
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <StatsGrid>
        {stats.map((stat) => (
          <StatsCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            bgColor={stat.bgColor}
          />
        ))}
      </StatsGrid>

      {/* Main Content */}
      <Card className="min-w-0">
        <CardHeader>
          <SearchSorts
            // Search props
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            onSearch={handleSearch}
            searchType={searchType}
            searchTypeOptions={[
              { value: "name", label: "Name" },
              { value: "email", label: "Email" },
              { value: "phone", label: "Phone" },
              { value: "address", label: "Address" },
            ]}
            onSearchTypeChange={(value) =>
              setSearchType(value as "name" | "email" | "phone" | "address")
            }
            showSearchType={viewMode === "active"}
            // Sort props
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortByChange={(value) => setSortBy(value as typeof sortBy)}
            onSortOrderChange={setSortOrder}
            sortOptions={[
              { value: "name", label: "Name" },
              { value: "email", label: "Email" },
              { value: "phone", label: "Phone" },
              { value: "address", label: "Address" },
              { value: "debtStatus", label: "Debt Status" },
              { value: "createdAt", label: "Created Date" },
              { value: "updatedAt", label: "Updated Date" },
            ]}
            getSortIcon={getSortIcon}
            // Filter props
            filterValue={viewMode === "active" ? debtFilter : undefined}
            filterOptions={
              viewMode === "active"
                ? [
                    { value: "ALL", label: "All Customers" },
                    { value: "WITH_DEBT", label: "With Debts" },
                    { value: "OVERDUE", label: "Overdue" },
                  ]
                : []
            }
            onFilterChange={
              viewMode === "active"
                ? (value) =>
                    handleDebtFilter(value as "ALL" | "WITH_DEBT" | "OVERDUE")
                : undefined
            }
            // Action props
            onRefresh={loadCustomersData}
            onExport={viewMode === "active" ? handleExport : undefined}
            isLoading={isLoading}
            showRefresh={true}
            showExport={viewMode === "active"}
            exportDisabled={isExportDisabled}
            // Filter indicators
            filterIndicators={filterIndicators.getFilters()}
            onClearAllFilters={handleClearAllFilters}
          />
        </CardHeader>

        <CardContent className="min-w-0">
          {isLoading && customers.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <CarPartsLoader size="md" text="Loading customers..." />
            </div>
          ) : (
            <DataTable
              data={customers}
              columns={getCustomerColumns({ getDebtBadgeVariant, formatDate })}
              actions={
                viewMode === "deleted"
                  ? getDeletedCustomerActions({
                      onViewCustomer: handleViewCustomer,
                      onRestoreCustomer: (customerId) =>
                        setShowRestoreConfirm(customerId),
                    })
                  : getCustomerActions({
                      onViewCustomer: handleViewCustomer,
                      onEditCustomer: handleEditCustomer,
                      onDeleteCustomer: (customerId) =>
                        setShowDeleteConfirm(customerId),
                    })
              }
              isLoading={isLoading}
              loadingText={
                viewMode === "deleted"
                  ? "Loading deleted customers..."
                  : "Loading customers..."
              }
              emptyText={
                viewMode === "deleted"
                  ? "No deleted customers found"
                  : "No customers found"
              }
              currentUser={currentUser}
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalCustomers}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
              getSortIcon={getSortIcon}
            />
          )}
        </CardContent>
      </Card>

      {/* Customer Modal */}
      <CustomerModal
        customer={editingCustomer}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCustomer(null);
        }}
        onSave={handleSaveCustomer}
        isLoading={isLoading}
        currentUser={currentUser}
        variant={modalVariant}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        title="Confirm Delete"
        message="Are you sure you want to delete this customer? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={() =>
          showDeleteConfirm && handleDeleteCustomer(showDeleteConfirm)
        }
      />

      {/* Restore Confirmation Modal */}
      <ConfirmModal
        isOpen={!!showRestoreConfirm}
        onClose={() => setShowRestoreConfirm(null)}
        title="Confirm Restore"
        message="Are you sure you want to restore this customer? The customer will be available again in the active customers list."
        confirmText="Restore"
        cancelText="Cancel"
        variant="default"
        onConfirm={() =>
          showRestoreConfirm && handleRestoreCustomer(showRestoreConfirm)
        }
      />

      {/* View Customer Modal */}
      <CustomerModal
        customer={viewingCustomer}
        isOpen={!!viewingCustomer}
        onClose={() => setViewingCustomer(null)}
        isLoading={isLoading}
        currentUser={currentUser}
        variant="view"
      />
    </div>
  );
}
