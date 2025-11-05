// 🚨 NUCLEAR OPTION - Minimal API for Demo Tomorrow
import {
  extractBusinessId,
  createBusinessHeaders,
  saveBusinessAuth,
} from "./business-utils";

const API_URL = import.meta.env.VITE_API_URL || "http://158.160.190.4:8080";
const N8N_WEBHOOK_URL =
  import.meta.env.VITE_N8N_WEBHOOK_URL ||
  "http://158.160.190.4:5678/webhook/mediabot-chat";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// 1. AUTH - Send OTP (fake for demo)
export async function sendOtp(email: string): Promise<ApiResponse<any>> {
  const response = await fetch(`${API_URL}/api/auth/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return await response.json();
}

// 2. AUTH - Verify OTP (always success for demo)
export async function verifyOtp(
  email: string,
  otp: string,
): Promise<ApiResponse<any>> {
  const response = await fetch(`${API_URL}/api/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp }),
  });
  const result = await response.json();

  if (result.success) {
    // Предполагаем, что backend возвращает business_id в ответе
    const business_id =
      result.business_id ||
      `biz_demo${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    saveBusinessAuth(email, result.token, business_id);
  }

  return result;
}

// 3. ONBOARDING - Save data
export async function saveOnboarding(
  onboardingData: any,
): Promise<ApiResponse<any>> {
  const email = localStorage.getItem("user_email");
  const response = await fetch(`${API_URL}/api/onboarding`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, onboardingData }),
  });
  return await response.json();
}

// 4. CHAT - Send message via n8n webhook
export async function sendMessage(message: string): Promise<ApiResponse<any>> {
  const businessId = extractBusinessId();
  if (!businessId) {
    return {
      success: false,
      error: "Business ID not found. Please login again.",
    };
  }

  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: createBusinessHeaders(businessId),
      body: JSON.stringify({
        business_id: businessId,
        message: message,
        session_id: "default",
      }),
    });

    const result = await response.json();
    return {
      success: result.success || false,
      data: result.response
        ? { response: result.response, tokens_used: result.tokens_used }
        : null,
      error: result.error,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

// 5. CHAT - Get history
export async function getChatHistory(): Promise<ApiResponse<any>> {
  const email = localStorage.getItem("user_email");
  const response = await fetch(`${API_URL}/api/chat/history`);
  return await response.json();
}

// Compatibility functions
export async function subscribeEmail(email: string) {
  return await verifyOtp(email, "1234"); // Always use dummy OTP for demo
}

export async function checkSubscriptionStatus(email: string) {
  return { success: true, data: { isSubscribed: true } };
}
