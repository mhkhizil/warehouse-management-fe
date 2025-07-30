import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-select",
      "@radix-ui/react-tabs",
      "lucide-react",
      "clsx",
      "tailwind-merge",
    ],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // ===== VENDOR CHUNKS (Third-party libraries) =====

          // React ecosystem
          if (
            id.includes("node_modules/react") ||
            id.includes("node_modules/react-dom")
          ) {
            return "vendor-react";
          }

          // React Router
          if (id.includes("node_modules/react-router")) {
            return "vendor-router";
          }

          // Radix UI components (grouped by functionality)
          if (
            id.includes("node_modules/@radix-ui/react-dialog") ||
            id.includes("node_modules/@radix-ui/react-dropdown-menu") ||
            id.includes("node_modules/@radix-ui/react-select") ||
            id.includes("node_modules/@radix-ui/react-tabs") ||
            id.includes("node_modules/@radix-ui/react-toast") ||
            id.includes("node_modules/@radix-ui/react-tooltip")
          ) {
            return "vendor-radix-ui";
          }

          // Icons and styling
          if (
            id.includes("node_modules/lucide-react") ||
            id.includes("node_modules/clsx") ||
            id.includes("node_modules/tailwind-merge")
          ) {
            return "vendor-ui-utils";
          }

          // HTTP client and data fetching
          if (
            id.includes("node_modules/axios") ||
            id.includes("node_modules/fetch") ||
            id.includes("node_modules/swr")
          ) {
            return "vendor-http";
          }

          // Form handling and validation
          if (
            id.includes("node_modules/react-hook-form") ||
            id.includes("node_modules/@hookform/resolvers") ||
            id.includes("node_modules/zod") ||
            id.includes("node_modules/yup")
          ) {
            return "vendor-forms";
          }

          // Date and time utilities
          if (
            id.includes("node_modules/date-fns") ||
            id.includes("node_modules/dayjs") ||
            id.includes("node_modules/moment")
          ) {
            return "vendor-dates";
          }

          // Other vendor libraries
          if (id.includes("node_modules")) {
            return "vendor-other";
          }

          // ===== APPLICATION CHUNKS (Your code) =====

          // Core domain layer (entities, value objects, domain services)
          if (
            id.includes("/core/domain/entities") ||
            id.includes("/core/domain/value-objects") ||
            id.includes("/core/domain/services")
          ) {
            return "core-domain";
          }

          // Core application layer (use cases, application services)
          if (
            id.includes("/core/application/services") ||
            id.includes("/core/application/use-cases") ||
            id.includes("/core/application/dtos")
          ) {
            return "core-application";
          }

          // Core infrastructure layer (repositories, external services)
          if (
            id.includes("/core/infrastructure/repositories") ||
            id.includes("/core/infrastructure/services") ||
            id.includes("/core/infrastructure/adapters")
          ) {
            return "core-infrastructure";
          }

          // Core presentation layer (hooks, context providers)
          if (
            id.includes("/core/presentation/hooks") ||
            id.includes("/core/presentation/context") ||
            id.includes("/core/presentation/providers")
          ) {
            return "core-presentation";
          }

          // UI Components (grouped by complexity/usage)
          if (
            id.includes("/components/ui/") &&
            (id.includes("button") ||
              id.includes("input") ||
              id.includes("label") ||
              id.includes("card") ||
              id.includes("badge") ||
              id.includes("avatar"))
          ) {
            return "components-basic";
          }

          if (
            id.includes("/components/ui/") &&
            (id.includes("dialog") ||
              id.includes("dropdown") ||
              id.includes("select") ||
              id.includes("tabs") ||
              id.includes("accordion") ||
              id.includes("modal"))
          ) {
            return "components-complex";
          }

          if (
            id.includes("/components/ui/") &&
            (id.includes("table") ||
              id.includes("form") ||
              id.includes("chart") ||
              id.includes("calendar") ||
              id.includes("pagination"))
          ) {
            return "components-data";
          }

          // Feature-specific components
          if (
            id.includes("/components/customer") ||
            id.includes("/components/user")
          ) {
            return "components-features";
          }

          // Layout components
          if (
            id.includes("/components/layout") ||
            id.includes("/components/navigation") ||
            id.includes("/components/sidebar")
          ) {
            return "components-layout";
          }

          // Custom hooks (grouped by functionality)
          if (
            id.includes("/hooks/") &&
            (id.includes("useLocalStorage") ||
              id.includes("useDebounce") ||
              id.includes("usePrevious") ||
              id.includes("useToggle"))
          ) {
            return "hooks-utilities";
          }

          if (
            id.includes("/hooks/") &&
            (id.includes("useApi") ||
              id.includes("useFetch") ||
              id.includes("useMutation") ||
              id.includes("useQuery"))
          ) {
            return "hooks-data";
          }

          if (
            id.includes("/hooks/") &&
            (id.includes("useForm") ||
              id.includes("useValidation") ||
              id.includes("useField") ||
              id.includes("useSubmit"))
          ) {
            return "hooks-forms";
          }

          // Pages (lazy-loaded by default, but grouped for better caching)
          if (
            id.includes("/pages/") &&
            (id.includes("dashboard") ||
              id.includes("home") ||
              id.includes("index"))
          ) {
            return "pages-main";
          }

          if (
            id.includes("/pages/") &&
            (id.includes("customer") || id.includes("user"))
          ) {
            return "pages-management";
          }

          if (
            id.includes("/pages/") &&
            (id.includes("auth") ||
              id.includes("login") ||
              id.includes("register"))
          ) {
            return "pages-auth";
          }

          // Utilities and helpers
          if (
            id.includes("/utils/") ||
            id.includes("/helpers/") ||
            id.includes("/constants/")
          ) {
            return "utils";
          }

          // Types and interfaces
          if (id.includes("/types/") || id.includes("/interfaces/")) {
            return "types";
          }
        },
      },
    },
    // chunkSizeWarningLimit: 1000, // 1MB warning limit
    // Additional build optimizations
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true, // Remove debugger statements
      },
    },
    // Source maps for debugging (disable in production for smaller bundles)
    sourcemap: false,
  },
});
