import { useChatStore } from '../store/useChatStore';

const MOCK_ANSWERS: Record<string, string> = {
  "salut": "Salut! Sunt asistentul tău AI Coach. Sunt pregătit să te ajut cu organizarea studiilor, explicarea conceptelor sau generarea de idei. Cu ce începem?",
  "vreau sa fac site-uri": "Dezvoltarea web este o alegere excelentă. Iată un parcurs recomandat:\n\n1. **Frontend**: HTML, CSS și JavaScript (React pentru framework).\n2. **Backend**: Node.js sau Python (Django/FastAPI).\n3. **Baze de date**: PostgreSQL sau MongoDB.\n\nTe pot ajuta să aprofundezi oricare dintre aceste secțiuni.",
  "ce parere ai de faraon?": "Smecher calificat nu mai este nimeni ca el",
};

export const simulateAIResponse = async (chatId: string, userText: string, parentId: string) => {
  const store = useChatStore.getState();
  
  // 1. "Thinking" state
  const aiMessageId = store.addMessage(chatId, "", "ai", parentId);
  await new Promise(resolve => setTimeout(resolve, 1500)); 

  // 2. "Typing" state (Streaming)
  store.updateMessageStatus(chatId, aiMessageId, 'typing');
  
  const fullResponse = MOCK_ANSWERS[userText.toLowerCase().trim()] || 
    "Am recepționat mesajul tău. Analizez datele pentru a-ți oferi cel mai bun răspuns academic. Te rog să detaliezi dacă vrei o explicație specifică.";
  
  let currentContent = "";
  const words = fullResponse.split(" ");

  for (const word of words) {
    currentContent += word + " ";
    store.updateMessageContent(chatId, aiMessageId, currentContent);
    await new Promise(resolve => setTimeout(resolve, 40 + Math.random() * 40));
  }

  // 3. Finalizează
  store.updateMessageStatus(chatId, aiMessageId, 'done');
};