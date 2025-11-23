"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Loader2 } from "lucide-react";
import { tokenManager } from "@/lib/api/token-manager";

interface User {
  id: number;
  email: string;
  username: string;
  role: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isHydrated: boolean;
  login: (token: string, refreshToken: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isHydrated: false,
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    checkAuth();
  }, []);

  const checkAuth = () => {
    if (tokenManager.isAuthenticated()) {
      const userData = tokenManager.decodeToken(tokenManager.getAccessToken()!);
      if (userData) {
        // Map JWT claims to User object
        // JWT usually has 'sub' as username/email, 'userId' as id
        setUser({
          id: userData.userId || userData.id,
          email: userData.email || userData.sub,
          username: userData.sub,
          role: userData.role,
          ...userData
        });
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  };

  const login = (token: string, refreshToken: string) => {
    tokenManager.setTokens(token, refreshToken);
    checkAuth();
  };

  const logout = () => {
    tokenManager.clearTokens();
    setUser(null);
    window.location.href = '/auth/login';
  };

  // Show loading only after hydration to prevent hydration mismatch
  if (!isHydrated || loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, isHydrated, login, logout }}>
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
