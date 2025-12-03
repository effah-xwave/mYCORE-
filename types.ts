
export const InterestType = {
  HEALTH: 'Health',
  PRODUCTIVITY: 'Productivity',
  FINANCE: 'Finance',
  LEARNING: 'Learning',
  DETOX: 'Detox',
  CUSTOM: 'Custom',
} as const;

export type InterestType = typeof InterestType[keyof typeof InterestType] | string;

export enum TriggerType {
  MANUAL = 'MANUAL',
  LOCATION = 'LOCATION', // Geofence
  APP_OPEN = 'APP_OPEN', // Interaction
  SCREEN_TIME = 'SCREEN_TIME', // Input validation
}

export enum ScheduleType {
  DAILY = 'Daily',
  WEEKDAYS = 'Weekdays',
  WEEKENDS = 'Weekends',
  CUSTOM = 'Custom',
}

export interface Habit {
  id: string;
  name: string;
  icon: string; // Lucide icon name or simple string identifier
  interest: InterestType;
  schedule: ScheduleType;
  triggerType: TriggerType;
  triggerConfig?: {
    locationName?: string;
    thresholdMinutes?: number;
    appName?: string;
    actionDetail?: string; // Specific action description (e.g., "Check S&P 500")
  };
  streak: number;
}

export interface HabitInstance {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  completedAt?: string;
  value?: number; // e.g., minutes spent
}

export interface User {
  id: string;
  email: string;
  name: string;
  onboarded: boolean;
  interests: InterestType[];
  settings: {
    locationEnabled: boolean;
    notificationsEnabled: boolean;
    screenTimeEnabled: boolean;
  };
}

export interface DayStats {
  date: string; // YYYY-MM-DD
  dayName: string; // Mon, Tue...
  completionRate: number; // 0-100
  totalHabits: number;
  completedHabits: number;
}

// --- TASKS & PROJECTS ---

export enum Priority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
}

export enum ReminderType {
  AT_DEADLINE = 'At Deadline',
  ONE_HOUR_BEFORE = '1 Hour Before',
  ONE_DAY_BEFORE = '1 Day Before',
  CUSTOM = 'Custom',
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:MM
  priority: Priority;
  category: string; // e.g. Work, Personal
  projectId?: string;
  completed: boolean;
  reminder?: {
    type: ReminderType;
    customDate?: string; // ISO
  };
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  progress: number; // 0-100 (auto-calculated)
  status: 'active' | 'completed' | 'archived';
}