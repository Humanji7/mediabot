// Business ID utilities for multi-tenant architecture
export interface BusinessAuthToken {
  business_id: string;
  email: string;
  token: string;
  expires_at?: string;
}

// Validate business_id format: biz_{8chars}_{6chars} OR business-{prefix} (backend format)
export function validateBusinessId(business_id: string): boolean {
  return /^(biz_[a-z0-9]{8,}_[a-z0-9]{6}|business-[a-z0-9]+)$/.test(
    business_id,
  );
}

// Extract business_id from auth token or localStorage
// Updated to work with new mediabot_auth_token format
export function extractBusinessId(): string | null {
  try {
    // First try new auth system (mediabot_auth_token)
    const newAuthData = localStorage.getItem("mediabot_auth_token");
    if (newAuthData) {
      const parsed = JSON.parse(newAuthData);
      return parsed.business_id || null;
    }

    // Fallback to old auth system (auth_token)
    const oldAuthData = localStorage.getItem("auth_token");
    if (oldAuthData) {
      const parsed = JSON.parse(oldAuthData);
      return parsed.business_id || null;
    }

    return null;
  } catch {
    return null;
  }
}

// Create API headers with business_id
export function createBusinessHeaders(businessId: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    "X-Business-ID": businessId,
  };
}

// Business-scoped localStorage key
export function createBusinessKey(key: string, businessId: string): string {
  return `${businessId}:${key}`;
}

// Save business auth data
export function saveBusinessAuth(
  email: string,
  token: string,
  business_id: string,
): void {
  const authData: BusinessAuthToken = { email, token, business_id };
  localStorage.setItem("auth_token", JSON.stringify(authData));
  localStorage.setItem("user_email", email);
  localStorage.setItem("business_id", business_id);
}

// Get business auth data
// Updated to work with new mediabot_auth_token format
export function getBusinessAuth(): BusinessAuthToken | null {
  try {
    // First try new auth system (mediabot_auth_token)
    const newAuthData = localStorage.getItem("mediabot_auth_token");
    if (newAuthData) {
      const parsed = JSON.parse(newAuthData);
      if (validateBusinessId(parsed.business_id)) {
        return {
          email: parsed.email,
          token: parsed.token,
          business_id: parsed.business_id,
        };
      }
    }

    // Fallback to old auth system (auth_token)
    const oldAuthData = localStorage.getItem("auth_token");
    if (oldAuthData) {
      const parsed = JSON.parse(oldAuthData);
      if (validateBusinessId(parsed.business_id)) {
        return parsed;
      }
    }

    return null;
  } catch {
    return null;
  }
}
