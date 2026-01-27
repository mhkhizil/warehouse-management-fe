import { CustomerDebt } from "@/core/domain/entities/CustomerDebt";
import { Action } from "@/components/reassembledComps/data-table";

interface GetDebtsRowActionsProps {
  onView: (debt: CustomerDebt) => void;
  onEdit: (debt: CustomerDebt) => void;
  onDelete: (debt: CustomerDebt) => void;
  onSettle: (debt: CustomerDebt) => void;
  onMarkAlertSent: (debt: CustomerDebt) => void;
  t: (key: string) => string;
}

export function getDebtsRowActions({
  onView,

  onSettle,
  onMarkAlertSent,
  t,
}: GetDebtsRowActionsProps): Action<CustomerDebt>[] {
  return [
    { label: t("common.view"), onClick: onView },
    // { label: t("common.edit"), onClick: onEdit },
    {
      label: t("customers.debts.actions.settle"),
      onClick: onSettle,
      disabled: (d) => d.isSettled,
    },
    {
      label: t("customers.debts.actions.markAlertSent"),
      onClick: onMarkAlertSent,
      disabled: (d) => d.alertSent,
    },
    // { label: t("common.delete"), onClick: onDelete, variant: "destructive" },
  ];
}
