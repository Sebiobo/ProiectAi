import Sidebar from '../components/sidebar/Sidebar';
import MessageArea from '../components/chat/MessageArea';
import ChatInput from '../components/chat/ChatInput';
import WorkspacePanel from '../components/chat/WorkspacePanel';
import { useChatStore } from '../store/useChatStore';
import { BookOpen, BarChart3, HelpCircle, GraduationCap } from 'lucide-react';

export default function CoachChat() {
  const activeArtifact = useChatStore((state) => state.activeArtifact);
  const selectedYear = useChatStore((state) => state.selectedYear);
  const selectedSubject = useChatStore((state) => state.selectedSubject);

  return (
    <div className="relative flex h-screen bg-background text-foreground font-sans overflow-hidden">
      {/* Background Grid Tehnic (definit in index.css) */}
      <div className="bg-grid-pattern" />

      {/* Coloana 1: Sidebar (Navigare Ani & Materii) */}
      <Sidebar />

      {/* Container Principal pentru Coloanele 2 și 3 */}
      <main className="flex-1 flex overflow-hidden relative z-10">
        
        {/* Coloana 2: Zona de Chat (Fluidă) */}
        <div className={`flex flex-col h-full border-r border-zinc-800/50 transition-all duration-500 ease-in-out ${activeArtifact ? 'w-1/2' : 'flex-1'}`}>
          
          {/* Header Chat - Context Academic */}
          <header className="h-[73px] flex items-center justify-between px-8 border-b border-zinc-800/50 bg-background/50 backdrop-blur-md shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-zinc-900 border border-zinc-800 rounded-lg">
                <GraduationCap size={18} className="text-zinc-400" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-zinc-100 tracking-tight">
                  {selectedSubject || 'Asistent General'}
                </h2>
                <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em] font-medium">
                  Anul {selectedYear} • Sesiune Activă
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1 bg-zinc-900/50 border border-zinc-800 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Neural v4.0</span>
              </div>
            </div>
          </header>

          {/* Zona de Mesaje */}
          <MessageArea />

          {/* Input Chat */}
          <div className="p-6 bg-gradient-to-t from-background via-background to-transparent">
            <ChatInput />
          </div>
        </div>

        {/* Coloana 3: Panou Lateral (Resources sau Workspace) */}
        <div className={`${activeArtifact ? 'w-1/2' : 'w-[320px]'} h-full transition-all duration-500 ease-in-out hidden lg:block`}>
          {activeArtifact ? (
            <WorkspacePanel />
          ) : (
            <DefaultResourcesPanel />
          )}
        </div>
      </main>
    </div>
  );
}

/**
 * Componentă internă pentru panoul de resurse implicit (Coloana 3)
 * Apare atunci când nu este deschis un Artifact de cod.
 */
function DefaultResourcesPanel() {
  const documents = useChatStore((state) => state.documents);
  const deleteDocument = useChatStore((state) => state.deleteDocument);

  return (
    <div className="flex flex-col h-full bg-zinc-950/30 backdrop-blur-sm p-6 overflow-y-auto custom-scrollbar animate-in">
      <div className="space-y-8">
        
        {/* Secțiunea FAQ */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle size={16} className="text-zinc-500" />
            <h3 className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em]">Întrebări Frecvente</h3>
          </div>
          <div className="space-y-2">
            {['Structură examen', 'Resurse bibliografice', 'Metodă calcul notă'].map((q) => (
              <button 
                key={q}
                className="w-full text-left p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-colors group"
              >
                <span className="text-xs text-zinc-300 group-hover:text-zinc-100 transition-colors">{q}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Secțiunea Resurse */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={16} className="text-zinc-500" />
            <h3 className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em]">Materiale Suport</h3>
          </div>
          <div className="space-y-3">
            {documents && documents.length > 0 ? (
              documents.map((doc: any) => (
                <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/30 border border-zinc-800/50">
                  <div className="flex flex-col min-w-0 flex-1 pr-2">
                    <span className="text-xs text-zinc-300 font-medium truncate" title={doc.filename}>
                      {doc.filename}
                    </span>
                    <span className="text-[9px] text-zinc-500">
                      Status: <span className={doc.status === 'processed' ? 'text-emerald-500' : 'text-amber-500'}>{doc.status}</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[9px] font-bold text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded uppercase">
                      {doc.file_type ? doc.file_type.split('/')[1]?.toUpperCase() : 'PDF'}
                    </span>
                    <button 
                      onClick={() => deleteDocument(doc.id)}
                      className="text-[9px] text-red-400 hover:text-red-300 hover:bg-red-500/10 px-1.5 py-0.5 rounded transition-all font-bold"
                      title="Șterge Document"
                    >
                      Șterge
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-zinc-800 text-center text-zinc-500">
                <p className="text-xs">Niciun document încărcat în această sesiune.</p>
                <p className="text-[10px] text-zinc-600 mt-1">Atașează un fișier folosind butonul din chat pentru a-l încărca.</p>
              </div>
            )}
          </div>
        </section>

        {/* Statistici Sesiune */}
        <section className="pt-6 border-t border-zinc-800/50">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={16} className="text-zinc-500" />
            <h3 className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em]">Analiză Sesiune</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 text-center">
              <div className="text-xl font-black text-zinc-100">12</div>
              <div className="text-[9px] text-zinc-500 uppercase font-bold mt-1 tracking-tighter">Concepte Clarificate</div>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 text-center">
              <div className="text-xl font-black text-zinc-100">85%</div>
              <div className="text-[9px] text-zinc-500 uppercase font-bold mt-1 tracking-tighter">Progres Materie</div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}