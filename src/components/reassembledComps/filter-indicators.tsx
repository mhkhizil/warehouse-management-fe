import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FilterIndicator {
  key: string;
  label: string;
  value: string;
  onClear: () => void;
}

interface FilterIndicatorsProps {
  filters: FilterIndicator[];
  onClearAll?: () => void;
  showClearAll?: boolean;
  clearAllText?: string;
  className?: string;
}

export function FilterIndicators({
  filters,
  onClearAll,
  showClearAll = true,
  clearAllText = "Clear all",
  className,
}: FilterIndicatorsProps) {
  if (filters.length === 0) return null;

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-2",
        className
      )}
    >
      <span>Active filters:</span>
      {filters.map((filter) => (
        <Badge
          key={filter.key}
          variant="secondary"
          className="text-xs flex items-center gap-1"
        >
          {filter.label}: {filter.value}
          <button
            onClick={filter.onClear}
            className="ml-1 hover:text-destructive transition-colors"
            title={`Clear ${filter.label} filter`}
          >
            ×
          </button>
        </Badge>
      ))}
      {showClearAll && onClearAll && (
        <Button
          variant="ghost"
          size="sm"
          className="h-5 px-2 text-xs"
          onClick={onClearAll}
        >
          {clearAllText}
        </Button>
      )}
    </div>
  );
}

interface FilterIndicatorBuilder {
  addFilter: (
    key: string,
    label: string,
    value: string,
    onClear: () => void
  ) => void;
  clearFilter: (key: string) => void;
  clearAllFilters: () => void;
  getFilters: () => FilterIndicator[];
  hasFilters: () => boolean;
}

export function useFilterIndicators(): FilterIndicatorBuilder {
  const [filters, setFilters] = React.useState<FilterIndicator[]>([]);

  const addFilter = React.useCallback(
    (key: string, label: string, value: string, onClear: () => void) => {
      setFilters((prev) => {
        const existing = prev.find((f) => f.key === key);
        if (existing) {
          return prev.map((f) =>
            f.key === key ? { key, label, value, onClear } : f
          );
        }
        return [...prev, { key, label, value, onClear }];
      });
    },
    []
  );

  const clearFilter = React.useCallback((key: string) => {
    setFilters((prev) => prev.filter((f) => f.key !== key));
  }, []);

  const clearAllFilters = React.useCallback(() => {
    setFilters([]);
  }, []);

  const getFilters = React.useCallback(() => filters, [filters]);

  const hasFilters = React.useCallback(() => filters.length > 0, [filters]);

  return {
    addFilter,
    clearFilter,
    clearAllFilters,
    getFilters,
    hasFilters,
  };
}
