import Sidebar from '../components/sidebar/Sidebar';
import MessageArea from '../components/chat/MessageArea';
import ChatInput from '../components/chat/ChatInput';

export default function CoachChat() {
  return (
    // Layout-ul global flexibil, ecran complet, fundal negru profund
    <div className="flex h-screen bg-[#000000] text-[#ededed] font-sans overflow-hidden antialiased">
      
      {/* Bara Laterală Stânga */}
      <Sidebar />

      {/* Zona principală din Dreapta */}
      <div className="flex-1 flex flex-col relative h-full bg-[#000000]">
        
        {/* Header-ul minimalist al zonei de chat */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-[#1f1f1f]">
          <h2 className="text-sm font-medium text-[#888] tracking-tight">Terminal Conexiune AI</h2>
          {/* Aici putem pune în viitor setări de model (ex: GPT-4, Claude 3) */}
          <div className="px-2 py-1 bg-[#111] border border-[#222] rounded text-[10px] font-bold text-[#666]">
            MODEL: COACH-V1
          </div>
        </header>

        {/* Zona dinamică unde se desenează conversația */}
        <MessageArea />

        {/* Zona unde utilizatorul tastează și invocă șabloanele */}
        <div className="p-6 pt-2 bg-linear-to-t from-[#000000] via-[#000000] to-transparent shrink-0">
          <ChatInput />
        </div>
        
      </div>
      
    </div>
  );
}