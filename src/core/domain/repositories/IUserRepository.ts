import { User } from "../entities/User";

/**
 * Interface for the User Repository
 * This defines contracts that any user repository implementation must fulfill
 */
export interface IUserRepository {
  /**
   * Get current user
   */
  getCurrentUser(): Promise<User | null>;

  /**
   * Find a user by their ID
   */
  findById(id: string): Promise<User | null>;

  /**
   * Create a new user
   */
  createUser(userData: {
    name: string;
    email: string;
    phone?: string;
    role?: "ADMIN" | "STAFF";
  }): Promise<User>;

  /**
   * Get list of users with pagination, filtering, and sorting
   */
  getUserList(params: {
    take: number;
    skip: number;
    name?: string;
    email?: string;
    phone?: string;
    role?: "ADMIN" | "STAFF";
    sortBy?: "name" | "email" | "phone" | "role" | "createdAt" | "updatedAt";
    sortOrder?: "asc" | "desc";
  }): Promise<{
    users: User[];
    totalCounts: number;
  }>;

  /**
   * Update an existing user
   */
  updateUser(
    id: string,
    userData: {
      name?: string;
      email?: string;
      phone?: string;
      role?: "ADMIN" | "STAFF";
    }
  ): Promise<User>;

  /**
   * Update current user profile
   */
  updateProfile(userData: {
    name?: string;
    currentPassword?: string;
    newPassword?: string;
  }): Promise<User>;

  /**
   * Upload profile image
   */
  uploadProfileImage(profileImage: File): Promise<{
    profileImageUrl: string;
    message: string;
    refreshedUser?: User;
  }>;

  /**
   * Delete a user
   */
  deleteUser(id: string): Promise<void>;
}
