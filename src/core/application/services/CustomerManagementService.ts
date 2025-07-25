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
    return await this.customerRepository.getCustomers(params);
  }

  async getAllCustomers(): Promise<Customer[]> {
    return await this.customerRepository.getAllCustomers();
  }

  async getCustomersWithDebts(): Promise<Customer[]> {
    return await this.customerRepository.getCustomersWithDebts();
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

  async searchCustomers(query: string): Promise<Customer[]> {
    if (!query || query.trim().length < 2) {
      throw new Error("Search query must be at least 2 characters long");
    }

    const trimmedQuery = query.trim();

    // Try to find by name first
    const nameResults = await this.customerRepository.getCustomers({
      name: trimmedQuery,
    });

    // Try to find by email
    const emailResults = await this.customerRepository.getCustomers({
      email: trimmedQuery,
    });

    // Try to find by phone
    const phoneResults = await this.customerRepository.getCustomers({
      phone: trimmedQuery,
    });

    // Combine and deduplicate results
    const allCustomers = [
      ...nameResults.customers,
      ...emailResults.customers,
      ...phoneResults.customers,
    ];

    const uniqueCustomers = allCustomers.filter(
      (customer, index, self) =>
        index === self.findIndex((c) => c.id === customer.id)
    );

    return uniqueCustomers;
  }

  async getCustomersWithOverdueDebts(): Promise<Customer[]> {
    const customersWithDebts =
      await this.customerRepository.getCustomersWithDebts();
    return customersWithDebts.filter(
      (customer) => customer.getOverdueDebts().length > 0
    );
  }
}
