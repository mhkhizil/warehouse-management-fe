import { User } from "../../domain/entities/User";
import { IUserRepository } from "../../domain/repositories/IUserRepository";

interface StoredUserData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "ADMIN" | "STAFF";
  password?: string;
  createdDate?: string | Date;
  updatedDate?: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

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
  async createUser(userData: {
    name: string;
    email: string;
    phone?: string;
    role?: "ADMIN" | "STAFF";
  }): Promise<User> {
    const users = this.getUsers();

    // Generate ID
    const newId = `user-${Date.now()}`;

    // Create new user with ID
    const newUser = {
      id: newId,
      name: userData.name,
      email: userData.email,
      phone: userData.phone || "",
      role: userData.role || "STAFF",
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
    };

    // Add to users array
    users.push(newUser);
    this.saveUsers(users);

    // Return user entity
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
   * Get current user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const userJson = localStorage.getItem("wms_user");
      if (!userJson) {
        return null;
      }

      const userData = JSON.parse(userJson);
      return this.mapToUser(userData);
    } catch (error) {
      console.error("Error getting current user:", error);
      return null;
    }
  }

  /**
   * Get list of users with pagination and filtering
   */
  async getUserList(params: {
    take: number;
    skip: number;
    name?: string;
    role?: "ADMIN" | "STAFF";
  }): Promise<{
    users: User[];
    totalCounts: number;
  }> {
    try {
      const allUsers = await this.findAll();

      // Apply name filter
      let filteredUsers = allUsers;
      if (params.name) {
        filteredUsers = filteredUsers.filter((user) =>
          user.name.toLowerCase().includes(params.name!.toLowerCase())
        );
      }

      // Apply role filter
      if (params.role) {
        filteredUsers = filteredUsers.filter(
          (user) => user.role === params.role
        );
      }

      // Apply pagination
      const startIndex = params.skip;
      const endIndex = startIndex + params.take;
      const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

      return {
        users: paginatedUsers,
        totalCounts: filteredUsers.length,
      };
    } catch (error) {
      console.error("Error getting user list:", error);
      return {
        users: [],
        totalCounts: 0,
      };
    }
  }

  /**
   * Update an existing user
   */
  async updateUser(
    id: string,
    userData: {
      name?: string;
      email?: string;
      phone?: string;
      role?: "ADMIN" | "STAFF";
    }
  ): Promise<User> {
    try {
      const users = this.getUsers();
      const userIndex = users.findIndex((user) => user.id === id);

      if (userIndex === -1) {
        throw new Error("User not found");
      }

      const existingUser = users[userIndex];
      const updatedUser = {
        ...existingUser,
        ...userData,
        updatedDate: new Date().toISOString(),
      };

      users[userIndex] = updatedUser;
      localStorage.setItem(this.storageKeyUsers, JSON.stringify(users));

      return this.mapToUser(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }

  /**
   * Update current user profile
   */
  async updateProfile(userData: {
    name?: string;
    currentPassword?: string;
    newPassword?: string;
  }): Promise<User> {
    try {
      const currentUser = await this.getCurrentUser();
      if (!currentUser) {
        throw new Error("No current user found");
      }

      const users = this.getUsers();
      const userIndex = users.findIndex((user) => user.id === currentUser.id);

      if (userIndex === -1) {
        throw new Error("User not found");
      }

      const existingUser = users[userIndex];
      const updatedUser = {
        ...existingUser,
        name: userData.name || existingUser.name,
        // Note: Password handling would need to be implemented based on your needs
        updatedDate: new Date().toISOString(),
      };

      users[userIndex] = updatedUser;
      localStorage.setItem(this.storageKeyUsers, JSON.stringify(users));

      // Update current user in localStorage
      const updatedUserEntity = this.mapToUser(updatedUser);
      localStorage.setItem(
        this.storageKeyCurrentUser,
        JSON.stringify(updatedUser)
      );

      return updatedUserEntity;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  }

  /**
   * Delete a user
   */
  async deleteUser(id: string): Promise<void> {
    try {
      const users = this.getUsers();
      const filteredUsers = users.filter((user) => user.id !== id);

      if (filteredUsers.length === users.length) {
        throw new Error("User not found");
      }

      localStorage.setItem(this.storageKeyUsers, JSON.stringify(filteredUsers));
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }

  /**
   * Get users from localStorage
   */
  private getUsers(): StoredUserData[] {
    try {
      const usersJson = localStorage.getItem(this.storageKeyUsers);
      return usersJson ? JSON.parse(usersJson) : [];
    } catch (error) {
      console.error("Error getting users from localStorage:", error);
      return [];
    }
  }

  /**
   * Save users to localStorage
   */
  private saveUsers(users: StoredUserData[]): void {
    try {
      localStorage.setItem(this.storageKeyUsers, JSON.stringify(users));
    } catch (error) {
      console.error("Error saving users to localStorage:", error);
    }
  }

  /**
   * Map raw data to User entity
   */
  private mapToUser(data: StoredUserData): User {
    return new User({
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,
      createdDate: data.createdDate
        ? new Date(data.createdDate)
        : data.createdAt
        ? new Date(data.createdAt)
        : undefined,
      updatedDate: data.updatedDate
        ? new Date(data.updatedDate)
        : data.updatedAt
        ? new Date(data.updatedAt)
        : undefined,
    });
  }
}
