import { Stock } from "../../domain/entities/Stock";
import { Item } from "../../domain/entities/Item";

export interface CreateStockDTO {
  itemId: number;
  quantity: number;
  refillAlert?: boolean;
}

export interface UpdateStockDTO {
  quantity?: number;
  refillAlert?: boolean;
}

export interface StockResponseDTO {
  id: number;
  itemId: number;
  item: Item | null;
  quantity: number;
  lastRefilled: string;
  refillAlert: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StockListResponseDTO {
  stocks: StockResponseDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Domain response DTO that uses Stock entities (for internal service layer)
export interface StockDomainListResponseDTO {
  stocks: Stock[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface StockFilterDTO {
  itemId?: number;
  refillAlert?: boolean;
  minQuantity?: number;
  maxQuantity?: number;
  skip?: number;
  take?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Utility functions for DTO conversion
export class StockDTOMapper {
  static toResponseDTO(stock: Stock): StockResponseDTO {
    return {
      id: stock.id,
      itemId: stock.itemId,
      item: stock.item,
      quantity: stock.quantity,
      lastRefilled: stock.lastRefilled,
      refillAlert: stock.refillAlert,
      createdAt: stock.createdAt,
      updatedAt: stock.updatedAt,
    };
  }

  static toResponseDTOList(stocks: Stock[]): StockResponseDTO[] {
    return stocks.map((stock) => this.toResponseDTO(stock));
  }

  static toDomainListResponseDTO(
    stocks: Stock[],
    total: number,
    page: number,
    limit: number,
    totalPages: number,
    hasNextPage: boolean,
    hasPrevPage: boolean
  ): StockDomainListResponseDTO {
    return {
      stocks,
      total,
      page,
      limit,
      totalPages,
      hasNextPage,
      hasPrevPage,
    };
  }

  static fromCreateDTO(
    dto: CreateStockDTO
  ): Omit<
    Stock,
    "id" | "createdAt" | "updatedAt" | "lastRefilled" | "item"
  > {
    return {
      itemId: dto.itemId,
      quantity: dto.quantity,
      refillAlert: dto.refillAlert || false,
    };
  }

  static fromUpdateDTO(dto: UpdateStockDTO): Partial<Stock> {
    const updateData: Partial<Stock> = {};

    if (dto.quantity !== undefined) updateData.quantity = dto.quantity;
    if (dto.refillAlert !== undefined) updateData.refillAlert = dto.refillAlert;

    return updateData;
  }
}
