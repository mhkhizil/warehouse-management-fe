import { useState, useCallback } from "react";
import { IItemService } from "../../domain/services/IItemService";
import { Item } from "../../domain/entities/Item";
import {
  CreateItemDTO,
  UpdateItemDTO,
  ItemFilterDTO,
  ItemDomainListResponseDTO,
} from "../../application/dtos/ItemDTO";
import container from "../../infrastructure/di/container";

interface UseItemManagementReturn {
  // State
  items: Item[];
  totalItems: number;
  currentItem: Item | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  createItem: (itemData: CreateItemDTO) => Promise<Item>;
  getItems: (params?: ItemFilterDTO) => Promise<ItemDomainListResponseDTO>;
  getAllItems: () => Promise<Item[]>;
  getEligibleParents: (excludeId?: number) => Promise<Item[]>;
  getItemById: (id: number) => Promise<Item>;
  getItemByName: (name: string) => Promise<Item>;
  getSubItems: (parentId: number) => Promise<Item[]>;
  updateItem: (id: number, itemData: UpdateItemDTO) => Promise<Item>;
  deleteItem: (id: number) => Promise<boolean>;
  searchItemsByName: (
    name: string,
    take?: number,
    skip?: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ) => Promise<ItemDomainListResponseDTO>;
  searchItemsByBrand: (
    brand: string,
    take?: number,
    skip?: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ) => Promise<ItemDomainListResponseDTO>;
  searchItemsByType: (
    type: string,
    take?: number,
    skip?: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ) => Promise<ItemDomainListResponseDTO>;
  getSellableItems: (
    take?: number,
    skip?: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ) => Promise<ItemDomainListResponseDTO>;
  getLowStockItems: (
    threshold?: number,
    take?: number,
    skip?: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ) => Promise<ItemDomainListResponseDTO>;
  clearError: () => void;
}

/**
 * Custom hook for item management operations
 */
export function useItemManagement(): UseItemManagementReturn {
  const [items, setItems] = useState<Item[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);
  const [currentItem, setCurrentItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get service from container
  const itemService = container.resolve<IItemService>("itemService");

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const createItem = useCallback(
    async (itemData: CreateItemDTO) => {
      try {
        setIsLoading(true);
        clearError();

        const item = await itemService.createItem(itemData);

        setItems((prev) => [item, ...prev]);
        setTotalItems((prev) => prev + 1);
        return item;
      } catch (err) {
        const message =
          err instanceof Error &&
          (err as { response?: { data?: { message?: string } } }).response?.data
            ?.message
            ? (err as { response?: { data?: { message?: string } } }).response
                ?.data?.message
            : err instanceof Error
            ? err.message
            : "Failed to create item";
        setError(message as string);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [clearError, itemService]
  );

  const getItems = useCallback(
    async (params?: ItemFilterDTO) => {
      try {
        setIsLoading(true);
        clearError();

        console.log("useItemManagement: Starting getItems with params:", params);

        const result = await itemService.getItems(params);

        console.log("useItemManagement: Service returned result:", result);

        setItems(result.items);
        setTotalItems(result.total);

        return result;
      } catch (err) {
        console.error("useItemManagement: Error in getItems:", err);
        const message =
          err instanceof Error &&
          (err as { response?: { data?: { message?: string } } }).response?.data
            ?.message
            ? (err as { response?: { data?: { message?: string } } }).response
                ?.data?.message
            : err instanceof Error
            ? err.message
            : "Failed to fetch items";
        setError(message as string);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [clearError, itemService]
  );

  const getAllItems = useCallback(async () => {
    try {
      setIsLoading(true);
      clearError();

      const allItems = await itemService.getAllItems();
      setItems(allItems);
      setTotalItems(allItems.length);
      return allItems;
    } catch (err) {
      const message =
        err instanceof Error &&
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : err instanceof Error
          ? err.message
          : "Failed to fetch all items";
      setError(message as string);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [clearError, itemService]);

  const getEligibleParents = useCallback(
    async (excludeId?: number) => {
      try {
        setIsLoading(true);
        clearError();

        const eligibleParents = await itemService.getEligibleParents(excludeId);
        return eligibleParents;
      } catch (err) {
        const message =
          err instanceof Error &&
          (err as { response?: { data?: { message?: string } } }).response?.data
            ?.message
            ? (err as { response?: { data?: { message?: string } } }).response
                ?.data?.message
            : err instanceof Error
            ? err.message
            : "Failed to fetch eligible parent items";
        setError(message as string);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [clearError, itemService]
  );

  const getItemById = useCallback(
    async (id: number) => {
      try {
        setIsLoading(true);
        clearError();

        const item = await itemService.getItemById(id);
        setCurrentItem(item);
        return item;
      } catch (err) {
        const message =
          err instanceof Error &&
          (err as { response?: { data?: { message?: string } } }).response?.data
            ?.message
            ? (err as { response?: { data?: { message?: string } } }).response
                ?.data?.message
            : err instanceof Error
            ? err.message
            : "Failed to fetch item";
        setError(message as string);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [clearError, itemService]
  );

  const getItemByName = useCallback(
    async (name: string) => {
      try {
        setIsLoading(true);
        clearError();

        const item = await itemService.getItemByName(name);
        setCurrentItem(item);
        return item;
      } catch (err) {
        const message =
          err instanceof Error &&
          (err as { response?: { data?: { message?: string } } }).response?.data
            ?.message
            ? (err as { response?: { data?: { message?: string } } }).response
                ?.data?.message
            : err instanceof Error
            ? err.message
            : "Failed to fetch item by name";
        setError(message as string);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [clearError, itemService]
  );

  const getSubItems = useCallback(
    async (parentId: number) => {
      try {
        setIsLoading(true);
        clearError();

        const subItems = await itemService.getSubItems(parentId);
        return subItems;
      } catch (err) {
        const message =
          err instanceof Error &&
          (err as { response?: { data?: { message?: string } } }).response?.data
            ?.message
            ? (err as { response?: { data?: { message?: string } } }).response
                ?.data?.message
            : err instanceof Error
            ? err.message
            : "Failed to fetch sub-items";
        setError(message as string);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [clearError, itemService]
  );

  const updateItem = useCallback(
    async (id: number, itemData: UpdateItemDTO) => {
      try {
        setIsLoading(true);
        clearError();

        const updatedItem = await itemService.updateItem(id, itemData);

        setItems((prev) =>
          prev.map((item) => (item.id === id ? updatedItem : item))
        );

        if (currentItem?.id === id) {
          setCurrentItem(updatedItem);
        }

        return updatedItem;
      } catch (err) {
        const message =
          err instanceof Error &&
          (err as { response?: { data?: { message?: string } } }).response?.data
            ?.message
            ? (err as { response?: { data?: { message?: string } } }).response
                ?.data?.message
            : err instanceof Error
            ? err.message
            : "Failed to update item";
        setError(message as string);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [clearError, itemService, currentItem]
  );

  const deleteItem = useCallback(
    async (id: number) => {
      try {
        setIsLoading(true);
        clearError();

        const success = await itemService.deleteItem(id);

        if (success) {
          setItems((prev) => prev.filter((item) => item.id !== id));
          setTotalItems((prev) => prev - 1);

          if (currentItem?.id === id) {
            setCurrentItem(null);
          }
        }

        return success;
      } catch (err) {
        const message =
          err instanceof Error &&
          (err as { response?: { data?: { message?: string } } }).response?.data
            ?.message
            ? (err as { response?: { data?: { message?: string } } }).response
                ?.data?.message
            : err instanceof Error
            ? err.message
            : "Failed to delete item";
        setError(message as string);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [clearError, itemService, currentItem]
  );

  const searchItemsByName = useCallback(
    async (
      name: string,
      take?: number,
      skip?: number,
      sortBy?: string,
      sortOrder?: "asc" | "desc"
    ) => {
      try {
        setIsLoading(true);
        clearError();

        const result = await itemService.searchItemsByName(
          name,
          take || 10,
          skip || 0,
          sortBy,
          sortOrder
        );

        setItems(result.items);
        setTotalItems(result.total);
        return result;
      } catch (err) {
        const message =
          err instanceof Error &&
          (err as { response?: { data?: { message?: string } } }).response?.data
            ?.message
            ? (err as { response?: { data?: { message?: string } } }).response
                ?.data?.message
            : err instanceof Error
            ? err.message
            : "Failed to search items by name";
        setError(message as string);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [clearError, itemService]
  );

  const searchItemsByBrand = useCallback(
    async (
      brand: string,
      take?: number,
      skip?: number,
      sortBy?: string,
      sortOrder?: "asc" | "desc"
    ) => {
      try {
        setIsLoading(true);
        clearError();

        const result = await itemService.searchItemsByBrand(
          brand,
          take || 10,
          skip || 0,
          sortBy,
          sortOrder
        );

        setItems(result.items);
        setTotalItems(result.total);
        return result;
      } catch (err) {
        const message =
          err instanceof Error &&
          (err as { response?: { data?: { message?: string } } }).response?.data
            ?.message
            ? (err as { response?: { data?: { message?: string } } }).response
                ?.data?.message
            : err instanceof Error
            ? err.message
            : "Failed to search items by brand";
        setError(message as string);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [clearError, itemService]
  );

  const searchItemsByType = useCallback(
    async (
      type: string,
      take?: number,
      skip?: number,
      sortBy?: string,
      sortOrder?: "asc" | "desc"
    ) => {
      try {
        setIsLoading(true);
        clearError();

        const result = await itemService.searchItemsByType(
          type,
          take || 10,
          skip || 0,
          sortBy,
          sortOrder
        );

        setItems(result.items);
        setTotalItems(result.total);
        return result;
      } catch (err) {
        const message =
          err instanceof Error &&
          (err as { response?: { data?: { message?: string } } }).response?.data
            ?.message
            ? (err as { response?: { data?: { message?: string } } }).response
                ?.data?.message
            : err instanceof Error
            ? err.message
            : "Failed to search items by type";
        setError(message as string);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [clearError, itemService]
  );

  const getSellableItems = useCallback(
    async (
      take?: number,
      skip?: number,
      sortBy?: string,
      sortOrder?: "asc" | "desc"
    ) => {
      try {
        setIsLoading(true);
        clearError();

        const result = await itemService.getSellableItems(
          take,
          skip,
          sortBy,
          sortOrder
        );

        setItems(result.items);
        setTotalItems(result.total);
        return result;
      } catch (err) {
        const message =
          err instanceof Error &&
          (err as { response?: { data?: { message?: string } } }).response?.data
            ?.message
            ? (err as { response?: { data?: { message?: string } } }).response
                ?.data?.message
            : err instanceof Error
            ? err.message
            : "Failed to fetch sellable items";
        setError(message as string);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [clearError, itemService]
  );

  const getLowStockItems = useCallback(
    async (
      threshold?: number,
      take?: number,
      skip?: number,
      sortBy?: string,
      sortOrder?: "asc" | "desc"
    ) => {
      try {
        setIsLoading(true);
        clearError();

        const result = await itemService.getLowStockItems(
          threshold,
          take,
          skip,
          sortBy,
          sortOrder
        );

        setItems(result.items);
        setTotalItems(result.total);
        return result;
      } catch (err) {
        const message =
          err instanceof Error &&
          (err as { response?: { data?: { message?: string } } }).response?.data
            ?.message
            ? (err as { response?: { data?: { message?: string } } }).response
                ?.data?.message
            : err instanceof Error
            ? err.message
            : "Failed to fetch low stock items";
        setError(message as string);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [clearError, itemService]
  );

  return {
    items,
    totalItems,
    currentItem,
    isLoading,
    error,
    createItem,
    getItems,
    getAllItems,
    getEligibleParents,
    getItemById,
    getItemByName,
    getSubItems,
    updateItem,
    deleteItem,
    searchItemsByName,
    searchItemsByBrand,
    searchItemsByType,
    getSellableItems,
    getLowStockItems,
    clearError,
  };
}
