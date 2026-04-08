
import React, { useState, useMemo } from 'react';
import { useApp } from '../App';
import { getWeekDays, formatDate, getDayName } from '../utils';
import { Habit, HabitInstance, Priority } from '../types';
import * as Icons from 'lucide-react';
import { 
  Search, Bell, Plus, Calendar, MoreHorizontal, 
  Activity, Zap, Brain, DollarSign, BookOpen,
  ChevronLeft, ChevronRight, Check
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

// --- SUB-COMPONENTS ---

const StatRing = ({ 
  value, 
  max, 
  label, 
  unit, 
  color, 
  icon: Icon 
}: { 
  value: number, 
  max: number, 
  label: string, 
  unit: string, 
  color: string, 
  icon: any 
}) => {
  const size = 140;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percent = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="glass-card rounded-[2rem] p-6 flex flex-col items-center justify-center relative group hover:bg-white/5 transition-all">
      <div className="absolute top-4 left-4 text-slate-500">
        <Icon size={16} />
      </div>
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90 w-full h-full">
          <circle
            className="text-white/5"
            strokeWidth={strokeWidth}
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          <circle
            className="transition-all duration-1000 ease-out"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            stroke={color}
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
            style={{ filter: `drop-shadow(0 0 8px ${color}40)` }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-display font-bold text-white">{value.toLocaleString()}</span>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{unit}</span>
        </div>
      </div>
      <div className="mt-4 text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">{label}</div>
    </div>
  );
};

const MultiRingStat = ({ 
  data, 
  label 
}: { 
  data: { label: string, value: number, color: string }[], 
  label: string 
}) => {
  const size = 140;
  const strokeWidth = 8;
  const gap = 4;

  return (
    <div className="glass-card rounded-[2rem] p-6 flex flex-col items-center justify-center relative group hover:bg-white/5 transition-all">
      <div className="absolute top-4 left-4 text-slate-500">
        <Brain size={16} />
      </div>
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90 w-full h-full">
          {data.map((item, i) => {
            const radius = (size - strokeWidth) / 2 - i * (strokeWidth + gap);
            const circumference = radius * 2 * Math.PI;
            const offset = circumference - (item.value / 100) * circumference;
            return (
              <React.Fragment key={i}>
                <circle
                  className="text-white/5"
                  strokeWidth={strokeWidth}
                  stroke="currentColor"
                  fill="transparent"
                  r={radius}
                  cx={size / 2}
                  cy={size / 2}
                />
                <circle
                  className="transition-all duration-1000 ease-out"
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  stroke={item.color}
                  fill="transparent"
                  r={radius}
                  cx={size / 2}
                  cy={size / 2}
                />
              </React.Fragment>
            );
          })}
        </svg>
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-x-3 gap-y-1">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{item.label} - {item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function Dashboard() {
  const { user, habits, currentWeekInstances, tasks, handleTrigger } = useApp();
  const [activeHistoryTab, setActiveHistoryTab] = useState('activity');
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));

  const weekDays = getWeekDays();
  const today = formatDate(new Date());

  // Chart Data
  const chartData = useMemo(() => {
    return weekDays.map(date => {
      const dateStr = formatDate(date);
      const dayInsts = currentWeekInstances[dateStr] || [];
      
      const total = habits.length;
      const completed = dayInsts.filter(i => i.completed).length;
      const intensity = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      return {
        name: getDayName(date).substring(0, 3),
        intensity,
      };
    });
  }, [currentWeekInstances, habits, weekDays]);

  // Stats - Each habit gets its own ring
  const habitStats = useMemo(() => {
    const todayInsts = currentWeekInstances[today] || [];
    return habits.map(h => {
      const inst = todayInsts.find(i => i.habitId === h.id);
      const value = h.goal ? (inst?.value || 0) : (inst?.completed ? 1 : 0);
      const max = h.goal ? h.goal.target : 1;
      const unit = h.goal ? h.goal.unit : (inst?.completed ? 'Done' : 'Pending');
      
      return {
        label: h.name,
        value: value,
        max: max,
        unit: unit,
        color: h.color || '#3b82f6',
        icon: (Icons as any)[h.icon] || Activity
      };
    });
  }, [habits, currentWeekInstances, today]);

  // Focus Data - Derived from interests or habits
  const focusData = useMemo(() => {
    const todayInsts = currentWeekInstances[today] || [];
    const interests = Array.from(new Set(habits.map(h => h.interest)));
    
    return interests.map((interest, i) => {
      const interestHabits = habits.filter(h => h.interest === interest);
      const completed = todayInsts.filter(inst => 
        inst.completed && interestHabits.find(h => h.id === inst.habitId)
      ).length;
      const total = interestHabits.length;
      const value = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      const colors = ['#a855f7', '#3b82f6', '#ec4899', '#06b6d4', '#f59e0b'];
      return {
        label: interest,
        value: value,
        color: colors[i % colors.length]
      };
    }).slice(0, 4);
  }, [habits, currentWeekInstances, today]);

  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const monthName = currentMonth.toLocaleString('default', { month: 'long' });
  const year = currentMonth.getFullYear();

  const schedule = useMemo(() => {
    const todayTasks = tasks.filter(t => !t.completed && (t.dueDate === today || !t.dueDate));
    const todayHabits = habits.filter(h => {
        const inst = (currentWeekInstances[today] || []).find(i => i.habitId === h.id);
        return !inst?.completed;
    });

    const items = [
        ...todayHabits.map(h => ({
            id: h.id,
            title: h.name,
            time: h.schedule === 'Daily' ? 'Morning' : 'Scheduled',
            completed: false,
            type: 'habit'
        })),
        ...todayTasks.map(t => ({
            id: t.id,
            title: t.title,
            time: t.priority === Priority.HIGH ? 'Priority' : 'Today',
            completed: false,
            type: 'task'
        }))
    ];

    return items.slice(0, 5);
  }, [tasks, habits, currentWeekInstances, today]);

  // Destructure toggleTask at top
  const { setActiveTab, toggleTask } = useApp();

  const handleItemToggle = async (item: any) => {
    if (item.type === 'habit') {
        const instId = `${today}_${item.id}`;
        await handleTrigger(instId);
    } else {
        await toggleTask(item.id, true);
    }
  };

  if (habits.length === 0 && tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-8 animate-fade-in">
        <div className="w-32 h-32 bg-white/5 rounded-[3rem] flex items-center justify-center text-slate-500 shadow-glow-blue/10 border border-white/5">
          <Icons.LayoutDashboard size={64} strokeWidth={1} />
        </div>
        <div className="space-y-3">
          <h2 className="text-4xl font-display font-bold text-white tracking-tight">Your Journey Starts Here</h2>
          <p className="text-slate-500 max-w-sm mx-auto text-lg">
            You haven't added any habits or tasks yet. Start by designing your routine or adding your first task.
          </p>
        </div>
        <div className="flex gap-6">
          <button 
            onClick={() => setActiveTab('interests')}
            className="px-10 py-5 bg-habithub-accent text-white rounded-2xl font-bold shadow-glow-blue hover:scale-105 transition-all"
          >
            Add Habits
          </button>
          <button 
            onClick={() => setActiveTab('tasks')}
            className="px-10 py-5 bg-white/5 text-white rounded-2xl font-bold border border-white/10 hover:bg-white/10 transition-all"
          >
            Add Tasks
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-full">
      
      {/* --- MAIN CONTENT (LEFT) --- */}
      <div className="flex-1 p-8 lg:pr-4 overflow-y-auto custom-scrollbar">
        
        {/* Header */}
        <header className="mb-10">
          <h1 className="text-4xl font-display font-bold text-white tracking-tight">
            Unlock Your Best Self, {user?.name.split(' ')[0]}!
          </h1>
          <p className="text-slate-500 mt-2 max-w-xl">
            Elevate the quality of your life and enhance your overall well-being by effortlessly tracking and cultivating positive habits with "HabitHub".
          </p>
        </header>

        {/* Tabs & Chart */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex gap-8">
              {['Activity history', 'Sleep history', 'Science history'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveHistoryTab(tab.split(' ')[0].toLowerCase())}
                  className={`text-sm font-bold uppercase tracking-widest transition-all ${activeHistoryTab === tab.split(' ')[0].toLowerCase() ? 'text-habithub-accent border-b-2 border-habithub-accent pb-1' : 'text-slate-500 hover:text-white'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="flex bg-white/5 rounded-xl p-1">
              {['Today', '7d', '2w', '1m', 'All'].map(range => (
                <button key={range} className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${range === 'Today' ? 'bg-habithub-accent text-white' : 'text-slate-500 hover:text-white'}`}>
                  {range}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[300px] w-full glass-card rounded-[2.5rem] p-8 relative overflow-hidden">
            <div className="absolute top-8 right-8 flex gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-habithub-accent shadow-glow-blue" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Growth Intensity</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorIntensity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.03)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 10, fontWeight: 'bold' }} 
                  dy={10}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#0f172a', 
                    border: '1px solid rgba(255,255,255,0.1)', 
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                  formatter={(value: number) => [`${value}%`, 'Intensity']}
                />
                <Area 
                  type="monotone" 
                  dataKey="intensity" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorIntensity)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {habitStats.map((stat, i) => (
            <StatRing key={i} {...stat} />
          ))}
          {habitStats.length === 0 && (
            <div className="lg:col-span-3 py-12 text-center text-slate-500 font-bold uppercase tracking-widest text-xs">
              Add habits to see your growth rings
            </div>
          )}
        </section>
      </div>

      {/* --- SIDEBAR (RIGHT) --- */}
      <div className="w-full lg:w-[400px] bg-habithub-sidebar/30 backdrop-blur-3xl border-l border-white/5 p-8 flex flex-col gap-10 overflow-y-auto custom-scrollbar">
        
        {/* Calendar */}
        <div className="glass-card rounded-[2.5rem] p-8">
          <div className="flex items-center justify-between mb-8">
            <button 
              onClick={() => setCurrentMonth(new Date(year, currentMonth.getMonth() - 1, 1))}
              className="text-slate-500 hover:text-white transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            <h3 className="font-display font-bold text-lg text-white">{monthName}</h3>
            <button 
              onClick={() => setCurrentMonth(new Date(year, currentMonth.getMonth() + 1, 1))}
              className="text-slate-500 hover:text-white transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>
          <div className="grid grid-cols-7 gap-y-4 text-center">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
              <span key={day} className="text-[9px] font-bold text-slate-500 tracking-widest">{day}</span>
            ))}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isToday = day === new Date().getDate() && currentMonth.getMonth() === new Date().getMonth() && currentMonth.getFullYear() === new Date().getFullYear();
              return (
                <button 
                  key={i} 
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${isToday ? 'bg-habithub-accent text-white shadow-glow-blue' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Schedule */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-display font-bold text-2xl text-white">Schedule</h3>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              {new Date().toLocaleDateString('en-GB').replace(/\//g, '.')}
            </span>
          </div>
          <div className="space-y-4">
            {schedule.map(item => (
              <button 
                key={item.id}
                onClick={() => handleItemToggle(item)}
                className="w-full flex items-center justify-between p-5 rounded-3xl transition-all border border-transparent bg-white/5 hover:border-white/10 text-left"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${item.completed ? 'bg-white border-white' : 'border-white/20'}`}>
                    {item.completed && <Check size={14} className="text-habithub-accent" strokeWidth={4} />}
                  </div>
                  <span className="text-sm font-bold text-slate-300">{item.title}</span>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{item.time}</span>
              </button>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
