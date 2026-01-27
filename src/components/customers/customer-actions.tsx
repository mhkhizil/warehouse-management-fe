import { Eye, Edit, Trash2 } from "lucide-react";
import { Customer } from "@/core/domain/entities/Customer";
import { Action } from "@/components/reassembledComps/data-table";

interface CustomerActionsProps {
  onViewCustomer: (customerId: number) => void;
  onEditCustomer: (customer: Customer) => void;
  onDeleteCustomer: (customerId: number) => void;
  t: (key: string) => string;
}

export const getCustomerActions = ({
  onViewCustomer,
  onEditCustomer,
  onDeleteCustomer,
  t,
}: CustomerActionsProps): Action<Customer>[] => [
  {
    label: t("common.view"),
    icon: Eye,
    onClick: (customer) => onViewCustomer(customer.id),
  },
  {
    label: t("common.edit"),
    icon: Edit,
    onClick: (customer) => onEditCustomer(customer),
  },
  {
    label: t("common.delete"),
    icon: Trash2,
    onClick: (customer) => onDeleteCustomer(customer.id),
    variant: "destructive",
  },
];
