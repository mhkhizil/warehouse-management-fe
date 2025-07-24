import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { AuthProvider } from "@/core/presentation/hooks/useAuth";
import { routes } from "@/lib/routes";
import { Toaster } from "@/components/ui/toaster";
// import { migrateAuthData } from "@/lib/migration";
// import { useEffect } from "react";

// Create the router from our routes
const router = createBrowserRouter(routes);

function App() {
  // Run migration on app startup
  // useEffect(() => {
  //   migrateAuthData();
  // }, []);

  return (
    <ThemeProvider defaultTheme="system" storageKey="wms-theme-preference">
      <AuthProvider>
        <RouterProvider router={router} />
00000AAAAAAAAAAAAAAAA        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
