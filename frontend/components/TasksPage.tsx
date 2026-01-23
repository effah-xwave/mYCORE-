import React, { useState } from "react";
import { useApp } from "../App";
import { Task, Project, Priority } from "../types";
import { formatDate } from "../utils";
import {
  Plus,
  Calendar as CalendarIcon,
  List,
  Clock,
  Briefcase,
  Flag,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Trash2,
  CheckSquare,
  Bell,
  Filter,
  X,
  Tag,
  Layers,
  Repeat,
} from "lucide-react";
import AddTaskModal from "./AddTaskModal";
import AddProjectModal from "./AddProjectModal";
import { HabitInstance } from "../types";

// --- SUB-COMPONENTS ---

const ProjectCard: React.FC<{ project: Project }> = ({ project }) => (
  <div className="min-w-[240px] bg-white p-6 rounded-[2rem] shadow-soft border border-slate-100/50 hover:shadow-apple hover:border-slate-200 transition-all duration-500 cursor-pointer group">
    <div className="flex justify-between items-start mb-5">
      <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
        <Briefcase size={20} />
      </div>
      <div className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg uppercase tracking-wider font-sans">
        {project.progress}%
      </div>
    </div>
    <h3 className="font-bold text-slate-900 text-base mb-1 tracking-tight group-hover:text-indigo-600 transition-colors">
      {project.name}
    </h3>
    <p className="text-[13px] text-slate-400 mb-6 line-clamp-1 font-medium italic">
      "{project.description || "Focusing on results..."}"
    </p>

    <div className="space-y-3">
      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-indigo-600 rounded-full transition-all duration-1000 ease-out shadow-indigo-200 shadow-lg"
          style={{ width: `${project.progress}%` }}
        />
      </div>
      <div className="flex justify-between items-center text-[9px] text-slate-400 uppercase font-black tracking-widest font-sans">
        <span
          className={project.status === "completed" ? "text-green-500" : ""}
        >
          {project.status}
        </span>
        <span className="flex items-center gap-1 opacity-70">
          <Clock size={8} /> {project.endDate}
        </span>
      </div>
    </div>
  </div>
);

const TaskItem: React.FC<{
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
  projectName?: string;
}> = ({ task, onToggle, onDelete, projectName }) => (
  <div
    className={`group flex items-start gap-5 p-5 rounded-[1.8rem] transition-all duration-500 border ${
      task.completed
        ? "opacity-40 grayscale-[0.5] border-transparent"
        : "bg-white dark:bg-dark-card shadow-soft border-slate-100/50 dark:border-dark-border/30 hover:shadow-apple hover:border-slate-200 dark:hover:border-dark-border/80"
    }`}
  >
    <button
      onClick={onToggle}
      className={`mt-0.5 w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
        task.completed
          ? "bg-indigo-600 border-indigo-600 text-white shadow-indigo-200 shadow-lg"
          : "border-slate-200 group-hover:border-indigo-400 hover:scale-110"
      }`}
    >
      {task.completed && <CheckCircle2 size={16} strokeWidth={3} />}
    </button>

    <div className="flex-1 min-w-0">
      <h4
        className={`text-[16px] font-semibold leading-relaxed tracking-tight ${task.completed ? "line-through text-slate-400" : "text-slate-800"}`}
      >
        {task.title}
      </h4>
      <div className="flex flex-wrap items-center gap-3 mt-1">
        {projectName && (
          <span className="text-[9px] bg-slate-100 text-slate-500 font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter">
            {projectName}
          </span>
        )}
        {task.priority !== Priority.MEDIUM && (
          <span
            className={`text-[10px] font-black flex items-center gap-1 uppercase tracking-wide font-sans ${task.priority === Priority.HIGH ? "text-rose-500" : "text-sky-500"}`}
          >
            {task.priority}
          </span>
        )}
        <span
          className={`text-[11px] font-bold flex items-center gap-1.5 ${new Date(task.dueDate) < new Date() && !task.completed ? "text-rose-500" : "text-slate-400"}`}
        >
          <CalendarIcon size={12} className="opacity-50" /> {task.dueDate}
        </span>
      </div>
    </div>

    <button
      onClick={onDelete}
      className="text-slate-200 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all duration-300 p-2 transform group-hover:translate-x-0 translate-x-2"
    >
      <Trash2 size={18} />
    </button>
  </div>
);

const HabitItem: React.FC<{
  instance: HabitInstance;
  name: string;
  completed: boolean;
  onToggle: () => void;
}> = ({ instance, name, completed, onToggle }) => (
  <div
    className={`group flex items-center gap-5 p-5 rounded-[1.8rem] transition-all duration-500 border ${
      completed
        ? "opacity-40 grayscale-[0.5] border-transparent"
        : "bg-white dark:bg-dark-card shadow-soft border-slate-100/50 dark:border-dark-border/30 hover:shadow-apple hover:border-slate-200 dark:hover:border-dark-border/80"
    }`}
  >
    <button
      onClick={onToggle}
      className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
        completed
          ? "bg-sky-500 border-sky-500 text-white shadow-sky-100 shadow-lg"
          : "border-slate-200 group-hover:border-sky-400 hover:scale-110"
      }`}
    >
      {completed && <CheckSquare size={16} strokeWidth={3} />}
    </button>

    <div className="flex-1 min-w-0">
      <h4
        className={`text-[16px] font-semibold leading-relaxed tracking-tight ${completed ? "line-through text-slate-400" : "text-slate-800"}`}
      >
        {name}
      </h4>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-[9px] uppercase font-black text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full tracking-tighter flex items-center gap-1 font-sans">
          <Repeat size={10} /> Core Habit
        </span>
      </div>
    </div>
  </div>
);

const CalendarView = ({
  tasks,
  onDateSelect,
  selectedDate,
}: {
  tasks: Task[];
  onDateSelect: (d: string) => void;
  selectedDate: string;
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (year: number, month: number) =>
    new Date(year, month + 1, 0).getDate();
  const getFirstDay = (year: number, month: number) =>
    new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const startDay = getFirstDay(year, month);
  const offset = startDay === 0 ? 6 : startDay - 1;

  const days = [];
  for (let i = 0; i < offset; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));

  const monthName = currentDate.toLocaleString("default", {
    month: "long",
  });

  return (
    <div className="bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] shadow-apple border border-white/50">
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-black text-xl text-slate-900 tracking-tight ml-2">
          {monthName} <span className="font-normal text-slate-400">{year}</span>
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-500 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-3 text-center mb-6">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <span
            key={i}
            className="text-[10px] font-black text-slate-300 uppercase tracking-widest font-sans"
          >
            {d}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-3">
        {days.map((day, idx) => {
          if (!day) return <div key={idx} />;
          const dateStr = formatDate(day);
          const isSelected = dateStr === selectedDate;
          const isToday = formatDate(new Date()) === dateStr;
          const dayTasks = tasks.filter(
            (t) => t.dueDate === dateStr && !t.completed,
          );
          const hasTask = dayTasks.length > 0;

          return (
            <button
              key={idx}
              onClick={() => onDateSelect(dateStr)}
              className={`
                  relative h-12 w-12 mx-auto rounded-2xl flex items-center justify-center text-sm font-bold transition-all duration-500
                  ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-glow scale-110"
                      : isToday
                        ? "text-indigo-600 bg-indigo-50 font-black"
                        : "text-slate-600 hover:bg-slate-50"
                  }
                `}
            >
              {day.getDate()}
              {hasTask && !isSelected && (
                <div className="absolute bottom-2 w-1 h-1 rounded-full bg-indigo-300 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---

export default function TasksPage() {
  const {
    tasks,
    projects,
    toggleTask,
    deleteTask,
    habits,
    currentWeekInstances,
    handleTrigger,
  } = useApp();
  const [view, setView] = useState<"list" | "calendar">("list");
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);

  // Filter State
  const [showFilters, setShowFilters] = useState(false);
  const [filterProject, setFilterProject] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");

  // Derive Data
  const categories = Array.from(
    new Set(tasks.map((t) => t.category).filter(Boolean)),
  ).sort();

  // 1. Apply Global Filters (Proj, Cat, Prio)
  const globalFilteredTasks = tasks.filter((task) => {
    // Project Filter
    if (filterProject !== "all") {
      if (filterProject === "unassigned") {
        if (task.projectId) return false;
      } else if (task.projectId !== filterProject) {
        return false;
      }
    }
    // Category Filter
    if (filterCategory !== "all" && task.category !== filterCategory)
      return false;
    // Priority Filter
    if (filterPriority !== "all" && task.priority !== filterPriority)
      return false;

    return true;
  });

  // 2. Apply View Specific Logic (Date sorting or filtering)
  const displayTasks =
    view === "list"
      ? [...globalFilteredTasks].sort(
          (a, b) =>
            new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
        )
      : globalFilteredTasks.filter((t) => t.dueDate === selectedDate);

  const activeFiltersCount =
    (filterProject !== "all" ? 1 : 0) +
    (filterCategory !== "all" ? 1 : 0) +
    (filterPriority !== "all" ? 1 : 0);

  const clearFilters = () => {
    setFilterProject("all");
    setFilterCategory("all");
    setFilterPriority("all");
  };

  // Merge Habits for Display (Only for "Unassigned" or "All" filters essentially, or dedicated view)
  // For simplicity, we show habits if View is Calendar OR if View is List and Date is today logic (but List is usually all tasks).
  // Let's Append Habits to the LIST view if they are for TODAY, and to Calendar View for Selected Date.

  const relevantDate = view === "list" ? formatDate(new Date()) : selectedDate;
  const todaysHabitInstances = currentWeekInstances[relevantDate] || [];

  // Filter habits based on current filters (e.g. if filtering by "Personal", maybe habits match?)
  // For now, habits show when filters are clear
  const showHabits = activeFiltersCount === 0;

  return (
    <div className="space-y-12 pb-20 max-w-6xl mx-auto">
      <div className="flex items-end justify-between px-2">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">
            Today
          </h2>
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-2 font-sans">
            {formatDate(new Date())}
          </p>
        </div>
        <div className="flex bg-slate-100/50 backdrop-blur-sm p-1 rounded-2xl border border-slate-200/50">
          <button
            onClick={() => setView("list")}
            className={`px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 text-xs font-black uppercase tracking-tighter ${view === "list" ? "bg-white text-indigo-600 shadow-soft" : "text-slate-400 hover:text-slate-600"}`}
          >
            <List size={16} /> List
          </button>
          <button
            onClick={() => setView("calendar")}
            className={`px-4 py-2 rounded-xl transition-all duration-300 flex items-center gap-2 text-xs font-black uppercase tracking-tighter ${view === "calendar" ? "bg-white text-indigo-600 shadow-soft" : "text-slate-400 hover:text-slate-600"}`}
          >
            <CalendarIcon size={16} /> Calendar
          </button>
        </div>
      </div>

      {/* PROJECTS HORIZONTAL SCROLL */}
      {view === "list" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between px-4">
            <h3 className="text-xs font-black text-slate-300 uppercase tracking-[0.2em] font-sans">
              Active Projects
            </h3>
            <button
              onClick={() => setShowProjectModal(true)}
              className="text-indigo-600 text-[10px] font-black hover:opacity-70 transition-opacity tracking-widest uppercase font-sans"
            >
              New Project
            </button>
          </div>
          {projects.length > 0 ? (
            <div className="flex overflow-x-auto gap-6 pb-6 no-scrollbar snap-x px-4">
              {projects.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
              <button
                onClick={() => setShowProjectModal(true)}
                className="min-w-[140px] flex flex-col items-center justify-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] hover:border-indigo-400 hover:bg-white transition-all duration-500 text-slate-300 hover:text-indigo-600 group"
              >
                <Plus
                  size={28}
                  className="group-hover:scale-125 transition-transform"
                />
                <span className="text-[10px] font-black mt-3 uppercase tracking-tighter">
                  Add Project
                </span>
              </button>
            </div>
          ) : (
            <div
              onClick={() => setShowProjectModal(true)}
              className="mx-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2.5rem] py-12 text-center text-slate-400 cursor-pointer hover:border-indigo-400 hover:bg-white transition-all duration-700"
            >
              <Briefcase size={32} className="mx-auto mb-3 opacity-30" />
              <p className="font-bold tracking-tight text-slate-500">
                Create your first project
              </p>
            </div>
          )}
        </div>
      )}

      {/* TASKS & CALENDAR GRID */}
      <div
        className={`grid grid-cols-1 ${view === "calendar" ? "lg:grid-cols-2" : ""} gap-12`}
      >
        {view === "calendar" && (
          <div className="animate-fade-in-up">
            <CalendarView
              tasks={globalFilteredTasks}
              onDateSelect={setSelectedDate}
              selectedDate={selectedDate}
            />
          </div>
        )}

        <div className="animate-fade-in-up">
          <div className="flex items-center justify-between mb-8 px-4">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                {view === "calendar"
                  ? `${new Date(selectedDate).toLocaleDateString(undefined, { weekday: "long" })}`
                  : "Tasks"}
              </h3>
              <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-2 font-sans">
                {displayTasks.filter((t) => !t.completed).length} items
                remaining
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`relative w-12 h-12 rounded-[1.2rem] flex items-center justify-center transition-all duration-500 border ${showFilters || activeFiltersCount > 0 ? "bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-200" : "bg-white border-slate-100 text-slate-400 hover:border-slate-300"}`}
              >
                <Filter size={20} />
                {activeFiltersCount > 0 && !showFilters && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-indigo-600 rounded-full text-[10px] text-white font-black flex items-center justify-center border-2 border-white">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setShowTaskModal(true)}
                className="w-12 h-12 bg-indigo-600 text-white rounded-[1.2rem] flex items-center justify-center shadow-indigo-200 shadow-2xl hover:scale-110 active:scale-95 transition-all duration-500"
              >
                <Plus size={24} strokeWidth={3} />
              </button>
            </div>
          </div>

          {/* FILTER PANEL */}
          {showFilters && (
            <div className="flex flex-wrap gap-4 mb-10 animate-scale-in p-6 bg-white/50 backdrop-blur-md rounded-[2rem] border border-slate-100 shadow-soft mx-2">
              {/* Project */}
              <div className="relative group">
                <select
                  value={filterProject}
                  onChange={(e) => setFilterProject(e.target.value)}
                  className="appearance-none pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-black uppercase tracking-wider text-slate-600 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all cursor-pointer min-w-[150px] font-sans"
                >
                  <option value="all">All Projects</option>
                  <option value="unassigned">No Project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                <Briefcase
                  size={14}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none transition-colors group-focus-within:text-indigo-600"
                />
              </div>

              {/* Category */}
              <div className="relative group font-sans">
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="appearance-none pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-black uppercase tracking-wider text-slate-600 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all cursor-pointer min-w-[140px]"
                >
                  <option value="all">All Categories</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                <Tag
                  size={14}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none transition-colors group-focus-within:text-indigo-600"
                />
              </div>

              {/* Priority */}
              <div className="relative group font-sans">
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="appearance-none pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-100 rounded-2xl text-[11px] font-black uppercase tracking-wider text-slate-600 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all cursor-pointer min-w-[130px]"
                >
                  <option value="all">Priority</option>
                  {Object.values(Priority).map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <Flag
                  size={14}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none transition-colors group-focus-within:text-indigo-600"
                />
              </div>

              {/* Clear */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-5 py-2.5 bg-rose-50 text-rose-600 rounded-2xl text-[11px] font-black uppercase tracking-[0.1em] hover:bg-rose-100 transition-all ml-auto font-sans"
                >
                  <X size={14} /> Reset
                </button>
              )}
            </div>
          )}

          <div className="space-y-4 max-h-[800px] overflow-y-auto pr-4 no-scrollbar">
            {/* HABITS SECTION (If applicable) */}
            {showHabits && todaysHabitInstances.length > 0 && (
              <div className="mb-10 group/section animate-fade-in">
                <div className="flex items-center gap-4 mb-4 px-4">
                  <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] font-sans">
                    {view === "list" ? "Daily Routine" : "Focus Habits"}
                  </h4>
                  <div className="h-px flex-1 bg-slate-100 group-hover/section:bg-sky-100 transition-colors" />
                </div>
                <div className="space-y-2">
                  {todaysHabitInstances.map((inst) => {
                    const habit = habits.find((h) => h.id === inst.habitId);
                    if (!habit) return null;
                    return (
                      <HabitItem
                        key={inst.id}
                        instance={inst}
                        name={habit.name}
                        completed={inst.completed}
                        onToggle={() => handleTrigger(inst.id)}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {displayTasks.length > 0 ? (
              <div className="animate-fade-in-up delay-100">
                <div className="flex items-center gap-4 mb-4 px-4">
                  <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] font-sans">
                    Actions
                  </h4>
                  <div className="h-px flex-1 bg-slate-100" />
                </div>
                <div className="space-y-2">
                  {displayTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onToggle={() => toggleTask(task.id, !task.completed)}
                      onDelete={() => deleteTask(task.id)}
                      projectName={
                        projects.find((p) => p.id === task.projectId)?.name
                      }
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                <div className="w-20 h-20 bg-slate-50/50 rounded-full flex items-center justify-center mb-6">
                  <CheckSquare
                    size={32}
                    strokeWidth={1}
                    className="opacity-40"
                  />
                </div>
                <p className="font-bold tracking-tight text-slate-400">
                  Clear for now
                </p>
                {view === "calendar" && activeFiltersCount === 0 && (
                  <p className="text-[11px] font-bold uppercase tracking-widest mt-2 opacity-50 font-sans">
                    Tap + to schedule
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showTaskModal && (
        <AddTaskModal onClose={() => setShowTaskModal(false)} />
      )}
      {showProjectModal && (
        <AddProjectModal onClose={() => setShowProjectModal(false)} />
      )}
    </div>
  );
}
