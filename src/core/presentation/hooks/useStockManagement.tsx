import { useState, useCallback } from "react";
import { IStockService } from "../../domain/services/IStockService";
import { Stock } from "../../domain/entities/Stock";
import {
  UpdateStockDTO,
  StockFilterDTO,
  StockDomainListResponseDTO,
} from "../../application/dtos/StockDTO";
import container from "../../infrastructure/di/container";

interface UseStockManagementReturn {
  // State
  stocks: Stock[];
  totalStocks: number;
  currentStock: Stock | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  getStocks: (params?: StockFilterDTO) => Promise<StockDomainListResponseDTO>;
  getAllStocks: () => Promise<Stock[]>;
  getLowStocks: (threshold?: number) => Promise<Stock[]>;
  getStockById: (id: number) => Promise<Stock>;
  getStockByItemId: (itemId: number) => Promise<Stock>;
  updateStock: (id: number, stockData: UpdateStockDTO) => Promise<Stock>;
  deleteStock: (id: number) => Promise<boolean>;
  searchStocksByItemId: (
    itemId: number,
    take?: number,
    skip?: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ) => Promise<StockDomainListResponseDTO>;
  getStocksWithRefillAlert: (
    take?: number,
    skip?: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ) => Promise<StockDomainListResponseDTO>;
  getStocksByQuantityRange: (
    minQuantity?: number,
    maxQuantity?: number,
    take?: number,
    skip?: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ) => Promise<StockDomainListResponseDTO>;
  clearError: () => void;
}

/**
 * Custom hook for stock management operations
 */
export function useStockManagement(): UseStockManagementReturn {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [totalStocks, setTotalStocks] = useState<number>(0);
  const [currentStock, setCurrentStock] = useState<Stock | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get service from container
  const stockService = container.resolve<IStockService>("stockService");

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const getStocks = useCallback(
    async (params?: StockFilterDTO) => {
      try {
        setIsLoading(true);
        clearError();

        console.log("useStockManagement: Starting getStocks with params:", params);

        const result = await stockService.getStocks(params);

        console.log("useStockManagement: Service returned result:", result);

        setStocks(result.stocks);
        setTotalStocks(result.total);

        return result;
      } catch (err) {
        console.error("useStockManagement: Error in getStocks:", err);
        const message =
          err instanceof Error &&
          (err as { response?: { data?: { message?: string } } }).response?.data
            ?.message
            ? (err as { response?: { data?: { message?: string } } }).response
                ?.data?.message
            : err instanceof Error
            ? err.message
            : "Failed to fetch stocks";
        setError(message as string);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [clearError, stockService]
  );

  const getAllStocks = useCallback(async () => {
    try {
      setIsLoading(true);
      clearError();

      const allStocks = await stockService.getAllStocks();
      setStocks(allStocks);
      setTotalStocks(allStocks.length);
      return allStocks;
    } catch (err) {
      const message =
        err instanceof Error &&
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message
          ? (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message
          : err instanceof Error
          ? err.message
          : "Failed to fetch all stocks";
      setError(message as string);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [clearError, stockService]);

  const getLowStocks = useCallback(
    async (threshold?: number) => {
      try {
        setIsLoading(true);
        clearError();

        const lowStocks = await stockService.getLowStocks(threshold);
        setStocks(lowStocks);
        setTotalStocks(lowStocks.length);
        return lowStocks;
      } catch (err) {
        const message =
          err instanceof Error &&
          (err as { response?: { data?: { message?: string } } }).response?.data
            ?.message
            ? (err as { response?: { data?: { message?: string } } }).response
                ?.data?.message
            : err instanceof Error
            ? err.message
            : "Failed to fetch low stocks";
        setError(message as string);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [clearError, stockService]
  );

  const getStockById = useCallback(
    async (id: number) => {
      try {
        setIsLoading(true);
        clearError();

        const stock = await stockService.getStockById(id);
        setCurrentStock(stock);
        return stock;
      } catch (err) {
        const message =
          err instanceof Error &&
          (err as { response?: { data?: { message?: string } } }).response?.data
            ?.message
            ? (err as { response?: { data?: { message?: string } } }).response
                ?.data?.message
            : err instanceof Error
            ? err.message
            : "Failed to fetch stock";
        setError(message as string);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [clearError, stockService]
  );

  const getStockByItemId = useCallback(
    async (itemId: number) => {
      try {
        setIsLoading(true);
        clearError();

        const stock = await stockService.getStockByItemId(itemId);
        setCurrentStock(stock);
        return stock;
      } catch (err) {
        const message =
          err instanceof Error &&
          (err as { response?: { data?: { message?: string } } }).response?.data
            ?.message
            ? (err as { response?: { data?: { message?: string } } }).response
                ?.data?.message
            : err instanceof Error
            ? err.message
            : "Failed to fetch stock by item ID";
        setError(message as string);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [clearError, stockService]
  );

  const updateStock = useCallback(
    async (id: number, stockData: UpdateStockDTO) => {
      try {
        setIsLoading(true);
        clearError();

        const updatedStock = await stockService.updateStock(id, stockData);

        setStocks((prev) =>
          prev.map((stock) => (stock.id === id ? updatedStock : stock))
        );

        if (currentStock?.id === id) {
          setCurrentStock(updatedStock);
        }

        return updatedStock;
      } catch (err) {
        const message =
          err instanceof Error &&
          (err as { response?: { data?: { message?: string } } }).response?.data
            ?.message
            ? (err as { response?: { data?: { message?: string } } }).response
                ?.data?.message
            : err instanceof Error
            ? err.message
            : "Failed to update stock";
        setError(message as string);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [clearError, stockService, currentStock]
  );

  const deleteStock = useCallback(
    async (id: number) => {
      try {
        setIsLoading(true);
        clearError();

        const success = await stockService.deleteStock(id);

        if (success) {
          setStocks((prev) => prev.filter((stock) => stock.id !== id));
          setTotalStocks((prev) => prev - 1);

          if (currentStock?.id === id) {
            setCurrentStock(null);
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
            : "Failed to delete stock";
        setError(message as string);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [clearError, stockService, currentStock]
  );

  const searchStocksByItemId = useCallback(
    async (
      itemId: number,
      take?: number,
      skip?: number,
      sortBy?: string,
      sortOrder?: "asc" | "desc"
    ) => {
      try {
        setIsLoading(true);
        clearError();

        const result = await stockService.searchStocksByItemId(
          itemId,
          take || 10,
          skip || 0,
          sortBy,
          sortOrder
        );

        setStocks(result.stocks);
        setTotalStocks(result.total);
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
            : "Failed to search stocks by item ID";
        setError(message as string);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [clearError, stockService]
  );

  const getStocksWithRefillAlert = useCallback(
    async (
      take?: number,
      skip?: number,
      sortBy?: string,
      sortOrder?: "asc" | "desc"
    ) => {
      try {
        setIsLoading(true);
        clearError();

        const result = await stockService.getStocksWithRefillAlert(
          take,
          skip,
          sortBy,
          sortOrder
        );

        setStocks(result.stocks);
        setTotalStocks(result.total);
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
            : "Failed to fetch stocks with refill alert";
        setError(message as string);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [clearError, stockService]
  );

  const getStocksByQuantityRange = useCallback(
    async (
      minQuantity?: number,
      maxQuantity?: number,
      take?: number,
      skip?: number,
      sortBy?: string,
      sortOrder?: "asc" | "desc"
    ) => {
      try {
        setIsLoading(true);
        clearError();

        const result = await stockService.getStocksByQuantityRange(
          minQuantity,
          maxQuantity,
          take,
          skip,
          sortBy,
          sortOrder
        );

        setStocks(result.stocks);
        setTotalStocks(result.total);
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
            : "Failed to fetch stocks by quantity range";
        setError(message as string);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [clearError, stockService]
  );

  return {
    stocks,
    totalStocks,
    currentStock,
    isLoading,
    error,
    getStocks,
    getAllStocks,
    getLowStocks,
    getStockById,
    getStockByItemId,
    updateStock,
    deleteStock,
    searchStocksByItemId,
    getStocksWithRefillAlert,
    getStocksByQuantityRange,
    clearError,
  };
}
