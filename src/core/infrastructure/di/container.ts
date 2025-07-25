import { HttpClient } from "../api/HttpClient";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { ApiUserRepository } from "../repositories/ApiUserRepository";
import { ApiAuthRepository } from "../repositories/ApiAuthRepository";
import { ICustomerRepository } from "../../domain/repositories/ICustomerRepository";
import { ApiCustomerRepository } from "../repositories/ApiCustomerRepository";
import { IAuthService } from "../../domain/services/IAuthService";
import { AuthService } from "../../application/services/AuthService";
import { UserManagementService } from "../../application/services/UserManagementService";
import { CustomerManagementService } from "../../application/services/CustomerManagementService";

/**
 * Dependency Injection Container
 * Manages instances of services and repositories
 */
class Container {
  private instances: Map<string, unknown> = new Map();

  constructor() {
    this.initializeContainer();
  }

  /**
   * Initialize container with default instances
   */
  private initializeContainer(): void {
    // Create HTTP client
    this.register("httpClient", new HttpClient());

    // Register repositories - Use API repositories for actual API calls
    this.register<IUserRepository>(
      "userRepository",
      new ApiUserRepository(this.resolve("httpClient"))
    );

    this.register<ApiAuthRepository>(
      "authRepository",
      new ApiAuthRepository(this.resolve("httpClient"))
    );

    this.register<ICustomerRepository>(
      "customerRepository",
      new ApiCustomerRepository(this.resolve("httpClient"))
    );

    // Register services
    this.register<IAuthService>(
      "authService",
      new AuthService(this.resolve("authRepository"))
    );

    // Register user management service
    this.register<UserManagementService>(
      "userManagementService",
      new UserManagementService(this.resolve("userRepository"))
    );

    // Register customer management service
    this.register<CustomerManagementService>(
      "customerManagementService",
      new CustomerManagementService(this.resolve("customerRepository"))
    );
  }

  /**
   * Register an instance with the container
   */
  register<T>(key: string, instance: T): void {
    this.instances.set(key, instance);
  }

  /**
   * Resolve an instance from the container
   */
  resolve<T>(key: string): T {
    const instance = this.instances.get(key);
    if (!instance) {
      throw new Error(`No instance registered for key: ${key}`);
    }
    return instance as T;
  }
}

// Create singleton instance
const container = new Container();

export default container;
