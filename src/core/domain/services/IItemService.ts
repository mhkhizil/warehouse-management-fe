import { Item } from "../entities/Item";
import {
  CreateItemDTO,
  UpdateItemDTO,
  ItemFilterDTO,
  ItemDomainListResponseDTO,
} from "../../application/dtos/ItemDTO";

/**
 * Interface for item service
 */
export interface IItemService {
  /**
   * Create a new item
   */
  createItem(itemData: CreateItemDTO): Promise<Item>;

  /**
   * Get items with pagination, filtering, and sorting
   */
  getItems(params?: ItemFilterDTO): Promise<ItemDomainListResponseDTO>;

  /**
   * Get all items without pagination
   */
  getAllItems(): Promise<Item[]>;

  /**
   * Get eligible parent items for sub-item creation/editing
   * @param excludeId - Optional item ID to exclude (used when editing to prevent circular references)
   */
  getEligibleParents(excludeId?: number): Promise<Item[]>;

  /**
   * Get item by ID
   */
  getItemById(id: number): Promise<Item>;

  /**
   * Get item by name
   */
  getItemByName(name: string): Promise<Item>;

  /**
   * Get sub-items of a parent item
   */
  getSubItems(parentId: number): Promise<Item[]>;

  /**
   * Update item
   */
  updateItem(id: number, itemData: UpdateItemDTO): Promise<Item>;

  /**
   * Delete item
   */
  deleteItem(id: number): Promise<boolean>;

  /**
   * Search items by name
   */
  searchItemsByName(
    name: string,
    take?: number,
    skip?: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ): Promise<ItemDomainListResponseDTO>;

  /**
   * Search items by brand
   */
  searchItemsByBrand(
    brand: string,
    take?: number,
    skip?: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ): Promise<ItemDomainListResponseDTO>;

  /**
   * Search items by type
   */
  searchItemsByType(
    type: string,
    take?: number,
    skip?: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ): Promise<ItemDomainListResponseDTO>;

  /**
   * Get sellable items
   */
  getSellableItems(
    take?: number,
    skip?: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ): Promise<ItemDomainListResponseDTO>;

  /**
   * Get items with low stock
   */
  getLowStockItems(
    threshold?: number,
    take?: number,
    skip?: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ): Promise<ItemDomainListResponseDTO>;
}
