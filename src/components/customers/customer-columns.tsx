import { Badge } from "@/components/ui/badge";
import { Column } from "@/components/reassembledComps/data-table";
import { Customer } from "@/core/domain/entities/Customer";

interface CustomerColumnsProps {
  getDebtBadgeVariant: (hasDebt: boolean, isOverdue: boolean) => string;
  formatDate: (date: string | undefined) => string;
  t: (key: string) => string;
}

export const getCustomerColumns = ({
  getDebtBadgeVariant,
  formatDate,
  t,
}: CustomerColumnsProps): Column<Customer>[] => [
  {
    key: "name",
    header: t("common.name"),
    sortable: true,
    className: "min-w-[100px] max-w-[120px]",
    render: (customer) => (
      <div className="truncate" title={customer.name}>
        {customer.name || "-"}
      </div>
    ),
  },
  {
    key: "email",
    header: t("common.email"),
    sortable: true,
    className: "min-w-[120px] max-w-[150px]",
    render: (customer) => (
      <div className="truncate" title={customer.email}>
        {customer.email || "-"}
      </div>
    ),
  },
  {
    key: "phone",
    header: t("common.phone"),
    sortable: true,
    className: "min-w-[80px] max-w-[100px]",
    render: (customer) => (
      <div className="truncate" title={customer.phone}>
        {customer.phone || "-"}
      </div>
    ),
  },
  {
    key: "address",
    header: t("common.address"),
    sortable: true,
    className: "min-w-[100px] max-w-[120px]",
    render: (customer) => (
      <div className="truncate" title={customer.address}>
        {customer.address || "-"}
      </div>
    ),
  },
  {
    key: "debtStatus",
    header: t("customers.debtStatus"),
    sortable: false,
    className: "min-w-[80px] max-w-[100px]",
    render: (customer) => {
      const hasDebt = customer.hasOutstandingDebt();
      const isOverdue = customer.getOverdueDebts().length > 0;
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
              ? t("customers.overdue")
              : t("customers.hasDebt")
            : t("customers.noDebt")}
        </Badge>
      );
    },
  },
  {
    key: "createdAt",
    header: t("common.createdAt"),
    sortable: true,
    className: "min-w-[70px] max-w-[80px]",
    render: (customer) => (
      <div className="truncate text-xs" title={formatDate(customer.createdAt)}>
        {formatDate(customer.createdAt)}
      </div>
    ),
  },
  {
    key: "updatedAt",
    header: t("common.updatedAt"),
    sortable: true,
    className: "min-w-[70px] max-w-[80px]",
    render: (customer) => (
      <div className="truncate text-xs" title={formatDate(customer.updatedAt)}>
        {formatDate(customer.updatedAt)}
      </div>
    ),
  },
];
