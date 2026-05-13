import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Loader2, 
  User, 
  Bot,
  Trash2
} from 'lucide-react';
import { chatWithReport } from '../services/api';
import { usePortfolio } from '../context/PortfolioContext';

export default function Chatbot() {
  const { report, chatHistory, setChatHistory } = usePortfolio();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, loading]);

  const handleSend = async () => {
    if (!message.trim() || !report || loading) return;
    const userMessage = { role: 'user', content: message };
    setChatHistory(prev => [...prev, userMessage]);
    setMessage('');
    setLoading(true);
    try {
      const response = await chatWithReport({
        message: message,
        conversation_history: chatHistory,
        report: report
      });
      setChatHistory(prev => [...prev, { role: 'assistant', content: response.assistant_response }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'assistant', content: "Error processing request." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-[#0f172a] text-white">
      <header className="px-6 py-4 border-b border-[#334155] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquare className="text-blue-500" />
          <h1 className="font-bold">AI Strategy Assistant</h1>
        </div>
        <button onClick={() => setChatHistory([])} className="text-gray-500 hover:text-red-500">
          <Trash2 size={18} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {!report ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
            <Bot size={48} className="mb-4" />
            <p>Please run a portfolio analysis first.</p>
          </div>
        ) : (
          <>
            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-blue-600' : 'bg-[#1e293b]'}`}>
                  {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                </div>
                <div className={`p-4 rounded-xl max-w-[80%] ${msg.role === 'user' ? 'bg-blue-600' : 'bg-[#1e293b]'}`}>
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#1e293b]">
                  <Bot size={16} />
                </div>
                <div className="p-4 rounded-xl bg-[#1e293b] flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" />
                  <span className="text-xs">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </>
        )}
      </div>

      <footer className="p-6 border-t border-[#334155]">
        <div className="flex gap-2">
          <input
            type="text"
            className="flex-1 bg-[#1e293b] border border-[#334155] rounded-lg px-4 py-3 outline-none focus:border-blue-500"
            placeholder="Ask about your strategy..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={!report || loading}
          />
          <button onClick={handleSend} disabled={!report || loading} className="bg-blue-600 p-3 rounded-lg hover:bg-blue-500 disabled:opacity-50">
            <Send size={18} />
          </button>
        </div>
      </footer>
    </div>
  );
}
