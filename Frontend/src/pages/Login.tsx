import { useState } from 'react';
import { useChatStore } from '../store/useChatStore';
import { registerUser } from '../services/authService';
import { Lock, User, ShieldCheck, Cpu, Mail, UserPlus, ArrowRight, Loader } from 'lucide-react';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const login = useChatStore((state) => state.login);

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        if (password !== confirmPassword) {
          setError('Parolele nu coincid.');
          return;
        }
        await registerUser({ email, full_name: fullName, password });
        setIsRegister(false);
        setFullName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      } else {
        await login(email, password);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Eroare necunoscută.');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsRegister(!isRegister);
    setError('');
    setFullName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="h-screen w-full bg-background flex items-center justify-center p-4 overflow-hidden relative">

      <div className="bg-grid-pattern opacity-50" />

      <div className="w-full max-w-md bg-zinc-950/80 backdrop-blur-2xl border border-zinc-800 rounded-[2rem] p-10 shadow-2xl z-10 relative animate-in">

        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mb-6 shadow-inner transition-all duration-500">
            {isRegister ? <UserPlus size={32} className="text-zinc-300" /> : <ShieldCheck size={32} className="text-zinc-300" />}
          </div>
          <h1 className="text-2xl font-black text-zinc-100 tracking-tight">
            {isRegister ? 'Înregistrare Sistem' : 'CAMPUS MIND'}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <Cpu size={12} className="text-zinc-500" />
            <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-bold">
              {isRegister ? 'Enrollment Protocol' : 'Secured Access'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* FULL NAME — doar la înregistrare */}
          {isRegister && (
            <div className="relative group animate-in">
              <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-zinc-300 transition-colors" />
              <input
                type="text" required value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3.5 pl-11 pr-4 text-sm text-zinc-100 focus:border-zinc-600 outline-none transition-all placeholder:text-zinc-600 font-medium"
                placeholder="Nume complet"
              />
            </div>
          )}

          {/* EMAIL */}
          <div className="relative group">
            <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-zinc-300 transition-colors" />
            <input
              type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3.5 pl-11 pr-4 text-sm text-zinc-100 focus:border-zinc-600 outline-none transition-all placeholder:text-zinc-600 font-medium"
              placeholder="Adresă email"
            />
          </div>

          {/* PASSWORD */}
          <div className="relative group">
            <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-zinc-300 transition-colors" />
            <input
              type="password" required value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3.5 pl-11 pr-4 text-sm text-zinc-100 focus:border-zinc-600 outline-none transition-all placeholder:text-zinc-600 font-medium"
              placeholder="Parolă acces"
            />
          </div>

          {/* CONFIRM PASSWORD — doar la înregistrare */}
          {isRegister && (
            <div className="relative group animate-in">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-zinc-300 transition-colors" />
              <input
                type="password" required value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3.5 pl-11 pr-4 text-sm text-zinc-100 focus:border-zinc-600 outline-none transition-all placeholder:text-zinc-600 font-medium"
                placeholder="Confirmă parolă"
              />
            </div>
          )}

          {error && (
            <p className="text-[11px] text-red-400 text-center font-bold bg-red-500/10 border border-red-500/20 py-2 rounded-lg animate-in">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-zinc-100 text-zinc-950 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-white transition-all active:scale-[0.98] mt-4 shadow-lg group disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading
              ? <Loader size={16} className="animate-spin" />
              : (
                <>
                  {isRegister ? 'INIȚIALIZEAZĂ CONT' : 'AUTORIZARE'}
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )
            }
          </button>
        </form>

        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={switchMode}
            className="text-[11px] text-zinc-500 hover:text-zinc-300 font-bold uppercase tracking-widest transition-colors"
          >
            {isRegister ? 'Înapoi la Autentificare' : 'Creare Cont Nou'}
          </button>
        </div>

        <div className="mt-10 pt-6 border-t border-zinc-800/50 flex justify-center items-center gap-2 text-[9px] text-zinc-600 font-bold uppercase tracking-[0.3em]">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          System Operational
        </div>
      </div>
    </div>
  );
}
