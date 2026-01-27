import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useStockManagement } from "../core/presentation/hooks/useStockManagement";
import { useAuth } from "../core/presentation/hooks/useAuth";
import { Stock } from "../core/domain/entities/Stock";
import { UpdateStockDTO } from "../core/application/dtos/StockDTO";
import {
  Package,
  AlertTriangle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import CarPartsLoader from "@/components/reassembledComps/car-parts-loader";
import {
  DataTable,
  ConfirmModal,
  Header,
  StatsCard,
  StatsGrid,
  SearchSorts,
  useFilterIndicators,
} from "@/components/reassembledComps";
import {
  getStockColumns,
  getStockActions,
  StockModal,
} from "@/components/stocks";
import { useToast } from "@/hooks/use-toast";
import { useDateFormatter } from "@/lib/i18n/formatters";

export default function Stocks() {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const { formatDate } = useDateFormatter();
  const {
    stocks,
    totalStocks,
    isLoading,
    error,
    getStocks,
    updateStock,
    deleteStock,
    getStocksWithRefillAlert,
    getLowStocks,
    getStockById,
    clearError,
  } = useStockManagement();

  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"ALL" | "LOW_STOCK" | "REFILL_ALERT">(
    "ALL"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [sortBy, setSortBy] = useState<
    "quantity" | "lastRefilled" | "createdAt" | "updatedAt"
  >("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalVariant, setModalVariant] = useState<"view" | "edit">("view");
  const [editingStock, setEditingStock] = useState<Stock | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(
    null
  );
  const [viewingStock, setViewingStock] = useState<Stock | null>(null);

  // Filter indicators hook
  const filterIndicators = useFilterIndicators();

  // Load stocks on component mount and when filters change
  useEffect(() => {
    loadStocksData();
  }, [currentPage, filter, sortBy, sortOrder]);

  const loadStocksData = async () => {
    try {
      const skip = (currentPage - 1) * pageSize;

      // Apply filters
      switch (filter) {
        case "LOW_STOCK":
          await getLowStocks(10); // threshold of 10
          break;
        case "REFILL_ALERT":
          await getStocksWithRefillAlert(pageSize, skip, sortBy, sortOrder);
          break;
        default:
          await getStocks({
            take: pageSize,
            skip,
            sortBy,
            sortOrder,
          });
      }
    } catch (error) {
      console.error("Error loading stocks:", error);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    // For now, search is handled by filtering the results
    // In the future, you might want to add a searchByItemName method
    await loadStocksData();
  };

  const handleFilterChange = async (
    newFilter: "ALL" | "LOW_STOCK" | "REFILL_ALERT"
  ) => {
    setFilter(newFilter);
    setCurrentPage(1);
    setSearchTerm("");

    // Update filter indicators
    if (newFilter !== "ALL") {
      filterIndicators.addFilter("filter", t("common.filter"), newFilter, () =>
        handleClearFilter()
      );
    } else {
      filterIndicators.clearFilter("filter");
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
    filterIndicators.clearFilter("search");
  };

  const handleClearFilter = () => {
    setFilter("ALL");
    setCurrentPage(1);
    filterIndicators.clearFilter("filter");
  };

  const handleClearSort = () => {
    setSortBy("createdAt");
    setSortOrder("desc");
    setCurrentPage(1);
    filterIndicators.clearFilter("sort");
  };

  const handleClearAllFilters = () => {
    setSearchTerm("");
    setFilter("ALL");
    setSortBy("createdAt");
    setSortOrder("desc");
    setCurrentPage(1);
    filterIndicators.clearAllFilters();
  };

  const handleSort = (field: string) => {
    const validFields = [
      "quantity",
      "lastRefilled",
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
        t("common.sort"),
        `${validField} (${sortOrder})`,
        () => handleClearSort()
      );
    }
    setCurrentPage(1);
  };

  // Update filter indicators when search term changes
  React.useEffect(() => {
    if (searchTerm.trim()) {
      filterIndicators.addFilter("search", "item", searchTerm, () =>
        handleClearSearch()
      );
    } else {
      filterIndicators.clearFilter("search");
    }
  }, [searchTerm]);

  const getSortIcon = (field: string) => {
    const validFields = [
      "quantity",
      "lastRefilled",
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

  const handleEditStock = (stock: Stock) => {
    setEditingStock(stock);
    setIsModalOpen(true);
    setModalVariant("edit");
  };

  const handleSaveStock = async (stockData: UpdateStockDTO) => {
    try {
      if (editingStock) {
        await updateStock(editingStock.id, stockData);
        toast({
          title: t("common.success"),
          description: t("stocks.stockUpdated"),
          variant: "success",
        });
      }
      setIsModalOpen(false);
      setEditingStock(null);
      await loadStocksData();
    } catch (error) {
      console.error("Error saving stock:", error);
      toast({
        title: t("common.error"),
        description:
          error instanceof Error
            ? error.message
            : t("stocks.failedToSaveStock"),
        variant: "destructive",
      });
    }
  };

  const handleDeleteStock = async (stockId: number) => {
    try {
      await deleteStock(stockId);
      setShowDeleteConfirm(null);
      toast({
        title: t("common.success"),
        description: t("stocks.stockDeleted"),
        variant: "success",
      });
      await loadStocksData();
    } catch (error) {
      console.error("Error deleting stock:", error);
      toast({
        title: t("common.error"),
        description: t("stocks.failedToDeleteStock"),
        variant: "destructive",
      });
    }
  };

  const handleViewStock = async (stockId: number) => {
    try {
      await getStockById(stockId);
      const stockToView = stocks.find((stock) => stock.id === stockId);
      if (stockToView) {
        setViewingStock(stockToView);
      }
    } catch (error) {
      console.error("Error loading stock details:", error);
      toast({
        title: t("common.error"),
        description:
          error instanceof Error
            ? error.message
            : t("stocks.failedToLoadStockDetails"),
        variant: "destructive",
      });
    }
  };

  const totalPages = Math.ceil(totalStocks / pageSize);

  // Calculate stats
  const lowStockCount = stocks.filter((stock) => stock.isLowStock(10)).length;
  const refillAlertCount = stocks.filter((stock) => stock.needsRefill()).length;
  const totalQuantity = stocks.reduce((sum, stock) => sum + stock.quantity, 0);

  // Stats for dashboard-like cards
  const stats = [
    {
      title: t("stocks.totalStocks"),
      value: totalStocks.toString(),
      icon: Package,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: t("stocks.totalQuantity"),
      value: totalQuantity.toString(),
      icon: RefreshCw,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: t("stocks.lowStock"),
      value: lowStockCount.toString(),
      icon: TrendingDown,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      title: t("stocks.refillNeeded"),
      value: refillAlertCount.toString(),
      icon: AlertTriangle,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
  ];

  // Filter stocks based on search term (client-side)
  const filteredStocks = searchTerm.trim()
    ? stocks.filter(
        (stock) =>
          stock.getItemName().toLowerCase().includes(searchTerm.toLowerCase()) ||
          stock.getItemBrand().toLowerCase().includes(searchTerm.toLowerCase()) ||
          stock.getItemType().toLowerCase().includes(searchTerm.toLowerCase())
      )
    : stocks;

  return (
    <div className="space-y-6 min-w-0">
      {/* Header */}
      <Header title={t("stocks.title")} description={t("stocks.description")}>
        {/* No add button for stocks - they're created with items */}
      </Header>

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
            showSearchType={false}
            searchPlaceholder={t("stocks.searchByItemName")}
            // Sort props
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortByChange={(value) => setSortBy(value as typeof sortBy)}
            onSortOrderChange={setSortOrder}
            sortOptions={[
              { value: "quantity", label: t("stocks.sortOptions.quantity") },
              {
                value: "lastRefilled",
                label: t("stocks.sortOptions.lastRefilled"),
              },
              {
                value: "createdAt",
                label: t("stocks.sortOptions.createdAt"),
              },
              {
                value: "updatedAt",
                label: t("stocks.sortOptions.updatedAt"),
              },
            ]}
            getSortIcon={getSortIcon}
            // Filter props
            filterValue={filter}
            filterOptions={[
              { value: "ALL", label: t("stocks.allStocks") },
              { value: "LOW_STOCK", label: t("stocks.lowStockFilter") },
              { value: "REFILL_ALERT", label: t("stocks.refillAlertFilter") },
            ]}
            onFilterChange={(value) =>
              handleFilterChange(value as "ALL" | "LOW_STOCK" | "REFILL_ALERT")
            }
            // Action props
            onRefresh={loadStocksData}
            isLoading={isLoading}
            showRefresh={true}
            showExport={false}
            // Filter indicators
            filterIndicators={filterIndicators.getFilters()}
            onClearAllFilters={handleClearAllFilters}
          />
        </CardHeader>

        <CardContent className="min-w-0">
          {isLoading && stocks.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <CarPartsLoader size="md" text={t("stocks.loadingStocks")} />
            </div>
          ) : (
            <DataTable
              data={filteredStocks}
              columns={getStockColumns({
                formatDate,
                t,
              })}
              actions={getStockActions({
                onViewStock: handleViewStock,
                onEditStock: handleEditStock,
                onDeleteStock: (stockId) => setShowDeleteConfirm(stockId),
                t,
              })}
              isLoading={isLoading}
              loadingText={t("stocks.loadingStocks")}
              emptyText={t("stocks.noStocksFound")}
              currentUser={currentUser}
              bypassAdminChecks={true}
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalStocks}
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

      {/* Stock Modal for editing */}
      <StockModal
        stock={editingStock}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingStock(null);
        }}
        onSave={handleSaveStock}
        isLoading={isLoading}
        currentUser={currentUser}
        variant={modalVariant}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        title={t("stocks.confirmDelete")}
        message={t("stocks.confirmDeleteMessage")}
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
        variant="destructive"
        onConfirm={() =>
          showDeleteConfirm && handleDeleteStock(showDeleteConfirm)
        }
      />

      {/* View Stock Modal */}
      <StockModal
        stock={viewingStock}
        isOpen={!!viewingStock}
        onClose={() => setViewingStock(null)}
        isLoading={isLoading}
        currentUser={currentUser}
        variant="view"
      />
    </div>
  );
}
