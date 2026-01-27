import { Eye, Edit, Trash2 } from "lucide-react";
import { Stock } from "@/core/domain/entities/Stock";
import { Action } from "@/components/reassembledComps/data-table";

interface StockActionsProps {
  onViewStock: (stockId: number) => void;
  onEditStock: (stock: Stock) => void;
  onDeleteStock: (stockId: number) => void;
  t: (key: string) => string;
}

export const getStockActions = ({
  onViewStock,
  onEditStock,
  onDeleteStock,
  t,
}: StockActionsProps): Action<Stock>[] => [
  {
    label: t("common.view"),
    icon: Eye,
    onClick: (stock) => onViewStock(stock.id),
  },
  {
    label: t("common.edit"),
    icon: Edit,
    onClick: (stock) => onEditStock(stock),
  },
  {
    label: t("common.delete"),
    icon: Trash2,
    onClick: (stock) => onDeleteStock(stock.id),
    variant: "destructive",
  },
];
