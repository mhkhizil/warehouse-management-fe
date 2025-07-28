import { Eye, RotateCcw } from "lucide-react";
import { Customer } from "@/core/domain/entities/Customer";
import { Action } from "@/components/reassembledComps/data-table";

interface DeletedCustomerActionsProps {
  onViewCustomer: (customerId: number) => void;
  onRestoreCustomer: (customerId: number) => void;
}

export const getDeletedCustomerActions = ({
  onViewCustomer,
  onRestoreCustomer,
}: DeletedCustomerActionsProps): Action<Customer>[] => [
  {
    label: "View",
    icon: Eye,
    onClick: (customer) => onViewCustomer(customer.id),
  },
  {
    label: "Restore",
    icon: RotateCcw,
    onClick: (customer) => onRestoreCustomer(customer.id),
    variant: "default",
  },
];
