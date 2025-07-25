import { ICustomerRepository } from "../../domain/repositories/ICustomerRepository";
import { Customer } from "../../domain/entities/Customer";
import { HttpClient } from "../api/HttpClient";
import { API_ENDPOINTS } from "../api/constants";
import { CreateCustomerDTO } from "../../application/dtos/CustomerDTO";

export class ApiCustomerRepository implements ICustomerRepository {
  constructor(private httpClient: HttpClient) {}

  async createCustomer(customerData: CreateCustomerDTO): Promise<Customer> {
    const response = await this.httpClient.post(
      API_ENDPOINTS.CUSTOMERS.CREATE,
      customerData
    );

    const responseData = (response as any).data;

    // Handle the actual API response structure
    if (responseData.data && responseData.data.id) {
      return new Customer(responseData.data);
    }

    // Fallback to other possible structures
    if (responseData.customer) {
      return new Customer(responseData.customer);
    }

    if (responseData.id) {
      return new Customer(responseData);
    }

    throw new Error(
      `Unexpected API response structure for createCustomer: ${JSON.stringify(
        responseData
      )}`
    );
  }

  async getCustomers(params?: {
    skip?: number;
    take?: number;
    name?: string;
    phone?: string;
    email?: string;
    hasDebt?: boolean;
    isActive?: boolean;
  }): Promise<{
    customers: Customer[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }> {
    const queryParams = new URLSearchParams();

    if (params?.skip !== undefined)
      queryParams.append("skip", params.skip.toString());
    if (params?.take !== undefined)
      queryParams.append("take", params.take.toString());
    if (params?.name) queryParams.append("name", params.name);
    if (params?.phone) queryParams.append("phone", params.phone);
    if (params?.email) queryParams.append("email", params.email);
    if (params?.hasDebt !== undefined)
      queryParams.append("hasDebt", params.hasDebt.toString());
    if (params?.isActive !== undefined)
      queryParams.append("isActive", params.isActive.toString());

    const url = `${API_ENDPOINTS.CUSTOMERS.GET_ALL}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    const response = await this.httpClient.get(url);

    // Debug: Log the response structure
    console.log("API Response:", response);
    console.log("Response data:", (response as any).data);

    // Handle different possible response structures
    const responseData = (response as any).data;

    // Case 1: response.data.customers (with pagination)
    if (responseData.customers && responseData.customers.data) {
      return {
        customers: responseData.customers.data.map(
          (customer: any) => new Customer(customer)
        ),
        total: responseData.customers.total || 0,
        page: responseData.customers.page || 1,
        limit: responseData.customers.limit || 10,
        totalPages: responseData.customers.totalPages || 1,
        hasNextPage: responseData.customers.hasNextPage || false,
        hasPrevPage: responseData.customers.hasPrevPage || false,
      };
    }

    // Case 2: response.data.customers (array directly)
    if (responseData.customers && Array.isArray(responseData.customers)) {
      return {
        customers: responseData.customers.map(
          (customer: any) => new Customer(customer)
        ),
        total: responseData.customers.length,
        page: 1,
        limit: responseData.customers.length,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      };
    }

    // Case 3: response.data is the array directly
    if (Array.isArray(responseData)) {
      return {
        customers: responseData.map((customer: any) => new Customer(customer)),
        total: responseData.length,
        page: 1,
        limit: responseData.length,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      };
    }

    // Case 4: response.data.data (common API pattern)
    if (responseData.data && Array.isArray(responseData.data)) {
      return {
        customers: responseData.data.map(
          (customer: any) => new Customer(customer)
        ),
        total: responseData.total || responseData.data.length,
        page: responseData.page || 1,
        limit: responseData.limit || responseData.data.length,
        totalPages: responseData.totalPages || 1,
        hasNextPage: responseData.hasNextPage || false,
        hasPrevPage: responseData.hasPrevPage || false,
      };
    }

    // Case 5: response.data.items (another common pattern)
    if (responseData.items && Array.isArray(responseData.items)) {
      return {
        customers: responseData.items.map(
          (customer: any) => new Customer(customer)
        ),
        total: responseData.total || responseData.items.length,
        page: responseData.page || 1,
        limit: responseData.limit || responseData.items.length,
        totalPages: responseData.totalPages || 1,
        hasNextPage: responseData.hasNextPage || false,
        hasPrevPage: responseData.hasPrevPage || false,
      };
    }

    // Case 6: response.data.results (another common pattern)
    if (responseData.results && Array.isArray(responseData.results)) {
      return {
        customers: responseData.results.map(
          (customer: any) => new Customer(customer)
        ),
        total: responseData.total || responseData.results.length,
        page: responseData.page || 1,
        limit: responseData.limit || responseData.results.length,
        totalPages: responseData.totalPages || 1,
        hasNextPage: responseData.hasNextPage || false,
        hasPrevPage: responseData.hasPrevPage || false,
      };
    }

    // Case 7: response.data.content (Spring Boot pattern)
    if (responseData.content && Array.isArray(responseData.content)) {
      return {
        customers: responseData.content.map(
          (customer: any) => new Customer(customer)
        ),
        total: responseData.totalElements || responseData.content.length,
        page: responseData.number || 1,
        limit: responseData.size || responseData.content.length,
        totalPages: responseData.totalPages || 1,
        hasNextPage: responseData.hasNext || false,
        hasPrevPage: responseData.hasPrevious || false,
      };
    }

    // If none of the expected structures match, try to find any array in the response
    const allKeys = Object.keys(responseData);
    for (const key of allKeys) {
      if (Array.isArray(responseData[key])) {
        console.warn(
          `Found array in unexpected key: ${key}`,
          responseData[key]
        );
        return {
          customers: responseData[key].map(
            (customer: any) => new Customer(customer)
          ),
          total: responseData.total || responseData[key].length,
          page: responseData.page || 1,
          limit: responseData.limit || responseData[key].length,
          totalPages: responseData.totalPages || 1,
          hasNextPage: responseData.hasNextPage || false,
          hasPrevPage: responseData.hasPrevPage || false,
        };
      }
    }

    // If still no match, throw an error with the full response structure
    throw new Error(
      `Unexpected API response structure: ${JSON.stringify(
        responseData,
        null,
        2
      )}`
    );
  }

  async getAllCustomers(): Promise<Customer[]> {
    const response = await this.httpClient.get(
      API_ENDPOINTS.CUSTOMERS.GET_ALL_NO_PAGINATION
    );

    const responseData = (response as any).data;

    // Handle different possible response structures
    if (responseData.customers && Array.isArray(responseData.customers)) {
      return responseData.customers.map(
        (customer: any) => new Customer(customer)
      );
    }

    if (Array.isArray(responseData)) {
      return responseData.map((customer: any) => new Customer(customer));
    }

    if (responseData.data && Array.isArray(responseData.data)) {
      return responseData.data.map((customer: any) => new Customer(customer));
    }

    throw new Error(
      `Unexpected API response structure for getAllCustomers: ${JSON.stringify(
        responseData
      )}`
    );
  }

  async getCustomersWithDebts(): Promise<Customer[]> {
    const response = await this.httpClient.get(
      API_ENDPOINTS.CUSTOMERS.GET_WITH_DEBTS
    );

    const responseData = (response as any).data;

    // Handle different possible response structures
    if (responseData.customers && Array.isArray(responseData.customers)) {
      return responseData.customers.map(
        (customer: any) => new Customer(customer)
      );
    }

    if (Array.isArray(responseData)) {
      return responseData.map((customer: any) => new Customer(customer));
    }

    if (responseData.data && Array.isArray(responseData.data)) {
      return responseData.data.map((customer: any) => new Customer(customer));
    }

    throw new Error(
      `Unexpected API response structure for getCustomersWithDebts: ${JSON.stringify(
        responseData
      )}`
    );
  }

  async getCustomerById(id: number): Promise<Customer> {
    const response = await this.httpClient.get(
      API_ENDPOINTS.CUSTOMERS.GET_BY_ID(id.toString())
    );

    const responseData = (response as any).data;

    if (responseData.customer) {
      return new Customer(responseData.customer);
    }

    if (responseData.data) {
      return new Customer(responseData.data);
    }

    // If the response is the customer object directly
    if (responseData.id) {
      return new Customer(responseData);
    }

    throw new Error(
      `Unexpected API response structure for getCustomerById: ${JSON.stringify(
        responseData
      )}`
    );
  }

  async updateCustomer(
    id: number,
    customerData: Partial<Customer>
  ): Promise<Customer> {
    const response = await this.httpClient.put(
      API_ENDPOINTS.CUSTOMERS.UPDATE(id.toString()),
      customerData
    );

    const responseData = (response as any).data;

    if (responseData.customer) {
      return new Customer(responseData.customer);
    }

    if (responseData.data) {
      return new Customer(responseData.data);
    }

    if (responseData.id) {
      return new Customer(responseData);
    }

    throw new Error(
      `Unexpected API response structure for updateCustomer: ${JSON.stringify(
        responseData
      )}`
    );
  }

  async deleteCustomer(id: number): Promise<boolean> {
    const response = await this.httpClient.delete(
      API_ENDPOINTS.CUSTOMERS.DELETE(id.toString())
    );

    const responseData = (response as any).data;

    // Handle boolean response (success/failure)
    if (typeof responseData === "boolean") {
      return responseData;
    }

    // Handle object response with success property
    if (responseData && typeof responseData.success === "boolean") {
      return responseData.success;
    }

    // Handle object response with message property (common pattern)
    if (responseData && responseData.message) {
      return true; // If we get a message, assume success
    }

    // If we get here, assume success (no error was thrown)
    return true;
  }

  async getCustomerByEmail(email: string): Promise<Customer> {
    const response = await this.httpClient.get(
      API_ENDPOINTS.CUSTOMERS.GET_BY_EMAIL(email)
    );

    const responseData = (response as any).data;

    if (responseData.customer) {
      return new Customer(responseData.customer);
    }

    if (responseData.data) {
      return new Customer(responseData.data);
    }

    if (responseData.id) {
      return new Customer(responseData);
    }

    throw new Error(
      `Unexpected API response structure for getCustomerByEmail: ${JSON.stringify(
        responseData
      )}`
    );
  }

  async getCustomerByPhone(phone: string): Promise<Customer> {
    const response = await this.httpClient.get(
      API_ENDPOINTS.CUSTOMERS.GET_BY_PHONE(phone)
    );

    const responseData = (response as any).data;

    if (responseData.customer) {
      return new Customer(responseData.customer);
    }

    if (responseData.data) {
      return new Customer(responseData.data);
    }

    if (responseData.id) {
      return new Customer(responseData);
    }

    throw new Error(
      `Unexpected API response structure for getCustomerByPhone: ${JSON.stringify(
        responseData
      )}`
    );
  }
}
