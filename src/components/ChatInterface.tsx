import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatSkeleton } from "@/components/ui/chat-skeleton";
import { businessChatStorage } from "../services/business-chat-storage";
import { sendMessage as sendMessageAPI } from "../lib/api";
import { useNavigate } from "react-router-dom";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

const ChatInterface = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Флаг расширения окна после первого отправленного сообщения
  const [expanded, setExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Загрузка истории из localStorage с business_id изоляцией
  useEffect(() => {
    try {
      setHistoryLoading(true);
      const history = businessChatStorage.getHistory();
      setMessages(history);
    } catch (error) {
      setError("Ошибка загрузки истории чата");
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Обновленная функция для обращения к n8n через новый API
  async function askAI(message: string, conversation: Message[]) {
    try {
      setLoading(true);
      setError(null);

      // Используем новый API с business_id изоляцией
      const response = await sendMessageAPI(message);

      if (!response.success) {
        throw new Error(response.error || "Не удалось получить ответ от AI");
      }

      return response.data?.response || "Получен пустой ответ от AI";
    } catch (e: any) {
      setError(e.message || "Ошибка при обращении к n8n");
      return null;
    } finally {
      setLoading(false);
    }
  }

  // Сохраняем сообщение в localStorage с business_id изоляцией
  function saveMessageLocally({
    text,
    sender,
    timestamp,
  }: {
    text: string;
    sender: "user" | "ai";
    timestamp: Date;
  }) {
    const message = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp,
    };
    businessChatStorage.saveMessage(message);
  }

  const sendMessage = async () => {
    if (!inputValue.trim() || loading) return;
    // Активируем расширение после первой отправки
    if (!expanded) setExpanded(true);
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    saveMessageLocally(userMessage);
    const aiText = await askAI(userMessage.text, [...messages, userMessage]);
    if (aiText) {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: aiText,
        sender: "ai",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
      saveMessageLocally(aiResponse);
    }
  };

  // Чат доступен всем без авторизации

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-start py-8">
      <div
        className={`w-full flex flex-col transition-all duration-500 ${
          expanded ? "items-stretch" : "items-center"
        }`}
      >
        <div
          className={`w-full transition-all duration-500 ${expanded ? "" : "max-w-2xl"}`}
        >
          <Card className="h-full flex flex-col shadow-xl border-0 w-full">
            <CardHeader>
              <CardTitle className="text-xl font-bold tracking-tight">
                AI Assistant Chat
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              <ScrollArea className="flex-1 pr-4 max-h-[60vh] w-full pb-20">
                <div className="space-y-4 px-4 pt-4">
                  {historyLoading ? (
                    <ChatSkeleton variant="full-chat" />
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-full sm:max-w-xs lg:max-w-md px-4 py-2 rounded-2xl break-words shadow-sm transition-all duration-200
                          ${
                            message.sender === "user"
                              ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white font-medium"
                              : "bg-white text-gray-900 border border-gray-200"
                          }
                        `}
                          style={{
                            wordBreak: "break-word",
                            fontSize: "1rem",
                            lineHeight: "1.5",
                          }}
                        >
                          <p className="text-base whitespace-pre-line">
                            {message.text}
                          </p>
                          <p className="text-xs mt-1 opacity-60 text-right">
                            {message.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  {loading && <ChatSkeleton variant="typing" />}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              <div className="sticky bottom-0 left-0 w-full bg-white z-10 border-t flex space-x-2 p-4">
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                    if (textareaRef.current) {
                      textareaRef.current.style.height = "auto";
                      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
                    }
                  }}
                  placeholder="Ваш вопрос по Instagram..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  disabled={loading}
                  rows={1}
                  className="flex-1 resize-none border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 transition text-base min-h-[44px] max-h-40 shadow-sm"
                  style={{ fontFamily: "inherit" }}
                />
                <Button
                  onClick={sendMessage}
                  disabled={loading || !inputValue.trim()}
                  className="h-11 px-6 text-base font-semibold"
                >
                  {loading ? "..." : "Отправить"}
                </Button>
              </div>
              {error && (
                <div className="text-red-500 text-sm mt-2 px-4">{error}</div>
              )}
            </CardContent>
          </Card>
        </div>
        {/* Правая колонка убрана для минимализма */}
      </div>
    </div>
  );
};

export default ChatInterface;
