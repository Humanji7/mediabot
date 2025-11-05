import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Building, Shield, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 pt-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Добро пожаловать в MediaBot!
            </h1>
            <p className="text-gray-600 mt-1">Управляйте SMM автоматизацией для вашего бизнеса</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="text-gray-600 border-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-300"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Выйти
          </Button>
        </div>

        {/* User Info Card */}
        <Card className="mb-6 shadow-lg border-0 bg-white/80 backdrop-blur">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <User className="w-5 h-5 text-purple-600" />
              Информация о пользователе
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold">Бизнес:</span>
                  <span>{user.business_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Email:</span>
                  <span>{user.email}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span className="font-semibold">Роль:</span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {user.role === 'team_tester' ? 'Тестер команды' : 'Клиент'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">ID бизнеса:</span>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">{user.business_id}</code>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Feature Cards */}
        <div className="flex justify-center">
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur hover:shadow-xl transition-shadow max-w-md w-full">
            <CardHeader>
              <CardTitle className="text-lg">AI Чат-Помощник</CardTitle>
              <CardDescription>
                Общайтесь с ИИ для создания контент-планов и медиа-стратегий
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate('/dashboard/chat')}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                Открыть чат
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* System Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            MediaBot - AI Content Platform
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
