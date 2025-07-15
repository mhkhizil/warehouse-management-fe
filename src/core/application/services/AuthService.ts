import { User } from "../../domain/entities/User";
import { IAuthService } from "../../domain/services/IAuthService";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { RegisterUserDTO } from "../dtos/UserDTO";

/**
 * Auth Service implementation
 * Contains business logic for authentication-related operations
 */
export class AuthService implements IAuthService {
  private userRepository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.userRepository = userRepository;
  }

  /**
   * Login a user with phone and password
   */
  async login(phone: string, password: string): Promise<User> {
    // Note: This would need to be implemented based on your actual authentication API
    // For now, this is a placeholder that should be replaced with actual authentication logic
    throw new Error(
      "Login functionality needs to be implemented with actual authentication API"
    );
  }

  /**
   * Register a new user
   */
  async register(userData: RegisterUserDTO): Promise<User> {
    // Note: This would need to be implemented based on your actual registration API
    // For now, this is a placeholder that should be replaced with actual registration logic
    throw new Error(
      "Register functionality needs to be implemented with actual registration API"
    );
  }

  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    try {
      // Clear user data and auth token from localStorage
      localStorage.removeItem("wms_user");
      localStorage.removeItem("wms_token");
      return Promise.resolve();
    } catch (error) {
      console.error("Error during logout:", error);
      return Promise.resolve();
    }
  }

  /**
   * Get the current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      return await this.userRepository.getCurrentUser();
    } catch (error) {
      console.error("Error retrieving current user:", error);
      return null;
    }
  }

  /**
   * Check if the user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return !!user;
  }
}
