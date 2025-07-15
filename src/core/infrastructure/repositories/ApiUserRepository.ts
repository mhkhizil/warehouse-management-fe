import { User } from "../../domain/entities/User";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS, buildUrl } from "../api/constants";

/**
 * API response types for user endpoints
 */
interface ApiUserResponse {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  createdDate: string;
  updatedDate: string;
}

interface ApiResponse<T> {
  message: string;
  code: number;
  data: T;
}

interface ApiUserListResponse {
  users: ApiUserResponse[];
  totalCounts: number;
}

/**
 * User Repository implementation for API calls
 * Handles data access for User entity through HTTP API
 */
export class ApiUserRepository implements IUserRepository {
  private httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const url = buildUrl(API_ENDPOINTS.USERS.BASE);
      const response = await this.httpClient.get<ApiResponse<ApiUserResponse>>(
        url
      );

      if (response.code === 200 && response.data) {
        return this.mapApiResponseToUser(response.data);
      }

      return null;
    } catch (error) {
      console.error("Error fetching current user:", error);
      return null;
    }
  }

  /**
   * Find a user by their ID
   */
  async findById(id: string): Promise<User | null> {
    try {
      const url = buildUrl(API_ENDPOINTS.USERS.GET_BY_ID);
      const response = await this.httpClient.get<ApiResponse<ApiUserResponse>>(
        url,
        {
          params: { id },
        }
      );

      if (response.code === 200 && response.data) {
        return this.mapApiResponseToUser(response.data);
      }

      return null;
    } catch (error) {
      console.error("Error fetching user by ID:", error);
      return null;
    }
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
    try {
      const url = buildUrl(API_ENDPOINTS.USERS.CREATE);
      const response = await this.httpClient.post<ApiResponse<ApiUserResponse>>(
        url,
        {
          name: userData.name,
          email: userData.email,
          phone: userData.phone || "",
          role: userData.role || "STAFF",
        }
      );

      if (response.code === 200 && response.data) {
        return this.mapApiResponseToUser(response.data);
      }

      throw new Error("Failed to create user");
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
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
      const url = buildUrl(API_ENDPOINTS.USERS.GET_LIST);
      const queryParams: Record<string, string | number> = {
        take: params.take,
        skip: params.skip,
      };

      if (params.name) {
        queryParams.name = params.name;
      }

      if (params.role) {
        queryParams.role = params.role;
      }

      const response = await this.httpClient.get<
        ApiResponse<ApiUserListResponse>
      >(url, {
        params: queryParams,
      });

      if (response.code === 200 && response.data) {
        return {
          users: response.data.users.map((user) =>
            this.mapApiResponseToUser(user)
          ),
          totalCounts: response.data.totalCounts,
        };
      }

      return {
        users: [],
        totalCounts: 0,
      };
    } catch (error) {
      console.error("Error fetching user list:", error);
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
      const url = buildUrl(API_ENDPOINTS.USERS.UPDATE);
      const response = await this.httpClient.put<ApiResponse<ApiUserResponse>>(
        url,
        userData,
        {
          params: { id },
        }
      );

      if (response.code === 200 && response.data) {
        return this.mapApiResponseToUser(response.data);
      }

      throw new Error("Failed to update user");
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
      const url = buildUrl(API_ENDPOINTS.USERS.UPDATE_PROFILE);
      const response = await this.httpClient.put<ApiResponse<ApiUserResponse>>(
        url,
        userData
      );

      if (response.code === 200 && response.data) {
        return this.mapApiResponseToUser(response.data);
      }

      throw new Error("Failed to update profile");
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
      const url = buildUrl(API_ENDPOINTS.USERS.DELETE(id));
      await this.httpClient.delete(url);
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  }

  /**
   * Map API response to User entity
   */
  private mapApiResponseToUser(apiUser: ApiUserResponse): User {
    return new User({
      id: apiUser.id,
      name: apiUser.name,
      email: apiUser.email,
      phone: apiUser.phone,
      role: apiUser.role as "ADMIN" | "STAFF",
      createdDate: new Date(apiUser.createdDate),
      updatedDate: new Date(apiUser.updatedDate),
    });
  }
}
