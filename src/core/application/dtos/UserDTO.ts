/**
 * Data Transfer Objects for User-related operations
 * These are used to pass data between layers and with external systems
 */

/**
 * Object for user registration
 */
export interface RegisterUserDTO {
  username: string;
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
  username: string;
  email: string;
  phone: string;
  createdAt?: string;
  updatedAt?: string;
}
