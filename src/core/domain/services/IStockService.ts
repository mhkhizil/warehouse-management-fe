import { Stock } from "../entities/Stock";
import {
  UpdateStockDTO,
  StockFilterDTO,
  StockDomainListResponseDTO,
} from "../../application/dtos/StockDTO";

/**
 * Interface for stock service
 */
export interface IStockService {
  /**
   * Get stocks with pagination, filtering, and sorting
   */
  getStocks(params?: StockFilterDTO): Promise<StockDomainListResponseDTO>;

  /**
   * Get all stocks without pagination
   */
  getAllStocks(): Promise<Stock[]>;

  /**
   * Get low stock entries
   */
  getLowStocks(threshold?: number): Promise<Stock[]>;

  /**
   * Get stock by ID
   */
  getStockById(id: number): Promise<Stock>;

  /**
   * Get stock by item ID
   */
  getStockByItemId(itemId: number): Promise<Stock>;

  /**
   * Update stock
   */
  updateStock(id: number, stockData: UpdateStockDTO): Promise<Stock>;

  /**
   * Delete stock
   */
  deleteStock(id: number): Promise<boolean>;

  /**
   * Search stocks by item ID
   */
  searchStocksByItemId(
    itemId: number,
    take?: number,
    skip?: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ): Promise<StockDomainListResponseDTO>;

  /**
   * Get stocks with refill alerts
   */
  getStocksWithRefillAlert(
    take?: number,
    skip?: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ): Promise<StockDomainListResponseDTO>;

  /**
   * Get stocks by quantity range
   */
  getStocksByQuantityRange(
    minQuantity?: number,
    maxQuantity?: number,
    take?: number,
    skip?: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ): Promise<StockDomainListResponseDTO>;
}
