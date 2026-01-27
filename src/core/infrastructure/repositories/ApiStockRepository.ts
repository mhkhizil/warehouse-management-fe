import { IStockRepository } from "../../domain/repositories/IStockRepository";
import { Stock } from "../../domain/entities/Stock";
import { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";
import {
  StockFilterDTO,
  StockDomainListResponseDTO,
  StockDTOMapper,
} from "../../application/dtos/StockDTO";

// Type for API response data
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface ApiResponseData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stock?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  stocks?: any;
  id?: number;
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  results?: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content?: any[];
  totalElements?: number;
  number?: number;
  size?: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
  success?: boolean;
  message?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export class ApiStockRepository implements IStockRepository {
  constructor(private httpClient: HttpClient) {}

  async getStocks(params?: StockFilterDTO): Promise<StockDomainListResponseDTO> {
    const queryParams = new URLSearchParams();

    if (params?.skip !== undefined)
      queryParams.append("skip", params.skip.toString());
    if (params?.take !== undefined)
      queryParams.append("take", params.take.toString());
    if (params?.itemId !== undefined)
      queryParams.append("itemId", params.itemId.toString());
    if (params?.refillAlert !== undefined)
      queryParams.append("refillAlert", params.refillAlert.toString());
    if (params?.minQuantity !== undefined)
      queryParams.append("minQuantity", params.minQuantity.toString());
    if (params?.maxQuantity !== undefined)
      queryParams.append("maxQuantity", params.maxQuantity.toString());
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const url = `${API_ENDPOINTS.STOCKS.BASE}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    const response = await this.httpClient.get(url);

    // Debug: Log the response structure
    console.log("API Response:", response);
    console.log("Response data:", (response as { data: ApiResponseData }).data);

    // Handle different possible response structures
    const responseData = (response as { data: ApiResponseData }).data;

    // Case 1: response.data.stocks (with pagination)
    if (responseData.stocks && responseData.stocks.data) {
      return StockDTOMapper.toDomainListResponseDTO(
        responseData.stocks.data.map(
          (stock: Record<string, unknown>) => new Stock(stock)
        ),
        responseData.stocks.total || 0,
        responseData.stocks.page || 1,
        responseData.stocks.limit || 10,
        responseData.stocks.totalPages || 1,
        responseData.stocks.hasNextPage || false,
        responseData.stocks.hasPrevPage || false
      );
    }

    // Case 2: response.data.stocks (array directly)
    if (responseData.stocks && Array.isArray(responseData.stocks)) {
      return StockDTOMapper.toDomainListResponseDTO(
        responseData.stocks.map(
          (stock: Record<string, unknown>) => new Stock(stock)
        ),
        responseData.stocks.length,
        1,
        responseData.stocks.length,
        1,
        false,
        false
      );
    }

    // Case 3: response.data is the array directly
    if (Array.isArray(responseData)) {
      return StockDTOMapper.toDomainListResponseDTO(
        responseData.map((stock: Record<string, unknown>) => new Stock(stock)),
        responseData.length,
        1,
        responseData.length,
        1,
        false,
        false
      );
    }

    // Case 4: response.data.data (common API pattern)
    if (responseData.data && Array.isArray(responseData.data)) {
      return StockDTOMapper.toDomainListResponseDTO(
        responseData.data.map(
          (stock: Record<string, unknown>) => new Stock(stock)
        ),
        responseData.total || responseData.data.length,
        responseData.page || 1,
        responseData.limit || responseData.data.length,
        responseData.totalPages || 1,
        responseData.hasNextPage || false,
        responseData.hasPrevPage || false
      );
    }

    // Case 5: response.data.results (another common pattern)
    if (responseData.results && Array.isArray(responseData.results)) {
      return StockDTOMapper.toDomainListResponseDTO(
        responseData.results.map(
          (stock: Record<string, unknown>) => new Stock(stock)
        ),
        responseData.total || responseData.results.length,
        responseData.page || 1,
        responseData.limit || responseData.results.length,
        responseData.totalPages || 1,
        responseData.hasNextPage || false,
        responseData.hasPrevPage || false
      );
    }

    // Case 6: response.data.content (Spring Boot pattern)
    if (responseData.content && Array.isArray(responseData.content)) {
      return StockDTOMapper.toDomainListResponseDTO(
        responseData.content.map(
          (stock: Record<string, unknown>) => new Stock(stock)
        ),
        responseData.totalElements || responseData.content.length,
        responseData.number || 1,
        responseData.size || responseData.content.length,
        responseData.totalPages || 1,
        responseData.hasNext || false,
        responseData.hasPrevious || false
      );
    }

    // If none of the expected structures match, try to find any array in the response
    const allKeys = Object.keys(responseData);
    for (const key of allKeys) {
      if (Array.isArray(responseData[key])) {
        console.warn(`Found array in unexpected key: ${key}`, responseData[key]);
        return StockDTOMapper.toDomainListResponseDTO(
          responseData[key].map(
            (stock: Record<string, unknown>) => new Stock(stock)
          ),
          responseData.total || responseData[key].length,
          responseData.page || 1,
          responseData.limit || responseData[key].length,
          responseData.totalPages || 1,
          responseData.hasNextPage || false,
          responseData.hasPrevPage || false
        );
      }
    }

    // If still no match, throw an error with the full response structure
    throw new Error(
      `Unexpected API response structure: ${JSON.stringify(
        responseData,
        null,
        2
      )}`
    );
  }

  async getAllStocks(): Promise<Stock[]> {
    const response = await this.httpClient.get(API_ENDPOINTS.STOCKS.GET_ALL);

    const responseData = (response as { data: ApiResponseData }).data;

    // Handle different possible response structures
    if (responseData.stocks && Array.isArray(responseData.stocks)) {
      return responseData.stocks.map(
        (stock: Record<string, unknown>) => new Stock(stock)
      );
    }

    if (Array.isArray(responseData)) {
      return responseData.map(
        (stock: Record<string, unknown>) => new Stock(stock)
      );
    }

    if (responseData.data && Array.isArray(responseData.data)) {
      return responseData.data.map(
        (stock: Record<string, unknown>) => new Stock(stock)
      );
    }

    throw new Error(
      `Unexpected API response structure for getAllStocks: ${JSON.stringify(
        responseData
      )}`
    );
  }

  async getLowStocks(threshold?: number): Promise<Stock[]> {
    const url = threshold
      ? `${API_ENDPOINTS.STOCKS.GET_LOW}?threshold=${threshold}`
      : API_ENDPOINTS.STOCKS.GET_LOW;
    const response = await this.httpClient.get(url);

    const responseData = (response as { data: ApiResponseData }).data;

    // Handle different possible response structures
    if (responseData.stocks && Array.isArray(responseData.stocks)) {
      return responseData.stocks.map(
        (stock: Record<string, unknown>) => new Stock(stock)
      );
    }

    if (Array.isArray(responseData)) {
      return responseData.map(
        (stock: Record<string, unknown>) => new Stock(stock)
      );
    }

    if (responseData.data && Array.isArray(responseData.data)) {
      return responseData.data.map(
        (stock: Record<string, unknown>) => new Stock(stock)
      );
    }

    throw new Error(
      `Unexpected API response structure for getLowStocks: ${JSON.stringify(
        responseData
      )}`
    );
  }

  async getStockById(id: number): Promise<Stock> {
    const response = await this.httpClient.get(
      API_ENDPOINTS.STOCKS.GET_BY_ID(id.toString())
    );

    const responseData = (response as { data: ApiResponseData }).data;

    if (responseData.data && responseData.data.stock) {
      return new Stock(responseData.data.stock);
    }

    if (responseData.stock) {
      return new Stock(responseData.stock);
    }

    if (responseData.data) {
      return new Stock(responseData.data);
    }

    if (responseData.id) {
      return new Stock(responseData);
    }

    throw new Error(
      `Unexpected API response structure for getStockById: ${JSON.stringify(
        responseData
      )}`
    );
  }

  async getStockByItemId(itemId: number): Promise<Stock> {
    const response = await this.httpClient.get(
      API_ENDPOINTS.STOCKS.GET_BY_ITEM_ID(itemId.toString())
    );

    const responseData = (response as { data: ApiResponseData }).data;

    if (responseData.data && responseData.data.stock) {
      return new Stock(responseData.data.stock);
    }

    if (responseData.stock) {
      return new Stock(responseData.stock);
    }

    if (responseData.data) {
      return new Stock(responseData.data);
    }

    if (responseData.id) {
      return new Stock(responseData);
    }

    throw new Error(
      `Unexpected API response structure for getStockByItemId: ${JSON.stringify(
        responseData
      )}`
    );
  }

  async updateStock(id: number, stockData: Partial<Stock>): Promise<Stock> {
    const response = await this.httpClient.put(
      API_ENDPOINTS.STOCKS.UPDATE(id.toString()),
      stockData
    );

    const responseData = (response as { data: ApiResponseData }).data;

    if (responseData.data && responseData.data.stock) {
      return new Stock(responseData.data.stock);
    }

    if (responseData.stock) {
      return new Stock(responseData.stock);
    }

    if (responseData.data) {
      return new Stock(responseData.data);
    }

    if (responseData.id) {
      return new Stock(responseData);
    }

    throw new Error(
      `Unexpected API response structure for updateStock: ${JSON.stringify(
        responseData
      )}`
    );
  }

  async deleteStock(id: number): Promise<boolean> {
    const response = await this.httpClient.delete(
      API_ENDPOINTS.STOCKS.DELETE(id.toString())
    );

    const responseData = (response as { data: ApiResponseData }).data;

    // Handle boolean response (success/failure)
    if (typeof responseData === "boolean") {
      return responseData;
    }

    // Handle object response with success property
    if (responseData && typeof responseData.success === "boolean") {
      return responseData.success;
    }

    // Handle object response with message property (common pattern)
    if (responseData && responseData.message) {
      return true; // If we get a message, assume success
    }

    // If we get here, assume success (no error was thrown)
    return true;
  }
}
