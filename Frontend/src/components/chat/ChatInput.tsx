import React, { useState, useRef } from 'react';
import { useChatStore } from '../../store/useChatStore';
import { simulateAIResponse, uploadDocument } from '../../services/aiService';
import { Send, Terminal, Sparkles, Paperclip, X, FileText, Image as ImageIcon } from 'lucide-react';

export default function ChatInput() {
  const [text, setText] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeChatId = useChatStore((state) => state.activeChatId);
  const activeChat = useChatStore((state) => activeChatId ? state.chats[activeChatId] : null);
  const addMessage = useChatStore((state) => state.addMessage);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!text.trim() && attachedFiles.length === 0) || !activeChatId) return;

    const currentLeafId = activeChat?.currentLeafId || null;

    let messageContent = text;

    if (attachedFiles.length > 0) {
      setIsUploading(true);
      const uploadedNames: string[] = [];
      const failedNames: string[] = [];

      await Promise.all(
        attachedFiles.map(async (file) => {
          try {
            await uploadDocument(file);
            uploadedNames.push(file.name);
          } catch {
            failedNames.push(file.name);
          }
        })
      );

      setIsUploading(false);

      if (uploadedNames.length > 0) {
        const fileList = uploadedNames.map(n => `[Fișier încărcat: ${n}]`).join(' ');
        messageContent = `${messageContent}\n\n*${fileList}*`.trim();
      }
      if (failedNames.length > 0) {
        const errList = failedNames.map(n => `[Eroare upload: ${n}]`).join(' ');
        messageContent = `${messageContent}\n\n*${errList}*`.trim();
      }
    }

    const userMsgId = addMessage(activeChatId, messageContent, 'user', currentLeafId);

    setText('');
    setAttachedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';

    await simulateAIResponse(activeChatId, text, userMsgId);
  };

  if (!activeChatId) return null;

  return (
    <div className="max-w-4xl mx-auto w-full relative z-20">
      <form 
        onSubmit={handleSubmit} 
        className="relative group flex flex-col bg-zinc-900 border border-zinc-800 rounded-2xl focus-within:border-zinc-700 transition-all shadow-2xl overflow-hidden"
      >
        {/* Zona de previzualizare fișiere atașate */}
        {attachedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 bg-zinc-950/50 border-b border-zinc-800/50">
            {attachedFiles.map((file, idx) => (
              <div 
                key={`${file.name}-${idx}`}
                className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg animate-in fade-in slide-in-from-bottom-1"
              >
                {file.type.startsWith('image/') ? (
                  <ImageIcon size={14} className="text-zinc-500" />
                ) : (
                  <FileText size={14} className="text-zinc-500" />
                )}
                <span className="text-[11px] font-medium text-zinc-300 max-w-[150px] truncate">
                  {file.name}
                </span>
                <button 
                  type="button"
                  onClick={() => removeFile(idx)}
                  className="hover:text-red-400 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center px-2 py-2">
          {/* Buton Upload */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-3 text-zinc-600 hover:text-zinc-300 transition-colors"
            title="Atașează fișier (PDF, Image, Text)"
          >
            <Paperclip size={18} />
          </button>
          
          <input 
            type="file" 
            multiple 
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.ts,.tsx,.js,.jsx"
          />

          <div className="h-6 w-px bg-zinc-800 mx-1" />

          <div className="pl-3 pr-2 text-zinc-600 group-focus-within:text-zinc-400 transition-colors">
            <Terminal size={18} />
          </div>
          
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Încarcă un curs sau pune o întrebare..."
            className="flex-1 bg-transparent text-zinc-100 text-sm py-3 outline-none placeholder:text-zinc-600 font-medium"
          />
          
          <button
            type="submit"
            disabled={isUploading || (!text.trim() && attachedFiles.length === 0)}
            className="p-3 rounded-xl bg-zinc-100 text-zinc-950 hover:bg-white disabled:opacity-20 disabled:hover:bg-zinc-100 transition-all active:scale-95 shadow-lg group/btn"
          >
            {isUploading ? (
              <span className="text-xs font-semibold px-1">...</span>
            ) : (
              <Send size={18} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
            )}
          </button>
        </div>
      </form>
      
      <div className="flex justify-center items-center gap-4 mt-3">
        <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-600">
          <Sparkles size={10} />
          RAG-Ready Engine
        </div>
        <div className="w-1 h-1 rounded-full bg-zinc-800" />
        <div className="text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-600">
          Context Aware Mode
        </div>
      </div>
    </div>
  );
}