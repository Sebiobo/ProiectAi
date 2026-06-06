import { useChatStore } from "../store/useChatStore";

export const uploadDocument = async (file: File): Promise<{ id: number; filename: string; status: string }> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("http://127.0.0.1:8000/api/documents/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || `Upload eșuat pentru ${file.name}`);
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
    // 2. Facem cererea REALĂ către serverul tău Python (FastAPI)
    const response = await fetch("http://127.0.0.1:8000/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // 👇 MODIFICAREA INTEGRATĂ: Trimitem pachetul complet cerut de FastAPI
      body: JSON.stringify({
        message: userText,
        anul: chat.year || "General",
        materia: chat.subject || "General",
      }),
    });

    if (!response.ok) {
      throw new Error("Eroare la comunicarea cu serverul.");
    }

    // Extragem datele primite de la Python
    const data = await response.json();
    const fullResponse = data.reply;

    // 3. Afișăm răspunsul cu efect de "Streaming" (tastare literă cu literă)
    let currentContent = "";
    const words = fullResponse.split(/(\s+)/);

    for (const word of words) {
      currentContent += word;
      store.updateMessageContent(chatId, aiMessageId, currentContent);
      await new Promise((resolve) =>
        setTimeout(resolve, 15 + Math.random() * 30)
      );
    }
  } catch (error) {
    console.error("Eroare Backend:", error);
    store.updateMessageContent(
      chatId,
      aiMessageId,
      "⚠️ Serverul Python nu este pornit sau nu a putut fi contactat."
    );
  } finally {
    // 4. Finalizăm starea mesajului
    store.updateMessageStatus(chatId, aiMessageId, "done");
  }
};
