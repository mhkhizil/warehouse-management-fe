import { User } from "../../domain/entities/User";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { HttpClient } from "../api/HttpClient";

/**
 * User Repository implementation for API calls
 * Handles data access for User entity through HTTP API
 */
export class ApiUserRepository implements IUserRepository {
  private httpClient: HttpClient;
  private baseEndpoint: string;

  constructor(httpClient: HttpClient, baseEndpoint: string = "/users") {
    this.httpClient = httpClient;
    this.baseEndpoint = baseEndpoint;
  }

  /**
   * Find a user by their ID
   */
  async findById(id: string): Promise<User | null> {
    try {
      const userData = await this.httpClient.get<any>(
        `${this.baseEndpoint}/${id}`
      );
      return this.mapToUser(userData);
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      return null;
    }
  }

  /**
   * Find a user by their phone number
   */
  async findByPhone(phone: string): Promise<User | null> {
    try {
      const users = await this.httpClient.get<any[]>(
        `${this.baseEndpoint}?phone=${encodeURIComponent(phone)}`
      );

      if (users && users.length > 0) {
        return this.mapToUser(users[0]);
      }

      return null;
    } catch (error) {
      console.error("Error fetching user by phone:", error);
      return null;
    }
  }

  /**
   * Find a user by their email
   */
  async findByEmail(email: string): Promise<User | null> {
    try {
      const users = await this.httpClient.get<any[]>(
        `${this.baseEndpoint}?email=${encodeURIComponent(email)}`
      );

      if (users && users.length > 0) {
        return this.mapToUser(users[0]);
      }

      return null;
    } catch (error) {
      console.error("Error fetching user by email:", error);
      return null;
    }
  }

  /**
   * Create a new user
   */
  async create(userData: Omit<User, "id">): Promise<User> {
    try {
      const response = await this.httpClient.post<any>(
        this.baseEndpoint,
        userData
      );
      return this.mapToUser(response);
    } catch (error) {
      console.error("Error creating user:", error);
      throw new Error("Failed to create user");
    }
  }

  /**
   * Update an existing user
   */
  async update(id: string, userData: Partial<User>): Promise<User> {
    try {
      const response = await this.httpClient.put<any>(
        `${this.baseEndpoint}/${id}`,
        userData
      );
      return this.mapToUser(response);
    } catch (error) {
      console.error("Error updating user:", error);
      throw new Error("Failed to update user");
    }
  }

  /**
   * Delete a user
   */
  async delete(id: string): Promise<boolean> {
    try {
      await this.httpClient.delete(`${this.baseEndpoint}/${id}`);
      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  }

  /**
   * Get all users
   */
  async findAll(): Promise<User[]> {
    try {
      const users = await this.httpClient.get<any[]>(this.baseEndpoint);
      return users.map((user) => this.mapToUser(user));
    } catch (error) {
      console.error("Error fetching all users:", error);
      return [];
    }
  }

  /**
   * Authenticate a user
   */
  async authenticate(phone: string, password: string): Promise<User | null> {
    try {
      const response = await this.httpClient.post<any>("/auth/login", {
        phone,
        password,
      });

      if (response && response.token) {
        // Store token for future requests
        localStorage.setItem("wms_token", response.token);

        // Return user data
        return this.mapToUser(response.user);
      }

      return null;
    } catch (error) {
      console.error("Error authenticating user:", error);
      return null;
    }
  }

  /**
   * Map API response to User entity
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
