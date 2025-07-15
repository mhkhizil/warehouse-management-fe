/**
 * Data Transfer Objects for User-related operations
 * These are used to pass data between layers and with external systems
 */

/**
 * Object for user registration
 */
export interface RegisterUserDTO {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword?: string;
}

/**
 * Object for user login
 */
export interface LoginUserDTO {
  phone: string;
  password: string;
}

/**
 * Object for user response
 * Excludes sensitive data
 */
export interface UserResponseDTO {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "ADMIN" | "STAFF";
  createdDate?: string;
  updatedDate?: string;
}

/**
 * Object for user list request parameters
 */
export interface UserListRequestDTO {
  take: number;
  skip: number;
  name?: string;
  role?: "ADMIN" | "STAFF";
}

/**
 * Object for user list response
 */
export interface UserListResponseDTO {
  users: UserResponseDTO[];
  totalCounts: number;
}

/**
 * Object for user update request
 */
export interface UpdateUserDTO {
  name?: string;
  email?: string;
  phone?: string;
  role?: "ADMIN" | "STAFF";
}

/**
 * Object for profile update request
 */
export interface UpdateProfileDTO {
  name?: string;
  currentPassword?: string;
  newPassword?: string;
}

/**
 * Object for user creation request
 */
export interface CreateUserDTO {
  name: string;
  email: string;
  phone?: string;
  role?: "ADMIN" | "STAFF";
}
