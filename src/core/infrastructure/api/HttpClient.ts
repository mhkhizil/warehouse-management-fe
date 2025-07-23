import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { API_CONFIG, API_ENDPOINTS } from "./constants";
import { tokenCookies } from "@/lib/cookies";

/**
 * Base HTTP client using Axios
 * Handles common configuration and error handling for API requests
 * Implements CSRF protection for all non-GET requests (except login)
 */
export class HttpClient {
  private client: AxiosInstance;
  private baseUrl: string;
  private csrfToken: string | null = null;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || API_CONFIG.BASE_URL;

    // Create axios instance
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true, // Important for cookies and CSRF
    });

    // Add request interceptor for auth token and CSRF protection
    this.client.interceptors.request.use(
      async (config) => {
        const token = tokenCookies.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Handle FormData requests by removing Content-Type header
        // This allows the browser to set the proper multipart/form-data header with boundary
        if (config.data instanceof FormData) {
          delete config.headers["Content-Type"];
        }

        // CSRF Protection Logic
        // Skip CSRF for GET, HEAD, and OPTIONS requests
        if (
          ["GET", "HEAD", "OPTIONS"].includes(
            config.method?.toUpperCase() || ""
          )
        ) {
          return config;
        }

        // Skip CSRF for login endpoint
        if (config.url === API_ENDPOINTS.AUTH.LOGIN) {
          return config;
        }

        // Get CSRF token if not available (required for all other POST/PUT/DELETE/PATCH)
        if (!this.csrfToken && token) {
          try {
            const response = await axios.get(
              `${this.baseUrl}${API_ENDPOINTS.CSRF.TOKEN}`,
              {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true,
              }
            );
            this.csrfToken = response.data.token;
            if (this.csrfToken) {
              tokenCookies.setCsrfToken(this.csrfToken);
            }
          } catch (error) {
            console.error("Failed to get CSRF token:", error);
            // Don't throw here, let the request proceed and handle the error in response interceptor
          }
        }

        // Add CSRF token to headers for all non-GET requests (except login)
        if (this.csrfToken) {
          config.headers["X-CSRF-Token"] = this.csrfToken;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        // Handle token expiration or auth errors
        if (error.response?.status === 401) {
          tokenCookies.clearAll();
          this.csrfToken = null;
          // Redirect to login if needed
          // window.location.href = '/login';
        }

        // Handle CSRF token errors
        if (
          error.response?.status === 403 &&
          error.response?.data?.message?.includes("CSRF")
        ) {
          // Clear CSRF token and retry
          this.csrfToken = null;
          tokenCookies.removeCsrfToken();
          console.error("CSRF token invalid, please retry");
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Manually refresh CSRF token
   * Useful when token expires or becomes invalid
   */
  async refreshCsrfToken(): Promise<string | null> {
    try {
      const token = tokenCookies.getToken();
      if (!token) {
        throw new Error("No JWT token available");
      }

      const response = await axios.get(
        `${this.baseUrl}${API_ENDPOINTS.CSRF.TOKEN}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      this.csrfToken = response.data.token;
      if (this.csrfToken) {
        tokenCookies.setCsrfToken(this.csrfToken);
      }
      return this.csrfToken;
    } catch (error) {
      console.error("Failed to refresh CSRF token:", error);
      this.csrfToken = null;
      tokenCookies.removeCsrfToken();
      return null;
    }
  }

  /**
   * Clear CSRF token (useful for logout)
   */
  clearCsrfToken(): void {
    this.csrfToken = null;
    tokenCookies.removeCsrfToken();
  }

  /**
   * Make a GET request
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.get(url, config);
    return response.data;
  }

  /**
   * Make a POST request
   */
  async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.post(
      url,
      data,
      config
    );
    return response.data;
  }

  /**
   * Make a PUT request
   */
  async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.put(url, data, config);
    return response.data;
  }

  /**
   * Make a PATCH request
   */
  async patch<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response: AxiosResponse<T> = await this.client.patch(
      url,
      data,
      config
    );
    return response.data;
  }

  /**
   * Make a DELETE request
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.client.delete(url, config);
    return response.data;
  }
}
