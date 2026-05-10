import { useState } from 'react';
import { useChatStore } from '../../store/useChatStore';
import { 
  Search, 
  Plus, 
  ChevronDown, 
  ChevronRight, 
  Book, 
  History, 
  Settings,
  GraduationCap,
  MessageSquare
} from 'lucide-react';

// Structura de date pentru contextul academic
const ACADEMIC_MAP: Record<string, { label: string, subjects: string[] }> = {
  '1': { 
    label: 'Anul I', 
    subjects: ['Programare', 'Matematică', 'Logică', 'Algoritmi', 'Arhitectură', 'Engleză'] 
  },
  '2': { 
    label: 'Anul II', 
    subjects: ['OOP', 'Structuri Date', 'Baze de Date', 'Rețele', 'SO', 'Web Dev'] 
  },
  '3': { 
    label: 'Anul III', 
    subjects: ['AI/ML', 'Securitate', 'Cloud', 'Mobile Dev', 'Software Eng', 'Grafică'] 
  },
  '4': { 
    label: 'Master', 
    subjects: ['Deep Learning', 'Distributed Sys', 'Research', 'Advanced DB', 'Thesis'] 
  }
};

export default function Sidebar() {
  const { 
    selectedYear, 
    setSelectedYear, 
    selectedSubject, 
    setSelectedSubject,
    chats,
    createChat,
    setActiveChat,
    activeChatId
  } = useChatStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(true);

  const currentYearData = ACADEMIC_MAP[selectedYear];

  const handleCreateNewSession = () => {
    createChat(null, selectedYear, selectedSubject);
  };

  return (
    <aside className="w-[280px] h-full bg-zinc-950 border-r border-zinc-900 flex flex-col relative z-20">
      
      {/* 1. Selector An Universitar */}
      <div className="p-4 border-b border-zinc-900">
        <div className="flex items-center gap-2 mb-3 px-2">
          <GraduationCap size={16} className="text-zinc-500" />
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Context Academic</span>
        </div>
        <select 
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-bold text-zinc-100 outline-none focus:border-zinc-700 transition-all appearance-none cursor-pointer"
        >
          {Object.entries(ACADEMIC_MAP).map(([val, data]) => (
            <option key={val} value={val}>{data.label}</option>
          ))}
        </select>
      </div>

      {/* 2. Listă Materii (Filtru Context) */}
      <div className="p-4 flex-none">
        <div className="space-y-1">
          {currentYearData.subjects.map((subject) => (
            <button
              key={subject}
              onClick={() => setSelectedSubject(subject)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all ${
                selectedSubject === subject 
                  ? 'bg-zinc-100 text-zinc-950 font-bold shadow-lg' 
                  : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900'
              }`}
            >
              <Book size={14} className={selectedSubject === subject ? 'text-zinc-950' : 'text-zinc-600'} />
              {subject}
            </button>
          ))}
        </div>
      </div>

      {/* 3. Acțiune Chat Nou */}
      <div className="px-4 py-2">
        <button 
          onClick={handleCreateNewSession}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 hover:bg-zinc-800 transition-all active:scale-[0.98] group"
        >
          <Plus size={16} className="text-zinc-500 group-hover:text-zinc-100" />
          <span className="text-xs font-bold italic">Sesiune Nouă</span>
        </button>
      </div>

      {/* 4. Istoric Conversații (Search + List) */}
      <div className="flex-1 flex flex-col overflow-hidden mt-4">
        <div className="px-4 mb-2">
          <div className="relative group">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-zinc-400" />
            <input 
              type="text"
              placeholder="Caută în istoric..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/50 border border-zinc-900 rounded-lg py-2 pl-9 pr-3 text-[11px] text-zinc-300 outline-none focus:border-zinc-800 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 custom-scrollbar">
          <button 
            onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
            className="w-full flex items-center gap-2 px-2 py-2 text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            {isHistoryExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <History size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Recente</span>
          </button>

          {isHistoryExpanded && (
            <div className="space-y-0.5 mt-1">
              {Object.values(chats)
                .filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()))
                .reverse()
                .map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setActiveChat(chat.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[11px] transition-all truncate ${
                    activeChatId === chat.id 
                      ? 'bg-zinc-900 text-zinc-100 border border-zinc-800' 
                      : 'text-zinc-500 hover:bg-zinc-900/50 hover:text-zinc-300'
                  }`}
                >
                  <MessageSquare size={12} className={activeChatId === chat.id ? 'text-zinc-100' : 'text-zinc-700'} />
                  <span className="truncate">{chat.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 5. Profil / Setări Footer */}
      <div className="p-4 border-t border-zinc-900 bg-zinc-950/80 backdrop-blur-md">
        <button className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-900 transition-all group">
          <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[10px] font-black text-zinc-400 group-hover:text-zinc-100">
            ST
          </div>
          <div className="flex-1 text-left">
            <div className="text-[11px] font-bold text-zinc-200">Profil Student</div>
            <div className="text-[9px] text-zinc-600 font-medium uppercase tracking-tighter italic">Status: System Operational</div>
          </div>
          <Settings size={14} className="text-zinc-700 group-hover:text-zinc-400" />
        </button>
      </div>
    </aside>
  );
}