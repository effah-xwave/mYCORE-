
import React, { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Habit, HabitInstance, InterestType, Task, Project } from './types';
import { db } from './services/mockDb';
import { AuthService } from './services/auth';
import { FirebaseAuthService } from './services/firebaseAuth';
import { formatDate, getWeekDays } from './utils';
import { NotificationService } from './services/notificationService';

// Icons
import { 
  LayoutDashboard, Compass, BarChart2, Settings, Loader2, CheckSquare, 
  LogOut, Sun, Moon, Search, Bell, Menu, X, Briefcase, Navigation, Sparkles, Zap
} from 'lucide-react';

// Components
import Auth from './components/Auth';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import Interests from './components/Interests';
import Analytics from './components/Analytics';
import SettingsPage from './components/SettingsPage';
import TutorialOverlay from './components/TutorialOverlay';
import TasksPage from './components/TasksPage';
import ProjectsPage from './components/ProjectsPage';
import MapsAgent from './components/MapsAgent';
import GrowthChatbot from './components/GrowthChatbot';
import OptimizeRoutineModal from './components/OptimizeRoutineModal';
import LoadingTransition from './components/LoadingTransition';
import ArticleReader from './components/ArticleReader';

// --- CONTEXT ---
// Export AppContextType to assist in type inference for consumers like Dashboard
export interface AppContextType {
  user: User | null;
  habits: Habit[];
  currentWeekInstances: Record<string, HabitInstance[]>;
  tasks: Task[];
  projects: Project[];
  refreshData: () => Promise<void>;
  isLoading: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  completeOnboarding: (interests: InterestType[], finalHabits: Habit[], permissions: any) => Promise<void>;
  handleTrigger: (instanceId: string, value?: number) => Promise<void>;
  updateSettings: (settings: User['settings']) => Promise<void>;
  resetApp: (hard?: boolean) => Promise<void>;
  isAuthenticated: boolean;
  handleLoginSuccess: (email: string, name: string) => void;
  // Task Helpers
  addTask: (task: Task) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  toggleTask: (taskId: string, completed: boolean) => Promise<void>;
  addProject: (project: Project) => Promise<void>;
  updateProject: (projectId: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  // Habit Helpers
  addHabit: (habit: Habit) => Promise<void>;
  deleteHabit: (habitId: string) => Promise<void>;
  toggleHabitFavorite: (habitId: string) => Promise<void>;
  getInstancesForRange: (startDate: string, endDate: string) => Promise<HabitInstance[]>;
  // Coach
  updateCoachName: (newName: string) => Promise<void>;
  // Article Reader
  openArticleReader: (query?: string) => void;
  isTutorialOpen: boolean;
  setIsTutorialOpen: (open: boolean) => void;
  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

// --- MAIN APP ---

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentWeekInstances, setCurrentWeekInstances] = useState<Record<string, HabitInstance[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [remindersSent, setRemindersSent] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [isArticleReaderOpen, setIsArticleReaderOpen] = useState(false);
  const [articleQuery, setArticleQuery] = useState<string | undefined>(undefined);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  // Initialize Theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Check Auth Status on Mount
  useEffect(() => {
    const unsubscribe = FirebaseAuthService.subscribeToAuthChanges(async (fbUser) => {
      if (fbUser) {
        setIsAuthenticated(true);
        await loadUserProfile(fbUser.email || '', fbUser.displayName || fbUser.email?.split('@')[0] || 'User');
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const loadUserProfile = async (email: string, name: string) => {
    setIsLoading(true);
    try {
        const u = await db.initUser(email, name);
        setUser(u);
        if (u && u.onboarded) {
            await refreshData();
            setShowTransition(true);
        }
    } catch (e) {
        console.error("Failed to load user profile", e);
    }
    setIsLoading(false);
  };

  const handleLoginSuccess = async (email: string, name: string) => {
    // Auth listener will handle the state change and load profile
    setShowTransition(true);
  };

  const refreshData = async () => {
    const u = await db.getUser();
    setUser(u);
    
    if (u && u.onboarded) {
      const weekDates = getWeekDays().map(formatDate);
      const instances = await db.getWeekInstances(weekDates);
      
      const grouped: Record<string, HabitInstance[]> = {};
      weekDates.forEach(d => grouped[d] = []);
      instances.forEach(i => {
        const date = i.date; 
        if (grouped[date]) grouped[date].push(i);
      });
      setCurrentWeekInstances(grouped);
    }
  };

  // Real-time Subscriptions
  useEffect(() => {
    if (user && user.onboarded) {
      const unsubHabits = db.subscribeToHabits((h) => setHabits(h));
      const unsubTasks = db.subscribeToTasks((t) => setTasks(t));
      const unsubProjects = db.subscribeToProjects((p) => setProjects(p));

      return () => {
        unsubHabits();
        unsubTasks();
        unsubProjects();
      };
    }
  }, [user?.id, user?.onboarded]);

  // Check for Reminders
  useEffect(() => {
    if (user?.settings.notificationsEnabled && !remindersSent) {
      const checkReminders = () => {
        const today = formatDate(new Date());
        
        // 1. Habits
        const todaysInstances = currentWeekInstances[today] || [];
        if (todaysInstances.length > 0 && habits.length > 0) {
            NotificationService.sendReminderForHabits(habits, todaysInstances);
        }

        // 2. Tasks
        const dueTasks = tasks.filter(t => !t.completed && t.dueDate === today);
        if (dueTasks.length > 0) {
           NotificationService.send('Task Reminder', `You have ${dueTasks.length} tasks due today: ${dueTasks.map(t => t.title).join(', ')}`);
        }
        
        setRemindersSent(true);
      };

      // Delay check slightly
      const timer = setTimeout(checkReminders, 3000);
      return () => clearTimeout(timer);
    }
  }, [user, habits, tasks, currentWeekInstances, remindersSent]);

  const completeOnboarding = async (interests: InterestType[], finalHabits: Habit[], permissions: any) => {
    if (!user) return;
    setIsLoading(true);
    await db.completeOnboarding(user.id, interests, finalHabits, permissions);
    await refreshData();
    setIsLoading(false);
    setShowTransition(true);
  };

  const updateSettings = async (newSettings: User['settings']) => {
    if (user) {
      const updatedUser = { ...user, settings: newSettings };
      setUser(updatedUser);
      await db.updateUserSettings(newSettings);
      if (newSettings.notificationsEnabled) {
        await NotificationService.requestPermission();
      }
    }
  };

  const handleTrigger = async (instanceId: string, value?: number) => {
    const [dateStr, habitId] = instanceId.split('_'); 
    let targetDate = dateStr;
    let target: HabitInstance | null = null;
    
    // Search in current week structure
    for(const d in currentWeekInstances) {
        const found = currentWeekInstances[d].find(i => i.id === instanceId);
        if (found) {
            targetDate = d;
            target = found;
            break;
        }
    }

    // If not found, it might be a virtual instance
    if (!target && habitId) {
        const habit = habits.find(h => h.id === habitId);
        if (habit) {
            target = {
                id: instanceId,
                habitId: habit.id,
                date: targetDate,
                completed: false
            };
        }
    }
    
    if (target) {
        const habit = habits.find(h => h.id === target?.habitId);
        
        let newState = !target.completed;
        
        // If Habit has a Goal, calculate completion based on value
        if (habit?.goal && value !== undefined) {
             newState = value >= habit.goal.target;
        }
        
        const newInstances = { ...currentWeekInstances };
        if (!newInstances[targetDate]) newInstances[targetDate] = [];

        const existingIndex = newInstances[targetDate].findIndex(i => i.id === instanceId);
        if (existingIndex >= 0) {
            newInstances[targetDate] = newInstances[targetDate].map(i => 
                i.id === instanceId ? { ...i, completed: newState, value: value !== undefined ? value : i.value } : i
            );
        } else {
            newInstances[targetDate] = [...newInstances[targetDate], { ...target, completed: newState, value: value !== undefined ? value : target.value }];
        }
        
        setCurrentWeekInstances(newInstances);

        if (newState && user?.settings.notificationsEnabled) {
            if (habit && habit.streak >= 3) {
                 if (Math.random() > 0.7) NotificationService.sendStreakCongratulation(habit.name, habit.streak);
            }
            const allDone = newInstances[targetDate].every(i => i.completed);
            if (allDone) {
                NotificationService.sendCompletionCongratulation();
            }
        }
        await db.updateInstanceStatus(instanceId, newState, value);
    }
  };

  const resetApp = async (hard: boolean = false) => {
    if (hard) {
      await db.resetUser();
      // After resetUser, the user object will be updated via subscription or manually
      const u = await db.getUser();
      setUser(u);
    } else {
      await AuthService.logout();
      await db.reset();
      setIsAuthenticated(false);
      setUser(null);
      setHabits([]);
      setTasks([]);
      setProjects([]);
      setCurrentWeekInstances({});
      setActiveTab('dashboard');
      setShowTransition(false);
    }
  }

  // --- TASK ACTIONS ---
  const addTask = async (task: Task) => {
    await db.addTask(task);
    await refreshData();
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    await db.updateTask(taskId, updates);
    await refreshData();
  };

  const toggleTask = async (taskId: string, completed: boolean) => {
    await updateTask(taskId, { completed });
  };

  const addProject = async (project: Project) => {
    await db.addProject(project);
    await refreshData();
  };

  const updateProject = async (projectId: string, updates: Partial<Project>) => {
    await db.updateProject(projectId, updates);
    await refreshData();
  };

  const deleteProject = async (projectId: string) => {
    await db.deleteProject(projectId);
    await refreshData();
  };

  const addHabit = async (habit: Habit) => {
    await db.addHabit(habit);
    await refreshData();
  };

  const deleteHabit = async (habitId: string) => {
    await db.deleteHabit(habitId);
    await refreshData();
  };

  const deleteTask = async (taskId: string) => {
    await db.deleteTask(taskId);
    await refreshData();
  };
  
  const toggleHabitFavorite = async (habitId: string) => {
    await db.toggleHabitFavorite(habitId);
    await refreshData();
  };

  const getInstancesForRange = async (startDate: string, endDate: string) => {
    return await db.getInstancesForRange(startDate, endDate);
  };

  const updateCoachName = async (newName: string) => {
    await db.updateCoachName(newName);
    await refreshData();
  };

  const openArticleReader = (query?: string) => {
    setArticleQuery(query);
    setIsArticleReaderOpen(true);
  };


  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-dark-bg text-slate-900 dark:text-white relative overflow-hidden transition-colors duration-500">
        <div className="relative z-10 flex flex-col items-center">
            <Loader2 className="w-10 h-10 animate-spin text-slate-400 dark:text-white/50 mb-4" />
            <p className="text-sm font-medium opacity-50">Loading Core...</p>
        </div>
      </div>
    );
  }

  const contextValue = { 
    user, habits, currentWeekInstances, tasks, projects, refreshData, isLoading, 
    activeTab, setActiveTab, completeOnboarding, handleTrigger, 
    updateSettings, 
    resetApp: (hard?: boolean) => resetApp(hard),
    isAuthenticated, handleLoginSuccess,
    addTask, updateTask, toggleTask, addProject, updateProject, deleteProject, deleteTask, 
    addHabit, deleteHabit, toggleHabitFavorite,
    getInstancesForRange,
    updateCoachName,
    openArticleReader,
    isTutorialOpen,
    setIsTutorialOpen,
    theme, toggleTheme
  };

  return (
    <AppContext.Provider value={contextValue}>
      {showTransition && user ? (
        <LoadingTransition 
          userName={user.name} 
          onComplete={() => setShowTransition(false)} 
        />
      ) : !isAuthenticated ? (
        <Auth onSuccess={handleLoginSuccess} />
      ) : !user ? (
        <div className="flex items-center justify-center h-screen bg-slate-50 dark:bg-dark-bg">
           <div className="flex flex-col items-center gap-4">
             <Loader2 className="animate-spin text-navy-900 dark:text-blue-600" size={40} />
             <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Initializing your profile...</p>
           </div>
        </div>
      ) : !user?.onboarded ? (
        <Onboarding />
      ) : (
        <div className="flex h-screen bg-slate-50 dark:bg-dark-bg transition-colors duration-500 font-sans text-slate-900 dark:text-dark-text overflow-hidden relative">
          
          {/* LIQUID GLASS AMBIENT BACKGROUND (Light Mode Only) */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden dark:opacity-0 transition-opacity duration-1000">
             <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-slate-400/30 rounded-full blur-[120px] mix-blend-multiply animate-blob" />
             <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-slate-400/30 rounded-full blur-[120px] mix-blend-multiply animate-blob animation-delay-2000" />
             <div className="absolute bottom-[-20%] left-[20%] w-[50vw] h-[50vw] bg-slate-400/30 rounded-full blur-[120px] mix-blend-multiply animate-blob animation-delay-4000" />
          </div>

          {/* SIDEBAR NAVIGATION (Desktop) */}
          <aside className="hidden md:flex flex-col w-20 lg:w-72 bg-white dark:bg-dark-card backdrop-blur-2xl border-r border-slate-200 dark:border-dark-border transition-all duration-300 z-50">
             <div className="h-20 flex items-center justify-center lg:justify-start lg:px-8 border-b border-slate-100 dark:border-dark-border/50">
                <div className="relative group flex items-center gap-3">
                  <div className="w-10 h-10 bg-white dark:bg-dark-card rounded-xl flex items-center justify-center shadow-glow transition-all group-hover:scale-110 overflow-hidden border border-slate-200 dark:border-dark-border">
                    <img 
                      src="https://drive.google.com/thumbnail?id=1Cn2hUpBxHLJ_6QmG8JYxJ9mjAgpDJa5f&sz=w128" 
                      alt="myCORE" 
                      className="w-8 h-8 object-contain"
                      referrerPolicy="no-referrer"
                      onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.nextElementSibling?.classList.remove('hidden'); }}
                    />
                    <span className="hidden text-[10px] font-bold text-slate-900 dark:text-white">CORE</span>
                  </div>
                  <span className="hidden lg:block font-display font-bold text-2xl tracking-tight text-slate-900 dark:text-white">myCORE</span>
                </div>
             </div>

             <nav className="flex-1 py-8 flex flex-col gap-1.5 px-4">
                {[
                  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                  { id: 'growth', label: 'Growth AI', icon: Sparkles },
                  { id: 'optimize', label: 'Optimize', icon: Zap },
                  { id: 'projects', label: 'Projects', icon: Briefcase },
                  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
                  { id: 'navigator', label: 'Navigator', icon: Navigation },
                  { id: 'interests', label: 'Interests', icon: Compass },
                  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
                  { id: 'settings', label: 'Settings', icon: Settings },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      relative group flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300
                      ${activeTab === tab.id 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                      }
                    `}
                  >
                    <tab.icon size={22} strokeWidth={activeTab === tab.id ? 2.5 : 2} className="shrink-0" />
                    <span className="hidden lg:block font-semibold text-[15px]">{tab.label}</span>
                    
                    {/* Floating Tooltip for Collapsed State */}
                    <div className="lg:hidden absolute left-full ml-4 px-3 py-2 bg-slate-900 dark:bg-dark-card text-white text-xs font-bold rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-[100] shadow-2xl border border-slate-200 dark:border-dark-border translate-x-[-10px] group-hover:translate-x-0">
                      {tab.label}
                      <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-slate-900 dark:border-r-dark-border" />
                    </div>
                    {activeTab === tab.id && (
                        <motion.div 
                          layoutId="activeTab"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full lg:hidden" 
                        />
                    )}
                  </button>
                ))}
             </nav>

             <div className="p-6 border-t border-slate-100 dark:border-dark-border">
                <button 
                  onClick={() => resetApp(false)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/10 transition-all font-medium"
                >
                  <LogOut size={22} />
                  <span className="hidden lg:block text-[15px]">Logout</span>
                </button>
             </div>
          </aside>

          {/* MAIN CONTENT AREA */}
          <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
             
             {/* TOP HEADER */}
             <header className="h-20 bg-white/80 dark:bg-dark-bg/80 backdrop-blur-xl border-b border-slate-200 dark:border-dark-border flex items-center justify-between px-8 z-40 transition-colors duration-300">
                
                {/* Mobile Menu Trigger */}
                <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2 -ml-2 text-slate-900 dark:text-white"
                >
                   {isMobileMenuOpen ? <X /> : <Menu />}
                </button>

                {/* Search Bar */}
                <div className="hidden md:flex items-center gap-3 bg-slate-50 dark:bg-dark-card px-5 py-2.5 rounded-2xl w-full max-w-md border border-slate-200 dark:border-dark-border focus-within:border-blue-500 transition-all shadow-sm">
                   <Search size={18} className="text-slate-400" />
                   <input 
                      placeholder="Search anything..." 
                      className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-500 text-slate-900 dark:text-white font-medium"
                   />
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-5">
                   <button 
                      onClick={toggleTheme}
                      className="group relative w-11 h-11 rounded-2xl flex items-center justify-center text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-dark-cardHover transition-all border border-transparent hover:border-slate-200 dark:hover:border-dark-border"
                   >
                      {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                      <div className="absolute top-full mt-3 px-3 py-2 bg-slate-900 dark:bg-dark-card text-white text-[10px] font-bold rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-[100] shadow-2xl border border-slate-200 dark:border-dark-border translate-y-[-5px] group-hover:translate-y-0">
                        {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-8 border-transparent border-b-slate-900 dark:border-b-dark-border" />
                      </div>
                   </button>
                   
                   <button className="group relative w-11 h-11 rounded-2xl flex items-center justify-center text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-dark-cardHover transition-all border border-transparent hover:border-slate-200 dark:hover:border-dark-border">
                      <Bell size={20} />
                      <span className="absolute top-3 right-3.5 w-2 h-2 bg-blue-500 rounded-full border-2 border-white dark:border-dark-card" />
                      <div className="absolute top-full mt-3 px-3 py-2 bg-slate-900 dark:bg-dark-card text-white text-[10px] font-bold rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 whitespace-nowrap z-[100] shadow-2xl border border-slate-200 dark:border-dark-border translate-y-[-5px] group-hover:translate-y-0">
                        Notifications
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 border-8 border-transparent border-b-slate-900 dark:border-b-dark-border" />
                      </div>
                   </button>

                   <div className="hidden sm:flex items-center gap-4 pl-5 border-l border-slate-200 dark:border-dark-border">
                      <div className="text-right">
                         <div className="text-sm font-bold text-slate-900 dark:text-white leading-none">{user?.name}</div>
                         <div className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-1.5">Premium Member</div>
                      </div>
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-glow">
                         {user?.name.charAt(0)}
                      </div>
                   </div>
                </div>
             </header>

             {/* SCROLLABLE PAGE CONTENT */}
             <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 scroll-smooth">
                <div className="max-w-7xl mx-auto animate-fade-in">
                  {activeTab === 'dashboard' && <Dashboard />}
                  {activeTab === 'growth' && <GrowthChatbot />}
                  {activeTab === 'optimize' && <OptimizeRoutineModal isPage={true} />}
                  {activeTab === 'projects' && <ProjectsPage />}
                  {activeTab === 'tasks' && <TasksPage />}
                  {activeTab === 'navigator' && <MapsAgent />}
                  {activeTab === 'interests' && <Interests />}
                  {activeTab === 'analytics' && <Analytics />}
                  {activeTab === 'settings' && <SettingsPage />}
                </div>
             </main>

             <AnimatePresence>
               {isTutorialOpen && (
                 <TutorialOverlay onClose={() => setIsTutorialOpen(false)} />
               )}
             </AnimatePresence>
          </div>

          {/* MOBILE BOTTOM NAVIGATION */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-dark-card/80 backdrop-blur-xl border-t border-slate-200 dark:border-dark-border px-6 py-3 pb-safe flex items-center justify-between shadow-2xl">
            {[
              { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
              { id: 'tasks', icon: CheckSquare, label: 'Tasks' },
              { id: 'growth', icon: Sparkles, label: 'Coach' },
              { id: 'analytics', icon: BarChart2, label: 'Stats' },
              { id: 'settings', icon: Settings, label: 'More' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex flex-col items-center gap-1 transition-all ${activeTab === item.id ? 'text-blue-500 scale-110' : 'text-slate-400 dark:text-slate-500'}`}
              >
                <item.icon size={20} className={activeTab === item.id ? 'fill-blue-500/10' : ''} />
                <span className="text-[9px] font-bold uppercase tracking-widest">{item.label}</span>
              </button>
            ))}
          </div>

          {/* MOBILE NAVIGATION DRAWER */}
          {isMobileMenuOpen && (
             <div className="fixed inset-0 z-50 md:hidden">
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
                <div className="absolute left-0 top-0 bottom-0 w-64 bg-white dark:bg-dark-card backdrop-blur-xl shadow-2xl p-6 animate-slide-right">
                   <div className="flex items-center justify-between mb-8">
                      <div className="font-bold text-xl text-slate-900 dark:text-white">myCORE</div>
                      <button onClick={() => setIsMobileMenuOpen(false)}><X className="text-slate-900 dark:text-white"/></button>
                   </div>
                   <nav className="flex flex-col gap-2">
                      {[
                        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                        { id: 'growth', label: 'Growth AI', icon: Sparkles },
                        { id: 'optimize', label: 'Optimize', icon: Zap },
                        { id: 'projects', label: 'Projects', icon: Briefcase },
                        { id: 'tasks', label: 'Tasks', icon: CheckSquare },
                        { id: 'navigator', label: 'Navigator', icon: Navigation },
                        { id: 'interests', label: 'Interests', icon: Compass },
                        { id: 'analytics', label: 'Analytics', icon: BarChart2 },
                        { id: 'settings', label: 'Settings', icon: Settings },
                      ].map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => { setActiveTab(tab.id); setIsMobileMenuOpen(false); }}
                          className={`flex items-center gap-3 p-4 rounded-2xl font-bold transition-all duration-300 ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5'}`}
                        >
                          <tab.icon size={20} /> {tab.label}
                        </button>
                      ))}
                   </nav>
                   <div className="mt-auto pt-6 border-t border-slate-100 dark:border-dark-border">
                      <button onClick={() => resetApp(false)} className="flex items-center gap-3 text-red-500 font-medium"><LogOut size={20}/> Logout</button>
                   </div>
                </div>
             </div>
          )}
          {isArticleReaderOpen && (
            <ArticleReader 
              query={articleQuery}
              onClose={() => setIsArticleReaderOpen(false)} 
            />
          )}
        </div>
      )}
    </AppContext.Provider>
  );
}
