
import React, { useState } from 'react';
import { useApp } from '../App';
import { Habit, InterestType, Priority, ScheduleType, TriggerType } from '../types';
import { X, Target, Plus, ArrowRight, Palette, Clock, Sparkles } from 'lucide-react';

const COLORS = [
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Indigo', hex: '#6366F1' },
  { name: 'Purple', hex: '#A855F7' },
  { name: 'Emerald', hex: '#10B981' },
  { name: 'Orange', hex: '#F97316' },
  { name: 'Rose', hex: '#F43F5E' },
];

const CATEGORIES = Object.values(InterestType);

export default function AddHabitModal({ onClose }: { onClose: () => void }) {
  const { addHabit } = useApp();
  const [formData, setFormData] = useState<{
    name: string;
    interest: InterestType;
    schedule: ScheduleType;
    target: number;
    unit: string;
    color: string;
    priority: Priority;
    icon: string;
  }>({
    name: '',
    interest: InterestType.LEARNING,
    schedule: ScheduleType.DAILY,
    target: 7,
    unit: 'days',
    color: COLORS[0].hex,
    priority: Priority.MEDIUM,
    icon: 'Circle'
  });

  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      setError('Habit name is required');
      return;
    }
    
    await addHabit({
      id: `habit_${Date.now()}`,
      name: formData.name,
      icon: formData.icon,
      interest: formData.interest,
      schedule: formData.schedule,
      triggerType: TriggerType.MANUAL,
      streak: 0,
      color: formData.color,
      priority: formData.priority,
      goal: {
        target: formData.target,
        unit: formData.unit
      }
    } as Habit);
    
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-dark-card backdrop-blur-3xl rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl border border-slate-200 dark:border-dark-border animate-scale-in flex flex-col gap-6 relative overflow-hidden">
        
        {/* Ambient Glow Background */}
        <div 
            className="absolute top-0 right-0 w-48 h-48 rounded-full blur-[80px] -translate-x-1/4 -translate-y-1/4 opacity-20 transition-colors duration-500" 
            style={{ backgroundColor: formData.color }}
        />
        
        <div className="flex justify-between items-center relative z-10">
          <div className="flex items-center gap-3">
             <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg transition-colors duration-500"
                style={{ backgroundColor: formData.color }}
             >
                <Sparkles size={20} />
             </div>
             <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">New Habit</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Building Consistency</p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-dark-cardHover transition-colors">
            <X className="text-slate-400" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          
          {/* Name Field */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
                <Target size={12} /> Habit Name
            </label>
            <input 
                className={`w-full h-14 px-5 rounded-[1.25rem] bg-slate-50 dark:bg-dark-bg border text-lg font-bold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700 outline-none transition-all shadow-sm ${error ? 'border-red-400' : 'border-slate-200 dark:border-dark-border focus:ring-4 focus:ring-opacity-10'}`}
                style={{ 
                    boxShadow: !error ? `0 0 0 4px ${formData.color}05` : undefined,
                    borderColor: !error && formData.name ? formData.color : undefined
                } as any}
                placeholder="e.g. Morning Meditation"
                value={formData.name}
                onChange={e => { setFormData({...formData, name: e.target.value}); setError(''); }}
                autoFocus
            />
            {error && <p className="text-[10px] font-bold text-red-500 ml-1">{error}</p>}
          </div>

          {/* Category & Frequency */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
                Category
              </label>
              <select 
                className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border text-xs font-bold text-slate-900 dark:text-white focus:outline-none transition-all shadow-sm"
                value={formData.interest}
                onChange={e => setFormData({...formData, interest: e.target.value as InterestType})}
              >
                {CATEGORIES.map(cat => <option key={cat} value={cat as string}>{cat as string}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
                Schedule
              </label>
              <select 
                className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border text-xs font-bold text-slate-900 dark:text-white focus:outline-none transition-all shadow-sm"
                value={formData.schedule}
                onChange={e => setFormData({...formData, schedule: e.target.value as ScheduleType})}
              >
                {Object.values(ScheduleType).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          {/* Target & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
                <Clock size={12} /> Target ({formData.unit})
              </label>
              <input 
                type="number"
                min="1"
                className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border text-xs font-bold text-slate-900 dark:text-white focus:outline-none transition-all shadow-sm"
                value={formData.target}
                onChange={e => setFormData({...formData, target: parseInt(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
                Priority
              </label>
              <select 
                className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border text-xs font-bold text-slate-900 dark:text-white focus:outline-none transition-all shadow-sm"
                value={formData.priority}
                onChange={e => setFormData({...formData, priority: e.target.value as Priority})}
              >
                {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Color Picker */}
          <div className="space-y-3">
             <label className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
                <Palette size={12} /> Theme Color
            </label>
            <div className="flex justify-between p-1 bg-slate-50 dark:bg-dark-bg/50 rounded-2xl border border-slate-200 dark:border-dark-border">
                {COLORS.map(color => (
                    <button
                        key={color.hex}
                        type="button"
                        onClick={() => setFormData({...formData, color: color.hex})}
                        className={`w-10 h-10 rounded-xl transition-all duration-300 transform ${formData.color === color.hex ? 'scale-110 shadow-lg ring-2 ring-white dark:ring-dark-card ring-offset-2' : 'opacity-60 hover:opacity-100'}`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                    />
                ))}
            </div>
          </div>

          <div className="pt-4">
            <button 
                type="submit" 
                className="group w-full h-14 text-white rounded-[1.5rem] font-bold text-sm shadow-xl transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                style={{ 
                    backgroundColor: formData.color,
                    boxShadow: `0 10px 25px -5px ${formData.color}40`
                }}
            >
                Create Habit <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </form>

        <p className="text-[10px] text-center text-slate-400 font-medium px-8 italic opacity-60">
          Consistency is the key to mastery. Start small, stay focused.
        </p>
      </div>
    </div>
  );
}
