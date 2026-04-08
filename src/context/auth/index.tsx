import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// User interface
interface User {
  id: string | number;
  name: string;
  email: string;
  role?: string;
  full_name?: string;
}

// Auth context interface
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (userData: User, authToken: string) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  isLoading: boolean;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Provider component
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize - Load from localStorage on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const savedToken = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");


        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
        } else {
          console.log("ℹ No saved auth data found");
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
        // Clear corrupted data
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login function
  const login = (userData: User, authToken: string) => {
 
    
    try {
      // Clean token (remove quotes if any)
      const cleanToken = authToken.trim().replace(/^["']|["']$/g, '');
      
      // Save to state FIRST
      setUser(userData);
      setToken(cleanToken);

      // Then save to localStorage
      localStorage.setItem("token", cleanToken);
      localStorage.setItem("user", JSON.stringify(userData));

    } catch (error) {
      console.error(" Error during login:", error);
    }
  };

  // Logout function
  const logout = () => {
    console.log("🚪 Logging out...");
    
    try {
      // Clear state
      setUser(null);
      setToken(null);

      // Clear localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      console.log(" Logout successful");
    } catch (error) {
      console.error(" Error during logout:", error);
    }
  };

  // Update user function
  const updateUser = (userData: Partial<User>) => {
    console.log(" Updating user:", userData);
    
    try {
      if (user) {
        const updatedUser = { ...user, ...userData };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        console.log(" User updated successfully");
      }
    } catch (error) {
      console.error(" Error updating user:", error);
    }
  };

  // Computed value
  const isAuthenticated = !!token && !!user;

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    updateUser,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  
  return context;
};

export default AuthContext;