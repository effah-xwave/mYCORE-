import React, { useState } from 'react';
import { useApp } from '../App';
import { getWeekDays, formatDate, getDayName, calculateCompletion } from '../utils';
import { HabitInstance, TriggerType } from '../types';
import * as Icons from 'lucide-react';
import HabitTriggerModal from './HabitTriggerModal';
import AddTaskModal from './AddTaskModal';
import { 
  CheckSquare, ArrowRight, Plus, Calendar, MoreHorizontal, 
  TrendingUp, Activity, Zap, Brain, DollarSign, Smartphone, BookOpen
} from 'lucide-react';

// --- SUB-COMPONENTS ---

const CircularProgress = ({ value, max, size = 120, color = "#10B981", label }: { value: number, max: number, size?: number, color?: string, label?: string }) => {
  const radius = (size - 10) / 2;
  const circumference = radius * 2 * Math.PI;
  const percent = Math.min(100, (value / max) * 100);
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background Circle */}
        <svg className="transform -rotate-90 w-full h-full">
          <circle
            className="text-slate-200 dark:text-dark-cardHover transition-colors"
            strokeWidth="8"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          {/* Progress Circle */}
          <circle
            className="transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke={color}
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
            style={{ filter: `drop-shadow(0 0 4px ${color}60)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-navy-900 dark:text-white">{value}</span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label || 'Score'}</span>
        </div>
      </div>
    </div>
  );
};

const FocusAreaTag = ({ name, icon: Icon, active }: { name: string, icon: any, active: boolean }) => (
  <div className={`
    flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer group
    ${active 
        ? 'bg-blue-50/50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30' 
        : 'bg-transparent border-slate-200 dark:border-dark-border hover:border-slate-300 dark:hover:border-slate-600'
    }
  `}>
    <div className="flex items-center gap-3">
       <div className={`p-2 rounded-lg ${active ? 'bg-blue-500 text-white' : 'bg-slate-100 dark:bg-dark-cardHover text-slate-400'}`}>
          <Icon size={16} />
       </div>
       <span className={`text-sm font-semibold ${active ? 'text-blue-700 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>{name}</span>
    </div>
    {/* Progress Bar Mockup */}
    <div className="w-16 h-1 bg-slate-200 dark:bg-dark-border rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${active ? 'bg-blue-500 w-3/4' : 'bg-slate-300 dark:bg-slate-600 w-1/4'}`} />
    </div>
  </div>
);

const DayCell = ({ date, isSelected, isToday, hasData, onClick }: any) => {
    const dayName = getDayName(new Date(date)).charAt(0);
    const dayNum = new Date(date).getDate();
    
    return (
        <button 
            onClick={onClick}
            className={`
                flex flex-col items-center justify-center w-10 md:w-14 h-16 md:h-20 rounded-2xl transition-all duration-300
                ${isSelected 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-105 z-10' 
                    : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-cardHover'
                }
            `}
        >
            <span className="text-xs font-semibold mb-1">{dayName}</span>
            <span className={`text-lg md:text-xl font-bold ${isSelected ? 'text-white' : 'text-slate-700 dark:text-slate-200'}`}>{dayNum}</span>
            {isToday && !isSelected && <div className="w-1 h-1 bg-blue-500 rounded-full mt-1" />}
            {hasData && !isSelected && !isToday && <div className="w-1 h-1 bg-slate-300 dark:bg-slate-600 rounded-full mt-1" />}
        </button>
    )
}

const HabitItem = ({ habit, instance, onTrigger }: any) => {
    const IconComponent = (Icons as any)[habit.icon] || Icons.Circle;
    const isCompleted = instance?.completed;

    return (
        <div 
            onClick={() => onTrigger(instance)}
            className={`
                group relative flex items-center justify-between p-4 rounded-2xl transition-all duration-300 cursor-pointer border
                ${isCompleted
                    ? 'bg-green-500/5 border-green-500/20'
                    : 'bg-slate-50 dark:bg-dark-cardHover/50 border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                }
            `}
        >
            <div className="flex items-center gap-4">
                <div className={`
                    w-10 h-10 rounded-xl flex items-center justify-center transition-colors
                    ${isCompleted ? 'bg-green-500 text-white' : 'bg-slate-200 dark:bg-dark-border text-slate-500 dark:text-slate-400'}
                `}>
                    <IconComponent size={18} strokeWidth={2.5} />
                </div>
                <div>
                    <h4 className={`text-sm font-bold ${isCompleted ? 'text-slate-400 line-through dark:text-slate-500' : 'text-navy-900 dark:text-slate-200'}`}>
                        {habit.name}
                    </h4>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                        {habit.schedule === 'Daily' ? 'DAILY' : 'WEEKDAYS'}
                    </span>
                </div>
            </div>
            
            <div className={`
                w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                ${isCompleted 
                    ? 'bg-green-500 border-green-500 scale-110' 
                    : 'border-slate-300 dark:border-slate-600 group-hover:border-slate-400'
                }
            `}>
                {isCompleted && <Icons.Check size={14} className="text-white" strokeWidth={4} />}
            </div>
        </div>
    )
}


export default function Dashboard() {
  const { habits, currentWeekInstances, handleTrigger, user, tasks } = useApp();
  const weekDays = getWeekDays();
  const today = formatDate(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const [triggerModal, setTriggerModal] = useState<{ isOpen: boolean, instance: HabitInstance | null, habit: any | null }>({ isOpen: false, instance: null, habit: null });
  const [showTaskModal, setShowTaskModal] = useState(false);

  // Stats Calculations
  const dayInstances = currentWeekInstances[selectedDate] || [];
  const completedCount = dayInstances.filter(i => i.completed).length;
  const totalCount = dayInstances.length;
  const dayScore = totalCount > 0 ? Math.round((completedCount / totalCount) * 1000) : 0; // Score out of 1000 like credit score
  
  const mainTask = tasks.find(t => t.priority === 'High' && !t.completed) || tasks[0];

  const openTrigger = (instance: HabitInstance) => {
    const habit = habits.find(h => h.id === instance.habitId);
    if (!habit) return;
    if (habit.goal) {
        setTriggerModal({ isOpen: true, instance, habit });
        return;
    }
    if (habit.triggerType === TriggerType.MANUAL) {
      handleTrigger(instance.id);
    } else {
      setTriggerModal({ isOpen: true, instance, habit });
    }
  };

  const handleSimulationConfirm = async (val?: number) => {
    if (triggerModal.instance) {
      await handleTrigger(triggerModal.instance.id, val);
    }
    setTriggerModal({ isOpen: false, instance: null, habit: null });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-8">
      
      {/* --- COLUMN 1 & 2 (Left & Middle) --- */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        
        {/* TOP ROW: SCHEDULE CARD */}
        <div className="bg-white dark:bg-dark-card rounded-[2rem] p-6 md:p-8 shadow-soft dark:shadow-dark-soft border border-slate-100 dark:border-dark-border transition-colors">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">SCHEDULE</span>
                        <span className="px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-[10px] font-bold">This Week</span>
                    </div>
                    <h2 className="text-2xl font-bold text-navy-900 dark:text-white">
                        {new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                    </h2>
                </div>
                <div className="flex gap-4 text-xs font-bold text-slate-400">
                    <button className="hover:text-navy-900 dark:hover:text-white transition-colors">Last Week</button>
                    <button className="text-navy-900 dark:text-white">Next Week</button>
                </div>
            </div>

            {/* Calendar Strip */}
            <div className="flex justify-between items-center bg-slate-50 dark:bg-[#0B1221] p-2 rounded-[1.5rem]">
                {weekDays.map((d, i) => (
                    <DayCell 
                        key={i}
                        date={formatDate(d)}
                        isSelected={selectedDate === formatDate(d)}
                        isToday={formatDate(d) === today}
                        hasData={(currentWeekInstances[formatDate(d)] || []).some(x => x.completed)}
                        onClick={() => setSelectedDate(formatDate(d))}
                    />
                ))}
            </div>

            {/* Check-ins Preview (Mini List) */}
            <div className="mt-8 space-y-3">
                {dayInstances.slice(0, 2).map(inst => {
                    const h = habits.find(x => x.id === inst.habitId);
                    if (!h) return null;
                    return (
                        <div key={inst.id} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-dark-cardHover/30 border border-slate-100 dark:border-dark-border/50">
                            <div className="w-1 h-12 bg-blue-500 rounded-full" />
                            <div>
                                <h4 className="font-bold text-navy-900 dark:text-white text-sm">{h.name}</h4>
                                <p className="text-xs text-slate-400 font-medium mt-0.5">{h.interest}</p>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>

        {/* BOTTOM ROW: WIDGETS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Max Score Card */}
            <div className="bg-white dark:bg-dark-card rounded-[2rem] p-6 shadow-soft dark:shadow-dark-soft border border-slate-100 dark:border-dark-border relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-6 opacity-50 group-hover:opacity-100 transition-opacity">
                    <TrendingUp className="text-blue-500" />
                </div>
                <div className="text-xs font-bold text-slate-400 uppercase mb-2">Daily Score</div>
                <div className="text-5xl font-bold text-navy-900 dark:text-white tracking-tighter">
                    {dayScore}<span className="text-blue-500 text-lg">.pts</span>
                </div>
                <div className="mt-8 flex items-end justify-between">
                    <div className="text-xs text-slate-400 font-medium">Based on {totalCount} habits</div>
                    <div className="h-2 w-24 bg-slate-100 dark:bg-dark-border rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${(dayScore/1000)*100}%` }} />
                    </div>
                </div>
            </div>

            {/* Main Task Card */}
            <div className="bg-[#10192C] dark:bg-dark-card rounded-[2rem] p-6 shadow-soft dark:shadow-dark-soft border border-slate-100 dark:border-dark-border text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/20 rounded-full blur-[40px] translate-x-10 -translate-y-10" />
                
                <h3 className="font-bold text-lg mb-4 relative z-10">Main Task</h3>
                <div className="flex items-center gap-4 relative z-10">
                     <div className="w-20 h-20 relative flex items-center justify-center">
                        <svg className="transform -rotate-90 w-full h-full">
                            <circle stroke="rgba(255,255,255,0.1)" strokeWidth="6" fill="transparent" r="32" cx="40" cy="40"/>
                            <circle stroke="#34D399" strokeWidth="6" strokeDasharray={200} strokeDashoffset={mainTask ? (mainTask.completed ? 0 : 50) : 0} strokeLinecap="round" fill="transparent" r="32" cx="40" cy="40"/>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-lg font-bold">240</span>
                            <span className="text-[8px] uppercase font-bold text-green-400">Excel</span>
                        </div>
                     </div>
                     <div>
                        <div className="text-sm font-semibold opacity-90 line-clamp-2">{mainTask?.title || "No tasks"}</div>
                        <div className="text-xs text-green-400 font-bold mt-1">IN PROGRESS</div>
                     </div>
                </div>
            </div>

            {/* Personal AI (Wide) */}
            <div className="md:col-span-2 bg-black dark:bg-[#050b14] text-white rounded-[2rem] p-6 md:p-8 shadow-2xl relative overflow-hidden border border-white/10">
                <div className="absolute bottom-0 right-0 opacity-20">
                    <Brain size={120} />
                </div>
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="font-bold text-xl">Personal AI</h3>
                        <p className="text-slate-400 text-sm">Analysis of your goals prepared.</p>
                    </div>
                    <MoreHorizontal className="text-slate-500" />
                </div>
                
                <div className="flex items-end gap-2 mb-2">
                    <span className="text-5xl font-bold tracking-tight">72%</span>
                    <span className="text-sm text-slate-400 mb-2">in one week</span>
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/30 border border-blue-500/30 text-blue-400 text-xs font-bold">
                    Active goals: 32 <ArrowRight size={10} />
                </div>
            </div>

        </div>
      </div>

      {/* --- COLUMN 3 (Right Sidebar) --- */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        
        {/* Focus Areas */}
        <div className="bg-white dark:bg-dark-card rounded-[2rem] p-6 shadow-soft dark:shadow-dark-soft border border-slate-100 dark:border-dark-border h-fit">
            <h3 className="font-bold text-xl text-navy-900 dark:text-white mb-2">Focus areas</h3>
            <p className="text-xs text-slate-400 font-medium mb-6">Your targeted growth engines</p>
            
            <div className="space-y-3">
                <FocusAreaTag name="Health" icon={Activity} active={true} />
                <FocusAreaTag name="Productivity" icon={Zap} active={false} />
                <FocusAreaTag name="Finance" icon={DollarSign} active={false} />
                <FocusAreaTag name="Learning" icon={BookOpen} active={false} />
            </div>
        </div>

        {/* Your Core (Habit List) */}
        <div className="bg-[#0f1523] dark:bg-dark-card rounded-[2rem] p-6 shadow-soft dark:shadow-dark-soft border border-slate-800 dark:border-dark-border flex-1 min-h-[400px]">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-xl text-white">Your Core</h3>
                <MoreHorizontal className="text-slate-500" />
            </div>
            
            <div className="space-y-3 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
                {dayInstances.length > 0 ? (
                    dayInstances.map(inst => {
                        const h = habits.find(hab => hab.id === inst.habitId);
                        if (!h) return null;
                        return (
                            <HabitItem 
                                key={inst.id}
                                habit={h}
                                instance={inst}
                                onTrigger={openTrigger}
                            />
                        )
                    })
                ) : (
                    <div className="text-center py-10 text-slate-500">
                        <p>No habits scheduled.</p>
                    </div>
                )}
            </div>
        </div>

      </div>

      {/* MODALS */}
      {triggerModal.isOpen && triggerModal.habit && (
        <HabitTriggerModal 
            habit={triggerModal.habit}
            onClose={() => setTriggerModal({ isOpen: false, instance: null, habit: null })}
            onConfirm={handleSimulationConfirm}
            initialValue={triggerModal.instance?.value}
        />
      )}

      {showTaskModal && (
        <AddTaskModal onClose={() => setShowTaskModal(false)} />
      )}
    </div>
  );
}