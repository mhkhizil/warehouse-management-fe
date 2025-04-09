import { User } from "../../domain/entities/User";
import { IUserRepository } from "../../domain/repositories/IUserRepository";

/**
 * User Repository implementation for local storage
 * Handles data access for User entity through browser's localStorage
 */
export class LocalUserRepository implements IUserRepository {
  private storageKeyUsers: string;
  private storageKeyCurrentUser: string;

  constructor(
    storageKeyUsers: string = "wms_users",
    storageKeyCurrentUser: string = "wms_user"
  ) {
    this.storageKeyUsers = storageKeyUsers;
    this.storageKeyCurrentUser = storageKeyCurrentUser;
  }

  /**
   * Find a user by their ID
   */
  async findById(id: string): Promise<User | null> {
    const users = this.getUsers();
    const foundUser = users.find((u) => u.id === id);
    return foundUser ? this.mapToUser(foundUser) : null;
  }

  /**
   * Find a user by their phone number
   */
  async findByPhone(phone: string): Promise<User | null> {
    const users = this.getUsers();
    const foundUser = users.find((u) => u.phone === phone);
    return foundUser ? this.mapToUser(foundUser) : null;
  }

  /**
   * Find a user by their email
   */
  async findByEmail(email: string): Promise<User | null> {
    const users = this.getUsers();
    const foundUser = users.find((u) => u.email === email);
    return foundUser ? this.mapToUser(foundUser) : null;
  }

  /**
   * Create a new user
   */
  async create(userData: any): Promise<User> {
    const users = this.getUsers();

    // Generate ID
    const newId = `user-${Date.now()}`;

    // Create new user with ID
    const newUser = {
      id: newId,
      ...userData,
      // Store password (in a real app, this would be hashed)
      password: userData.password,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add to users array
    users.push(newUser);
    this.saveUsers(users);

    // Return user entity (without password)
    return this.mapToUser(newUser);
  }

  /**
   * Update an existing user
   */
  async update(id: string, userData: Partial<User>): Promise<User> {
    const users = this.getUsers();
    const userIndex = users.findIndex((u) => u.id === id);

    if (userIndex === -1) {
      throw new Error(`User with id ${id} not found`);
    }

    // Update user with new data
    const updatedUser = {
      ...users[userIndex],
      ...userData,
      updatedAt: new Date().toISOString(),
    };

    users[userIndex] = updatedUser;
    this.saveUsers(users);

    // Update current user if it's the same
    const currentUser = localStorage.getItem(this.storageKeyCurrentUser);
    if (currentUser) {
      const parsedUser = JSON.parse(currentUser);
      if (parsedUser.id === id) {
        localStorage.setItem(
          this.storageKeyCurrentUser,
          JSON.stringify(updatedUser)
        );
      }
    }

    return this.mapToUser(updatedUser);
  }

  /**
   * Delete a user
   */
  async delete(id: string): Promise<boolean> {
    const users = this.getUsers();
    const filteredUsers = users.filter((u) => u.id !== id);

    if (filteredUsers.length === users.length) {
      return false; // No user was removed
    }

    this.saveUsers(filteredUsers);

    // Remove from current user if it's the same
    const currentUser = localStorage.getItem(this.storageKeyCurrentUser);
    if (currentUser) {
      const parsedUser = JSON.parse(currentUser);
      if (parsedUser.id === id) {
        localStorage.removeItem(this.storageKeyCurrentUser);
      }
    }

    return true;
  }

  /**
   * Get all users
   */
  async findAll(): Promise<User[]> {
    const users = this.getUsers();
    return users.map((user) => this.mapToUser(user));
  }

  /**
   * Authenticate a user
   */
  async authenticate(phone: string, password: string): Promise<User | null> {
    const users = this.getUsers();
    const foundUser = users.find(
      (u) => u.phone === phone && u.password === password
    );

    if (!foundUser) {
      return null;
    }

    // Store current user
    const userWithoutPassword = { ...foundUser };
    delete userWithoutPassword.password;
    localStorage.setItem(
      this.storageKeyCurrentUser,
      JSON.stringify(userWithoutPassword)
    );

    return this.mapToUser(foundUser);
  }

  /**
   * Helper method to get users from localStorage
   */
  private getUsers(): any[] {
    const usersStr = localStorage.getItem(this.storageKeyUsers);
    return usersStr ? JSON.parse(usersStr) : [];
  }

  /**
   * Helper method to save users to localStorage
   */
  private saveUsers(users: any[]): void {
    localStorage.setItem(this.storageKeyUsers, JSON.stringify(users));
  }

  /**
   * Map storage data to User entity
   */
  private mapToUser(data: any): User {
    return new User({
      id: data.id,
      username: data.username,
      email: data.email,
      phone: data.phone,
      password: data.password || "",
      createdAt: data.createdAt ? new Date(data.createdAt) : undefined,
      updatedAt: data.updatedAt ? new Date(data.updatedAt) : undefined,
    });
  }
}
