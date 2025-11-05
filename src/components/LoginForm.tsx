/**
 * Enhanced Login Form for MediaBot v2.0
 * Secure JWT authentication with password-based login
 * Supports 15 users with role-based access
 */

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, EyeOff, Loader2, Shield, User } from "lucide-react";
import { authenticateWithCredentials, type LoginResponse } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";

interface LoginFormProps {
  onSuccess?: (response: LoginResponse) => void;
  onError?: (error: string) => void;
}

export default function LoginForm({ onSuccess, onError }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await authenticateWithCredentials(email.trim(), password);

      if (result.success && result.user) {
        // Update auth context
        login(result.user);

        console.log(`✅ Login successful: ${result.user.business_name}`);
        onSuccess?.(result);
      } else {
        const errorMessage = result.error || "Неизвестная ошибка";
        setError(errorMessage);
        onError?.(errorMessage);
        console.log(`❌ Login failed: ${errorMessage}`);
      }
    } catch (error) {
      const errorMessage = "Ошибка подключения к серверу";
      setError(errorMessage);
      onError?.(errorMessage);
      console.error("❌ Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = email.trim() && password && password.length >= 6;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center mb-2">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-full">
                <Shield className="w-6 h-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Вход в MediaBot
            </CardTitle>
            <CardDescription className="text-gray-600">
              Введите email и пароль для входа в систему
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="client1@mediabot.ru"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                    disabled={isLoading}
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700"
                >
                  Пароль
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Введите пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 pr-10 border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                    disabled={isLoading}
                    autoComplete="current-password"
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500">Минимум 6 символов</p>
              </div>

              {/* Error Alert */}
              {error && (
                <Alert
                  variant="destructive"
                  className="border-red-200 bg-red-50"
                >
                  <AlertDescription className="text-red-800">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={!isFormValid || isLoading}
                className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Авторизация...
                  </>
                ) : (
                  "Войти"
                )}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Демо-доступы:
              </h3>
              <div className="text-xs text-gray-600 space-y-1">
                <div>
                  <strong>Клиент:</strong> client1@mediabot.ru / Coffee123!
                </div>
                <div>
                  <strong>Тестер:</strong> tester1@mediabot.team / Test123!
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Всего доступно 15 пользователей (10 клиентов + 5 тестеров)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security Info */}
        <div className="mt-4 text-center text-xs text-gray-500">
          🔒 Защищенное соединение с JWT аутентификацией
        </div>
      </div>
    </div>
  );
}
