import { HttpClient } from "../api/HttpClient";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { ApiUserRepository } from "../repositories/ApiUserRepository";
import { LocalUserRepository } from "../repositories/LocalUserRepository";
import { IAuthService } from "../../domain/services/IAuthService";
import { AuthService } from "../../application/services/AuthService";

/**
 * Dependency Injection Container
 * Manages instances of services and repositories
 */
class Container {
  private instances: Map<string, any> = new Map();
  private useLocalStorage: boolean =
    import.meta.env.VITE_USE_LOCAL_STORAGE === undefined ||
    import.meta.env.VITE_USE_LOCAL_STORAGE === "true";

  constructor() {
    this.initializeContainer();
  }

  /**
   * Initialize container with default instances
   */
  private initializeContainer(): void {
    // Create HTTP client
    this.register("httpClient", new HttpClient());

    // Register repositories
    if (this.useLocalStorage) {
      this.register<IUserRepository>(
        "userRepository",
        new LocalUserRepository()
      );
    } else {
      this.register<IUserRepository>(
        "userRepository",
        new ApiUserRepository(this.resolve("httpClient"))
      );
    }

    // Register services
    this.register<IAuthService>(
      "authService",
      new AuthService(this.resolve("userRepository"))
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
