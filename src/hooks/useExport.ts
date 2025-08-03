import { useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  useEntityCSVExport,
  CSVFormatters,
} from "@/components/reassembledComps/csv-export";

interface ExportConfig<T> {
  entityName: string;
  fieldMappings: {
    [K in keyof T]?: {
      header: string;
      formatter?: (value: T[K]) => string;
    };
  };
  filename?: string;
  adminOnly?: boolean;
  successMessage?: string;
  errorMessage?: string;
}

interface UseExportReturn {
  handleExport: () => void;
  exportToCSV: () => void;
  isExportDisabled: boolean;
}

export function useExport<T extends Record<string, unknown>>(
  data: T[],
  config: ExportConfig<T>,
  currentUser?: { isAdmin?: () => boolean } | null
): UseExportReturn {
  const { toast } = useToast();

  const { exportToCSV } = useEntityCSVExport({
    data,
    entityName: config.entityName,
    fieldMappings: config.fieldMappings,
    filename: config.filename,
  });

  const handleExport = useCallback(() => {
    // Check admin permissions if required
    if (config.adminOnly && !currentUser?.isAdmin?.()) {
      toast({
        title: "Access Denied",
        description: `Only administrators can export ${config.entityName.toLowerCase()} data`,
        variant: "destructive",
      });
      return;
    }

    // Check if there's data to export
    if (!data || data.length === 0) {
      toast({
        title: "No Data",
        description: `No ${config.entityName.toLowerCase()} data to export`,
        variant: "destructive",
      });
      return;
    }

    try {
      exportToCSV();
      toast({
        title: "Success",
        description:
          config.successMessage ||
          `${config.entityName} data exported successfully`,
        variant: "success",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Error",
        description:
          config.errorMessage ||
          `Failed to export ${config.entityName.toLowerCase()} data`,
        variant: "destructive",
      });
    }
  }, [data, config, currentUser, exportToCSV, toast]);

  const isExportDisabled = config.adminOnly
    ? !currentUser?.isAdmin?.() || data.length === 0
    : data.length === 0;

  return {
    handleExport,
    exportToCSV,
    isExportDisabled,
  };
}

// Predefined configurations for common entities
export const ExportConfigs = {
  users: {
    entityName: "Users",
    fieldMappings: {
      name: { header: "Name" },
      email: { header: "Email" },
      phone: { header: "Phone" },
      role: { header: "Role" },
      createdDate: {
        header: "Created Date",
        formatter: CSVFormatters.date(),
      },
    },
    adminOnly: true,
    successMessage: "User data exported successfully",
    errorMessage: "Failed to export user data",
  },

  customers: {
    entityName: "Customers",
    fieldMappings: {
      name: { header: "Name" },
      email: { header: "Email" },
      phone: { header: "Phone" },
      address: { header: "Address" },
      createdAt: {
        header: "Created Date",
        formatter: CSVFormatters.date(),
      },
    },
    adminOnly: true,
    successMessage: "Customer data exported successfully",
    errorMessage: "Failed to export customer data",
  },

  suppliers: {
    entityName: "Suppliers",
    fieldMappings: {
      name: { header: "Name" },
      email: { header: "Email" },
      phone: { header: "Phone" },
      address: { header: "Address" },
      createdAt: {
        header: "Created Date",
        formatter: CSVFormatters.date(),
      },
    },
    adminOnly: true,
    successMessage: "Supplier data exported successfully",
    errorMessage: "Failed to export supplier data",
  },
} as const;

// Convenience hooks for specific entities
export function useUserExport(
  users: Record<string, unknown>[],
  currentUser?: { isAdmin?: () => boolean } | null
) {
  return useExport(users, ExportConfigs.users, currentUser);
}

export function useCustomerExport(
  customers: Record<string, unknown>[],
  currentUser?: { isAdmin?: () => boolean } | null
) {
  return useExport(customers, ExportConfigs.customers, currentUser);
}

export function useSupplierExport(
  suppliers: Record<string, unknown>[],
  currentUser?: { isAdmin?: () => boolean } | null
) {
  return useExport(suppliers, ExportConfigs.suppliers, currentUser);
}
