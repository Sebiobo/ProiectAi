import { useState } from 'react';
import { useChatStore } from '../store/useChatStore';
import { Lock, User, ShieldCheck, Cpu, Mail, UserPlus, ArrowRight } from 'lucide-react';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  
  const login = useChatStore((state) => state.login);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (isRegister) {
      if (password !== confirmPassword) {
        setError('Parolele nu coincid!');
        return;
      }
      // Simulare Register - Aici vei lega backend-ul pe viitor
      alert("Cont creat cu succes! Te poți loga acum.");
      setIsRegister(false);
    } else {
      // Logica de Login - Folosește admin/admin din Store
      const success = login(username, password);
      if (!success) {
        setError('Credentiale invalide. Incearca admin/admin');
      }
    }
  };

  return (
    <div className="h-screen w-full bg-black flex items-center justify-center p-4 overflow-hidden relative">
      
      {/* Background Grid animat prin CSS-ul din index.css */}
      <div className="absolute inset-0 z-0 opacity-10" 
           style={{ backgroundImage: 'linear-gradient(#1f1f1f 1px, transparent 1px), linear-gradient(90deg, #1f1f1f 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
      </div>

      {/* Glow central pentru profunzime */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-magenta-500/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="w-full max-w-md bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/5 rounded-4xl p-10 shadow-2xl z-10 relative animate-fadeIn">
        
        {/* Header dinamizat în funcție de mod (Login/Register) */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#111] border border-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-xl transition-all duration-500">
            {isRegister ? <UserPlus size={32} className="text-magenta-500" /> : <ShieldCheck size={32} className="text-magenta-500" />}
          </div>
          <h1 className="text-2xl font-black text-white tracking-tighter uppercase italic">
            {isRegister ? 'New Identity' : 'CAMPUS MIND'}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <Cpu size={12} className="text-magenta-500 animate-pulse" />
            <p className="text-[10px] text-[#444] uppercase tracking-[0.2em] font-bold">
              {isRegister ? 'Enrollment Protocol' : 'System Secured'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* USERNAME */}
          <div className="relative group">
            <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#333] group-focus-within:text-magenta-500 transition-colors" />
            <input 
              type="text" required value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#111]/50 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white focus:border-magenta-500/50 outline-none transition-all placeholder:text-[#222]"
              placeholder="Username"
            />
          </div>

          {/* EMAIL - Apare doar la Register */}
          {isRegister && (
            <div className="relative group animate-slideDown">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#333] group-focus-within:text-magenta-500 transition-colors" />
              <input 
                type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#111]/50 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white focus:border-magenta-500/50 outline-none transition-all placeholder:text-[#222]"
                placeholder="Email Address"
              />
            </div>
          )}

          {/* PASSWORD */}
          <div className="relative group">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#333] group-focus-within:text-magenta-500 transition-colors" />
            <input 
              type="password" required value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#111]/50 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white focus:border-magenta-500/50 outline-none transition-all placeholder:text-[#222]"
              placeholder="Access Key"
            />
          </div>

          {/* CONFIRM PASSWORD - Apare doar la Register */}
          {isRegister && (
            <div className="relative group animate-slideDown">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#333] group-focus-within:text-magenta-500 transition-colors" />
              <input 
                type="password" required value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#111]/50 border border-white/5 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white focus:border-magenta-500/50 outline-none transition-all placeholder:text-[#222]"
                placeholder="Confirm Key"
              />
            </div>
          )}

          {error && <p className="text-[10px] text-red-500 text-center font-bold uppercase tracking-widest animate-pulse">{error}</p>}

          <button type="submit" className="w-full bg-white text-black font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-magenta-500 hover:text-white transition-all active:scale-[0.98] mt-2 group shadow-lg">
            {isRegister ? 'INITIALIZE CREATION' : 'AUTHORIZE ACCESS'}
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        {/* Butonul de Switch Login/Register */}
        <div className="mt-8 text-center">
          <button 
            type="button"
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
            className="text-[10px] text-[#444] hover:text-magenta-500 font-bold uppercase tracking-widest transition-colors"
          >
            {isRegister ? 'Back to Login' : 'Need new Identity? Register'}
          </button>
        </div>

        <div className="mt-10 pt-6 border-t border-white/5 flex justify-center items-center text-[9px] text-[#1a1a1a] font-black uppercase tracking-[0.4em]">
            Status: System Operational
        </div>
      </div>
    </div>
  );
}