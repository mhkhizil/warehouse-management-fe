import { Eye, Edit, Trash2 } from "lucide-react";
import { User } from "@/core/domain/entities/User";
import { Action } from "@/components/reassembledComps/data-table";

interface UserActionsProps {
  onViewUser: (userId: string) => void;
  onEditUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  t: (key: string) => string;
}

export const getUserActions = ({
  onViewUser,
  onEditUser,
  onDeleteUser,
  t,
}: UserActionsProps): Action<User>[] => [
  {
    label: t("common.view"),
    icon: Eye,
    onClick: (user) => onViewUser(user.id),
  },
  {
    label: t("common.edit"),
    icon: Edit,
    onClick: (user) => onEditUser(user),
    adminOnly: true,
  },
  {
    label: t("common.delete"),
    icon: Trash2,
    onClick: (user) => onDeleteUser(user.id),
    variant: "destructive",
    adminOnly: true,
  },
];
