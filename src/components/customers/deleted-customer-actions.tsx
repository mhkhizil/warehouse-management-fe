import { Eye, RotateCcw } from "lucide-react";
import { Customer } from "@/core/domain/entities/Customer";
import { Action } from "@/components/reassembledComps/data-table";

interface DeletedCustomerActionsProps {
  onViewCustomer: (customerId: number) => void;
  onRestoreCustomer: (customerId: number) => void;
  t: (key: string) => string;
}

export const getDeletedCustomerActions = ({
  onViewCustomer,
  onRestoreCustomer,
  t,
}: DeletedCustomerActionsProps): Action<Customer>[] => [
  {
    label: t("common.view"),
    icon: Eye,
    onClick: (customer) => onViewCustomer(customer.id),
  },
  {
    label: t("common.restore"),
    icon: RotateCcw,
    onClick: (customer) => onRestoreCustomer(customer.id),
    variant: "default",
  },
];
