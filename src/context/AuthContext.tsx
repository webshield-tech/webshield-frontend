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
import { getRedirectResult, signInWithPopup, signInWithRedirect } from "firebase/auth";
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
  checkAuth: () => Promise<User | null>;
  refreshUser: () => Promise<User | null>;
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

  const login = (userData: User) => {
    setUser(userData);
    const userKey = userData._id || userData.userId;
    if (userKey) {
      sessionStorage.setItem("dashboard_welcome_pending", String(userKey));
    }
  };

  const logout = async () => {
    try {
      await LogoutUser();
    } finally {
      setUser(null);
      sessionStorage.removeItem("dashboard_welcome_pending");
      sessionStorage.clear();
      sessionStorage.removeItem("authToken");
    }
  };

  const finalizeFirebaseLogin = async (firebaseUser: { getIdToken: () => Promise<string> }) => {
    const token = await firebaseUser.getIdToken();

    // Send token to backend to verify and create session
    const res = await api.post("/user/firebase-login", { token });

    if (!res.data?.success) {
      throw new Error(res.data?.error || "Login failed");
    }

    setUser(res.data.user);
    const userKey = res.data.user?._id || res.data.user?.userId;
    if (userKey) {
      sessionStorage.setItem("dashboard_welcome_pending", String(userKey));
    }
    if (res.data.token) {
      sessionStorage.setItem("authToken", res.data.token);
    }

    return res.data.user;
  };

  const checkAuth = async () => {
    try {
      const res = await getProfile();
      if (res.data?.success) {
        setUser(res.data.user);
        return res.data.user;
      }
      return null;
    } catch (error: unknown) {
      const authError = error as {
        status?: number;
        isAuthError?: boolean;
        response?: { status?: number };
        message?: string;
      };
      // ONLY clear user if it's a definitive authentication failure (401/403)
      // Otherwise, keep the current user state to prevent logout on 500/Network errors
      if (authError.status === 401 || authError.isAuthError || authError.response?.status === 401) {
        setUser(null);
      }
      // For other errors (timeouts, network issues), silently continue without clearing user
      console.warn("[AuthCheck] Profile fetch failed:", authError.message || authError);
      return null;
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
    void providerName;
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      return await finalizeFirebaseLogin(result.user);
    } catch (error: unknown) {
      const socialError = error as { message?: string; code?: string };
      const message = String(socialError?.message || "");
      const code = String(socialError?.code || "");

      // Popup flows can fail under strict COOP policies; fall back to redirect.
      if (
        code === "auth/popup-blocked" ||
        code === "auth/popup-closed-by-user" ||
        code === "auth/cancelled-popup-request" ||
        code === "auth/operation-not-supported-in-this-environment" ||
        /cross-origin-opener-policy|window\.closed|popup/i.test(message)
      ) {
        await signInWithRedirect(auth, googleProvider);
        return null;
      }

      console.error("Social Login Error:", socialError);
      throw socialError;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(";").shift();
      return null;
    };

    const init = async () => {
      setLoading(true);

      try {
        const redirectResult = await getRedirectResult(auth);
        if (redirectResult?.user) {
          await finalizeFirebaseLogin(redirectResult.user);
          await checkAuth();
          setAuthChecked(true);
          setLoading(false);
          return;
        }
      } catch (error) {
        console.warn("[Auth] Google redirect login failed:", error);
      }

      const token = getCookie("token") || sessionStorage.getItem("authToken");

      if (!getCookie("token") && localStorage.getItem("authToken")) {
        localStorage.removeItem("authToken");
      }

      if (!token) {
        setUser(null);
        setAuthChecked(true);
        setLoading(false);
        return;
      }

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
