import { ICustomerRepository } from "../../domain/repositories/ICustomerRepository";
import { Customer } from "../../domain/entities/Customer";
import { CreateCustomerDTO } from "../dtos/CustomerDTO";

export class CustomerManagementService {
  constructor(private customerRepository: ICustomerRepository) {}

  async createCustomer(customerData: CreateCustomerDTO): Promise<Customer> {
    // Validate required fields for creation
    if (!customerData.name || !customerData.name.trim()) {
      throw new Error("Name is required");
    }

    if (!customerData.email || !customerData.email.includes("@")) {
      throw new Error("Valid email is required");
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerData.email)) {
      throw new Error("Invalid email format");
    }

    return await this.customerRepository.createCustomer(customerData);
  }

  async getCustomers(params?: {
    skip?: number;
    take?: number;
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    hasDebt?: boolean;
    isActive?: boolean;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<{
    customers: Customer[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }> {
    return await this.customerRepository.getCustomers(params);
  }

  async getAllCustomers(): Promise<Customer[]> {
    return await this.customerRepository.getAllCustomers();
  }

  async getCustomersWithDebts(
    take?: number,
    skip?: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ): Promise<{
    customers: Customer[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }> {
    return await this.customerRepository.getCustomers({
      take,
      skip,
      hasDebt: true,
      sortBy,
      sortOrder,
    });
  }

  async getCustomerById(id: number): Promise<Customer> {
    if (id <= 0) {
      throw new Error("Invalid customer ID");
    }
    return await this.customerRepository.getCustomerById(id);
  }

  async updateCustomer(
    id: number,
    customerData: Partial<Customer>
  ): Promise<Customer> {
    if (id <= 0) {
      throw new Error("Invalid customer ID");
    }

    // Get existing customer to validate the update
    const existingCustomer = await this.customerRepository.getCustomerById(id);

    // Create a merged customer object for validation
    const updatedCustomer = new Customer({
      ...existingCustomer,
      ...customerData,
    });

    if (!updatedCustomer.isValid()) {
      throw new Error("Invalid customer data");
    }

    return await this.customerRepository.updateCustomer(id, customerData);
  }

  async deleteCustomer(id: number): Promise<boolean> {
    if (id <= 0) {
      throw new Error("Invalid customer ID");
    }
    return await this.customerRepository.deleteCustomer(id);
  }

  async getCustomerByEmail(email: string): Promise<Customer> {
    if (!email || !email.includes("@")) {
      throw new Error("Invalid email address");
    }
    return await this.customerRepository.getCustomerByEmail(email);
  }

  async getCustomerByPhone(phone: string): Promise<Customer> {
    if (!phone || phone.length < 10) {
      throw new Error("Invalid phone number");
    }
    return await this.customerRepository.getCustomerByPhone(phone);
  }

  /**
   * Search customers by name
   */
  async searchCustomersByName(
    name: string,
    take: number = 10,
    skip: number = 0,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ): Promise<{
    customers: Customer[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }> {
    if (!name.trim()) {
      throw new Error("Search name cannot be empty");
    }

    return await this.getCustomers({
      take,
      skip,
      name: name.trim(),
      sortBy,
      sortOrder,
    });
  }

  /**
   * Search customers by email
   */
  async searchCustomersByEmail(
    email: string,
    take: number = 10,
    skip: number = 0,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ): Promise<{
    customers: Customer[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }> {
    if (!email.trim()) {
      throw new Error("Search email cannot be empty");
    }

    return await this.getCustomers({
      take,
      skip,
      email: email.trim(),
      sortBy,
      sortOrder,
    });
  }

  /**
   * Search customers by phone
   */
  async searchCustomersByPhone(
    phone: string,
    take: number = 10,
    skip: number = 0,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ): Promise<{
    customers: Customer[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }> {
    if (!phone.trim()) {
      throw new Error("Search phone cannot be empty");
    }

    return await this.getCustomers({
      take,
      skip,
      phone: phone.trim(),
      sortBy,
      sortOrder,
    });
  }

  /**
   * Search customers by address
   */
  async searchCustomersByAddress(
    address: string,
    take: number = 10,
    skip: number = 0,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ): Promise<{
    customers: Customer[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }> {
    if (!address.trim()) {
      throw new Error("Search address cannot be empty");
    }

    return await this.getCustomers({
      take,
      skip,
      address: address.trim(),
      sortBy,
      sortOrder,
    });
  }

  /**
   * General search customers (tries name, email, phone in order)
   */
  async searchCustomers(
    query: string,
    take?: number,
    skip?: number
  ): Promise<{
    customers: Customer[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }> {
    if (!query || query.trim().length < 2) {
      throw new Error("Search query must be at least 2 characters long");
    }

    const trimmedQuery = query.trim();

    // Try to find by name first, then by email, then by phone
    // This provides a more comprehensive search experience
    const nameResults = await this.customerRepository.getCustomers({
      name: trimmedQuery,
      take,
      skip,
    });

    // If we found results by name, return them
    if (nameResults.customers.length > 0) {
      return nameResults;
    }

    // Try email search
    const emailResults = await this.customerRepository.getCustomers({
      email: trimmedQuery,
      take,
      skip,
    });

    if (emailResults.customers.length > 0) {
      return emailResults;
    }

    // Try phone search
    const phoneResults = await this.customerRepository.getCustomers({
      phone: trimmedQuery,
      take,
      skip,
    });

    return phoneResults;
  }

  async getCustomersWithOverdueDebts(
    take?: number,
    skip?: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ): Promise<{
    customers: Customer[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }> {
    // First get customers with debts, then filter for overdue
    const result = await this.getCustomersWithDebts(
      take,
      skip,
      sortBy,
      sortOrder
    );

    // Filter for overdue debts
    const overdueCustomers = result.customers.filter(
      (customer) => customer.getOverdueDebts().length > 0
    );

    return {
      customers: overdueCustomers,
      total: overdueCustomers.length,
      page: result.page,
      limit: result.limit,
      totalPages: Math.ceil(overdueCustomers.length / result.limit),
      hasNextPage: false, // Since we're filtering, we don't have more pages
      hasPrevPage: result.hasPrevPage,
    };
  }

  async getDeletedCustomers(
    take?: number,
    skip?: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ): Promise<{
    customers: Customer[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }> {
    // For deleted customers, we need to get all and then paginate on the service level
    // since the repository method doesn't support pagination
    const allDeletedCustomers =
      await this.customerRepository.getDeletedCustomers();

    // Apply sorting if specified
    let sortedCustomers = [...allDeletedCustomers];
    if (sortBy && sortOrder) {
      sortedCustomers.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortBy) {
          case "name":
            aValue = a.name?.toLowerCase() || "";
            bValue = b.name?.toLowerCase() || "";
            break;
          case "email":
            aValue = a.email?.toLowerCase() || "";
            bValue = b.email?.toLowerCase() || "";
            break;
          case "phone":
            aValue = a.phone?.toLowerCase() || "";
            bValue = b.phone?.toLowerCase() || "";
            break;
          case "address":
            aValue = a.address?.toLowerCase() || "";
            bValue = b.address?.toLowerCase() || "";
            break;
          case "createdAt":
            aValue = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            bValue = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            break;
          case "updatedAt":
            aValue = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
            bValue = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
            break;
          default:
            aValue = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            bValue = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            break;
        }

        if (sortOrder === "asc") {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });
    }

    const startIndex = skip || 0;
    const endIndex = startIndex + (take || sortedCustomers.length);
    const paginatedCustomers = sortedCustomers.slice(startIndex, endIndex);

    const total = sortedCustomers.length;
    const page = Math.floor(startIndex / (take || 10)) + 1;
    const limit = take || 10;
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = endIndex < total;
    const hasPrevPage = startIndex > 0;

    return {
      customers: paginatedCustomers,
      total,
      page,
      limit,
      totalPages,
      hasNextPage,
      hasPrevPage,
    };
  }

  async restoreCustomer(id: number): Promise<Customer> {
    if (id <= 0) {
      throw new Error("Invalid customer ID");
    }
    return await this.customerRepository.restoreCustomer(id);
  }
}
