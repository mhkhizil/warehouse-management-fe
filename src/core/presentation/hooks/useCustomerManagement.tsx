import { useState, useCallback } from "react";
import { CustomerManagementService } from "../../application/services/CustomerManagementService";
import { Customer } from "../../domain/entities/Customer";
import {
  CreateCustomerDTO,
  UpdateCustomerDTO,
  CustomerFilterDTO,
} from "../../application/dtos/CustomerDTO";
import { CustomerDTOMapper } from "../../application/dtos/CustomerDTO";
import container from "../../infrastructure/di/container";

export const useCustomerManagement = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const createCustomer = useCallback(
    async (customerData: CreateCustomerDTO) => {
      try {
        setIsLoading(true);
        clearError();

        const customerService = container.resolve<CustomerManagementService>(
          "customerManagementService"
        );

        const customer = await customerService.createCustomer(customerData);

        setCustomers((prev) => [customer, ...prev]);
        return customer;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create customer";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [clearError]
  );

  const getCustomers = useCallback(
    async (params?: CustomerFilterDTO) => {
      try {
        setIsLoading(true);
        clearError();

        console.log(
          "useCustomerManagement: Starting getCustomers with params:",
          params
        );

        const customerService = container.resolve<CustomerManagementService>(
          "customerManagementService"
        );

        console.log("useCustomerManagement: Customer service resolved");

        const result = await customerService.getCustomers(params);

        console.log("useCustomerManagement: Service returned result:", result);
        console.log(
          "useCustomerManagement: Customers array:",
          result.customers
        );

        setCustomers(result.customers);
        setPagination({
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
          hasNextPage: result.hasNextPage,
          hasPrevPage: result.hasPrevPage,
        });

        return result;
      } catch (err) {
        console.error("useCustomerManagement: Error in getCustomers:", err);
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch customers";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [clearError]
  );

  const getAllCustomers = useCallback(async () => {
    try {
      setIsLoading(true);
      clearError();

      const customerService = container.resolve<CustomerManagementService>(
        "customerManagementService"
      );

      const allCustomers = await customerService.getAllCustomers();
      setCustomers(allCustomers);
      return allCustomers;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch all customers";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  const getCustomersWithDebts = useCallback(async () => {
    try {
      setIsLoading(true);
      clearError();

      const customerService = container.resolve<CustomerManagementService>(
        "customerManagementService"
      );

      const customersWithDebts = await customerService.getCustomersWithDebts();
      setCustomers(customersWithDebts);
      return customersWithDebts;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to fetch customers with debts";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  const getCustomerById = useCallback(
    async (id: number) => {
      try {
        setIsLoading(true);
        clearError();

        const customerService = container.resolve<CustomerManagementService>(
          "customerManagementService"
        );

        const customer = await customerService.getCustomerById(id);
        setCurrentCustomer(customer);
        return customer;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch customer";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [clearError]
  );

  const updateCustomer = useCallback(
    async (id: number, customerData: UpdateCustomerDTO) => {
      try {
        setIsLoading(true);
        clearError();

        const customerService = container.resolve<CustomerManagementService>(
          "customerManagementService"
        );

        const updatedCustomer = await customerService.updateCustomer(
          id,
          CustomerDTOMapper.fromUpdateDTO(customerData)
        );

        setCustomers((prev) =>
          prev.map((customer) =>
            customer.id === id ? updatedCustomer : customer
          )
        );

        if (currentCustomer?.id === id) {
          setCurrentCustomer(updatedCustomer);
        }

        return updatedCustomer;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update customer";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [clearError, currentCustomer]
  );

  const deleteCustomer = useCallback(
    async (id: number) => {
      try {
        setIsLoading(true);
        clearError();

        const customerService = container.resolve<CustomerManagementService>(
          "customerManagementService"
        );

        const success = await customerService.deleteCustomer(id);

        if (success) {
          setCustomers((prev) => prev.filter((customer) => customer.id !== id));

          if (currentCustomer?.id === id) {
            setCurrentCustomer(null);
          }
        }

        return success;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete customer";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [clearError, currentCustomer]
  );

  const searchCustomers = useCallback(
    async (query: string) => {
      try {
        setIsLoading(true);
        clearError();

        const customerService = container.resolve<CustomerManagementService>(
          "customerManagementService"
        );

        const searchResults = await customerService.searchCustomers(query);
        setCustomers(searchResults);
        return searchResults;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to search customers";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [clearError]
  );

  const getCustomersWithOverdueDebts = useCallback(async () => {
    try {
      setIsLoading(true);
      clearError();

      const customerService = container.resolve<CustomerManagementService>(
        "customerManagementService"
      );

      const overdueCustomers =
        await customerService.getCustomersWithOverdueDebts();
      setCustomers(overdueCustomers);
      return overdueCustomers;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to fetch customers with overdue debts";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  return {
    customers,
    currentCustomer,
    isLoading,
    error,
    pagination,
    createCustomer,
    getCustomers,
    getAllCustomers,
    getCustomersWithDebts,
    getCustomerById,
    updateCustomer,
    deleteCustomer,
    searchCustomers,
    getCustomersWithOverdueDebts,
    clearError,
  };
};
