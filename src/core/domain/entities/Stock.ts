import { Item } from "./Item";

export interface StockData {
  id: number;
  itemId: number;
  item?: Item;
  quantity: number;
  lastRefilled: string;
  refillAlert: boolean;
  createdAt: string;
  updatedAt: string;
}

export class Stock {
  public id: number;
  public itemId: number;
  public item: Item | null;
  public quantity: number;
  public lastRefilled: string;
  public refillAlert: boolean;
  public createdAt: string;
  public updatedAt: string;

  // Index signature for compatibility with Record<string, unknown>
  [key: string]: unknown;

  constructor(data: StockData | Partial<StockData> | Record<string, unknown>) {
    // Handle case where data might be null, undefined, or malformed
    if (!data) {
      throw new Error("Stock data is required");
    }

    // Type guard function to safely access properties
    const getProperty = (
      obj: Record<string, unknown>,
      key: string,
      defaultValue: unknown
    ) => {
      return obj[key] !== undefined ? obj[key] : defaultValue;
    };

    // Safely extract properties with fallbacks
    this.id = Number(getProperty(data as Record<string, unknown>, "id", 0));
    this.itemId = Number(
      getProperty(data as Record<string, unknown>, "itemId", 0)
    );
    this.quantity = Number(
      getProperty(data as Record<string, unknown>, "quantity", 0)
    );
    this.lastRefilled = String(
      getProperty(
        data as Record<string, unknown>,
        "lastRefilled",
        new Date().toISOString()
      )
    );
    this.refillAlert = Boolean(
      getProperty(data as Record<string, unknown>, "refillAlert", false)
    );
    this.createdAt = String(
      getProperty(
        data as Record<string, unknown>,
        "createdAt",
        new Date().toISOString()
      )
    );
    this.updatedAt = String(
      getProperty(
        data as Record<string, unknown>,
        "updatedAt",
        new Date().toISOString()
      )
    );

    // Handle item object
    const itemData = getProperty(
      data as Record<string, unknown>,
      "item",
      null
    );
    this.item =
      itemData && typeof itemData === "object"
        ? itemData instanceof Item
          ? itemData
          : new Item(itemData as Record<string, unknown>)
        : null;
  }

  isValid(): boolean {
    return !!this.id && !!this.itemId && this.quantity >= 0;
  }

  isLowStock(threshold: number = 10): boolean {
    return this.quantity < threshold;
  }

  needsRefill(): boolean {
    return this.refillAlert;
  }

  getItemName(): string {
    return this.item?.name || "-";
  }

  getItemBrand(): string {
    return this.item?.brand || "-";
  }

  getItemType(): string {
    return this.item?.type || "-";
  }
}
