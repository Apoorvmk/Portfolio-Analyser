import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Loader2, 
  Sparkles, 
  User, 
  Bot,
  ChevronRight,
  RefreshCw,
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { chatWithReport } from '../services/api';
import { usePortfolio } from '../context/PortfolioContext';

export default function Advisor() {
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
      console.error("Chat failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#050505]">
      {/* Header */}
      <header className="p-8 border-b border-white/5 bg-[#0a0a0a]/50 backdrop-blur-xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20">
            <MessageSquare className="text-purple-500" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold font-['Outfit'] text-white">Strategy Advisor</h1>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Advanced Narrative Engine</span>
            </div>
          </div>
        </div>
        {report && (
          <div className="px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl text-[10px] font-bold text-blue-400 uppercase tracking-widest">
            Context: {report.selected_fund_name}
          </div>
        )}
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-8 custom-scrollbar">
        {!report ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[40px]">
              <Search size={48} className="text-gray-700" />
            </div>
            <div className="max-w-xs space-y-2">
               <h3 className="text-xl font-bold text-white font-['Outfit']">Awaiting Context</h3>
               <p className="text-sm text-gray-500 leading-relaxed">Please run a portfolio analysis to provide the advisor with the necessary data to help you.</p>
            </div>
          </div>
        ) : (
          <>
            {chatHistory.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto p-8 rounded-[32px] bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-white/10 text-center"
              >
                <Sparkles className="text-blue-400 mx-auto mb-4" size={32} />
                <h2 className="text-xl font-bold text-white mb-2">Hello! I'm your Strategy Advisor.</h2>
                <p className="text-gray-400 text-sm leading-relaxed">
                  I've processed your analysis for the <b>{report.selected_fund_name}</b> benchmark. 
                  Ask me about your sector gaps, risk levels, or optimization tips.
                </p>
              </motion.div>
            )}

            <div className="max-w-3xl mx-auto space-y-6">
              {chatHistory.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={cn(
                    "flex gap-4 p-6 rounded-[28px] transition-all",
                    msg.role === 'user' 
                      ? "bg-blue-600 ml-12 text-white rounded-tr-none shadow-lg shadow-blue-600/10" 
                      : "bg-[#0d0d0d] border border-white/5 mr-12 text-gray-300 rounded-tl-none"
                  )}
                >
                  <div className={cn(
                    "p-2 h-fit rounded-xl shrink-0",
                    msg.role === 'user' ? "bg-white/10" : "bg-purple-500/10 text-purple-400"
                  )}>
                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <div className="flex gap-4 p-6 rounded-[28px] bg-[#0d0d0d] border border-white/5 mr-12 w-fit">
                   <div className="p-2 h-fit rounded-xl bg-purple-500/10 text-purple-400">
                    <Bot size={16} />
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 size={14} className="animate-spin" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </>
        )}
      </div>

      {/* Input Area */}
      <footer className="p-8 bg-[#0a0a0a] border-t border-white/5">
        <div className="max-w-3xl mx-auto relative group">
          <input
            type="text"
            className="w-full bg-white/[0.03] border border-white/5 rounded-[24px] pl-6 pr-16 py-5 text-sm outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white placeholder:text-gray-700"
            placeholder={report ? "Ask about your diversification strategy..." : "Unlock chat by running analysis"}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={!report || loading}
          />
          <button
            onClick={handleSend}
            disabled={!report || loading || !message.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-20 text-white rounded-2xl transition-all shadow-lg shadow-blue-600/20"
          >
            <Send size={18} />
          </button>
        </div>
      </footer>
    </div>
  );
}
