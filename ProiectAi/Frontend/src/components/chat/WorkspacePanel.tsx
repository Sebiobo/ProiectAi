import { useChatStore } from '../../store/useChatStore';
import { X, Copy, Download, Code2, Check } from 'lucide-react';
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
    <div className="w-1/2 h-full bg-[#050505] border-l border-white/10 flex flex-col animate-fadeIn shadow-2xl relative z-20">
      
      {/* Header */}
      <div className="h-[73px] flex items-center justify-between px-6 border-b border-[#1f1f1f] bg-[#000000] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#111] border border-white/10 flex items-center justify-center">
            <Code2 size={16} className="text-magenta-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#ededed] tracking-tight">{activeArtifact.title}</h3>
            <p className="text-[10px] text-[#888] uppercase tracking-widest">{activeArtifact.language}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleCopy}
            className="p-2 rounded-lg text-[#888] hover:text-white hover:bg-[#111] transition-all"
            title="Copiaza Codul"
          >
            {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
          </button>
          <button 
            className="p-2 rounded-lg text-[#888] hover:text-white hover:bg-[#111] transition-all"
            title="Descarca"
          >
            <Download size={16} />
          </button>
          <div className="w-px h-4 bg-white/10 mx-1"></div>
          <button 
            onClick={closeArtifact}
            className="p-2 rounded-lg text-[#888] hover:text-red-500 hover:bg-red-500/10 transition-all"
            title="Inchide Panoul"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 p-4 overflow-hidden bg-[#000]">
        <textarea
          value={activeArtifact.content}
          onChange={(e) => updateArtifactContent(e.target.value)}
          className="w-full h-full bg-transparent text-[#ddd] font-mono text-sm resize-none outline-none leading-relaxed p-4 border border-[#1f1f1f] rounded-xl focus:border-magenta-500/30 transition-colors shadow-inner"
          spellCheck="false"
        />
      </div>
    </div>
  );
}