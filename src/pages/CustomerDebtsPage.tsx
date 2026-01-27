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
  Modal,
} from "@/components/reassembledComps";
import {
  Package,
  User,
  DollarSign,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  RefreshCw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { useCustomerDebtManagement } from "@/core/presentation/hooks/useCustomerDebtManagement";
import { getDebtsTableColumns } from "@/components/customer-debts";
import { getDebtsRowActions } from "@/components/customer-debts";
import { DebtsFormModal } from "@/components/customer-debts";
import { CustomerDebt } from "@/core/domain/entities/CustomerDebt";
import {
  CreateCustomerDebtDTO,
  UpdateCustomerDebtDTO,
} from "@/core/application/dtos/CustomerDebtDTO";
import { useDateFormatter, useNumberFormatter } from "@/lib/i18n/formatters";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/core/presentation/hooks/useAuth";
import { useCustomerDebtExport } from "@/hooks/useExport";
import { useCustomerDebtDataLoader } from "@/hooks/useDataLoader";
import CarPartsLoader from "@/components/reassembledComps/car-parts-loader";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type DebtType = "ALL" | "PURCHASE" | "CREDIT" | "EXCHANGE" | "REFUND";

export default function CustomerDebtsPage() {
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
    searchDebtsByCustomerName,
    searchDebtsByTransactionId,
    getById,
    create,
    update,
    remove,
    settle,
    markAlertSent,
    getPurchaseDebts,
    getCreditBalances,
    getExchangeDebts,
    getRefundAdjustments,
    // getSummaryByCustomer,
    clearError,
  } = useCustomerDebtManagement();

  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState<
    "customerName" | "transactionId" | "customerId"
  >("customerName");
  const [dueDateSearch, setDueDateSearch] = useState("");
  const [debtFilter, setDebtFilter] = useState<
    | "ALL"
    | "SETTLED"
    | "UNSETTLED"
    | "OVERDUE"
    | "ON_DUE_UNSETTLED"
    | "FAR_FROM_DUE_UNSETTLED"
  >("ALL");
  const [debtType, setDebtType] = useState<DebtType>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [sortBy, setSortBy] = useState<
    "customer" | "amount" | "dueDate" | "createdAt" | "updatedAt"
  >("dueDate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalVariant, setModalVariant] = useState<"create" | "edit" | "view">(
    "create"
  );
  const [editingDebt, setEditingDebt] = useState<CustomerDebt | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(
    null
  );
  const [viewingDebt, setViewingDebt] = useState<CustomerDebt | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [customerSummary, setCustomerSummary] = useState<Record<
    string,
    unknown
  > | null>(null);

  const [loadingSummary] = useState(false);

  const filterIndicators = useFilterIndicators();

  // Export functionality
  const { handleExport, isExportDisabled } = useCustomerDebtExport(
    debts,
    currentUser
  );

  // Data loading functionality
  const { loadData } = useCustomerDebtDataLoader(
    getList,
    searchDebtsByCustomerName,
    searchDebtsByTransactionId
  );

  // Handler for clearing due date filter
  const handleClearDueDate = useCallback(() => {
    setDueDateSearch("");
    setCurrentPage(1);
    filterIndicators.clearFilter("dueDate");
  }, [filterIndicators]);

  // const handleShowCustomerSummary = useCallback(
  //   async (customerId: number) => {
  //     try {
  //       setLoadingSummary(true);
  //       const summary = await getSummaryByCustomer(customerId);
  //       setCustomerSummary(summary as Record<string, unknown>);
  //       setShowSummaryModal(true);
  //     } catch (error) {
  //       console.error("Error loading customer summary:", error);
  //       toast({
  //         title: t("common.error"),
  //         description: "Failed to load customer debt summary",
  //         variant: "destructive",
  //       });
  //     } finally {
  //       setLoadingSummary(false);
  //     }
  //   },
  //   [getSummaryByCustomer, toast, t]
  // );

  const loadDebtsData = useCallback(async () => {
    // Handle search by customer ID (special case - shows summary)
    // if (searchTerm.trim() && searchType === "customerId") {
    //   await handleShowCustomerSummary(Number(searchTerm));
    //   setSearchTerm(""); // Clear search
    //   return;
    // }

    const skip = (currentPage - 1) * pageSize;

    // Handle due date search (only when filter is ALL and type is ALL)
    if (dueDateSearch && debtFilter === "ALL" && debtType === "ALL") {
      filterIndicators.addFilter(
        "dueDate",
        t("customers.debts.columns.dueDate"),
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
        skip,
        dueBefore,
        dueAfter,
        sortBy,
        sortOrder,
      });
      return;
    } else {
      filterIndicators.clearFilter("dueDate");
    }

    // Handle debt type filtering
    if (debtType !== "ALL") {
      switch (debtType) {
        case "PURCHASE":
          await getPurchaseDebts({
            take: pageSize,
            skip,
            sortBy,
            sortOrder,
          });
          break;
        case "CREDIT":
          await getCreditBalances({
            take: pageSize,
            skip,
            sortBy,
            sortOrder,
          });
          break;
        case "EXCHANGE":
          await getExchangeDebts({
            take: pageSize,
            skip,
            sortBy,
            sortOrder,
          });
          break;
        case "REFUND":
          await getRefundAdjustments({
            take: pageSize,
            skip,
            sortBy,
            sortOrder,
          });
          break;
      }
      return;
    }

    // Regular data loading
    await loadData(
      searchTerm,
      searchType === "customerName" ? "name" : searchType,
      debtFilter,
      currentPage,
      pageSize,
      sortBy,
      sortOrder
    );
  }, [
    loadData,
    getList,
    getPurchaseDebts,
    getCreditBalances,
    getExchangeDebts,
    getRefundAdjustments,
    currentPage,
    pageSize,
    searchTerm,
    searchType,
    dueDateSearch,
    debtFilter,
    debtType,
    sortBy,
    sortOrder,
    filterIndicators,
    handleClearDueDate,
    // handleShowCustomerSummary,
    t,
  ]);

  // Load debts on component mount and when filters change
  useEffect(() => {
    loadDebtsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentPage,
    debtFilter,
    debtType,
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
        t("customers.debts.status"),
        filter,
        () => handleClearDebt()
      );
    } else {
      filterIndicators.clearFilter("debt");
    }
  };

  // Handle debt type change
  const handleDebtTypeChange = (type: DebtType) => {
    setDebtType(type);
    setCurrentPage(1);
    setSearchTerm("");
    setDebtFilter("ALL");
    filterIndicators.clearAllFilters();
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
      "customer",
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
      "customer",
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
  const handleViewDebt = useCallback(
    async (debt: CustomerDebt) => {
      try {
        const debtToView = await getById(debt.id);
        setViewingDebt(debtToView);
        setModalVariant("view");
        setIsModalOpen(true);
      } catch (error) {
        console.error("Error loading debt details:", error);
        toast({
          title: t("common.error"),
          description: t("customers.debts.failedToLoadDebtDetails"),
          variant: "destructive",
        });
      }
    },
    [getById, toast, t]
  );

  const handleEditDebt = (debt: CustomerDebt) => {
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
        description: t("customers.debts.debtDeletedSuccessfully"),
        variant: "success",
      });
      await loadDebtsData();
    } catch (error) {
      console.error("Error deleting debt:", error);
      toast({
        title: t("common.error"),
        description: t("customers.debts.failedToDeleteDebt"),
        variant: "destructive",
      });
    }
  };

  const handleSaveDebt = async (
    debtData: CreateCustomerDebtDTO | UpdateCustomerDebtDTO
  ) => {
    try {
      if (editingDebt) {
        // Update existing debt
        await update(editingDebt.id, debtData as UpdateCustomerDebtDTO);
        toast({
          title: t("common.success"),
          description: t("customers.debts.debtUpdatedSuccessfully"),
          variant: "success",
        });
      } else {
        // Create new debt
        await create(debtData as CreateCustomerDebtDTO);
        toast({
          title: t("common.success"),
          description: t("customers.debts.debtCreatedSuccessfully"),
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
            : t("customers.debts.failedToSaveDebt"),
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
        onDelete: (d: CustomerDebt) => {
          setShowDeleteConfirm(d.id);
        },
        onSettle: async (d: CustomerDebt) => {
          try {
            await settle(d.id);
            toast({
              title: t("common.success"),
              description: t("customers.debts.debtSettledSuccessfully"),
              variant: "success",
            });
            await loadDebtsData();
          } catch (error) {
            console.error("Error settling debt:", error);
            toast({
              title: t("common.error"),
              description: t("customers.debts.failedToSettleDebt"),
              variant: "destructive",
            });
          }
        },
        onMarkAlertSent: async (d: CustomerDebt) => {
          try {
            await markAlertSent(d.id);
            toast({
              title: t("common.success"),
              description: t("customers.debts.alertMarkedSentSuccessfully"),
              variant: "success",
            });
            await loadDebtsData();
          } catch (error) {
            console.error("Error marking alert sent:", error);
            toast({
              title: t("common.error"),
              description: t("customers.debts.failedToMarkAlertSent"),
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
        title={t("customers.debts.title")}
        description={t("customers.debts.description")}
      />

      <StatsGrid>
        <StatsCard
          title={t("customers.debts.stats.total")}
          value={serverTotalDebts}
          icon={Package}
        />
        <StatsCard
          title={t("customers.debts.stats.overdue")}
          value={
            debts.filter(
              (d) => !d.isSettled && new Date(d.dueDate) < new Date()
            ).length
          }
          icon={Package}
        />
        <StatsCard
          title={t("customers.debts.stats.settled")}
          value={debts.filter((d) => d.isSettled).length}
          icon={Package}
        />
      </StatsGrid>

      {/* Debt Type Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>Debt Types</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs
            value={debtType}
            onValueChange={(v) => handleDebtTypeChange(v as DebtType)}
          >
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="ALL">
                <Package className="mr-2 h-4 w-4" />
                All Debts
              </TabsTrigger>
              <TabsTrigger value="PURCHASE">
                <TrendingUp className="mr-2 h-4 w-4" />
                Purchase Debts
              </TabsTrigger>
              <TabsTrigger value="CREDIT">
                <TrendingDown className="mr-2 h-4 w-4" />
                Credit Balances
              </TabsTrigger>
              <TabsTrigger value="EXCHANGE">
                <ArrowLeftRight className="mr-2 h-4 w-4" />
                Exchange Debts
              </TabsTrigger>
              <TabsTrigger value="REFUND">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refund Adjustments
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t("customers.debts.listTitle")}</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={debtFilter === "ALL" ? "default" : "outline"}
                size="sm"
                onClick={() => handleDebtFilter("ALL")}
              >
                {t("common.all")}
              </Button>
              <Button
                variant={debtFilter === "OVERDUE" ? "default" : "outline"}
                size="sm"
                onClick={() => handleDebtFilter("OVERDUE")}
              >
                {t("customers.overdue")}
              </Button>
              <Button
                variant={debtFilter === "UNSETTLED" ? "default" : "outline"}
                size="sm"
                onClick={() => handleDebtFilter("UNSETTLED")}
              >
                {t("customers.unsettled")}
              </Button>
              <Button
                variant={debtFilter === "SETTLED" ? "default" : "outline"}
                size="sm"
                onClick={() => handleDebtFilter("SETTLED")}
              >
                {t("customers.settled")}
              </Button>
            </div>
          </div>
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
                setSearchType(
                  value as "customerName" | "transactionId" | "customerId"
                )
              }
              searchTypeOptions={[
                {
                  value: "customerName",
                  label: t("customers.debts.searchTypes.customerName"),
                },
                {
                  value: "transactionId",
                  label: t("customers.debts.searchTypes.transactionId"),
                },
                // {
                //   value: "customerId",
                //   label: "Customer ID (Summary)",
                // },
              ]}
              searchDisabled={debtFilter !== "ALL" || debtType !== "ALL"}
              sortBy={sortBy}
              onSortByChange={(value: string) =>
                setSortBy(
                  value as
                    | "customer"
                    | "amount"
                    | "dueDate"
                    | "createdAt"
                    | "updatedAt"
                )
              }
              sortOptions={[
                {
                  value: "customer",
                  label: t("customers.debts.columns.customer"),
                },
                { value: "amount", label: t("customers.debts.columns.amount") },
                {
                  value: "dueDate",
                  label: t("customers.debts.columns.dueDate"),
                },
                // { value: "status", label: t("customers.debts.columns.status") },
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
                { value: "SETTLED", label: t("customers.settled") },
                { value: "UNSETTLED", label: t("customers.unsettled") },
                { value: "OVERDUE", label: t("customers.overdue") },
                {
                  value: "ON_DUE_UNSETTLED",
                  label: t("customers.onDueUnsettled"),
                },
                {
                  value: "FAR_FROM_DUE_UNSETTLED",
                  label: t("customers.farFromDueUnsettled"),
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

          {/* Due Date Search - Only shown when filter is ALL and type is ALL */}
          {debtFilter === "ALL" && debtType === "ALL" && (
            <div className="mb-4 p-4 border rounded-lg bg-muted/50">
              <div className="flex-1 max-w-xs">
                <Label htmlFor="dueDate" className="mb-2 block">
                  {t("customers.debts.columns.dueDate")}
                </Label>
                <Input
                  className=" [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:brightness-0 [&::-webkit-calendar-picker-indicator]:contrast-100"
                  id="dueDate"
                  type="date"
                  value={dueDateSearch}
                  onChange={(e) => setDueDateSearch(e.target.value)}
                  placeholder={t("customers.debts.searchByDueDate")}
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
                text={t("customers.debts.loadingDebts")}
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
              loadingText={t("customers.debts.loadingDebts")}
              emptyText={t("customers.debts.noDebtsFound")}
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
        title={t("customers.debts.confirmDelete")}
        message={t("customers.debts.deleteDebtConfirmation")}
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
        variant="destructive"
        onConfirm={() =>
          showDeleteConfirm && handleDeleteDebt(showDeleteConfirm)
        }
      />

      {/* Customer Summary Modal */}
      <Modal
        isOpen={showSummaryModal}
        onClose={() => {
          setShowSummaryModal(false);
          setCustomerSummary(null);
        }}
        title="Customer Debt Summary"
        maxWidth="max-w-2xl"
      >
        {loadingSummary ? (
          <div className="flex items-center justify-center h-32">
            <CarPartsLoader size="sm" text="Loading summary..." />
          </div>
        ) : customerSummary ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Customer</span>
                </div>
                <p className="text-lg font-semibold">
                  {String(customerSummary.customerName || "N/A")}
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Total Debt</span>
                </div>
                <p className="text-lg font-semibold">
                  {formatCurrency(Number(customerSummary.totalDebt || 0))}
                </p>
              </div>
            </div>

            {/* Add more summary details as needed */}
            <div className="text-sm text-muted-foreground">
              <pre className="bg-muted p-4 rounded-lg overflow-auto">
                {JSON.stringify(customerSummary, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <p className="text-center text-muted-foreground">
            No summary data available
          </p>
        )}
      </Modal>
    </div>
  );
}
