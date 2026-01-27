import { Badge } from "@/components/ui/badge";
import { Column } from "@/components/reassembledComps/data-table";
import { Item } from "@/core/domain/entities/Item";

interface ItemColumnsProps {
  formatDate: (date: string | undefined) => string;
  formatCurrency: (value: number | undefined) => string;
  t: (key: string) => string;
}

export const getItemColumns = ({
  formatDate,
  formatCurrency,
  t,
}: ItemColumnsProps): Column<Item>[] => [
  {
    key: "name",
    header: t("common.name"),
    sortable: true,
    className: "min-w-[120px] max-w-[150px]",
    render: (item) => (
      <div className="truncate" title={item.name}>
        {item.name || "-"}
      </div>
    ),
  },
  {
    key: "brand",
    header: t("items.brand"),
    sortable: true,
    className: "min-w-[80px] max-w-[100px]",
    render: (item) => (
      <div className="truncate" title={item.brand}>
        {item.brand || "-"}
      </div>
    ),
  },
  {
    key: "type",
    header: t("items.type"),
    sortable: true,
    className: "min-w-[80px] max-w-[100px]",
    render: (item) => (
      <div className="truncate" title={item.type}>
        {item.type || "-"}
      </div>
    ),
  },
  {
    key: "price",
    header: t("items.price"),
    sortable: true,
    className: "min-w-[80px] max-w-[100px]",
    render: (item) => (
      <div className="text-right font-medium">
        {formatCurrency(item.price)}
      </div>
    ),
  },
  {
    key: "isSellable",
    header: t("items.sellable"),
    sortable: true,
    className: "min-w-[80px] max-w-[100px]",
    render: (item) => (
      <Badge variant={item.isSellable ? "default" : "secondary"}>
        {item.isSellable ? t("common.yes") : t("common.no")}
      </Badge>
    ),
  },
  {
    key: "stock",
    header: t("items.stockQuantity"),
    sortable: false,
    className: "min-w-[80px] max-w-[100px]",
    render: (item) => {
      const totalStock = item.getTotalStock();
      const isLowStock = item.isLowStock(10);
      const needsRefill = item.needsRefill();

      return (
        <div className="flex items-center gap-2">
          <span
            className={`font-medium ${
              isLowStock ? "text-red-500" : needsRefill ? "text-orange-500" : ""
            }`}
          >
            {totalStock}
          </span>
          {needsRefill && (
            <Badge variant="destructive" className="text-xs">
              {t("items.refillNeeded")}
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    key: "createdAt",
    header: t("common.createdAt"),
    sortable: true,
    className: "min-w-[70px] max-w-[80px]",
    render: (item) => (
      <div className="truncate text-xs" title={formatDate(item.createdAt)}>
        {formatDate(item.createdAt)}
      </div>
    ),
  },
  {
    key: "updatedAt",
    header: t("common.updatedAt"),
    sortable: true,
    className: "min-w-[70px] max-w-[80px]",
    render: (item) => (
      <div className="truncate text-xs" title={formatDate(item.updatedAt)}>
        {formatDate(item.updatedAt)}
      </div>
    ),
  },
];
