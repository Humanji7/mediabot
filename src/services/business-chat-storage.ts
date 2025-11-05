import { extractBusinessId, createBusinessKey } from "../lib/business-utils";

interface Message {
  id: string;
  text: string;
  sender: "user" | "ai";
  timestamp: Date;
  business_id: string; // Для дополнительной безопасности
}

export class BusinessChatStorage {
  private getStorageKey(): string | null {
    const businessId = extractBusinessId();
    if (!businessId) return null;
    return createBusinessKey("chat-history", businessId);
  }

  saveMessage(message: Omit<Message, "business_id">): void {
    const businessId = extractBusinessId();
    const storageKey = this.getStorageKey();

    if (!businessId || !storageKey) {
      console.error("Cannot save message: business_id not found");
      return;
    }

    const messageWithBusiness: Message = {
      ...message,
      business_id: businessId,
    };

    const history = this.getHistory();
    history.push(messageWithBusiness);
    localStorage.setItem(storageKey, JSON.stringify(history));
  }

  getHistory(): Message[] {
    const businessId = extractBusinessId();
    const storageKey = this.getStorageKey();

    if (!businessId || !storageKey) {
      console.warn("Cannot load history: business_id not found");
      return [];
    }

    try {
      const stored = localStorage.getItem(storageKey);
      if (!stored) return [];

      const parsed = JSON.parse(stored);
      // Фильтруем сообщения по business_id для дополнительной безопасности
      return parsed
        .filter((msg: any) => msg.business_id === businessId)
        .map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
    } catch (error) {
      console.error("Error loading chat history:", error);
      return [];
    }
  }

  clearHistory(): void {
    const storageKey = this.getStorageKey();
    if (storageKey) {
      localStorage.removeItem(storageKey);
    }
  }

  // Для отладки и разработки
  exportHistory(): string {
    const storageKey = this.getStorageKey();
    if (!storageKey) return "[]";
    return localStorage.getItem(storageKey) || "[]";
  }
}

export const businessChatStorage = new BusinessChatStorage();
