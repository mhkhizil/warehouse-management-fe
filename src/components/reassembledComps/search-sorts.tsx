import React, { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "./select";
import { Search } from "./search";
import { FilterIndicators } from "./filter-indicators";
import { ArrowUp, ArrowDown, RefreshCw, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import CarPartsLoader from "./car-parts-loader";

interface SortOption {
  value: string;
  label: string;
}

interface FilterOption {
  value: string;
  label: string;
}

interface SearchSortsProps {
  // Search props
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearch?: (e: React.FormEvent) => void;
  searchPlaceholder?: string;
  searchType?: string;
  searchTypeOptions?: readonly { value: string; label: string }[];
  onSearchTypeChange?: (value: string) => void;
  showSearchType?: boolean;

  // Sort props
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSortByChange: (value: string) => void;
  onSortOrderChange: (order: "asc" | "desc") => void;
  sortOptions: readonly SortOption[];
  getSortIcon?: (field: string) => ReactNode;

  // Filter props
  filterValue?: string;
  filterOptions?: readonly FilterOption[];
  onFilterChange?: (value: string) => void;
  filterPlaceholder?: string;

  // Action props
  onRefresh?: () => void;
  onExport?: () => void;
  isLoading?: boolean;
  showRefresh?: boolean;
  showExport?: boolean;
  exportDisabled?: boolean;

  // Filter indicators
  filterIndicators?: {
    key: string;
    label: string;
    value: string;
    onClear: () => void;
  }[];
  onClearAllFilters?: () => void;

  // Layout props
  className?: string;
  searchClassName?: string;
  controlsClassName?: string;
}

export function SearchSorts({
  // Search props
  searchValue,
  onSearchChange,
  onSearch,
  searchPlaceholder,
  searchType,
  searchTypeOptions = [],
  onSearchTypeChange,
  showSearchType = false,

  // Sort props
  sortBy,
  sortOrder,
  onSortByChange,
  onSortOrderChange,
  sortOptions,
  getSortIcon,

  // Filter props
  filterValue,
  filterOptions = [],
  onFilterChange,
  filterPlaceholder,

  // Action props
  onRefresh,
  onExport,
  isLoading = false,
  showRefresh = true,
  showExport = false,
  exportDisabled = false,

  // Filter indicators
  filterIndicators = [],
  onClearAllFilters,

  // Layout props
  className,
  searchClassName,
  controlsClassName,
}: SearchSortsProps) {
  const hasActiveFilters = filterIndicators.length > 0;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Filter Indicators */}
      {hasActiveFilters && (
        <FilterIndicators
          filters={filterIndicators}
          onClearAll={onClearAllFilters}
        />
      )}

      {/* Search and Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <Search
          value={searchValue}
          onChange={onSearchChange}
          onSearch={onSearch}
          placeholder={searchPlaceholder}
          searchType={searchType}
          searchTypeOptions={searchTypeOptions}
          onSearchTypeChange={onSearchTypeChange}
          showSearchType={showSearchType}
          className={searchClassName}
        />

        {/* Controls */}
        <div className={cn("flex gap-2", controlsClassName)}>
          {/* Filter */}
          {filterOptions.length > 0 && onFilterChange && (
            <Select
              value={filterValue || filterOptions[0]?.value}
              onValueChange={onFilterChange}
              options={filterOptions}
              placeholder={filterPlaceholder}
            />
          )}

          {/* Sort Controls */}
          <div className="flex gap-1 items-center">
            <span className="text-sm text-muted-foreground whitespace-nowrap">
              Sort by:
            </span>
            <Select
              value={sortBy}
              onValueChange={onSortByChange}
              options={sortOptions}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onSortOrderChange(sortOrder === "asc" ? "desc" : "asc")
              }
              title={`Sort ${sortOrder === "asc" ? "Descending" : "Ascending"}`}
            >
              {getSortIcon ? (
                getSortIcon(sortBy)
              ) : sortOrder === "asc" ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Refresh */}
          {showRefresh && onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
            >
              {isLoading ? (
                <CarPartsLoader size="xs" variant="inline" showText={false} />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
          )}

          {/* Export */}
          {showExport && onExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              disabled={exportDisabled}
              className={exportDisabled ? "opacity-50 cursor-not-allowed" : ""}
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Hook for managing search and sort state
interface UseSearchSortsProps {
  initialSearchValue?: string;
  initialSearchType?: string;
  initialSortBy?: string;
  initialSortOrder?: "asc" | "desc";
  initialFilterValue?: string;
}

export function useSearchSorts({
  initialSearchValue = "",
  initialSearchType = "",
  initialSortBy = "",
  initialSortOrder = "desc",
  initialFilterValue = "",
}: UseSearchSortsProps = {}) {
  const [searchValue, setSearchValue] = React.useState(initialSearchValue);
  const [searchType, setSearchType] = React.useState(initialSearchType);
  const [sortBy, setSortBy] = React.useState(initialSortBy);
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">(
    initialSortOrder
  );
  const [filterValue, setFilterValue] = React.useState(initialFilterValue);

  const resetSearch = React.useCallback(() => {
    setSearchValue("");
  }, []);

  const resetSort = React.useCallback(() => {
    setSortBy(initialSortBy);
    setSortOrder(initialSortOrder);
  }, [initialSortBy, initialSortOrder]);

  const resetFilter = React.useCallback(() => {
    setFilterValue(initialFilterValue);
  }, [initialFilterValue]);

  const resetAll = React.useCallback(() => {
    resetSearch();
    resetSort();
    resetFilter();
  }, [resetSearch, resetSort, resetFilter]);

  return {
    // State
    searchValue,
    searchType,
    sortBy,
    sortOrder,
    filterValue,

    // Setters
    setSearchValue,
    setSearchType,
    setSortBy,
    setSortOrder,
    setFilterValue,

    // Resetters
    resetSearch,
    resetSort,
    resetFilter,
    resetAll,
  };
}
