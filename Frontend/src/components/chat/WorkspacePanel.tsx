import { useChatStore } from '../../store/useChatStore';
import { X, Copy, Code2, Check, Maximize2 } from 'lucide-react';
import { useState } from 'react';

export default function WorkspacePanel() {
  const activeArtifact = useChatStore((state) => state.activeArtifact);
  const closeArtifact = useChatStore((state) => state.closeArtifact);
  const updateArtifactContent = useChatStore((state) => state.updateArtifactContent);
  const [copied, setCopied] = useState(false);

  if (!activeArtifact) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(activeArtifact.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full h-full bg-zinc-950 border-l border-zinc-900 flex flex-col animate-in shadow-2xl relative z-30">
      
      {/* Header Artifact */}
      <div className="h-[73px] flex items-center justify-between px-6 border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-inner">
            <Code2 size={20} className="text-zinc-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-100 tracking-tight">{activeArtifact.title}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-black">{activeArtifact.language}</span>
              <span className="w-1 h-1 rounded-full bg-zinc-800" />
              <span className="text-[9px] text-emerald-500/80 uppercase tracking-widest font-black">Live Edit Mode</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button 
            onClick={handleCopy}
            className="p-2.5 rounded-xl text-zinc-500 hover:text-zinc-100 hover:bg-zinc-900 transition-all border border-transparent hover:border-zinc-800"
            title="Copiaza Codul"
          >
            {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
          </button>
          <button 
            className="p-2.5 rounded-xl text-zinc-500 hover:text-zinc-100 hover:bg-zinc-900 transition-all border border-transparent hover:border-zinc-800"
            title="Full Screen"
          >
            <Maximize2 size={16} />
          </button>
          <div className="w-px h-5 bg-zinc-800 mx-2" />
          <button 
            onClick={closeArtifact}
            className="p-2.5 rounded-xl text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
            title="Inchide Panoul"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Code / Text Editor Area */}
      <div className="flex-1 p-6 overflow-hidden bg-zinc-950">
        <div className="w-full h-full relative group">
          <div className="absolute -inset-1 bg-gradient-to-b from-zinc-800/10 to-transparent rounded-2xl blur opacity-20" />
          <textarea
            value={activeArtifact.content}
            onChange={(e) => updateArtifactContent(e.target.value)}
            className="relative w-full h-full bg-zinc-900/30 text-zinc-300 font-mono text-sm resize-none outline-none leading-relaxed p-6 border border-zinc-800 rounded-2xl focus:border-zinc-700 transition-all shadow-2xl custom-scrollbar"
            spellCheck="false"
          />
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-6 py-3 border-t border-zinc-900 bg-zinc-950 flex justify-between items-center">
        <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Workspace v1.0.4</span>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[9px] text-zinc-500 font-bold uppercase">Sync On</span>
          </div>
        </div>
      </div>
    </div>
  );
}