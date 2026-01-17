import { Column } from "@/components/reassembledComps/data-table";
import { SupplierDebt } from "@/core/domain/entities/SupplierDebt";
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
}: GetDebtsTableColumnsProps): Column<SupplierDebt>[] {
  return [
    {
      key: "supplier",
      header: t("suppliers.debts.columns.supplier"),
      sortable: true,
      className: "min-w-[120px] max-w-[160px]",
      render: (debt) => (
        <div
          className="truncate"
          title={debt.supplier?.name || String(debt.supplierId)}
        >
          {debt.supplier?.name || `#${debt.supplierId}`}
        </div>
      ),
    },
    {
      key: "amount",
      header: t("suppliers.debts.columns.amount"),
      sortable: true,
      className: "min-w-[80px] max-w-[100px] text-right",
      render: (debt) => (
        <div className="truncate text-right">{formatCurrency(debt.amount)}</div>
      ),
    },
    {
      key: "dueDate",
      header: t("suppliers.debts.columns.dueDate"),
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
      header: t("suppliers.debts.columns.status"),
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
            ? t("suppliers.overdue")
            : debt.isSettled
            ? t("suppliers.settled")
            : t("suppliers.unsettled")}
        </Badge>
      ),
    },
    {
      key: "transactionId",
      header: t("suppliers.debts.columns.transactionId"),
      sortable: false,
      className: "min-w-[80px] max-w-[100px]",
      render: (debt) => <span>{debt.transactionId ?? "-"}</span>,
    },
    {
      key: "remarks",
      header: t("suppliers.debts.columns.remarks"),
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
