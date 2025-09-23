import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useUserManagement } from "../core/presentation/hooks/useUserManagement";
import { useAuth } from "../core/presentation/hooks/useAuth";
import { User } from "../core/domain/entities/User";
import { UpdateUserDTO } from "../core/application/dtos/UserDTO";
import { useDateFormatter } from "@/lib/i18n/formatters";
import {
  Plus,
  UserCheck,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ShieldUser,
  IdCard,
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
} from "@/components/reassembledComps";
import { getUserColumns, getUserActions, UserModal } from "@/components/users";
import { useToast } from "@/hooks/use-toast";
import { useUserExport } from "@/hooks/useExport";
import { useUserDataLoader } from "@/hooks/useDataLoader";

export default function Users() {
  const { t } = useTranslation();
  const { user: currentUser, register } = useAuth();
  const { toast } = useToast();
  const { formatDate } = useDateFormatter();
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
  const { handleExport, isExportDisabled } = useUserExport(users, currentUser);

  // Data loading functionality
  const { loadData } = useUserDataLoader(
    searchUsers,
    searchUsersByEmail,
    searchUsersByPhone,
    filterByRole,
    loadUsers
  );

  // Load users on component mount and when filters change
  useEffect(() => {
    loadUsersData();
  }, [currentPage, roleFilter, sortBy, sortOrder, searchTerm]);

  const loadUsersData = async () => {
    await loadData(
      searchTerm,
      searchType,
      roleFilter,
      currentPage,
      pageSize,
      sortBy,
      sortOrder
    );
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
      filterIndicators.addFilter("role", t("users.role"), role, () =>
        handleClearRole()
      );
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
        t("common.sort"),
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
      toast({
        title: t("users.accessDenied"),
        description: t("users.onlyAdminsCanEditUsers"),
        variant: "destructive",
      });
      return;
    }
    setEditingUser(user);
    setIsModalOpen(true);
    setModalVariant("edit");
  };

  const handleAddUser = () => {
    // Check if current user is admin
    if (!currentUser?.isAdmin()) {
      toast({
        title: t("users.accessDenied"),
        description: t("users.onlyAdminsCanCreateUsers"),
        variant: "destructive",
      });
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
        toast({
          title: t("common.success"),
          description: t("users.userUpdated"),
          variant: "success",
        });
      } else {
        // Create new user - use auth registration endpoint
        if (!userData.name || !userData.email || !userData.password) {
          throw new Error(t("users.nameEmailPasswordRequired"));
        }

        // Use auth register method for admin-only registration
        await register({
          name: userData.name,
          email: userData.email,
          phone: userData.phone || "",
          role: userData.role || "STAFF",
          password: userData.password,
        });
        toast({
          title: t("common.success"),
          description: t("users.userCreated"),
          variant: "success",
        });
      }
      setIsModalOpen(false);
      setEditingUser(null);
      await loadUsersData();
    } catch (error) {
      console.error("Error saving user:", error);
      toast({
        title: t("common.error"),
        description:
          error instanceof Error ? error.message : t("users.failedToSaveUser"),
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId);
      setShowDeleteConfirm(null);
      toast({
        title: t("common.success"),
        description: t("users.userDeleted"),
        variant: "success",
      });
      await loadUsersData();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: t("common.error"),
        description:
          error instanceof Error
            ? error.message
            : t("users.failedToDeleteUser"),
        variant: "destructive",
      });
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
      toast({
        title: t("common.error"),
        description:
          error instanceof Error
            ? error.message
            : t("users.failedToLoadUserDetails"),
        variant: "destructive",
      });
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

  // formatDate is now provided by useDateFormatter hook

  // Stats for dashboard-like cards
  const stats = [
    {
      title: t("users.totalUsers"),
      value: totalUsers.toString(),
      icon: UserCheck,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: t("users.admins"),
      value: users.filter((u) => u.role === "ADMIN").length.toString(),
      icon: ShieldUser,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
    },
    {
      title: t("users.staff"),
      value: users.filter((u) => u.role === "STAFF").length.toString(),
      icon: IdCard,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
  ];
  // console.log(users); // Removed for security - sensitive data exposure

  return (
    <div className="space-y-6">
      {/* Header */}
      <Header
        title={t("users.title")}
        description={
          currentUser?.isAdmin()
            ? t("users.adminDescription")
            : t("users.staffDescription")
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
          {t("users.addUser")}
          {!currentUser?.isAdmin() && (
            <span className="ml-2 text-xs">({t("users.adminOnly")})</span>
          )}
        </HeaderButton>
      </Header>

      {/* Admin Only Notice */}
      {!currentUser?.isAdmin() && (
        <HeaderNotice
          variant="warning"
          icon={<UserCheck className="h-5 w-5" />}
          message={t("users.adminAccessRequired")}
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
              { value: "name", label: t("common.name") },
              { value: "email", label: t("common.email") },
              { value: "phone", label: t("common.phone") },
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
              { value: "name", label: t("common.name") },
              { value: "email", label: t("common.email") },
              { value: "phone", label: t("common.phone") },
              { value: "role", label: t("users.role") },
              { value: "createdAt", label: t("common.createdAt") },
              { value: "updatedAt", label: t("common.updatedAt") },
            ]}
            getSortIcon={getSortIcon}
            // Filter props
            filterValue={roleFilter}
            filterOptions={[
              { value: "ALL", label: t("users.allRoles") },
              { value: "ADMIN", label: t("users.admin") },
              { value: "STAFF", label: t("users.staff") },
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
            exportDisabled={isExportDisabled}
            // Filter indicators
            filterIndicators={filterIndicators.getFilters()}
            onClearAllFilters={handleClearAllFilters}
          />
        </CardHeader>

        <CardContent>
          {isLoading && users.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <CarPartsLoader size="md" text={t("users.loadingUsers")} />
            </div>
          ) : (
            <DataTable
              data={users}
              columns={getUserColumns({ getRoleBadgeVariant, formatDate, t })}
              actions={getUserActions({
                onViewUser: handleViewUser,
                onEditUser: handleEditUser,
                onDeleteUser: (userId) => setShowDeleteConfirm(userId),
                t,
              })}
              isLoading={isLoading}
              loadingText={t("users.loadingUsers")}
              emptyText={t("users.noUsersFound")}
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
        title={t("users.confirmDelete")}
        message={t("users.confirmDeleteMessage")}
        confirmText={t("common.delete")}
        cancelText={t("common.cancel")}
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
