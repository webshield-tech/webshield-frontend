/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
import { Profile as getProfile, LogoutUser } from "../api/auth-api";

interface User {
  _id: string;
  userId: string;
  username: string;
  email: string;
  role: "user" | "admin";
  scanLimit: number;
  usedScan: number;
  agreedToTerms: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  authChecked: boolean;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await LogoutUser();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
      sessionStorage.clear();
      localStorage.removeItem("authToken");
    }
  };

  const checkAuth = async () => {
    try {
      const response = await getProfile();
      if (response.data.success) {
        setUser(response.data.user);
        return response.data.user;
      } else {
        setUser(null);
        return null;
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
      return null;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      try {
        await checkAuth();
      } finally {
        setTimeout(() => {
          setAuthChecked(true);
          setLoading(false);
        }, 0);
      }
    };

    initializeAuth();
  }, []);
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authChecked,
        login,
        logout,
        checkAuth,
        refreshUser: checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
