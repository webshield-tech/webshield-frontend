/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useState,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
import { Profile as getProfile, LogoutUser } from "../api/auth-api";
import api from "../api/axios";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../config/firebase";

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
  socialLogin: (provider: "google") => Promise<User | null>;
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
      if (res.data?.success) {
        setUser(res.data.user);
        return true;
      }
      return false;
    } catch (error: any) {
      // ONLY clear user if it's a definitive authentication failure (401/403)
      // Otherwise, keep the current user state to prevent logout on 500/Network errors
      if (error.status === 401 || error.isAuthError || error.response?.status === 401) {
        setUser(null);
      }
      // For other errors (timeouts, network issues), silently continue without clearing user
      console.warn("[AuthCheck] Profile fetch failed:", error.message || error);
      return false;
    }
  };

  const acceptTerms = async (): Promise<boolean> => {
    try {
      const res = await api.post("/user/accept-terms");
      if (res.data?.success) {
        await checkAuth();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const socialLogin = async (providerName: "google") => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
      
      // Send token to backend to verify and create session
      const res = await api.post("/user/firebase-login", { token });
      
      if (res.data?.success) {
        setUser(res.data.user);
        if (res.data.token) {
          localStorage.setItem("authToken", res.data.token);
        }
        return res.data.user;
      } else {
        throw new Error(res.data?.error || "Login failed");
      }
    } catch (error: any) {
      console.error("Social Login Error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  // Cookie check function
  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return null;
  };

  const token = getCookie('token') || localStorage.getItem("authToken");
  
  if (!token) {
    setUser(null);
    setAuthChecked(true);
    setLoading(false);
    return;
  }
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
        socialLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
