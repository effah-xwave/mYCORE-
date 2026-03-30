
import React, { useState } from 'react';
import { useApp } from '../App';
import { Project } from '../types';
import { formatDate } from '../utils';
import { X, Briefcase, Calendar, AlignLeft, ArrowRight, Target, Palette } from 'lucide-react';

const COLORS = [
  { name: 'Blue', hex: '#3B82F6' },
  { name: 'Indigo', hex: '#6366F1' },
  { name: 'Purple', hex: '#A855F7' },
  { name: 'Emerald', hex: '#10B981' },
  { name: 'Orange', hex: '#F97316' },
  { name: 'Rose', hex: '#F43F5E' },
];

export default function AddProjectModal({ onClose }: { onClose: () => void }) {
  const { addProject } = useApp();
  const [formData, setFormData] = useState<Partial<Project>>({
    name: '',
    description: '',
    startDate: formatDate(new Date()),
    endDate: formatDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)), // Default 2 weeks
    color: COLORS[0].hex
  });

  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      setError('Project name is required');
      return;
    }
    
    await addProject({
      id: `proj_${Date.now()}`,
      name: formData.name,
      description: formData.description || '',
      startDate: formData.startDate!,
      endDate: formData.endDate!,
      progress: 0,
      status: 'active',
      color: formData.color || COLORS[0].hex
    } as Project);
    
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
                <Target size={20} />
             </div>
             <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">New Initiative</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Growth Nexis Global</p>
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
                <Briefcase size={12} /> Project Name
            </label>
            <input 
                className={`w-full h-14 px-5 rounded-[1.25rem] bg-slate-50 dark:bg-dark-bg border text-lg font-bold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700 outline-none transition-all shadow-sm ${error ? 'border-red-400' : 'border-slate-200 dark:border-dark-border focus:ring-4 focus:ring-opacity-10'}`}
                style={{ 
                    boxShadow: !error ? `0 0 0 4px ${formData.color}05` : undefined,
                    borderColor: !error && formData.name ? formData.color : undefined
                } as any}
                placeholder="Enter Project Title"
                value={formData.name}
                onChange={e => { setFormData({...formData, name: e.target.value}); setError(''); }}
                autoFocus
            />
            {error && <p className="text-[10px] font-bold text-red-500 ml-1">{error}</p>}
          </div>

          {/* Description Field */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
                <AlignLeft size={12} /> Description
            </label>
            <textarea 
                className="w-full min-h-[80px] p-5 rounded-[1.25rem] bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border text-sm font-medium text-slate-600 dark:text-slate-300 placeholder:text-slate-300 dark:placeholder:text-slate-700 focus:border-opacity-50 outline-none transition-all resize-none shadow-sm"
                placeholder="What are the key outcomes of this initiative?"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>
          
          {/* Date Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
                <Calendar size={12} /> Start Date
              </label>
              <input 
                type="date"
                className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border text-xs font-bold text-slate-900 dark:text-white focus:outline-none transition-all shadow-sm"
                value={formData.startDate}
                onChange={e => setFormData({...formData, startDate: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest ml-1">
                <Calendar size={12} /> End Date
              </label>
              <input 
                type="date"
                className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border text-xs font-bold text-slate-900 dark:text-white focus:outline-none transition-all shadow-sm"
                value={formData.endDate}
                onChange={e => setFormData({...formData, endDate: e.target.value})}
              />
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
                Launch Project <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </form>

        <p className="text-[10px] text-center text-slate-400 font-medium px-8 italic opacity-60">
          Set the vision, define the timeline, and execute with precision.
        </p>
      </div>
    </div>
  );
}
