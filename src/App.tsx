import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { AuthProvider } from "@/core/presentation/hooks/useAuth";
import { TokenExpirationWarning } from "@/components/ui/token-expiration-warning";
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

  const handleTokenExpire = () => {
    // This will be called when the token expires
    // The HttpClient will handle the redirect automatically
    console.log("Token expired, redirecting to login...");
  };

  return (
    <ThemeProvider defaultTheme="system" storageKey="wms-theme-preference">
      <AuthProvider>
        <RouterProvider router={router} />
        <TokenExpirationWarning
          warningMinutes={5}
          onExpire={handleTokenExpire}
        />
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
