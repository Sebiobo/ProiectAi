import { useState } from 'react';
import './CoachChat.css'; // Am importat fișierul de CSS creat de tine

const MOCK_ANSWERS: Record<string, string> = {
  "salut": "Salut! Sunt AI Coach-ul tău. Te pot ajuta să identifici materiile potrivite pentru tine. Ce te pasionează?",
  "vreau sa fac site-uri": "Super! Atunci îți recomand să te concentrezi pe materiile: Programare Web, Structuri de Date și Baze de Date.",
  "mi se pare greu la mate": "E perfect normal! Matematica cere exercițiu. Încearcă să te axezi pe algebra liniară, te va ajuta mult și la algoritmii de AI mai târziu.",
};

export default function CoachChat() {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Salut! Sunt asistentul tău virtual. Cu ce te pot ajuta astăzi?' }
  ]);
  const [inputValue, setInputValue] = useState('');

  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;

    const newMessages = [...messages, { sender: 'student', text: inputValue }];
    setMessages(newMessages);

    const lowerCaseInput = inputValue.toLowerCase().trim();
    const aiResponse = MOCK_ANSWERS[lowerCaseInput] || "Scuze, momentan sunt în faza de testare și știu să răspund doar la anumite întrebări (ex: 'salut', 'vreau sa fac site-uri').";

    setTimeout(() => {
      setMessages((prevMessages) => [
        ...prevMessages, 
        { sender: 'ai', text: aiResponse }
      ]);
    }, 500);

    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="chat-container">
      <h2 className="chat-title">AI Coach Chat</h2>
      
      <div className="messages-area">
        {messages.map((msg, index) => (
          <div 
            key={index} 
            // Aici folosim un template literal pentru a pune clasa de bază + clasa specifică sender-ului
            className={`message-bubble ${msg.sender === 'student' ? 'message-student' : 'message-ai'}`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div className="input-area">
        <input 
          type="text" 
          className="chat-input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Scrie un mesaj..." 
        />
        <button 
          className="chat-send-btn"
          onClick={handleSendMessage}
        >
          Trimite
        </button>
      </div>
    </div>
  );
}