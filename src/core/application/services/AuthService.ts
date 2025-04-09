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
    const user = await this.userRepository.authenticate(phone, password);

    if (!user) {
      throw new Error(
        "Invalid credentials. Please check your phone and password."
      );
    }

    return user;
  }

  /**
   * Register a new user
   */
  async register(userData: RegisterUserDTO): Promise<User> {
    // Check if user with email already exists
    const existingEmail = await this.userRepository.findByEmail(userData.email);
    if (existingEmail) {
      throw new Error("Email already registered.");
    }

    // Check if user with phone already exists
    const existingPhone = await this.userRepository.findByPhone(userData.phone);
    if (existingPhone) {
      throw new Error("Phone number already registered.");
    }

    // Create new user (repository will handle ID generation)
    const newUser = await this.userRepository.create({
      username: userData.username,
      email: userData.email,
      phone: userData.phone,
      password: userData.password,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return newUser;
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
      // Get user from localStorage
      const userJson = localStorage.getItem("wms_user");
      if (!userJson) {
        return null;
      }

      // Parse user data
      const userData = JSON.parse(userJson);

      // Map to User entity
      return new User({
        id: userData.id,
        username: userData.username,
        email: userData.email,
        phone: userData.phone,
        password: userData.password,
        createdAt: userData.createdAt
          ? new Date(userData.createdAt)
          : undefined,
        updatedAt: userData.updatedAt
          ? new Date(userData.updatedAt)
          : undefined,
      });
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
