import { Customer } from "../entities/Customer";
import { CreateCustomerDTO } from "../../application/dtos/CustomerDTO";

export interface ICustomerRepository {
  createCustomer(customerData: CreateCustomerDTO): Promise<Customer>;

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

  getAllCustomers(): Promise<Customer[]>;
  getCustomersWithDebts(): Promise<Customer[]>;
  getDeletedCustomers(): Promise<Customer[]>;
  getCustomerById(id: number): Promise<Customer>;
  updateCustomer(
    id: number,
    customerData: Partial<Customer>
  ): Promise<Customer>;
  deleteCustomer(id: number): Promise<boolean>;
  restoreCustomer(id: number): Promise<Customer>;
  getCustomerByEmail(email: string): Promise<Customer>;
  getCustomerByPhone(phone: string): Promise<Customer>;
}
