import React, { useState, useEffect } from "react";
import { InterestType, Habit } from "../types";
import { useApp } from "../App";
import {
  Play,
  FileText,
  ArrowUpRight,
  Star,
  TrendingUp,
  Activity,
  CheckCircle2,
  Lock,
  BookOpen,
  Zap,
  Award,
  ExternalLink,
  Sparkles,
  Heart,
  Target,
  ChevronRight,
  ShieldCheck,
  Repeat,
} from "lucide-react";

// Mock Content Database
const BASE_CONTENT: Record<
  string,
  {
    id: string;
    title: string;
    type: "video" | "article" | "micro";
    duration: string;
    completed: boolean;
  }[]
> = {
  [InterestType.HEALTH]: [
    {
      id: "c1",
      title: "10 Minute Mobility Routine",
      type: "video",
      duration: "10 min",
      completed: false,
    },
    {
      id: "c2",
      title: "The Science of Sleep",
      type: "article",
      duration: "5 min read",
      completed: true,
    },
    {
      id: "c3",
      title: "Drink 500ml Water",
      type: "micro",
      duration: "Now",
      completed: false,
    },
  ],
  [InterestType.FINANCE]: [
    {
      id: "c4",
      title: "ETF Strategies for 2024",
      type: "article",
      duration: "8 min read",
      completed: false,
    },
    {
      id: "c5",
      title: "Market Recap: Weekly",
      type: "video",
      duration: "15 min",
      completed: false,
    },
  ],
  [InterestType.PRODUCTIVITY]: [
    {
      id: "c6",
      title: "Time Blocking 101",
      type: "article",
      duration: "4 min read",
      completed: false,
    },
    {
      id: "c7",
      title: "Clear Inbox",
      type: "micro",
      duration: "Est. 5 min",
      completed: false,
    },
  ],
  [InterestType.LEARNING]: [
    {
      id: "c8",
      title: "Mental Models for Decisions",
      type: "article",
      duration: "12 min read",
      completed: false,
    },
  ],
  [InterestType.DETOX]: [
    {
      id: "c9",
      title: "Digital Minimalism Guide",
      type: "article",
      duration: "10 min read",
      completed: false,
    },
    {
      id: "c10",
      title: "Phone-free Walk",
      type: "micro",
      duration: "20 min",
      completed: true,
    },
  ],
};

const HEALTH_TIPS = [
  {
    title: "Hydration Jumpstart",
    text: "Drink a large glass of water immediately after waking up to rehydrate your brain and body.",
  },
  {
    title: "The 20-20-20 Rule",
    text: "Every 20 minutes, look at something 20 feet away for 20 seconds to reduce eye strain.",
  },
  {
    title: "Walking Meetings",
    text: "Take your next phone call while walking. Movement boosts creativity and alertness.",
  },
  {
    title: "Eat the Rainbow",
    text: "Aim for 3 different colors of vegetables on your plate to ensure diverse micronutrient intake.",
  },
  {
    title: "Digital Sunset",
    text: "Turn off screens 60 minutes before bed to improve melatonin production and sleep quality.",
  },
  {
    title: "Box Breathing",
    text: "Inhale for 4s, hold for 4s, exhale for 4s, hold for 4s. Instantly reduces stress.",
  },
  {
    title: "Morning Sunlight",
    text: "Get 10 minutes of direct sunlight within an hour of waking to set your circadian rhythm.",
  },
];

// Helper to generate content for custom interests
const getGeneratedContent = (interest: string) => [
  {
    id: `gen_${interest}_1`,
    title: `Mastering ${interest}: Beginner's Guide`,
    type: "article" as const,
    duration: "6 min read",
    completed: false,
  },
  {
    id: `gen_${interest}_2`,
    title: `Daily ${interest} Practice`,
    type: "micro" as const,
    duration: "15 min",
    completed: false,
  },
  {
    id: `gen_${interest}_3`,
    title: `Top Trends in ${interest}`,
    type: "video" as const,
    duration: "12 min",
    completed: false,
  },
];

export default function Interests() {
  const { user, habits } = useApp();

  // Default to first interest or Health
  const [activeTab, setActiveTab] = useState<InterestType>(
    user?.interests[0] || InterestType.HEALTH,
  );
  const [localContent, setLocalContent] = useState(BASE_CONTENT);

  // Sync active tab safely
  useEffect(() => {
    if (
      user &&
      user.interests.length > 0 &&
      !user.interests.includes(activeTab)
    ) {
      setActiveTab(user.interests[0]);
    }
  }, [user]);

  // Derive Visible Interests
  const visibleInterests =
    user?.interests && user.interests.length > 0
      ? user.interests
      : [InterestType.HEALTH, InterestType.PRODUCTIVITY, InterestType.FINANCE];

  // Get Content (with fallback for custom)
  const content = localContent[activeTab] || getGeneratedContent(activeTab);

  // Calculate Stats for this Interest
  const interestHabits = habits.filter((h) => h.interest === activeTab);
  const totalStreak = interestHabits.reduce((acc, h) => acc + h.streak, 0);
  const activeCount = interestHabits.length;
  // Leveling Logic: Level 1 = 0-6 days total streak, Level 2 = 7+...
  const level = Math.max(1, Math.floor(totalStreak / 7) + 1);
  const progressToNextLevel = ((totalStreak % 7) / 7) * 100;

  // Daily Tip Logic
  const dayOfYear = Math.floor(
    (new Date().getTime() -
      new Date(new Date().getFullYear(), 0, 0).getTime()) /
      1000 /
      60 /
      60 /
      24,
  );
  const dailyHealthTip = HEALTH_TIPS[dayOfYear % HEALTH_TIPS.length];

  const toggleContentComplete = (id: string) => {
    // Note: In a real app, this would persist to DB
    // Here we simulate local toggle if it exists in base, or ignore for generated
    if (localContent[activeTab]) {
      setLocalContent((prev) => ({
        ...prev,
        [activeTab]: prev[activeTab].map((item) =>
          item.id === id ? { ...item, completed: !item.completed } : item,
        ),
      }));
    }
  };

  // Dynamic Theme Logic for Hero
  const themeColors = {
    [InterestType.HEALTH]:
      "from-emerald-500/20 to-teal-500/20 text-emerald-900 border-emerald-100",
    [InterestType.PRODUCTIVITY]:
      "from-indigo-500/20 to-blue-500/20 text-indigo-900 border-indigo-100",
    [InterestType.FINANCE]:
      "from-amber-500/20 to-orange-500/20 text-amber-900 border-amber-100",
    [InterestType.LEARNING]:
      "from-violet-500/20 to-purple-500/20 text-violet-900 border-violet-100",
    [InterestType.DETOX]:
      "from-rose-500/20 to-pink-500/20 text-rose-900 border-rose-100",
    CUSTOM: "from-slate-500/20 to-slate-800/20 text-slate-900 border-slate-100",
  };

  const activeTheme = (themeColors as any)[activeTab] || themeColors.CUSTOM;

  return (
    <div className="min-h-screen -mt-8 -mx-8 pb-20 relative overflow-hidden">
      {/* 1. DYNAMIC AMBIENT BACKGROUND */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-gradient-to-b ${activeTheme.split(" ").slice(0, 2).join(" ")} blur-[120px] opacity-60 transition-all duration-1000`}
        />
        <div className="absolute top-[200px] right-0 w-[400px] h-[400px] bg-white/40 rounded-full blur-[100px] animate-blob" />
        <div className="absolute top-[300px] left-0 w-[300px] h-[300px] bg-indigo-200/20 rounded-full blur-[80px] animate-blob animation-delay-2000" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-8 py-12 space-y-16">
        {/* 2. PREMIUM HERO HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-end gap-12">
          <div className="space-y-6 max-w-2xl">
            <div className="flex items-center gap-4">
              <div
                className={`px-5 py-2 rounded-2xl bg-white/80 backdrop-blur-md border ${activeTheme.split(" ").pop()} shadow-soft flex items-center gap-2.5`}
              >
                <div
                  className={`w-2 h-2 rounded-full bg-current animate-pulse`}
                />
                <span className="text-[11px] font-black uppercase tracking-[0.25em]">
                  {activeTab} Focus
                </span>
              </div>
              <div className="h-px w-12 bg-slate-200" />
              <span className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-300">
                Level {level} Mastery
              </span>
            </div>

            <h1 className="text-7xl font-black tracking-tighter text-slate-900 leading-[0.95]">
              {activeTab === InterestType.HEALTH
                ? "Vitality"
                : activeTab === InterestType.PRODUCTIVITY
                  ? "Momentum"
                  : activeTab === InterestType.FINANCE
                    ? "Prosperity"
                    : activeTab === InterestType.LEARNING
                      ? "Wisdom"
                      : activeTab}
              <span className="block text-slate-400 opacity-40 italic font-medium text-5xl mt-2">
                Hub Experience.
              </span>
            </h1>

            <p className="text-xl text-slate-500 font-medium leading-relaxed">
              You are currently maintaining{" "}
              <span className="text-slate-900 font-black">
                {activeCount} precision habits
              </span>{" "}
              with a cumulative strength of{" "}
              <span className="text-slate-900 font-black">
                {totalStreak} days
              </span>
              .
            </p>
          </div>

          <div className="flex gap-4 items-center bg-white/40 backdrop-blur-xl p-2 rounded-[2rem] border border-white/60 shadow-glass">
            {visibleInterests.map((type) => (
              <button
                key={type}
                onClick={() => setActiveTab(type)}
                className={`
                  px-8 py-4 rounded-[1.5rem] transition-all duration-700 font-black text-[11px] uppercase tracking-widest
                  ${
                    activeTab === type
                      ? "bg-slate-900 text-white shadow-2xl shadow-slate-400 scale-105"
                      : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                  }
                `}
              >
                {type}
              </button>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* 3. MAIN EXPERIENCE COLUMN */}
          <div className="lg:col-span-8 space-y-16">
            {/* FOCUS GOAL - THE "CROWN JEWEL" CARD */}
            {user?.goals && user.goals[activeTab] && (
              <section className="relative group">
                <div className="absolute inset-0 bg-slate-900 rounded-[4rem] rotate-1 group-hover:rotate-0 transition-transform duration-700" />
                <div className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 text-white p-12 rounded-[3.8rem] shadow-2xl overflow-hidden border border-white/10">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                  <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-400/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />

                  <div className="relative z-10 flex flex-col h-full justify-between gap-12">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10">
                        <Target className="text-white" size={20} />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                          Core Mission
                        </span>
                      </div>
                      <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 group-hover:rotate-12 transition-transform duration-700">
                        <ArrowUpRight size={28} />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h2 className="text-5xl font-black tracking-tight leading-[1.1] italic">
                        "{user.goals[activeTab]}"
                      </h2>
                      <div className="flex items-center gap-6 pt-4">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-60 text-emerald-100">
                            Pathfinder AI Active
                          </span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-white/20" />
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                          Mastery Tier 48
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* CONTENT GRID - MAGAZINE STYLE */}
            <section className="space-y-8">
              <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                  Curriculum{" "}
                  <span className="text-slate-300 font-medium ml-2">
                    For Achievement
                  </span>
                </h3>
                <button className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:tracking-[0.2em] transition-all">
                  Expand Library
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {content.map((item, i) => (
                  <div
                    key={item.id}
                    onClick={() => toggleContentComplete(item.id)}
                    className={`
                        group relative flex flex-col justify-between p-10 rounded-[3rem] transition-all duration-700 cursor-pointer border
                        ${
                          item.completed
                            ? "bg-slate-50 border-slate-100 opacity-60 grayscale"
                            : i === 0
                              ? "bg-white border-white shadow-apple hover:-translate-y-2"
                              : "bg-white/40 border-white shadow-soft hover:bg-white hover:shadow-apple hover:-translate-y-1"
                        }
                      `}
                  >
                    <div className="flex justify-between items-start mb-12">
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                          item.type === "video"
                            ? "bg-rose-50 text-rose-500 shadow-rose-100"
                            : item.type === "article"
                              ? "bg-indigo-50 text-indigo-500 shadow-indigo-100"
                              : "bg-emerald-50 text-emerald-500 shadow-emerald-100"
                        } shadow-inner-light group-hover:scale-110`}
                      >
                        {item.type === "video" ? (
                          <Play fill="currentColor" size={24} />
                        ) : item.type === "article" ? (
                          <FileText size={24} />
                        ) : (
                          <Sparkles size={24} />
                        )}
                      </div>
                      {item.completed && (
                        <div className="w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center">
                          <CheckCircle2 size={16} strokeWidth={4} />
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300">
                          {item.type}
                        </span>
                        <div className="w-1 h-1 rounded-full bg-slate-200" />
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300">
                          {item.duration}
                        </span>
                      </div>
                      <h4 className="text-2xl font-black text-slate-900 leading-tight tracking-tight group-hover:text-indigo-600 transition-colors">
                        {item.title}
                      </h4>
                    </div>
                  </div>
                ))}

                {/* LOCKED CARD */}
                <div className="bg-slate-100/30 border-2 border-dashed border-slate-200 p-10 rounded-[3rem] flex flex-col justify-center items-center text-center gap-6 group hover:border-indigo-200 transition-colors">
                  <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-3xl flex items-center justify-center group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-all duration-500">
                    <Lock size={28} />
                  </div>
                  <div>
                    <h5 className="font-black text-slate-600 text-lg uppercase tracking-tight">
                      Locked Curriculum
                    </h5>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                      Finish Tier {level} items to unlock
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* 4. HIGH-FIDELITY SIDEBAR WIDGETS */}
          <aside className="lg:col-span-4 space-y-12">
            {/* DAILY INSIGHT WIDGET */}
            <div className="bg-white/60 backdrop-blur-xl border border-white/80 p-10 rounded-[3.5rem] shadow-apple relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-[0.05] group-hover:opacity-[0.08] transition-opacity">
                <Heart size={160} fill="currentColor" />
              </div>
              <div className="relative z-10 space-y-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-indigo-200 shadow-xl">
                    <Star size={18} fill="currentColor" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900">
                    Elite Coaching
                  </span>
                </div>
                <div className="space-y-4">
                  <h4 className="text-3xl font-black italic text-slate-900 leading-tight">
                    "{dailyHealthTip.title}"
                  </h4>
                  <p className="text-sm text-slate-500 font-semibold leading-relaxed">
                    {dailyHealthTip.text}
                  </p>
                </div>
                <button className="flex items-center gap-2 group/btn">
                  <span className="text-[11px] font-black uppercase tracking-widest text-indigo-600">
                    Full Protocol
                  </span>
                  <ArrowUpRight
                    size={14}
                    className="text-indigo-600 group-hover/btn:translate-x-1 group-hover/btn:-translate-y-1 transition-transform"
                  />
                </button>
              </div>
            </div>

            {/* ROUTINE WIDGET */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <h4 className="text-xs font-black text-slate-300 uppercase tracking-[0.4em]">
                  Active Routine
                </h4>
                <Repeat size={14} className="text-slate-200" />
              </div>

              <div className="space-y-3">
                {interestHabits.length > 0 ? (
                  interestHabits.map((h) => (
                    <div
                      key={h.id}
                      className="bg-white p-5 rounded-[1.8rem] border border-slate-50 shadow-soft flex items-center gap-5 hover:border-indigo-100 transition-all duration-500 group"
                    >
                      <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500 shadow-inner-light">
                        <Activity size={22} />
                      </div>
                      <div className="flex-1">
                        <h5 className="font-black text-sm text-slate-900">
                          {h.name}
                        </h5>
                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-tighter mt-1">
                          {h.schedule}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-black text-indigo-600 italic leading-none">
                          {h.streak}d
                        </div>
                        <div className="text-[8px] font-black text-slate-300 uppercase tracking-widest">
                          Strength
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-slate-50/50 border-2 border-dashed border-slate-100 p-8 rounded-[2rem] text-center">
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                      Empty Protocol
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* CHALLENGE CARD - HIGH IMPACT */}
            <div className="bg-slate-900 p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-transparent" />
              <div className="relative z-10 space-y-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-amber-400 text-slate-900 rounded-2xl flex items-center justify-center shadow-2xl shadow-amber-400/20 group-hover:rotate-12 transition-transform duration-700">
                    <Award size={28} fill="currentColor" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-100">
                    Global Sprint
                  </span>
                </div>
                <h4 className="text-2xl font-black italic leading-[1.3] tracking-tight">
                  Complete all items 3 days in a row for "Elite" status.
                </h4>
                <button className="w-full bg-white text-slate-900 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.25em] shadow-xl hover:bg-slate-100 hover:scale-[1.02] active:scale-95 transition-all">
                  Accept Challenge
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
