import React, { useState } from 'react';
import { useApp } from '../App';
import { Task, Project, Priority } from '../types';
import { formatDate } from '../utils';
import { 
  Plus, Calendar as CalendarIcon, List, Clock, Briefcase, 
  Flag, ChevronLeft, ChevronRight, CheckCircle2, Trash2, CheckSquare, Bell
} from 'lucide-react';
import AddTaskModal from './AddTaskModal';
import AddProjectModal from './AddProjectModal';

// --- SUB-COMPONENTS ---

const ProjectCard: React.FC<{ project: Project }> = ({ project }) => (
  <div className="min-w-[240px] bg-white p-5 rounded-3xl border border-slate-100 shadow-soft snap-center hover:border-navy-100 transition-all">
    <div className="flex justify-between items-start mb-4">
       <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
          <Briefcase size={20} />
       </div>
       <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${project.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
         {project.status}
       </span>
    </div>
    <h3 className="font-bold text-navy-900 truncate">{project.name}</h3>
    <p className="text-xs text-slate-400 mb-4 line-clamp-1">{project.description || 'No description'}</p>
    
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] text-slate-400 uppercase font-semibold">
        <span>Progress</span>
        <span>{project.progress}%</span>
      </div>
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
         <div className="h-full bg-navy-900 rounded-full transition-all duration-1000" style={{ width: `${project.progress}%` }} />
      </div>
    </div>
    <div className="mt-3 text-[10px] text-slate-400 flex items-center gap-1">
        <Clock size={10} /> Due {project.endDate}
    </div>
  </div>
);

const TaskItem: React.FC<{ task: Task; onToggle: () => void; onDelete: () => void; projectName?: string }> = ({ task, onToggle, onDelete, projectName }) => (
  <div className={`group flex items-start gap-3 p-3 rounded-2xl transition-all border ${task.completed ? 'bg-slate-50 border-transparent opacity-60' : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'}`}>
    <button 
      onClick={onToggle}
      className={`mt-1 w-5 h-5 rounded-full border flex items-center justify-center transition-all ${task.completed ? 'bg-navy-900 border-navy-900 text-white' : 'border-slate-300 hover:border-navy-900'}`}
    >
      {task.completed && <CheckCircle2 size={12} />}
    </button>
    
    <div className="flex-1">
      <h4 className={`text-sm font-medium ${task.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
        {task.title}
      </h4>
      <div className="flex items-center gap-2 mt-1">
         {projectName && <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded-md">{projectName}</span>}
         <span className={`text-[10px] flex items-center gap-0.5 ${task.priority === Priority.HIGH ? 'text-red-500 font-semibold' : 'text-slate-400'}`}>
            <Flag size={10} /> {task.priority}
         </span>
         <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
            <Clock size={10} /> {task.dueDate}
         </span>
      </div>
    </div>

    <button onClick={onDelete} className="text-slate-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-1">
       <Trash2 size={14} />
    </button>
  </div>
);

const CalendarView = ({ tasks, onDateSelect, selectedDate }: { tasks: Task[], onDateSelect: (d: string) => void, selectedDate: string }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDay = (year: number, month: number) => new Date(year, month, 1).getDay(); // 0 Sun

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const startDay = getFirstDay(year, month);
  const offset = startDay === 0 ? 6 : startDay - 1; // Adjust for Mon start

  const days = [];
  // Blanks
  for(let i=0; i<offset; i++) days.push(null);
  // Days
  for(let i=1; i<=daysInMonth; i++) days.push(new Date(year, month, i));

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-soft">
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-1 hover:bg-slate-50 rounded-full"><ChevronLeft size={18}/></button>
        <h3 className="font-bold text-navy-900">{monthName}</h3>
        <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-1 hover:bg-slate-50 rounded-full"><ChevronRight size={18}/></button>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center mb-2">
         {['M','T','W','T','F','S','S'].map((d,i) => <span key={i} className="text-xs font-bold text-slate-300">{d}</span>)}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
         {days.map((day, idx) => {
            if(!day) return <div key={idx} />;
            const dateStr = formatDate(day);
            const isSelected = dateStr === selectedDate;
            const isToday = formatDate(new Date()) === dateStr;
            const dayTasks = tasks.filter(t => t.dueDate === dateStr && !t.completed);
            const hasTask = dayTasks.length > 0;
            const hasHighPriority = dayTasks.some(t => t.priority === Priority.HIGH);

            return (
              <button 
                key={idx}
                onClick={() => onDateSelect(dateStr)}
                className={`
                  relative h-9 rounded-xl flex items-center justify-center text-xs font-medium transition-all
                  ${isSelected ? 'bg-navy-900 text-white shadow-md' : 'hover:bg-slate-50 text-slate-600'}
                  ${isToday && !isSelected ? 'text-blue-600 font-bold bg-blue-50' : ''}
                `}
              >
                {day.getDate()}
                {hasTask && !isSelected && (
                   <div className={`absolute bottom-1 w-1 h-1 rounded-full ${hasHighPriority ? 'bg-red-400' : 'bg-navy-400'}`} />
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
  const [showProjectModal, setShowProjectModal] = useState(false);

  // Filter Tasks
  const filteredTasks = view === 'list' 
    ? tasks.sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    : tasks.filter(t => t.dueDate === selectedDate);
  
  // Stats
  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-navy-900">Tasks & Projects</h2>
        <div className="flex bg-slate-100 p-1 rounded-xl">
           <button onClick={() => setView('list')} className={`p-2 rounded-lg transition-all ${view === 'list' ? 'bg-white shadow-sm text-navy-900' : 'text-slate-400'}`}>
              <List size={18} />
           </button>
           <button onClick={() => setView('calendar')} className={`p-2 rounded-lg transition-all ${view === 'calendar' ? 'bg-white shadow-sm text-navy-900' : 'text-slate-400'}`}>
              <CalendarIcon size={18} />
           </button>
        </div>
      </div>

      {/* PROJECTS SCROLL */}
      {view === 'list' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
             <h3 className="text-sm font-bold text-slate-400 uppercase">Active Projects</h3>
             <button onClick={() => setShowProjectModal(true)} className="text-navy-900 text-xs font-semibold hover:underline">+ New Project</button>
          </div>
          {projects.length > 0 ? (
             <div className="flex overflow-x-auto gap-4 pb-4 no-scrollbar snap-x">
                {projects.map(p => <ProjectCard key={p.id} project={p} />)}
             </div>
          ) : (
             <div onClick={() => setShowProjectModal(true)} className="border-2 border-dashed border-slate-200 rounded-3xl p-6 text-center text-slate-400 cursor-pointer hover:border-navy-200 hover:text-navy-900 transition-all">
                <Briefcase size={24} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm font-medium">Create your first project</p>
             </div>
          )}
        </div>
      )}

      {/* CALENDAR & TASKS */}
      <div className={`grid grid-cols-1 ${view === 'calendar' ? 'md:grid-cols-2' : ''} gap-6`}>
         
         {view === 'calendar' && (
            <div>
              <CalendarView 
                tasks={tasks} 
                onDateSelect={setSelectedDate} 
                selectedDate={selectedDate} 
              />
              <div className="mt-4 bg-blue-50 p-4 rounded-2xl flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                    <Clock size={16} />
                 </div>
                 <div>
                    <h4 className="text-sm font-bold text-blue-900">Smart Schedule</h4>
                    <p className="text-xs text-blue-600/80">Tap any date to see or add tasks.</p>
                 </div>
              </div>
            </div>
         )}

         <div className="bg-white rounded-[2rem] p-6 shadow-soft border border-slate-100 min-h-[400px] relative">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-navy-900">
                    {view === 'calendar' ? `Tasks for ${new Date(selectedDate).toLocaleDateString(undefined, {month:'short', day:'numeric'})}` : 'All Tasks'}
                </h3>
                <p className="text-slate-400 text-sm mt-1">{filteredTasks.filter(t => !t.completed).length} pending</p>
              </div>
              <button 
                onClick={() => setShowTaskModal(true)}
                className="w-10 h-10 bg-navy-900 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-all"
              >
                <Plus size={20} />
              </button>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto no-scrollbar pr-1">
               {filteredTasks.length > 0 ? (
                  filteredTasks.map(task => (
                    <TaskItem 
                        key={task.id} 
                        task={task} 
                        onToggle={() => toggleTask(task.id, !task.completed)}
                        onDelete={() => deleteTask(task.id)}
                        projectName={projects.find(p => p.id === task.projectId)?.name}
                    />
                  ))
               ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-slate-300">
                     <CheckSquare size={48} strokeWidth={1} className="mb-2" />
                     <p className="text-sm">No tasks found.</p>
                     {view === 'calendar' && <p className="text-xs">Tap + to add one for this day.</p>}
                  </div>
               )}
            </div>
         </div>
      </div>

      {showTaskModal && <AddTaskModal onClose={() => setShowTaskModal(false)} />}
      {showProjectModal && <AddProjectModal onClose={() => setShowProjectModal(false)} />}
    </div>
  );
}