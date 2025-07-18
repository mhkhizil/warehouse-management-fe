import { useState, useEffect } from "react";
import { User } from "../../domain/entities/User";
import { UserManagementService } from "../../application/services/UserManagementService";
import {
  UserListRequestDTO,
  UpdateUserDTO,
  UpdateProfileDTO,
  CreateUserDTO,
} from "../../application/dtos/UserDTO";
import container from "../../infrastructure/di/container";

interface UseUserManagementReturn {
  // State
  users: User[];
  totalUsers: number;
  currentUser: User | null;
  selectedUser: User | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadUsers: (params: UserListRequestDTO) => Promise<void>;
  loadUserById: (id: string) => Promise<void>;
  createUser: (userData: CreateUserDTO) => Promise<void>;
  updateUser: (id: string, userData: UpdateUserDTO) => Promise<void>;
  updateProfile: (userData: UpdateProfileDTO) => Promise<User>;
  deleteUser: (id: string) => Promise<void>;
  searchUsers: (name: string, take?: number, skip?: number) => Promise<void>;
  filterByRole: (
    role: "ADMIN" | "STAFF",
    take?: number,
    skip?: number
  ) => Promise<void>;
  clearError: () => void;
  clearSelectedUser: () => void;
}

/**
 * Custom hook for user management operations
 */
export function useUserManagement(): UseUserManagementReturn {
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Get service from container
  const userManagementService = container.resolve<UserManagementService>(
    "userManagementService"
  );

  // Load current user on mount
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        setIsLoading(true);
        const user = await userManagementService.getCurrentUser();
        setCurrentUser(user);
      } catch (err) {
        console.error("Error loading current user:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadCurrentUser();
  }, [userManagementService]);

  /**
   * Load users with pagination and filtering
   */
  const loadUsers = async (params: UserListRequestDTO) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await userManagementService.getUserList(params);

      // Convert DTOs back to User entities
      const userEntities = result.users.map(
        (userDto) =>
          new User({
            id: userDto.id,
            name: userDto.name,
            email: userDto.email,
            phone: userDto.phone,
            role: userDto.role,
            createdDate: userDto.createdDate
              ? new Date(userDto.createdDate)
              : undefined,
            updatedDate: userDto.updatedDate
              ? new Date(userDto.updatedDate)
              : undefined,
          })
      );

      setUsers(userEntities);
      setTotalUsers(result.totalCounts);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load users";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Load user by ID
   */
  const loadUserById = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const user = await userManagementService.getUserById(id);
      setSelectedUser(user);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load user";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Create a new user
   */
  const createUser = async (userData: CreateUserDTO) => {
    try {
      setIsLoading(true);
      setError(null);

      const newUser = await userManagementService.createUser(userData);

      // Add new user to the list
      setUsers((prevUsers) => [...prevUsers, newUser]);
      setTotalUsers((prevTotal) => prevTotal + 1);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create user";
      setError(errorMessage);
      throw err; // Re-throw to handle in component
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update user
   */
  const updateUser = async (id: string, userData: UpdateUserDTO) => {
    try {
      setIsLoading(true);
      setError(null);

      const updatedUser = await userManagementService.updateUser(id, userData);

      // Update user in the list
      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.id === id ? updatedUser : user))
      );

      // Update selected user if it's the same
      if (selectedUser?.id === id) {
        setSelectedUser(updatedUser);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update user";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Update current user profile
   */
  const updateProfile = async (userData: UpdateProfileDTO): Promise<User> => {
    try {
      setIsLoading(true);
      setError(null);

      const updatedUser = await userManagementService.updateProfile(userData);
      setCurrentUser(updatedUser);
      return updatedUser;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update profile";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Delete user
   */
  const deleteUser = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);

      await userManagementService.deleteUser(id);

      // Remove user from the list
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
      setTotalUsers((prev) => prev - 1);

      // Clear selected user if it's the deleted one
      if (selectedUser?.id === id) {
        setSelectedUser(null);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete user";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Search users by name
   */
  const searchUsers = async (
    name: string,
    take: number = 10,
    skip: number = 0
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await userManagementService.searchUsersByName(
        name,
        take,
        skip
      );

      const userEntities = result.users.map(
        (userDto) =>
          new User({
            id: userDto.id,
            name: userDto.name,
            email: userDto.email,
            phone: userDto.phone,
            role: userDto.role,
            createdDate: userDto.createdDate
              ? new Date(userDto.createdDate)
              : undefined,
            updatedDate: userDto.updatedDate
              ? new Date(userDto.updatedDate)
              : undefined,
          })
      );

      setUsers(userEntities);
      setTotalUsers(result.totalCounts);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to search users";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Filter users by role
   */
  const filterByRole = async (
    role: "ADMIN" | "STAFF",
    take: number = 10,
    skip: number = 0
  ) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await userManagementService.getUsersByRole(
        role,
        take,
        skip
      );

      const userEntities = result.users.map(
        (userDto) =>
          new User({
            id: userDto.id,
            name: userDto.name,
            email: userDto.email,
            phone: userDto.phone,
            role: userDto.role,
            createdDate: userDto.createdDate
              ? new Date(userDto.createdDate)
              : undefined,
            updatedDate: userDto.updatedDate
              ? new Date(userDto.updatedDate)
              : undefined,
          })
      );

      setUsers(userEntities);
      setTotalUsers(result.totalCounts);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to filter users";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Clear error state
   */
  const clearError = () => {
    setError(null);
  };

  /**
   * Clear selected user
   */
  const clearSelectedUser = () => {
    setSelectedUser(null);
  };

  return {
    // State
    users,
    totalUsers,
    currentUser,
    selectedUser,
    isLoading,
    error,

    // Actions
    loadUsers,
    loadUserById,
    createUser,
    updateUser,
    updateProfile,
    deleteUser,
    searchUsers,
    filterByRole,
    clearError,
    clearSelectedUser,
  };
}
