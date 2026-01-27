import { Eye, Edit, Trash2, Layers } from "lucide-react";
import { Item } from "@/core/domain/entities/Item";
import { Action } from "@/components/reassembledComps/data-table";

interface ItemActionsProps {
  onViewItem: (itemId: number) => void;
  onEditItem: (item: Item) => void;
  onDeleteItem: (itemId: number) => void;
  onViewSubItems?: (itemId: number) => void;
  t: (key: string) => string;
}

export const getItemActions = ({
  onViewItem,
  onEditItem,
  onDeleteItem,
  onViewSubItems,
  t,
}: ItemActionsProps): Action<Item>[] => {
  const actions: Action<Item>[] = [
    {
      label: t("common.view"),
      icon: Eye,
      onClick: (item) => onViewItem(item.id),
    },
    {
      label: t("common.edit"),
      icon: Edit,
      onClick: (item) => onEditItem(item),
    },
    {
      label: t("common.delete"),
      icon: Trash2,
      onClick: (item) => onDeleteItem(item.id),
      variant: "destructive",
    },
  ];

  // Add view sub-items action if callback is provided
  if (onViewSubItems) {
    actions.splice(1, 0, {
      label: t("items.viewSubItems"),
      icon: Layers,
      onClick: (item) => onViewSubItems(item.id),
      showCondition: (item) => item.hasSubItems(),
    });
  }

  return actions;
};
