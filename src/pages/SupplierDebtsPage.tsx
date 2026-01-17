import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataTable } from "@/components/reassembledComps/data-table";
import {
  SearchSorts,
  StatsGrid,
  StatsCard,
  FilterIndicators,
  useFilterIndicators,
  ConfirmModal,
  Header,
  HeaderButton,
} from "@/components/reassembledComps";
import { Package, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { useSupplierDebtManagement } from "@/core/presentation/hooks/useSupplierDebtManagement";
import { getDebtsTableColumns } from "@/components/supplier-debts";
import { getDebtsRowActions } from "@/components/supplier-debts";
import { DebtsFormModal } from "@/components/supplier-debts";
import { SupplierDebt } from "@/core/domain/entities/SupplierDebt";
import {
  CreateSupplierDebtDTO,
  UpdateSupplierDebtDTO,
} from "@/core/application/dtos/SupplierDebtDTO";
import { useDateFormatter, useNumberFormatter } from "@/lib/i18n/formatters";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/core/presentation/hooks/useAuth";
import { useSupplierDebtExport } from "@/hooks/useExport";
import { useSupplierDebtDataLoader } from "@/hooks/useDataLoader";
import { Plus } from "lucide-react";
import CarPartsLoader from "@/components/reassembledComps/car-parts-loader";

export default function SupplierDebtsPage() {
  const { t } = useTranslation();
  const { formatDate } = useDateFormatter();
  const { formatCurrency } = useNumberFormatter();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const {
    debts,
    totalDebts: serverTotalDebts,
    isLoading,
    error,
    getList,
    searchDebtsBySupplierName,
    getByTransaction,
    getById,
    create,
    update,
    remove,
    settle,
    markAlertSent,
    clearError,
  } = useSupplierDebtManagement();

  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState<
    "supplierName" | "transactionId"
  >("supplierName");
  const [dueDateSearch, setDueDateSearch] = useState("");
  const [debtFilter, setDebtFilter] = useState<
    | "ALL"
    | "SETTLED"
    | "UNSETTLED"
    | "OVERDUE"
    | "ON_DUE_UNSETTLED"
    | "FAR_FROM_DUE_UNSETTLED"
  >("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [sortBy, setSortBy] = useState<
    "supplier" | "amount" | "dueDate" | "createdAt" | "updatedAt"
  >("dueDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalVariant, setModalVariant] = useState<"create" | "edit" | "view">(
    "create"
  );
  const [editingDebt, setEditingDebt] = useState<SupplierDebt | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(
    null
  );
  const [viewingDebt, setViewingDebt] = useState<SupplierDebt | null>(null);

  const filterIndicators = useFilterIndicators();

  // Export functionality
  const { handleExport, isExportDisabled } = useSupplierDebtExport(
    debts,
    currentUser
  );

  // Data loading functionality
  const { loadData } = useSupplierDebtDataLoader(
    getList,
    searchDebtsBySupplierName
  );

  // Handler for clearing due date filter
  const handleClearDueDate = useCallback(() => {
    setDueDateSearch("");
    setCurrentPage(1);
    filterIndicators.clearFilter("dueDate");
  }, [filterIndicators]);

  const loadDebtsData = useCallback(async () => {
    // Handle search by transaction ID (special case - opens modal)
    if (searchTerm.trim() && searchType === "transactionId") {
      try {
        const res = await getByTransaction(Number(searchTerm));
        setViewingDebt(res);
        setModalVariant("view");
        setIsModalOpen(true);
        setSearchTerm(""); // Clear search
      } catch (error) {
        // Error will be handled by the hook's error state
        console.error("Error fetching transaction:", error);
      }
      return;
    }

    // Handle due date search (only when filter is ALL)
    if (dueDateSearch && debtFilter === "ALL") {
      // Update filter indicators
      filterIndicators.addFilter(
        "dueDate",
        t("suppliers.debts.columns.dueDate"),
        dueDateSearch,
        handleClearDueDate
      );

      // Convert date to ISO 8601 format with time for precise day search
      // dueAfter: start of the selected day (00:00:00.000Z)
      // dueBefore: start of the next day (00:00:00.000Z) to capture the entire selected day
      const selectedDate = new Date(dueDateSearch);
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);

      const dueAfter = selectedDate.toISOString(); // e.g., "2026-02-12T00:00:00.000Z"
      const dueBefore = nextDay.toISOString(); // e.g., "2026-02-13T00:00:00.000Z"

      await getList({
        take: pageSize,
        skip: (currentPage - 1) * pageSize,
        dueBefore,
        dueAfter,
        sortBy,
        sortOrder,
      });
      return;
    } else {
      // Clear due date filter indicator if no date search
      filterIndicators.clearFilter("dueDate");
    }

    await loadData(
      searchTerm,
      searchType === "supplierName" ? "name" : searchType,
      debtFilter,
      currentPage,
      pageSize,
      sortBy,
      sortOrder
    );
  }, [
    loadData,
    getByTransaction,
    getList,
    currentPage,
    pageSize,
    searchTerm,
    searchType,
    dueDateSearch,
    debtFilter,
    sortBy,
    sortOrder,
    filterIndicators,
    handleClearDueDate,
    t,
  ]);

  // Load debts on component mount and when filters change
  useEffect(() => {
    loadDebtsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentPage,
    debtFilter,
    sortBy,
    sortOrder,
    searchTerm,
    searchType,
    dueDateSearch,
  ]);

  // Handle search form submission
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    await loadDebtsData();
  };

  // Handle debt filter change
  const handleDebtFilter = async (
    filter:
      | "ALL"
      | "SETTLED"
      | "UNSETTLED"
      | "OVERDUE"
      | "ON_DUE_UNSETTLED"
      | "FAR_FROM_DUE_UNSETTLED"
  ) => {
    setDebtFilter(filter);
    setCurrentPage(1);
    setSearchTerm("");

    // Update filter indicators
    if (filter !== "ALL") {
      filterIndicators.addFilter(
        "debt",
        t("suppliers.debts.status"),
        filter,
        () => handleClearDebt()
      );
    } else {
      filterIndicators.clearFilter("debt");
    }
  };

  // Handle clear functions
  const handleClearDebt = () => {
    setDebtFilter("ALL");
    setCurrentPage(1);
    filterIndicators.clearFilter("debt");
  };

  const handleClearAllFilters = () => {
    setSearchTerm("");
    setDueDateSearch("");
    setDebtFilter("ALL");
    setSortBy("dueDate");
    setSortOrder("desc");
    setCurrentPage(1);
    filterIndicators.clearAllFilters();
  };

  const handleSort = (field: string) => {
    const validFields = [
      "supplier",
      "amount",
      "dueDate",
      // "status",
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
    }
    setCurrentPage(1);
  };

  const getSortIcon = (field: string) => {
    const validFields = [
      "supplier",
      "amount",
      "dueDate",
      // "status",
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

  // Handler functions for consistency
  const handleAddDebt = () => {
    setEditingDebt(null);
    setModalVariant("create");
    setIsModalOpen(true);
  };

  const handleViewDebt = useCallback(
    async (debt: SupplierDebt) => {
      try {
        const debtToView = await getById(debt.id);
        setViewingDebt(debtToView);
        setModalVariant("view");
        setIsModalOpen(true);
      } catch (error) {
        console.error("Error loading debt details:", error);
        toast({
          title: t("common.error"),
          description: t("suppliers.debts.failedToLoadDebtDetails"),
          variant: "destructive",
        });
      }
    },
    [getById, toast, t]
  );

  const handleEditDebt = (debt: SupplierDebt) => {
    setEditingDebt(debt);
    setModalVariant("edit");
    setIsModalOpen(true);
  };

  const handleDeleteDebt = async (debtId: number) => {
    try {
      await remove(debtId);
      setShowDeleteConfirm(null);
      toast({
        title: t("common.success"),
        description: t("suppliers.debts.debtDeletedSuccessfully"),
        variant: "success",
      });
      await loadDebtsData();
    } catch (error) {
      console.error("Error deleting debt:", error);
      toast({
        title: t("common.error"),
        description: t("suppliers.debts.failedToDeleteDebt"),
        variant: "destructive",
      });
    }
  };

  const handleSaveDebt = async (
    debtData: CreateSupplierDebtDTO | UpdateSupplierDebtDTO
  ) => {
    try {
      if (editingDebt) {
        // Update existing debt
        await update(editingDebt.id, debtData as UpdateSupplierDebtDTO);
        toast({
          title: t("common.success"),
          description: t("suppliers.debts.debtUpdatedSuccessfully"),
          variant: "success",
        });
      } else {
        // Create new debt
        await create(debtData as CreateSupplierDebtDTO);
        toast({
          title: t("common.success"),
          description: t("suppliers.debts.debtCreatedSuccessfully"),
          variant: "success",
        });
      }
      setIsModalOpen(false);
      setEditingDebt(null);
      setViewingDebt(null);
      await loadDebtsData();
    } catch (error) {
      console.error("Error saving debt:", error);
      toast({
        title: t("common.error"),
        description:
          error instanceof Error
            ? error.message
            : t("suppliers.debts.failedToSaveDebt"),
        variant: "destructive",
      });
    }
  };

  const columns = useMemo(
    () =>
      getDebtsTableColumns({
        formatDate: (d: string | undefined) => (d ? formatDate(d) : "-"),
        formatCurrency: (a: number) => formatCurrency(a),
        t,
      }),
    [formatDate, formatCurrency, t]
  );

  const actions = useMemo(
    () =>
      getDebtsRowActions({
        onView: handleViewDebt,
        onEdit: handleEditDebt,
        onDelete: (d: SupplierDebt) => {
          setShowDeleteConfirm(d.id);
        },
        onSettle: async (d: SupplierDebt) => {
          try {
            await settle(d.id);
            toast({
              title: t("common.success"),
              description: t("suppliers.debts.debtSettledSuccessfully"),
              variant: "success",
            });
            await loadDebtsData();
          } catch (error) {
            console.error("Error settling debt:", error);
            toast({
              title: t("common.error"),
              description: t("suppliers.debts.failedToSettleDebt"),
              variant: "destructive",
            });
          }
        },
        onMarkAlertSent: async (d: SupplierDebt) => {
          try {
            await markAlertSent(d.id);
            toast({
              title: t("common.success"),
              description: t("suppliers.debts.alertMarkedSentSuccessfully"),
              variant: "success",
            });
            await loadDebtsData();
          } catch (error) {
            console.error("Error marking alert sent:", error);
            toast({
              title: t("common.error"),
              description: t("suppliers.debts.failedToMarkAlertSent"),
              variant: "destructive",
            });
          }
        },
        t,
      }),
    [handleViewDebt, settle, markAlertSent, loadDebtsData, toast, t]
  );

  const totalPages = Math.ceil(serverTotalDebts / pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Header
        title={t("suppliers.debts.title")}
        description={t("suppliers.debts.description")}
      >
        <div className="flex gap-2">
          <Button
            variant={debtFilter === "ALL" ? "default" : "outline"}
            onClick={() => handleDebtFilter("ALL")}
          >
            {t("common.all")}
          </Button>
          <Button
            variant={debtFilter === "OVERDUE" ? "default" : "outline"}
            onClick={() => handleDebtFilter("OVERDUE")}
          >
            {t("suppliers.overdue")}
          </Button>
          <Button
            variant={debtFilter === "UNSETTLED" ? "default" : "outline"}
            onClick={() => handleDebtFilter("UNSETTLED")}
          >
            {t("suppliers.unsettled")}
          </Button>
          <Button
            variant={debtFilter === "SETTLED" ? "default" : "outline"}
            onClick={() => handleDebtFilter("SETTLED")}
          >
            {t("suppliers.settled")}
          </Button>
          <Button
            variant={debtFilter === "ON_DUE_UNSETTLED" ? "default" : "outline"}
            onClick={() => handleDebtFilter("ON_DUE_UNSETTLED")}
          >
            {t("suppliers.onDueUnsettled")}
          </Button>
          <Button
            variant={
              debtFilter === "FAR_FROM_DUE_UNSETTLED" ? "default" : "outline"
            }
            onClick={() => handleDebtFilter("FAR_FROM_DUE_UNSETTLED")}
          >
            {t("suppliers.farFromDueUnsettled")}
          </Button>
          {/* <HeaderButton onClick={handleAddDebt}>
            <Plus className="mr-2 h-4 w-4" />
            {t("suppliers.debts.create")}
          </HeaderButton> */}
        </div>
      </Header>

      <StatsGrid>
        <StatsCard
          title={t("suppliers.debts.stats.total")}
          value={serverTotalDebts}
          icon={Package}
        />
        <StatsCard
          title={t("suppliers.debts.stats.overdue")}
          value={
            debts.filter(
              (d) => !d.isSettled && new Date(d.dueDate) < new Date()
            ).length
          }
          icon={Package}
        />
        <StatsCard
          title={t("suppliers.debts.stats.settled")}
          value={debts.filter((d) => d.isSettled).length}
          icon={Package}
        />
      </StatsGrid>

      <Card>
        <CardHeader>
          <CardTitle>{t("suppliers.debts.listTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <SearchSorts
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
              onSearch={handleSearch}
              showSearchType={true}
              searchType={searchType}
              onSearchTypeChange={(value: string) =>
                setSearchType(value as "supplierName" | "transactionId")
              }
              searchTypeOptions={[
                {
                  value: "supplierName",
                  label: t("suppliers.debts.searchTypes.supplierName"),
                },
                {
                  value: "transactionId",
                  label: t("suppliers.debts.searchTypes.transactionId"),
                },
              ]}
              searchDisabled={debtFilter !== "ALL"}
              sortBy={sortBy}
              onSortByChange={(value: string) =>
                setSortBy(
                  value as
                    | "supplier"
                    | "amount"
                    | "dueDate"
                    | "createdAt"
                    | "updatedAt"
                )
              }
              sortOptions={[
                {
                  value: "supplier",
                  label: t("suppliers.debts.columns.supplier"),
                },
                { value: "amount", label: t("suppliers.debts.columns.amount") },
                {
                  value: "dueDate",
                  label: t("suppliers.debts.columns.dueDate"),
                },
                // { value: "status", label: t("suppliers.debts.columns.status") },
                { value: "createdAt", label: t("common.createdAt") },
                { value: "updatedAt", label: t("common.updatedAt") },
              ]}
              sortOrder={sortOrder}
              onSortOrderChange={setSortOrder}
              onRefresh={loadDebtsData}
              onExport={handleExport}
              isLoading={isLoading}
              showRefresh={true}
              showExport={true}
              exportDisabled={isExportDisabled}
              // Filter props
              filterValue={debtFilter}
              filterOptions={[
                { value: "ALL", label: t("common.all") },
                { value: "SETTLED", label: t("suppliers.settled") },
                { value: "UNSETTLED", label: t("suppliers.unsettled") },
                { value: "OVERDUE", label: t("suppliers.overdue") },
                {
                  value: "ON_DUE_UNSETTLED",
                  label: t("suppliers.onDueUnsettled"),
                },
                {
                  value: "FAR_FROM_DUE_UNSETTLED",
                  label: t("suppliers.farFromDueUnsettled"),
                },
              ]}
              onFilterChange={(value) =>
                handleDebtFilter(
                  value as
                    | "ALL"
                    | "SETTLED"
                    | "UNSETTLED"
                    | "OVERDUE"
                    | "ON_DUE_UNSETTLED"
                    | "FAR_FROM_DUE_UNSETTLED"
                )
              }
            />
          </div>

          {/* Error Alert - shown near search box */}
          {error && (
            <div className="mb-4 p-4 border border-destructive/50 bg-destructive/10 rounded-lg">
              <div className="flex justify-between items-center">
                <p className="text-destructive text-sm">{error}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearError}
                  className="h-6 w-6 p-0"
                >
                  ×
                </Button>
              </div>
            </div>
          )}

          {/* Due Date Search - Only shown when filter is ALL */}
          {debtFilter === "ALL" && (
            <div className="mb-4 p-4 border rounded-lg bg-muted/50">
              <div className="flex-1 max-w-xs">
                <Label htmlFor="dueDate" className="mb-2 block">
                  {t("suppliers.debts.columns.dueDate")}
                </Label>
                <Input
                  className=" [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:brightness-0 [&::-webkit-calendar-picker-indicator]:contrast-100"
                  id="dueDate"
                  type="date"
                  value={dueDateSearch}
                  onChange={(e) => setDueDateSearch(e.target.value)}
                  placeholder={t("suppliers.debts.searchByDueDate")}
                />
              </div>
            </div>
          )}

          <FilterIndicators
            filters={filterIndicators.getFilters()}
            onClearAll={handleClearAllFilters}
          />

          {isLoading && debts.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <CarPartsLoader
                size="md"
                text={t("suppliers.debts.loadingDebts")}
              />
            </div>
          ) : (
            <DataTable
              data={debts}
              columns={columns}
              actions={actions}
              currentUser={currentUser}
              bypassAdminChecks={true}
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={serverTotalDebts}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              onSort={handleSort}
              getSortIcon={getSortIcon}
              isLoading={isLoading}
              loadingText={t("suppliers.debts.loadingDebts")}
              emptyText={t("suppliers.debts.noDebtsFound")}
            />
          )}
        </CardContent>
      </Card>

      <DebtsFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setModalVariant("create");
          setEditingDebt(null);
          setViewingDebt(null);
        }}
        onSubmit={handleSaveDebt}
        initialData={modalVariant === "view" ? viewingDebt : editingDebt}
        variant={modalVariant}
        isLoading={isLoading}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        title={t("suppliers.debts.confirmDelete")}
        message={t("suppliers.debts.deleteDebtConfirmation")}
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
        variant="destructive"
        onConfirm={() =>
          showDeleteConfirm && handleDeleteDebt(showDeleteConfirm)
        }
      />
    </div>
  );
}
