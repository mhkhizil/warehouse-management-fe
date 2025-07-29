import { Customer } from "../entities/Customer";
import {
  CreateCustomerDTO,
  CustomerFilterDTO,
  CustomerDomainListResponseDTO,
} from "../../application/dtos/CustomerDTO";

export interface ICustomerRepository {
  createCustomer(customerData: CreateCustomerDTO): Promise<Customer>;

  getCustomers(
    params?: CustomerFilterDTO
  ): Promise<CustomerDomainListResponseDTO>;

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
