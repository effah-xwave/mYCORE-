
import { Habit, HabitInstance, InterestType, User, Task, Project } from '../types';
import { FirebaseDBService } from './firebaseDb';

// --- DATABASE SERVICE ---
// Wraps FirebaseDBService to maintain compatibility with existing code

export const db = {
  getSuggestions: (interests: InterestType[]) => FirebaseDBService.getSuggestions(interests),
  
  getUser: () => FirebaseDBService.getUser(),
  
  initUser: (email: string, name: string) => FirebaseDBService.initUser(email, name),
  
  completeOnboarding: (userId: string, interests: InterestType[], habits: Habit[], permissions: any) => 
    FirebaseDBService.completeOnboarding(userId, interests, habits, permissions),
  
  updateUserSettings: (settings: User['settings']) => FirebaseDBService.updateUserSettings(settings),
  
  updateCoachName: (newName: string) => FirebaseDBService.updateCoachName(newName),
  
  updateUserProfile: (updates: Partial<User>) => FirebaseDBService.updateUserProfile(updates),
  
  getHabits: () => FirebaseDBService.getHabits(),
  
  toggleHabitFavorite: (habitId: string) => FirebaseDBService.toggleHabitFavorite(habitId),
  
  addHabit: (habit: Habit) => FirebaseDBService.addHabit(habit),
  
  deleteHabit: (habitId: string) => FirebaseDBService.deleteHabit(habitId),
  
  getWeekInstances: (dates: string[]) => FirebaseDBService.getWeekInstances(dates),
  
  getInstancesForRange: (startDate: string, endDate: string) => FirebaseDBService.getInstancesForRange(startDate, endDate),
  
  updateInstanceStatus: (instanceId: string, completed: boolean, value?: number) => 
    FirebaseDBService.updateInstanceStatus(instanceId, completed, value),
  
  getTasks: () => FirebaseDBService.getTasks(),
  
  addTask: (task: Task) => FirebaseDBService.addTask(task),
  
  updateTask: (taskId: string, updates: Partial<Task>) => FirebaseDBService.updateTask(taskId, updates),
  
  deleteTask: (taskId: string) => FirebaseDBService.deleteTask(taskId),
  
  getProjects: () => FirebaseDBService.getProjects(),
  
  addProject: (project: Project) => FirebaseDBService.addProject(project),
  
  updateProject: (projectId: string, updates: Partial<Project>) => FirebaseDBService.updateProject(projectId, updates),
  
  deleteProject: (projectId: string) => FirebaseDBService.deleteProject(projectId),
  
  subscribeToHabits: (callback: (habits: Habit[]) => void) => FirebaseDBService.subscribeToHabits(callback),
  subscribeToTasks: (callback: (tasks: Task[]) => void) => FirebaseDBService.subscribeToTasks(callback),
  subscribeToProjects: (callback: (projects: Project[]) => void) => FirebaseDBService.subscribeToProjects(callback),
  
  reset: () => FirebaseDBService.reset(),
  resetUser: () => FirebaseDBService.resetUser()
};
