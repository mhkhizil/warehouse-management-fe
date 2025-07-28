import { Customer } from "../entities/Customer";
import { CreateCustomerDTO } from "../../application/dtos/CustomerDTO";

/**
 * Interface for customer service
 */
export interface ICustomerService {
  /**
   * Create a new customer
   */
  createCustomer(customerData: CreateCustomerDTO): Promise<Customer>;

  /**
   * Get customers with pagination, filtering, and sorting
   */
  getCustomers(params?: {
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
  }>;

  /**
   * Get all customers
   */
  getAllCustomers(): Promise<Customer[]>;

  /**
   * Get customers with debts
   */
  getCustomersWithDebts(
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
  }>;

  /**
   * Get customer by ID
   */
  getCustomerById(id: number): Promise<Customer>;

  /**
   * Update customer
   */
  updateCustomer(
    id: number,
    customerData: Partial<Customer>
  ): Promise<Customer>;

  /**
   * Delete customer
   */
  deleteCustomer(id: number): Promise<boolean>;

  /**
   * Get customer by email
   */
  getCustomerByEmail(email: string): Promise<Customer>;

  /**
   * Get customer by phone
   */
  getCustomerByPhone(phone: string): Promise<Customer>;

  /**
   * Search customers by name
   */
  searchCustomersByName(
    name: string,
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
  }>;

  /**
   * Search customers by email
   */
  searchCustomersByEmail(
    email: string,
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
  }>;

  /**
   * Search customers by phone
   */
  searchCustomersByPhone(
    phone: string,
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
  }>;

  /**
   * Search customers by address
   */
  searchCustomersByAddress(
    address: string,
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
  }>;

  /**
   * General search customers
   */
  searchCustomers(
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
  }>;

  /**
   * Get customers with overdue debts
   */
  getCustomersWithOverdueDebts(
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
  }>;

  /**
   * Get deleted customers
   */
  getDeletedCustomers(
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
  }>;

  /**
   * Restore deleted customer
   */
  restoreCustomer(id: number): Promise<Customer>;
}
