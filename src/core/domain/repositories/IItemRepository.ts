import { Item } from "../entities/Item";
import {
  CreateItemDTO,
  ItemFilterDTO,
  ItemDomainListResponseDTO,
} from "../../application/dtos/ItemDTO";

export interface IItemRepository {
  createItem(itemData: CreateItemDTO): Promise<Item>;

  getItems(params?: ItemFilterDTO): Promise<ItemDomainListResponseDTO>;

  getAllItems(): Promise<Item[]>;

  getEligibleParents(excludeId?: number): Promise<Item[]>;

  getItemById(id: number): Promise<Item>;

  getItemByName(name: string): Promise<Item>;

  getSubItems(parentId: number): Promise<Item[]>;

  updateItem(id: number, itemData: Partial<Item>): Promise<Item>;

  deleteItem(id: number): Promise<boolean>;
}
