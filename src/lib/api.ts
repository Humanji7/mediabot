// Minimal API utilities
const API_URL = import.meta.env.VITE_API_URL || "http://158.160.190.4:8080";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// API utilities will be added here as needed
