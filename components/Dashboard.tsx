import React, { useState } from 'react';
import { useApp } from '../App';
import { getWeekDays, formatDate, getDayName, calculateCompletion } from '../utils';
import { HabitInstance, TriggerType } from '../types';
import * as Icons from 'lucide-react';
import HabitTriggerModal from './HabitTriggerModal';
import { CheckSquare, ArrowRight, Plus } from 'lucide-react';
import AddTaskModal from './AddTaskModal';

// --- SUB-COMPONENTS ---

const ProgressRing = ({ percent, size = 60, stroke = 4 }: { percent: number; size?: number; stroke?: number }) => {
  const radius = (size - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full">
        <circle
          className="text-slate-100"
          strokeWidth={stroke}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="text-navy-900 transition-all duration-1000 ease-out"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <span className="absolute text-[10px] font-semibold text-navy-900">{percent}%</span>
    </div>
  );
};

const DayCard = ({ date, instances, habits, isSelected, onClick }: any) => {
  const dayName = getDayName(new Date(date));
  const dayNum = new Date(date).getDate();
  const completedCount = instances.filter((i: any) => i.completed).length;
  const total = instances.length;
  const percent = calculateCompletion(total, completedCount);
  const isToday = formatDate(new Date()) === date;

  return (
    <div 
      onClick={onClick}
      className={`
        relative flex flex-col items-center justify-between p-4 rounded-3xl min-w-[100px] h-[160px] cursor-pointer transition-all duration-300 border
        ${isSelected ? 'bg-white border-navy-900 shadow-lg scale-105 z-10' : 'bg-white border-transparent hover:border-slate-200 shadow-soft scale-100 text-slate-400'}
        ${isToday && !isSelected ? 'ring-2 ring-blue-100' : ''}
      `}
    >
      <div className="text-center">
        <div className={`text-xs font-medium uppercase tracking-wider ${isSelected ? 'text-slate-500' : 'text-slate-300'}`}>{dayName}</div>
        <div className={`text-xl font-bold mt-1 ${isSelected ? 'text-navy-900' : 'text-slate-400'}`}>{dayNum}</div>
      </div>

      <ProgressRing percent={percent} size={50} stroke={3} />
      
      {isToday && <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />}
    </div>
  );
};

const HabitRow = ({ habit, instance, onTrigger }: any) => {
  // Dynamic Icon
  const IconComponent = (Icons as any)[habit.icon] || Icons.Circle;
  const isCompleted = instance?.completed;
  
  // Trigger Logic Text
  const getTriggerText = () => {
    switch (habit.triggerType) {
      case TriggerType.LOCATION: return `Arrive at ${habit.triggerConfig?.locationName}`;
      case TriggerType.APP_OPEN: return `Open ${habit.triggerConfig?.appName}`;
      case TriggerType.SCREEN_TIME: return `Usage < ${habit.triggerConfig?.thresholdMinutes}m`;
      default: return 'Manual Check';
    }
  };

  return (
    <div className={`group flex items-center justify-between p-4 mb-3 rounded-2xl bg-white border transition-all duration-500 ease-out
      ${isCompleted ? 'border-green-200 bg-green-50/50 translate-x-1' : 'border-slate-100 hover:border-slate-200 shadow-sm'}
    `}>
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isCompleted ? 'bg-green-100 text-green-600 scale-110 -rotate-6 shadow-sm' : 'bg-slate-50 text-slate-400 group-hover:text-navy-900'}`}>
          <IconComponent size={20} strokeWidth={2} />
        </div>
        <div className="flex-1">
          <h4 className={`font-semibold text-sm transition-all duration-500 ${isCompleted ? 'text-green-900 line-through decoration-green-900/30 opacity-70' : 'text-slate-800'}`}>{habit.name}</h4>
          <div className="flex items-center gap-1.5 mt-1 transition-opacity duration-500">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium transition-colors duration-500 ${isCompleted ? 'bg-white/60 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
              {habit.triggerType === TriggerType.MANUAL ? 'Manual' : 'Auto'}
            </span>
            <span className="text-[10px] text-slate-400">{getTriggerText()}</span>
          </div>
        </div>
      </div>

      <button 
        onClick={() => onTrigger(instance)}
        disabled={isCompleted}
        className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-300
          ${isCompleted 
            ? 'bg-transparent text-green-600 cursor-default scale-100 pl-6' 
            : 'bg-navy-900 text-white hover:bg-navy-800 shadow-md shadow-navy-900/20 active:scale-95'}
        `}
      >
        {isCompleted ? (
           <span className="flex items-center gap-1">
             Done <Icons.Check size={14} />
           </span>
        ) : (
           habit.triggerType === TriggerType.MANUAL ? 'Complete' : 'Simulate'
        )}
      </button>
    </div>
  );
};

// --- MAIN DASHBOARD ---

export default function Dashboard() {
  const { habits, currentWeekInstances, handleTrigger, user, tasks, setActiveTab } = useApp();
  const weekDays = getWeekDays();
  const today = formatDate(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  const [triggerModal, setTriggerModal] = useState<{ isOpen: boolean, instance: HabitInstance | null, habit: any | null }>({ isOpen: false, instance: null, habit: null });
  const [showTaskModal, setShowTaskModal] = useState(false);

  // Compute Weekly Stats
  const weekInstances = Object.values(currentWeekInstances).flat() as HabitInstance[];
  const weekCompletion = calculateCompletion(weekInstances.length, weekInstances.filter(i => i.completed).length);
  
  // Data for selected day
  const dayInstances = currentWeekInstances[selectedDate] || [];

  // Tasks Due Today
  const tasksDue = tasks.filter(t => t.dueDate === today && !t.completed);

  const openTrigger = (instance: HabitInstance) => {
    const habit = habits.find(h => h.id === instance.habitId);
    if (!habit) return;
    
    // If it's manual, just toggle immediately for UX speed, otherwise show simulation modal
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
    <div className="space-y-8 animate-fade-in-up">
      
      {/* 1. WEEKLY HEADER STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-navy-900 text-white rounded-3xl p-6 relative overflow-hidden shadow-glow">
           <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
           
           <div className="relative z-10 flex items-center justify-between">
             <div>
               <h2 className="text-2xl font-bold">Hello, {user?.name.split(' ')[0]}</h2>
               <p className="text-navy-100 font-light mt-1">You've mastered {weekCompletion}% of your Core this week.</p>
               <div className="mt-6 flex gap-4">
                 <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
                   <span className="block text-2xl font-bold">{habits.length}</span>
                   <span className="text-[10px] uppercase tracking-wide opacity-70">Active Habits</span>
                 </div>
                 <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
                    <span className="block text-2xl font-bold text-green-300">
                      {habits.reduce((acc, h) => acc + h.streak, 0)}
                    </span>
                   <span className="text-[10px] uppercase tracking-wide opacity-70">Total Streak Days</span>
                 </div>
               </div>
             </div>
             
             {/* Weekly Ring Chart */}
             <div className="hidden sm:block">
                <ProgressRing percent={weekCompletion} size={100} stroke={6} />
             </div>
           </div>
        </div>
        
        {/* TASKS WIDGET */}
        <div 
          onClick={() => setActiveTab('tasks')}
          className="bg-white rounded-3xl p-6 shadow-soft flex flex-col justify-between border border-slate-100 cursor-pointer group hover:border-navy-100 transition-all relative"
        >
           {/* Quick Add Task Button */}
           <div className="absolute top-4 right-4 z-20">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTaskModal(true);
                }}
                className="w-8 h-8 bg-slate-100 hover:bg-navy-900 hover:text-white rounded-full flex items-center justify-center transition-colors text-slate-500 shadow-sm"
                title="Quick Add Task"
              >
                <Plus size={16} />
              </button>
           </div>

           <div className="flex items-center justify-between">
             <div className="w-10 h-10 bg-slate-50 text-slate-500 rounded-xl flex items-center justify-center group-hover:bg-navy-900 group-hover:text-white transition-colors">
                <CheckSquare size={20} />
             </div>
             {tasksDue.length > 0 && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse mr-8" />}
           </div>
           <div>
              <div className="text-3xl font-bold text-navy-900 mt-2">{tasksDue.length}</div>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">Tasks Due Today</p>
           </div>
           <div className="flex items-center gap-1 text-xs text-navy-900 font-semibold mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              View Tasks <ArrowRight size={12} />
           </div>
        </div>
      </div>

      {/* 2. WEEKLY CALENDAR SCROLL */}
      <div>
        <div className="flex items-center justify-between mb-4 px-2">
            <h3 className="font-bold text-lg text-slate-800">Your Week</h3>
            <span className="text-xs text-slate-400 font-medium bg-white px-2 py-1 rounded-md shadow-sm border border-slate-100">
                {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
        </div>
        <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar snap-x snap-mandatory">
            {weekDays.map((d, i) => {
                const dStr = formatDate(d);
                return (
                    <div key={i} className="snap-center">
                        <DayCard 
                            date={dStr}
                            instances={currentWeekInstances[dStr] || []}
                            habits={habits}
                            isSelected={selectedDate === dStr}
                            onClick={() => setSelectedDate(dStr)}
                        />
                    </div>
                )
            })}
        </div>
      </div>

      {/* 3. HABIT LIST FOR SELECTED DAY */}
      <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-soft border border-slate-100 min-h-[400px]">
        <div className="flex items-center justify-between mb-6">
            <div>
                <h3 className="text-xl font-bold text-navy-900">
                    {formatDate(new Date()) === selectedDate ? "Today's Core" : `${getDayName(new Date(selectedDate))}'s Core`}
                </h3>
                <p className="text-slate-400 text-sm mt-1">
                    {dayInstances.filter(i => i.completed).length} of {dayInstances.length} completed
                </p>
            </div>
            {/* Legend for triggers */}
            <div className="hidden md:flex gap-3 text-[10px] text-slate-400 bg-slate-50 px-3 py-1.5 rounded-full">
                <span className="flex items-center gap-1"><Icons.MapPin size={10}/> Location</span>
                <span className="flex items-center gap-1"><Icons.Smartphone size={10}/> Screen Time</span>
                <span className="flex items-center gap-1"><Icons.Zap size={10}/> App Open</span>
            </div>
        </div>

        <div className="space-y-2">
            {dayInstances.length > 0 ? (
                dayInstances.map(inst => {
                    const h = habits.find(hab => hab.id === inst.habitId);
                    if (!h) return null;
                    return (
                        <HabitRow 
                            key={inst.id} 
                            habit={h} 
                            instance={inst} 
                            onTrigger={openTrigger} 
                        />
                    );
                })
            ) : (
                <div className="text-center py-12 text-slate-400">
                    <p>No habits scheduled for this day.</p>
                </div>
            )}
        </div>
      </div>

      {/* MODALS */}
      {triggerModal.isOpen && triggerModal.habit && (
        <HabitTriggerModal 
            habit={triggerModal.habit}
            onClose={() => setTriggerModal({ isOpen: false, instance: null, habit: null })}
            onConfirm={handleSimulationConfirm}
        />
      )}

      {showTaskModal && (
        <AddTaskModal onClose={() => setShowTaskModal(false)} />
      )}

    </div>
  );
}