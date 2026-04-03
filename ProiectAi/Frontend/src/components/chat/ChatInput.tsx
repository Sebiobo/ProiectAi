import { useState, useRef } from 'react'; // AM REZOLVAT AICI: Am șters useEffect
import { Send, Sparkles, Zap, BookOpen, Code, X } from 'lucide-react';
import { useChatStore } from '../../store/useChatStore';
import { simulateAIResponse } from '../../services/aiService';

const TEMPLATES = [
  { id: 't1', icon: BookOpen, command: '/explică', label: 'Explică simplu', text: 'Explică următorul concept ca și cum aș avea 10 ani: ' },
  { id: 't2', icon: Zap, command: '/rezumă', label: 'Rezumat rapid', text: 'Extrage cele mai importante 3 idei din următorul text: \n\n' },
  { id: 't3', icon: Code, command: '/cod', label: 'Exemplu de cod', text: 'Scrie un exemplu de cod în React/TS pentru: ' },
  { id: 't4', icon: Sparkles, command: '/formal', label: 'Ton profesional', text: 'Rescrie următorul mesaj într-un ton formal, academic: \n\n' },
];

export default function ChatInput() {
  const [text, setText] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  
  const addMessage = useChatStore((state) => state.addMessage);
  const activeChatId = useChatStore((state) => state.activeChatId);
  const currentLeafId = useChatStore((state) => state.chats[state.activeChatId || '']?.currentLeafId || null);

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = () => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 150)}px`;
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setText(value);
    autoResize();

    if (value === '/') {
      setShowTemplates(true);
    } else if (value === '' || !value.startsWith('/')) {
      setShowTemplates(false);
    }
  };

  const applyTemplate = (templateText: string) => {
    setText(templateText);
    setShowTemplates(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // AM REZOLVAT AICI: Legătura cu Streaming-ul AI
  const handleSend = async () => {
    if (!text.trim() || !activeChatId) return;
    
    const currentInput = text;
    const userMessageId = addMessage(activeChatId, currentInput, 'user', currentLeafId);
    
    setText('');
    setShowTemplates(false);
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }

    await simulateAIResponse(activeChatId, currentInput, userMessageId);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      {showTemplates && (
        <div className="absolute bottom-full mb-3 left-0 w-full bg-[#1a1a1a] border border-[#333] rounded-xl shadow-2xl overflow-hidden animate-fadeIn z-50">
          <div className="px-4 py-2 border-b border-[#333] flex items-center justify-between bg-[#111]">
            <span className="text-xs font-semibold text-[#888] uppercase tracking-wider">Șabloane Rapide</span>
            <button onClick={() => setShowTemplates(false)} className="text-[#666] hover:text-white">
              <X size={14} />
            </button>
          </div>
          <div className="p-2 space-y-1">
            {TEMPLATES.map((tpl) => {
              const Icon = tpl.icon;
              return (
                <button
                  key={tpl.id}
                  onClick={() => applyTemplate(tpl.text)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#2a2a2a] text-left transition-colors group"
                >
                  <div className="bg-[#222] p-1.5 rounded-md text-magenta-500 group-hover:text-magenta-400 group-hover:bg-[#333] transition-colors">
                    <Icon size={16} />
                  </div>
                  <div>
                    <div className="text-sm text-[#ededed] font-medium">{tpl.command}</div>
                    <div className="text-xs text-[#666]">{tpl.label}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="relative flex items-end bg-[#0a0a0a] border border-[#262626] rounded-2xl focus-within:border-[#555] focus-within:shadow-[0_0_15px_rgba(255,255,255,0.05)] transition-all">
        <button className="p-3 mb-1 ml-1 text-[#666] hover:text-[#ededed] transition-colors">
          <Sparkles size={20} />
        </button>

        <textarea
          ref={inputRef}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder="Scrie '/' pentru șabloane, sau pune o întrebare..."
          className="flex-1 max-h-40 bg-transparent outline-none text-sm py-4 px-2 text-[#ededed] placeholder:text-[#444] resize-none overflow-y-auto custom-scrollbar"
          rows={1}
        />

        <button
          onClick={handleSend}
          disabled={!text.trim()}
          className="p-3 mb-1 mr-1 text-[#888] hover:text-white transition-colors disabled:opacity-30 disabled:hover:text-[#888]"
        >
          <Send size={20} />
        </button>
      </div>

      <p className="text-[10px] text-center text-[#444] mt-3 tracking-wide">
        Sistem bazat pe AI. Informațiile generate trebuie verificate.
      </p>
    </div>
  );
}