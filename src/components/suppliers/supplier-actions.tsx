import { Eye, Edit, Trash2, RotateCcw } from "lucide-react";
import { Supplier } from "@/core/domain/entities/Supplier";
import { Action } from "@/components/reassembledComps/data-table";

interface GetSupplierActionsProps {
  onViewSupplier: (supplierId: number) => void;
  onEditSupplier: (supplier: Supplier) => void;
  onDeleteSupplier: (supplierId: number) => void;
}

interface GetDeletedSupplierActionsProps {
  onViewSupplier: (supplierId: number) => void;
  onRestoreSupplier: (supplierId: number) => void;
}

export function getSupplierActions({
  onViewSupplier,
  onEditSupplier,
  onDeleteSupplier,
}: GetSupplierActionsProps): Action<Supplier>[] {
  return [
    {
      label: "View",
      icon: Eye,
      onClick: (supplier) => onViewSupplier(supplier.id),
    },
    {
      label: "Edit",
      icon: Edit,
      onClick: (supplier) => onEditSupplier(supplier),
    },
    {
      label: "Delete",
      icon: Trash2,
      onClick: (supplier) => onDeleteSupplier(supplier.id),
      variant: "destructive",
    },
  ];
}

export function getDeletedSupplierActions({
  onViewSupplier,
  onRestoreSupplier,
}: GetDeletedSupplierActionsProps): Action<Supplier>[] {
  return [
    {
      label: "View",
      icon: Eye,
      onClick: (supplier) => onViewSupplier(supplier.id),
    },
    {
      label: "Restore",
      icon: RotateCcw,
      onClick: (supplier) => onRestoreSupplier(supplier.id),
    },
  ];
}
