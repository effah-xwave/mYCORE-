
import { Habit, HabitInstance, InterestType, TriggerType, User, ScheduleType, Task, Project } from '../types';
import { formatDate } from '../utils';

// --- MOCK DATABASE SERVICE ---
// Simulates a backend with LocalStorage persistence

class MockDBService {
  private currentUserCache: User | null = null;

  constructor() {}

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
    const json = localStorage.getItem('mycore_user');
    if (json) {
        this.currentUserCache = JSON.parse(json);
        return this.currentUserCache;
    }
    return null;
  }

  async initUser(email: string, name: string): Promise<User> {
    const existing = await this.getUser();
    if (existing) return existing;

    const newUser: User = {
      id: 'u_' + Date.now(),
      email,
      name,
      onboarded: false,
      interests: [],
      settings: { locationEnabled: false, notificationsEnabled: false, screenTimeEnabled: false },
      coachName: 'CORE AI Coach',
      lastCoachRenameDate: new Date(0).toISOString() // Epoch so they can rename immediately
    };

    localStorage.setItem('mycore_user', JSON.stringify(newUser));
    this.currentUserCache = newUser;
    return newUser;
  }

  async completeOnboarding(
    userId: string, 
    interests: InterestType[], 
    habits: Habit[], 
    permissions: { loc: boolean; notif: boolean; screen: boolean }
  ): Promise<void> {
    const user = await this.getUser();
    if (!user) return;

    user.onboarded = true;
    user.interests = interests;
    user.settings = {
        locationEnabled: permissions.loc,
        notificationsEnabled: permissions.notif,
        screenTimeEnabled: permissions.screen
    };
    
    localStorage.setItem('mycore_user', JSON.stringify(user));
    localStorage.setItem('mycore_habits', JSON.stringify(habits));
    
    // Seed first week
    await this.seedInstancesForWeek(habits);
  }

  async updateUserSettings(settings: User['settings']): Promise<void> {
    if (this.currentUserCache) {
        this.currentUserCache.settings = settings;
        localStorage.setItem('mycore_user', JSON.stringify(this.currentUserCache));
    }
  }

  async updateCoachName(newName: string): Promise<void> {
    const user = await this.getUser();
    if (!user) return;

    user.coachName = newName;
    user.lastCoachRenameDate = new Date().toISOString();
    localStorage.setItem('mycore_user', JSON.stringify(user));
    this.currentUserCache = user;
  }

  // --- HABITS ---

  async getHabits(): Promise<Habit[]> {
    const json = localStorage.getItem('mycore_habits');
    const habits: Habit[] = json ? JSON.parse(json) : [];
    
    const instances = await this.getAllInstances();

    // Recalculate streaks dynamically
    for (const habit of habits) {
        const habitInstances = instances.filter(i => i.habitId === habit.id);
        this.calculateHabitStrength(habit, habitInstances);
    }

    return habits;
  }

  async toggleHabitFavorite(habitId: string): Promise<void> {
    const json = localStorage.getItem('mycore_habits');
    if (!json) return;
    const habits: Habit[] = JSON.parse(json);
    const idx = habits.findIndex(h => h.id === habitId);
    if (idx !== -1) {
        habits[idx].isFavorite = !habits[idx].isFavorite;
        localStorage.setItem('mycore_habits', JSON.stringify(habits));
    }
  }

  private calculateHabitStrength(habit: Habit, instances: HabitInstance[]): void {
    const sorted = [...instances].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    let currentStreak = 0;
    const todayStr = formatDate(new Date());

    for (const inst of sorted) {
        if (inst.completed) {
            currentStreak++;
        } else {
             // Allow skipping today if not done yet, but break if yesterday was missed
             if (inst.date === todayStr) continue;
             break; 
        }
    }
    habit.streak = currentStreak;
  }

  // --- INSTANCES ---

  private async getAllInstances(): Promise<HabitInstance[]> {
    const json = localStorage.getItem('mycore_instances');
    return json ? JSON.parse(json) : [];
  }

  async getWeekInstances(dates: string[]): Promise<HabitInstance[]> {
    const allInstances = await this.getAllInstances();
    const habits = await this.getHabits();
    
    let hasUpdates = false;

    // Check for missing instances and create them (Lazy Load)
    for (const date of dates) {
        const dayHabits = this.getHabitsForDay(date, habits);
        for (const habit of dayHabits) {
             const exists = allInstances.find(i => i.habitId === habit.id && i.date === date);
             if (!exists) {
                 const newInst: HabitInstance = {
                     id: `${date}_${habit.id}`,
                     habitId: habit.id,
                     date: date,
                     completed: false
                 };
                 allInstances.push(newInst);
                 hasUpdates = true;
             }
        }
    }

    if (hasUpdates) {
        localStorage.setItem('mycore_instances', JSON.stringify(allInstances));
    }

    return allInstances.filter(i => dates.includes(i.date));
  }

  async getInstancesForRange(startDate: string, endDate: string): Promise<HabitInstance[]> {
    const allInstances = await this.getAllInstances();
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    return allInstances.filter(i => {
      const d = new Date(i.date).getTime();
      return d >= start && d <= end;
    });
  }

  async updateInstanceStatus(instanceId: string, completed: boolean, value?: number): Promise<void> {
    const instances = await this.getAllInstances();
    const idx = instances.findIndex(i => i.id === instanceId);
    if (idx !== -1) {
        instances[idx].completed = completed;
        if (completed) instances[idx].completedAt = new Date().toISOString();
        if (value !== undefined) instances[idx].value = value;
        localStorage.setItem('mycore_instances', JSON.stringify(instances));
    }
  }

  // --- TASKS & PROJECTS ---

  async getTasks(): Promise<Task[]> {
    const json = localStorage.getItem('mycore_tasks');
    return json ? JSON.parse(json) : [];
  }

  async addTask(task: Task): Promise<void> {
    const tasks = await this.getTasks();
    tasks.push(task);
    localStorage.setItem('mycore_tasks', JSON.stringify(tasks));
    if (task.projectId) await this.updateProjectProgress(task.projectId);
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
    const tasks = await this.getTasks();
    const idx = tasks.findIndex(t => t.id === taskId);
    if (idx !== -1) {
        tasks[idx] = { ...tasks[idx], ...updates };
        localStorage.setItem('mycore_tasks', JSON.stringify(tasks));
        if (tasks[idx].projectId) await this.updateProjectProgress(tasks[idx].projectId!);
    }
  }

  async deleteTask(taskId: string): Promise<void> {
    let tasks = await this.getTasks();
    const task = tasks.find(t => t.id === taskId);
    tasks = tasks.filter(t => t.id !== taskId);
    localStorage.setItem('mycore_tasks', JSON.stringify(tasks));
    if (task?.projectId) await this.updateProjectProgress(task.projectId);
  }

  async getProjects(): Promise<Project[]> {
    const json = localStorage.getItem('mycore_projects');
    return json ? JSON.parse(json) : [];
  }

  async addProject(project: Project): Promise<void> {
    const projects = await this.getProjects();
    projects.push(project);
    localStorage.setItem('mycore_projects', JSON.stringify(projects));
  }

  async updateProject(projectId: string, updates: Partial<Project>): Promise<void> {
    const projects = await this.getProjects();
    const idx = projects.findIndex(p => p.id === projectId);
    if (idx !== -1) {
        projects[idx] = { ...projects[idx], ...updates };
        // If progress manually updated, update status
        if (updates.progress !== undefined) {
           projects[idx].status = projects[idx].progress === 100 ? 'completed' : 'active';
        }
        localStorage.setItem('mycore_projects', JSON.stringify(projects));
    }
  }

  async deleteProject(projectId: string): Promise<void> {
    let projects = await this.getProjects();
    projects = projects.filter(p => p.id !== projectId);
    localStorage.setItem('mycore_tasks', JSON.stringify(projects));
    
    // Clear project ID from tasks
    const tasks = await this.getTasks();
    const updatedTasks = tasks.map(t => t.projectId === projectId ? { ...t, projectId: undefined } : t);
    localStorage.setItem('mycore_tasks', JSON.stringify(updatedTasks));
  }

  private async updateProjectProgress(projectId: string): Promise<void> {
    const tasks = await this.getTasks();
    const projectTasks = tasks.filter(t => t.projectId === projectId);
    const total = projectTasks.length;
    
    // Only auto-update if there are actually tasks. 
    if (total === 0) return;

    const completed = projectTasks.filter(t => t.completed).length;
    const progress = Math.round((completed / total) * 100);
    const status = progress === 100 ? 'completed' : 'active';

    const projects = await this.getProjects();
    const idx = projects.findIndex(p => p.id === projectId);
    if (idx !== -1) {
        projects[idx].progress = progress;
        projects[idx].status = status;
        localStorage.setItem('mycore_projects', JSON.stringify(projects));
    }
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
     const today = new Date();
     const instances: HabitInstance[] = [];
     
     // Generate for last 7 days and next 3 days
     for (let i = -7; i <= 3; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() + i);
        const dateStr = formatDate(d);

        const dayHabits = this.getHabitsForDay(dateStr, habits);
        
        for (const h of dayHabits) {
            instances.push({
                id: `${dateStr}_${h.id}`,
                habitId: h.id,
                date: dateStr,
                completed: false
            });
        }
     }
     localStorage.setItem('mycore_instances', JSON.stringify(instances));
  }

  async reset() {
    localStorage.clear();
    this.currentUserCache = null;
  }
}

export const db = new MockDBService();
