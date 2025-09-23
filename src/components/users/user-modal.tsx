import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User as UserIcon, Shield } from "lucide-react";
import { User } from "@/core/domain/entities/User";
import { UpdateUserDTO } from "@/core/application/dtos/UserDTO";
import { Modal, FormModal } from "@/components/reassembledComps/modal";
import { Select as CustomSelect } from "@/components/reassembledComps/select";
import { PasswordInput } from "@/components/reassembledComps/password-input";
import { useDateFormatter } from "@/lib/i18n/formatters";

// ROLE_OPTIONS will be defined inside the component to use translations

type UserModalVariant = "view" | "create" | "edit";

interface UserModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  variant: UserModalVariant;
  onSave?: (userData: UpdateUserDTO & { password?: string }) => void;
  isLoading?: boolean;
  currentUser?: User | null;
}

export const UserModal: React.FC<UserModalProps> = ({
  user,
  isOpen,
  onClose,
  variant,
  onSave,
  isLoading = false,
  currentUser,
}) => {
  const { t } = useTranslation();
  const { formatDateLong } = useDateFormatter();

  const ROLE_OPTIONS = [
    { value: "STAFF" as const, label: t("users.staff") },
    { value: "ADMIN" as const, label: t("users.admin") },
  ] as const;
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "STAFF" as "ADMIN" | "STAFF",
    password: "",
  });

  useEffect(() => {
    if (user && (variant === "edit" || variant === "view")) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        role: user.role,
        password: "",
      });
    } else if (variant === "create") {
      setFormData({
        name: "",
        email: "",
        phone: "",
        role: "STAFF",
        password: "",
      });
    }
  }, [user, variant]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!onSave) return;

    // Check if current user is admin for creating new users
    if (variant === "create" && !currentUser?.isAdmin()) {
      alert(t("users.onlyAdminsCanCreateUsers"));
      return;
    }

    onSave(formData);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "default";
      case "STAFF":
        return "secondary";
      default:
        return "outline";
    }
  };

  // formatDate is now handled by useDateFormatter hook

  // View Mode
  if (variant === "view" && user) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={t("users.userDetails")}
        maxWidth="max-w-2xl"
        maxHeight="max-h-[90vh]"
      >
        <div className="space-y-6">
          {/* User Header */}
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
              {user.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xl font-bold text-primary">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <h3 className="text-xl font-semibold">{user.name}</h3>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          {/* Basic Information */}
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <UserIcon className="h-4 w-4" />
              {t("users.basicInformation")}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("users.fullName")}
                </label>
                <p className="text-sm font-medium">{user.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("users.emailAddress")}
                </label>
                <p className="text-sm font-medium">{user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("users.phoneNumber")}
                </label>
                <p className="text-sm font-medium">
                  {user.phone || t("users.notProvided")}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("users.role")}
                </label>
                <div className="mt-1">
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {user.role}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              {t("users.accountInformation")}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("users.accountStatus")}
                </label>
                <p className="text-sm font-medium">
                  <Badge variant="secondary">{t("users.active")}</Badge>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("common.createdAt")}
                </label>
                <p className="text-sm font-medium">
                  {formatDateLong(user.createdDate)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  {t("common.updatedAt")}
                </label>
                <p className="text-sm font-medium">
                  {formatDateLong(user.updatedDate)}
                </p>
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              {t("users.permissions")}
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <span className="text-sm">{t("users.userManagement")}</span>
                <Badge variant={user.isAdmin() ? "default" : "secondary"}>
                  {user.isAdmin() ? t("users.fullAccess") : t("users.viewOnly")}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <span className="text-sm">
                  {t("users.inventoryManagement")}
                </span>
                <Badge variant="default">{t("users.fullAccess")}</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <span className="text-sm">{t("users.orderManagement")}</span>
                <Badge variant="default">{t("users.fullAccess")}</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <span className="text-sm">{t("users.profileManagement")}</span>
                <Badge variant="default">{t("users.fullAccess")}</Badge>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={onClose}>{t("common.close")}</Button>
          </div>
        </div>
      </Modal>
    );
  }

  // Create/Edit Mode
  const formContent = (
    <>
      <div>
        <label className="block text-sm font-medium mb-1">
          {t("common.name")}
        </label>
        <Input
          type="text"
          required
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          placeholder={t("users.enterUserName")}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          {t("common.email")}
        </label>
        <Input
          type="email"
          required
          value={formData.email}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, email: e.target.value }))
          }
          placeholder={t("users.enterEmailAddress")}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          {t("common.phone")}
        </label>
        <Input
          type="tel"
          value={formData.phone}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, phone: e.target.value }))
          }
          placeholder={t("users.enterPhoneNumber")}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          {t("users.role")}
        </label>
        <CustomSelect
          value={formData.role}
          onValueChange={(value) =>
            setFormData((prev) => ({
              ...prev,
              role: value as "ADMIN" | "STAFF",
            }))
          }
          options={ROLE_OPTIONS}
          minWidth="w-full"
        />
      </div>

      {variant === "create" && (
        <div>
          <label className="block text-sm font-medium mb-1">
            {t("users.password")}
          </label>
          <PasswordInput
            value={formData.password}
            onChange={(password) => {
              setFormData((prev) => ({
                ...prev,
                password: password,
              }));
            }}
            required
            minLength={6}
          />
        </div>
      )}
    </>
  );

  const getTitle = () => {
    switch (variant) {
      case "create":
        return t("users.createNewUserAdminOnly");
      case "edit":
        return t("users.editUser");
      default:
        return t("users.userDetails");
    }
  };

  const getSubmitText = () => {
    switch (variant) {
      case "create":
        return t("users.createUser");
      case "edit":
        return t("common.update");
      default:
        return t("common.save");
    }
  };

  const getLoadingText = () => {
    switch (variant) {
      case "create":
        return t("users.creating");
      case "edit":
        return t("users.updating");
      default:
        return t("users.saving");
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title={getTitle()}
      formContent={formContent}
      onSubmit={handleSubmit}
      isLoading={isLoading}
      submitText={getSubmitText()}
      loadingText={getLoadingText()}
      cancelText={t("common.cancel")}
    />
  );
};
