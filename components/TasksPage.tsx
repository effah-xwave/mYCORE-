
import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../App';
import { Task, Project, Priority } from '../types';
import { formatDate } from '../utils';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Calendar as CalendarIcon, List, Clock, Briefcase, 
  Flag, ChevronLeft, ChevronRight, CheckCircle2, Trash2, CheckSquare, Bell,
  Filter, X, Tag, Layers, RotateCcw, ChevronDown, ChevronUp, StickyNote, Save
} from 'lucide-react';
import AddTaskModal from './AddTaskModal';

// --- SUB-COMPONENTS ---

const TaskItem: React.FC<{ 
  task: Task; 
  onToggle: () => void; 
  onDelete: () => void; 
  projectName?: string 
}> = ({ task, onToggle, onDelete, projectName }) => {
  const { updateTask } = useApp();
  const [isToggling, setIsToggling] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [notes, setNotes] = useState(task.notes || '');
  const [isSaving, setIsSaving] = useState(false);

  // Sync notes state with task prop when it changes (e.g. after a save or external update)
  useEffect(() => {
    if (!isExpanded) {
      setNotes(task.notes || '');
    }
  }, [task.notes, isExpanded]);

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsToggling(true);
    onToggle();
    setTimeout(() => setIsToggling(false), 400);
  };

  const saveNotes = async () => {
    setIsSaving(true);
    try {
      await updateTask(task.id, { notes });
    } catch (error) {
      console.error("Failed to save notes", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`
      group flex flex-col transition-all duration-500 border-b border-slate-200 dark:border-white/5 last:border-0 
      ${task.completed ? 'opacity-40 bg-slate-200/30 dark:bg-transparent' : 'hover:bg-slate-200/80 dark:hover:bg-white/[0.02]'}
    `}>
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-start gap-5 p-6 cursor-pointer"
      >
        <button 
          onClick={handleToggle}
          className={`
            mt-1 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-500
            ${isToggling ? 'scale-125' : 'scale-100'}
            ${task.completed 
              ? 'bg-blue-600 border-blue-600 text-white shadow-glow' 
              : 'border-slate-300 dark:border-white/10 hover:border-blue-500 dark:hover:border-blue-500'
            }
          `}
        >
          {task.completed && (
            <CheckCircle2 
              size={16} 
              strokeWidth={3} 
              className="animate-scale-in" 
            />
          )}
        </button>
        
        <div className="flex-1 min-w-0">
          <h4 className={`
            text-lg font-bold leading-tight transition-all duration-500 tracking-tight
            ${task.completed ? 'line-through text-slate-400 italic' : 'text-slate-900 dark:text-white'}
          `}>
            {task.title}
          </h4>
          <div className="flex flex-wrap items-center gap-3 mt-2">
             {projectName && (
               <span className="text-[9px] bg-slate-200 dark:bg-white/5 text-slate-500 dark:text-slate-400 font-black px-2.5 py-1 rounded-lg uppercase tracking-[0.15em] border border-slate-300/50 dark:border-white/5">
                 {projectName}
               </span>
             )}
             {task.priority !== Priority.MEDIUM && (
               <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 ${task.priority === Priority.HIGH ? 'text-red-500' : 'text-blue-500'}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${task.priority === Priority.HIGH ? 'bg-red-500 animate-pulse' : 'bg-blue-500'}`} /> {task.priority}
               </span>
             )}
             <span className={`text-[10px] font-bold flex items-center gap-1.5 uppercase tracking-widest ${new Date(task.dueDate) < new Date() && !task.completed ? 'text-red-500' : 'text-slate-400'}`}>
                <Clock size={12} /> {task.dueDate}
             </span>
             {task.notes && !isExpanded && (
               <span className="text-blue-500/60"><StickyNote size={14} /></span>
             )}
          </div>
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
            <button 
                onClick={(e) => { e.stopPropagation(); onDelete(); }} 
                className="text-slate-300 hover:text-red-500 transition-all duration-200 p-2.5 hover:bg-red-100 dark:hover:bg-red-900/10 rounded-2xl"
            >
                <Trash2 size={18} />
            </button>
            <div className="text-slate-300 p-1">
                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
        </div>
      </div>

      {/* Expanded Notes Section */}
      {isExpanded && (
        <div className="px-16 pb-6 animate-fade-in space-y-4">
            <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    <StickyNote size={14} className="text-blue-500" /> Task Notes
                </label>
                <textarea 
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add detailed notes, steps, or thoughts..."
                    className="w-full bg-slate-200 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl p-4 text-sm text-slate-600 dark:text-slate-300 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500/30 outline-none transition-all resize-none h-32 font-medium"
                />
            </div>
            <div className="flex justify-end">
                <button 
                    onClick={(e) => { e.stopPropagation(); saveNotes(); }}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-blue-500/20"
                >
                    {isSaving ? 'Saving...' : <><Save size={14} /> Save Changes</>}
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

const CalendarView = ({ tasks, onDateSelect, selectedDate }: { tasks: Task[], onDateSelect: (d: string) => void, selectedDate: string }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDay = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const startDay = getFirstDay(year, month);
  const offset = startDay === 0 ? 6 : startDay - 1;

  const days = [];
  for(let i=0; i<offset; i++) days.push(null);
  for(let i=1; i<=daysInMonth; i++) days.push(new Date(year, month, i));

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="bg-white dark:bg-dark-card backdrop-blur-xl p-6 rounded-[2.5rem] shadow-sm dark:shadow-dark-soft border border-slate-200 dark:border-dark-border">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-lg text-slate-900 dark:text-white tracking-tight ml-2">{monthName}</h3>
        <div className="flex gap-1">
            <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-2 hover:bg-slate-300/50 dark:hover:bg-dark-bg rounded-full text-slate-500"><ChevronLeft size={20}/></button>
            <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-2 hover:bg-slate-300/50 dark:hover:bg-dark-bg rounded-full text-slate-500"><ChevronRight size={20}/></button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-2 text-center mb-4">
         {['M','T','W','T','F','S','S'].map((d,i) => <span key={i} className="text-xs font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest">{d}</span>)}
      </div>
      
      <div className="grid grid-cols-7 gap-2">
         {days.map((day, idx) => {
            if(!day) return <div key={idx} />;
            const dateStr = formatDate(day);
            const isSelected = dateStr === selectedDate;
            const isToday = formatDate(new Date()) === dateStr;
            const dayTasks = tasks.filter(t => t.dueDate === dateStr && !t.completed);
            const hasTask = dayTasks.length > 0;

            return (
              <button 
                key={idx}
                onClick={() => onDateSelect(dateStr)}
                className={`
                  relative h-10 w-10 mx-auto rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300
                  ${isSelected 
                    ? 'bg-slate-900 text-white shadow-lg scale-110 dark:bg-blue-600' 
                    : isToday 
                        ? 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 font-bold' 
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-300/50 dark:hover:bg-dark-bg'
                  }
                `}
              >
                {day.getDate()}
                {hasTask && !isSelected && (
                   <div className="absolute bottom-1 w-1 h-1 rounded-full bg-blue-400" />
                )}
              </button>
            )
         })}
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---

export default function TasksPage() {
  const { tasks, projects, toggleTask, deleteTask } = useApp();
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [showTaskModal, setShowTaskModal] = useState(false);

  // Undo System State
  const [lastDeletedTask, setLastDeletedTask] = useState<Task | null>(null);
  const [isUndoVisible, setIsUndoVisible] = useState(false);
  // Fix: Use ReturnType<typeof setTimeout> instead of NodeJS.Timeout to fix namespace error in browser environment
  const undoTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Filter State
  const [showFilters, setShowFilters] = useState(false);
  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  // Derive Data
  const categories = Array.from(new Set(tasks.map(t => t.category).filter(Boolean))).sort();

  // Handle deletion with undo
  const initiateDelete = (task: Task) => {
    // If there's already a task waiting to be deleted, finalize it
    if (lastDeletedTask) {
        finalizeDelete();
    }

    setLastDeletedTask(task);
    setIsUndoVisible(true);

    // Set a timer to finalize the deletion after 5 seconds
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    undoTimerRef.current = setTimeout(() => {
        finalizeDelete();
    }, 5000);
  };

  const finalizeDelete = () => {
    if (lastDeletedTask) {
        deleteTask(lastDeletedTask.id);
        setLastDeletedTask(null);
        setIsUndoVisible(false);
    }
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
  };

  const handleUndo = () => {
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    setLastDeletedTask(null);
    setIsUndoVisible(false);
  };

  // 1. Apply Global Filters (Proj, Cat, Prio) + Exclude pending deletion
  const globalFilteredTasks = tasks.filter(task => {
      // Don't show if currently "deleted" in the undo state
      if (lastDeletedTask && task.id === lastDeletedTask.id) return false;

      // Project Filter
      if (filterProject !== 'all') {
          if (filterProject === 'unassigned') {
              if (task.projectId) return false;
          } else if (task.projectId !== filterProject) {
              return false;
          }
      }
      // Category Filter
      if (filterCategory !== 'all' && task.category !== filterCategory) return false;
      // Priority Filter
      if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
      
      return true;
  });

  // 2. Apply View Specific Logic (Date sorting or filtering)
  const displayTasks = view === 'list' 
    ? [...globalFilteredTasks].sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    : globalFilteredTasks.filter(t => t.dueDate === selectedDate);

  const activeFiltersCount = (filterProject !== 'all' ? 1 : 0) + (filterCategory !== 'all' ? 1 : 0) + (filterPriority !== 'all' ? 1 : 0);

  const clearFilters = () => {
      setFilterProject('all');
      setFilterCategory('all');
      setFilterPriority('all');
  };
  
  return (
    <div className="space-y-8 pb-20 relative min-h-[80vh]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Daily Execution</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Consistency is the bridge between goals and accomplishment.</p>
        </div>
        <div className="flex bg-slate-100 dark:bg-dark-card/50 backdrop-blur-sm p-1 rounded-2xl shadow-sm border border-slate-200 dark:border-dark-border transition-all w-fit self-end md:self-auto">
           <button onClick={() => setView('list')} className={`p-2.5 rounded-xl transition-all ${view === 'list' ? 'bg-white dark:bg-dark-card text-slate-900 dark:text-white shadow-sm' : 'text-slate-400'}`}>
              <List size={20} />
           </button>
           <button onClick={() => setView('calendar')} className={`p-2.5 rounded-xl transition-all ${view === 'calendar' ? 'bg-white dark:bg-dark-card text-slate-900 dark:text-white shadow-sm' : 'text-slate-400'}`}>
              <CalendarIcon size={20} />
           </button>
        </div>
      </div>

      {/* TASKS & CALENDAR GRID */}
      <div className={`grid grid-cols-1 ${view === 'calendar' ? 'lg:grid-cols-2' : ''} gap-8`}>
         
         {view === 'calendar' && (
            <div className="animate-fade-in-up">
              <CalendarView 
                tasks={globalFilteredTasks} 
                onDateSelect={setSelectedDate} 
                selectedDate={selectedDate} 
              />
            </div>
         )}

         <div className="bg-white dark:bg-dark-card backdrop-blur-xl rounded-[2.5rem] p-8 shadow-sm dark:shadow-dark-soft border border-slate-200 dark:border-dark-border min-h-[500px] relative animate-fade-in-up flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {view === 'calendar' ? `${new Date(selectedDate).toLocaleDateString(undefined, {weekday: 'long'})}` : 'Task Feed'}
                </h3>
                <p className="text-slate-500 font-medium text-sm mt-1">{displayTasks.filter(t => !t.completed).length} pending items</p>
              </div>
              
              <div className="flex gap-2">
                 <button 
                    onClick={() => setShowFilters(!showFilters)} 
                    className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all ${showFilters || activeFiltersCount > 0 ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600' : 'bg-slate-300/50 dark:bg-dark-bg text-slate-400 hover:bg-slate-300/80 dark:hover:bg-dark-cardHover'}`}
                 >
                    <Filter size={20} />
                    {activeFiltersCount > 0 && !showFilters && (
                        <span className="absolute top-0 right-0 w-4 h-4 bg-blue-500 rounded-full text-[10px] text-white flex items-center justify-center border-2 border-slate-300 dark:border-dark-card">
                            {activeFiltersCount}
                        </span>
                    )}
                 </button>
                 <button 
                    onClick={() => setShowTaskModal(true)}
                    className="w-12 h-12 bg-slate-900 dark:bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-90 transition-all group"
                >
                    <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                </button>
              </div>
            </div>

            {/* FILTER PANEL */}
            {showFilters && (
                <div className="flex flex-wrap gap-3 mb-6 animate-fade-in p-4 bg-slate-50 dark:bg-dark-bg/50 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-dark-border shadow-inner">
                    {/* Project */}
                    <div className="relative">
                        <select 
                            value={filterProject} 
                            onChange={(e) => setFilterProject(e.target.value)}
                            className="appearance-none pl-9 pr-8 py-2 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 focus:outline-none focus:border-slate-900 dark:focus:border-blue-500 focus:ring-1 focus:ring-slate-900/10 cursor-pointer min-w-[140px]"
                        >
                            <option value="all">All Projects</option>
                            <option value="unassigned">No Project</option>
                            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Category */}
                    <div className="relative">
                        <select 
                            value={filterCategory} 
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="appearance-none pl-9 pr-8 py-2 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 focus:outline-none focus:border-slate-900 dark:focus:border-blue-500 focus:ring-1 focus:ring-slate-900/10 cursor-pointer min-w-[130px]"
                        >
                            <option value="all">All Categories</option>
                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Priority */}
                    <div className="relative">
                        <select 
                            value={filterPriority} 
                            onChange={(e) => setFilterPriority(e.target.value)}
                            className="appearance-none pl-9 pr-8 py-2 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 focus:outline-none focus:border-slate-900 dark:focus:border-blue-500 focus:ring-1 focus:ring-slate-900/10 cursor-pointer min-w-[120px]"
                        >
                            <option value="all">All Priorities</option>
                            {Object.values(Priority).map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                        <Flag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Clear */}
                    {activeFiltersCount > 0 && (
                        <button 
                            onClick={clearFilters}
                            className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border hover:bg-red-100 dark:hover:bg-red-900/20 hover:border-red-200 hover:text-red-500 rounded-xl text-xs font-bold text-slate-500 transition-all ml-auto"
                        >
                            <X size={14} /> Clear
                        </button>
                    )}
                </div>
            )}

            <div className="space-y-1 overflow-y-auto pr-2 flex-1 custom-scrollbar">
               <AnimatePresence mode="popLayout">
               {displayTasks.length > 0 ? (
                  displayTasks.map(task => (
                    <motion.div
                        key={task.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                    >
                        <TaskItem 
                            task={task} 
                            onToggle={() => toggleTask(task.id, !task.completed)}
                            onDelete={() => initiateDelete(task)}
                            projectName={projects.find(p => p.id === task.projectId)?.name}
                        />
                    </motion.div>
                  ))
               ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-300 dark:text-slate-600">
                     <div className="w-20 h-20 bg-slate-200 dark:bg-dark-bg rounded-full flex items-center justify-center mb-4 border border-slate-200 dark:border-dark-border shadow-inner">
                        <CheckSquare size={32} strokeWidth={1.5} />
                     </div>
                     <p className="font-medium">No tasks match your selection</p>
                     {(view === 'calendar' && activeFiltersCount === 0) && <p className="text-sm mt-1">Design a new task for this date.</p>}
                     {activeFiltersCount > 0 && (
                        <button onClick={clearFilters} className="mt-4 text-xs font-bold text-slate-900 dark:text-blue-500 underline">Clear Filters</button>
                     )}
                  </div>
               )}
               </AnimatePresence>
            </div>
         </div>
      </div>

      {/* UNDO NOTIFICATION (Liquid Glass Toast) */}
      {isUndoVisible && lastDeletedTask && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-fade-in-up">
            <div className="bg-slate-900/80 dark:bg-dark-card/90 backdrop-blur-2xl px-6 py-4 rounded-[1.5rem] shadow-2xl border border-slate-300/20 dark:border-dark-border flex items-center gap-6 min-w-[320px]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-300/10 rounded-full flex items-center justify-center text-white">
                        <Trash2 size={18} />
                    </div>
                    <div>
                        <p className="text-white text-sm font-bold truncate max-w-[150px]">Task Removed</p>
                        <p className="text-white/50 text-[10px] font-bold uppercase tracking-widest">Finalizing in 5s...</p>
                    </div>
                </div>
                <button 
                    onClick={handleUndo}
                    className="ml-auto flex items-center gap-2 bg-slate-200 text-slate-900 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-300 transition-all active:scale-95 shadow-lg"
                >
                    <RotateCcw size={14} /> Undo
                </button>
            </div>
        </div>
      )}

      {showTaskModal && <AddTaskModal onClose={() => setShowTaskModal(false)} />}
    </div>
  );
}
