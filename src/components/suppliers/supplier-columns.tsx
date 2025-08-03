import { Badge } from "@/components/ui/badge";
import { Column } from "@/components/reassembledComps/data-table";
import { Supplier } from "@/core/domain/entities/Supplier";

interface GetSupplierColumnsProps {
  getDebtBadgeVariant: (hasDebt: boolean, isOverdue: boolean) => string;
  formatDate: (date: string | undefined) => string;
}

export function getSupplierColumns({
  getDebtBadgeVariant,
  formatDate,
}: GetSupplierColumnsProps): Column<Supplier>[] {
  return [
    {
      key: "name",
      header: "Name",
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
      header: "Email",
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
      header: "Phone",
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
      header: "Address",
      sortable: true,
      className: "min-w-[100px] max-w-[120px]",
      render: (supplier) => (
        <div className="truncate" title={supplier.address}>
          {supplier.address || "-"}
        </div>
      ),
    },
    {
      key: "debtStatus",
      header: "Debt Status",
      sortable: true,
      className: "min-w-[80px] max-w-[100px]",
      render: (supplier) => {
        const hasDebt = (supplier as any).hasOutstandingDebt?.() || false;
        const isOverdue = (supplier as any).isOverdue?.() || false;
        const variant = getDebtBadgeVariant(hasDebt, isOverdue);

        return (
          <Badge
            variant={
              variant as "default" | "secondary" | "destructive" | "outline"
            }
            className="text-xs whitespace-nowrap"
          >
            {hasDebt ? (isOverdue ? "Overdue" : "Has Debt") : "No Debt"}
          </Badge>
        );
      },
    },
    {
      key: "createdAt",
      header: "Created",
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
      header: "Updated",
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
