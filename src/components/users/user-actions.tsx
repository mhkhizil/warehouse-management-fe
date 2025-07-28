import { Eye, Edit, Trash2 } from "lucide-react";
import { User } from "@/core/domain/entities/User";
import { Action } from "@/components/reassembledComps/data-table";

interface UserActionsProps {
  onViewUser: (userId: string) => void;
  onEditUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
}

export const getUserActions = ({
  onViewUser,
  onEditUser,
  onDeleteUser,
}: UserActionsProps): Action<User>[] => [
  {
    label: "View",
    icon: Eye,
    onClick: (user) => onViewUser(user.id),
  },
  {
    label: "Edit",
    icon: Edit,
    onClick: (user) => onEditUser(user),
    adminOnly: true,
  },
  {
    label: "Delete",
    icon: Trash2,
    onClick: (user) => onDeleteUser(user.id),
    variant: "destructive",
    adminOnly: true,
  },
];
