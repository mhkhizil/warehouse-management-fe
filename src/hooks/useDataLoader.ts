import { useCallback } from "react";

interface DataLoaderConfig {
  // Search methods
  searchByName?: (
    term: string,
    pageSize: number,
    skip: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ) => Promise<Record<string, unknown>[]>;
  searchByEmail?: (
    term: string,
    pageSize: number,
    skip: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ) => Promise<Record<string, unknown>[]>;
  searchByPhone?: (
    term: string,
    pageSize: number,
    skip: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ) => Promise<Record<string, unknown>[]>;
  searchByAddress?: (
    term: string,
    pageSize: number,
    skip: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ) => Promise<Record<string, unknown>[]>;

  // Filter methods
  filterByRole?: (
    role: string,
    pageSize: number,
    skip: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ) => Promise<Record<string, unknown>[]>;
  filterByDebt?: (
    debtType: string,
    pageSize: number,
    skip: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ) => Promise<Record<string, unknown>[]>;

  // Special methods
  getDeleted?: (
    pageSize: number,
    skip: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ) => Promise<Record<string, unknown>[]>;

  // Default load method
  loadAll: (params: {
    take: number;
    skip: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    role?: string;
  }) => Promise<Record<string, unknown>[]>;
}

interface UseDataLoaderReturn {
  loadData: (
    searchTerm: string,
    searchType: string,
    filter: string,
    currentPage: number,
    pageSize: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc",
    viewMode?: string
  ) => Promise<void>;
}

export function useDataLoader(config: DataLoaderConfig): UseDataLoaderReturn {
  const loadData = useCallback(
    async (
      searchTerm: string,
      searchType: string,
      filter: string,
      currentPage: number,
      pageSize: number,
      sortBy?: string,
      sortOrder?: "asc" | "desc",
      viewMode?: string
    ) => {
      const skip = (currentPage - 1) * pageSize;

      // Handle deleted view mode
      if (viewMode === "deleted" && config.getDeleted) {
        await config.getDeleted(pageSize, skip, sortBy, sortOrder);
        return;
      }

      // Handle search
      if (searchTerm.trim()) {
        switch (searchType) {
          case "email":
            if (config.searchByEmail) {
              await config.searchByEmail(
                searchTerm,
                pageSize,
                skip,
                sortBy,
                sortOrder
              );
            }
            break;
          case "phone":
            if (config.searchByPhone) {
              await config.searchByPhone(
                searchTerm,
                pageSize,
                skip,
                sortBy,
                sortOrder
              );
            }
            break;
          case "address":
            if (config.searchByAddress) {
              await config.searchByAddress(
                searchTerm,
                pageSize,
                skip,
                sortBy,
                sortOrder
              );
            }
            break;
          default:
            if (config.searchByName) {
              await config.searchByName(
                searchTerm,
                pageSize,
                skip,
                sortBy,
                sortOrder
              );
            }
            break;
        }
        return;
      }

      // Handle filters
      if (filter !== "ALL") {
        if (config.filterByRole) {
          await config.filterByRole(filter, pageSize, skip, sortBy, sortOrder);
        } else if (config.filterByDebt) {
          await config.filterByDebt(filter, pageSize, skip, sortBy, sortOrder);
        }
        return;
      }

      // Default load all
      await config.loadAll({
        take: pageSize,
        skip,
        sortBy,
        sortOrder,
        role: filter !== "ALL" ? filter : undefined,
      });
    },
    [config]
  );

  return { loadData };
}

// Convenience hooks for specific entities
export function useUserDataLoader(
  searchUsers: (
    term: string,
    pageSize?: number,
    skip?: number
  ) => Promise<void>,
  searchUsersByEmail: (
    term: string,
    pageSize?: number,
    skip?: number
  ) => Promise<void>,
  searchUsersByPhone: (
    term: string,
    pageSize?: number,
    skip?: number
  ) => Promise<void>,
  filterByRole: (
    role: "ADMIN" | "STAFF",
    pageSize?: number,
    skip?: number
  ) => Promise<void>,
  loadUsers: (params: {
    take: number;
    skip: number;
    name?: string;
    email?: string;
    phone?: string;
    role?: "ADMIN" | "STAFF";
    sortBy?: "name" | "email" | "phone" | "role" | "createdAt" | "updatedAt";
    sortOrder?: "asc" | "desc";
  }) => Promise<void>
) {
  return useDataLoader({
    searchByName: async (term: string, pageSize: number, skip: number) => {
      await searchUsers(term, pageSize, skip);
      return [];
    },
    searchByEmail: async (term: string, pageSize: number, skip: number) => {
      await searchUsersByEmail(term, pageSize, skip);
      return [];
    },
    searchByPhone: async (term: string, pageSize: number, skip: number) => {
      await searchUsersByPhone(term, pageSize, skip);
      return [];
    },
    filterByRole: async (role: string, pageSize: number, skip: number) => {
      await filterByRole(role as "ADMIN" | "STAFF", pageSize, skip);
      return [];
    },
    loadAll: async (params: {
      take: number;
      skip: number;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
      role?: string;
    }) => {
      await loadUsers({
        ...params,
        role: params.role as "ADMIN" | "STAFF" | undefined,
        sortBy: params.sortBy as
          | "name"
          | "email"
          | "phone"
          | "role"
          | "createdAt"
          | "updatedAt"
          | undefined,
      });
      return [];
    },
  });
}

export function useCustomerDataLoader(
  searchCustomersByName: (
    term: string,
    pageSize: number,
    skip: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ) => Promise<{ customers: Record<string, unknown>[]; total: number }>,
  searchCustomersByEmail: (
    term: string,
    pageSize: number,
    skip: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ) => Promise<{ customers: Record<string, unknown>[]; total: number }>,
  searchCustomersByPhone: (
    term: string,
    pageSize: number,
    skip: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ) => Promise<{ customers: Record<string, unknown>[]; total: number }>,
  searchCustomersByAddress: (
    term: string,
    pageSize: number,
    skip: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ) => Promise<{ customers: Record<string, unknown>[]; total: number }>,
  getCustomersWithDebts: (
    pageSize: number,
    skip: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ) => Promise<{ customers: Record<string, unknown>[]; total: number }>,
  getCustomersWithOverdueDebts: (
    pageSize: number,
    skip: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ) => Promise<{ customers: Record<string, unknown>[]; total: number }>,
  getDeletedCustomers: (
    pageSize: number,
    skip: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ) => Promise<{ customers: Record<string, unknown>[]; total: number }>,
  getCustomers: (params: {
    take: number;
    skip: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) => Promise<{ customers: Record<string, unknown>[]; total: number }>
) {
  return useDataLoader({
    searchByName: async (
      term: string,
      pageSize: number,
      skip: number,
      sortBy?: string,
      sortOrder?: "asc" | "desc"
    ) => {
      const result = await searchCustomersByName(
        term,
        pageSize,
        skip,
        sortBy,
        sortOrder
      );
      return result.customers;
    },
    searchByEmail: async (
      term: string,
      pageSize: number,
      skip: number,
      sortBy?: string,
      sortOrder?: "asc" | "desc"
    ) => {
      const result = await searchCustomersByEmail(
        term,
        pageSize,
        skip,
        sortBy,
        sortOrder
      );
      return result.customers;
    },
    searchByPhone: async (
      term: string,
      pageSize: number,
      skip: number,
      sortBy?: string,
      sortOrder?: "asc" | "desc"
    ) => {
      const result = await searchCustomersByPhone(
        term,
        pageSize,
        skip,
        sortBy,
        sortOrder
      );
      return result.customers;
    },
    searchByAddress: async (
      term: string,
      pageSize: number,
      skip: number,
      sortBy?: string,
      sortOrder?: "asc" | "desc"
    ) => {
      const result = await searchCustomersByAddress(
        term,
        pageSize,
        skip,
        sortBy,
        sortOrder
      );
      return result.customers;
    },
    filterByDebt: async (
      debtType: string,
      pageSize: number,
      skip: number,
      sortBy?: string,
      sortOrder?: "asc" | "desc"
    ) => {
      if (debtType === "WITH_DEBT") {
        const result = await getCustomersWithDebts(
          pageSize,
          skip,
          sortBy,
          sortOrder
        );
        return result.customers;
      } else if (debtType === "OVERDUE") {
        const result = await getCustomersWithOverdueDebts(
          pageSize,
          skip,
          sortBy,
          sortOrder
        );
        return result.customers;
      }
      return [];
    },
    getDeleted: async (
      pageSize: number,
      skip: number,
      sortBy?: string,
      sortOrder?: "asc" | "desc"
    ) => {
      const result = await getDeletedCustomers(
        pageSize,
        skip,
        sortBy,
        sortOrder
      );
      return result.customers;
    },
    loadAll: async (params: {
      take: number;
      skip: number;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
      role?: string;
    }) => {
      const result = await getCustomers(params);
      return result.customers;
    },
  });
}

export function useSupplierDataLoader(
  searchSuppliersByName: (
    term: string,
    pageSize: number,
    skip: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ) => Promise<{ suppliers: Record<string, unknown>[]; total: number }>,
  searchSuppliersByEmail: (
    term: string,
    pageSize: number,
    skip: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ) => Promise<{ suppliers: Record<string, unknown>[]; total: number }>,
  searchSuppliersByPhone: (
    term: string,
    pageSize: number,
    skip: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ) => Promise<{ suppliers: Record<string, unknown>[]; total: number }>,
  searchSuppliersByAddress: (
    term: string,
    pageSize: number,
    skip: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ) => Promise<{ suppliers: Record<string, unknown>[]; total: number }>,
  getSuppliersWithDebts: (
    pageSize: number,
    skip: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ) => Promise<{ suppliers: Record<string, unknown>[]; total: number }>,
  getSuppliersWithOverdueDebts: (
    pageSize: number,
    skip: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ) => Promise<{ suppliers: Record<string, unknown>[]; total: number }>,
  getDeletedSuppliers: (
    pageSize: number,
    skip: number,
    sortBy?: string,
    sortOrder?: "asc" | "desc"
  ) => Promise<{ suppliers: Record<string, unknown>[]; total: number }>,
  getSuppliers: (params: {
    take: number;
    skip: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) => Promise<{ suppliers: Record<string, unknown>[]; total: number }>
) {
  return useDataLoader({
    searchByName: async (
      term: string,
      pageSize: number,
      skip: number,
      sortBy?: string,
      sortOrder?: "asc" | "desc"
    ) => {
      const result = await searchSuppliersByName(
        term,
        pageSize,
        skip,
        sortBy,
        sortOrder
      );
      return result.suppliers;
    },
    searchByEmail: async (
      term: string,
      pageSize: number,
      skip: number,
      sortBy?: string,
      sortOrder?: "asc" | "desc"
    ) => {
      const result = await searchSuppliersByEmail(
        term,
        pageSize,
        skip,
        sortBy,
        sortOrder
      );
      return result.suppliers;
    },
    searchByPhone: async (
      term: string,
      pageSize: number,
      skip: number,
      sortBy?: string,
      sortOrder?: "asc" | "desc"
    ) => {
      const result = await searchSuppliersByPhone(
        term,
        pageSize,
        skip,
        sortBy,
        sortOrder
      );
      return result.suppliers;
    },
    searchByAddress: async (
      term: string,
      pageSize: number,
      skip: number,
      sortBy?: string,
      sortOrder?: "asc" | "desc"
    ) => {
      const result = await searchSuppliersByAddress(
        term,
        pageSize,
        skip,
        sortBy,
        sortOrder
      );
      return result.suppliers;
    },
    filterByDebt: async (
      debtType: string,
      pageSize: number,
      skip: number,
      sortBy?: string,
      sortOrder?: "asc" | "desc"
    ) => {
      if (debtType === "WITH_DEBT") {
        const result = await getSuppliersWithDebts(
          pageSize,
          skip,
          sortBy,
          sortOrder
        );
        return result.suppliers;
      } else if (debtType === "OVERDUE") {
        const result = await getSuppliersWithOverdueDebts(
          pageSize,
          skip,
          sortBy,
          sortOrder
        );
        return result.suppliers;
      }
      return [];
    },
    getDeleted: async (
      pageSize: number,
      skip: number,
      sortBy?: string,
      sortOrder?: "asc" | "desc"
    ) => {
      const result = await getDeletedSuppliers(
        pageSize,
        skip,
        sortBy,
        sortOrder
      );
      return result.suppliers;
    },
    loadAll: async (params: {
      take: number;
      skip: number;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
      role?: string;
    }) => {
      const result = await getSuppliers(params);
      return result.suppliers;
    },
  });
}
