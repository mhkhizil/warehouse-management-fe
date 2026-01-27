import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useItemManagement } from "../core/presentation/hooks/useItemManagement";
import { useAuth } from "../core/presentation/hooks/useAuth";
import { Item } from "../core/domain/entities/Item";
import {
  CreateItemDTO,
  UpdateItemDTO,
} from "../core/application/dtos/ItemDTO";
import {
  Plus,
  Package,
  DollarSign,
  AlertTriangle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Tag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import CarPartsLoader from "@/components/reassembledComps/car-parts-loader";
import {
  DataTable,
  ConfirmModal,
  Header,
  HeaderButton,
  StatsCard,
  StatsGrid,
  SearchSorts,
  useFilterIndicators,
} from "@/components/reassembledComps";
import {
  getItemColumns,
  getItemActions,
  ItemModal,
} from "@/components/items";
import { useToast } from "@/hooks/use-toast";
import { useDateFormatter, useNumberFormatter } from "@/lib/i18n/formatters";

export default function Items() {
  const { t } = useTranslation();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const { formatDate } = useDateFormatter();
  const { formatCurrency } = useNumberFormatter();
  const {
    items,
    totalItems,
    isLoading,
    error,
    createItem,
    getItems,
    getEligibleParents,
    updateItem,
    deleteItem,
    searchItemsByName,
    searchItemsByBrand,
    searchItemsByType,
    getSellableItems,
    getItemById,
    clearError,
  } = useItemManagement();

  // State to store eligible parent items for parent selection in modal
  const [eligibleParentItems, setEligibleParentItems] = useState<Item[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState<"name" | "brand" | "type">(
    "name"
  );
  const [filter, setFilter] = useState<"ALL" | "SELLABLE" | "LOW_STOCK">("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [sortBy, setSortBy] = useState<
    "name" | "brand" | "type" | "price" | "createdAt" | "updatedAt"
  >("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalVariant, setModalVariant] = useState<"create" | "edit" | "view">(
    "create"
  );
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(
    null
  );
  const [viewingItem, setViewingItem] = useState<Item | null>(null);

  // Filter indicators hook
  const filterIndicators = useFilterIndicators();

  // Load items on component mount and when filters change
  useEffect(() => {
    loadItemsData();
  }, [currentPage, filter, sortBy, sortOrder, searchTerm]);

  const loadItemsData = async () => {
    try {
      const skip = (currentPage - 1) * pageSize;

      // If there's a search term, use search methods
      if (searchTerm.trim()) {
        switch (searchType) {
          case "name":
            await searchItemsByName(
              searchTerm,
              pageSize,
              skip,
              sortBy,
              sortOrder
            );
            break;
          case "brand":
            await searchItemsByBrand(
              searchTerm,
              pageSize,
              skip,
              sortBy,
              sortOrder
            );
            break;
          case "type":
            await searchItemsByType(
              searchTerm,
              pageSize,
              skip,
              sortBy,
              sortOrder
            );
            break;
          default:
            await searchItemsByName(
              searchTerm,
              pageSize,
              skip,
              sortBy,
              sortOrder
            );
        }
        return;
      }

      // Apply filters
      switch (filter) {
        case "SELLABLE":
          await getSellableItems(pageSize, skip, sortBy, sortOrder);
          break;
        case "LOW_STOCK":
          // Get items and filter for low stock (client-side filtering)
          await getItems({
            take: pageSize,
            skip,
            sortBy,
            sortOrder,
          });
          break;
        default:
          await getItems({
            take: pageSize,
            skip,
            sortBy,
            sortOrder,
          });
      }
    } catch (error) {
      console.error("Error loading items:", error);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    await loadItemsData();
  };

  const handleFilterChange = async (
    newFilter: "ALL" | "SELLABLE" | "LOW_STOCK"
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
      "name",
      "brand",
      "type",
      "price",
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
      "brand",
      "type",
      "price",
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

  const handleEditItem = async (item: Item) => {
    // Fetch eligible parent items (excludes the current item and its descendants to prevent circular references)
    try {
      const eligibleParents = await getEligibleParents(item.id);
      setEligibleParentItems(eligibleParents);
    } catch (err) {
      console.error("Error fetching eligible parent items:", err);
      setEligibleParentItems([]);
    }
    setEditingItem(item);
    setIsModalOpen(true);
    setModalVariant("edit");
  };

  const handleAddItem = async () => {
    // Fetch all eligible parent items (no exclusions needed for new items)
    try {
      const eligibleParents = await getEligibleParents();
      setEligibleParentItems(eligibleParents);
    } catch (err) {
      console.error("Error fetching eligible parent items:", err);
      setEligibleParentItems([]);
    }
    setEditingItem(null);
    setIsModalOpen(true);
    setModalVariant("create");
  };

  const handleSaveItem = async (itemData: CreateItemDTO | UpdateItemDTO) => {
    try {
      if (editingItem) {
        // Update existing item
        await updateItem(editingItem.id, itemData as UpdateItemDTO);
        toast({
          title: t("common.success"),
          description: t("items.itemUpdated"),
          variant: "success",
        });
      } else {
        // Create new item
        if (!itemData.name) {
          throw new Error(t("items.nameRequired"));
        }
        await createItem(itemData as CreateItemDTO);
        toast({
          title: t("common.success"),
          description: t("items.itemCreated"),
          variant: "success",
        });
      }
      setIsModalOpen(false);
      setEditingItem(null);
      await loadItemsData();
    } catch (error) {
      console.error("Error saving item:", error);
      toast({
        title: t("common.error"),
        description:
          error instanceof Error
            ? error.message
            : t("items.failedToSaveItem"),
        variant: "destructive",
      });
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    try {
      await deleteItem(itemId);
      setShowDeleteConfirm(null);
      toast({
        title: t("common.success"),
        description: t("items.itemDeleted"),
        variant: "success",
      });
      await loadItemsData();
    } catch (error) {
      console.error("Error deleting item:", error);
      toast({
        title: t("common.error"),
        description: t("items.failedToDeleteItem"),
        variant: "destructive",
      });
    }
  };

  const handleViewItem = async (itemId: number) => {
    try {
      await getItemById(itemId);
      const itemToView = items.find((item) => item.id === itemId);
      if (itemToView) {
        setViewingItem(itemToView);
      }
    } catch (error) {
      console.error("Error loading item details:", error);
      toast({
        title: t("common.error"),
        description:
          error instanceof Error
            ? error.message
            : t("items.failedToLoadItemDetails"),
        variant: "destructive",
      });
    }
  };

  const totalPages = Math.ceil(totalItems / pageSize);

  // Calculate stats
  const sellableCount = items.filter((item) => item.isSellable).length;
  const lowStockCount = items.filter((item) => item.isLowStock(10)).length;
  const refillNeededCount = items.filter((item) => item.needsRefill()).length;

  // Stats for dashboard-like cards
  const stats = [
    {
      title: t("items.totalItems"),
      value: totalItems.toString(),
      icon: Package,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: t("items.sellable"),
      value: sellableCount.toString(),
      icon: DollarSign,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: t("items.lowStock"),
      value: lowStockCount.toString(),
      icon: Tag,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
    },
    {
      title: t("items.refillNeeded"),
      value: refillNeededCount.toString(),
      icon: AlertTriangle,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
  ];

  return (
    <div className="space-y-6 min-w-0">
      {/* Header */}
      <Header title={t("items.title")} description={t("items.description")}>
        <HeaderButton onClick={handleAddItem}>
          <Plus className="mr-2 h-4 w-4" />
          {t("items.addItem")}
        </HeaderButton>
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
            searchType={searchType}
            searchTypeOptions={[
              { value: "name", label: t("items.searchTypes.name") },
              { value: "brand", label: t("items.searchTypes.brand") },
              { value: "type", label: t("items.searchTypes.type") },
            ]}
            onSearchTypeChange={(value) =>
              setSearchType(value as "name" | "brand" | "type")
            }
            showSearchType={true}
            // Sort props
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortByChange={(value) => setSortBy(value as typeof sortBy)}
            onSortOrderChange={setSortOrder}
            sortOptions={[
              { value: "name", label: t("items.sortOptions.name") },
              { value: "brand", label: t("items.sortOptions.brand") },
              { value: "type", label: t("items.sortOptions.type") },
              { value: "price", label: t("items.sortOptions.price") },
              {
                value: "createdAt",
                label: t("items.sortOptions.createdAt"),
              },
              {
                value: "updatedAt",
                label: t("items.sortOptions.updatedAt"),
              },
            ]}
            getSortIcon={getSortIcon}
            // Filter props
            filterValue={filter}
            filterOptions={[
              { value: "ALL", label: t("items.allItems") },
              { value: "SELLABLE", label: t("items.sellableFilter") },
              { value: "LOW_STOCK", label: t("items.lowStockFilter") },
            ]}
            onFilterChange={(value) =>
              handleFilterChange(value as "ALL" | "SELLABLE" | "LOW_STOCK")
            }
            // Action props
            onRefresh={loadItemsData}
            isLoading={isLoading}
            showRefresh={true}
            showExport={false}
            // Filter indicators
            filterIndicators={filterIndicators.getFilters()}
            onClearAllFilters={handleClearAllFilters}
          />
        </CardHeader>

        <CardContent className="min-w-0">
          {isLoading && items.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <CarPartsLoader size="md" text={t("items.loadingItems")} />
            </div>
          ) : (
            <DataTable
              data={items}
              columns={getItemColumns({
                formatDate,
                formatCurrency,
                t,
              })}
              actions={getItemActions({
                onViewItem: handleViewItem,
                onEditItem: handleEditItem,
                onDeleteItem: (itemId) => setShowDeleteConfirm(itemId),
                t,
              })}
              isLoading={isLoading}
              loadingText={t("items.loadingItems")}
              emptyText={t("items.noItemsFound")}
              currentUser={currentUser}
              bypassAdminChecks={true}
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
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

      {/* Item Modal */}
      <ItemModal
        item={editingItem}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
          setEligibleParentItems([]);
        }}
        onSave={handleSaveItem}
        isLoading={isLoading}
        currentUser={currentUser}
        variant={modalVariant}
        availableParentItems={eligibleParentItems}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        title={t("items.confirmDelete")}
        message={t("items.confirmDeleteMessage")}
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
        variant="destructive"
        onConfirm={() =>
          showDeleteConfirm && handleDeleteItem(showDeleteConfirm)
        }
      />

      {/* View Item Modal */}
      <ItemModal
        item={viewingItem}
        isOpen={!!viewingItem}
        onClose={() => setViewingItem(null)}
        isLoading={isLoading}
        currentUser={currentUser}
        variant="view"
      />
    </div>
  );
}
