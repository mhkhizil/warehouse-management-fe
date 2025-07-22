import React from "react";

interface CSVExportData {
  [key: string]: string | number | Date | null | undefined;
}

interface CSVExportOptions {
  filename?: string;
  headers?: string[];
  dateFormat?: Intl.DateTimeFormatOptions;
  locale?: string;
}

interface UseCSVExportProps {
  data: CSVExportData[];
  headers?: string[];
  filename?: string;
  dateFormat?: Intl.DateTimeFormatOptions;
  locale?: string;
}

export function useCSVExport({
  data,
  headers,
  filename = "export",
  dateFormat = {
    year: "numeric",
    month: "short",
    day: "numeric",
  },
  locale = "en-US",
}: UseCSVExportProps) {
  const exportToCSV = React.useCallback(() => {
    if (!data || data.length === 0) {
      console.warn("No data to export");
      return;
    }

    // Determine headers
    const csvHeaders = headers || Object.keys(data[0] || {});

    // Format data rows
    const csvData = data.map((row) =>
      csvHeaders.map((header) => {
        const value = row[header];

        if (value === null || value === undefined) {
          return "";
        }

        if (value instanceof Date) {
          return new Intl.DateTimeFormat(locale, dateFormat).format(value);
        }

        return String(value);
      })
    );

    // Create CSV content
    const csvContent = [
      csvHeaders.join(","),
      ...csvData.map((row) => row.map((field) => `"${field}"`).join(",")),
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().split("T")[0];

    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}-${timestamp}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    URL.revokeObjectURL(url);
  }, [data, headers, filename, dateFormat, locale]);

  return { exportToCSV };
}

// Hook for specific entity types with predefined configurations
interface UseEntityCSVExportProps<T> {
  data: T[];
  entityName: string;
  fieldMappings: {
    [K in keyof T]?: {
      header: string;
      formatter?: (value: T[K]) => string;
    };
  };
  filename?: string;
}

export function useEntityCSVExport<T extends Record<string, any>>({
  data,
  entityName,
  fieldMappings,
  filename,
}: UseEntityCSVExportProps<T>) {
  const exportToCSV = React.useCallback(() => {
    if (!data || data.length === 0) {
      console.warn(`No ${entityName} data to export`);
      return;
    }

    // Extract headers and field keys
    const fieldKeys = Object.keys(fieldMappings) as (keyof T)[];
    const headers = fieldKeys.map((key) => fieldMappings[key]!.header);

    // Format data rows
    const csvData = data.map((item) =>
      fieldKeys.map((key) => {
        const value = item[key];
        const formatter = fieldMappings[key]?.formatter;

        if (formatter) {
          return formatter(value);
        }

        if (value === null || value === undefined) {
          return "";
        }

        if (value instanceof Date) {
          return new Intl.DateTimeFormat("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          }).format(value);
        }

        return String(value);
      })
    );

    // Create CSV content
    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.map((field) => `"${field}"`).join(",")),
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    const timestamp = new Date().toISOString().split("T")[0];
    const finalFilename = filename || `${entityName.toLowerCase()}-export`;

    link.setAttribute("href", url);
    link.setAttribute("download", `${finalFilename}-${timestamp}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Clean up
    URL.revokeObjectURL(url);
  }, [data, entityName, fieldMappings, filename]);

  return { exportToCSV };
}

// Utility function for common field formatters
export const CSVFormatters = {
  date: (dateFormat?: Intl.DateTimeFormatOptions) => (value: any) => {
    if (!value) return "";
    if (value instanceof Date) {
      return new Intl.DateTimeFormat(
        "en-US",
        dateFormat || {
          year: "numeric",
          month: "short",
          day: "numeric",
        }
      ).format(value);
    }
    return String(value);
  },

  currency:
    (currency = "USD") =>
    (value: any) => {
      if (value === null || value === undefined) return "";
      const num = Number(value);
      if (isNaN(num)) return String(value);
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
      }).format(num);
    },

  number: (options?: Intl.NumberFormatOptions) => (value: any) => {
    if (value === null || value === undefined) return "";
    const num = Number(value);
    if (isNaN(num)) return String(value);
    return new Intl.NumberFormat("en-US", options).format(num);
  },

  boolean:
    (trueText = "Yes", falseText = "No") =>
    (value: any) => {
      if (value === null || value === undefined) return "";
      return value ? trueText : falseText;
    },

  array:
    (separator = ", ") =>
    (value: any) => {
      if (!value) return "";
      if (Array.isArray(value)) {
        return value.join(separator);
      }
      return String(value);
    },
};
