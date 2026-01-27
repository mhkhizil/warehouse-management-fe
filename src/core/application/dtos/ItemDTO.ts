import { Item, Stock as ItemStock } from "../../domain/entities/Item";

export interface CreateItemDTO {
  name: string;
  brand: string;
  type: string;
  price: number;
  isSellable: boolean;
  remarks?: string;
  parentItemId?: number;
  initialQuantity?: number;
  refillAlert?: boolean;
}

export interface UpdateItemDTO {
  name?: string;
  brand?: string;
  type?: string;
  price?: number;
  isSellable?: boolean;
  remarks?: string;
  parentItemId?: number;
  initialQuantity?: number;
  refillAlert?: boolean;
  stockQuantity?: number;
}

export interface ItemResponseDTO {
  id: number;
  name: string;
  brand: string;
  type: string;
  price: number;
  isSellable: boolean;
  remarks: string | null;
  parentItemId: number | null;
  createdAt: string;
  updatedAt: string;
  stock: ItemStock[];
  subItems: Item[];
}

export interface ItemListResponseDTO {
  items: ItemResponseDTO[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// Domain response DTO that uses Item entities (for internal service layer)
export interface ItemDomainListResponseDTO {
  items: Item[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ItemFilterDTO {
  name?: string;
  brand?: string;
  type?: string;
  isSellable?: boolean;
  skip?: number;
  take?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Utility functions for DTO conversion
export class ItemDTOMapper {
  static toResponseDTO(item: Item): ItemResponseDTO {
    return {
      id: item.id,
      name: item.name,
      brand: item.brand,
      type: item.type,
      price: item.price,
      isSellable: item.isSellable,
      remarks: item.remarks,
      parentItemId: item.parentItemId,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      stock: item.stock,
      subItems: item.subItems,
    };
  }

  static toResponseDTOList(items: Item[]): ItemResponseDTO[] {
    return items.map((item) => this.toResponseDTO(item));
  }

  static toDomainListResponseDTO(
    items: Item[],
    total: number,
    page: number,
    limit: number,
    totalPages: number,
    hasNextPage: boolean,
    hasPrevPage: boolean
  ): ItemDomainListResponseDTO {
    return {
      items,
      total,
      page,
      limit,
      totalPages,
      hasNextPage,
      hasPrevPage,
    };
  }

  static fromCreateDTO(
    dto: CreateItemDTO
  ): Omit<Item, "id" | "createdAt" | "updatedAt" | "stock" | "subItems"> {
    return {
      name: dto.name,
      brand: dto.brand,
      type: dto.type,
      price: dto.price,
      isSellable: dto.isSellable,
      remarks: dto.remarks || null,
      parentItemId: dto.parentItemId || null,
    };
  }

  static fromUpdateDTO(dto: UpdateItemDTO): Partial<Item> {
    const updateData: Partial<Item> = {};

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.brand !== undefined) updateData.brand = dto.brand;
    if (dto.type !== undefined) updateData.type = dto.type;
    if (dto.price !== undefined) updateData.price = dto.price;
    if (dto.isSellable !== undefined) updateData.isSellable = dto.isSellable;
    if (dto.remarks !== undefined) updateData.remarks = dto.remarks;
    if (dto.parentItemId !== undefined)
      updateData.parentItemId = dto.parentItemId;

    return updateData;
  }
}
