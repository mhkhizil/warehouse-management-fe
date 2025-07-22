import React, { useState, useEffect } from "react";
import { useUserManagement } from "../core/presentation/hooks/useUserManagement";
import { useAuth } from "../core/presentation/hooks/useAuth";
import { User } from "../core/domain/entities/User";
import { UpdateUserDTO } from "../core/application/dtos/UserDTO";
import {
  Plus,
  UserCheck,
  UserMinus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import CarPartsLoader from "@/components/reassembledComps/car-parts-loader";
import {
  DataTable,
  ConfirmModal,
  Header,
  HeaderButton,
  HeaderNotice,
  StatsCard,
  StatsGrid,
  SearchSorts,
  useFilterIndicators,
  useEntityCSVExport,
  CSVFormatters,
} from "@/components/reassembledComps";
import { getUserColumns, getUserActions, UserModal } from "@/components/users";

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
    searchUsersByEmail,
    searchUsersByPhone,
    filterByRole,
    clearError,
  } = useUserManagement();

  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState<"name" | "email" | "phone">(
    "name"
  );
  const [roleFilter, setRoleFilter] = useState<"ALL" | "ADMIN" | "STAFF">(
    "ALL"
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [sortBy, setSortBy] = useState<
    "name" | "email" | "phone" | "role" | "createdAt" | "updatedAt"
  >("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalVariant, setModalVariant] = useState<"create" | "edit" | "view">(
    "create"
  );
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );
  const [viewingUser, setViewingUser] = useState<User | null>(null);

  // Filter indicators hook
  const filterIndicators = useFilterIndicators();

  // Export functionality
  const { exportToCSV: handleExportUsers } = useEntityCSVExport({
    data: users,
    entityName: "Users",
    fieldMappings: {
      name: { header: "Name" },
      email: { header: "Email" },
      phone: { header: "Phone" },
      role: { header: "Role" },
      createdDate: {
        header: "Created Date",
        formatter: CSVFormatters.date(),
      },
    },
  });

  const handleExport = () => {
    if (!currentUser?.isAdmin()) {
      alert("Only administrators can export user data");
      return;
    }
    handleExportUsers();
  };

  // Load users on component mount and when filters change
  useEffect(() => {
    loadUsersData();
  }, [currentPage, roleFilter, sortBy, sortOrder, searchTerm]);

  const loadUsersData = async () => {
    const skip = (currentPage - 1) * pageSize;

    if (searchTerm.trim()) {
      // Handle different search types
      switch (searchType) {
        case "email":
          await searchUsersByEmail(searchTerm, pageSize, skip);
          break;
        case "phone":
          await searchUsersByPhone(searchTerm, pageSize, skip);
          break;
        default:
          await searchUsers(searchTerm, pageSize, skip);
          break;
      }
    } else if (roleFilter !== "ALL") {
      await filterByRole(roleFilter, pageSize, skip);
    } else {
      await loadUsers({
        take: pageSize,
        skip,
        role: roleFilter !== "ALL" ? roleFilter : undefined,
        sortBy,
        sortOrder,
      });
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    await loadUsersData();
  };

  const handleRoleFilter = async (role: "ALL" | "ADMIN" | "STAFF") => {
    setRoleFilter(role);
    setCurrentPage(1);
    setSearchTerm("");

    // Update filter indicators
    if (role !== "ALL") {
      filterIndicators.addFilter("role", "Role", role, () => handleClearRole());
    } else {
      filterIndicators.clearFilter("role");
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
    filterIndicators.clearFilter("search");
  };

  const handleClearRole = () => {
    setRoleFilter("ALL");
    setCurrentPage(1);
    filterIndicators.clearFilter("role");
  };

  const handleClearSort = () => {
    setSortBy("createdAt");
    setSortOrder("desc");
    setCurrentPage(1);
    filterIndicators.clearFilter("sort");
  };

  const handleClearAllFilters = () => {
    setSearchTerm("");
    setRoleFilter("ALL");
    setSortBy("createdAt");
    setSortOrder("desc");
    setCurrentPage(1);
    filterIndicators.clearAllFilters();
  };

  const handleSort = (field: string) => {
    const validFields = [
      "name",
      "email",
      "phone",
      "role",
      "createdAt",
      "updatedAt",
    ] as const;
    const validField = validFields.find((f) => f === field);

    if (validField) {
      if (sortBy === validField) {
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
      } else {
        setSortBy(validField);
        setSortOrder("asc");
      }

      // Update filter indicators
      filterIndicators.addFilter(
        "sort",
        "Sort",
        `${validField} (${sortOrder})`,
        () => handleClearSort()
      );
    }
    setCurrentPage(1);
  };

  // Update filter indicators when search term changes
  React.useEffect(() => {
    if (searchTerm.trim()) {
      filterIndicators.addFilter("search", searchType, searchTerm, () =>
        handleClearSearch()
      );
    } else {
      filterIndicators.clearFilter("search");
    }
  }, [searchTerm, searchType]);

  const getSortIcon = (field: string) => {
    const validFields = [
      "name",
      "email",
      "phone",
      "role",
      "createdAt",
      "updatedAt",
    ] as const;
    const validField = validFields.find((f) => f === field);

    if (!validField || sortBy !== validField) {
      return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />;
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="h-4 w-4 text-primary" />
    ) : (
      <ArrowDown className="h-4 w-4 text-primary" />
    );
  };

  const handleEditUser = (user: User) => {
    if (!currentUser?.isAdmin()) {
      alert("Only administrators can edit users");
      return;
    }
    setEditingUser(user);
    setIsModalOpen(true);
    setModalVariant("edit");
  };

  const handleAddUser = () => {
    // Check if current user is admin
    if (!currentUser?.isAdmin()) {
      alert("Only administrators can create new users");
      return;
    }
    setEditingUser(null);
    setIsModalOpen(true);
    setModalVariant("create");
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
  console.log(users);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Header
        title="User Management"
        description={
          currentUser?.isAdmin()
            ? "Manage users and their roles. Only administrators can create new users."
            : "View users and their information. Contact an administrator to create new users."
        }
      >
        <HeaderButton
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
        </HeaderButton>
      </Header>

      {/* Admin Only Notice */}
      {!currentUser?.isAdmin() && (
        <HeaderNotice
          variant="warning"
          icon={<UserCheck className="h-5 w-5" />}
          message="Admin Access Required: Only administrators can create, edit, or delete users. You can view user information but cannot make changes."
        />
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
      <StatsGrid>
        {stats.map((stat) => (
          <StatsCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            bgColor={stat.bgColor}
          />
        ))}
      </StatsGrid>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <SearchSorts
            // Search props
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            onSearch={handleSearch}
            searchType={searchType}
            searchTypeOptions={[
              { value: "name", label: "Name" },
              { value: "email", label: "Email" },
              { value: "phone", label: "Phone" },
            ]}
            onSearchTypeChange={(value) =>
              setSearchType(value as "name" | "email" | "phone")
            }
            showSearchType={true}
            // Sort props
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortByChange={(value) => setSortBy(value as typeof sortBy)}
            onSortOrderChange={setSortOrder}
            sortOptions={[
              { value: "name", label: "Name" },
              { value: "email", label: "Email" },
              { value: "phone", label: "Phone" },
              { value: "role", label: "Role" },
              { value: "createdAt", label: "Created Date" },
              { value: "updatedAt", label: "Updated Date" },
            ]}
            getSortIcon={getSortIcon}
            // Filter props
            filterValue={roleFilter}
            filterOptions={[
              { value: "ALL", label: "All Roles" },
              { value: "ADMIN", label: "Admin" },
              { value: "STAFF", label: "Staff" },
            ]}
            onFilterChange={(value) =>
              handleRoleFilter(value as "ALL" | "ADMIN" | "STAFF")
            }
            // Action props
            onRefresh={loadUsersData}
            onExport={handleExport}
            isLoading={isLoading}
            showRefresh={true}
            showExport={true}
            exportDisabled={!currentUser?.isAdmin() || users.length === 0}
            // Filter indicators
            filterIndicators={filterIndicators.getFilters()}
            onClearAllFilters={handleClearAllFilters}
          />
        </CardHeader>

        <CardContent>
          {isLoading && users.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <CarPartsLoader size="md" text="Loading users..." />
            </div>
          ) : (
            <DataTable
              data={users}
              columns={getUserColumns({ getRoleBadgeVariant, formatDate })}
              actions={getUserActions({
                onViewUser: handleViewUser,
                onEditUser: handleEditUser,
                onDeleteUser: (userId) => setShowDeleteConfirm(userId),
              })}
              isLoading={isLoading}
              loadingText="Loading users..."
              emptyText="No users found"
              currentUser={currentUser}
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalUsers}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSort={handleSort}
              getSortIcon={getSortIcon}
            />
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
        variant={modalVariant}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        title="Confirm Delete"
        message="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={() =>
          showDeleteConfirm && handleDeleteUser(showDeleteConfirm)
        }
      />

      {/* View User Modal */}
      <UserModal
        user={viewingUser}
        isOpen={!!viewingUser}
        onClose={() => setViewingUser(null)}
        isLoading={isLoading}
        currentUser={currentUser}
        variant="view"
      />
    </div>
  );
}
