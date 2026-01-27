import { Stock } from "../entities/Stock";
import {
  StockFilterDTO,
  StockDomainListResponseDTO,
} from "../../application/dtos/StockDTO";

export interface IStockRepository {
  getStocks(params?: StockFilterDTO): Promise<StockDomainListResponseDTO>;

  getAllStocks(): Promise<Stock[]>;

  getLowStocks(threshold?: number): Promise<Stock[]>;

  getStockById(id: number): Promise<Stock>;

  getStockByItemId(itemId: number): Promise<Stock>;

  updateStock(id: number, stockData: Partial<Stock>): Promise<Stock>;

  deleteStock(id: number): Promise<boolean>;
}
