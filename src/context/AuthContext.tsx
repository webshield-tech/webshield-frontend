/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
import { Profile as getProfile, LogoutUser } from "../api/auth-api";
import api from "../api/axios";

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
  acceptTerms: () => Promise<boolean>; 
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

  const acceptTerms = async (): Promise<boolean> => {
    try {
      const response = await api.post('/user/accept-terms');
     if (response.data.success) {
    const refreshed = await getProfile();
    if (refreshed.data.success) setUser(refreshed.data.user);
    return true;
  }
      return false;
    } catch (error) {
      console.error("Accept terms error:", error);
      return false;
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
        acceptTerms, 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};