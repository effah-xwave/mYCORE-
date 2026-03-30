
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality } from "@google/genai";
import Markdown from 'react-markdown';
import { 
  MapPin, Navigation, Search, Send, Loader2, 
  ExternalLink, Info, Compass, Map as MapIcon,
  ArrowRight, Clock, Star
} from 'lucide-react';

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

interface Message {
  role: 'user' | 'assistant';
  content: string;
  groundingChunks?: any[];
}

export default function MapsAgent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationError("Could not access your location. Results may be less accurate.");
        }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser.");
    }
  }, []);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: input,
        config: {
          tools: [{ googleMaps: {} }],
          toolConfig: {
            retrievalConfig: {
              latLng: location ? {
                latitude: location.lat,
                longitude: location.lng
              } : undefined
            }
          }
        },
      });

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.text || "I couldn't find any information for that request.",
        groundingChunks: response.candidates?.[0]?.groundingMetadata?.groundingChunks
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Gemini API Error:", error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Sorry, I encountered an error while searching for that information. Please try again." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    { label: "Coffee nearby", icon: "☕" },
    { label: "Best Italian restaurants", icon: "🍝" },
    { label: "Parks for a walk", icon: "🌳" },
    { label: "Directions to downtown", icon: "🚗" },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-slate-100 dark:bg-dark-bg rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-dark-border shadow-soft">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Compass size={24} />
          </div>
          <div>
            <h2 className="text-xl font-display font-bold text-slate-900 dark:text-white">Navigator Agent</h2>
            <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
              <MapPin size={12} />
              {location ? `Connected: ${location.lat.toFixed(2)}, ${location.lng.toFixed(2)}` : locationError || "Locating..."}
            </p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto space-y-8">
            <div className="w-20 h-20 rounded-full bg-blue-500/5 flex items-center justify-center text-blue-500 animate-pulse">
              <MapIcon size={40} />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Where to next?</h3>
              <p className="text-sm text-slate-500">Ask me about nearby places, routes, or specific locations. I use real-time Google Maps data to help you navigate.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full">
              {quickPrompts.map((prompt) => (
                <button
                  key={prompt.label}
                  onClick={() => { setInput(prompt.label); handleSend(); }}
                  className="p-4 rounded-2xl bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border hover:border-blue-500 transition-all text-left group"
                >
                  <span className="text-xl mb-2 block">{prompt.icon}</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-blue-500">{prompt.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-3xl p-5 ${
              msg.role === 'user' 
                ? 'bg-slate-800 text-white dark:bg-white dark:text-black shadow-lg' 
                : 'bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border shadow-sm'
            }`}>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <Markdown>{msg.content}</Markdown>
              </div>

              {msg.groundingChunks && msg.groundingChunks.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-dark-border space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Sources & Places</p>
                  <div className="flex flex-wrap gap-2">
                    {msg.groundingChunks.map((chunk: any, cIdx: number) => {
                      const mapsUri = chunk.maps?.uri;
                      const title = chunk.maps?.title || "View on Maps";
                      const reviewSnippets = chunk.maps?.placeAnswerSources?.reviewSnippets;
                      
                      if (!mapsUri) return null;
                      return (
                        <div key={cIdx} className="flex flex-col gap-2">
                          <a 
                            href={mapsUri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-500/5 hover:bg-blue-500/10 text-blue-500 text-[11px] font-bold border border-blue-500/20 transition-all w-fit"
                          >
                            <MapPin size={12} />
                            {title}
                            <ExternalLink size={10} />
                          </a>
                          {reviewSnippets && reviewSnippets.length > 0 && (
                            <div className="pl-4 border-l-2 border-slate-100 dark:border-dark-border space-y-1">
                              {reviewSnippets.map((snippet: string, sIdx: number) => (
                                <p key={sIdx} className="text-[10px] text-slate-500 italic">"{snippet}"</p>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-3xl p-5 flex items-center gap-3">
              <Loader2 size={18} className="animate-spin text-blue-500" />
              <span className="text-sm font-medium text-slate-500">Searching Google Maps...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white dark:bg-dark-card border-t border-slate-200 dark:border-dark-border">
        <form onSubmit={handleSend} className="relative flex items-center gap-3">
          <div className="relative flex-1">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about places, routes, or directions..."
              className="w-full bg-slate-100 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-2xl px-5 py-4 text-sm outline-none focus:border-blue-500 transition-all text-slate-900 dark:text-white font-medium pr-12"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
              <Search size={18} />
            </div>
          </div>
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-14 h-14 rounded-2xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white flex items-center justify-center transition-all shadow-glow"
          >
            {isLoading ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
          </button>
        </form>
      </div>
    </div>
  );
}
