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
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  const login = (userData: User) => setUser(userData);

  const logout = async () => {
    try {
      await LogoutUser();
    } finally {
      setUser(null);
      sessionStorage.clear();
      localStorage.removeItem("authToken");
    }
  };

  const checkAuth = async () => {
    try {
      const res = await getProfile();
      if (res.data.success) {
        setUser(res.data.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  };

  const acceptTerms = async (): Promise<boolean> => {
    try {
      const res = await api.post("/user/accept-terms");
      if (res.data.success) {
        await checkAuth();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await checkAuth();
      setAuthChecked(true);
      setLoading(false);
    };
    init();
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
