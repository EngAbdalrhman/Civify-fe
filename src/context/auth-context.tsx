"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Loader2 } from "lucide-react";
import { authService, User } from "@/lib/services/auth.service";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isHydrated: boolean;
  login: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isHydrated: false,
  login: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    checkAuth();
  }, []);

  // Listen for storage changes from other tabs (cross-tab sync)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      // Import STORAGE_KEYS
      const STORAGE_KEYS = {
        ACCESS_TOKEN: "access_token",
        REFRESH_TOKEN: "refresh_token",
        USER_DATA: "user_data",
      };
      
      if (e.key === STORAGE_KEYS.ACCESS_TOKEN) {
        if (!e.newValue) {
          // Token cleared in another tab - logout this tab too
          console.log("Access token cleared in another tab, logging out...");
          setUser(null);
        } else {
          // Token updated in another tab - refresh user
          console.log("Access token updated in another tab, refreshing user...");
          checkAuth();
        }
      }
    };
    
    if (typeof window !== "undefined") {
      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }
  }, []);

  const checkAuth = async () => {
    const accessToken = authService.getAccessToken();
    
    // If no access token but we might have refresh token in cookie, try to refresh
    if (!accessToken) {
      try {
        const newToken = await authService.refreshToken();
        if (newToken) {
          // Successfully refreshed, now get user data
          try {
            const userData = await authService.getCurrentUser();
            setUser(userData);
            setLoading(false);
            return;
          } catch (error) {
            console.error("Failed to fetch user after refresh:", error);
          }
        }
      } catch (error) {
        console.error("Token refresh failed on mount:", error);
      }
      // If refresh failed, continue to set user as null
      setUser(null);
      setLoading(false);
      return;
    }
    
    // We have an access token, try to get user
    if (authService.isAuthenticated()) {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch (error: any) {
        console.error("Failed to fetch user profile:", error);
        
        // If 401, token might be expired - try refresh once
        if (error?.response?.status === 401) {
          try {
            const newToken = await authService.refreshToken();
            if (newToken) {
              // Retry with refreshed token
              const userData = await authService.getCurrentUser();
              setUser(userData);
              setLoading(false);
              return;
            }
          } catch (refreshError) {
            console.error("Refresh failed after 401:", refreshError);
            setUser(null);
            authService.clearTokens();
          }
        } else {
          setUser(null);
        }
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  const login = async (data: any) => {
    try {
      await authService.login(data);
      await checkAuth();
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  // Show loading only after hydration to prevent hydration mismatch
  if (!isHydrated) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, isHydrated, login, logout, refreshUser: checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
