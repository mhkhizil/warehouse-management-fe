export interface Stock {
  id: number;
  itemId: number;
  quantity: number;
  lastRefilled: string;
  refillAlert: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ItemData {
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
  stock: Stock[];
  subItems: Item[];
}

export class Item {
  public id: number;
  public name: string;
  public brand: string;
  public type: string;
  public price: number;
  public isSellable: boolean;
  public remarks: string | null;
  public parentItemId: number | null;
  public createdAt: string;
  public updatedAt: string;
  public stock: Stock[];
  public subItems: Item[];

  // Index signature for compatibility with Record<string, unknown>
  [key: string]: unknown;

  constructor(data: ItemData | Partial<ItemData> | Record<string, unknown>) {
    // Handle case where data might be null, undefined, or malformed
    if (!data) {
      throw new Error("Item data is required");
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
    this.name = String(
      getProperty(data as Record<string, unknown>, "name", "")
    );
    this.brand = String(
      getProperty(data as Record<string, unknown>, "brand", "")
    );
    this.type = String(
      getProperty(data as Record<string, unknown>, "type", "")
    );
    this.price = Number(
      getProperty(data as Record<string, unknown>, "price", 0)
    );
    this.isSellable = Boolean(
      getProperty(data as Record<string, unknown>, "isSellable", true)
    );
    this.remarks =
      (getProperty(data as Record<string, unknown>, "remarks", null) as
        | string
        | null) || null;
    this.parentItemId =
      (getProperty(data as Record<string, unknown>, "parentItemId", null) as
        | number
        | null) || null;
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

    // Handle stock array
    const stockData = getProperty(
      data as Record<string, unknown>,
      "stock",
      []
    );
    this.stock = Array.isArray(stockData) ? (stockData as Stock[]) : [];

    // Handle subItems array
    const subItemsData = getProperty(
      data as Record<string, unknown>,
      "subItems",
      []
    );
    this.subItems = Array.isArray(subItemsData)
      ? subItemsData.map((item: Record<string, unknown>) =>
          item instanceof Item ? item : new Item(item)
        )
      : [];
  }

  isValid(): boolean {
    return !!this.id && !!this.name && this.price >= 0;
  }

  hasStock(): boolean {
    return this.stock.length > 0 && this.getTotalStock() > 0;
  }

  getTotalStock(): number {
    return this.stock.reduce((total, s) => total + s.quantity, 0);
  }

  isLowStock(threshold: number = 10): boolean {
    return this.getTotalStock() < threshold;
  }

  needsRefill(): boolean {
    return this.stock.some((s) => s.refillAlert);
  }

  hasSubItems(): boolean {
    return this.subItems.length > 0;
  }

  isSubItem(): boolean {
    return this.parentItemId !== null;
  }
}
