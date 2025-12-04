
import { Habit, HabitInstance, InterestType, TriggerType, User, ScheduleType, Task, Project } from '../types';
import { formatDate } from '../utils';

// --- MOCK DATABASE SERVICE (LOCAL STORAGE) ---

class MockDBService {
  private currentUserCache: User | null = null;
  private STORAGE_KEYS = {
    USER: 'mycore_user',
    HABITS: 'mycore_habits',
    INSTANCES: 'mycore_instances',
    TASKS: 'mycore_tasks',
    PROJECTS: 'mycore_projects'
  };

  constructor() {
    // Load initial cache if available
    const savedUser = localStorage.getItem(this.STORAGE_KEYS.USER);
    if (savedUser) {
      this.currentUserCache = JSON.parse(savedUser);
    }
  }

  // --- SUGGESTION ENGINE ---
  getSuggestions(interests: InterestType[]): Habit[] {
    const SUGGESTED_HABITS: Habit[] = [
        { id: 'h1', name: 'Morning Run (Gym)', icon: 'Activity', interest: InterestType.HEALTH, schedule: ScheduleType.DAILY, triggerType: TriggerType.LOCATION, triggerConfig: { locationName: 'Gold\'s Gym' }, streak: 0 },
        { id: 'h2', name: 'Market Analysis', icon: 'TrendingUp', interest: InterestType.FINANCE, schedule: ScheduleType.WEEKDAYS, triggerType: TriggerType.APP_OPEN, triggerConfig: { appName: 'Market Terminal', actionDetail: 'Check S&P 500' }, streak: 0 },
        { id: 'h3', name: 'Social Media < 30m', icon: 'Smartphone', interest: InterestType.DETOX, schedule: ScheduleType.DAILY, triggerType: TriggerType.SCREEN_TIME, triggerConfig: { thresholdMinutes: 30 }, streak: 0 },
        { id: 'h4', name: 'Read 1 Chapter', icon: 'BookOpen', interest: InterestType.LEARNING, schedule: ScheduleType.DAILY, triggerType: TriggerType.MANUAL, streak: 0 },
        { id: 'h5', name: 'Deep Work Session', icon: 'Zap', interest: InterestType.PRODUCTIVITY, schedule: ScheduleType.WEEKDAYS, triggerType: TriggerType.APP_OPEN, triggerConfig: { appName: 'Timer Started' }, streak: 0 }
    ];

    let suggestions = SUGGESTED_HABITS.filter(h => interests.includes(h.interest));
    if (suggestions.length < 5) {
        const remaining = 5 - suggestions.length;
        const defaults = SUGGESTED_HABITS.filter(h => !suggestions.find(s => s.id === h.id)).slice(0, remaining);
        suggestions = [...suggestions, ...defaults];
    }
    return suggestions.slice(0, 5);
  }

  // --- USER ---

  async getUser(): Promise<User | null> {
    const data = localStorage.getItem(this.STORAGE_KEYS.USER);
    if (!data) return null;
    this.currentUserCache = JSON.parse(data);
    return this.currentUserCache;
  }

  async initUser(email: string, name: string): Promise<User> {
    // Check if profile exists in local storage
    const existing = await this.getUser();
    if (existing && existing.email === email) return existing;

    // Create New Profile
    const newUser: User = {
      id: 'u_' + Date.now(),
      email,
      name,
      onboarded: false,
      interests: [],
      settings: { locationEnabled: false, notificationsEnabled: false, screenTimeEnabled: false }
    };

    localStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(newUser));
    this.currentUserCache = newUser;
    return newUser;
  }

  async completeOnboarding(
    userId: string, 
    interests: InterestType[], 
    habits: Habit[], 
    permissions: { loc: boolean; notif: boolean; screen: boolean }
  ): Promise<void> {
    if (!this.currentUserCache) return;
    
    // 1. Update User
    const updatedUser = {
        ...this.currentUserCache,
        onboarded: true,
        interests,
        settings: {
            locationEnabled: permissions.loc,
            notificationsEnabled: permissions.notif,
            screenTimeEnabled: permissions.screen
        }
    };
    localStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(updatedUser));
    this.currentUserCache = updatedUser;

    // 2. Save Habits
    localStorage.setItem(this.STORAGE_KEYS.HABITS, JSON.stringify(habits));

    // 3. Seed Instances
    await this.seedInstancesForWeek(habits);
  }

  async updateUserSettings(settings: User['settings']): Promise<void> {
    if (!this.currentUserCache) return;
    const updatedUser = { ...this.currentUserCache, settings };
    localStorage.setItem(this.STORAGE_KEYS.USER, JSON.stringify(updatedUser));
    this.currentUserCache = updatedUser;
  }

  // --- HABITS ---

  async getHabits(): Promise<Habit[]> {
    const data = localStorage.getItem(this.STORAGE_KEYS.HABITS);
    const habits: Habit[] = data ? JSON.parse(data) : [];
    
    // Calculate streaks dynamically
    const instances = await this.getAllInstances();
    
    for (const habit of habits) {
        const habitInstances = instances.filter(i => i.habitId === habit.id);
        this.calculateHabitStrength(habit, habitInstances);
    }
    
    return habits;
  }

  private calculateHabitStrength(habit: Habit, instances: HabitInstance[]): void {
    const sorted = [...instances].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    let currentStreak = 0;
    const todayStr = formatDate(new Date());

    for (const inst of sorted) {
        if (inst.completed) {
            currentStreak++;
        } else {
             // If it's today and not done, it doesn't break streak yet. 
             // If it's yesterday and not done, streak broken.
             if (inst.date === todayStr) continue;
             break; 
        }
    }
    habit.streak = currentStreak;
  }

  // --- INSTANCES ---

  private async getAllInstances(): Promise<HabitInstance[]> {
      const data = localStorage.getItem(this.STORAGE_KEYS.INSTANCES);
      return data ? JSON.parse(data) : [];
  }

  async getWeekInstances(dates: string[]): Promise<HabitInstance[]> {
    let allInstances = await this.getAllInstances();
    const habits = await this.getHabits();
    let hasChanges = false;

    // Check for missing instances and create them (Lazy Load)
    for (const date of dates) {
        const dayHabits = this.getHabitsForDay(date, habits);
        for (const habit of dayHabits) {
             const exists = allInstances.find(i => i.habitId === habit.id && i.date === date);
             if (!exists) {
                 allInstances.push({
                     id: `${date}_${habit.id}`,
                     habitId: habit.id,
                     date: date,
                     completed: false
                 });
                 hasChanges = true;
             }
        }
    }

    if (hasChanges) {
        localStorage.setItem(this.STORAGE_KEYS.INSTANCES, JSON.stringify(allInstances));
    }

    return allInstances.filter(i => dates.includes(i.date));
  }

  async updateInstanceStatus(instanceId: string, completed: boolean, value?: number): Promise<void> {
    const allInstances = await this.getAllInstances();
    const updated = allInstances.map(i => 
        i.id === instanceId 
        ? { ...i, completed, completedAt: completed ? new Date().toISOString() : undefined, value } 
        : i
    );
    localStorage.setItem(this.STORAGE_KEYS.INSTANCES, JSON.stringify(updated));
  }

  // --- TASKS & PROJECTS ---

  async getTasks(): Promise<Task[]> {
    const data = localStorage.getItem(this.STORAGE_KEYS.TASKS);
    return data ? JSON.parse(data) : [];
  }

  async addTask(task: Task): Promise<void> {
    const tasks = await this.getTasks();
    tasks.push(task);
    localStorage.setItem(this.STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    if (task.projectId) await this.updateProjectProgress(task.projectId);
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
    const tasks = await this.getTasks();
    const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, ...updates } : t);
    localStorage.setItem(this.STORAGE_KEYS.TASKS, JSON.stringify(updatedTasks));
    
    const task = tasks.find(t => t.id === taskId);
    if (task?.projectId) await this.updateProjectProgress(task.projectId);
  }

  async deleteTask(taskId: string): Promise<void> {
    const tasks = await this.getTasks();
    const task = tasks.find(t => t.id === taskId);
    const filtered = tasks.filter(t => t.id !== taskId);
    localStorage.setItem(this.STORAGE_KEYS.TASKS, JSON.stringify(filtered));
    if (task?.projectId) await this.updateProjectProgress(task.projectId);
  }

  async getProjects(): Promise<Project[]> {
    const data = localStorage.getItem(this.STORAGE_KEYS.PROJECTS);
    return data ? JSON.parse(data) : [];
  }

  async addProject(project: Project): Promise<void> {
    const projects = await this.getProjects();
    projects.push(project);
    localStorage.setItem(this.STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  }

  private async updateProjectProgress(projectId: string): Promise<void> {
    const tasks = await this.getTasks();
    const projectTasks = tasks.filter(t => t.projectId === projectId);
    const total = projectTasks.length;
    const completed = projectTasks.filter(t => t.completed).length;
    
    const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
    
    const projects = await this.getProjects();
    const updatedProjects = projects.map(p => {
        if (p.id === projectId) {
            return {
                ...p,
                progress,
                status: progress === 100 ? 'completed' : 'active'
            } as Project; // explicit cast
        }
        return p;
    });
    localStorage.setItem(this.STORAGE_KEYS.PROJECTS, JSON.stringify(updatedProjects));
  }

  // --- HELPERS ---

  private getHabitsForDay(dateStr: string, habits: Habit[]): Habit[] {
     const date = new Date(dateStr);
     const dayOfWeek = date.getDay(); // 0 = Sun
     const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

     return habits.filter(h => {
        if (h.schedule === ScheduleType.DAILY) return true;
        if (h.schedule === ScheduleType.WEEKDAYS) return !isWeekend;
        if (h.schedule === ScheduleType.WEEKENDS) return isWeekend;
        return true;
     });
  }

  private async seedInstancesForWeek(habits: Habit[]) {
     let allInstances = await this.getAllInstances();
     const today = new Date();
     
     // Generate for last 7 days and next 3 days
     for (let i = -7; i <= 3; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() + i);
        const dateStr = formatDate(d);

        const dayHabits = this.getHabitsForDay(dateStr, habits);
        
        for (const h of dayHabits) {
            const exists = allInstances.find(inst => inst.habitId === h.id && inst.date === dateStr);
            if (!exists) {
                allInstances.push({
                    id: `${dateStr}_${h.id}`,
                    habitId: h.id,
                    date: dateStr,
                    completed: false
                });
            }
        }
     }
     localStorage.setItem(this.STORAGE_KEYS.INSTANCES, JSON.stringify(allInstances));
  }

  async reset() {
    localStorage.clear();
    this.currentUserCache = null;
  }
}

export const db = new MockDBService();
