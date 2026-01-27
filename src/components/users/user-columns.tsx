import { Badge } from "@/components/ui/badge";
import { User } from "@/core/domain/entities/User";
import { Column } from "@/components/reassembledComps/data-table";

interface UserColumnsProps {
  getRoleBadgeVariant: (role: string) => "default" | "secondary" | "outline";
  formatDate: (date: Date | undefined) => string;
  t: (key: string) => string;
}

export const getUserColumns = ({
  getRoleBadgeVariant,
  formatDate,
  t,
}: UserColumnsProps): Column<User>[] => [
  {
    key: "name",
    header: t("common.name"),
    sortable: true,
    render: (user) => (
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center overflow-hidden">
          {user.profileImageUrl ? (
            <img
              src={user.profileImageUrl}
              alt={user.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-sm font-medium">
              {user.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="font-medium">{user.name}</div>
      </div>
    ),
  },
  {
    key: "email",
    header: t("common.email"),
    sortable: true,
    render: (user) => (
      <span className="text-muted-foreground">{user.email}</span>
    ),
  },
  {
    key: "role",
    header: t("users.role"),
    sortable: true,
    render: (user) => (
      <Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge>
    ),
  },
  {
    key: "phone",
    header: t("common.phone"),
    sortable: true,
    render: (user) => user.phone || "-",
  },
  {
    key: "createdAt",
    header: t("common.createdAt"),
    sortable: true,
    render: (user) => (
      <span className="text-muted-foreground">
        {formatDate(user.createdDate)}
      </span>
    ),
  },
  {
    key: "updatedAt",
    header: t("common.updatedAt"),
    sortable: true,
    render: (user) => (
      <span className="text-muted-foreground">
        {formatDate(user.updatedDate)}
      </span>
    ),
  },
];
