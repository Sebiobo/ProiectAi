import Sidebar from '../components/sidebar/Sidebar';
import MessageArea from '../components/chat/MessageArea';
import ChatInput from '../components/chat/ChatInput';
import WorkspacePanel from '../components/chat/WorkspacePanel';
import { useChatStore } from '../store/useChatStore';

export default function CoachChat() {
  const activeArtifact = useChatStore((state) => state.activeArtifact);

  return (
    // Layout-ul global flexibil, ecran complet, fundal negru profund
    <div className="flex h-screen bg-[#000000] text-[#ededed] font-sans overflow-hidden antialiased">
      
      {/* Bara Laterală Stânga */}
      <Sidebar />

      {/* Zona principală din Dreapta (care se va împărți) */}
      <div className="flex-1 flex overflow-hidden relative bg-[#000000]">
        
        {/* Zona de Chat (își ajustează lățimea fluid) */}
        <div className={`flex flex-col h-full transition-all duration-500 ease-in-out ${activeArtifact ? 'w-1/2' : 'w-full'}`}>
          
          {/* Header-ul minimalist al zonei de chat */}
          <header className="flex items-center justify-between px-6 py-4 border-b border-[#1f1f1f] shrink-0">
            <h2 className="text-sm font-medium text-[#888] tracking-tight">Terminal Conexiune AI</h2>
            <div className="px-2 py-1 bg-[#111] border border-[#222] rounded text-[10px] font-bold text-[#666]">
              MODEL: COACH-V1
            </div>
          </header>

          {/* Zona dinamică unde se desenează conversația */}
          <MessageArea />

          {/* Zona unde utilizatorul tastează */}
          <div className="p-6 pt-2 bg-gradient-to-t from-[#000000] via-[#000000] to-transparent shrink-0">
            <ChatInput />
          </div>
          
        </div>

        {/* Panoul Lateral de Lucru (Apare doar când avem un element activ) */}
        {activeArtifact && <WorkspacePanel />}

      </div>
      
    </div>
  );
}