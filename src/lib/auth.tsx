import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

// Define user types
export interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  error: string | null;
}

export interface RegisterData {
  username: string;
  email: string;
  phone: string;
  password: string;
}

// Create the auth context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Auth provider component
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const userData = localStorage.getItem("wms_user");
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (err) {
        console.error("Failed to retrieve auth status:", err);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Login function
  const login = async (phone: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // In a real app, this would be an API call
      // Simulated login for demo purposes

      // Check if user exists in localStorage (our "database" for this demo)
      const allUsers = JSON.parse(localStorage.getItem("wms_users") || "[]");
      const foundUser = allUsers.find((u: any) => u.phone === phone);

      if (!foundUser) {
        throw new Error("User not found. Please register first.");
      }

      if (foundUser.password !== password) {
        throw new Error("Invalid credentials. Please try again.");
      }

      // Create a user object without the password
      const authenticatedUser = {
        id: foundUser.id,
        username: foundUser.username,
        email: foundUser.email,
        phone: foundUser.phone,
      };

      // Save to localStorage (in a real app, this would be a JWT token)
      localStorage.setItem("wms_user", JSON.stringify(authenticatedUser));

      setUser(authenticatedUser);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    setError(null);

    try {
      // In a real app, this would be an API call
      // Simulated registration for demo purposes

      // Check if user already exists
      const allUsers = JSON.parse(localStorage.getItem("wms_users") || "[]");

      if (allUsers.some((u: any) => u.phone === userData.phone)) {
        throw new Error("Phone number already registered");
      }

      if (allUsers.some((u: any) => u.email === userData.email)) {
        throw new Error("Email already registered");
      }

      // Create a new user
      const newUser = {
        id: `user-${Date.now()}`,
        ...userData,
      };

      // Save to our "database" (localStorage)
      localStorage.setItem("wms_users", JSON.stringify([...allUsers, newUser]));

      // Auto-login after registration
      const authenticatedUser = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        phone: newUser.phone,
      };

      localStorage.setItem("wms_user", JSON.stringify(authenticatedUser));
      setUser(authenticatedUser);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("wms_user");
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
