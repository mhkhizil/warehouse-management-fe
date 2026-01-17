import { SupplierDebt } from "@/core/domain/entities/SupplierDebt";
import { Action } from "@/components/reassembledComps/data-table";

interface GetDebtsRowActionsProps {
  onView: (debt: SupplierDebt) => void;
  onEdit: (debt: SupplierDebt) => void;
  onDelete: (debt: SupplierDebt) => void;
  onSettle: (debt: SupplierDebt) => void;
  onMarkAlertSent: (debt: SupplierDebt) => void;
  t: (key: string) => string;
}

export function getDebtsRowActions({
  onView,
  onEdit,
  onDelete,
  onSettle,
  onMarkAlertSent,
  t,
}: GetDebtsRowActionsProps): Action<SupplierDebt>[] {
  return [
    { label: t("common.view"), onClick: onView },
    // { label: t("common.edit"), onClick: onEdit },
    {
      label: t("suppliers.debts.actions.settle"),
      onClick: onSettle,
      disabled: (d) => d.isSettled,
    },
    {
      label: t("suppliers.debts.actions.markAlertSent"),
      onClick: onMarkAlertSent,
      disabled: (d) => d.alertSent,
    },
    // { label: t("common.delete"), onClick: onDelete, variant: "destructive" },
  ];
}
