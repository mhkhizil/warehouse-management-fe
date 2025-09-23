import React from "react";
import {
  createDateFormatter,
  createNumberFormatter,
} from "@/lib/i18n/formatters";

interface CSVExportData {
  [key: string]: string | number | Date | null | undefined;
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
      // console.warn("No data to export"); // Removed for security
      return "";
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
          const formatter = createDateFormatter(locale);
          return formatter(value, dateFormat);
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

export function useEntityCSVExport<T extends Record<string, unknown>>({
  data,
  entityName,
  fieldMappings,
  filename,
}: UseEntityCSVExportProps<T>) {
  const exportToCSV = React.useCallback(() => {
    if (!data || data.length === 0) {
      // console.warn(`No ${entityName} data to export`); // Removed for security
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
          const formatter = createDateFormatter("en-US");
          return formatter(value, {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
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
  date:
    (dateFormat?: Intl.DateTimeFormatOptions, locale: string = "en-US") =>
    (value: unknown) => {
      if (!value) return "";
      if (value instanceof Date) {
        const formatter = createDateFormatter(locale);
        return formatter(
          value,
          dateFormat || {
            year: "numeric",
            month: "short",
            day: "numeric",
          }
        );
      }
      return String(value);
    },

  currency:
    (currency = "USD", locale: string = "en-US") =>
    (value: unknown) => {
      if (value === null || value === undefined) return "";
      const num = Number(value);
      if (isNaN(num)) return String(value);
      const formatter = createNumberFormatter(locale);
      return formatter(num, {
        style: "currency",
        currency,
      });
    },

  number:
    (options?: Intl.NumberFormatOptions, locale: string = "en-US") =>
    (value: unknown) => {
      if (value === null || value === undefined) return "";
      const num = Number(value);
      if (isNaN(num)) return String(value);
      const formatter = createNumberFormatter(locale);
      return formatter(num, options);
    },

  boolean:
    (trueText = "Yes", falseText = "No") =>
    (value: unknown) => {
      if (value === null || value === undefined) return "";
      return value ? trueText : falseText;
    },

  array:
    (separator = ", ") =>
    (value: unknown) => {
      if (!value) return "";
      if (Array.isArray(value)) {
        return value.join(separator);
      }
      return String(value);
    },
};
