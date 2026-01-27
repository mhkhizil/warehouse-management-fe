import { IStockRepository } from "../../domain/repositories/IStockRepository";
import { Stock } from "../../domain/entities/Stock";
import {
  UpdateStockDTO,
  StockFilterDTO,
  StockDomainListResponseDTO,
  StockDTOMapper,
} from "../dtos/StockDTO";
import { IStockService } from "../../domain/services/IStockService";

export class StockService implements IStockService {
  constructor(private stockRepository: IStockRepository) {}

  async getStocks(params?: StockFilterDTO): Promise<StockDomainListResponseDTO> {
    return await this.stockRepository.getStocks(params);
  }

  async getAllStocks(): Promise<Stock[]> {
    return await this.stockRepository.getAllStocks();
  }

  async getLowStocks(threshold?: number): Promise<Stock[]> {
    return await this.stockRepository.getLowStocks(threshold);
  }

  async getStockById(id: number): Promise<Stock> {
    if (id <= 0) {
      throw new Error("Invalid stock ID");
    }
    return await this.stockRepository.getStockById(id);
  }

  async getStockByItemId(itemId: number): Promise<Stock> {
    if (itemId <= 0) {
      throw new Error("Invalid item ID");
    }
    return await this.stockRepository.getStockByItemId(itemId);
  }

  async updateStock(id: number, stockData: UpdateStockDTO): Promise<Stock> {
    if (id <= 0) {
      throw new Error("Invalid stock ID");
    }

    // Get existing stock to validate the update
    const existingStock = await this.stockRepository.getStockById(id);

    // Use DTO mapper to convert UpdateStockDTO to partial Stock
    const updateData = StockDTOMapper.fromUpdateDTO(stockData);

    // Create a merged stock object for validation
    const updatedStock = new Stock({
      ...existingStock,
      ...updateData,
    });

    if (!updatedStock.isValid()) {
      throw new Error("Invalid stock data");
    }

    return await this.stockRepository.updateStock(id, updateData);
  }

  async deleteStock(id: number): Promise<boolean> {
    if (id <= 0) {
      throw new Error("Invalid stock ID");
    }
    return await this.stockRepository.deleteStock(id);
  }

  /**
   * Search stocks by item ID
   */
  async searchStocksByItemId(
    itemId: number,
    take: number = 10,
    skip: number = 0,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ): Promise<StockDomainListResponseDTO> {
    if (itemId <= 0) {
      throw new Error("Invalid item ID");
    }

    return await this.getStocks({
      take,
      skip,
      itemId,
      sortBy,
      sortOrder,
    });
  }

  /**
   * Get stocks with refill alerts
   */
  async getStocksWithRefillAlert(
    take?: number,
    skip?: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ): Promise<StockDomainListResponseDTO> {
    return await this.getStocks({
      take,
      skip,
      refillAlert: true,
      sortBy,
      sortOrder,
    });
  }

  /**
   * Get stocks by quantity range
   */
  async getStocksByQuantityRange(
    minQuantity?: number,
    maxQuantity?: number,
    take?: number,
    skip?: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ): Promise<StockDomainListResponseDTO> {
    return await this.getStocks({
      take,
      skip,
      minQuantity,
      maxQuantity,
      sortBy,
      sortOrder,
    });
  }

  /**
   * Get low stock items with pagination
   */
  async getLowStocksPaginated(
    threshold: number = 10,
    take?: number,
    skip?: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ): Promise<StockDomainListResponseDTO> {
    // Get all low stocks first
    const allLowStocks = await this.stockRepository.getLowStocks(threshold);

    // Apply sorting if specified
    const sortedStocks = [...allLowStocks];
    if (sortBy && sortOrder) {
      sortedStocks.sort((a, b) => {
        let aValue: string | number;
        let bValue: string | number;

        switch (sortBy) {
          case "quantity":
            aValue = a.quantity;
            bValue = b.quantity;
            break;
          case "itemId":
            aValue = a.itemId;
            bValue = b.itemId;
            break;
          case "lastRefilled":
            aValue = a.lastRefilled ? new Date(a.lastRefilled).getTime() : 0;
            bValue = b.lastRefilled ? new Date(b.lastRefilled).getTime() : 0;
            break;
          case "createdAt":
            aValue = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            bValue = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            break;
          case "updatedAt":
            aValue = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
            bValue = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
            break;
          default:
            aValue = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            bValue = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            break;
        }

        if (sortOrder === "asc") {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });
    }

    const startIndex = skip || 0;
    const endIndex = startIndex + (take || sortedStocks.length);
    const paginatedStocks = sortedStocks.slice(startIndex, endIndex);

    const total = sortedStocks.length;
    const page = Math.floor(startIndex / (take || 10)) + 1;
    const limit = take || 10;
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = endIndex < total;
    const hasPrevPage = startIndex > 0;

    return StockDTOMapper.toDomainListResponseDTO(
      paginatedStocks,
      total,
      page,
      limit,
      totalPages,
      hasNextPage,
      hasPrevPage
    );
  }
}
