/**
 * Enhanced Authentication System for MediaBot v2.0
 * JWT-based authentication with secure backend integration
 * Supports 15 users with role-based access and business_id isolation
 */

export interface AuthToken {
  token: string;
  email: string;
  business_id: string;
  business_name: string;
  role: "client" | "team_tester";
  expiresAt: number;
}

export interface User {
  id: string;
  email: string;
  business_id: string;
  business_name: string;
  role: "client" | "team_tester";
  created_at: string;
  status: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: User;
  expires_in?: string;
  error?: string;
  code?: string;
}

const STORAGE_KEY = "mediabot_auth_token";
const API_URL = import.meta.env.VITE_API_URL || "http://158.160.190.4:8080";

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Authenticate user with email and password
 * Calls the enhanced backend authentication API
 */
export async function authenticateWithCredentials(
  email: string,
  password: string,
): Promise<LoginResponse> {
  try {
    // Validate input
    if (!validateEmail(email)) {
      return { success: false, error: "Некорректный формат email" };
    }

    if (!password || password.length < 6) {
      return {
        success: false,
        error: "Пароль должен содержать минимум 6 символов",
      };
    }

    // Call backend login API
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email.toLowerCase().trim(),
        password,
      }),
    });

    const data = await response.json();

    if (data.success && data.token && data.user) {
      // Save authentication data to localStorage
      saveAuthToken(data.user.email, data.token, data.user);

      console.log(
        `✅ Login successful: ${data.user.email} (${data.user.business_name})`,
      );

      return {
        success: true,
        token: data.token,
        user: data.user,
        expires_in: data.expires_in,
      };
    } else {
      console.log(`❌ Login failed: ${data.error || "Unknown error"}`);
      return {
        success: false,
        error: data.error || "Ошибка авторизации",
        code: data.code,
      };
    }
  } catch (error) {
    console.error("❌ Authentication error:", error);
    return {
      success: false,
      error: "Ошибка подключения к серверу",
    };
  }
}

/**
 * Legacy function for backward compatibility
 * Now redirects to the new authentication system
 */
export function authenticateWithEmail(email: string): {
  success: boolean;
  token?: string;
  error?: string;
} {
  return {
    success: false,
    error:
      "Система авторизации обновлена. Требуется пароль. Используйте authenticateWithCredentials()",
  };
}

/**
 * Save authentication token to localStorage
 */
export function saveAuthToken(email: string, token: string, user?: User): void {
  const authData: AuthToken = {
    token,
    email,
    business_id: user?.business_id || "",
    business_name: user?.business_name || "",
    role: user?.role || "client",
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));
}

/**
 * Get current authentication token
 */
export function getAuthToken(): AuthToken | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const authData: AuthToken = JSON.parse(stored);

    // Check if token is expired
    if (Date.now() > authData.expiresAt) {
      clearAuthToken();
      return null;
    }

    return authData;
  } catch (error) {
    console.error("Error reading auth token:", error);
    clearAuthToken();
    return null;
  }
}

/**
 * Clear authentication token
 */
export function clearAuthToken(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getAuthToken() !== null;
}

/**
 * Get current user email
 */
export function getCurrentUserEmail(): string | null {
  const token = getAuthToken();
  return token ? token.email : null;
}

/**
 * Get current user info
 */
export function getCurrentUser(): User | null {
  const token = getAuthToken();
  if (!token) return null;

  return {
    id: "", // Will be populated from backend if needed
    email: token.email,
    business_id: token.business_id,
    business_name: token.business_name,
    role: token.role,
    created_at: "",
    status: "active",
  };
}

/**
 * Get current business ID
 */
export function getCurrentBusinessId(): string | null {
  const token = getAuthToken();
  return token ? token.business_id : null;
}

/**
 * Check if user has specific role
 */
export function hasRole(role: "client" | "team_tester"): boolean {
  const token = getAuthToken();
  return token ? token.role === role : false;
}

/**
 * Logout user by clearing token and calling backend
 */
export async function logout(): Promise<void> {
  try {
    const token = getAuthToken();

    if (token) {
      // Call backend logout endpoint
      await fetch(`${API_URL}/api/auth/logout`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token.token}`,
          "Content-Type": "application/json",
        },
      });
    }
  } catch (error) {
    console.error("❌ Logout API call failed:", error);
  } finally {
    // Always clear local token
    clearAuthToken();
    console.log("👋 User logged out");
  }
}

/**
 * Verify token with backend
 */
export async function verifyTokenWithBackend(): Promise<boolean> {
  try {
    const token = getAuthToken();
    if (!token) return false;

    const response = await fetch(`${API_URL}/api/auth/verify-token`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error("❌ Token verification failed:", error);
    return false;
  }
}

/**
 * Get authentication header for API requests
 */
export function getAuthHeader(): { Authorization: string } | {} {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token.token}` } : {};
}
