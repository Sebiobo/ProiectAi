import React, { useState } from 'react';
import { useChatStore } from '../../store/useChatStore';
import { Send, Terminal } from 'lucide-react';

export default function ChatInput() {
  const [text, setText] = useState('');
  const activeChatId = useChatStore((state) => state.activeChatId);
  const activeChat = useChatStore((state) => 
    activeChatId ? state.chats[activeChatId] : null
  );
  
  const addMessage = useChatStore((state) => state.addMessage);
  const updateMessageStatus = useChatStore((state) => state.updateMessageStatus);
  const updateMessageContent = useChatStore((state) => state.updateMessageContent);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !activeChatId) return;

    // 1. Adăugăm mesajul utilizatorului
    const currentLeafId = activeChat?.currentLeafId || null;
    const userMsgId = addMessage(activeChatId, text, 'user', currentLeafId);
    setText('');

    // 2. Adăugăm mesajul AI-ului (inițial în starea 'thinking' cu text gol)
    const aiMsgId = addMessage(activeChatId, '', 'ai', userMsgId);

    // 3. SIMULARE API CALL (așteptăm 2 secunde ca să vedem pașii de gândire)
    setTimeout(() => {
      // Un text suficient de lung ca să vedem efectul fain de typing
      const fakeResponse = "Am analizat solicitarea ta în sistem. Răspunsul este pregătit. Aceasta este o demonstrație a efectului de streaming în timp real, exact cum funcționează un AI premium. Cum te pot ajuta mai departe?";
      
      // Punem textul și schimbăm starea pe 'done' ca să pornească efectul de scriere literă cu literă
      updateMessageContent(activeChatId, aiMsgId, fakeResponse);
      updateMessageStatus(activeChatId, aiMsgId, 'done');
    }, 2500); // 2.5 secunde de "gândire"
  };

  // Dacă nu avem un chat activ, nu afișăm bara
  if (!activeChatId) return null;

  return (
    <div className="p-4 bg-black border-t border-white/5 relative z-10">
      <form 
        onSubmit={handleSubmit} 
        className="max-w-4xl mx-auto relative group flex items-center bg-[#0a0a0a] border border-white/10 rounded-2xl focus-within:border-magenta-500/50 transition-colors shadow-2xl"
      >
        <div className="pl-4 pr-2 text-[#444] group-focus-within:text-magenta-500 transition-colors">
          <Terminal size={18} />
        </div>
        
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Scrie o comandă pentru Neural AI..."
          className="w-full bg-transparent text-white text-sm py-4 outline-none placeholder:text-[#333]"
        />
        
        <button
          type="submit"
          disabled={!text.trim()}
          className="m-2 p-2 rounded-xl bg-white text-black hover:bg-magenta-500 hover:text-white disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-black transition-all active:scale-95"
        >
          <Send size={18} />
        </button>
      </form>
      <div className="text-center mt-2">
        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#333]">Neural Engine v4.0 Active</span>
      </div>
    </div>
  );
}