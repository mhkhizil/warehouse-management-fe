import { Eye, Edit, Trash2 } from "lucide-react";
import { Customer } from "@/core/domain/entities/Customer";
import { Action } from "@/components/reassembledComps/data-table";

interface CustomerActionsProps {
  onViewCustomer: (customerId: number) => void;
  onEditCustomer: (customer: Customer) => void;
  onDeleteCustomer: (customerId: number) => void;
}

export const getCustomerActions = ({
  onViewCustomer,
  onEditCustomer,
  onDeleteCustomer,
}: CustomerActionsProps): Action<Customer>[] => [
  {
    label: "View",
    icon: Eye,
    onClick: (customer) => onViewCustomer(customer.id),
  },
  {
    label: "Edit",
    icon: Edit,
    onClick: (customer) => onEditCustomer(customer),
  },
  {
    label: "Delete",
    icon: Trash2,
    onClick: (customer) => onDeleteCustomer(customer.id),
    variant: "destructive",
  },
];
