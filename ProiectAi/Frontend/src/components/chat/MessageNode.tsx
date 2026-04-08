import { useEffect, useState } from 'react';
// 1. Am adăugat cuvântul "type" aici:
import type { MessageNode as MessageNodeType } from '../../store/useChatStore';
import ThinkingSteps from './ThinkingSteps';
import { Bot, User } from 'lucide-react';

interface Props {
  message: MessageNodeType;
}

export default function MessageNode({ message }: Props) {
  const isAI = message.role === 'ai';
  const isThinking = isAI && message.status === 'thinking';
  
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!isAI || isThinking) {
      setDisplayedText(message.content);
      return;
    }

    if (message.status === 'done' && displayedText !== message.content) {
      setIsTyping(true);
      let currentIndex = 0;
      
      const interval = setInterval(() => {
        if (currentIndex < message.content.length) {
          setDisplayedText((prev) => prev + message.content.charAt(currentIndex));
          currentIndex++;
        } else {
          clearInterval(interval);
          setIsTyping(false);
        }
      }, 15);

      return () => clearInterval(interval);
    }
    // 2. Îi spunem lui ESLint să ignore dependența displayedText ca să nu ne strice animația
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message.content, message.status, isAI, isThinking]);

  if (isThinking) {
    return <ThinkingSteps />;
  }

  return (
    <div className={`flex w-full mb-6 ${isAI ? 'justify-start' : 'justify-end'} animate-fadeIn`}>
      <div className={`flex max-w-[85%] gap-4 ${isAI ? 'flex-row' : 'flex-row-reverse'}`}>
        
        {/* Avatar - 3. Am schimbat flex-shrink-0 in shrink-0 */}
        <div className="shrink-0">
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ${
            isAI ? 'bg-[#111] border border-magenta-500/30 text-magenta-500' 
                 : 'bg-white text-black'
          }`}>
            {isAI ? <Bot size={20} /> : <User size={20} />}
          </div>
        </div>

        {/* Bubble Text */}
        <div className={`flex flex-col ${isAI ? 'items-start' : 'items-end'} justify-center`}>
          <div className={`px-5 py-3.5 rounded-3xl text-sm leading-relaxed ${
            isAI 
              ? 'bg-[#0a0a0a] border border-white/5 text-[#ddd] rounded-tl-sm' 
              : 'bg-white text-black rounded-tr-sm font-medium'
          }`}>
            {isAI ? displayedText : message.content}
            
            {/* Cursor */}
            {isTyping && (
              <span className="inline-block w-1.5 h-4 ml-1 bg-magenta-500 animate-pulse align-middle"></span>
            )}
          </div>
          
          <span className="text-[9px] text-[#444] uppercase tracking-widest mt-2 font-bold px-2">
            {isAI ? 'System_AI' : 'User_Auth'}
          </span>
        </div>

      </div>
    </div>
  );
}