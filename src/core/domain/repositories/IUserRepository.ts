import { User } from "../entities/User";

/**
 * Interface for the User Repository
 * This defines contracts that any user repository implementation must fulfill
 */
export interface IUserRepository {
  /**
   * Find a user by their ID
   */
  findById(id: string): Promise<User | null>;

  /**
   * Find a user by their phone number
   */
  findByPhone(phone: string): Promise<User | null>;

  /**
   * Find a user by their email
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   * Create a new user
   */
  create(user: Omit<User, "id" | "isValid">): Promise<User>;

  /**
   * Update an existing user
   */
  update(id: string, userData: Partial<User>): Promise<User>;

  /**
   * Delete a user
   */
  delete(id: string): Promise<boolean>;

  /**
   * Get all users
   */
  findAll(): Promise<User[]>;

  /**
   * Authenticate a user
   */
  authenticate(phone: string, password: string): Promise<User | null>;
}
