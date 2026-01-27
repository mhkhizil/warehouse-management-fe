import { Badge } from "@/components/ui/badge";
import { Column } from "@/components/reassembledComps/data-table";
import { Stock } from "@/core/domain/entities/Stock";

interface StockColumnsProps {
  formatDate: (date: string | undefined) => string;
  t: (key: string) => string;
}

export const getStockColumns = ({
  formatDate,
  t,
}: StockColumnsProps): Column<Stock>[] => [
  {
    key: "itemName",
    header: t("stocks.itemName"),
    sortable: true,
    className: "min-w-[120px] max-w-[150px]",
    render: (stock) => (
      <div className="truncate" title={stock.getItemName()}>
        {stock.getItemName()}
      </div>
    ),
  },
  {
    key: "itemBrand",
    header: t("items.brand"),
    sortable: false,
    className: "min-w-[80px] max-w-[100px]",
    render: (stock) => (
      <div className="truncate" title={stock.getItemBrand()}>
        {stock.getItemBrand()}
      </div>
    ),
  },
  {
    key: "itemType",
    header: t("items.type"),
    sortable: false,
    className: "min-w-[80px] max-w-[100px]",
    render: (stock) => (
      <div className="truncate" title={stock.getItemType()}>
        {stock.getItemType()}
      </div>
    ),
  },
  {
    key: "quantity",
    header: t("stocks.quantity"),
    sortable: true,
    className: "min-w-[80px] max-w-[100px]",
    render: (stock) => {
      const isLowStock = stock.isLowStock(10);

      return (
        <span
          className={`font-medium ${isLowStock ? "text-red-500" : ""}`}
        >
          {stock.quantity}
        </span>
      );
    },
  },
  {
    key: "refillAlert",
    header: t("stocks.refillAlert"),
    sortable: true,
    className: "min-w-[80px] max-w-[100px]",
    render: (stock) => (
      <Badge variant={stock.refillAlert ? "destructive" : "secondary"}>
        {stock.refillAlert ? t("common.yes") : t("common.no")}
      </Badge>
    ),
  },
  {
    key: "lastRefilled",
    header: t("stocks.lastRefilled"),
    sortable: true,
    className: "min-w-[80px] max-w-[100px]",
    render: (stock) => (
      <div className="truncate text-xs" title={formatDate(stock.lastRefilled)}>
        {formatDate(stock.lastRefilled)}
      </div>
    ),
  },
  {
    key: "createdAt",
    header: t("common.createdAt"),
    sortable: true,
    className: "min-w-[70px] max-w-[80px]",
    render: (stock) => (
      <div className="truncate text-xs" title={formatDate(stock.createdAt)}>
        {formatDate(stock.createdAt)}
      </div>
    ),
  },
  {
    key: "updatedAt",
    header: t("common.updatedAt"),
    sortable: true,
    className: "min-w-[70px] max-w-[80px]",
    render: (stock) => (
      <div className="truncate text-xs" title={formatDate(stock.updatedAt)}>
        {formatDate(stock.updatedAt)}
      </div>
    ),
  },
];
