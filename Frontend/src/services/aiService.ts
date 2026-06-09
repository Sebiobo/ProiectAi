import { useChatStore } from "../store/useChatStore";

const BASE_URL = "http://127.0.0.1:8000";

export const uploadDocument = async (file: File): Promise<{ id: number; filename: string; status: string }> => {
  const store = useChatStore.getState();
  const token = store.token;

  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${BASE_URL}/api/documents/upload`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || `Upload eșuat pentru ${file.name}`);
  }

  // Refresh documents list in store
  setTimeout(() => {
    store.fetchDocuments();
  }, 1000);

  return response.json();
};

export const fetchUserChats = async () => {
  const token = useChatStore.getState().token;
  const response = await fetch(`${BASE_URL}/api/chats`, {
    method: "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!response.ok) {
    throw new Error("Eroare la preluarea chat-urilor de pe backend.");
  }
  return response.json();
};

export const fetchChatMessages = async (chatId: number) => {
  const token = useChatStore.getState().token;
  const response = await fetch(`${BASE_URL}/api/chats/${chatId}/messages`, {
    method: "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!response.ok) {
    throw new Error("Eroare la preluarea mesajelor de pe backend.");
  }
  return response.json();
};

export const createBackendChat = async (title?: string, documentId?: number | null) => {
  const token = useChatStore.getState().token;
  const response = await fetch(`${BASE_URL}/api/chats`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ title, document_id: documentId }),
  });
  if (!response.ok) {
    throw new Error("Eroare la crearea chat-ului pe backend.");
  }
  return response.json();
};

export const sendBackendMessage = async (chatId: number, content: string) => {
  const token = useChatStore.getState().token;
  const response = await fetch(`${BASE_URL}/api/chats/${chatId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ content }),
  });
  if (!response.ok) {
    throw new Error("Eroare la trimiterea mesajului pe backend.");
  }
  return response.json() as Promise<{
    user_message: { id: number; role: string; content: string; created_at: string };
    ai_message: { id: number; role: string; content: string; created_at: string };
  }>;
};

export const fetchUserDocuments = async () => {
  const token = useChatStore.getState().token;
  const response = await fetch(`${BASE_URL}/api/documents/`, {
    method: "GET",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!response.ok) {
    throw new Error("Eroare la preluarea documentelor de pe backend.");
  }
  return response.json();
};

export const deleteUserDocument = async (documentId: number) => {
  const token = useChatStore.getState().token;
  const response = await fetch(`${BASE_URL}/api/documents/${documentId}`, {
    method: "DELETE",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!response.ok) {
    throw new Error("Eroare la ștergerea documentului de pe backend.");
  }
  return response.json();
};

export const simulateAIResponse = async (
  chatId: string,
  userText: string,
  parentId: string
) => {
  const store = useChatStore.getState();
  const chat = store.chats[chatId];

  if (!chat) return;

  // 1. Inițializăm mesajul gol pentru AI
  const aiMessageId = store.addMessage(chatId, "", "ai", parentId);
  store.updateMessageStatus(chatId, aiMessageId, "typing");

  try {
    // 2. Facem cererea REALĂ către backend
    const data = await sendBackendMessage(Number(chatId), userText);
    const fullResponse = data.ai_message.content;

    // 3. Afișăm răspunsul cu efect de "Streaming" (tastare literă cu literă)
    let currentContent = "";
    const words = fullResponse.split(/(\s+)/);

    for (const word of words) {
      currentContent += word;
      store.updateMessageContent(chatId, aiMessageId, currentContent);
      await new Promise((resolve) =>
        setTimeout(resolve, 10 + Math.random() * 20)
      );
    }
  } catch (error) {
    console.error("Eroare Backend:", error);
    store.updateMessageContent(
      chatId,
      aiMessageId,
      "⚠️ Serverul nu a putut fi contactat sau a returnat o eroare."
    );
  } finally {
    // 4. Finalizăm starea mesajului
    store.updateMessageStatus(chatId, aiMessageId, "done");
  }
};
