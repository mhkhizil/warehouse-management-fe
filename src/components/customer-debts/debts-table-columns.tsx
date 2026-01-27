import { Column } from "@/components/reassembledComps/data-table";
import { CustomerDebt } from "@/core/domain/entities/CustomerDebt";
import { Badge } from "@/components/ui/badge";

interface GetDebtsTableColumnsProps {
  formatDate: (date: string | undefined) => string;
  formatCurrency: (amount: number) => string;
  t: (key: string) => string;
}

export function getDebtsTableColumns({
  formatDate,
  formatCurrency,
  t,
}: GetDebtsTableColumnsProps): Column<CustomerDebt>[] {
  return [
    {
      key: "customer",
      header: t("customers.debts.columns.customer"),
      sortable: true,
      className: "min-w-[120px] max-w-[160px]",
      render: (debt) => (
        <div
          className="truncate"
          title={debt.customer?.name || String(debt.customerId)}
        >
          {debt.customer?.name || `#${debt.customerId}`}
        </div>
      ),
    },
    {
      key: "amount",
      header: t("customers.debts.columns.amount"),
      sortable: true,
      className: "min-w-[80px] max-w-[100px] text-right",
      render: (debt) => (
        <div className="truncate text-right">{formatCurrency(debt.amount)}</div>
      ),
    },
    {
      key: "dueDate",
      header: t("customers.debts.columns.dueDate"),
      sortable: true,
      className: "min-w-[90px] max-w-[110px]",
      render: (debt) => (
        <div className="truncate text-xs" title={formatDate(debt.dueDate)}>
          {formatDate(debt.dueDate)}
        </div>
      ),
    },
    {
      key: "status",
      header: t("customers.debts.columns.status"),
      sortable: false,
      className: "min-w-[90px] max-w-[110px]",
      render: (debt) => (
        <Badge
          variant={
            !debt.isSettled && new Date(debt.dueDate) < new Date()
              ? "destructive"
              : debt.isSettled
              ? "secondary"
              : "default"
          }
          className="text-xs"
        >
          {!debt.isSettled && new Date(debt.dueDate) < new Date()
            ? t("customers.overdue")
            : debt.isSettled
            ? t("customers.settled")
            : t("customers.unsettled")}
        </Badge>
      ),
    },
    {
      key: "transactionId",
      header: t("customers.debts.columns.transactionId"),
      sortable: false,
      className: "min-w-[80px] max-w-[100px]",
      render: (debt) => <span>{debt.transactionId ?? "-"}</span>,
    },
    {
      key: "remarks",
      header: t("customers.debts.columns.remarks"),
      sortable: false,
      className: "min-w-[120px] max-w-[200px]",
      render: (debt) => (
        <div className="truncate" title={debt.remarks}>
          {debt.remarks || "-"}
        </div>
      ),
    },
    {
      key: "createdAt",
      header: t("common.createdAt"),
      sortable: true,
      className: "min-w-[90px] max-w-[110px]",
      render: (debt) => (
        <div className="truncate text-xs" title={formatDate(debt.createdAt)}>
          {formatDate(debt.createdAt)}
        </div>
      ),
    },
    {
      key: "updatedAt",
      header: t("common.updatedAt"),
      sortable: true,
      className: "min-w-[90px] max-w-[110px]",
      render: (debt) => (
        <div className="truncate text-xs" title={formatDate(debt.updatedAt)}>
          {formatDate(debt.updatedAt)}
        </div>
      ),
    },
  ];
}



