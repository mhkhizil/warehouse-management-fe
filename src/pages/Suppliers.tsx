import React, { useState, useEffect } from "react";
import { useSupplierManagement } from "../core/presentation/hooks/useSupplierManagement";
import { useAuth } from "../core/presentation/hooks/useAuth";
import { Supplier } from "../core/domain/entities/Supplier";
import {
  CreateSupplierDTO,
  UpdateSupplierDTO,
} from "../core/application/dtos/SupplierDTO";
import {
  Plus,
  Building2,
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
  getSupplierColumns,
  getSupplierActions,
  getDeletedSupplierActions,
  SupplierModal,
} from "@/components/suppliers";
import { useToast } from "@/hooks/use-toast";
import { useSupplierExport } from "@/hooks/useExport";
import { useSupplierDataLoader } from "@/hooks/useDataLoader";

export default function Suppliers() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const {
    suppliers,
    totalSuppliers,
    isLoading,
    error,
    createSupplier,
    getSuppliers,
    updateSupplier,
    deleteSupplier,
    restoreSupplier,
    searchSuppliersByName,
    searchSuppliersByEmail,
    searchSuppliersByPhone,
    searchSuppliersByAddress,
    searchSuppliersByContactPerson,
    getSuppliersWithDebts,
    getSuppliersWithOverdueDebts,
    getDeletedSuppliers,
    getSupplierById,
    clearError,
  } = useSupplierManagement();

  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState<
    "name" | "email" | "phone" | "address" | "contactPerson"
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
    | "contactPerson"
    | "debtStatus"
    | "createdAt"
    | "updatedAt"
  >("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalVariant, setModalVariant] = useState<"create" | "edit" | "view">(
    "create"
  );
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(
    null
  );
  const [showRestoreConfirm, setShowRestoreConfirm] = useState<number | null>(
    null
  );
  const [viewingSupplier, setViewingSupplier] = useState<Supplier | null>(null);

  // Filter indicators hook
  const filterIndicators = useFilterIndicators();

  // Export functionality
  const { handleExport, isExportDisabled } = useSupplierExport(
    suppliers,
    currentUser
  );

  // Data loading functionality
  const { loadData } = useSupplierDataLoader(
    searchSuppliersByName,
    searchSuppliersByEmail,
    searchSuppliersByPhone,
    searchSuppliersByAddress,
    searchSuppliersByContactPerson,
    getSuppliersWithDebts,
    getSuppliersWithOverdueDebts,
    getDeletedSuppliers,
    getSuppliers
  );

  // Load suppliers on component mount and when filters change
  useEffect(() => {
    loadSuppliersData();
  }, [currentPage, debtFilter, sortBy, sortOrder, searchTerm, viewMode]);

  const loadSuppliersData = async () => {
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
    await loadSuppliersData();
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

  const handleEditSupplier = (supplier: Supplier) => {
    if (!currentUser?.isAdmin()) {
      toast({
        title: "Access Denied",
        description: "Only administrators can edit suppliers",
        variant: "destructive",
      });
      return;
    }
    setEditingSupplier(supplier);
    setIsModalOpen(true);
    setModalVariant("edit");
  };

  const handleAddSupplier = () => {
    // Check if current user is admin
    if (!currentUser?.isAdmin()) {
      toast({
        title: "Access Denied",
        description: "Only administrators can create new suppliers",
        variant: "destructive",
      });
      return;
    }
    setEditingSupplier(null);
    setIsModalOpen(true);
    setModalVariant("create");
  };

  const handleSaveSupplier = async (
    supplierData: CreateSupplierDTO | UpdateSupplierDTO
  ) => {
    try {
      if (editingSupplier) {
        // Update existing supplier
        await updateSupplier(
          editingSupplier.id,
          supplierData as UpdateSupplierDTO
        );
        toast({
          title: "Success",
          description: "Supplier updated successfully",
          variant: "success",
        });
      } else {
        // Create new supplier
        if (!supplierData.name || !supplierData.email) {
          throw new Error("Name and email are required");
        }
        await createSupplier(supplierData as CreateSupplierDTO);
        toast({
          title: "Success",
          description: "Supplier created successfully",
          variant: "success",
        });
      }
      setIsModalOpen(false);
      setEditingSupplier(null);
      await loadSuppliersData();
    } catch (error) {
      console.error("Error saving supplier:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to save supplier",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSupplier = async (supplierId: number) => {
    try {
      await deleteSupplier(supplierId);
      setShowDeleteConfirm(null);
      toast({
        title: "Success",
        description: "Supplier deleted successfully",
        variant: "success",
      });
      await loadSuppliersData();
    } catch (error) {
      console.error("Error deleting supplier:", error);
      toast({
        title: "Error",
        description: "Failed to delete supplier",
        variant: "destructive",
      });
    }
  };

  const handleRestoreSupplier = async (supplierId: number) => {
    try {
      await restoreSupplier(supplierId);
      setShowRestoreConfirm(null);
      toast({
        title: "Success",
        description: "Supplier restored successfully",
        variant: "success",
      });
      await loadSuppliersData();
    } catch (error) {
      console.error("Error restoring supplier:", error);
      toast({
        title: "Error",
        description: "Failed to restore supplier",
        variant: "destructive",
      });
    }
  };

  const handleViewSupplier = async (supplierId: number) => {
    try {
      await getSupplierById(supplierId);
      const supplierToView = suppliers.find(
        (supplier) => supplier.id === supplierId
      );
      if (supplierToView) {
        setViewingSupplier(supplierToView);
      }
    } catch (error) {
      console.error("Error loading supplier details:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to load supplier details",
        variant: "destructive",
      });
    }
  };

  const totalPages = Math.ceil(totalSuppliers / pageSize);

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
            title: "Deleted Suppliers",
            value: suppliers.length.toString(),
            icon: Building2,
            color: "text-red-500",
            bgColor: "bg-red-500/10",
          },
        ]
      : [
          {
            title: "Total Suppliers",
            value: totalSuppliers.toString(),
            icon: Building2,
            color: "text-primary",
            bgColor: "bg-primary/10",
          },
          {
            title: "With Debts",
            value: suppliers
              .filter((s) => s.hasOutstandingDebt())
              .length.toString(),
            icon: DollarSign,
            color: "text-orange-500",
            bgColor: "bg-orange-500/10",
          },
          {
            title: "Overdue",
            value: suppliers
              .filter((s) => s.getOverdueDebts().length > 0)
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
        title="Supplier Management"
        description={
          currentUser?.isAdmin()
            ? "Manage suppliers and their debt information. Only administrators can create new suppliers."
            : "View suppliers and their information. Contact an administrator to create new suppliers."
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
                <Building2 className="h-4 w-4" />
                Active Suppliers
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
                Deleted Suppliers
              </button>
            </div>
          </div>
          {viewMode === "active" && (
            <HeaderButton
              onClick={handleAddSupplier}
              disabled={!currentUser?.isAdmin()}
              className={
                !currentUser?.isAdmin() ? "opacity-50 cursor-not-allowed" : ""
              }
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Supplier
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
          icon={<Building2 className="h-5 w-5" />}
          message="Admin Access Required: Only administrators can create, edit, or delete suppliers. You can view supplier information but cannot make changes."
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
                    { value: "ALL", label: "All Suppliers" },
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
            onRefresh={loadSuppliersData}
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
          {isLoading && suppliers.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <CarPartsLoader size="md" text="Loading suppliers..." />
            </div>
          ) : (
            <DataTable
              data={suppliers}
              columns={getSupplierColumns({ getDebtBadgeVariant, formatDate })}
              actions={
                viewMode === "deleted"
                  ? getDeletedSupplierActions({
                      onViewSupplier: handleViewSupplier,
                      onRestoreSupplier: (supplierId: number) =>
                        setShowRestoreConfirm(supplierId),
                    })
                  : getSupplierActions({
                      onViewSupplier: handleViewSupplier,
                      onEditSupplier: handleEditSupplier,
                      onDeleteSupplier: (supplierId: number) =>
                        setShowDeleteConfirm(supplierId),
                    })
              }
              isLoading={isLoading}
              loadingText={
                viewMode === "deleted"
                  ? "Loading deleted suppliers..."
                  : "Loading suppliers..."
              }
              emptyText={
                viewMode === "deleted"
                  ? "No deleted suppliers found"
                  : "No suppliers found"
              }
              currentUser={currentUser}
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalSuppliers}
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

      {/* Supplier Modal */}
      <SupplierModal
        supplier={editingSupplier}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSupplier(null);
        }}
        onSave={handleSaveSupplier}
        isLoading={isLoading}
        currentUser={currentUser}
        variant={modalVariant}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        title="Confirm Delete"
        message="Are you sure you want to delete this supplier? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={() =>
          showDeleteConfirm && handleDeleteSupplier(showDeleteConfirm)
        }
      />

      {/* Restore Confirmation Modal */}
      <ConfirmModal
        isOpen={!!showRestoreConfirm}
        onClose={() => setShowRestoreConfirm(null)}
        title="Confirm Restore"
        message="Are you sure you want to restore this supplier? The supplier will be available again in the active suppliers list."
        confirmText="Restore"
        cancelText="Cancel"
        variant="default"
        onConfirm={() =>
          showRestoreConfirm && handleRestoreSupplier(showRestoreConfirm)
        }
      />

      {/* View Supplier Modal */}
      <SupplierModal
        supplier={viewingSupplier}
        isOpen={!!viewingSupplier}
        onClose={() => setViewingSupplier(null)}
        isLoading={isLoading}
        currentUser={currentUser}
        variant="view"
      />
    </div>
  );
}
