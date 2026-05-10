import { useState, useEffect, useRef } from 'react';
import { useChatStore } from '../../store/useChatStore';
import { 
  Search, 
  Plus, 
  MessageSquare, 
  Sparkles, 
  Command,
  Clock,
  ArrowRight
} from 'lucide-react';

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { chats, setActiveChat, createChat, selectedYear, selectedSubject } = useChatStore();

  // Listener global pentru scurtătura de tastatură
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((prev) => {
          // Resetăm query-ul chiar în momentul în care decidem să deschidem modalul
          // Astfel evităm eroarea de setState in useEffect
          if (!prev) setQuery('');
          return !prev;
        });
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-focus pe input când se deschide paleta
  useEffect(() => {
    if (isOpen) {
      // Un mic delay pentru a permite modalului să se randeze înainte de a prelua focusul
      const timeoutId = setTimeout(() => inputRef.current?.focus(), 10);
      return () => clearTimeout(timeoutId);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Filtrare rezultate
  const filteredChats = Object.values(chats)
    .filter(chat => chat.title.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 5);

  const handleSelectChat = (id: string) => {
    setActiveChat(id);
    setIsOpen(false);
  };

  const handleNewChat = () => {
    createChat(null, selectedYear, selectedSubject);
    setIsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-100 flex items-start justify-center pt-[15vh] p-4">
      
      {/* Overlay cu Blur */}
      <div 
        className="absolute inset-0 bg-zinc-950/40 backdrop-blur-md animate-in fade-in duration-300"
        onClick={() => setIsOpen(false)}
      />

      {/* Modal Paletă */}
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-[0_32px_64px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Input de Căutare */}
        <div className="relative flex items-center px-6 py-5 border-b border-zinc-800">
          <Search size={20} className="text-zinc-500 mr-4 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Caută sesiuni sau tastează o comandă..."
            className="flex-1 bg-transparent border-none outline-none text-zinc-100 text-lg placeholder:text-zinc-600 font-medium"
          />
          <div className="flex items-center gap-1">
             <kbd className="hidden sm:inline-flex h-6 items-center gap-1 rounded border border-zinc-700 bg-zinc-800 px-1.5 font-mono text-[10px] font-medium text-zinc-400 opacity-100">
              ESC
            </kbd>
          </div>
        </div>

        {/* Listă Rezultate */}
        <div className="max-h-[60vh] overflow-y-auto p-3 custom-scrollbar">
          
          {/* SECȚIUNE: ACȚIUNI RAPIDE */}
          {(!query || 'new session'.includes(query.toLowerCase())) && (
            <div className="mb-4">
              <div className="px-3 py-2 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1">
                Comenzi Sistem
              </div>
              <button 
                onClick={handleNewChat}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-left hover:bg-zinc-800 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0 group-hover:border-zinc-700">
                  <Plus size={18} className="text-zinc-400 group-hover:text-zinc-100" />
                </div>
                <div className="flex-1">
                  <span className="text-sm font-bold text-zinc-200 block">Inițializează Sesiune Nouă</span>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold italic">
                    {selectedSubject || 'General'} • Anul {selectedYear}
                  </span>
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   <span className="text-[10px] font-mono text-zinc-600">ENTER</span>
                   <ArrowRight size={14} className="text-zinc-600" />
                </div>
              </button>
            </div>
          )}

          {/* SECȚIUNE: ISTORIC REZULTATE */}
          {filteredChats.length > 0 && (
            <div>
              <div className="px-3 py-2 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-2 mb-1">
                Sesiuni Recente
                <div className="h-px flex-1 bg-zinc-800/50" />
              </div>
              <div className="space-y-1">
                {filteredChats.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => handleSelectChat(chat.id)}
                    className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-left hover:bg-zinc-800 transition-all group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0 group-hover:border-zinc-700">
                      <MessageSquare size={18} className="text-zinc-500 group-hover:text-zinc-300" />
                    </div>
                    <div className="flex-1 truncate">
                      <span className="text-sm font-semibold text-zinc-300 group-hover:text-zinc-100 block truncate">
                        {chat.title}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Clock size={10} className="text-zinc-600" />
                        <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-tighter">
                          {new Date(chat.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* EMPTY STATE */}
          {query && filteredChats.length === 0 && !'new session'.includes(query.toLowerCase()) && (
            <div className="py-12 text-center flex flex-col items-center">
              <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center mb-4 border border-zinc-700">
                <Sparkles size={20} className="text-zinc-600" />
              </div>
              <p className="text-sm text-zinc-400 font-medium">Nu am găsit nicio potrivire pentru "{query}"</p>
              <p className="text-[10px] text-zinc-600 uppercase tracking-widest mt-2 font-bold">Încearcă un alt termen sau creează un chat nou</p>
            </div>
          )}
        </div>
        
        {/* Footer Shortcut-uri */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950/50 flex items-center justify-between">
          <div className="flex items-center gap-6 text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
            <span className="flex items-center gap-2">
              <kbd className="bg-zinc-800 border border-zinc-700 px-1.5 py-0.5 rounded text-zinc-300">↑↓</kbd> Navigare
            </span>
            <span className="flex items-center gap-2">
              <kbd className="bg-zinc-800 border border-zinc-700 px-1.5 py-0.5 rounded text-zinc-300">↵</kbd> Selectare
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em]">
            <Command size={12} />
            Neural Engine Search
          </div>
        </div>

      </div>
    </div>
  );
}