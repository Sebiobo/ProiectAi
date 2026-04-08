import { Loader2, Zap, Database, Cpu } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ThinkingSteps() {
  const [step, setStep] = useState(0);

  // Simulăm trecerea prin mai mulți "pași" de gândire pentru efect vizual
  useEffect(() => {
    const intervals = [
      setTimeout(() => setStep(1), 600),
      setTimeout(() => setStep(2), 1500),
    ];
    return () => intervals.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex flex-col gap-3 p-5 max-w-[85%] rounded-3xl bg-[#0a0a0a] border border-white/5 shadow-lg mb-4 animate-fadeIn">
      <div className="flex items-center gap-3">
        <Loader2 size={18} className="text-magenta-500 animate-spin" />
        <span className="text-xs text-white uppercase tracking-[0.2em] font-black">
          Inițializare Răspuns
        </span>
      </div>
      
      <div className="flex flex-col gap-2 pl-7 mt-1">
        <div className={`flex items-center gap-2 transition-all duration-300 ${step >= 0 ? 'opacity-100 text-[#888]' : 'opacity-0'}`}>
          <Database size={12} className="text-blue-500" />
          <span className="text-[10px] font-mono tracking-wider">Cautare in context... [OK]</span>
        </div>
        
        <div className={`flex items-center gap-2 transition-all duration-300 ${step >= 1 ? 'opacity-100 text-[#888]' : 'opacity-0'}`}>
          <Cpu size={12} className="text-magenta-500" />
          <span className="text-[10px] font-mono tracking-wider">Generare predictii neurale...</span>
        </div>

        <div className={`flex items-center gap-2 transition-all duration-300 ${step >= 2 ? 'opacity-100 text-[#888]' : 'opacity-0'}`}>
          <Zap size={12} className="text-yellow-500 animate-pulse" />
          <span className="text-[10px] font-mono tracking-wider">Compilare raspuns...</span>
        </div>
      </div>
    </div>
  );
}