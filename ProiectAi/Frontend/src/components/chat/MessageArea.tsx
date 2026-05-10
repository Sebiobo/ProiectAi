import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useChatStore, type MessageNode as MessageNodeType } from '../../store/useChatStore';
import { Bot, User, Edit2, RotateCcw, ChevronLeft, ChevronRight, CheckCircle2, LayoutDashboard, Terminal, Check, Copy } from 'lucide-react';
import ThinkingSteps from './ThinkingSteps';

export default function MessageArea() {
  const activeChatId = useChatStore((state) => state.activeChatId);
  const activeChat = useChatStore((state) => activeChatId ? state.chats[activeChatId] : null);
  const selectedSubject = useChatStore((state) => state.selectedSubject);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [activeChat?.currentLeafId, activeChat?.messages]);

  if (!activeChat) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 animate-in">
        <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
          <LayoutDashboard size={32} className="text-zinc-600" />
        </div>
        <h3 className="text-lg font-bold text-zinc-300 mb-1">Selectează o Sesiune</h3>
        <p className="text-xs text-zinc-500 font-medium">Apasă "Sesiune Nouă" din meniul lateral pentru a începe.</p>
      </div>
    );
  }

  const buildCurrentBranch = (): MessageNodeType[] => {
    const branch: MessageNodeType[] = [];
    let currentId = activeChat.currentLeafId;
    
    while (currentId && activeChat.messages[currentId]) {
      branch.unshift(activeChat.messages[currentId]);
      currentId = activeChat.messages[currentId].parentId;
    }
    return branch;
  };

  const currentMessages = buildCurrentBranch();

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-8 custom-scrollbar">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {currentMessages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center mt-32 animate-in">
            <div className="w-20 h-20 bg-zinc-900 border border-zinc-800 rounded-3xl flex items-center justify-center mb-6 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-zinc-800/20 to-transparent" />
              <Terminal size={36} className="text-zinc-500 group-hover:text-zinc-300 transition-colors relative z-10" />
            </div>
            <h3 className="text-2xl font-black text-zinc-100 mb-3 tracking-tight">Terminal Educațional</h3>
            <p className="text-sm text-zinc-500 max-w-md mb-8 leading-relaxed">
              Modulul <span className="font-bold text-zinc-300">{selectedSubject || 'General'}</span> este inițializat. 
              Tastează o comandă sau alege un shortcut.
            </p>

            <div className="flex flex-wrap gap-3 justify-center max-w-2xl">
              {['Rezumă ultimul curs', 'Generează quiz (10 pct)', 'Explică concept', 'Exemplu de cod'].map((cmd) => (
                <button 
                  key={cmd}
                  className="px-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-xl text-xs font-medium text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-all active:scale-95 shadow-sm"
                >
                  {cmd}
                </button>
              ))}
            </div>
          </div>
        )}

        {currentMessages.map((msg) => (
          <SingleMessage key={msg.id} msg={msg} />
        ))}
      </div>
    </div>
  );
}

// 1. Definiția corectă a interfeței
interface CodeProps extends React.HTMLAttributes<HTMLElement> {
  inline?: boolean;
}

// 2. O SINGURĂ definiție a componentei CodeBlock
const CodeBlock = ({ inline, className, children, ...props }: CodeProps) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  const codeString = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!inline && match) {
    return (
      <div className="relative group/code mt-4 mb-4 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-2xl">
        <div className="flex items-center justify-between px-4 py-2 bg-zinc-900 border-b border-zinc-800">
          <span className="text-[10px] font-mono text-zinc-400 uppercase">{language}</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-zinc-800/50 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            {copied ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
            <span className="text-[10px] font-medium">{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
        <SyntaxHighlighter
          {...props}
          style={vscDarkPlus}
          language={language}
          PreTag="div"
          customStyle={{
            margin: 0,
            padding: '1.25rem',
            background: 'transparent',
            fontSize: '0.85rem',
            lineHeight: '1.6',
          }}
        >
          {codeString}
        </SyntaxHighlighter>
      </div>
    );
  }

  return (
    <code className={`${className} bg-zinc-800 text-zinc-200 px-1.5 py-0.5 rounded-md font-mono text-sm`} {...props}>
      {children}
    </code>
  );
};

function SingleMessage({ msg }: { msg: MessageNodeType }) {
  const activeChatId = useChatStore((state) => state.activeChatId);
  const switchToBranch = useChatStore((state) => state.switchToBranch);
  const chat = useChatStore((state) => activeChatId ? state.chats[activeChatId] : null);
  
  const isUser = msg.role === 'user';
  const parentId = msg.parentId;
  const siblings = parentId && chat ? chat.messages[parentId].childrenIds : [];
  const currentVersionIndex = siblings.indexOf(msg.id);

  if (!isUser && msg.status === 'thinking') {
    return <ThinkingSteps />;
  }

  return (
    <div className={`group flex gap-5 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-in`}>
      {/* Avatar Container */}
      <div className="shrink-0 mt-1">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg border ${
          isUser 
            ? 'bg-zinc-100 text-zinc-950 border-zinc-200' 
            : 'bg-zinc-900 text-zinc-300 border-zinc-800'
        }`}>
          {isUser ? <User size={18} strokeWidth={2.5} /> : <Bot size={20} strokeWidth={2.5} />}
        </div>
      </div>

      {/* Message Content Container */}
      <div className={`flex flex-col gap-2 max-w-[85%] ${isUser ? 'items-end' : 'items-start'}`}>
        
        {/* The Bubble */}
        <div className={`text-[15px] leading-relaxed w-full shadow-sm ${
          isUser 
            ? 'bg-zinc-100 text-zinc-950 px-5 py-3.5 rounded-2xl rounded-tr-sm font-medium' 
            : 'bg-zinc-900 border border-zinc-800 text-zinc-300 px-6 py-4 rounded-3xl rounded-tl-sm'
        }`}>
          <div className="prose prose-invert prose-sm max-w-none">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                code: CodeBlock
              }}
            >
              {msg.content}
            </ReactMarkdown>
          </div>
        </div>

        {/* Action Bar (Edit/Regenerate/Versions) */}
        {msg.status === 'done' && (
          <div className={`flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-all duration-200 ${
            isUser ? 'flex-row-reverse' : 'flex-row'
          }`}>
            {siblings.length > 1 && (
              <div className="flex items-center gap-1 bg-zinc-900 border border-zinc-800 rounded px-1.5 py-0.5 text-[10px] font-mono text-zinc-500">
                <button 
                  onClick={() => switchToBranch(activeChatId!, siblings[currentVersionIndex - 1])} 
                  disabled={currentVersionIndex === 0} 
                  className="hover:text-zinc-200 disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft size={12} />
                </button>
                <span className="px-1 text-zinc-400">{currentVersionIndex + 1} / {siblings.length}</span>
                <button 
                  onClick={() => switchToBranch(activeChatId!, siblings[currentVersionIndex + 1])} 
                  disabled={currentVersionIndex === siblings.length - 1} 
                  className="hover:text-zinc-200 disabled:opacity-30 transition-colors"
                >
                  <ChevronRight size={12} />
                </button>
              </div>
            )}
            <div className="flex items-center gap-1">
              <button className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-colors" title="Editează mesajul">
                <Edit2 size={13} />
              </button>
              {!isUser && (
                <button className="p-1.5 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-md transition-colors" title="Regenerează">
                  <RotateCcw size={13} />
                </button>
              )}
            </div>
            <div className="flex items-center gap-1 px-2 text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
              {isUser ? 'User' : <span className="flex items-center gap-1"><CheckCircle2 size={10} className="text-emerald-500" /> Verificat</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}