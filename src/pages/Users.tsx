import React, { useState, useEffect } from "react";
import { useUserManagement } from "../core/presentation/hooks/useUserManagement";
import { useAuth } from "../core/presentation/hooks/useAuth";
import { User } from "../core/domain/entities/User";
import { UpdateUserDTO } from "../core/application/dtos/UserDTO";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Eye,
  UserCheck,
  UserMinus,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  EyeOff,
  User as UserIcon,
  Shield,
  Check,
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import CarPartsLoader from "@/components/ui/car-parts-loader";
import {
  checkPasswordStrength,
  calculatePasswordStrength,
  type PasswordRequirement,
} from "@/lib/utils/password";

interface ViewUserModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
}

const ViewUserModal: React.FC<ViewUserModalProps> = ({
  user,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !user) return null;

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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xl font-bold text-primary">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-semibold">{user.name}</h3>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              ×
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
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
                  User ID
                </label>
                <p className="text-sm font-medium font-mono text-xs bg-muted px-2 py-1 rounded">
                  {user.id}
                </p>
              </div>
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
        </CardContent>
      </Card>
    </div>
  );
};

interface UserModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: UpdateUserDTO & { password?: string }) => void;
  isLoading: boolean;
  currentUser: User | null;
}

const UserModal: React.FC<UserModalProps> = ({
  user,
  isOpen,
  onClose,
  onSave,
  isLoading,
  currentUser,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "STAFF" as "ADMIN" | "STAFF",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [passwordRequirements, setPasswordRequirements] = useState<
    PasswordRequirement[]
  >([]);
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        role: user.role,
        password: "",
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        role: "STAFF",
        password: "",
      });
    }
  }, [user]);

  // Update password requirements when password changes
  useEffect(() => {
    if (!user && formData.password) {
      const requirements = checkPasswordStrength(formData.password);
      setPasswordRequirements(requirements);
      setPasswordStrength(calculatePasswordStrength(formData.password));
    } else {
      setPasswordRequirements([]);
      setPasswordStrength(0);
    }
  }, [formData.password, user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if current user is admin for creating new users
    if (!user && !currentUser?.isAdmin()) {
      alert("Only administrators can create new users");
      return;
    }

    // Validate password strength for new users
    if (!user && passwordStrength < 80) {
      alert("Password must meet at least 4 out of 5 requirements");
      return;
    }

    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md max-h-[95vh] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <CardTitle className="flex justify-between items-center">
            {user ? "Edit User" : "Create New User (Admin Only)"}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-6 w-6 p-0"
            >
              ×
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <Select
                value={formData.role}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    role: e.target.value as "ADMIN" | "STAFF",
                  }))
                }
              >
                <option value="STAFF">Staff</option>
                <option value="ADMIN">Admin</option>
              </Select>
            </div>

            {!user && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={(e) => {
                        const password = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          password: password,
                        }));
                      }}
                      placeholder="Enter password"
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Password Strength Indicator */}
                {formData.password && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Password Strength
                      </span>
                      <span className="text-xs font-medium">
                        {passwordStrength}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className={cn(
                          "h-2 rounded-full transition-all duration-300",
                          passwordStrength < 40
                            ? "bg-destructive"
                            : passwordStrength < 80
                            ? "bg-primary/60"
                            : "bg-primary"
                        )}
                        style={{ width: `${passwordStrength}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Password Requirements */}
                {formData.password && passwordRequirements.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-xs text-muted-foreground">
                      Password Requirements:
                    </span>
                    <div className="grid grid-cols-1 gap-1">
                      {passwordRequirements.map((requirement, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 text-xs"
                        >
                          <Check
                            className={cn(
                              "h-3 w-3 flex-shrink-0",
                              requirement.isValid
                                ? "text-primary"
                                : "text-muted-foreground"
                            )}
                          />
                          <span
                            className={cn(
                              "leading-tight",
                              requirement.isValid
                                ? "text-primary"
                                : "text-muted-foreground"
                            )}
                          >
                            {requirement.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  Password must meet at least 4 out of 5 requirements
                </p>
              </div>
            )}

            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <CarPartsLoader
                    size="xs"
                    variant="inline"
                    showText={false}
                    className="mr-2"
                  />
                ) : null}
                {isLoading ? "Saving..." : user ? "Update" : "Create User"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default function Users() {
  const { user: currentUser, register } = useAuth();
  const {
    users,
    totalUsers,
    isLoading,
    error,
    loadUsers,
    loadUserById,
    updateUser,
    deleteUser,
    searchUsers,
    filterByRole,
    clearError,
  } = useUserManagement();

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"ALL" | "ADMIN" | "STAFF">(
    "ALL"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );
  const [viewingUser, setViewingUser] = useState<User | null>(null);

  // Load users on component mount and when filters change
  useEffect(() => {
    loadUsersData();
  }, [currentPage, roleFilter]);

  const loadUsersData = async () => {
    const skip = (currentPage - 1) * pageSize;

    if (searchTerm.trim()) {
      await searchUsers(searchTerm, pageSize, skip);
    } else if (roleFilter !== "ALL") {
      await filterByRole(roleFilter, pageSize, skip);
    } else {
      await loadUsers({
        take: pageSize,
        skip,
        role: roleFilter !== "ALL" ? roleFilter : undefined,
      });
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    if (searchTerm.trim()) {
      await searchUsers(searchTerm, pageSize, 0);
    } else {
      await loadUsersData();
    }
  };

  const handleRoleFilter = async (role: "ALL" | "ADMIN" | "STAFF") => {
    setRoleFilter(role);
    setCurrentPage(1);
    setSearchTerm("");
  };

  const handleEditUser = (user: User) => {
    if (!currentUser?.isAdmin()) {
      alert("Only administrators can edit users");
      return;
    }
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleAddUser = () => {
    // Check if current user is admin
    if (!currentUser?.isAdmin()) {
      alert("Only administrators can create new users");
      return;
    }
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleSaveUser = async (
    userData: UpdateUserDTO & { password?: string }
  ) => {
    try {
      if (editingUser) {
        // Update existing user
        await updateUser(editingUser.id, userData);
      } else {
        // Create new user - use auth registration endpoint
        if (!userData.name || !userData.email || !userData.password) {
          throw new Error("Name, email, and password are required");
        }

        // Use auth register method for admin-only registration
        await register({
          name: userData.name,
          email: userData.email,
          phone: userData.phone || "",
          role: userData.role || "STAFF",
          password: userData.password,
        });
      }
      setIsModalOpen(false);
      setEditingUser(null);
      await loadUsersData();
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId);
      setShowDeleteConfirm(null);
      await loadUsersData();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleViewUser = async (userId: string) => {
    try {
      await loadUserById(userId);
      // Get the selected user from the hook and set it for viewing
      const userToView = users.find((user) => user.id === userId);
      if (userToView) {
        setViewingUser(userToView);
      }
    } catch (error) {
      console.error("Error loading user details:", error);
    }
  };

  const totalPages = Math.ceil(totalUsers / pageSize);

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
      month: "short",
      day: "numeric",
    }).format(date);
  };

  // Stats for dashboard-like cards
  const stats = [
    {
      title: "Total Users",
      value: totalUsers.toString(),
      icon: UserCheck,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Admins",
      value: users.filter((u) => u.role === "ADMIN").length.toString(),
      icon: UserCheck,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: "Staff",
      value: users.filter((u) => u.role === "STAFF").length.toString(),
      icon: UserMinus,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-sm text-muted-foreground">
            {currentUser?.isAdmin()
              ? "Manage users and their roles. Only administrators can create new users."
              : "View users and their information. Contact an administrator to create new users."}
          </p>
        </div>
        <Button
          onClick={handleAddUser}
          disabled={!currentUser?.isAdmin()}
          className={
            !currentUser?.isAdmin() ? "opacity-50 cursor-not-allowed" : ""
          }
        >
          <Plus className="mr-2 h-4 w-4" />
          Add User
          {!currentUser?.isAdmin() && (
            <span className="ml-2 text-xs">(Admin Only)</span>
          )}
        </Button>
      </div>

      {/* Admin Only Notice */}
      {!currentUser?.isAdmin() && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Admin Access Required:</strong> Only administrators can
                create, edit, or delete users. You can view user information but
                cannot make changes.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Alert */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <p className="text-destructive">{error}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearError}
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <motion.div
            key={stat.title}
            whileHover={{ y: -5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Card className="h-full">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {stat.title}
                    </p>
                    <h3 className="text-3xl font-bold mt-1">{stat.value}</h3>
                  </div>
                  <div className={cn("p-2 rounded-full", stat.bgColor)}>
                    <stat.icon className={cn("h-6 w-6", stat.color)} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
                onKeyPress={(e) => e.key === "Enter" && handleSearch(e)}
              />
            </div>

            {/* Filters and Actions */}
            <div className="flex gap-2">
              {/* Role Filter */}
              <Select
                value={roleFilter}
                onChange={(e) =>
                  handleRoleFilter(e.target.value as "ALL" | "ADMIN" | "STAFF")
                }
              >
                <option value="ALL">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="STAFF">Staff</option>
              </Select>

              {/* Refresh */}
              <Button
                variant="outline"
                size="sm"
                onClick={loadUsersData}
                disabled={isLoading}
              >
                {isLoading ? (
                  <CarPartsLoader size="xs" variant="inline" showText={false} />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading && users.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <CarPartsLoader size="md" text="Loading users..." />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                            <span className="text-sm font-medium">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.phone || "-"}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(user.createdDate)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleViewUser(user.id)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleEditUser(user)}
                              disabled={!currentUser?.isAdmin()}
                              className={
                                !currentUser?.isAdmin()
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                              {!currentUser?.isAdmin() && (
                                <span className="ml-auto text-xs">
                                  (Admin Only)
                                </span>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setShowDeleteConfirm(user.id)}
                              disabled={!currentUser?.isAdmin()}
                              className={cn(
                                "text-destructive",
                                !currentUser?.isAdmin() &&
                                  "opacity-50 cursor-not-allowed"
                              )}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                              {!currentUser?.isAdmin() && (
                                <span className="ml-auto text-xs">
                                  (Admin Only)
                                </span>
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-2 py-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * pageSize + 1} to{" "}
                    {Math.min(currentPage * pageSize, totalUsers)} of{" "}
                    {totalUsers} results
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <div className="flex items-center space-x-1">
                      {[...Array(totalPages)].map((_, i) => (
                        <Button
                          key={i}
                          variant={
                            currentPage === i + 1 ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setCurrentPage(i + 1)}
                          className="w-8"
                        >
                          {i + 1}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* User Modal */}
      <UserModal
        user={editingUser}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingUser(null);
        }}
        onSave={handleSaveUser}
        isLoading={isLoading}
        currentUser={currentUser}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Confirm Delete</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Are you sure you want to delete this user? This action cannot be
                undone.
              </p>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleDeleteUser(showDeleteConfirm)}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* View User Modal */}
      <ViewUserModal
        user={viewingUser}
        isOpen={!!viewingUser}
        onClose={() => setViewingUser(null)}
      />
    </div>
  );
}
