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
  // --- NOU: Aducem funcția care deschide panoul ---
  const openArtifact = useChatStore((state) => state.openArtifact);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !activeChatId) return;

    const currentLeafId = activeChat?.currentLeafId || null;
    const userMsgId = addMessage(activeChatId, text, 'user', currentLeafId);
    setText('');

    const aiMsgId = addMessage(activeChatId, '', 'ai', userMsgId);

    // 3. SIMULARE API CALL
    setTimeout(() => {
      // Mesajul care se va scrie în stânga
      const fakeResponse = "Am procesat solicitarea ta. Componenta React pe care ai cerut-o este generată și disponibilă în panoul de lucru alăturat. Poți edita codul direct acolo sau îl poți copia în clipboard-ul tău.";
      
      updateMessageContent(activeChatId, aiMsgId, fakeResponse);
      updateMessageStatus(activeChatId, aiMsgId, 'done');

      // --- NOU: Deschidem panoul în dreapta instantaneu ---
      openArtifact({
        title: "CyberButton.tsx",
        language: "typescript",
        content: `import React from 'react';

export default function CyberButton() {
  return (
    <button className="relative px-6 py-3 font-black text-white group">
      <span className="absolute inset-0 w-full h-full transition duration-300 transform -translate-x-1 -translate-y-1 bg-magenta-500 ease opacity-80 group-hover:translate-x-0 group-hover:translate-y-0"></span>
      <span className="absolute inset-0 w-full h-full transition duration-300 transform translate-x-1 translate-y-1 bg-blue-500 ease opacity-80 group-hover:translate-x-0 group-hover:translate-y-0"></span>
      <span className="relative z-10 block px-6 py-3 bg-[#0a0a0a] border border-white/10 group-hover:border-magenta-500 transition-colors">
        INITIALIZE SYSTEM
      </span>
    </button>
  );
}`
      });

    }, 2500);
  };

  if (!activeChatId) return null;

  return (
    <div className="p-4 bg-black border-t border-[#1f1f1f] relative z-10 rounded-2xl mx-4 mb-4">
      <form 
        onSubmit={handleSubmit} 
        className="max-w-4xl mx-auto relative group flex items-center bg-[#0a0a0a] border border-[#222] rounded-2xl focus-within:border-magenta-500/50 transition-colors shadow-2xl"
      >
        <div className="pl-4 pr-2 text-[#444] group-focus-within:text-magenta-500 transition-colors">
          <Terminal size={18} />
        </div>
        
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Scrie o comandă pentru Neural AI..."
          className="w-full bg-transparent text-white text-sm py-4 outline-none placeholder:text-[#444]"
        />
        
        <button
          type="submit"
          disabled={!text.trim()}
          className="m-2 p-2 rounded-xl bg-white text-black hover:bg-magenta-500 hover:text-white disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-black transition-all active:scale-95"
        >
          <Send size={18} />
        </button>
      </form>
      <div className="text-center mt-3">
        <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#333]">Neural Engine v4.0 Active</span>
      </div>
    </div>
  );
}