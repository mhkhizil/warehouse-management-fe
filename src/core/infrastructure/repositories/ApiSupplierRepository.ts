import { Supplier } from "../../domain/entities/Supplier";
import { ISupplierRepository } from "../../domain/repositories/ISupplierRepository";
import { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";
import {
  CreateSupplierDTO,
  UpdateSupplierDTO,
  SupplierFilterDTO,
  SupplierDomainListResponseDTO,
  ApiSupplierResponse,
  ApiSupplierListResponse,
  ApiSupplierAllResponse,
} from "../../application/dtos/SupplierDTO";

/**
 * API response types for supplier endpoints
 */
interface ApiResponse<T> {
  message: string;
  code: number;
  data: T;
}

/**
 * Supplier Repository implementation for API calls
 * Handles supplier operations through HTTP API
 */
export class ApiSupplierRepository implements ISupplierRepository {
  private httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  /**
   * Create a new supplier
   */
  async createSupplier(supplierData: CreateSupplierDTO): Promise<Supplier> {
    try {
      const response = await this.httpClient.post<
        ApiResponse<ApiSupplierResponse>
      >(API_ENDPOINTS.SUPPLIERS.CREATE, supplierData);

      if (response.code === 201 && response.data) {
        return new Supplier(response.data);
      }

      throw new Error("Failed to create supplier");
    } catch (error: any) {
      console.error("Error creating supplier:", error);

      // Try to extract error message from response
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error("Failed to create supplier");
      }
    }
  }

  /**
   * Get suppliers with pagination and filtering
   */
  async getSuppliers(
    params?: SupplierFilterDTO
  ): Promise<SupplierDomainListResponseDTO> {
    try {
      const queryParams = new URLSearchParams();

      if (params?.name) queryParams.append("name", params.name);
      if (params?.email) queryParams.append("email", params.email);
      if (params?.phone) queryParams.append("phone", params.phone);
      if (params?.isActive !== undefined)
        queryParams.append("isActive", params.isActive.toString());
      if (params?.take) queryParams.append("take", params.take.toString());
      if (params?.skip) queryParams.append("skip", params.skip.toString());
      if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

      const url = `${API_ENDPOINTS.SUPPLIERS.GET_ALL}${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;

      console.log("Making API request to:", url);
      console.log("Query parameters:", queryParams.toString());

      const response = await this.httpClient.get(url);

      // Debug: Log the response structure
      console.log("API Response:", response);
      console.log("Response data:", (response as { data: any }).data);
      console.log("Response status:", (response as any).status);
      console.log("Response headers:", (response as any).headers);

      // Handle different possible response structures
      const responseData = (response as { data: any }).data;

      // Case 1: response.data.suppliers (with pagination)
      if (responseData.suppliers && responseData.suppliers.data) {
        return {
          suppliers: responseData.suppliers.data.map(
            (supplier: Record<string, unknown>) => new Supplier(supplier)
          ),
          total: responseData.suppliers.total || 0,
        };
      }

      // Case 2: response.data.suppliers (array directly)
      if (responseData.suppliers && Array.isArray(responseData.suppliers)) {
        return {
          suppliers: responseData.suppliers.map(
            (supplier: Record<string, unknown>) => new Supplier(supplier)
          ),
          total: responseData.suppliers.length,
        };
      }

      // Case 3: response.data is the array directly
      if (Array.isArray(responseData)) {
        return {
          suppliers: responseData.map(
            (supplier: Record<string, unknown>) => new Supplier(supplier)
          ),
          total: responseData.length,
        };
      }

      // Case 4: response.data.data (common API pattern)
      if (responseData.data && Array.isArray(responseData.data)) {
        return {
          suppliers: responseData.data.map(
            (supplier: Record<string, unknown>) => new Supplier(supplier)
          ),
          total: responseData.total || responseData.data.length,
        };
      }

      // Case 5: response.data.items (another common pattern)
      if (responseData.items && Array.isArray(responseData.items)) {
        return {
          suppliers: responseData.items.map(
            (supplier: Record<string, unknown>) => new Supplier(supplier)
          ),
          total: responseData.total || responseData.items.length,
        };
      }

      // Case 6: response.data.results (another common pattern)
      if (responseData.results && Array.isArray(responseData.results)) {
        return {
          suppliers: responseData.results.map(
            (supplier: Record<string, unknown>) => new Supplier(supplier)
          ),
          total: responseData.total || responseData.results.length,
        };
      }

      // Case 7: response.data.content (Spring Boot pattern)
      if (responseData.content && Array.isArray(responseData.content)) {
        return {
          suppliers: responseData.content.map(
            (supplier: Record<string, unknown>) => new Supplier(supplier)
          ),
          total: responseData.totalElements || responseData.content.length,
        };
      }

      // Case 8: response.data.success pattern
      if (
        responseData.success &&
        responseData.data &&
        responseData.data.suppliers
      ) {
        return {
          suppliers: responseData.data.suppliers.map(
            (supplier: Record<string, unknown>) => new Supplier(supplier)
          ),
          total: responseData.data.total || responseData.data.suppliers.length,
        };
      }

      // If none of the above patterns match, throw an error with the response structure
      console.error("Unexpected API response structure:", responseData);
      throw new Error(
        `Unexpected API response structure for getSuppliers: ${JSON.stringify(
          responseData
        )}`
      );
    } catch (error: any) {
      console.error("Error fetching suppliers:", error);

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error("Failed to fetch suppliers");
      }
    }
  }

  /**
   * Get all suppliers without pagination
   */
  async getAllSuppliers(): Promise<Supplier[]> {
    try {
      const response = await this.httpClient.get(
        API_ENDPOINTS.SUPPLIERS.GET_ALL_NO_PAGINATION
      );

      console.log("API Response for getAllSuppliers:", response);
      console.log("Response data:", (response as { data: any }).data);

      const responseData = (response as { data: any }).data;

      // Case 1: response.data is an array directly
      if (Array.isArray(responseData)) {
        return responseData.map(
          (supplier: Record<string, unknown>) => new Supplier(supplier)
        );
      }

      // Case 2: response.data.data (common API pattern)
      if (responseData.data && Array.isArray(responseData.data)) {
        return responseData.data.map(
          (supplier: Record<string, unknown>) => new Supplier(supplier)
        );
      }

      // Case 3: response.data.suppliers
      if (responseData.suppliers && Array.isArray(responseData.suppliers)) {
        return responseData.suppliers.map(
          (supplier: Record<string, unknown>) => new Supplier(supplier)
        );
      }

      // Case 4: response.data.items
      if (responseData.items && Array.isArray(responseData.items)) {
        return responseData.items.map(
          (supplier: Record<string, unknown>) => new Supplier(supplier)
        );
      }

      // Case 5: response.data.results
      if (responseData.results && Array.isArray(responseData.results)) {
        return responseData.results.map(
          (supplier: Record<string, unknown>) => new Supplier(supplier)
        );
      }

      // Case 6: response.data.content (Spring Boot pattern)
      if (responseData.content && Array.isArray(responseData.content)) {
        return responseData.content.map(
          (supplier: Record<string, unknown>) => new Supplier(supplier)
        );
      }

      // Case 7: response.data.success pattern
      if (
        responseData.success &&
        responseData.data &&
        Array.isArray(responseData.data)
      ) {
        return responseData.data.map(
          (supplier: Record<string, unknown>) => new Supplier(supplier)
        );
      }

      console.error(
        "Unexpected API response structure for getAllSuppliers:",
        responseData
      );
      throw new Error(
        `Unexpected API response structure for getAllSuppliers: ${JSON.stringify(
          responseData
        )}`
      );
    } catch (error: any) {
      console.error("Error fetching all suppliers:", error);

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error("Failed to fetch all suppliers");
      }
    }
  }

  /**
   * Get supplier by ID
   */
  async getSupplierById(id: number): Promise<Supplier> {
    try {
      const response = await this.httpClient.get<ApiSupplierResponse>(
        API_ENDPOINTS.SUPPLIERS.GET_BY_ID(id.toString())
      );

      return new Supplier(response);
    } catch (error: any) {
      console.error("Error fetching supplier by ID:", error);

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error("Supplier not found");
      }
    }
  }

  /**
   * Update supplier
   */
  async updateSupplier(
    id: number,
    supplierData: UpdateSupplierDTO
  ): Promise<Supplier> {
    try {
      const response = await this.httpClient.put<ApiSupplierResponse>(
        API_ENDPOINTS.SUPPLIERS.UPDATE(id.toString()),
        supplierData
      );

      return new Supplier(response);
    } catch (error: any) {
      console.error("Error updating supplier:", error);

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error("Failed to update supplier");
      }
    }
  }

  /**
   * Delete supplier (soft delete)
   */
  async deleteSupplier(id: number): Promise<boolean> {
    try {
      const response = await this.httpClient.delete<ApiResponse<boolean>>(
        API_ENDPOINTS.SUPPLIERS.DELETE(id.toString())
      );

      return response.code === 200 && response.data === true;
    } catch (error: any) {
      console.error("Error deleting supplier:", error);

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error("Failed to delete supplier");
      }
    }
  }

  /**
   * Restore deleted supplier
   */
  async restoreSupplier(id: number): Promise<Supplier> {
    try {
      const response = await this.httpClient.put<ApiSupplierResponse>(
        API_ENDPOINTS.SUPPLIERS.RESTORE(id.toString())
      );

      return new Supplier(response);
    } catch (error: any) {
      console.error("Error restoring supplier:", error);

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error("Failed to restore supplier");
      }
    }
  }

  /**
   * Search suppliers
   */
  async searchSuppliers(
    query: string,
    take: number = 10,
    skip: number = 0
  ): Promise<SupplierDomainListResponseDTO> {
    try {
      const queryParams = new URLSearchParams({
        query,
        take: take.toString(),
        skip: skip.toString(),
      });

      const url = `${
        API_ENDPOINTS.SUPPLIERS.GET_ALL
      }?${queryParams.toString()}`;

      const response = await this.httpClient.get<ApiSupplierListResponse>(url);

      if (response.success && response.data) {
        return {
          suppliers: response.data.suppliers.map(
            (supplier) => new Supplier(supplier)
          ),
          total: response.data.total,
        };
      }

      throw new Error("Failed to search suppliers");
    } catch (error: any) {
      console.error("Error searching suppliers:", error);

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error("Failed to search suppliers");
      }
    }
  }

  /**
   * Search suppliers by name
   */
  async searchSuppliersByName(
    name: string,
    take: number = 10,
    skip: number = 0,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ): Promise<SupplierDomainListResponseDTO> {
    try {
      const queryParams = new URLSearchParams({
        name,
        take: take.toString(),
        skip: skip.toString(),
      });

      if (sortBy) queryParams.append("sortBy", sortBy);
      if (sortOrder) queryParams.append("sortOrder", sortOrder);

      const url = `${
        API_ENDPOINTS.SUPPLIERS.GET_ALL
      }?${queryParams.toString()}`;

      const response = await this.httpClient.get<ApiSupplierListResponse>(url);

      if (response.success && response.data) {
        return {
          suppliers: response.data.suppliers.map(
            (supplier) => new Supplier(supplier)
          ),
          total: response.data.total,
        };
      }

      throw new Error("Failed to search suppliers by name");
    } catch (error: any) {
      console.error("Error searching suppliers by name:", error);

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error("Failed to search suppliers by name");
      }
    }
  }

  /**
   * Search suppliers by email
   */
  async searchSuppliersByEmail(
    email: string,
    take: number = 10,
    skip: number = 0,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ): Promise<SupplierDomainListResponseDTO> {
    try {
      const queryParams = new URLSearchParams({
        email,
        take: take.toString(),
        skip: skip.toString(),
      });

      if (sortBy) queryParams.append("sortBy", sortBy);
      if (sortOrder) queryParams.append("sortOrder", sortOrder);

      const url = `${
        API_ENDPOINTS.SUPPLIERS.GET_ALL
      }?${queryParams.toString()}`;

      const response = await this.httpClient.get<ApiSupplierListResponse>(url);

      if (response.success && response.data) {
        return {
          suppliers: response.data.suppliers.map(
            (supplier) => new Supplier(supplier)
          ),
          total: response.data.total,
        };
      }

      throw new Error("Failed to search suppliers by email");
    } catch (error: any) {
      console.error("Error searching suppliers by email:", error);

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error("Failed to search suppliers by email");
      }
    }
  }

  /**
   * Search suppliers by phone
   */
  async searchSuppliersByPhone(
    phone: string,
    take: number = 10,
    skip: number = 0,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ): Promise<SupplierDomainListResponseDTO> {
    try {
      const queryParams = new URLSearchParams({
        phone,
        take: take.toString(),
        skip: skip.toString(),
      });

      if (sortBy) queryParams.append("sortBy", sortBy);
      if (sortOrder) queryParams.append("sortOrder", sortOrder);

      const url = `${
        API_ENDPOINTS.SUPPLIERS.GET_ALL
      }?${queryParams.toString()}`;

      const response = await this.httpClient.get<ApiSupplierListResponse>(url);

      if (response.success && response.data) {
        return {
          suppliers: response.data.suppliers.map(
            (supplier) => new Supplier(supplier)
          ),
          total: response.data.total,
        };
      }

      throw new Error("Failed to search suppliers by phone");
    } catch (error: any) {
      console.error("Error searching suppliers by phone:", error);

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error("Failed to search suppliers by phone");
      }
    }
  }

  /**
   * Search suppliers by address
   */
  async searchSuppliersByAddress(
    address: string,
    take: number = 10,
    skip: number = 0,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ): Promise<SupplierDomainListResponseDTO> {
    try {
      const queryParams = new URLSearchParams({
        address,
        take: take.toString(),
        skip: skip.toString(),
      });

      if (sortBy) queryParams.append("sortBy", sortBy);
      if (sortOrder) queryParams.append("sortOrder", sortOrder);

      const url = `${
        API_ENDPOINTS.SUPPLIERS.GET_ALL
      }?${queryParams.toString()}`;

      const response = await this.httpClient.get<ApiSupplierListResponse>(url);

      if (response.success && response.data) {
        return {
          suppliers: response.data.suppliers.map(
            (supplier) => new Supplier(supplier)
          ),
          total: response.data.total,
        };
      }

      throw new Error("Failed to search suppliers by address");
    } catch (error: any) {
      console.error("Error searching suppliers by address:", error);

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error("Failed to search suppliers by address");
      }
    }
  }

  /**
   * Get suppliers with debts
   */
  async getSuppliersWithDebts(
    take: number = 10,
    skip: number = 0,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ): Promise<SupplierDomainListResponseDTO> {
    try {
      const queryParams = new URLSearchParams({
        take: take.toString(),
        skip: skip.toString(),
      });

      if (sortBy) queryParams.append("sortBy", sortBy);
      if (sortOrder) queryParams.append("sortOrder", sortOrder);

      const url = `${
        API_ENDPOINTS.SUPPLIERS.GET_WITH_DEBTS
      }?${queryParams.toString()}`;

      const response = await this.httpClient.get<ApiSupplierAllResponse>(url);

      if (response.success && response.data) {
        return {
          suppliers: response.data.map((supplier) => new Supplier(supplier)),
          total: response.data.length,
        };
      }

      throw new Error("Failed to fetch suppliers with debts");
    } catch (error: any) {
      console.error("Error fetching suppliers with debts:", error);

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error("Failed to fetch suppliers with debts");
      }
    }
  }

  /**
   * Get suppliers with overdue debts
   */
  async getSuppliersWithOverdueDebts(
    take: number = 10,
    skip: number = 0,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ): Promise<SupplierDomainListResponseDTO> {
    try {
      const queryParams = new URLSearchParams({
        take: take.toString(),
        skip: skip.toString(),
      });

      if (sortBy) queryParams.append("sortBy", sortBy);
      if (sortOrder) queryParams.append("sortOrder", sortOrder);

      const url = `${
        API_ENDPOINTS.SUPPLIERS.GET_WITH_DEBTS
      }?${queryParams.toString()}`;

      const response = await this.httpClient.get<ApiSupplierAllResponse>(url);

      if (response.success && response.data) {
        return {
          suppliers: response.data.map((supplier) => new Supplier(supplier)),
          total: response.data.length,
        };
      }

      throw new Error("Failed to fetch suppliers with overdue debts");
    } catch (error: any) {
      console.error("Error fetching suppliers with overdue debts:", error);

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error("Failed to fetch suppliers with overdue debts");
      }
    }
  }

  /**
   * Get deleted suppliers
   */
  async getDeletedSuppliers(
    take: number = 10,
    skip: number = 0,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ): Promise<SupplierDomainListResponseDTO> {
    try {
      const queryParams = new URLSearchParams({
        take: take.toString(),
        skip: skip.toString(),
      });

      if (sortBy) queryParams.append("sortBy", sortBy);
      if (sortOrder) queryParams.append("sortOrder", sortOrder);

      const url = `${
        API_ENDPOINTS.SUPPLIERS.GET_DELETED
      }?${queryParams.toString()}`;

      const response = await this.httpClient.get<ApiSupplierListResponse>(url);

      if (response.success && response.data) {
        return {
          suppliers: response.data.suppliers.map(
            (supplier) => new Supplier(supplier)
          ),
          total: response.data.total,
        };
      }

      throw new Error("Failed to fetch deleted suppliers");
    } catch (error: any) {
      console.error("Error fetching deleted suppliers:", error);

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error("Failed to fetch deleted suppliers");
      }
    }
  }

  /**
   * Get active suppliers
   */
  async getActiveSuppliers(
    take: number = 10,
    skip: number = 0,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ): Promise<SupplierDomainListResponseDTO> {
    try {
      const queryParams = new URLSearchParams({
        isActive: "true",
        take: take.toString(),
        skip: skip.toString(),
      });

      if (sortBy) queryParams.append("sortBy", sortBy);
      if (sortOrder) queryParams.append("sortOrder", sortOrder);

      const url = `${
        API_ENDPOINTS.SUPPLIERS.GET_ALL
      }?${queryParams.toString()}`;

      const response = await this.httpClient.get<ApiSupplierListResponse>(url);

      if (response.success && response.data) {
        return {
          suppliers: response.data.suppliers.map(
            (supplier) => new Supplier(supplier)
          ),
          total: response.data.total,
        };
      }

      throw new Error("Failed to fetch active suppliers");
    } catch (error: any) {
      console.error("Error fetching active suppliers:", error);

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error("Failed to fetch active suppliers");
      }
    }
  }
}
