import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, ProtectedRoute, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginForm from "@/components/LoginForm";
import Dashboard from "@/components/Dashboard";
import React, { Suspense } from "react";

// Ленивая загрузка чата
const ChatInterface = React.lazy(() => import("./components/ChatInterface"));

// Специальный skeleton для чата
const ChatSkeleton = () => (
  <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start py-8">
    <div className="w-full max-w-2xl">
      <div className="bg-white rounded-lg shadow-xl border-0 w-full animate-pulse">
        <div className="p-6 border-b">
          <div className="h-6 bg-gray-200 rounded w-48"></div>
        </div>
        <div className="p-4 space-y-4">
          {/* Сообщения AI */}
          <div className="flex justify-start">
            <div className="bg-gray-200 rounded-2xl px-4 py-2 w-64 h-16"></div>
          </div>
          <div className="flex justify-end">
            <div className="bg-gray-300 rounded-2xl px-4 py-2 w-48 h-12"></div>
          </div>
          <div className="flex justify-start">
            <div className="bg-gray-200 rounded-2xl px-4 py-2 w-80 h-20"></div>
          </div>
        </div>
        <div className="p-4 border-t">
          <div className="flex space-x-2">
            <div className="flex-1 h-11 bg-gray-200 rounded-lg"></div>
            <div className="w-24 h-11 bg-gray-300 rounded-lg"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const queryClient = new QueryClient();

// Authentication-aware routing component
const AuthenticatedApp = () => {
  const { isLoading, isLoggedIn } = useAuth();

  // Show loading during auth initialization
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Index />} />
      <Route
        path="/login"
        element={
          isLoggedIn ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LoginForm
              onSuccess={(response) => {
                console.log(`Welcome ${response.user?.business_name}!`);
                // Redirect will happen automatically due to isLoggedIn state change
              }}
            />
          )
        }
      />

      {/* Protected dashboard routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute requireRole={undefined}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/chat"
        element={
          <ProtectedRoute requireRole={undefined}>
            <Suspense fallback={<ChatSkeleton />}>
              <ChatInterface />
            </Suspense>
          </ProtectedRoute>
        }
      />

      {/* Legacy route redirects */}
      <Route path="/chat" element={<Navigate to="/dashboard/chat" replace />} />

      {/* 404 page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AuthProvider>
          <AuthenticatedApp />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default function WrappedApp() {
  return <App />;
}
