/**
 * Authentication Context for MediaBot v2.0
 * Manages JWT authentication state with React Context
 * Supports role-based access and business_id isolation
 */

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  isAuthenticated,
  getCurrentUser,
  getCurrentBusinessId,
  hasRole,
  logout as logoutUser,
  verifyTokenWithBackend,
  type User,
} from "@/lib/auth";

interface AuthContextType {
  // State
  user: User | null;
  business_id: string | null;
  isLoading: boolean;
  isLoggedIn: boolean;

  // Actions
  login: (user: User) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;

  // Role checks
  isClient: boolean;
  isTeamTester: boolean;
  hasClientAccess: boolean;
  hasAdminAccess: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [business_id, setBusiness_id] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Initialize authentication state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);

        // Check if user has valid token in localStorage
        if (isAuthenticated()) {
          const currentUser = getCurrentUser();
          const currentBusinessId = getCurrentBusinessId();

          if (currentUser && currentBusinessId) {
            // Verify token with backend
            const isValid = await verifyTokenWithBackend();

            if (isValid) {
              setUser(currentUser);
              setBusiness_id(currentBusinessId);
              setIsLoggedIn(true);
              console.log(
                `✅ Auth restored: ${currentUser.email} (${currentUser.business_name})`,
              );
            } else {
              // Token invalid, clear state
              await handleLogout(false);
              console.log("❌ Token invalid, cleared auth state");
            }
          } else {
            // Incomplete auth data, clear state
            await handleLogout(false);
            console.log("❌ Incomplete auth data, cleared state");
          }
        }
      } catch (error) {
        console.error("❌ Auth initialization error:", error);
        await handleLogout(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Login handler
  const login = (newUser: User) => {
    setUser(newUser);
    setBusiness_id(newUser.business_id);
    setIsLoggedIn(true);
    console.log(
      `✅ Auth context updated: ${newUser.email} (${newUser.business_name})`,
    );
  };

  // Logout handler
  const handleLogout = async (callBackend: boolean = true) => {
    try {
      if (callBackend) {
        await logoutUser();
      }

      setUser(null);
      setBusiness_id(null);
      setIsLoggedIn(false);
      console.log("👋 Auth context cleared");
    } catch (error) {
      console.error("❌ Logout error:", error);
      // Still clear local state even if backend call fails
      setUser(null);
      setBusiness_id(null);
      setIsLoggedIn(false);
    }
  };

  // Check authentication status
  const checkAuth = async (): Promise<boolean> => {
    try {
      if (!isAuthenticated()) {
        return false;
      }

      const isValid = await verifyTokenWithBackend();
      if (!isValid) {
        await handleLogout(false);
        return false;
      }

      return true;
    } catch (error) {
      console.error("❌ Auth check error:", error);
      return false;
    }
  };

  // Role-based computed values
  const isClient = user?.role === "client";
  const isTeamTester = user?.role === "team_tester";
  const hasClientAccess = isClient || isTeamTester;
  const hasAdminAccess = isTeamTester;

  const contextValue: AuthContextType = {
    // State
    user,
    business_id,
    isLoading,
    isLoggedIn,

    // Actions
    login,
    logout: () => handleLogout(true),
    checkAuth,

    // Role checks
    isClient,
    isTeamTester,
    hasClientAccess,
    hasAdminAccess,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Higher-order component for protected routes
interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: "client" | "team_tester";
  fallback?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  requireRole,
  fallback,
}: ProtectedRouteProps) {
  const { isLoading, isLoggedIn, user } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // Check if user is logged in
  if (!isLoggedIn || !user) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-800">
              Требуется авторизация
            </h1>
            <p className="text-gray-600">Пожалуйста, войдите в систему</p>
          </div>
        </div>
      )
    );
  }

  // Check role requirements
  if (requireRole && user.role !== requireRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-800">Недостаточно прав</h1>
          <p className="text-gray-600">У вас нет доступа к этому разделу</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// Hook for role-based access
export function useRole(role: "client" | "team_tester"): boolean {
  const { user } = useAuth();
  return user?.role === role || false;
}

// Hook for business context
export function useBusiness() {
  const { user, business_id } = useAuth();

  return {
    business_id,
    business_name: user?.business_name || null,
    isClient: user?.role === "client",
    isTeamTester: user?.role === "team_tester",
  };
}
