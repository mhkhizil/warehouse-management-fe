import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User as UserIcon, Shield } from "lucide-react";
import { User } from "@/core/domain/entities/User";
import { UpdateUserDTO } from "@/core/application/dtos/UserDTO";
import { Modal, FormModal } from "@/components/reassembledComps/modal";
import { Select as CustomSelect } from "@/components/reassembledComps/select";
import { PasswordInput } from "@/components/reassembledComps/password-input";

const ROLE_OPTIONS = [
  { value: "STAFF" as const, label: "Staff" },
  { value: "ADMIN" as const, label: "Admin" },
] as const;

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
      alert("Only administrators can create new users");
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

  const formatDate = (date: Date | undefined) => {
    if (!date) return "-";
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // View Mode
  if (variant === "view" && user) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="User Details"
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
              Basic Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Full Name
                </label>
                <p className="text-sm font-medium">{user.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Email Address
                </label>
                <p className="text-sm font-medium">{user.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Phone Number
                </label>
                <p className="text-sm font-medium">
                  {user.phone || "Not provided"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Role
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
              Account Information
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Account Status
                </label>
                <p className="text-sm font-medium">
                  <Badge variant="secondary">Active</Badge>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Created Date
                </label>
                <p className="text-sm font-medium">
                  {formatDate(user.createdDate)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Last Updated
                </label>
                <p className="text-sm font-medium">
                  {formatDate(user.updatedDate)}
                </p>
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div>
            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Permissions
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <span className="text-sm">User Management</span>
                <Badge variant={user.isAdmin() ? "default" : "secondary"}>
                  {user.isAdmin() ? "Full Access" : "View Only"}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <span className="text-sm">Inventory Management</span>
                <Badge variant="default">Full Access</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <span className="text-sm">Order Management</span>
                <Badge variant="default">Full Access</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted rounded">
                <span className="text-sm">Profile Management</span>
                <Badge variant="default">Full Access</Badge>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </Modal>
    );
  }

  // Create/Edit Mode
  const formContent = (
    <>
      <div>
        <label className="block text-sm font-medium mb-1">Name</label>
        <Input
          type="text"
          required
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          placeholder="Enter user name"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <Input
          type="email"
          required
          value={formData.email}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, email: e.target.value }))
          }
          placeholder="Enter email address"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Phone</label>
        <Input
          type="tel"
          value={formData.phone}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, phone: e.target.value }))
          }
          placeholder="Enter phone number"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Role</label>
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
          <label className="block text-sm font-medium mb-1">Password</label>
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
        return "Create New User (Admin Only)";
      case "edit":
        return "Edit User";
      default:
        return "User Details";
    }
  };

  const getSubmitText = () => {
    switch (variant) {
      case "create":
        return "Create User";
      case "edit":
        return "Update";
      default:
        return "Save";
    }
  };

  const getLoadingText = () => {
    switch (variant) {
      case "create":
        return "Creating...";
      case "edit":
        return "Updating...";
      default:
        return "Saving...";
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
    />
  );
};
