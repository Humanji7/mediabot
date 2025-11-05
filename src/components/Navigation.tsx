import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Navigation = () => {
  const navigate = useNavigate();

  const goToChat = () => {
    navigate("/dashboard/chat");
  };

  return (
    <nav className="fixed top-4 right-4 z-50">
      <Button
        onClick={goToChat}
        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg"
      >
        Попробовать чат →
      </Button>
    </nav>
  );
};

export default Navigation;
