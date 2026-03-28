
import React, { useState } from 'react';
import { useApp } from '../App';
import { Project, Task, Priority } from '../types';
import { 
  Plus, Briefcase, Clock, Calendar, CheckCircle2, 
  ChevronRight, MoreVertical, Filter, Search, 
  TrendingUp, Activity, BarChart3, ArrowRight, X, Minus, Trash2, Archive
} from 'lucide-react';
import AddProjectModal from './AddProjectModal';

// --- SUB-COMPONENTS ---

const ProjectDetailModal: React.FC<{ project: Project; tasks: Task[]; onClose: () => void }> = ({ project, tasks, onClose }) => {
  const { updateProject, deleteProject } = useApp();
  const projectTasks = tasks.filter(t => t.projectId === project.id);
  const [manualProgress, setManualProgress] = useState(project.progress);
  const themeColor = project.color || '#3B82F6';
  
  const handleProgressChange = (newVal: number) => {
    const clamped = Math.min(100, Math.max(0, newVal));
    setManualProgress(clamped);
    updateProject(project.id, { progress: clamped });
  };

  const handleArchive = () => {
    updateProject(project.id, { status: project.status === 'archived' ? 'active' : 'archived' });
    onClose();
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this project? Tasks will become unassigned.")) {
        deleteProject(project.id);
        onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-100 dark:bg-dark-card w-full max-w-4xl max-h-[90vh] rounded-[2.5rem] shadow-2xl border border-white/20 dark:border-dark-border flex flex-col md:flex-row overflow-hidden animate-scale-in">
        
        {/* Left Panel: Info */}
        <div className="w-full md:w-2/5 p-8 bg-slate-200/50 dark:bg-dark-bg/50 border-r border-slate-100 dark:border-dark-border flex flex-col">
          <div className="flex justify-between items-start mb-8">
            <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg transition-colors"
                style={{ backgroundColor: themeColor, boxShadow: `0 8px 20px ${themeColor}30` }}
            >
              <Briefcase size={32} />
            </div>
            <button onClick={onClose} className="md:hidden p-2 rounded-full hover:bg-slate-200 transition-colors">
              <X size={20} className="text-slate-400" />
            </button>
          </div>

          <h2 className="text-3xl font-bold text-slate-900 dark:text-white leading-tight mb-4">{project.name}</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mb-8 leading-relaxed">
            {project.description || 'Enhancing potential through focused execution and consistent milestone tracking.'}
          </p>

          <div className="space-y-6 mt-auto">
             <div className="flex items-center gap-4">
                <div 
                    className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-dark-card flex items-center justify-center border border-slate-100 dark:border-dark-border shadow-sm"
                    style={{ color: themeColor }}
                >
                   <Calendar size={18} />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Timeline</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">{project.startDate} — {project.endDate}</div>
                </div>
             </div>

             <div className="p-6 rounded-[2rem] bg-slate-100 dark:bg-dark-card border border-slate-100 dark:border-dark-border shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                   <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Manual Progress</span>
                   <span className="text-xl font-bold" style={{ color: themeColor }}>{manualProgress}%</span>
                </div>
                
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={manualProgress} 
                  onChange={(e) => handleProgressChange(parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-dark-bg rounded-full appearance-none cursor-pointer accent-current"
                  style={{ color: themeColor } as any}
                />
                
                <div className="flex justify-between items-center pt-2">
                   <button 
                    onClick={() => handleProgressChange(manualProgress - 5)}
                    className="p-2 rounded-xl bg-slate-200/50 dark:bg-dark-bg hover:bg-slate-200 dark:hover:bg-dark-cardHover text-slate-500 transition-all border border-slate-100 dark:border-dark-border"
                   >
                     <Minus size={14} />
                   </button>
                   <span className="text-[10px] font-bold text-slate-400 uppercase">Adjust Progress</span>
                   <button 
                    onClick={() => handleProgressChange(manualProgress + 5)}
                    className="p-2 rounded-xl bg-slate-200/50 dark:bg-dark-bg hover:bg-slate-200 dark:hover:bg-dark-cardHover text-slate-500 transition-all border border-slate-100 dark:border-dark-border"
                   >
                     <Plus size={14} />
                   </button>
                </div>
             </div>

             {/* Options Section */}
             <div className="grid grid-cols-2 gap-3 pt-4">
                <button 
                    onClick={handleArchive}
                    className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-100 dark:bg-dark-card border border-slate-100 dark:border-dark-border text-slate-600 dark:text-slate-400 font-bold text-xs hover:bg-slate-200 transition-all"
                >
                    <Archive size={14} /> {project.status === 'archived' ? 'Restore' : 'Archive'}
                </button>
                <button 
                    onClick={handleDelete}
                    className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 text-red-600 font-bold text-xs hover:bg-red-100 transition-all"
                >
                    <Trash2 size={14} /> Delete
                </button>
             </div>
          </div>
        </div>

        {/* Right Panel: Task List */}
        <div className="flex-1 p-8 flex flex-col bg-slate-100 dark:bg-dark-card">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Project Tasks</h3>
              <button onClick={onClose} className="hidden md:block p-2 rounded-full hover:bg-slate-200 transition-colors">
                 <X size={20} className="text-slate-400" />
              </button>
           </div>

           <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
              {projectTasks.length > 0 ? (
                projectTasks.map(task => (
                  <div key={task.id} className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 dark:border-dark-border hover:bg-slate-50 dark:hover:bg-dark-cardHover transition-all">
                     <div 
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${task.completed ? 'text-white' : 'border-slate-300'}`}
                        style={{ 
                            backgroundColor: task.completed ? themeColor : 'transparent',
                            borderColor: task.completed ? themeColor : undefined 
                        }}
                     >
                        {task.completed && <CheckCircle2 size={12} strokeWidth={3} />}
                     </div>
                     <div className="flex-1">
                        <h4 className={`text-sm font-bold ${task.completed ? 'text-slate-400 line-through' : 'text-slate-900 dark:text-white'}`}>{task.title}</h4>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{task.dueDate}</span>
                     </div>
                     <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        task.priority === Priority.HIGH ? 'bg-red-50 text-red-500' : 
                        task.priority === Priority.MEDIUM ? 'bg-blue-50 text-blue-500' : 'bg-slate-50 text-slate-500'
                     }`}>
                        {task.priority}
                     </span>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-50">
                   <CheckCircle2 size={48} strokeWidth={1} className="mb-4" />
                   <p className="font-medium text-sm text-center">No tasks assigned.<br/>Progress managed manually.</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

const ProjectGridCard: React.FC<{ project: Project; tasks: Task[]; onClick: () => void }> = ({ project, tasks, onClick }) => {
  const { updateProject } = useApp();
  const projectTasks = tasks.filter(t => t.projectId === project.id);
  const completedTasks = projectTasks.filter(t => t.completed).length;
  const totalTasks = projectTasks.length;
  const themeColor = project.color || '#3B82F6';

  const quickProgress = (e: React.MouseEvent, increment: number) => {
    e.stopPropagation();
    const newVal = Math.min(100, Math.max(0, project.progress + increment));
    updateProject(project.id, { progress: newVal });
  };

  return (
    <div 
      onClick={onClick}
      className={`group bg-slate-200/60 dark:bg-dark-card backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/40 dark:border-dark-border shadow-glass dark:shadow-dark-soft hover:shadow-apple transition-all duration-500 cursor-pointer relative overflow-hidden flex flex-col h-full ${project.status === 'archived' ? 'opacity-40 grayscale-[0.8]' : ''}`}
    >
      <div className="flex justify-between items-start mb-8">
        <div 
            className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg"
            style={{ backgroundColor: `${themeColor}20`, color: themeColor, boxShadow: `0 10px 20px ${themeColor}20` }}
        >
          <Briefcase size={24} />
        </div>
        <div 
            className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-white shadow-lg transition-all duration-500`}
            style={{ backgroundColor: project.status === 'active' ? themeColor : '#475569' }}
        >
            {project.status}
        </div>
      </div>

      <h3 className="text-2xl font-display font-bold text-slate-900 dark:text-white mb-3 line-clamp-1 group-hover:translate-x-1 transition-transform tracking-tight">
        {project.name}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium line-clamp-2 mb-8 h-10 leading-relaxed tracking-tight">
        {project.description || 'Execution focus and deadline tracking for major growth initiatives.'}
      </p>

      <div className="mt-auto space-y-6">
        <div className="flex justify-between items-end">
          <div className="space-y-1.5">
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] block">Execution Stats</span>
            <span className="text-lg font-display font-bold text-slate-900 dark:text-white tracking-tight">
                {completedTasks}<span className="text-slate-400 dark:text-slate-600 text-sm font-bold tracking-normal"> / {totalTasks} Tasks</span>
            </span>
          </div>
          <div className="flex gap-2">
             <button 
              onClick={(e) => quickProgress(e, -10)}
              className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0"
             >
                <Minus size={16} />
             </button>
             <button 
              onClick={(e) => quickProgress(e, 10)}
              className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-white/5 flex items-center justify-center text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0"
             >
                <Plus size={16} />
             </button>
          </div>
        </div>

        <div className="space-y-3">
            <div className="flex justify-between items-center text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
                <span>Progress</span>
                <span className="font-display font-bold text-sm" style={{ color: themeColor }}>{project.progress}%</span>
            </div>
            <div className="relative h-3 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden border border-slate-200/50 dark:border-white/5">
                <div 
                    className="absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    style={{ 
                        width: `${project.progress}%`, 
                        backgroundColor: themeColor,
                        boxShadow: project.progress > 0 ? `0 0 15px ${themeColor}80` : 'none'
                    }}
                />
            </div>
        </div>
      </div>

      <div 
        className="absolute top-0 right-0 w-40 h-40 rounded-full blur-[60px] translate-x-12 -translate-y-12 group-hover:scale-150 transition-all duration-1000 opacity-20" 
        style={{ backgroundColor: themeColor }}
      />
    </div>
  );
};

// --- MAIN COMPONENT ---

export default function ProjectsPage() {
  const { projects, tasks, refreshData } = useApp();
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'archived'>('all');
  const [search, setSearch] = useState('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredProjects = projects.filter(p => {
    const matchesFilter = filter === 'all' || p.status === filter;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const activeDetailProject = selectedProject ? projects.find(p => p.id === selectedProject.id) || selectedProject : null;

  const activeCount = projects.filter(p => p.status === 'active').length;
  const avgProgress = projects.length > 0 ? Math.round(projects.reduce((acc, p) => acc + p.progress, 0) / projects.length) : 0;
  const completedCount = projects.filter(p => p.status === 'completed').length;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* 1. Header & Stats Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Project Hub</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Design and track high-level roadmap initiatives.</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-slate-900 dark:bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-navy-900/20 dark:shadow-blue-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
        >
          <Plus size={20} /> New Project
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-slate-200/60 dark:bg-dark-card backdrop-blur-xl p-6 rounded-[2rem] border border-white/40 dark:border-dark-border shadow-glass dark:shadow-dark-soft flex items-center gap-6">
            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400">
               <Activity size={24} />
            </div>
            <div>
               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Initiatives</div>
               <div className="text-2xl font-bold text-slate-900 dark:text-white">{activeCount}</div>
            </div>
         </div>
         <div className="bg-slate-200/60 dark:bg-dark-card backdrop-blur-xl p-6 rounded-[2rem] border border-white/40 dark:border-dark-border shadow-glass dark:shadow-dark-soft flex items-center gap-6">
            <div className="w-14 h-14 bg-green-50 dark:bg-green-500/10 rounded-2xl flex items-center justify-center text-green-600 dark:text-green-400">
               <TrendingUp size={24} />
            </div>
            <div>
               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Progress</div>
               <div className="text-2xl font-bold text-slate-900 dark:text-white">{avgProgress}%</div>
            </div>
         </div>
         <div className="bg-slate-200/60 dark:bg-dark-card backdrop-blur-xl p-6 rounded-[2rem] border border-white/40 dark:border-dark-border shadow-glass dark:shadow-dark-soft flex items-center gap-6">
            <div className="w-14 h-14 bg-purple-50 dark:bg-purple-500/10 rounded-2xl flex items-center justify-center text-purple-600 dark:text-purple-400">
               <BarChart3 size={24} />
            </div>
            <div>
               <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Units</div>
               <div className="text-2xl font-bold text-slate-900 dark:text-white">{projects.length}</div>
            </div>
         </div>
      </div>

      {/* 2. Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
         <div className="flex bg-slate-200/40 dark:bg-dark-card/50 backdrop-blur-sm p-1.5 rounded-2xl border border-white/50 dark:border-dark-border shadow-sm w-full md:w-auto overflow-x-auto no-scrollbar">
            {['all', 'active', 'completed', 'archived'].map(f => (
               <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`px-6 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                     filter === f 
                        ? 'bg-slate-100 dark:bg-dark-card text-slate-900 dark:text-white shadow-sm' 
                        : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                  }`}
               >
                  {f}
               </button>
            ))}
         </div>

         <div className="relative w-full md:w-72">
            <input 
               type="text" 
               placeholder="Search projects..."
               value={search}
               onChange={(e) => setSearch(e.target.value)}
               className="w-full h-12 pl-12 pr-4 bg-slate-200/40 dark:bg-dark-card/50 backdrop-blur-sm border border-white/50 dark:border-dark-border rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-400"
            />
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
         </div>
      </div>

      {/* 3. Project Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <ProjectGridCard 
                key={project.id} 
                project={project} 
                tasks={tasks}
                onClick={() => setSelectedProject(project)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-slate-200/40 dark:bg-dark-card/30 backdrop-blur-md rounded-[3rem] p-20 border-2 border-dashed border-white/50 dark:border-dark-border flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-slate-200 dark:bg-dark-bg rounded-full flex items-center justify-center text-slate-300 dark:text-slate-700 mb-6">
               <Briefcase size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No projects found</h3>
            <p className="text-slate-500 max-w-xs leading-relaxed">Adjust your filters or start fresh with a new initiative.</p>
            <button 
               onClick={() => setShowAddModal(true)}
               className="mt-6 text-blue-600 font-bold hover:underline flex items-center gap-2"
            >
               Create New Initiative <ArrowRight size={16} />
            </button>
        </div>
      )}

      {/* Modals */}
      {activeDetailProject && (
        <ProjectDetailModal 
          project={activeDetailProject} 
          tasks={tasks} 
          onClose={() => setSelectedProject(null)} 
        />
      )}

      {showAddModal && (
         <AddProjectModal onClose={() => setShowAddModal(false)} />
      )}
    </div>
  );
}
