import { Badge } from "@/components/ui/badge";
import { Column } from "@/components/reassembledComps/data-table";
import { Supplier } from "@/core/domain/entities/Supplier";

interface GetSupplierColumnsProps {
  getDebtBadgeVariant: (hasDebt: boolean, isOverdue: boolean) => string;
  formatDate: (date: string | undefined) => string;
  t: (key: string) => string;
}

export function getSupplierColumns({
  getDebtBadgeVariant,
  formatDate,
  t,
}: GetSupplierColumnsProps): Column<Supplier>[] {
  return [
    {
      key: "name",
      header: t("common.name"),
      sortable: true,
      className: "min-w-[100px] max-w-[120px]",
      render: (supplier) => (
        <div className="truncate" title={supplier.name}>
          {supplier.name || "-"}
        </div>
      ),
    },
    {
      key: "email",
      header: t("common.email"),
      sortable: true,
      className: "min-w-[120px] max-w-[150px]",
      render: (supplier) => (
        <div className="truncate" title={supplier.email}>
          {supplier.email || "-"}
        </div>
      ),
    },
    {
      key: "phone",
      header: t("common.phone"),
      sortable: true,
      className: "min-w-[80px] max-w-[100px]",
      render: (supplier) => (
        <div className="truncate" title={supplier.phone}>
          {supplier.phone || "-"}
        </div>
      ),
    },
    {
      key: "address",
      header: t("common.address"),
      sortable: true,
      className: "min-w-[100px] max-w-[120px]",
      render: (supplier) => (
        <div className="truncate" title={supplier.address}>
          {supplier.address || "-"}
        </div>
      ),
    },
    {
      key: "contactPerson",
      header: t("suppliers.contactPerson"),
      sortable: true,
      className: "min-w-[100px] max-w-[120px]",
      render: (supplier) => (
        <div className="truncate" title={supplier.contactPerson}>
          {supplier.contactPerson || "-"}
        </div>
      ),
    },
    {
      key: "debtStatus",
      header: t("suppliers.debtStatus"),
      sortable: false,
      className: "min-w-[80px] max-w-[100px]",
      render: (supplier) => {
        const hasDebt = supplier.hasOutstandingDebt();
        const isOverdue = supplier.getOverdueDebts().length > 0;
        const variant = getDebtBadgeVariant(hasDebt, isOverdue);

        return (
          <Badge
            variant={
              variant as "default" | "secondary" | "destructive" | "outline"
            }
            className="text-xs whitespace-nowrap"
          >
            {hasDebt
              ? isOverdue
                ? t("suppliers.overdue")
                : t("suppliers.hasDebt")
              : t("suppliers.noDebt")}
          </Badge>
        );
      },
    },
    {
      key: "createdAt",
      header: t("common.createdAt"),
      sortable: true,
      className: "min-w-[70px] max-w-[80px]",
      render: (supplier) => (
        <div
          className="truncate text-xs"
          title={formatDate(supplier.createdAt)}
        >
          {formatDate(supplier.createdAt)}
        </div>
      ),
    },
    {
      key: "updatedAt",
      header: t("common.updatedAt"),
      sortable: true,
      className: "min-w-[70px] max-w-[80px]",
      render: (supplier) => (
        <div
          className="truncate text-xs"
          title={formatDate(supplier.updatedAt)}
        >
          {formatDate(supplier.updatedAt)}
        </div>
      ),
    },
  ];
}
