
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

// Initialize Gemini outside component to prevent re-initialization
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export default function GrowthChatbot() {
  const { user, habits, tasks } = useApp();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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

    // Check for API key
    if (!process.env.GEMINI_API_KEY) {
      const errorMessage: Message = {
        role: 'model',
        text: "I'm sorry, but the AI Coach is currently unavailable because the API key is missing. Please contact support or check your settings.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMessage, errorMessage]);
      return;
    }

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
          Your goal is to help ${user?.name || 'the user'} achieve their full potential.
          
          CURRENT CONTEXT:
          - User Interests: ${user?.interests?.join(', ') || 'General Growth'}
          - Active Habits: ${habits.map(h => h.name).join(', ') || 'None yet'}
          - Pending Tasks: ${tasks.filter(t => !t.completed).map(t => t.title).join(', ') || 'None'}
          
          Your advice should be actionable, psychological, and motivational. 
          Reference their specific habits and tasks when relevant to provide personalized coaching.
          Keep responses concise but impactful. Use markdown.`,
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
    } catch (error: any) {
      console.error("Gemini Error:", error);
      
      let errorText = "I encountered an error while processing your request. Please check your connection and try again.";
      
      if (error.message?.includes("API key not valid")) {
        errorText = "The AI Coach API key appears to be invalid. Please verify your configuration.";
      } else if (error.message?.includes("quota")) {
        errorText = "I've reached my message limit for now. Please try again in a little while.";
      }

      const errorMessage: Message = {
        role: 'model',
        text: errorText,
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
    <div className="flex flex-col h-[calc(100vh-12rem)] max-w-4xl mx-auto glass-card rounded-[2.5rem] overflow-hidden animate-fade-in border border-white/5">
      {/* Header */}
      <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center shadow-glow-blue overflow-hidden border border-white/10">
            <img 
              src="https://drive.google.com/thumbnail?id=1Cn2hUpBxHLJ_6QmG8JYxJ9mjAgpDJa5f&sz=w128" 
              alt="CORE AI" 
              className="w-8 h-8 object-contain"
              referrerPolicy="no-referrer"
              onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
            />
            <span className="hidden text-xs font-bold text-habithub-accent">CORE</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">{coachName}</h2>
            <p className="text-[10px] font-bold text-habithub-accent uppercase tracking-widest">Growth & Development</p>
          </div>
        </div>
        <button 
          onClick={clearChat}
          className="p-3 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all"
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
            <div className="w-20 h-20 rounded-[2rem] bg-white/5 flex items-center justify-center text-slate-500">
              <MessageSquare size={40} strokeWidth={1.5} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white">Start your growth journey</h3>
              <p className="text-sm text-slate-400 max-w-xs">Ask me about habit formation, productivity, or any area you want to develop.</p>
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
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden ${m.role === 'user' ? 'bg-habithub-accent text-white shadow-glow-blue' : 'bg-white/5 border border-white/10'}`}>
                  {m.role === 'user' ? <UserIcon size={18} /> : (
                    <>
                      <img 
                        src="https://drive.google.com/thumbnail?id=1Cn2hUpBxHLJ_6QmG8JYxJ9mjAgpDJa5f&sz=w128" 
                        alt="CORE" 
                        className="w-6 h-6 object-contain"
                        referrerPolicy="no-referrer"
                        onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                      />
                      <span className="hidden text-[10px] font-bold text-habithub-accent">CORE</span>
                    </>
                  )}
                </div>
                <div className={`p-4 rounded-3xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-habithub-accent text-white rounded-tr-none shadow-glow-blue' : 'bg-white/5 text-slate-200 rounded-tl-none border border-white/5'}`}>
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
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                <img 
                  src="https://drive.google.com/thumbnail?id=1Cn2hUpBxHLJ_6QmG8JYxJ9mjAgpDJa5f&sz=w128" 
                  alt="CORE" 
                  className="w-6 h-6 object-contain animate-pulse"
                  referrerPolicy="no-referrer"
                  onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                />
                <span className="hidden text-[10px] font-bold text-habithub-accent">CORE</span>
              </div>
              <div className="p-4 rounded-3xl bg-white/5 text-slate-400 rounded-tl-none border border-white/5 flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-xs font-bold uppercase tracking-widest">{coachName} is thinking...</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="p-6 border-t border-white/5 bg-white/5 backdrop-blur-xl">
        <div className="relative flex items-center gap-3">
          <input 
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask your growth coach..."
            className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-habithub-accent/20 focus:border-habithub-accent/30 transition-all placeholder:text-slate-500 text-white"
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="w-14 h-14 bg-habithub-accent text-white rounded-2xl flex items-center justify-center shadow-glow-blue hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
          >
            <Send size={20} />
          </button>
        </div>
        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest text-center mt-4">Powered by Gemini 3 Flash</p>
      </div>
    </div>
  );
}
