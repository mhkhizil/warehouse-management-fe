import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { AuthProvider } from "@/core/presentation/hooks/useAuth";
import { routes } from "@/lib/routes";

// Create the router from our routes
const router = createBrowserRouter(routes);

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="wms-theme-preference">
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
