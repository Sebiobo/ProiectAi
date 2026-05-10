import { useChatStore } from '../store/useChatStore';

// Funcție internă pentru a genera un răspuns contextualizat
const generateMockResponse = (text: string, subject: string | null, year: string) => {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('rezumă') || lowerText.includes('rezumat')) {
    return `Aici este un rezumat structurat pentru materia **${subject || 'selectată'}** (Anul ${year}):\n\n1. Conceptul de bază a fost definit.\n2. Am parcurs arhitectura sistemului.\n3. Exemple practice au fost rulate în terminal.\n\nAi nevoie de detalii despre un punct anume?`;
  }
  
  if (lowerText.includes('cod') || lowerText.includes('exemplu')) {
    return `Sigur, iată un exemplu de cod relevant pentru **${subject || 'programare'}**:\n\n\`\`\`typescript\n// Exemplu generat pentru Anul ${year}\nfunction calculateComplexity(n: number): string {\n  return "O(n log n)";\n}\n\`\`\`\n\nAm deschis acest cod în panoul de lucru (Workspace) pentru a-l edita direct.`;
  }

  return `Am recepționat întrebarea ta despre "${text}".\n\nAvând în vedere că suntem la materia **${subject || 'General'}** (Anul ${year}), răspunsul teoretic implică aplicarea conceptelor învățate în cursurile anterioare. Te rog să îmi dai mai mult context dacă dorești o rezolvare completă sau un snippet de cod.`;
};

export const simulateAIResponse = async (chatId: string, userText: string, parentId: string) => {
  const store = useChatStore.getState();
  const chat = store.chats[chatId];
  
  if (!chat) return;

  // 1. Starea "Thinking" - ADAUGĂM UN MESAJ GOL INIȚIAL
  const aiMessageId = store.addMessage(chatId, "", "ai", parentId);
  
  // Așteptăm 2.6 secunde (pentru a lăsa componenta ThinkingSteps să ruleze animația completă: 800ms + 1800ms)
  await new Promise(resolve => setTimeout(resolve, 2600)); 

  // 2. Starea "Typing" (Streaming)
  store.updateMessageStatus(chatId, aiMessageId, 'typing');
  
  const fullResponse = generateMockResponse(userText, chat.subject, chat.year || '1');
  
  let currentContent = "";
  // Împărțim textul, păstrând spațiile pentru un efect de streaming natural
  const words = fullResponse.split(/(\s+)/); 

  for (const word of words) {
    currentContent += word;
    store.updateMessageContent(chatId, aiMessageId, currentContent);
    // Delay variabil între 15ms și 45ms pentru un efect realist de tastare umană/AI
    await new Promise(resolve => setTimeout(resolve, 15 + Math.random() * 30));
  }

  // 3. Finalizează mesajul
  store.updateMessageStatus(chatId, aiMessageId, 'done');
  
  // 4. Deschide automat panoul de Artifacts dacă utilizatorul a cerut cod
  if (userText.toLowerCase().includes('cod') || userText.toLowerCase().includes('componentă')) {
    setTimeout(() => {
      store.openArtifact({
        title: "GeneratedSnippet.ts",
        language: "typescript",
        content: `// Generat de Neural Engine v4.0\n// Context: Anul ${chat.year}, Materia: ${chat.subject}\n\nexport const runSimulation = (): void => {\n  console.log("System initialized securely.");\n  return;\n};\n`
      });
    }, 400); // Mic delay pentru a nu fi prea intruziv
  }
};