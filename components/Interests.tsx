
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { InterestType, Habit } from '../types';
import { useApp } from '../App';
import { 
  Play, FileText, ArrowUpRight, Star, 
  TrendingUp, Activity, CheckCircle2, Lock, 
  BookOpen, Zap, Award, ExternalLink,
  Sparkles, Heart
} from 'lucide-react';

// Mock Content Database
const BASE_CONTENT: Record<string, { id: string; title: string; type: 'video' | 'article' | 'micro'; duration: string; completed: boolean }[]> = {
  [InterestType.HEALTH]: [
    { id: 'c1', title: "10 Minute Mobility Routine", type: "video", duration: "10 min", completed: false },
    { id: 'c2', title: "The Science of Sleep", type: "article", duration: "5 min read", completed: true },
    { id: 'c3', title: "Drink 500ml Water", type: "micro", duration: "Now", completed: false },
  ],
  [InterestType.FINANCE]: [
    { id: 'c4', title: "ETF Strategies for 2024", type: "article", duration: "8 min read", completed: false },
    { id: 'c5', title: "Market Recap: Weekly", type: "video", duration: "15 min", completed: false },
  ],
  [InterestType.PRODUCTIVITY]: [
    { id: 'c6', title: "Time Blocking 101", type: "article", duration: "4 min read", completed: false },
    { id: 'c7', title: "Clear Inbox", type: "micro", duration: "Est. 5 min", completed: false },
  ],
  [InterestType.LEARNING]: [
    { id: 'c8', title: "Mental Models for Decisions", type: "article", duration: "12 min read", completed: false },
  ],
  [InterestType.DETOX]: [
    { id: 'c9', title: "Digital Minimalism Guide", type: "article", duration: "10 min read", completed: false },
    { id: 'c10', title: "Phone-free Walk", type: "micro", duration: "20 min", completed: true },
  ]
};

const HEALTH_TIPS = [
  { title: "Hydration Jumpstart", text: "Drink a large glass of water immediately after waking up to rehydrate your brain and body." },
  { title: "The 20-20-20 Rule", text: "Every 20 minutes, look at something 20 feet away for 20 seconds to reduce eye strain." },
  { title: "Walking Meetings", text: "Take your next phone call while walking. Movement boosts creativity and alertness." },
  { title: "Eat the Rainbow", text: "Aim for 3 different colors of vegetables on your plate to ensure diverse micronutrient intake." },
  { title: "Digital Sunset", text: "Turn off screens 60 minutes before bed to improve melatonin production and sleep quality." },
  { title: "Box Breathing", text: "Inhale for 4s, hold for 4s, exhale for 4s, hold for 4s. Instantly reduces stress." },
  { title: "Morning Sunlight", text: "Get 10 minutes of direct sunlight within an hour of waking to set your circadian rhythm." },
];

// Helper to generate content for custom interests
const getGeneratedContent = (interest: string) => [
  { id: `gen_${interest}_1`, title: `Mastering ${interest}: Beginner's Guide`, type: 'article' as const, duration: '6 min read', completed: false },
  { id: `gen_${interest}_2`, title: `Daily ${interest} Practice`, type: 'micro' as const, duration: '15 min', completed: false },
  { id: `gen_${interest}_3`, title: `Top Trends in ${interest}`, type: 'video' as const, duration: '12 min', completed: false },
];

export default function Interests() {
  const { user, habits } = useApp();
  
  // Default to first interest or Health
  const [activeTab, setActiveTab] = useState<InterestType>(user?.interests[0] || InterestType.HEALTH);
  const [localContent, setLocalContent] = useState(BASE_CONTENT);

  // Sync active tab safely
  useEffect(() => {
    if (user && user.interests.length > 0 && !user.interests.includes(activeTab)) {
        setActiveTab(user.interests[0]);
    }
  }, [user]);

  // Derive Visible Interests
  const visibleInterests = user?.interests && user.interests.length > 0 
      ? user.interests 
      : [InterestType.HEALTH, InterestType.PRODUCTIVITY, InterestType.FINANCE];

  // Get Content (with fallback for custom)
  const content = localContent[activeTab] || getGeneratedContent(activeTab);

  // Calculate Stats for this Interest
  const interestHabits = habits.filter(h => h.interest === activeTab);
  const totalStreak = interestHabits.reduce((acc, h) => acc + h.streak, 0);
  const activeCount = interestHabits.length;
  // Leveling Logic: Level 1 = 0-6 days total streak, Level 2 = 7+...
  const level = Math.max(1, Math.floor(totalStreak / 7) + 1);
  const progressToNextLevel = ((totalStreak % 7) / 7) * 100;

  // Daily Tip Logic
  const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
  const dailyHealthTip = HEALTH_TIPS[dayOfYear % HEALTH_TIPS.length];

  const toggleContentComplete = (id: string) => {
    // Note: In a real app, this would persist to DB
    // Here we simulate local toggle if it exists in base, or ignore for generated
    if (localContent[activeTab]) {
      setLocalContent(prev => ({
        ...prev,
        [activeTab]: prev[activeTab].map(item => 
          item.id === id ? { ...item, completed: !item.completed } : item
        )
      }));
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      
      {/* 1. HERO HEADER */}
      <div className="relative overflow-hidden bg-navy-900 dark:bg-dark-card rounded-[3rem] p-10 text-white shadow-glow border border-white/5 dark:border-dark-border group transition-all duration-700">
        {/* Background Patterns */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3 group-hover:scale-110 transition-transform duration-1000" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] -translate-x-1/3 translate-y-1/3 group-hover:scale-125 transition-transform duration-1000" />

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
            <div className="col-span-2 space-y-4">
                <div className="flex items-center gap-3 mb-6">
                    <span className="bg-white/10 dark:bg-white/5 backdrop-blur-xl text-white/90 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border border-white/10">
                        {activeTab} Hub
                    </span>
                    <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-green-400">
                        <TrendingUp size={14} /> Top Focus Area
                    </span>
                </div>
                <h2 className="text-5xl font-display font-bold tracking-tight leading-tight">Level {level} <br />{activeTab} Master</h2>
                <p className="text-navy-100/70 dark:text-slate-400 font-medium text-lg max-w-md leading-relaxed tracking-tight">
                    You have {activeCount} active habits building your {activeTab.toLowerCase()} foundation. Keep consistent to level up.
                </p>
                
                {/* Level Progress */}
                <div className="mt-10 max-w-sm space-y-3">
                    <div className="flex justify-between text-[10px] font-black text-navy-200 dark:text-slate-500 uppercase tracking-[0.2em]">
                        <span>Lvl {level}</span>
                        <span>{Math.round(progressToNextLevel)}% to Lvl {level + 1}</span>
                    </div>
                    <div className="h-3 w-full bg-white/10 dark:bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${progressToNextLevel}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-blue-400 via-blue-500 to-purple-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]" 
                        />
                    </div>
                </div>
            </div>

            {/* Interest Badge */}
            <div className="hidden md:flex justify-end">
                <div className="w-44 h-44 bg-white/5 dark:bg-white/[0.02] rounded-[2.5rem] border border-white/10 flex flex-col items-center justify-center backdrop-blur-xl shadow-2xl group-hover:rotate-3 transition-transform duration-500">
                    <Award size={56} className="text-yellow-400 mb-3 drop-shadow-glow" />
                    <div className="text-4xl font-display font-bold tracking-tight">{totalStreak}</div>
                    <div className="text-[10px] font-black uppercase text-navy-200 dark:text-slate-500 tracking-[0.2em] mt-1">Total Days</div>
                </div>
            </div>
        </div>
      </div>

      {/* 2. TAB NAVIGATION */}
      <div className="flex overflow-x-auto no-scrollbar gap-3 pb-4 -mt-6 sticky top-20 z-20 bg-slate-50/80 dark:bg-dark-bg/80 backdrop-blur-xl py-4 px-2">
        {visibleInterests.map(type => (
          <button
            key={type}
            onClick={() => setActiveTab(type)}
            className={`px-8 py-4 rounded-2xl whitespace-nowrap text-sm font-bold transition-all duration-500 tracking-tight ${
              activeTab === type 
                ? 'bg-white dark:bg-dark-card text-navy-900 dark:text-white shadow-glass dark:shadow-dark-soft scale-105 border border-white/50 dark:border-dark-border' 
                : 'bg-transparent text-slate-400 dark:text-slate-500 hover:text-navy-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* 3. CONTENT FEED (LEFT COL) */}
        <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-display font-bold text-navy-900 dark:text-white flex items-center gap-3 tracking-tight">
                    <Zap size={24} className="text-yellow-500" /> Recommended For You
                </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {content.map((item) => (
                    <div 
                        key={item.id} 
                        className={`group relative overflow-hidden bg-white/60 dark:bg-dark-card backdrop-blur-xl p-7 rounded-[2.5rem] border transition-all duration-500 ${
                            item.completed 
                            ? 'border-green-100 dark:border-green-900/30 bg-green-50/20 dark:bg-green-900/10' 
                            : 'border-white/40 dark:border-dark-border hover:shadow-apple dark:hover:shadow-dark-soft cursor-pointer hover:-translate-y-1'
                        }`}
                        onClick={() => toggleContentComplete(item.id)}
                    >
                        <div className="flex items-start justify-between mb-6">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                                item.type === 'video' ? 'bg-red-50 dark:bg-red-900/20 text-red-500 group-hover:scale-110' :
                                item.type === 'article' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-500 group-hover:scale-110' : 
                                'bg-purple-50 dark:bg-purple-900/20 text-purple-500 group-hover:scale-110'
                            }`}>
                                {item.type === 'video' && <Play size={24} fill="currentColor" />}
                                {item.type === 'article' && <FileText size={24} />}
                                {item.type === 'micro' && <ArrowUpRight size={24} />}
                            </div>
                            {item.completed ? (
                                <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 p-2 rounded-full shadow-lg">
                                    <CheckCircle2 size={20} />
                                </div>
                            ) : (
                                <div className="opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-2 group-hover:translate-x-0">
                                    <div className="w-8 h-8 rounded-full border-2 border-slate-200 dark:border-white/10" />
                                </div>
                            )}
                        </div>
                        
                        <div className="space-y-2">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                                <span>{item.type}</span>
                                <span className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
                                <span>{item.duration}</span>
                            </div>
                            <h4 className={`font-display font-bold text-xl leading-tight transition-all duration-500 tracking-tight ${item.completed ? 'text-slate-400 dark:text-slate-600 line-through' : 'text-navy-900 dark:text-white group-hover:text-blue-500'}`}>
                                {item.title}
                            </h4>
                        </div>

                        {/* Hover Action */}
                        <div className="absolute bottom-6 right-6 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                            <span className="text-xs font-black uppercase tracking-widest text-blue-500 flex items-center gap-2">
                                {item.completed ? 'Undo' : 'Complete'} <ArrowUpRight size={16} />
                            </span>
                        </div>
                    </div>
                ))}

                {/* Locked Future Content */}
                <div className="bg-slate-50/50 dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/10 p-8 rounded-[2.5rem] flex flex-col items-center justify-center text-center gap-4 opacity-40 hover:opacity-100 transition-all duration-500 group">
                    <div className="w-14 h-14 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-600 group-hover:scale-110 transition-transform">
                        <Lock size={24} />
                    </div>
                    <div>
                        <h4 className="font-display font-bold text-slate-500 dark:text-slate-400 text-lg tracking-tight">Level {level + 1} Content</h4>
                        <p className="text-xs text-slate-400 dark:text-slate-600 mt-1 font-medium">Keep your streak to unlock more.</p>
                    </div>
                </div>
            </div>
        </div>

        {/* 4. ACTIVE HABITS SIDEBAR (RIGHT COL) */}
        <div className="space-y-8">
            
            {/* Daily Health Tip Widget */}
            {activeTab === InterestType.HEALTH && (
                <div className="bg-green-50/50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/20 p-8 rounded-[2.5rem] relative overflow-hidden shadow-glass dark:shadow-dark-soft group transition-all duration-500 hover:scale-[1.02]">
                    <div className="absolute top-0 right-0 opacity-10 transform translate-x-1/4 -translate-y-1/4 text-green-700 dark:text-green-400 group-hover:scale-110 transition-transform duration-1000">
                        <Heart size={160} fill="currentColor" />
                    </div>
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6 text-green-700 dark:text-green-400">
                            <div className="p-2 bg-green-200/50 dark:bg-green-400/20 rounded-full">
                                <Sparkles size={18} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Daily Health Tip</span>
                        </div>
                        <h4 className="font-display font-bold text-navy-900 dark:text-white text-2xl mb-3 tracking-tight">{dailyHealthTip.title}</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-medium tracking-tight">
                            {dailyHealthTip.text}
                        </p>
                    </div>
                </div>
            )}

            <h3 className="text-2xl font-display font-bold text-navy-900 dark:text-white flex items-center gap-3 tracking-tight">
                <Activity size={24} className="text-blue-500" /> Active Habits
            </h3>

            <div className="bg-white/60 dark:bg-dark-card backdrop-blur-xl rounded-[2.5rem] p-4 shadow-glass dark:shadow-dark-soft border border-white/40 dark:border-dark-border">
                {interestHabits.length > 0 ? (
                    <div className="space-y-2">
                        {interestHabits.map(h => (
                            <div key={h.id} className="p-5 flex items-center gap-5 hover:bg-slate-50 dark:hover:bg-white/5 transition-all duration-300 rounded-[1.5rem] group">
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:scale-110 transition-transform">
                                    <Activity size={20} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-base text-navy-900 dark:text-white tracking-tight">{h.name}</h4>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600 mt-0.5">{h.schedule}</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-xl font-display font-bold text-navy-900 dark:text-white tracking-tight">{h.streak}</div>
                                    <div className="text-[8px] font-black uppercase text-slate-400 dark:text-slate-600 tracking-widest">Streak</div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-10 text-center">
                        <p className="text-sm text-slate-400 dark:text-slate-600 font-medium">No active habits for {activeTab}.</p>
                        <button className="mt-4 text-xs font-black uppercase tracking-widest text-blue-500 hover:text-blue-600 transition-colors">Add Habit</button>
                    </div>
                )}
            </div>

            {/* Weekly Challenge Mini Card */}
            <div className="bg-gradient-to-br from-navy-900 to-slate-900 dark:from-dark-card dark:to-dark-bg rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl border border-white/5 group transition-all duration-500 hover:scale-[1.02]">
                 <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 group-hover:scale-150 transition-transform duration-1000" />
                 <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-4 text-yellow-400">
                        <Star size={20} fill="currentColor" className="drop-shadow-glow" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Weekly Challenge</span>
                    </div>
                    <p className="text-base font-medium leading-relaxed mb-6 tracking-tight text-white/90">
                        Complete all {activeTab} habits for 3 days in a row to earn the "Consistent" Badge.
                    </p>
                    <button className="w-full bg-white/10 dark:bg-white/5 hover:bg-white/20 dark:hover:bg-white/10 border border-white/10 rounded-2xl py-3 text-xs font-black uppercase tracking-widest transition-all">
                        View Progress
                    </button>
                 </div>
            </div>
        </div>

      </div>
    </div>
  );
}
