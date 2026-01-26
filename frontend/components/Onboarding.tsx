import React, { useState, useEffect } from "react";
import { InterestType, Habit, TriggerType, ScheduleType } from "../types";
import { useApp } from "../App";
import { db } from "../services/mockDb";
import {
  Activity,
  BookOpen,
  DollarSign,
  Brain,
  Smartphone,
  Check,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Bell,
  Plus,
  X,
  Dumbbell,
  Droplets,
  Moon,
  Sun,
  Monitor,
  Coffee,
  Music,
  Star,
  Zap,
  Target,
  Loader2,
  Sparkles,
  Map,
} from "lucide-react";
import { AIRoadmap } from "../types";
import { api } from "../services/api"; // Import API

type PermissionKey = "loc" | "notif" | "screen";

const DEFAULT_INTERESTS = [
  {
    id: InterestType.HEALTH,
    icon: Activity,
    label: "Health",
    desc: "Build better habits for a healthier life.",
  },
  {
    id: InterestType.PRODUCTIVITY,
    icon: Brain,
    label: "Productivity",
    desc: "Get more done in less time.",
  },
  {
    id: InterestType.FINANCE,
    icon: DollarSign,
    label: "Finance",
    desc: "Track expenses and save more.",
  },
  {
    id: InterestType.LEARNING,
    icon: BookOpen,
    label: "Learning",
    desc: "Read more and acquire new skills.",
  },
  {
    id: InterestType.DETOX,
    icon: Smartphone,
    label: "Digital Detox",
    desc: "Reduce screen time and verify offline.",
  },
];

const CUSTOM_ICONS = [
  { id: "Activity", Icon: Activity },
  { id: "BookOpen", Icon: BookOpen },
  { id: "DollarSign", Icon: DollarSign },
  { id: "Dumbbell", Icon: Dumbbell },
  { id: "Droplets", Icon: Droplets },
  { id: "Moon", Icon: Moon },
  { id: "Sun", Icon: Sun },
  { id: "Monitor", Icon: Monitor },
  { id: "Coffee", Icon: Coffee },
  { id: "Music", Icon: Music },
  { id: "Star", Icon: Star },
  { id: "Zap", Icon: Zap },
];

export default function Onboarding() {
  const { user, completeOnboarding } = useApp();
  const [step, setStep] = useState(1);

  // State
  const [availableInterests, setAvailableInterests] =
    useState<{ id: InterestType; icon: any; label: string }[]>(
      DEFAULT_INTERESTS,
    );
  const [selectedInterests, setSelectedInterests] = useState<InterestType[]>(
    [],
  );
  const [newInterestName, setNewInterestName] = useState("");
  const [isAddingInterest, setIsAddingInterest] = useState(false);

  const [finalHabits, setFinalHabits] = useState<Habit[]>([]);
  const [permissions, setPermissions] = useState({
    loc: false,
    notif: false,
    screen: false,
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Custom Habit Form
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customInterest, setCustomInterest] = useState<InterestType>(
    InterestType.HEALTH,
  );
  const [customSchedule, setCustomSchedule] = useState<ScheduleType>(
    ScheduleType.DAILY,
  );
  const [customIcon, setCustomIcon] = useState("Activity");
  // Custom Goal
  const [hasGoal, setHasGoal] = useState(false);
  const [goalTarget, setGoalTarget] = useState<string>("");
  const [goalUnit, setGoalUnit] = useState<string>("");

  // AI Generation State
  const [isGenerating, setIsGenerating] = useState(false);
  const [roadmap, setRoadmap] = useState<AIRoadmap | null>(null);

  // Step 3: Goals State
  const [goals, setGoals] = useState<Record<string, string>>({});

  const GOAL_EXAMPLES: Record<string, string[]> = {
    [InterestType.HEALTH]: [
      "Lose 5kg in 3 months",
      "Run a 5k without stopping",
      "Sleep 8 hours consistently",
      "Drink 2L water daily",
      "Complete a 30-day yoga challenge",
    ],
    [InterestType.PRODUCTIVITY]: [
      "Read 12 books this year",
      "Reduce daily screen time to 2h",
      "Wake up at 6am every day",
      "Clear email inbox daily",
    ],
    [InterestType.FINANCE]: [
      "Save $10,000 for emergency fund",
      "Invest 20% of monthly income",
      "Track all expenses for 30 days",
      "Pay off credit card debt",
    ],
    [InterestType.LEARNING]: [
      "Learn conversational Spanish",
      "Complete a React certification",
      "Practice piano for 30mins daily",
      "Write a blog post weekly",
    ],
    [InterestType.DETOX]: [
      "No phone after 9pm",
      "Delete social media apps for a month",
      "One tech-free day per week",
      "Meditate 10 mins daily",
    ],
  };

  // Load suggestions when interests change
  useEffect(() => {
    if (step === 4 && selectedInterests.length > 0) {
      const suggestions = db.getSuggestions(selectedInterests);
      setFinalHabits(suggestions);
    }
  }, [step, selectedInterests]);

  // Handle Enter Key for Step 1
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && step === 1 && agreedToTerms) {
        setStep(2);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [step, agreedToTerms]);

  const toggleInterest = (id: InterestType) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const addNewInterest = () => {
    if (!newInterestName.trim()) return;
    const name = newInterestName.trim();
    if (
      availableInterests.some(
        (i) => i.label.toLowerCase() === name.toLowerCase(),
      )
    ) {
      setNewInterestName("");
      setIsAddingInterest(false);
      return;
    }

    const newInterest = {
      id: name,
      icon: Star,
      label: name,
    };

    setAvailableInterests((prev) => [...prev, newInterest]);
    setSelectedInterests((prev) => [...prev, name]);
    setNewInterestName("");
    setIsAddingInterest(false);
  };

  const removeHabit = (id: string) => {
    setFinalHabits((prev) => prev.filter((h) => h.id !== id));
  };

  const saveCustomHabit = () => {
    if (!customName) return;

    const goalConfig =
      hasGoal && goalTarget && goalUnit
        ? {
            target: parseFloat(goalTarget),
            unit: goalUnit,
          }
        : undefined;

    const newHabit: Habit = {
      id: `custom_${Date.now()}`,
      name: customName,
      icon: customIcon,
      interest: customInterest,
      schedule: customSchedule,
      triggerType: TriggerType.MANUAL,
      streak: 0,
      goal: goalConfig,
    };
    setFinalHabits((prev) => [...prev, newHabit]);
    setIsAddingCustom(false);
    setCustomName("");
    setHasGoal(false);
    setGoalTarget("");
    setGoalUnit("");
  };

  const handleFinish = () => {
    completeOnboarding(selectedInterests, finalHabits, goals, permissions);
  };

  const CustomIconComponent =
    CUSTOM_ICONS.find((c) => c.id === customIcon)?.Icon || Activity;

  // AI Handler
  const handleGenerateRoutine = async () => {
    setIsGenerating(true);
    // Call REAL AI
    const result = await api.generateRoutine(selectedInterests, goals);
    setRoadmap(result);
    setFinalHabits(result.habits);
    setIsGenerating(false);
    setStep(4);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center p-6 relative overflow-hidden isolate">
      {/* Background Decor - Minimalistic */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-white"></div>

      {isGenerating ? (
        <div className="flex flex-col items-center justify-center z-20 animate-fade-in text-center">
          <div className="relative w-24 h-24 mb-8">
            <div className="absolute inset-0 bg-navy-900/20 rounded-full animate-ping"></div>
            <div className="absolute inset-0 bg-navy-900/10 rounded-full animate-pulse delay-75"></div>
            <div className="relative bg-white w-24 h-24 rounded-full flex items-center justify-center shadow-xl border border-slate-100">
              <Sparkles className="text-navy-900 animate-spin-slow" size={40} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-navy-900 mb-2">
            Analyzing your goals...
          </h2>
          <p className="text-slate-500 animate-pulse">
            Building your personalized roadmap
          </p>
        </div>
      ) : (
        <div className="max-w-xl w-full bg-white rounded-[2.5rem] p-8 md:p-12 z-10 transition-all duration-700 max-h-[90vh] overflow-y-auto no-scrollbar">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 mb-12">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`
                            h-1.5 rounded-full transition-all duration-500
                            ${
                              s <= step ? "w-8 bg-navy-900" : "w-2 bg-slate-200"
                            }
                        `}
                />
              </div>
            ))}
          </div>
          {/* STEP 1: SPLASH SCREEN */}
          {step === 1 && (
            <div className="text-center flex flex-col items-center animate-fade-in max-w-md mx-auto">
              {/* Logo / Brand */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-navy-900 tracking-tight flex items-center gap-2">
                  <span className="w-8 h-8 bg-navy-900 text-white rounded-lg flex items-center justify-center text-xs">
                    M!
                  </span>
                  M!Core
                </h2>
              </div>

              <div className="space-y-4 mb-10 w-full text-left">
                <h1 className="text-4xl font-extrabold text-navy-900 tracking-tight">
                  Hey{" "}
                  <span className="inline-block animate-wave origin-[70%_70%]">
                    👋
                  </span>{" "}
                  <br />
                  Welcome to M!Core
                </h1>
                <p className="text-slate-500 text-lg leading-relaxed">
                  Let's get to know you so you can start managing your
                  productivity and unlocking your true potential.
                </p>
              </div>

              <div className="w-full space-y-6">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="w-6 h-6 border-2 border-slate-300 rounded-lg peer-checked:bg-navy-900 peer-checked:border-navy-900 transition-all flex items-center justify-center text-white">
                      <Check
                        size={14}
                        strokeWidth={3}
                        className={`transform transition-transform ${
                          agreedToTerms ? "scale-100" : "scale-0"
                        }`}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-slate-500 group-hover:text-navy-900 transition-colors">
                    I agree to the{" "}
                    <span className="font-bold underline underline-offset-2">
                      Terms & Conditions
                    </span>{" "}
                    and{" "}
                    <span className="font-bold underline underline-offset-2">
                      Privacy Policy
                    </span>
                  </span>
                </label>

                <div className="space-y-3">
                  <button
                    onClick={() => {
                      if (agreedToTerms) setStep(2);
                    }}
                    disabled={!agreedToTerms}
                    className="w-full h-14 bg-navy-900 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-navy-900/20 flex items-center justify-center"
                  >
                    Let's Start
                  </button>

                  <div className="flex items-center justify-center gap-2 text-xs text-slate-400 font-medium opacity-0 animate-fade-in animation-delay-500">
                    <span>Press Enter ↵</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: INTERESTS */}
          {step === 2 && (
            <div className="space-y-8 animate-scale-in">
              <div className="text-left space-y-2">
                <h2 className="text-3xl font-extrabold text-navy-900 tracking-tight">
                  What do you want to <br /> focus on?
                </h2>
                <p className="text-slate-500 text-lg">
                  Select as many options as you like.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                {availableInterests.map((item) => {
                  const isSelected = selectedInterests.includes(item.id);
                  // Type guard for description since custom interests might not have it yet
                  const description = (item as any).desc || "Custom focus area";

                  return (
                    <div
                      key={item.id}
                      onClick={() => toggleInterest(item.id)}
                      className={`
                      relative group flex items-start gap-5 p-5 rounded-[1.5rem] border-2 transition-all duration-300 cursor-pointer text-left
                      ${
                        isSelected
                          ? "border-navy-900 bg-navy-50/50"
                          : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm"
                      }
                    `}
                    >
                      {/* Icon */}
                      <div
                        className={`
                        w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors
                        ${
                          isSelected
                            ? "bg-navy-900 text-white"
                            : "bg-slate-50 text-slate-500 group-hover:bg-slate-100"
                        }
                     `}
                      >
                        <item.icon size={24} strokeWidth={2} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 pr-8">
                        <h3 className="font-bold text-navy-900 text-lg mb-1">
                          {item.label}
                        </h3>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">
                          {description}
                        </p>
                      </div>

                      {/* Checkbox */}
                      <div
                        className={`
                        absolute top-6 right-6 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                        ${
                          isSelected
                            ? "bg-navy-900 border-navy-900"
                            : "border-slate-200 bg-transparent"
                        }
                     `}
                      >
                        {isSelected && (
                          <Check
                            size={14}
                            strokeWidth={3}
                            className="text-white"
                          />
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Custom Input */}
                {!isAddingInterest ? (
                  <button
                    onClick={() => setIsAddingInterest(true)}
                    className="w-full p-5 rounded-[1.5rem] border-2 border-dashed border-slate-200 text-slate-400 hover:border-navy-300 hover:text-navy-900 transition-all flex items-center justify-center gap-3 group bg-slate-50/50 hover:bg-white"
                  >
                    <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center group-hover:bg-navy-900 group-hover:border-navy-900 group-hover:text-white transition-all">
                      <Plus size={16} />
                    </div>
                    <span className="font-bold text-sm">
                      Add Custom Focus Area
                    </span>
                  </button>
                ) : (
                  <div className="p-5 rounded-[1.5rem] border-2 border-navy-900 bg-white shadow-lg animate-fade-in flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-navy-900 uppercase tracking-wider">
                        New Focus Area
                      </span>
                      <button
                        onClick={() => setIsAddingInterest(false)}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <X size={18} />
                      </button>
                    </div>

                    <div className="flex gap-3">
                      <input
                        autoFocus
                        value={newInterestName}
                        onChange={(e) => setNewInterestName(e.target.value)}
                        placeholder="e.g. Meditation, Networking..."
                        className="flex-1 text-lg font-bold text-navy-900 placeholder:text-slate-300 outline-none"
                        onKeyDown={(e) => e.key === "Enter" && addNewInterest()}
                      />
                      <button
                        onClick={addNewInterest}
                        className="bg-navy-900 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-navy-900/20 active:scale-95 transition-all"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setStep(3)}
                disabled={selectedInterests.length === 0}
                className="w-full h-14 bg-navy-900 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-navy-900/20"
              >
                Continue
              </button>
            </div>
          )}

          {/* STEP 3: DEFINE GOALS */}
          {step === 3 && (
            <div className="space-y-6 animate-scale-in">
              <div className="text-left space-y-2 mb-6">
                <h2 className="text-3xl font-extrabold text-navy-900 tracking-tight">
                  Define Your Success
                </h2>
                <p className="text-slate-500 text-lg">
                  What do you specifically want to achieve in each area?
                </p>
              </div>

              <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                {selectedInterests.map((interestId) => {
                  const interestObj = availableInterests.find(
                    (i) => i.id === interestId,
                  ) || { id: interestId, label: interestId, icon: Star };
                  const Icon = interestObj.icon;

                  return (
                    <div
                      key={interestId}
                      className="p-6 bg-white rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-md hover:border-navy-100 transition-all group"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-navy-50 text-navy-900 flex items-center justify-center group-hover:bg-navy-900 group-hover:text-white transition-colors">
                          <Icon size={20} />
                        </div>
                        <h3 className="font-bold text-navy-900 text-lg">
                          {interestObj.label}
                        </h3>
                      </div>

                      <div className="space-y-3">
                        <textarea
                          value={goals[interestId] || ""}
                          onChange={(e) =>
                            setGoals({ ...goals, [interestId]: e.target.value })
                          }
                          placeholder={`e.g. I want to improve my ${interestObj.label.toLowerCase()} by...`}
                          className="w-full p-4 rounded-xl bg-slate-50 border-2 border-transparent focus:border-navy-900 focus:bg-white resize-none text-navy-900 font-medium placeholder:text-slate-300 outline-none transition-all text-sm"
                          rows={2}
                        />

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                              Suggestions
                            </span>
                            <div className="h-px flex-1 bg-slate-100"></div>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {(
                              GOAL_EXAMPLES[interestId] || [
                                "Master this skill",
                                "Practice daily",
                                "Reach a milistone",
                              ]
                            ).map((ex, idx) => (
                              <button
                                key={idx}
                                onClick={() =>
                                  setGoals({ ...goals, [interestId]: ex })
                                }
                                className="px-3 py-1.5 rounded-lg bg-slate-100/80 text-slate-500 text-xs font-semibold hover:bg-navy-900 hover:text-white transition-all hover:shadow-lg hover:shadow-navy-900/20 active:scale-95 text-left"
                              >
                                {ex}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={handleGenerateRoutine}
                className="w-full h-14 bg-navy-900 text-white rounded-2xl font-bold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-navy-900/20 mt-4 flex items-center justify-center gap-2"
              >
                <Sparkles size={18} /> Generate My Routine
              </button>
            </div>
          )}

          {/* STEP 4: HABIT SELECTION */}
          {step === 4 && (
            <div className="space-y-6 animate-scale-in">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-navy-900 tracking-tight">
                  Your Core Routine
                </h2>
                <p className="text-slate-500 mt-2">
                  Tailored to your focus areas.
                </p>
              </div>

              {roadmap && (
                <div className="bg-gradient-to-br from-navy-900 to-slate-800 p-6 rounded-[2rem] text-white shadow-xl mb-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl translate-x-10 -translate-y-10"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-3 text-blue-200">
                      <Map size={16} />
                      <span className="text-xs font-bold uppercase tracking-wide">
                        Your Strategy
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed font-medium opacity-90">
                      {roadmap.strategy}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {finalHabits.map((h) => (
                  <div
                    key={h.id}
                    className="flex items-center justify-between p-4 bg-white/80 rounded-2xl shadow-sm border border-transparent hover:border-slate-100 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-navy-900">
                        {(() => {
                          const found = CUSTOM_ICONS.find(
                            (c) => c.id === h.icon,
                          );
                          const Icon = found ? found.Icon : Activity;
                          return <Icon size={20} />;
                        })()}
                      </div>
                      <div>
                        <h4 className="font-bold text-navy-900 text-sm">
                          {h.name}
                        </h4>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-slate-400 font-medium mt-0.5">
                            {h.schedule} • {h.interest}
                          </p>
                          {h.goal && (
                            <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold">
                              Goal: {h.goal.target} {h.goal.unit}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => removeHabit(h.id)}
                      className="w-8 h-8 rounded-full hover:bg-red-50 text-slate-300 hover:text-red-500 flex items-center justify-center transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>

              {!isAddingCustom ? (
                <button
                  onClick={() => setIsAddingCustom(true)}
                  className="w-full py-4 border-2 border-dashed border-slate-300 rounded-2xl text-slate-400 font-semibold hover:border-navy-900 hover:text-navy-900 transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={20} /> Add Custom Habit
                </button>
              ) : (
                <div className="bg-white p-5 rounded-[1.5rem] shadow-apple animate-fade-in-up space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-navy-900">New Habit</h4>
                    <button
                      onClick={() => setIsAddingCustom(false)}
                      className="bg-slate-100 p-1.5 rounded-full"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <input
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-slate-50 text-sm font-medium focus:ring-2 focus:ring-navy-900 outline-none"
                    placeholder="Habit Name (e.g. Drink Water)"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <select
                      value={customInterest}
                      onChange={(e) =>
                        setCustomInterest(e.target.value as InterestType)
                      }
                      className="h-10 px-2 rounded-xl bg-slate-50 text-xs font-medium outline-none"
                    >
                      {DEFAULT_INTERESTS.map((i) => (
                        <option key={i.id} value={i.id}>
                          {i.label}
                        </option>
                      ))}
                      {availableInterests
                        .filter(
                          (i) => !DEFAULT_INTERESTS.some((d) => d.id === i.id),
                        )
                        .map((i) => (
                          <option key={i.id} value={i.id}>
                            {i.label}
                          </option>
                        ))}
                    </select>
                    <select
                      value={customSchedule}
                      onChange={(e) =>
                        setCustomSchedule(e.target.value as ScheduleType)
                      }
                      className="h-10 px-2 rounded-xl bg-slate-50 text-xs font-medium outline-none"
                    >
                      {Object.values(ScheduleType).map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Goal Toggle */}
                  <div className="bg-slate-50 p-3 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
                        <Target size={14} /> Set a Goal?
                      </label>
                      <input
                        type="checkbox"
                        checked={hasGoal}
                        onChange={(e) => setHasGoal(e.target.checked)}
                        className="w-4 h-4 rounded text-navy-900 focus:ring-navy-900"
                      />
                    </div>

                    {hasGoal && (
                      <div className="grid grid-cols-2 gap-3 animate-fade-in">
                        <input
                          type="number"
                          value={goalTarget}
                          onChange={(e) => setGoalTarget(e.target.value)}
                          placeholder="Target (e.g. 5)"
                          className="h-9 px-2 rounded-lg bg-white border border-slate-200 text-sm focus:border-navy-900 outline-none"
                        />
                        <input
                          type="text"
                          value={goalUnit}
                          onChange={(e) => setGoalUnit(e.target.value)}
                          placeholder="Unit (e.g. km)"
                          className="h-9 px-2 rounded-lg bg-white border border-slate-200 text-sm focus:border-navy-900 outline-none"
                        />
                      </div>
                    )}
                  </div>

                  <button
                    onClick={saveCustomHabit}
                    className="w-full bg-navy-900 text-white h-10 rounded-xl text-sm font-bold"
                  >
                    Save
                  </button>
                </div>
              )}

              <button
                onClick={() => setStep(5)}
                disabled={finalHabits.length === 0}
                className="w-full h-14 bg-navy-900 disabled:opacity-50 text-white rounded-2xl font-semibold text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg mt-4"
              >
                Finalize Routine
              </button>
            </div>
          )}

          {/* STEP 5: PERMISSIONS */}
          {step === 5 && (
            <div className="space-y-8 animate-scale-in">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-navy-900 tracking-tight">
                  Enable Auto-Pilot
                </h2>
                <p className="text-slate-500 mt-2">
                  Let myCORE handle the tracking.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  {
                    key: "loc" as PermissionKey,
                    label: "Location",
                    desc: "Auto-complete Gym & Work habits",
                    icon: MapPin,
                    color: "blue",
                  },
                  {
                    key: "notif" as PermissionKey,
                    label: "Notifications",
                    desc: "Smart reminders & summaries",
                    icon: Bell,
                    color: "purple",
                  },
                  {
                    key: "screen" as PermissionKey,
                    label: "Screen Time",
                    desc: "Activity & Detox verification",
                    icon: Smartphone,
                    color: "orange",
                  },
                ].map(
                  (perm: {
                    key: PermissionKey;
                    label: string;
                    desc: string;
                    icon: any;
                    color: string;
                  }) => (
                    <div
                      key={perm.key}
                      onClick={() =>
                        setPermissions((p: Record<PermissionKey, boolean>) => ({
                          ...p,
                          [perm.key]: !p[perm.key],
                        }))
                      }
                      className={`
                        flex items-center gap-4 p-5 rounded-[1.5rem] border transition-all cursor-pointer group
                        ${
                          permissions[perm.key]
                            ? "bg-navy-900 border-navy-900 text-white shadow-lg transform scale-[1.02]"
                            : "bg-white border-transparent hover:bg-white/60 text-slate-500"
                        }
                    `}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                          permissions[perm.key]
                            ? "bg-white/20"
                            : `bg-${perm.color}-50 text-${perm.color}-500`
                        }`}
                      >
                        <perm.icon size={20} />
                      </div>
                      <div className="flex-1">
                        <h3
                          className={`font-bold text-sm ${
                            permissions[perm.key]
                              ? "text-white"
                              : "text-navy-900"
                          }`}
                        >
                          {perm.label}
                        </h3>
                        <p
                          className={`text-xs ${
                            permissions[perm.key]
                              ? "text-white/60"
                              : "text-slate-400"
                          }`}
                        >
                          {perm.desc}
                        </p>
                      </div>
                      {permissions[perm.key] && (
                        <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-navy-900 animate-scale-in">
                          <Check size={14} strokeWidth={3} />
                        </div>
                      )}
                    </div>
                  ),
                )}
              </div>

              <button
                onClick={handleFinish}
                className="w-full h-14 bg-navy-900 text-white rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Start Journey
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
