import { useState } from 'react';
// AM REZOLVAT AICI: Import type Chat
import { useChatStore, type Chat } from '../../store/useChatStore';
import { Search, Plus, Folder, MessageSquare, MoreVertical, ChevronRight, ChevronDown } from 'lucide-react';

export default function Sidebar() {
  const { chats, folders, activeChatId, setActiveChat, createChat } = useChatStore();
  const [searchQuery, setSearchQuery] = useState('');
  
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    'folder-1': true,
    'folder-2': true
  });

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  const filteredChats = Object.values(chats).filter(chat => 
    chat.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const chatsByFolder: Record<string, typeof filteredChats> = {};
  const unassignedChats: typeof filteredChats = [];

  filteredChats.forEach(chat => {
    if (chat.folderId && folders[chat.folderId]) {
      if (!chatsByFolder[chat.folderId]) chatsByFolder[chat.folderId] = [];
      chatsByFolder[chat.folderId].push(chat);
    } else {
      unassignedChats.push(chat);
    }
  });

  return (
    <aside className="w-64 bg-[#0a0a0a] border-r border-[#1f1f1f] flex flex-col h-full z-30 shrink-0">
      <div className="p-4 space-y-4">
        <button 
          onClick={() => createChat()}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-[#ededed] text-[#0a0a0a] hover:bg-white transition-all text-xs font-bold shadow-sm active:scale-[0.98] group"
        >
          <div className="flex items-center gap-2">
            <Plus size={16} />
            <span>Chat Nou</span>
          </div>
          <kbd className="hidden group-hover:inline-block font-sans text-[10px] text-[#666] bg-[#d1d1d1] px-1.5 py-0.5 rounded">⌘K</kbd>
        </button>

        <div className="relative group">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555] group-focus-within:text-[#ededed] transition-colors" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Caută în istoric..."
            className="w-full bg-[#111] border border-[#222] rounded-lg py-2 pl-9 pr-3 text-xs text-[#ededed] placeholder:text-[#555] focus:border-[#444] outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 space-y-4 custom-scrollbar pb-4">
        {Object.values(folders).map(folder => {
          const folderChats = chatsByFolder[folder.id] || [];
          const isExpanded = expandedFolders[folder.id];

          if (searchQuery && folderChats.length === 0) return null; 

          return (
            <div key={folder.id} className="space-y-1">
              <button 
                onClick={() => toggleFolder(folder.id)}
                className="w-full flex items-center justify-between px-2 py-1.5 text-[#666] hover:text-[#ededed] transition-colors group"
              >
                <div className="flex items-center gap-2">
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  <Folder size={14} className="text-[#555] group-hover:text-magenta-500 transition-colors" />
                  <span className="text-xs font-semibold tracking-wide">{folder.name}</span>
                </div>
                <MoreVertical size={14} className="opacity-0 group-hover:opacity-100" />
              </button>

              {isExpanded && (
                <div className="pl-6 space-y-0.5">
                  {folderChats.length > 0 ? folderChats.map(chat => (
                    <ChatItem 
                      key={chat.id} 
                      chat={chat} 
                      isActive={activeChatId === chat.id} 
                      onClick={() => setActiveChat(chat.id)} 
                    />
                  )) : (
                    <div className="text-[10px] text-[#444] py-1 pl-2">Niciun chat salvat</div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {(unassignedChats.length > 0 || Object.keys(chats).length === 0) && (
          <div className="space-y-1 pt-2 border-t border-[#1a1a1a]">
            <div className="px-2 py-1.5 text-[10px] font-bold text-[#555] uppercase tracking-widest">
              Recente
            </div>
            {unassignedChats.map(chat => (
              <ChatItem 
                key={chat.id} 
                chat={chat} 
                isActive={activeChatId === chat.id} 
                onClick={() => setActiveChat(chat.id)} 
              />
            ))}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-[#1a1a1a] bg-[#0a0a0a]">
        <button className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[#111] transition-colors">
          <div >
            ST
          </div>
          <div className="flex-1 text-left">
            <div className="text-xs font-medium text-[#ededed]">Profil Student</div>
            <div className="text-[10px] text-[#666]">Cont Pro AI</div>
          </div>
        </button>
      </div>
    </aside>
  );
}

// AM REZOLVAT AICI: Type-ul pentru "chat"
function ChatItem({ chat, isActive, onClick }: { chat: Chat, isActive: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-all truncate group ${
        isActive ? 'bg-[#1a1a1a] text-white' : 'text-[#888] hover:bg-[#111] hover:text-[#ccc]'
      }`}
    >
      <MessageSquare size={12} className={isActive ? 'text-magenta-500' : 'text-[#555] group-hover:text-[#888]'} />
      <span className="truncate">{chat.title}</span>
    </button>
  );
}