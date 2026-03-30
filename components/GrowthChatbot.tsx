
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User as UserIcon, Sparkles, Loader2, Trash2, MessageSquare } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { useApp } from '../App';

interface Message {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export default function GrowthChatbot() {
  const { user } = useApp();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize Gemini
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const coachName = user?.coachName || 'CORE AI Coach';

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      role: 'user',
      text: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: `You are a world-class growth and development coach named ${coachName}. 
          Your goal is to help ${user?.name || 'the user'} achieve their full potential by providing actionable advice, psychological insights, and motivational support. 
          You are empathetic, insightful, and always focused on practical steps for improvement. 
          You can help with habit formation, productivity, emotional intelligence, and career growth.
          Keep your responses concise but impactful. Use markdown for better readability.`,
        },
        // We'll pass the history to the chat
        history: messages.map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        }))
      });

      const response = await chat.sendMessage({ message: input });
      const text = response.text;

      const botMessage: Message = {
        role: 'model',
        text: text || "I'm sorry, I couldn't process that. Let's try again.",
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Gemini Error:", error);
      const errorMessage: Message = {
        role: 'model',
        text: "I encountered an error while processing your request. Please check your connection and try again.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const clearChat = () => {
    if (confirm("Are you sure you want to clear the conversation?")) {
      setMessages([]);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-4xl mx-auto bg-white dark:bg-dark-card backdrop-blur-xl rounded-[2.5rem] shadow-apple border border-slate-200 dark:border-dark-border overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 dark:border-dark-border flex items-center justify-between bg-slate-50/50 dark:bg-dark-bg/30">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white dark:bg-dark-card flex items-center justify-center shadow-glow overflow-hidden border border-slate-200 dark:border-dark-border">
            <img 
              src="https://drive.google.com/thumbnail?id=1Cn2hUpBxHLJ_6QmG8JYxJ9mjAgpDJa5f&sz=w128" 
              alt="CORE AI" 
              className="w-8 h-8 object-contain"
              referrerPolicy="no-referrer"
              onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
            />
            <span className="hidden text-xs font-bold text-blue-500">CORE</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{coachName}</h2>
            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">Growth & Development</p>
          </div>
        </div>
        <button 
          onClick={clearChat}
          className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/10 rounded-2xl transition-all"
        >
          <Trash2 size={20} />
        </button>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-60">
            <div className="w-20 h-20 rounded-[2rem] bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400">
              <MessageSquare size={40} strokeWidth={1.5} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Start your growth journey</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">Ask me about habit formation, productivity, or any area you want to develop.</p>
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex gap-3 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden ${m.role === 'user' ? 'bg-slate-900 dark:bg-blue-600 text-white' : 'bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border'}`}>
                  {m.role === 'user' ? <UserIcon size={18} /> : (
                    <>
                      <img 
                        src="https://drive.google.com/thumbnail?id=1Cn2hUpBxHLJ_6QmG8JYxJ9mjAgpDJa5f&sz=w128" 
                        alt="CORE" 
                        className="w-6 h-6 object-contain"
                        referrerPolicy="no-referrer"
                        onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                      />
                      <span className="hidden text-[10px] font-bold text-blue-500">CORE</span>
                    </>
                  )}
                </div>
                <div className={`p-4 rounded-3xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-slate-900 dark:bg-blue-600 text-white rounded-tr-none' : 'bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-white/5'}`}>
                  <div className="markdown-body prose dark:prose-invert prose-sm max-w-none">
                    <ReactMarkdown>
                      {m.text}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border flex items-center justify-center shrink-0 overflow-hidden">
                <img 
                  src="https://drive.google.com/thumbnail?id=1Cn2hUpBxHLJ_6QmG8JYxJ9mjAgpDJa5f&sz=w128" 
                  alt="CORE" 
                  className="w-6 h-6 object-contain animate-pulse"
                  referrerPolicy="no-referrer"
                  onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                />
                <span className="hidden text-[10px] font-bold text-blue-500">CORE</span>
              </div>
              <div className="p-4 rounded-3xl bg-slate-50 dark:bg-white/5 text-slate-400 rounded-tl-none border border-slate-100 dark:border-white/5 flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-xs font-bold uppercase tracking-widest">{coachName} is thinking...</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="p-6 border-t border-slate-100 dark:border-dark-border bg-slate-50/50 dark:bg-dark-bg/30">
        <div className="relative flex items-center gap-3">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask your growth coach..."
            className="flex-1 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 transition-all placeholder:text-slate-400 text-slate-900 dark:text-white"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="w-14 h-14 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
          >
            <Send size={20} />
          </button>
        </div>
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest text-center mt-4">Powered by Gemini 3 Flash</p>
      </div>
    </div>
  );
}
