import React, { useState, useEffect } from 'react';
import { InterestType, Habit, TriggerType, ScheduleType } from '../types';
import { useApp } from '../App';
import { db } from '../services/mockDb';
import { 
  Activity, BookOpen, DollarSign, Brain, Smartphone, 
  Check, ArrowRight, ShieldCheck, MapPin, Bell, Plus, X,
  Dumbbell, Droplets, Moon, Sun, Monitor, Coffee, Music, Star, Zap
} from 'lucide-react';

const DEFAULT_INTERESTS = [
  { id: InterestType.HEALTH, icon: Activity, label: 'Health' },
  { id: InterestType.PRODUCTIVITY, icon: Brain, label: 'Productivity' },
  { id: InterestType.FINANCE, icon: DollarSign, label: 'Finance' },
  { id: InterestType.LEARNING, icon: BookOpen, label: 'Learning' },
  { id: InterestType.DETOX, icon: Smartphone, label: 'Detox' },
];

const CUSTOM_ICONS = [
  { id: 'Activity', Icon: Activity },
  { id: 'BookOpen', Icon: BookOpen },
  { id: 'DollarSign', Icon: DollarSign },
  { id: 'Dumbbell', Icon: Dumbbell },
  { id: 'Droplets', Icon: Droplets },
  { id: 'Moon', Icon: Moon },
  { id: 'Sun', Icon: Sun },
  { id: 'Monitor', Icon: Monitor },
  { id: 'Coffee', Icon: Coffee },
  { id: 'Music', Icon: Music },
  { id: 'Star', Icon: Star },
  { id: 'Zap', Icon: Zap },
];

export default function Onboarding() {
  const { user, completeOnboarding } = useApp();
  const [step, setStep] = useState(1);
  
  // State
  const [availableInterests, setAvailableInterests] = useState<{ id: InterestType; icon: any; label: string }[]>(DEFAULT_INTERESTS);
  const [selectedInterests, setSelectedInterests] = useState<InterestType[]>([]);
  const [newInterestName, setNewInterestName] = useState('');
  const [isAddingInterest, setIsAddingInterest] = useState(false);

  const [finalHabits, setFinalHabits] = useState<Habit[]>([]);
  const [permissions, setPermissions] = useState({ loc: false, notif: false, screen: false });
  
  // Custom Habit Form
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customInterest, setCustomInterest] = useState<InterestType>(InterestType.HEALTH);
  const [customSchedule, setCustomSchedule] = useState<ScheduleType>(ScheduleType.DAILY);
  const [customIcon, setCustomIcon] = useState('Activity');

  // Load suggestions when interests change
  useEffect(() => {
    if (step === 3 && selectedInterests.length > 0) {
      const suggestions = db.getSuggestions(selectedInterests);
      setFinalHabits(suggestions);
    }
  }, [step, selectedInterests]);

  const toggleInterest = (id: InterestType) => {
    setSelectedInterests(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const addNewInterest = () => {
    if (!newInterestName.trim()) return;
    const name = newInterestName.trim();
    // Check if already exists
    if (availableInterests.some(i => i.label.toLowerCase() === name.toLowerCase())) {
        setNewInterestName('');
        setIsAddingInterest(false);
        return;
    }

    const newInterest = { 
        id: name, 
        icon: Star, // Generic icon for custom interests
        label: name 
    };

    setAvailableInterests(prev => [...prev, newInterest]);
    setSelectedInterests(prev => [...prev, name]); // Auto-select
    setNewInterestName('');
    setIsAddingInterest(false);
  };

  const removeHabit = (id: string) => {
    setFinalHabits(prev => prev.filter(h => h.id !== id));
  };

  const saveCustomHabit = () => {
    if (!customName) return;
    const newHabit: Habit = {
      id: `custom_${Date.now()}`,
      name: customName,
      icon: customIcon,
      interest: customInterest,
      schedule: customSchedule,
      triggerType: TriggerType.MANUAL,
      streak: 0
    };
    setFinalHabits(prev => [...prev, newHabit]);
    setIsAddingCustom(false);
    setCustomName('');
  };

  const handleFinish = () => {
    completeOnboarding(selectedInterests, finalHabits, permissions);
  };

  const CustomIconComponent = CUSTOM_ICONS.find(c => c.id === customIcon)?.Icon || Activity;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-navy-100 rounded-full blur-3xl opacity-50" />
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50" />

      <div className="max-w-lg w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-soft p-8 md:p-12 z-10 transition-all duration-500 max-h-[90vh] overflow-y-auto no-scrollbar">
        
        {/* STEP 1: WELCOME */}
        {step === 1 && (
          <div className="text-center space-y-6 animate-fade-in">
             <div className="flex justify-center mb-2">
                <img 
                  src="/logo.png" 
                  alt="Growth Nexis Global" 
                  className="w-24 h-24 object-contain drop-shadow-md"
                  onError={(e) => {
                     e.currentTarget.style.display = 'none';
                     e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="hidden w-20 h-20 bg-navy-900 rounded-2xl flex items-center justify-center shadow-glow">
                  <span className="text-white text-3xl font-bold">GN</span>
                </div>
            </div>
            
            <h1 className="text-3xl font-bold text-navy-900 tracking-tight">Welcome, {user?.name.split(' ')[0]}</h1>
            <p className="text-slate-500 font-light leading-relaxed">
              Let's design a routine that unlocks your potential with myCORE.
            </p>
            <button 
              onClick={() => setStep(2)}
              className="w-full bg-navy-900 text-white py-4 rounded-xl font-medium hover:bg-navy-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-navy-900/20"
            >
              Start Design <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* STEP 2: INTERESTS */}
        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-navy-900">Focus Areas</h2>
              <p className="text-slate-500 text-sm mt-2">Select areas you want to improve or add your own.</p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {availableInterests.map((item) => {
                const isSelected = selectedInterests.includes(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleInterest(item.id)}
                    className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 ${
                      isSelected 
                        ? 'border-navy-900 bg-navy-50 text-navy-900 shadow-sm' 
                        : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <item.icon size={24} className={isSelected ? 'text-navy-900' : 'text-slate-300'} />
                    <span className="text-sm font-medium truncate w-full">{item.label}</span>
                  </button>
                )
              })}
              
              {/* Add Custom Button / Input */}
              {!isAddingInterest ? (
                  <button 
                    onClick={() => setIsAddingInterest(true)}
                    className="p-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-slate-400 hover:text-navy-900 hover:border-navy-900 transition-all flex flex-col items-center justify-center gap-2"
                  >
                    <Plus size={24} />
                    <span className="text-sm font-medium">Add Custom</span>
                  </button>
              ) : (
                  <div className="col-span-1 p-2 rounded-2xl border border-navy-900 bg-white flex flex-col gap-2">
                     <input 
                        autoFocus
                        value={newInterestName}
                        onChange={(e) => setNewInterestName(e.target.value)}
                        placeholder="Name..."
                        className="w-full text-sm p-1 outline-none border-b border-slate-100"
                        onKeyDown={(e) => e.key === 'Enter' && addNewInterest()}
                     />
                     <div className="flex gap-2">
                         <button onClick={addNewInterest} className="flex-1 bg-navy-900 text-white text-xs py-1 rounded">Add</button>
                         <button onClick={() => setIsAddingInterest(false)} className="px-2 text-slate-400 hover:text-red-500"><X size={14}/></button>
                     </div>
                  </div>
              )}
            </div>

            <button 
              onClick={() => setStep(3)}
              disabled={selectedInterests.length === 0}
              className="w-full bg-navy-900 disabled:bg-slate-300 text-white py-4 rounded-xl font-medium mt-4 hover:bg-navy-800 transition-all"
            >
              Next
            </button>
          </div>
        )}

        {/* STEP 3: HABIT SELECTION & CUSTOMIZATION */}
        {step === 3 && (
            <div className="space-y-6 animate-fade-in">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-navy-900">Your Routine</h2>
                    <p className="text-slate-500 text-sm mt-2">We've suggested a few starts. Customize or add your own.</p>
                </div>

                <div className="space-y-3">
                    {finalHabits.map((h) => (
                        <div key={h.id} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-500">
                                     {/* Simple dynamic icon rendering */}
                                     {/* We try to match with custom icons, fallback to Activity */}
                                     {(() => {
                                        const found = CUSTOM_ICONS.find(c => c.id === h.icon);
                                        const Icon = found ? found.Icon : Activity;
                                        return <Icon size={18} />;
                                     })()}
                                </div>
                                <div className="text-left">
                                    <h4 className="font-semibold text-sm text-slate-800">{h.name}</h4>
                                    <p className="text-[10px] text-slate-400">{h.schedule} • {h.interest}</p>
                                </div>
                            </div>
                            <button onClick={() => removeHabit(h.id)} className="text-slate-300 hover:text-red-400 p-2">
                                <X size={16} />
                            </button>
                        </div>
                    ))}
                </div>

                {!isAddingCustom ? (
                    <button 
                        onClick={() => setIsAddingCustom(true)}
                        className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 font-medium hover:border-navy-900 hover:text-navy-900 transition-all flex items-center justify-center gap-2"
                    >
                        <Plus size={18} /> Add Custom Habit
                    </button>
                ) : (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4 animate-fade-in">
                        <div className="flex justify-between items-center">
                            <h4 className="font-bold text-sm text-navy-900">New Habit</h4>
                            <button onClick={() => setIsAddingCustom(false)} className="text-slate-400 hover:text-red-400"><X size={16}/></button>
                        </div>
                        
                        <input 
                            value={customName}
                            onChange={(e) => setCustomName(e.target.value)}
                            className="w-full p-2 rounded-lg border border-slate-200 text-sm"
                            placeholder="Habit Name (e.g. Drink Water)"
                        />

                        <div className="grid grid-cols-2 gap-2">
                             <select 
                                value={customInterest}
                                onChange={(e) => setCustomInterest(e.target.value as InterestType)}
                                className="w-full p-2 rounded-lg border border-slate-200 text-sm bg-white"
                             >
                                {/* Standard Interests */}
                                {DEFAULT_INTERESTS.map(i => <option key={i.id} value={i.id}>{i.label}</option>)}
                                {/* Custom Interests added in step 2 if not in default */}
                                {availableInterests
                                    .filter(i => !DEFAULT_INTERESTS.some(d => d.id === i.id))
                                    .map(i => <option key={i.id} value={i.id}>{i.label}</option>)
                                }
                             </select>
                             <select 
                                value={customSchedule}
                                onChange={(e) => setCustomSchedule(e.target.value as ScheduleType)}
                                className="w-full p-2 rounded-lg border border-slate-200 text-sm bg-white"
                             >
                                {Object.values(ScheduleType).map(t => <option key={t} value={t}>{t}</option>)}
                             </select>
                        </div>

                        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                             {CUSTOM_ICONS.map(icon => (
                                 <button
                                    key={icon.id}
                                    onClick={() => setCustomIcon(icon.id)}
                                    className={`p-2 rounded-lg border flex-shrink-0 ${customIcon === icon.id ? 'bg-navy-900 text-white border-navy-900' : 'bg-white border-slate-200 text-slate-400'}`}
                                 >
                                    <icon.Icon size={18} />
                                 </button>
                             ))}
                        </div>

                        <button 
                            onClick={saveCustomHabit}
                            className="w-full bg-navy-900 text-white py-2 rounded-lg text-sm font-medium"
                        >
                            Save Habit
                        </button>
                    </div>
                )}

                <button 
                    onClick={() => setStep(4)}
                    disabled={finalHabits.length === 0}
                    className="w-full bg-navy-900 disabled:bg-slate-300 text-white py-4 rounded-xl font-medium mt-4 hover:bg-navy-800 transition-all"
                >
                    Continue ({finalHabits.length})
                </button>
            </div>
        )}

        {/* STEP 4: PERMISSIONS & AUTO-TRIGGERS */}
        {step === 4 && (
          <div className="space-y-6 animate-fade-in">
             <div className="text-center">
              <h2 className="text-2xl font-bold text-navy-900">Enable Auto-Pilot</h2>
              <p className="text-slate-500 text-sm mt-2">Allow myCORE to sense your context.</p>
            </div>

            <div className="space-y-3">
              <div 
                onClick={() => setPermissions(p => ({ ...p, loc: !p.loc }))}
                className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm cursor-pointer hover:border-navy-200 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <MapPin size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800 text-sm">Location Services</h3>
                  <p className="text-xs text-slate-400">Triggers Gym & Work habits</p>
                </div>
                <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${permissions.loc ? 'bg-navy-900 border-navy-900' : 'border-slate-300'}`}>
                  {permissions.loc && <Check size={14} className="text-white" />}
                </div>
              </div>

              <div 
                 onClick={() => setPermissions(p => ({ ...p, notif: !p.notif }))}
                 className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm cursor-pointer hover:border-navy-200 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <Bell size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800 text-sm">Notifications</h3>
                  <p className="text-xs text-slate-400">Daily summaries & alerts</p>
                </div>
                <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${permissions.notif ? 'bg-navy-900 border-navy-900' : 'border-slate-300'}`}>
                  {permissions.notif && <Check size={14} className="text-white" />}
                </div>
              </div>

              <div 
                 onClick={() => setPermissions(p => ({ ...p, screen: !p.screen }))}
                 className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-2xl shadow-sm cursor-pointer hover:border-navy-200 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                  <Smartphone size={20} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-800 text-sm">Screen Time</h3>
                  <p className="text-xs text-slate-400">Activity & Detox tracking</p>
                </div>
                <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${permissions.screen ? 'bg-navy-900 border-navy-900' : 'border-slate-300'}`}>
                  {permissions.screen && <Check size={14} className="text-white" />}
                </div>
              </div>
            </div>

            <button 
              onClick={handleFinish}
              className="w-full bg-navy-900 text-white py-4 rounded-xl font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
            >
              Generate Weekly Routine
            </button>
          </div>
        )}
      </div>
    </div>
  );
}