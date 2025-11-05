interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
}

export class SimpleChatStorage {
  private readonly STORAGE_KEY = "mediabot-chat-history";

  saveMessage(message: Message): void {
    const history = this.getHistory();
    history.push(message);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(history));
  }

  getHistory(): Message[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];

      const parsed = JSON.parse(stored);
      // Восстанавливаем Date объекты
      return parsed.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      }));
    } catch (error) {
      console.error("Error loading chat history:", error);
      return [];
    }
  }

  clearHistory(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Для отладки и разработки
  exportHistory(): string {
    return localStorage.getItem(this.STORAGE_KEY) || "[]";
  }
}

export const chatStorage = new SimpleChatStorage();
