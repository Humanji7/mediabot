import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const ChatInterface = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      <Card className="max-w-2xl w-full shadow-xl border-0">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            AI Chat Interface
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-6">
              Chat interface will be implemented here
            </p>
            <Button
              onClick={() => navigate('/dashboard')}
              variant="outline"
            >
              ← Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatInterface;
