
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Zap, Brain, Target, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { useApp } from '../App';
import { GoogleGenAI } from "@google/genai";
import Markdown from 'react-markdown';

interface OptimizeRoutineModalProps {
  onClose: () => void;
}

export default function OptimizeRoutineModal({ onClose }: OptimizeRoutineModalProps) {
  const { habits, currentWeekInstances, user } = useApp();
  const [loading, setLoading] = useState(true);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateOptimization = async () => {
    setLoading(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      
      // Prepare data for context
      const habitContext = habits.map(h => ({
        name: h.name,
        interest: h.interest,
        streak: h.streak,
        schedule: h.schedule,
        goal: h.goal ? `${h.goal.target} ${h.goal.unit}` : 'Binary'
      }));

      const performanceContext = Object.entries(currentWeekInstances).map(([date, instances]) => ({
        date,
        completion: `${instances.filter(i => i.completed).length}/${instances.length}`
      }));

      const prompt = `
        You are an elite Performance Coach and Routine Architect. 
        Analyze the user's current habits and performance data to suggest a routine optimization.
        
        User Interests: ${user?.interests.join(', ')}
        Current Habits: ${JSON.stringify(habitContext)}
        Recent Performance: ${JSON.stringify(performanceContext)}
        
        Provide a concise, high-impact optimization plan. 
        Focus on:
        1. Habit Stacking: Suggest which habits to pair together.
        2. Timing: Suggest the best time of day for specific habits based on their type.
        3. Friction Reduction: Suggest one way to make the hardest habit easier.
        4. One new "Micro-Habit" to add that aligns with their interests.
        
        Keep the tone professional, motivating, and data-driven. Use Markdown formatting.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      setSuggestion(response.text || "No suggestion generated.");
    } catch (err) {
      console.error("Optimization error:", err);
      setError("Failed to generate optimization. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateOptimization();
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-slate-950/60 backdrop-blur-md animate-fade-in">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white dark:bg-dark-card w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-dark-border overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-8 border-b border-slate-100 dark:border-dark-border flex justify-between items-center bg-slate-50/50 dark:bg-white/[0.02]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-glow">
              <Sparkles size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white tracking-tight">Routine Architect</h2>
              <p className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.2em] mt-0.5">AI-Powered Optimization</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-dark-cardHover transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {loading ? (
            <div className="h-64 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                <Brain className="absolute inset-0 m-auto text-blue-500 animate-pulse" size={24} />
              </div>
              <div>
                <p className="font-bold text-slate-900 dark:text-white">Analyzing performance patterns...</p>
                <p className="text-xs text-slate-500 mt-1">Our AI is architecting your optimal flow.</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center text-red-500 mx-auto mb-4">
                <X size={32} />
              </div>
              <p className="text-slate-900 dark:text-white font-bold">{error}</p>
              <button 
                onClick={generateOptimization}
                className="mt-4 flex items-center gap-2 mx-auto text-blue-500 font-bold hover:underline"
              >
                <RefreshCw size={16} /> Try Again
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="prose dark:prose-invert prose-slate max-w-none">
                <div className="markdown-body">
                  <Markdown>{suggestion || ''}</Markdown>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                <div className="p-5 rounded-3xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/20">
                  <div className="flex items-center gap-3 mb-3 text-blue-600 dark:text-blue-400">
                    <Zap size={18} />
                    <span className="text-xs font-bold uppercase tracking-widest">Quick Win</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                    Pair your morning hydration with your first task to trigger immediate cognitive activation.
                  </p>
                </div>
                <div className="p-5 rounded-3xl bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/20">
                  <div className="flex items-center gap-3 mb-3 text-purple-600 dark:text-purple-400">
                    <Target size={18} />
                    <span className="text-xs font-bold uppercase tracking-widest">Focus Shift</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                    Move deep learning habits to the 10:00 AM window for peak neuroplasticity.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-slate-100 dark:border-dark-border bg-slate-50/50 dark:bg-white/[0.02] flex justify-end gap-4">
          <button 
            onClick={onClose}
            className="px-6 py-3 rounded-2xl text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-dark-cardHover transition-all"
          >
            Close
          </button>
          <button 
            onClick={onClose}
            className="px-8 py-3 rounded-2xl bg-slate-900 dark:bg-blue-600 text-white font-bold text-xs uppercase tracking-widest shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
          >
            Apply Suggestions <ArrowRight size={16} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
