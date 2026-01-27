import { IItemRepository } from "../../domain/repositories/IItemRepository";
import { Item } from "../../domain/entities/Item";
import { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";
import {
  CreateItemDTO,
  ItemFilterDTO,
  ItemDomainListResponseDTO,
  ItemDTOMapper,
} from "../../application/dtos/ItemDTO";

// Type for API response data
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface ApiResponseData {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  item?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items?: any;
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

export class ApiItemRepository implements IItemRepository {
  constructor(private httpClient: HttpClient) {}

  async createItem(itemData: CreateItemDTO): Promise<Item> {
    const response = await this.httpClient.post(
      API_ENDPOINTS.ITEMS.BASE,
      itemData
    );

    const responseData = (response as { data: ApiResponseData }).data;

    // Handle the actual API response structure
    if (responseData.data && responseData.data.item) {
      return new Item(responseData.data.item);
    }

    if (responseData.item) {
      return new Item(responseData.item);
    }

    if (responseData.data && responseData.data.id) {
      return new Item(responseData.data);
    }

    if (responseData.id) {
      return new Item(responseData);
    }

    throw new Error(
      `Unexpected API response structure for createItem: ${JSON.stringify(
        responseData
      )}`
    );
  }

  async getItems(params?: ItemFilterDTO): Promise<ItemDomainListResponseDTO> {
    const queryParams = new URLSearchParams();

    if (params?.skip !== undefined)
      queryParams.append("skip", params.skip.toString());
    if (params?.take !== undefined)
      queryParams.append("take", params.take.toString());
    if (params?.name) queryParams.append("name", params.name);
    if (params?.brand) queryParams.append("brand", params.brand);
    if (params?.type) queryParams.append("type", params.type);
    if (params?.isSellable !== undefined)
      queryParams.append("isSellable", params.isSellable.toString());
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const url = `${API_ENDPOINTS.ITEMS.BASE}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    const response = await this.httpClient.get(url);

    // Debug: Log the response structure
    console.log("API Response:", response);
    console.log("Response data:", (response as { data: ApiResponseData }).data);

    // Handle different possible response structures
    const responseData = (response as { data: ApiResponseData }).data;

    // Case 1: response.data.items (with pagination)
    if (responseData.items && responseData.items.data) {
      return ItemDTOMapper.toDomainListResponseDTO(
        responseData.items.data.map(
          (item: Record<string, unknown>) => new Item(item)
        ),
        responseData.items.total || 0,
        responseData.items.page || 1,
        responseData.items.limit || 10,
        responseData.items.totalPages || 1,
        responseData.items.hasNextPage || false,
        responseData.items.hasPrevPage || false
      );
    }

    // Case 2: response.data.items (array directly)
    if (responseData.items && Array.isArray(responseData.items)) {
      return ItemDTOMapper.toDomainListResponseDTO(
        responseData.items.map(
          (item: Record<string, unknown>) => new Item(item)
        ),
        responseData.items.length,
        1,
        responseData.items.length,
        1,
        false,
        false
      );
    }

    // Case 3: response.data is the array directly
    if (Array.isArray(responseData)) {
      return ItemDTOMapper.toDomainListResponseDTO(
        responseData.map((item: Record<string, unknown>) => new Item(item)),
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
      return ItemDTOMapper.toDomainListResponseDTO(
        responseData.data.map(
          (item: Record<string, unknown>) => new Item(item)
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
      return ItemDTOMapper.toDomainListResponseDTO(
        responseData.results.map(
          (item: Record<string, unknown>) => new Item(item)
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
      return ItemDTOMapper.toDomainListResponseDTO(
        responseData.content.map(
          (item: Record<string, unknown>) => new Item(item)
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
        return ItemDTOMapper.toDomainListResponseDTO(
          responseData[key].map(
            (item: Record<string, unknown>) => new Item(item)
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

  async getAllItems(): Promise<Item[]> {
    const response = await this.httpClient.get(API_ENDPOINTS.ITEMS.GET_ALL);

    const responseData = (response as { data: ApiResponseData }).data;

    // Handle different possible response structures
    if (responseData.items && Array.isArray(responseData.items)) {
      return responseData.items.map(
        (item: Record<string, unknown>) => new Item(item)
      );
    }

    if (Array.isArray(responseData)) {
      return responseData.map(
        (item: Record<string, unknown>) => new Item(item)
      );
    }

    if (responseData.data && Array.isArray(responseData.data)) {
      return responseData.data.map(
        (item: Record<string, unknown>) => new Item(item)
      );
    }

    throw new Error(
      `Unexpected API response structure for getAllItems: ${JSON.stringify(
        responseData
      )}`
    );
  }

  async getEligibleParents(excludeId?: number): Promise<Item[]> {
    const queryParams = new URLSearchParams();
    if (excludeId !== undefined) {
      queryParams.append("excludeId", excludeId.toString());
    }

    const url = `${API_ENDPOINTS.ITEMS.GET_ELIGIBLE_PARENTS}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    const response = await this.httpClient.get(url);

    const responseData = (response as { data: ApiResponseData }).data;

    // Handle different possible response structures
    if (responseData.items && Array.isArray(responseData.items)) {
      return responseData.items.map(
        (item: Record<string, unknown>) => new Item(item)
      );
    }

    if (Array.isArray(responseData)) {
      return responseData.map(
        (item: Record<string, unknown>) => new Item(item)
      );
    }

    if (responseData.data && Array.isArray(responseData.data)) {
      return responseData.data.map(
        (item: Record<string, unknown>) => new Item(item)
      );
    }

    throw new Error(
      `Unexpected API response structure for getEligibleParents: ${JSON.stringify(
        responseData
      )}`
    );
  }

  async getItemById(id: number): Promise<Item> {
    const response = await this.httpClient.get(
      API_ENDPOINTS.ITEMS.GET_BY_ID(id.toString())
    );

    const responseData = (response as { data: ApiResponseData }).data;

    if (responseData.data && responseData.data.item) {
      return new Item(responseData.data.item);
    }

    if (responseData.item) {
      return new Item(responseData.item);
    }

    if (responseData.data) {
      return new Item(responseData.data);
    }

    if (responseData.id) {
      return new Item(responseData);
    }

    throw new Error(
      `Unexpected API response structure for getItemById: ${JSON.stringify(
        responseData
      )}`
    );
  }

  async getItemByName(name: string): Promise<Item> {
    const response = await this.httpClient.get(
      API_ENDPOINTS.ITEMS.GET_BY_NAME(name)
    );

    const responseData = (response as { data: ApiResponseData }).data;

    if (responseData.data && responseData.data.item) {
      return new Item(responseData.data.item);
    }

    if (responseData.item) {
      return new Item(responseData.item);
    }

    if (responseData.data) {
      return new Item(responseData.data);
    }

    if (responseData.id) {
      return new Item(responseData);
    }

    throw new Error(
      `Unexpected API response structure for getItemByName: ${JSON.stringify(
        responseData
      )}`
    );
  }

  async getSubItems(parentId: number): Promise<Item[]> {
    const response = await this.httpClient.get(
      API_ENDPOINTS.ITEMS.GET_SUB_ITEMS(parentId.toString())
    );

    const responseData = (response as { data: ApiResponseData }).data;

    // Handle different possible response structures
    if (responseData.items && Array.isArray(responseData.items)) {
      return responseData.items.map(
        (item: Record<string, unknown>) => new Item(item)
      );
    }

    if (responseData.data && Array.isArray(responseData.data.items)) {
      return responseData.data.items.map(
        (item: Record<string, unknown>) => new Item(item)
      );
    }

    if (Array.isArray(responseData)) {
      return responseData.map(
        (item: Record<string, unknown>) => new Item(item)
      );
    }

    if (responseData.data && Array.isArray(responseData.data)) {
      return responseData.data.map(
        (item: Record<string, unknown>) => new Item(item)
      );
    }

    throw new Error(
      `Unexpected API response structure for getSubItems: ${JSON.stringify(
        responseData
      )}`
    );
  }

  async updateItem(id: number, itemData: Partial<Item>): Promise<Item> {
    const response = await this.httpClient.put(
      API_ENDPOINTS.ITEMS.UPDATE(id.toString()),
      itemData
    );

    const responseData = (response as { data: ApiResponseData }).data;

    if (responseData.data && responseData.data.item) {
      return new Item(responseData.data.item);
    }

    if (responseData.item) {
      return new Item(responseData.item);
    }

    if (responseData.data) {
      return new Item(responseData.data);
    }

    if (responseData.id) {
      return new Item(responseData);
    }

    throw new Error(
      `Unexpected API response structure for updateItem: ${JSON.stringify(
        responseData
      )}`
    );
  }

  async deleteItem(id: number): Promise<boolean> {
    const response = await this.httpClient.delete(
      API_ENDPOINTS.ITEMS.DELETE(id.toString())
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
