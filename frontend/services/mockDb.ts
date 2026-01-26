import {
  Habit,
  HabitInstance,
  InterestType,
  TriggerType,
  User,
  ScheduleType,
  Task,
  Project,
  AIRoadmap,
} from "../types";
import { formatDate } from "../utils";

// Keywords for "AI" matching
const HABIT_KEYWORDS: Record<string, Habit[]> = {
  run: [
    {
      id: "h_run",
      name: "Morning Jog (5km)",
      icon: "Activity",
      interest: InterestType.HEALTH,
      schedule: ScheduleType.DAILY,
      triggerType: TriggerType.LOCATION,
      streak: 0,
      goal: { target: 5, unit: "km" },
    },
  ],
  weight: [
    {
      id: "h_gym",
      name: "Strength Training",
      icon: "Dumbbell",
      interest: InterestType.HEALTH,
      schedule: ScheduleType.WEEKDAYS,
      triggerType: TriggerType.LOCATION,
      streak: 0,
    },
  ],
  sleep: [
    {
      id: "h_sleep",
      name: "No Screen Before Bed",
      icon: "Moon",
      interest: InterestType.HEALTH,
      schedule: ScheduleType.DAILY,
      triggerType: TriggerType.SCREEN_TIME,
      streak: 0,
    },
  ],
  read: [
    {
      id: "h_read",
      name: "Read 20 Pages",
      icon: "BookOpen",
      interest: InterestType.LEARNING,
      schedule: ScheduleType.DAILY,
      triggerType: TriggerType.MANUAL,
      streak: 0,
    },
  ],
  invest: [
    {
      id: "h_invest",
      name: "Market Research",
      icon: "TrendingUp",
      interest: InterestType.FINANCE,
      schedule: ScheduleType.WEEKDAYS,
      triggerType: TriggerType.APP_OPEN,
      streak: 0,
    },
  ],
  save: [
    {
      id: "h_save",
      name: "Example: No Spend Day",
      icon: "DollarSign",
      interest: InterestType.FINANCE,
      schedule: ScheduleType.WEEKENDS,
      triggerType: TriggerType.MANUAL,
      streak: 0,
    },
  ],
  focus: [
    {
      id: "h_focus",
      name: "Deep Work (2h)",
      icon: "Zap",
      interest: InterestType.PRODUCTIVITY,
      schedule: ScheduleType.WEEKDAYS,
      triggerType: TriggerType.APP_OPEN,
      streak: 0,
    },
  ],
  meditat: [
    {
      id: "h_meditate",
      name: "Morning Meditation",
      icon: "Sun",
      interest: InterestType.DETOX,
      schedule: ScheduleType.DAILY,
      triggerType: TriggerType.APP_OPEN,
      streak: 0,
    },
  ],
  spanish: [
    {
      id: "h_lang",
      name: "Practice Spanish",
      icon: "MessageCircle",
      interest: InterestType.LEARNING,
      schedule: ScheduleType.DAILY,
      triggerType: TriggerType.APP_OPEN,
      streak: 0,
    },
  ],
};

// --- MOCK DATABASE SERVICE ---
// Simulates a backend with LocalStorage persistence

class MockDBService {
  private currentUserCache: User | null = null;

  constructor() {}

  // --- AI SIMULATION ---
  async generateRoutine(
    interests: InterestType[],
    goals: Record<string, string>,
  ): Promise<AIRoadmap> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 2500));

    let selectedHabits: Habit[] = [];

    // 1. Keyword Matching
    Object.entries(goals).forEach(([interest, goalText]) => {
      const lowerGoal = goalText.toLowerCase();

      // Check keywords
      Object.keys(HABIT_KEYWORDS).forEach((keyword) => {
        if (lowerGoal.includes(keyword)) {
          // Add matched habits if not already present
          HABIT_KEYWORDS[keyword].forEach((h) => {
            if (!selectedHabits.find((ex) => ex.name === h.name)) {
              selectedHabits.push({
                ...h,
                id: `gen_${Date.now()}_${Math.random()}`,
              }); // Unique ID
            }
          });
        }
      });
    });

    // 2. Fallback / Fillers
    if (selectedHabits.length < 3) {
      const defaults = this.getSuggestions(interests);
      // Add defaults until we have at least 4
      defaults.forEach((d) => {
        if (
          selectedHabits.length < 4 &&
          !selectedHabits.find((ex) => ex.name === d.name)
        ) {
          selectedHabits.push({
            ...d,
            id: `def_${Date.now()}_${Math.random()}`,
          });
        }
      });
    }

    // 3. Generate Roadmap Text
    const summary = `Based on your goals to ${Object.values(goals)
      .map((g) => `"${g.substring(0, 20)}..."`)
      .join(" and ")}, we've designed a high-impact routine.`;
    const strategy =
      "We're focusing on small, compound wins. Your routine mixes active habits with deep work blocks to ensure progress without burnout.";

    return {
      summary,
      strategy,
      habits: selectedHabits,
    };
  }

  // --- SUGGESTION ENGINE ---
  getSuggestions(interests: InterestType[]): Habit[] {
    const SUGGESTED_HABITS: Habit[] = [
      {
        id: "h1",
        name: "Morning Run (Gym)",
        icon: "Activity",
        interest: InterestType.HEALTH,
        schedule: ScheduleType.DAILY,
        triggerType: TriggerType.LOCATION,
        triggerConfig: { locationName: "Gold's Gym" },
        streak: 0,
      },
      {
        id: "h2",
        name: "Market Analysis",
        icon: "TrendingUp",
        interest: InterestType.FINANCE,
        schedule: ScheduleType.WEEKDAYS,
        triggerType: TriggerType.APP_OPEN,
        triggerConfig: {
          appName: "Market Terminal",
          actionDetail: "Check S&P 500",
        },
        streak: 0,
      },
      {
        id: "h3",
        name: "Social Media < 30m",
        icon: "Smartphone",
        interest: InterestType.DETOX,
        schedule: ScheduleType.DAILY,
        triggerType: TriggerType.SCREEN_TIME,
        triggerConfig: { thresholdMinutes: 30 },
        streak: 0,
      },
      {
        id: "h4",
        name: "Read 1 Chapter",
        icon: "BookOpen",
        interest: InterestType.LEARNING,
        schedule: ScheduleType.DAILY,
        triggerType: TriggerType.MANUAL,
        streak: 0,
      },
      {
        id: "h5",
        name: "Deep Work Session",
        icon: "Zap",
        interest: InterestType.PRODUCTIVITY,
        schedule: ScheduleType.WEEKDAYS,
        triggerType: TriggerType.APP_OPEN,
        triggerConfig: { appName: "Timer Started" },
        streak: 0,
      },
    ];

    let suggestions = SUGGESTED_HABITS.filter((h) =>
      interests.includes(h.interest),
    );
    if (suggestions.length < 5) {
      const remaining = 5 - suggestions.length;
      const defaults = SUGGESTED_HABITS.filter(
        (h) => !suggestions.find((s) => s.id === h.id),
      ).slice(0, remaining);
      suggestions = [...suggestions, ...defaults];
    }
    return suggestions.slice(0, 5);
  }

  // --- USER ---

  async getUser(): Promise<User | null> {
    const json = localStorage.getItem("mycore_user");
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
      id: "u_" + Date.now(),
      email,
      name,
      onboarded: false,
      interests: [],
      settings: {
        locationEnabled: false,
        notificationsEnabled: false,
        screenTimeEnabled: false,
      },
    };

    localStorage.setItem("mycore_user", JSON.stringify(newUser));
    this.currentUserCache = newUser;
    return newUser;
  }

  async completeOnboarding(
    userId: string,
    interests: InterestType[],
    habits: Habit[],
    goals: Record<string, string>,
    permissions: { loc: boolean; notif: boolean; screen: boolean },
  ): Promise<void> {
    const user = await this.getUser();
    if (!user) return;

    user.onboarded = true;
    user.interests = interests;
    user.goals = goals;
    user.settings = {
      locationEnabled: permissions.loc,
      notificationsEnabled: permissions.notif,
      screenTimeEnabled: permissions.screen,
    };

    localStorage.setItem("mycore_user", JSON.stringify(user));
    localStorage.setItem("mycore_habits", JSON.stringify(habits));

    // Seed first week
    await this.seedInstancesForWeek(habits);
  }

  async updateUserSettings(settings: User["settings"]): Promise<void> {
    if (this.currentUserCache) {
      this.currentUserCache.settings = settings;
      localStorage.setItem(
        "mycore_user",
        JSON.stringify(this.currentUserCache),
      );
    }
  }

  // --- HABITS ---

  async getHabits(): Promise<Habit[]> {
    const json = localStorage.getItem("mycore_habits");
    const habits: Habit[] = json ? JSON.parse(json) : [];

    const instances = await this.getAllInstances();

    // Recalculate streaks dynamically
    for (const habit of habits) {
      const habitInstances = instances.filter((i) => i.habitId === habit.id);
      this.calculateHabitStrength(habit, habitInstances);
    }

    return habits;
  }

  async toggleHabitFavorite(habitId: string): Promise<void> {
    const json = localStorage.getItem("mycore_habits");
    if (!json) return;
    const habits: Habit[] = JSON.parse(json);
    const idx = habits.findIndex((h) => h.id === habitId);
    if (idx !== -1) {
      habits[idx].isFavorite = !habits[idx].isFavorite;
      localStorage.setItem("mycore_habits", JSON.stringify(habits));
    }
  }

  private calculateHabitStrength(
    habit: Habit,
    instances: HabitInstance[],
  ): void {
    const sorted = [...instances].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
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
    const json = localStorage.getItem("mycore_instances");
    return json ? JSON.parse(json) : [];
  }

  async getWeekInstances(dates: string[]): Promise<HabitInstance[]> {
    const allInstances = await this.getAllInstances();
    const habits = await this.getHabits();

    let newInstances: HabitInstance[] = [];
    let hasUpdates = false;

    // Check for missing instances and create them (Lazy Load)
    for (const date of dates) {
      const dayHabits = this.getHabitsForDay(date, habits);
      for (const habit of dayHabits) {
        const exists = allInstances.find(
          (i) => i.habitId === habit.id && i.date === date,
        );
        if (!exists) {
          const newInst: HabitInstance = {
            id: `${date}_${habit.id}`,
            habitId: habit.id,
            date: date,
            completed: false,
          };
          allInstances.push(newInst);
          hasUpdates = true;
        }
      }
    }

    if (hasUpdates) {
      localStorage.setItem("mycore_instances", JSON.stringify(allInstances));
    }

    return allInstances.filter((i) => dates.includes(i.date));
  }

  async updateInstanceStatus(
    instanceId: string,
    completed: boolean,
    value?: number,
  ): Promise<void> {
    const instances = await this.getAllInstances();
    const idx = instances.findIndex((i) => i.id === instanceId);
    if (idx !== -1) {
      instances[idx].completed = completed;
      if (completed) instances[idx].completedAt = new Date().toISOString();
      if (value !== undefined) instances[idx].value = value;
      localStorage.setItem("mycore_instances", JSON.stringify(instances));
    }
  }

  // --- TASKS & PROJECTS ---

  async getTasks(): Promise<Task[]> {
    const json = localStorage.getItem("mycore_tasks");
    return json ? JSON.parse(json) : [];
  }

  async addTask(task: Task): Promise<void> {
    const tasks = await this.getTasks();
    tasks.push(task);
    localStorage.setItem("mycore_tasks", JSON.stringify(tasks));
    if (task.projectId) await this.updateProjectProgress(task.projectId);
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
    const tasks = await this.getTasks();
    const idx = tasks.findIndex((t) => t.id === taskId);
    if (idx !== -1) {
      tasks[idx] = { ...tasks[idx], ...updates };
      localStorage.setItem("mycore_tasks", JSON.stringify(tasks));
      if (tasks[idx].projectId)
        await this.updateProjectProgress(tasks[idx].projectId!);
    }
  }

  async deleteTask(taskId: string): Promise<void> {
    let tasks = await this.getTasks();
    const task = tasks.find((t) => t.id === taskId);
    tasks = tasks.filter((t) => t.id !== taskId);
    localStorage.setItem("mycore_tasks", JSON.stringify(tasks));
    if (task?.projectId) await this.updateProjectProgress(task.projectId);
  }

  async getProjects(): Promise<Project[]> {
    const json = localStorage.getItem("mycore_projects");
    return json ? JSON.parse(json) : [];
  }

  async addProject(project: Project): Promise<void> {
    const projects = await this.getProjects();
    projects.push(project);
    localStorage.setItem("mycore_projects", JSON.stringify(projects));
  }

  private async updateProjectProgress(projectId: string): Promise<void> {
    const tasks = await this.getTasks();
    const projectTasks = tasks.filter((t) => t.projectId === projectId);
    const total = projectTasks.length;
    const completed = projectTasks.filter((t) => t.completed).length;

    const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
    const status = progress === 100 ? "completed" : "active";

    const projects = await this.getProjects();
    const idx = projects.findIndex((p) => p.id === projectId);
    if (idx !== -1) {
      projects[idx].progress = progress;
      projects[idx].status = status;
      localStorage.setItem("mycore_projects", JSON.stringify(projects));
    }
  }

  // --- HELPERS ---

  private getHabitsForDay(dateStr: string, habits: Habit[]): Habit[] {
    const date = new Date(dateStr);
    const dayOfWeek = date.getDay(); // 0 = Sun
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    return habits.filter((h) => {
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
          completed: false,
        });
      }
    }
    localStorage.setItem("mycore_instances", JSON.stringify(instances));
  }

  async reset() {
    localStorage.clear();
    this.currentUserCache = null;
  }
}

export const db = new MockDBService();
