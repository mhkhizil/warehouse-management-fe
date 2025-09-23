import { Eye, Edit, Trash2, RotateCcw } from "lucide-react";
import { Supplier } from "@/core/domain/entities/Supplier";
import { Action } from "@/components/reassembledComps/data-table";

interface GetSupplierActionsProps {
  onViewSupplier: (supplierId: number) => void;
  onEditSupplier: (supplier: Supplier) => void;
  onDeleteSupplier: (supplierId: number) => void;
  t: (key: string) => string;
}

interface GetDeletedSupplierActionsProps {
  onViewSupplier: (supplierId: number) => void;
  onRestoreSupplier: (supplierId: number) => void;
  t: (key: string) => string;
}

export function getSupplierActions({
  onViewSupplier,
  onEditSupplier,
  onDeleteSupplier,
  t,
}: GetSupplierActionsProps): Action<Supplier>[] {
  return [
    {
      label: t("common.view"),
      icon: Eye,
      onClick: (supplier) => onViewSupplier(supplier.id),
    },
    {
      label: t("common.edit"),
      icon: Edit,
      onClick: (supplier) => onEditSupplier(supplier),
    },
    {
      label: t("common.delete"),
      icon: Trash2,
      onClick: (supplier) => onDeleteSupplier(supplier.id),
      variant: "destructive",
    },
  ];
}

export function getDeletedSupplierActions({
  onViewSupplier,
  onRestoreSupplier,
  t,
}: GetDeletedSupplierActionsProps): Action<Supplier>[] {
  return [
    {
      label: t("common.view"),
      icon: Eye,
      onClick: (supplier) => onViewSupplier(supplier.id),
    },
    {
      label: t("common.restore"),
      icon: RotateCcw,
      onClick: (supplier) => onRestoreSupplier(supplier.id),
    },
  ];
}
