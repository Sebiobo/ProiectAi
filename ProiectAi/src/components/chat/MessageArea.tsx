import { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
// AM REZOLVAT EROAREA AICI: "type MessageNode"
import { useChatStore, type MessageNode } from '../../store/useChatStore';
import { simulateAIResponse } from '../../services/aiService';
import { Bot, User, Edit2, RotateCcw, ChevronLeft, ChevronRight, Loader2, Search, CheckCircle2 } from 'lucide-react';

export default function MessageArea() {
  const activeChatId = useChatStore((state) => state.activeChatId);
  const activeChat = useChatStore((state) => activeChatId ? state.chats[activeChatId] : null);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeChat?.currentLeafId, activeChat?.messages]);

  if (!activeChat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-[#444] animate-fadeIn">
        <div className="w-16 h-16 bg-[#1a1a1a] rounded-2xl flex items-center justify-center mb-6 border border-[#333]">
          <Bot size={32} className="text-[#888]" />
        </div>
        <h3 className="text-lg font-medium text-[#ededed] mb-1">Selectează un Chat</h3>
        <p className="text-xs text-[#666]">Sau apasă "Chat Nou" din meniul lateral.</p>
      </div>
    );
  }

  const buildCurrentBranch = (): MessageNode[] => {
    const branch: MessageNode[] = [];
    let currentId = activeChat.currentLeafId;
    
    while (currentId && activeChat.messages[currentId]) {
      branch.unshift(activeChat.messages[currentId]);
      currentId = activeChat.messages[currentId].parentId;
    }
    return branch;
  };

  const currentMessages = buildCurrentBranch();

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-8 custom-scrollbar">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {currentMessages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center mt-32 animate-fadeIn">
            <div className="w-16 h-16 bg-[#1a1a1a] rounded-2xl flex items-center justify-center mb-6 border border-[#333]">
              <Bot size={32} className="text-[#888]" />
            </div>
            <h3 className="text-xl font-medium text-[#ededed] mb-2">AI Coach Pro</h3>
            <p className="text-sm text-[#666] max-w-md">
              Sistemul este pregătit. Folosește comanda "/" pentru a accesa șabloanele de învățare.
            </p>
          </div>
        )}

        {currentMessages.map((msg) => (
          <SingleMessage key={msg.id} msg={msg} />
        ))}
      </div>
    </div>
  );
}

function SingleMessage({ msg }: { msg: MessageNode }) {
  const activeChatId = useChatStore((state) => state.activeChatId);
  const switchToBranch = useChatStore((state) => state.switchToBranch);
  const chat = useChatStore((state) => activeChatId ? state.chats[activeChatId] : null);
  
  const isUser = msg.role === 'user';
  const parentId = msg.parentId;
  const siblings = parentId && chat ? chat.messages[parentId].childrenIds : [];
  const currentVersionIndex = siblings.indexOf(msg.id);

  const handleNextVersion = () => {
    if (currentVersionIndex < siblings.length - 1) {
      switchToBranch(activeChatId!, siblings[currentVersionIndex + 1]);
    }
  };

  const handlePrevVersion = () => {
    if (currentVersionIndex > 0) {
      switchToBranch(activeChatId!, siblings[currentVersionIndex - 1]);
    }
  };

  const handleRegenerate = async () => {
    if (!activeChatId || !msg.parentId) return;
    const userMessage = chat?.messages[msg.parentId];
    if (userMessage) {
      await simulateAIResponse(activeChatId, userMessage.content, userMessage.id);
    }
  };

  return (
    <div className={`group flex gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-fadeIn relative`}>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border mt-1 shadow-sm ${
        isUser ? 'bg-[#1a1a1a] text-[#888] border-[#333]' : 'bg-[#ededed] text-[#0a0a0a] border-[#ededed]'
      }`}>
        {isUser ? <User size={16} /> : <Bot size={18} />}
      </div>

      <div className={`flex flex-col gap-2 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div className={`text-[15px] leading-relaxed w-full ${isUser ? 'text-[#ededed]' : 'text-[#d1d1d1]'}`}>
          {!isUser && msg.status === 'thinking' ? (
            <div className="bg-[#111] border border-[#222] rounded-xl p-4 shadow-lg min-w-64">
              <div className="flex items-center gap-3 text-sm text-[#888] mb-3">
                <Loader2 size={16} className="animate-spin text-magenta-500" />
                <span className="font-medium tracking-wide">AI-ul procesează...</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-[#555]">
                  <Search size={12} /> Analizez contextul...
                </div>
                <div className="flex items-center gap-2 text-xs text-[#555] animate-pulse">
                  <CheckCircle2 size={12} /> Sintetizez informația...
                </div>
              </div>
            </div>
          ) : (
            // AM REZOLVAT EROAREA AICI: Clasa e pe DIV, nu pe ReactMarkdown direct
            <div className={`px-2 py-1 ${isUser ? 'bg-[#1a1a1a] px-4 py-3 rounded-2xl border border-[#333]' : ''}`}>
               <div className="prose prose-invert prose-sm max-w-none">
                 <ReactMarkdown remarkPlugins={[remarkGfm]}>
                   {msg.content}
                 </ReactMarkdown>
               </div>
            </div>
          )}
        </div>

        {msg.status === 'done' && (
          <div className={`flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-all duration-200 ${
            isUser ? 'flex-row-reverse' : 'flex-row'
          }`}>
            {siblings.length > 1 && (
              <div className="flex items-center gap-1 bg-[#111] border border-[#222] rounded px-1.5 py-0.5 text-[10px] font-mono text-[#555]">
                <button onClick={handlePrevVersion} disabled={currentVersionIndex === 0} className="hover:text-white disabled:opacity-20 transition-colors">
                  <ChevronLeft size={12} />
                </button>
                <span className="px-1 text-[#888]">{currentVersionIndex + 1} / {siblings.length}</span>
                <button onClick={handleNextVersion} disabled={currentVersionIndex === siblings.length - 1} className="hover:text-white disabled:opacity-20 transition-colors">
                  <ChevronRight size={12} />
                </button>
              </div>
            )}
            <div className="flex items-center gap-1">
              <button className="p-1.5 text-[#555] hover:text-[#ededed] hover:bg-[#222] rounded-md transition-colors" title="Editează mesajul">
                <Edit2 size={13} />
              </button>
              {!isUser && (
                <button onClick={handleRegenerate} className="p-1.5 text-[#555] hover:text-[#ededed] hover:bg-[#222] rounded-md transition-colors" title="Regenerează răspunsul (Creează variantă nouă)">
                  <RotateCcw size={13} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}