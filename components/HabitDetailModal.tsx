
import React from 'react';
import { useApp } from '../App';
import { Habit, HabitInstance, TriggerType } from '../types';
import * as Icons from 'lucide-react';
import { X, Calendar, Target, Zap, Clock, TrendingUp, Info } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { getDayName } from '../utils';

interface Props {
  habit: Habit;
  instances: HabitInstance[];
  onClose: () => void;
  onTrigger: () => void;
}

export default function HabitDetailModal({ habit, instances, onClose, onTrigger }: Props) {
  const IconComponent = (Icons as any)[habit.icon] || Icons.Circle;

  // Prepare 7-day history data
  const historyData = [...instances]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-7)
    .map(inst => ({
      name: getDayName(new Date(inst.date)),
      status: inst.completed ? 1 : 0,
      value: inst.value || 0,
      date: inst.date
    }));

  const completionRate = Math.round((historyData.filter(d => d.status === 1).length / Math.max(1, historyData.length)) * 100);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-dark-card w-full max-w-lg rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-dark-border overflow-hidden animate-scale-in flex flex-col">
        
        {/* Header Section */}
        <div className="p-8 pb-0 relative">
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-dark-cardHover transition-colors z-10"
          >
            <X size={20} className="text-slate-400" />
          </button>

          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 rounded-[1.5rem] bg-slate-900 dark:bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <IconComponent size={36} strokeWidth={2.5} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold uppercase tracking-widest">
                  {habit.interest}
                </span>
                {habit.isFavorite && (
                  <Icons.Star size={12} fill="currentColor" className="text-yellow-400" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">{habit.name}</h2>
              <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium mt-1">
                <Clock size={12} /> {habit.schedule}
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs/Sections */}
        <div className="px-8 pb-8 space-y-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
          
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 dark:bg-dark-bg/50 p-4 rounded-2xl border border-slate-200 dark:border-dark-border text-center">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Streak</div>
              <div className="text-xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-1">
                {habit.streak} <Zap size={14} className="text-yellow-500 fill-current" />
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-dark-bg/50 p-4 rounded-2xl border border-slate-200 dark:border-dark-border text-center">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">7D Success</div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">{completionRate}%</div>
            </div>
            <div className="bg-slate-50 dark:bg-dark-bg/50 p-4 rounded-2xl border border-slate-200 dark:border-dark-border text-center">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Trigger</div>
              <div className="text-xs font-bold text-slate-900 dark:text-white mt-1.5">{habit.triggerType.split('_').join(' ')}</div>
            </div>
          </div>

          {/* Goal Section */}
          {habit.goal && (
            <div className="p-5 rounded-[1.5rem] bg-blue-50/50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-500/20">
              <div className="flex items-center gap-2 mb-3">
                <Target size={18} className="text-blue-600 dark:text-blue-400" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Active Goal</h4>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {habit.goal.target} <span className="text-sm text-slate-400 font-normal">{habit.goal.unit}</span>
                  </div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Daily Target</div>
                </div>
                <div className="text-right">
                   <div className="text-xs font-bold text-blue-600 dark:text-blue-400">Verifiable</div>
                   <div className="text-[10px] text-slate-500">via myCORE validation</div>
                </div>
              </div>
            </div>
          )}

          {/* Trigger Detail */}
          <div className="p-5 rounded-[1.5rem] bg-slate-50 dark:bg-dark-bg/50 border border-slate-200 dark:border-dark-border">
            <div className="flex items-center gap-2 mb-3">
              <Info size={18} className="text-slate-400" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Automation Info</h4>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              {habit.triggerType === TriggerType.LOCATION 
                ? `System verified your presence at "${habit.triggerConfig?.locationName}" to log this habit.`
                : habit.triggerType === TriggerType.SCREEN_TIME 
                ? `Verifies mobile usage remains under ${habit.triggerConfig?.thresholdMinutes} minutes.`
                : habit.triggerType === TriggerType.APP_OPEN
                ? `Requires interaction with "${habit.triggerConfig?.appName}" for verification.`
                : "Manual log required. Self-discipline is the bridge to mastery."}
            </p>
          </div>

          {/* History Chart */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">Recent Performance</h4>
              <span className="text-[10px] font-bold text-slate-400 uppercase">Last 7 Days</span>
            </div>
            <div className="h-32 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historyData}>
                  <defs>
                    <linearGradient id="colorStatus" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                    labelStyle={{ fontWeight: 'bold', fontSize: '10px' }}
                    itemStyle={{ fontSize: '10px' }}
                  />
                  <Area 
                    type="step" 
                    dataKey="status" 
                    stroke="#3B82F6" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorStatus)" 
                    animationDuration={1500}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-between px-2">
               {historyData.map((d, i) => (
                 <div key={i} className={`w-6 h-6 rounded-lg flex items-center justify-center text-[8px] font-bold border transition-colors ${d.status === 1 ? 'bg-green-500 border-green-500 text-white' : 'bg-slate-100 dark:bg-dark-bg text-slate-400 border-slate-200 dark:border-dark-border'}`}>
                    {d.name.charAt(0)}
                 </div>
               ))}
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-8 pt-0 mt-auto">
          <button 
            onClick={() => { onTrigger(); onClose(); }}
            className="w-full py-4 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-blue-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            {historyData[historyData.length - 1]?.status === 1 ? <Icons.RotateCcw size={18} /> : <Icons.Zap size={18} />}
            {historyData[historyData.length - 1]?.status === 1 ? 'Update Status' : 'Execute Core Action'}
          </button>
        </div>
      </div>
    </div>
  );
}
