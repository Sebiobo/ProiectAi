import { Loader2, Database, Cpu, Search } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ThinkingSteps() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const intervals = [
      setTimeout(() => setStep(1), 800),
      setTimeout(() => setStep(2), 1800),
    ];
    return () => intervals.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex flex-col gap-3 p-5 max-w-[85%] rounded-2xl bg-zinc-900/50 border border-zinc-800 shadow-sm mb-4 animate-in">
      <div className="flex items-center gap-3">
        <Loader2 size={16} className="text-zinc-400 animate-spin" />
        <span className="text-[10px] text-zinc-100 uppercase tracking-[0.2em] font-black">
          Procesare Neurală
        </span>
      </div>
      
      <div className="flex flex-col gap-2 pl-7 mt-1">
        <div className={`flex items-center gap-2 transition-all duration-500 ${step >= 0 ? 'opacity-100' : 'opacity-0'}`}>
          <Search size={12} className="text-zinc-500" />
          <span className="text-[10px] font-mono tracking-wider text-zinc-400">Analiză context academic... [OK]</span>
        </div>
        
        <div className={`flex items-center gap-2 transition-all duration-500 ${step >= 1 ? 'opacity-100' : 'opacity-0'}`}>
          <Database size={12} className="text-zinc-500" />
          <span className="text-[10px] font-mono tracking-wider text-zinc-400">Interogare bază de cunoștințe...</span>
        </div>

        <div className={`flex items-center gap-2 transition-all duration-500 ${step >= 2 ? 'opacity-100' : 'opacity-0'}`}>
          <Cpu size={12} className="text-zinc-500 animate-pulse" />
          <span className="text-[10px] font-mono tracking-wider text-zinc-400">Sintetizare răspuns structurat...</span>
        </div>
      </div>
    </div>
  );
}