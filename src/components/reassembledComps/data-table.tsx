import React, { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

// Types for the data table
export interface Column<T> {
  key: string;
  header: string;
  sortable?: boolean;
  render?: (item: T) => ReactNode;
  className?: string;
}

export interface Action<T> {
  label: string;
  icon?: React.ElementType;
  onClick: (item: T) => void;
  disabled?: (item: T) => boolean;
  variant?: "default" | "destructive" | "secondary";
  adminOnly?: boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  actions?: Action<T>[];
  isLoading?: boolean;
  loadingText?: string;
  emptyText?: string;
  currentUser?: { isAdmin?: () => boolean } | null;
  // Pagination
  currentPage?: number;
  totalPages?: number;
  totalItems?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  // Sorting
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (field: string) => void;
  getSortIcon?: (field: string) => ReactNode;
  // Actions
  onView?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  // Custom renderers
  renderAvatar?: (item: T) => ReactNode;
  renderStatus?: (item: T) => ReactNode;
  renderDate?: (date: Date | string | undefined) => string;
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  actions = [],
  isLoading = false,
  loadingText = "Loading...",
  emptyText = "No data found",
  currentUser,
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange,
  // sortBy,
  // sortOrder,
  onSort,
  getSortIcon,
  onView,
  onEdit,
  onDelete,
  renderAvatar,
  renderStatus,
  renderDate,
}: DataTableProps<T>) {
  const handleSort = (field: string) => {
    if (onSort) {
      onSort(field);
    }
  };

  const handlePageChange = (page: number) => {
    if (onPageChange) {
      onPageChange(page);
    }
  };

  const renderCell = (item: T, column: Column<T>) => {
    if (column.render) {
      return column.render(item);
    }

    // Default rendering based on column key
    const value = (item as Record<string, unknown>)[column.key];

    if (column.key === "avatar" && renderAvatar) {
      return renderAvatar(item);
    }

    if (column.key === "status" && renderStatus) {
      return renderStatus(item);
    }

    if (column.key.includes("Date") && renderDate) {
      return renderDate(value as string | Date | undefined);
    }

    if (typeof value === "boolean") {
      return (
        <Badge variant={value ? "default" : "secondary"}>
          {value ? "Yes" : "No"}
        </Badge>
      );
    }

    return (value as ReactNode) || "-";
  };

  if (isLoading && data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{loadingText}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key} className={column.className}>
                {column.sortable ? (
                  <button
                    className="flex items-center gap-2 hover:text-primary transition-colors"
                    onClick={() => handleSort(column.key)}
                  >
                    {column.header}
                    {getSortIcon && getSortIcon(column.key)}
                  </button>
                ) : (
                  column.header
                )}
              </TableHead>
            ))}
            {(actions.length > 0 || onView || onEdit || onDelete) && (
              <TableHead className="w-[100px]">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={
                  columns.length +
                  (actions.length > 0 || onView || onEdit || onDelete ? 1 : 0)
                }
                className="h-32 text-center text-muted-foreground"
              >
                {emptyText}
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow key={item.id}>
                {columns.map((column) => (
                  <TableCell key={column.key} className={column.className}>
                    {renderCell(item, column)}
                  </TableCell>
                ))}
                {(actions.length > 0 || onView || onEdit || onDelete) && (
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {/* Default actions */}
                        {onView && (
                          <DropdownMenuItem onClick={() => onView(item)}>
                            View
                          </DropdownMenuItem>
                        )}
                        {onEdit && (
                          <DropdownMenuItem
                            onClick={() => onEdit(item)}
                            disabled={
                              currentUser ? !currentUser.isAdmin?.() : false
                            }
                            className={
                              currentUser && !currentUser.isAdmin?.()
                                ? "opacity-50 cursor-not-allowed"
                                : ""
                            }
                          >
                            Edit
                            {currentUser && !currentUser.isAdmin?.() && (
                              <span className="ml-auto text-xs">
                                (Admin Only)
                              </span>
                            )}
                          </DropdownMenuItem>
                        )}
                        {onDelete && (
                          <DropdownMenuItem
                            onClick={() => onDelete(item)}
                            disabled={
                              currentUser ? !currentUser.isAdmin?.() : false
                            }
                            className={cn(
                              "text-destructive",
                              currentUser &&
                                !currentUser.isAdmin?.() &&
                                "opacity-50 cursor-not-allowed"
                            )}
                          >
                            Delete
                            {currentUser && !currentUser.isAdmin?.() && (
                              <span className="ml-auto text-xs">
                                (Admin Only)
                              </span>
                            )}
                          </DropdownMenuItem>
                        )}

                        {/* Custom actions */}
                        {actions.map((action, index) => {
                          const isDisabled =
                            action.disabled?.(item) ||
                            (action.adminOnly &&
                              currentUser &&
                              !currentUser.isAdmin?.()) ||
                            false;

                          return (
                            <DropdownMenuItem
                              key={index}
                              onClick={() => action.onClick(item)}
                              disabled={isDisabled}
                              className={cn(
                                action.variant === "destructive" &&
                                  "text-destructive",
                                isDisabled && "opacity-50 cursor-not-allowed"
                              )}
                            >
                              {action.icon && (
                                <action.icon className="mr-2 h-4 w-4" />
                              )}
                              {action.label}
                              {action.adminOnly &&
                                currentUser &&
                                !currentUser.isAdmin?.() && (
                                  <span className="ml-auto text-xs">
                                    (Admin Only)
                                  </span>
                                )}
                            </DropdownMenuItem>
                          );
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-between px-2 py-4">
          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, totalItems)} of {totalItems}{" "}
            results
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center space-x-1">
              {[...Array(totalPages)].map((_, i) => (
                <Button
                  key={i}
                  variant={currentPage === i + 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(i + 1)}
                  className="w-8"
                >
                  {i + 1}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handlePageChange(Math.min(currentPage + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
