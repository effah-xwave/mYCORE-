
import React, { useState, useMemo } from 'react';
import { useApp } from '../App';
import { getWeekDays, formatDate, getDayName, calculateCompletion } from '../utils';
// Add Task and Priority imports to ensure tasks array is correctly typed
import { Habit, HabitInstance, TriggerType, Task, Priority } from '../types';
import * as Icons from 'lucide-react';
import HabitTriggerModal from './HabitTriggerModal';
import HabitDetailModal from './HabitDetailModal';
import AddTaskModal from './AddTaskModal';
import OptimizeRoutineModal from './OptimizeRoutineModal';
import AddHabitModal from './AddHabitModal';
import ArticleReader from './ArticleReader';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckSquare, ArrowRight, Plus, Calendar, MoreHorizontal, 
  TrendingUp, Activity, Zap, Brain, DollarSign, Smartphone, BookOpen,
  BarChart3
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

// --- SUB-COMPONENTS ---

const CircularProgress = ({ value, max, size = 120, color = "#3B82F6", label }: { value: number, max: number, size?: number, color?: string, label?: string }) => {
  const radius = (size - 12) / 2;
  const circumference = radius * 2 * Math.PI;
  const percent = Math.min(100, (value / max) * 100);
  const offset = circumference - (percent / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background Circle */}
        <svg className="transform -rotate-90 w-full h-full">
          <circle
            className="text-slate-200 dark:text-white/5 transition-colors"
            strokeWidth="6"
            stroke="currentColor"
            fill="transparent"
            r={radius}
            cx={size / 2}
            cy={size / 2}
          />
          {/* Progress Circle */}
          <circle
            className="transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
            strokeWidth="6"
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
            <span className="text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">{value}</span>
            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">{label || 'Score'}</span>
        </div>
      </div>
    </div>
  );
};

const FocusAreaTag = ({ name, icon: Icon, active, progress = 0 }: { name: string, icon: any, active: boolean, progress?: number }) => (
  <div className={`
    flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group
    ${active 
        ? 'bg-blue-500/10 border-blue-500/30 shadow-glow' 
        : 'bg-transparent border-slate-200 dark:border-white/5 hover:border-slate-400 dark:hover:border-white/10'
    }
  `}>
    <div className="flex items-center gap-4">
       <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${active ? 'bg-blue-600 text-white' : 'bg-slate-50 dark:bg-white/5 text-slate-400'}`}>
          <Icon size={18} />
       </div>
       <span className={`text-[15px] font-bold ${active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`}>{name}</span>
    </div>
    {/* Progress Bar */}
    <div className="w-16 h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
        <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={`h-full rounded-full ${active ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'}`} 
        />
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
                flex flex-col items-center justify-center w-12 md:w-16 h-20 md:h-24 rounded-[1.5rem] transition-all duration-500
                ${isSelected 
                    ? 'bg-slate-900 text-white shadow-xl scale-110 z-10 dark:bg-white dark:text-black' 
                    : 'text-slate-500 hover:bg-slate-100/10 dark:hover:bg-white/5'
                }
            `}
        >
            <span className="text-[10px] font-bold uppercase tracking-widest mb-2">{dayName}</span>
            <span className={`text-xl md:text-2xl font-display font-bold ${isSelected ? 'text-inherit' : 'text-slate-700 dark:text-slate-200'}`}>{dayNum}</span>
            {isToday && !isSelected && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2" />}
            {hasData && !isSelected && !isToday && <div className="w-1 h-1 bg-slate-100 dark:bg-slate-700 rounded-full mt-2" />}
        </button>
    )
}

// Define HabitItemProps to solve key assignment issues and use React.FC
interface HabitItemProps {
  habit: Habit;
  instance: HabitInstance;
  onTrigger: (inst: HabitInstance) => void;
  onViewDetail: (habit: Habit) => void;
}

const HabitItem: React.FC<HabitItemProps> = ({ habit, instance, onTrigger, onViewDetail }) => {
    const { openArticleReader } = useApp();
    const IconComponent = (Icons as any)[habit.icon] || Icons.Circle;
    const isCompleted = instance?.completed;
    const isReadingHabit = habit.name.toLowerCase().includes('read');

    return (
        <motion.div 
            layout
            initial={false}
            animate={{ 
                scale: isCompleted ? [1, 1.02, 1] : 1,
            }}
            transition={{ duration: 0.3 }}
            onClick={() => onViewDetail(habit)}
            className={`
                group relative flex items-center justify-between p-5 rounded-3xl transition-all duration-300 cursor-pointer border
                ${isCompleted
                    ? 'bg-blue-600/10 border-blue-600/20'
                    : 'bg-slate-50/5 dark:bg-white/5 border-transparent hover:border-slate-100/10 hover:bg-slate-100/10'
                }
            `}
        >
            <div className="flex items-center gap-5">
                <div className={`
                    w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500
                    ${isCompleted ? 'bg-blue-600 text-white shadow-glow' : 'bg-slate-50/10 text-slate-500 dark:text-slate-400'}
                `}>
                    <IconComponent size={20} strokeWidth={2.5} />
                </div>
                <div>
                    <h4 className={`text-[15px] font-bold tracking-tight ${isCompleted ? 'text-slate-500 line-through' : 'text-white'}`}>
                        {habit.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                            {habit.schedule === 'Daily' ? 'DAILY' : 'WEEKDAYS'}
                        </span>
                        <div className="w-1 h-1 bg-slate-700 rounded-full" />
                        <span className="text-[9px] font-bold text-blue-500 uppercase tracking-widest">
                            {habit.interest}
                        </span>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-3">
                {isReadingHabit && !isCompleted && (
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            openArticleReader();
                        }}
                        className="px-3 py-1.5 rounded-xl bg-blue-600/20 text-blue-500 text-[10px] font-bold uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all"
                    >
                        Read
                    </button>
                )}
                <button 
                  onClick={(e) => {
                e.stopPropagation();
                onTrigger(instance);
              }}
              className={`
                w-8 h-8 rounded-2xl border-2 flex items-center justify-center transition-all hover:scale-110 active:scale-90
                ${isCompleted 
                    ? 'bg-blue-600 border-blue-600 shadow-glow' 
                    : 'border-white/10 hover:border-blue-500'
                }
            `}>
                <AnimatePresence mode="wait">
                    {isCompleted && (
                        <motion.div
                            key="check"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        >
                            <Icons.Check size={16} className="text-white" strokeWidth={4} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </button>
            </div>
        </motion.div>
    )
}


export default function Dashboard() {
  const { habits, currentWeekInstances, handleTrigger, user, tasks, projects, deleteHabit, toggleTask } = useApp();
  const weekDays = getWeekDays();
  const today = formatDate(new Date());
  const [selectedDate, setSelectedDate] = useState(today);
  
  const [triggerModal, setTriggerModal] = useState<{ isOpen: boolean, instance: HabitInstance | null, habit: any | null }>({ 
    isOpen: false, instance: null, habit: null 
  });
  
  const [detailModal, setDetailModal] = useState<{ isOpen: boolean, habit: Habit | null }>({
    isOpen: false, habit: null
  });

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showOptimizeModal, setShowOptimizeModal] = useState(false);
  const [showAddHabitModal, setShowAddHabitModal] = useState(false);

  const { setActiveTab, openArticleReader } = useApp();

  // --- PERFORMANCE ENGINE CALCULATIONS ---
  
  const consistency = useMemo(() => {
    const allInstances = Object.values(currentWeekInstances).flat();
    if (allInstances.length === 0) return null;
    const completed = allInstances.filter(i => i.completed).length;
    return Math.round((completed / allInstances.length) * 100);
  }, [currentWeekInstances]);

  const activeGoalsCount = useMemo(() => {
    const activeHabits = habits.length;
    const activeTasks = tasks.filter(t => !t.completed).length;
    const activeProjects = projects.filter(p => p.status === 'active').length;
    return activeHabits + activeTasks + activeProjects;
  }, [habits, tasks, projects]);

  const growthRate = useMemo(() => {
    const dates = Object.keys(currentWeekInstances).sort();
    if (dates.length < 4) return null;
    
    const recentDates = dates.slice(-2);
    const previousDates = dates.slice(-4, -2);
    
    const getRate = (dateList: string[]) => {
      const insts = dateList.flatMap(d => currentWeekInstances[d] || []);
      if (insts.length === 0) return 0;
      return insts.filter(i => i.completed).length / insts.length;
    };
    
    const recentRate = getRate(recentDates);
    const previousRate = getRate(previousDates);
    
    if (previousRate === 0) return recentRate > 0 ? 100 : 0;
    return Math.round(((recentRate - previousRate) / previousRate) * 100);
  }, [currentWeekInstances]);

  const aiInsight = useMemo(() => {
    const categories = ['Health', 'Productivity', 'Learning', 'Detox'];
    const stats = categories.map(cat => {
      const catHabits = habits.filter(h => h.interest === cat);
      if (catHabits.length === 0) return { cat, rate: 0 };
      const insts = Object.values(currentWeekInstances).flat().filter(i => catHabits.some(h => h.id === i.habitId));
      const rate = insts.length > 0 ? insts.filter(i => i.completed).length / insts.length : 0;
      return { cat, rate };
    });
    
    const best = stats.reduce((prev, current) => (prev.rate > current.rate) ? prev : current);
    if (best.rate === 0) return "Start your first habit to get AI insights.";
    if (best.rate === 1) return `Perfect consistency in ${best.cat}! Keep it up.`;
    return `Your focus on ${best.cat} is at ${Math.round(best.rate * 100)}% this week.`;
  }, [habits, currentWeekInstances]);

  const todayXP = useMemo(() => {
    const todayStr = formatDate(new Date());
    const completedToday = tasks.filter(t => t.completed && t.dueDate === todayStr).length;
    const habitCompletions = (currentWeekInstances[todayStr] || []).filter(i => i.completed).length;
    return (completedToday * 50) + (habitCompletions * 20);
  }, [tasks, currentWeekInstances]);

  // Stats Calculations
  const dayInstances = useMemo(() => {
    const existing = currentWeekInstances[selectedDate] || [];
    // For each habit, if no instance exists for this date, create a "virtual" one
    const habitInstances = habits.map(h => {
      const instanceId = `${selectedDate}_${h.id}`;
      const found = existing.find(i => i.habitId === h.id);
      if (found) return found;
      return {
        id: instanceId,
        habitId: h.id,
        date: selectedDate,
        completed: false
      } as HabitInstance;
    });

    // Add tasks for the selected date to the schedule
    const dayTasks = tasks.filter(t => t.dueDate === selectedDate).map(t => ({
      id: t.id,
      habitId: `task_${t.id}`, // Virtual ID for mapping
      date: t.dueDate,
      completed: t.completed,
      isTask: true,
      task: t
    }));

    return [...habitInstances, ...dayTasks];
  }, [habits, currentWeekInstances, selectedDate, tasks]);

  const completedCount = dayInstances.filter(i => i.completed).length;
  const totalCount = dayInstances.length;
  const dayScore = totalCount > 0 ? Math.round((completedCount / totalCount) * 1000) : 0; // Score out of 1000 like credit score
  
  // Focus Area Progress Calculations
  const getInterestProgress = (interest: string) => {
    const interestHabits = habits.filter(h => h.interest === interest);
    if (interestHabits.length === 0) return 0;
    const interestInstances = Object.values(currentWeekInstances).flat().filter(i => interestHabits.some(h => h.id === i.habitId));
    if (interestInstances.length === 0) return 0;
    const completed = interestInstances.filter(i => i.completed).length;
    return Math.round((completed / interestInstances.length) * 100);
  };

  // Use Priority.HIGH enum instead of magic string for better type safety
  const mainTask = tasks.find(t => t.priority === Priority.HIGH && !t.completed) || tasks[0];

  // Weekly Progress Data for Chart
  const weeklyProgressData = useMemo(() => {
    return weekDays.map(date => {
      const dateStr = formatDate(date);
      const dayInsts = currentWeekInstances[dateStr] || [];
      const total = habits.length;
      const completed = dayInsts.filter(i => i.completed).length;
      const score = total > 0 ? Math.round((completed / total) * 100) : 0;
      return {
        name: getDayName(date).substring(0, 3),
        score,
        fullDate: dateStr
      };
    });
  }, [currentWeekInstances, habits, weekDays]);

  const openTrigger = (instance: any) => {
    if (instance.isTask) {
      toggleTask(instance.task.id, !instance.task.completed);
      return;
    }
    const habit = habits.find(h => h.id === instance.habitId);
    if (!habit) return;

    // Special case for Reading Habit
    const isReadingHabit = habit.name.toLowerCase().includes('read') || 
                          habit.interest.toLowerCase().includes('learn') ||
                          habit.name.toLowerCase().includes('market') ||
                          habit.name.toLowerCase().includes('finance');

    if (isReadingHabit) {
        openArticleReader(habit.name);
        return;
    }

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

  const openDetail = (habit: Habit) => {
    setDetailModal({ isOpen: true, habit });
  };

  // Find instances for the selected habit for history visualization
  const getHabitHistory = (habitId: string) => {
    const allInstances: HabitInstance[] = [];
    Object.values(currentWeekInstances).forEach(dayList => {
      const match = (dayList as HabitInstance[]).find(i => i.habitId === habitId);
      if (match) allInstances.push(match);
    });
    return allInstances;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-8">
      
      {/* --- COLUMN 1 & 2 (Left & Middle) --- */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        
        {/* TOP ROW: SCHEDULE CARD (Liquid Glass) */}
        <div className="bg-white dark:bg-dark-card backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-10 shadow-sm dark:shadow-dark-soft border border-slate-200 dark:border-dark-border transition-colors relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
            
            <div className="flex justify-between items-center mb-8 relative z-10">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.2em]">SCHEDULE</span>
                        <div className="w-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-full" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">THIS WEEK</span>
                    </div>
                    <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
                        {new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                    </h2>
                </div>
                <div className="flex gap-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    <button className="hover:text-slate-900 dark:hover:text-white transition-colors text-slate-500">Last Week</button>
                    <button className="text-slate-900 dark:text-white border-b-2 border-blue-500 pb-1">Next Week</button>
                </div>
            </div>

            {/* Calendar Strip */}
            <div className="flex justify-between items-center bg-slate-50 dark:bg-black/20 p-2.5 rounded-[2rem] border border-slate-200 dark:border-dark-border relative z-10">
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
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
                {dayInstances.slice(0, 4).map(inst => {
                    const isTask = (inst as any).isTask;
                    const item = isTask ? (inst as any).task : habits.find(x => x.id === inst.habitId);
                    if (!item) return null;
                    
                    const priority = isTask ? item.priority : (item as Habit).priority || Priority.MEDIUM;
                    const completed = inst.completed;

                    return (
                        <div 
                            key={inst.id} 
                            onClick={() => openTrigger(inst)}
                            className="flex items-center gap-4 p-5 rounded-3xl bg-slate-50 dark:bg-dark-cardHover/20 border border-slate-200 dark:border-dark-border/50 hover:bg-slate-100 dark:hover:bg-dark-cardHover/40 transition-all cursor-pointer group"
                        >
                            <div className={`w-1.5 h-10 ${completed ? 'bg-green-500' : priority === Priority.HIGH ? 'bg-red-500' : 'bg-blue-500'} rounded-full group-hover:h-12 transition-all`} />
                            <div className="flex-1 min-w-0">
                                <h4 className={`font-bold text-slate-900 dark:text-white text-[15px] truncate ${completed ? 'line-through text-slate-400 opacity-60' : ''}`}>
                                    {item.name || (item as any).title}
                                </h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                        {isTask ? 'Task' : (item as Habit).interest}
                                    </p>
                                    <div className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${priority === Priority.HIGH ? 'text-red-500' : 'text-blue-500'}`}>
                                        {priority}
                                    </span>
                                </div>
                            </div>
                            {completed && (
                                <div className="ml-auto text-green-500">
                                    <Icons.CheckCircle2 size={18} />
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>

        {/* BOTTOM ROW: WIDGETS (Bento Style) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Weekly Progress Chart Card */}
            <div className="bg-white dark:bg-dark-card backdrop-blur-xl rounded-[2.5rem] p-8 shadow-sm dark:shadow-dark-soft border border-slate-200 dark:border-dark-border relative overflow-hidden group col-span-1 md:col-span-2 lg:col-span-1">
                <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-100 transition-opacity">
                    <BarChart3 className="text-blue-500" size={24} />
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Weekly Momentum</div>
                <div className="h-40 w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={weeklyProgressData}>
                            <defs>
                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <Tooltip 
                                contentStyle={{ 
                                    borderRadius: '16px', 
                                    border: 'none', 
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                                    backgroundColor: 'rgba(255,255,255,0.9)',
                                    backdropFilter: 'blur(10px)'
                                }}
                                labelStyle={{ fontWeight: 'bold', fontSize: '10px', color: '#64748b' }}
                                itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#3b82f6' }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="score" 
                                stroke="#3B82F6" 
                                strokeWidth={4} 
                                fillOpacity={1} 
                                fill="url(#colorScore)" 
                                animationDuration={2000}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
                <div className="mt-4 flex justify-between items-center">
                    <div className="text-2xl font-display font-bold text-slate-900 dark:text-white">
                        {dayScore}<span className="text-blue-500 text-sm ml-1">pts today</span>
                    </div>
                    <div className="flex gap-1">
                        {weeklyProgressData.map((d, i) => (
                            <div key={i} className={`w-1.5 h-1.5 rounded-full ${d.score > 50 ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Task Card */}
            <div className="bg-[#0A0A0A] dark:bg-dark-card rounded-[2.5rem] p-8 shadow-soft dark:shadow-dark-soft border border-white/5 dark:border-dark-border text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-[50px] translate-x-10 -translate-y-10 group-hover:bg-blue-500/20 transition-all" />
                
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Priority Focus</div>
                <div className="flex flex-col gap-6 relative z-10">
                     <div className="flex items-center gap-5">
                        <div className="w-16 h-16 relative flex items-center justify-center">
                            <svg className="transform -rotate-90 w-full h-full">
                                <circle stroke="rgba(255,255,255,0.05)" strokeWidth="5" fill="transparent" r="28" cx="32" cy="32"/>
                                <circle stroke="#3B82F6" strokeWidth="5" strokeDasharray={176} strokeDashoffset={mainTask ? (mainTask.completed ? 0 : 88) : 176} strokeLinecap="round" fill="transparent" r="28" cx="32" cy="32" className="transition-all duration-1000"/>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-sm font-bold">{todayXP}</span>
                                <span className="text-[7px] uppercase font-bold text-blue-400">XP</span>
                            </div>
                        </div>
                        <div>
                            <div className="text-sm font-bold text-white line-clamp-2 leading-tight">{mainTask?.title || "No active tasks"}</div>
                            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-[9px] font-bold text-blue-400 uppercase tracking-wider mt-2">
                                <Activity size={10} /> Active
                            </div>
                        </div>
                     </div>
                </div>
            </div>

            {/* AI Insights (Small) */}
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden group cursor-pointer">
                <div className="absolute bottom-0 right-0 opacity-10 group-hover:scale-110 transition-transform duration-500">
                    <Brain size={100} />
                </div>
                <div className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-3">AI Insight</div>
                <h3 className="text-xl font-display font-bold leading-tight mb-4">{aiInsight}</h3>
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest group-hover:gap-3 transition-all">
                    View Report <ArrowRight size={12} />
                </div>
            </div>

            {/* Personal AI (Wide) */}
            <div className="md:col-span-2 lg:col-span-3 bg-black dark:bg-[#080808] text-white rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden border border-white/5 group">
                <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-30 transition-opacity">
                    <Zap size={120} className="text-blue-500" />
                </div>
                <div className="flex justify-between items-start mb-8 relative z-10">
                    <div>
                        <h3 className="font-display font-bold text-2xl tracking-tight">Performance Engine</h3>
                        <p className="text-slate-500 text-sm mt-1">Deep analysis of your cognitive output and habit consistency.</p>
                    </div>
                    <button className="w-10 h-10 rounded-full bg-slate-200/5 flex items-center justify-center hover:bg-slate-200/10 transition-all">
                        <MoreHorizontal className="text-slate-400" />
                    </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 relative z-10">
                    <div className="flex flex-col">
                        <span className="text-4xl font-display font-bold tracking-tight">
                            {consistency !== null ? `${consistency}%` : 'NULL'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Consistency</span>
                    </div>
                    <div className="flex flex-col border-l border-white/10 pl-8">
                        <span className="text-4xl font-display font-bold tracking-tight">
                            {activeGoalsCount || 'NULL'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Active Goals</span>
                    </div>
                    <div className="flex flex-col border-l border-white/10 pl-8">
                        <span className="text-4xl font-display font-bold tracking-tight">
                            {growthRate !== null ? `${growthRate > 0 ? '+' : ''}${growthRate}%` : 'NULL'}
                        </span>
                        <span className={`text-[10px] font-bold ${growthRate !== null && growthRate >= 0 ? 'text-green-500' : 'text-red-500'} uppercase tracking-widest mt-1`}>Growth Rate</span>
                    </div>
                </div>
                
                <div className="mt-10 flex items-center gap-4 relative z-10">
                    <button 
                        onClick={() => setShowOptimizeModal(true)}
                        className="px-6 py-3 rounded-2xl bg-slate-50 text-black text-xs font-bold uppercase tracking-widest hover:bg-slate-100 transition-all"
                    >
                        Optimize Routine
                    </button>
                    <button 
                        onClick={() => setActiveTab('analytics')}
                        className="px-6 py-3 rounded-2xl bg-slate-200/5 border border-slate-300/10 text-white text-xs font-bold uppercase tracking-widest hover:bg-slate-200/10 transition-all"
                    >
                        Full Analytics
                    </button>
                </div>
            </div>

        </div>
      </div>

      {/* --- COLUMN 3 (Right Sidebar) --- */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        
        {/* Focus Areas (Liquid Glass) */}
        <div className="bg-white dark:bg-dark-card backdrop-blur-xl rounded-[2.5rem] p-8 shadow-sm dark:shadow-dark-soft border border-slate-200 dark:border-dark-border h-fit">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="font-display font-bold text-2xl text-slate-900 dark:text-white tracking-tight">Focus areas</h3>
                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-1">Growth Engines</p>
                </div>
                <button className="p-2 rounded-xl bg-slate-100 dark:bg-dark-cardHover text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">
                    <Plus size={18} />
                </button>
            </div>
            
            <div className="space-y-4">
                <FocusAreaTag name="Health" icon={Activity} active={true} progress={getInterestProgress('Health') || 0} />
                <FocusAreaTag name="Productivity" icon={Zap} active={false} progress={getInterestProgress('Productivity') || 0} />
                <FocusAreaTag name="Finance" icon={DollarSign} active={false} progress={getInterestProgress('Finance') || 0} />
                <FocusAreaTag name="Learning" icon={BookOpen} active={false} progress={getInterestProgress('Learning') || 0} />
            </div>
        </div>

        {/* Your Core (Habit List) */}
        <div className="bg-[#0A0A0A] dark:bg-dark-card rounded-[2.5rem] p-8 shadow-soft dark:shadow-dark-soft border border-white/5 dark:border-dark-border flex-1 min-h-[400px] flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="font-display font-bold text-2xl text-white tracking-tight">Your Core</h3>
                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mt-1">Daily Rituals</p>
                </div>
                <button className="p-2 rounded-xl bg-slate-200/5 text-slate-500 hover:text-white transition-all">
                    <MoreHorizontal size={18} />
                </button>
            </div>
            
            <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2 no-scrollbar flex-1">
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
                                onViewDetail={openDetail}
                            />
                        )
                    })
                ) : (
                    <div className="text-center py-20 text-slate-600">
                        <Calendar size={40} className="mx-auto mb-4 opacity-20" />
                        <p className="text-sm font-medium">No rituals scheduled for today.</p>
                    </div>
                )}
            </div>
            
            <button 
                onClick={() => setShowAddHabitModal(true)}
                className="mt-8 w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-widest transition-all shadow-glow"
            >
                Add New Habit
            </button>
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

      {detailModal.isOpen && detailModal.habit && (
        <HabitDetailModal 
            habit={detailModal.habit}
            instances={getHabitHistory(detailModal.habit.id)}
            onClose={() => setDetailModal({ isOpen: false, habit: null })}
            onTrigger={() => {
              const inst = dayInstances.find(i => i.habitId === detailModal.habit!.id);
              if (inst) openTrigger(inst);
            }}
            onDelete={() => deleteHabit(detailModal.habit!.id)}
        />
      )}

      {showTaskModal && (
        <AddTaskModal onClose={() => setShowTaskModal(false)} />
      )}

      {showOptimizeModal && (
        <OptimizeRoutineModal onClose={() => setShowOptimizeModal(false)} />
      )}

      {showAddHabitModal && (
        <AddHabitModal onClose={() => setShowAddHabitModal(false)} />
      )}
    </div>
  );
}
