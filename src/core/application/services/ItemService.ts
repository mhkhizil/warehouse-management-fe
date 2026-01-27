import { IItemRepository } from "../../domain/repositories/IItemRepository";
import { Item } from "../../domain/entities/Item";
import {
  CreateItemDTO,
  UpdateItemDTO,
  ItemFilterDTO,
  ItemDomainListResponseDTO,
  ItemDTOMapper,
} from "../dtos/ItemDTO";
import { IItemService } from "../../domain/services/IItemService";

export class ItemService implements IItemService {
  constructor(private itemRepository: IItemRepository) {}

  async createItem(itemData: CreateItemDTO): Promise<Item> {
    // Validate required fields for creation
    if (!itemData.name || !itemData.name.trim()) {
      throw new Error("Name is required");
    }

    if (itemData.price < 0) {
      throw new Error("Price cannot be negative");
    }

    return await this.itemRepository.createItem(itemData);
  }

  async getItems(params?: ItemFilterDTO): Promise<ItemDomainListResponseDTO> {
    return await this.itemRepository.getItems(params);
  }

  async getAllItems(): Promise<Item[]> {
    return await this.itemRepository.getAllItems();
  }

  async getEligibleParents(excludeId?: number): Promise<Item[]> {
    return await this.itemRepository.getEligibleParents(excludeId);
  }

  async getItemById(id: number): Promise<Item> {
    if (id <= 0) {
      throw new Error("Invalid item ID");
    }
    return await this.itemRepository.getItemById(id);
  }

  async getItemByName(name: string): Promise<Item> {
    if (!name || !name.trim()) {
      throw new Error("Item name is required");
    }
    return await this.itemRepository.getItemByName(name);
  }

  async getSubItems(parentId: number): Promise<Item[]> {
    if (parentId <= 0) {
      throw new Error("Invalid parent item ID");
    }
    return await this.itemRepository.getSubItems(parentId);
  }

  async updateItem(id: number, itemData: UpdateItemDTO): Promise<Item> {
    if (id <= 0) {
      throw new Error("Invalid item ID");
    }

    // Get existing item to validate the update
    const existingItem = await this.itemRepository.getItemById(id);

    // Use DTO mapper to convert UpdateItemDTO to partial Item
    const updateData = ItemDTOMapper.fromUpdateDTO(itemData);

    // Create a merged item object for validation
    const updatedItem = new Item({
      ...existingItem,
      ...updateData,
    });

    if (!updatedItem.isValid()) {
      throw new Error("Invalid item data");
    }

    return await this.itemRepository.updateItem(id, updateData);
  }

  async deleteItem(id: number): Promise<boolean> {
    if (id <= 0) {
      throw new Error("Invalid item ID");
    }
    return await this.itemRepository.deleteItem(id);
  }

  /**
   * Search items by name
   */
  async searchItemsByName(
    name: string,
    take: number = 10,
    skip: number = 0,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ): Promise<ItemDomainListResponseDTO> {
    if (!name.trim()) {
      throw new Error("Search name cannot be empty");
    }

    return await this.getItems({
      take,
      skip,
      name: name.trim(),
      sortBy,
      sortOrder,
    });
  }

  /**
   * Search items by brand
   */
  async searchItemsByBrand(
    brand: string,
    take: number = 10,
    skip: number = 0,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ): Promise<ItemDomainListResponseDTO> {
    if (!brand.trim()) {
      throw new Error("Search brand cannot be empty");
    }

    return await this.getItems({
      take,
      skip,
      brand: brand.trim(),
      sortBy,
      sortOrder,
    });
  }

  /**
   * Search items by type
   */
  async searchItemsByType(
    type: string,
    take: number = 10,
    skip: number = 0,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ): Promise<ItemDomainListResponseDTO> {
    if (!type.trim()) {
      throw new Error("Search type cannot be empty");
    }

    return await this.getItems({
      take,
      skip,
      type: type.trim(),
      sortBy,
      sortOrder,
    });
  }

  /**
   * Get sellable items
   */
  async getSellableItems(
    take?: number,
    skip?: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ): Promise<ItemDomainListResponseDTO> {
    return await this.getItems({
      take,
      skip,
      isSellable: true,
      sortBy,
      sortOrder,
    });
  }

  /**
   * Get items with low stock
   */
  async getLowStockItems(
    threshold: number = 10,
    take?: number,
    skip?: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ): Promise<ItemDomainListResponseDTO> {
    // Get all items first, then filter for low stock
    const allItemsResult = await this.getItems({
      take: 1000, // Get a large number to filter
      skip: 0,
      sortBy,
      sortOrder,
    });

    // Filter for items with low stock
    const lowStockItems = allItemsResult.items.filter(
      (item) => item.isLowStock(threshold)
    );

    // Apply pagination
    const startIndex = skip || 0;
    const endIndex = startIndex + (take || lowStockItems.length);
    const paginatedItems = lowStockItems.slice(startIndex, endIndex);

    const total = lowStockItems.length;
    const page = Math.floor(startIndex / (take || 10)) + 1;
    const limit = take || 10;
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = endIndex < total;
    const hasPrevPage = startIndex > 0;

    return ItemDTOMapper.toDomainListResponseDTO(
      paginatedItems,
      total,
      page,
      limit,
      totalPages,
      hasNextPage,
      hasPrevPage
    );
  }
}
