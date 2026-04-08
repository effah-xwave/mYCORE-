import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot,
  getDocFromServer,
  Timestamp
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { User, Habit, HabitInstance, Task, Project, InterestType, ScheduleType, TriggerType } from '../types';
import { formatDate } from '../utils';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. ");
    }
  }
}
testConnection();

export const FirebaseDBService = {
  // --- USER ---
  async getUser(): Promise<User | null> {
    const userId = auth.currentUser?.uid;
    if (!userId) return null;
    const path = `users/${userId}`;
    try {
      const userDoc = await getDoc(doc(db, path));
      if (userDoc.exists()) {
        return userDoc.data() as User;
      }
      return null;
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, path);
      return null;
    }
  },

  async initUser(email: string, name: string): Promise<User> {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("User not authenticated");
    
    const existing = await this.getUser();
    if (existing) return existing;

    const newUser: User = {
      id: userId,
      email,
      name,
      onboarded: false,
      interests: [],
      settings: { locationEnabled: false, notificationsEnabled: false, screenTimeEnabled: false },
      coachName: 'CORE AI Coach',
      lastCoachRenameDate: new Date(0).toISOString()
    };

    const path = `users/${userId}`;
    try {
      await setDoc(doc(db, path), newUser);
      return newUser;
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
      throw error;
    }
  },

  async completeOnboarding(
    userId: string, 
    interests: InterestType[], 
    habits: Habit[], 
    permissions: { loc: boolean; notif: boolean; screen: boolean }
  ): Promise<void> {
    const path = `users/${userId}`;
    try {
      const userRef = doc(db, path);
      await updateDoc(userRef, {
        onboarded: true,
        interests,
        settings: {
          locationEnabled: permissions.loc,
          notificationsEnabled: permissions.notif,
          screenTimeEnabled: permissions.screen
        }
      });

      // Save habits
      for (const habit of habits) {
        const habitPath = `users/${userId}/habits/${habit.id}`;
        await setDoc(doc(db, habitPath), habit);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async updateUserSettings(settings: User['settings']): Promise<void> {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    const path = `users/${userId}`;
    try {
      await updateDoc(doc(db, path), { settings });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async updateCoachName(newName: string): Promise<void> {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    const path = `users/${userId}`;
    try {
      await updateDoc(doc(db, path), { 
        coachName: newName,
        lastCoachRenameDate: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async updateUserProfile(updates: Partial<User>): Promise<void> {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    const path = `users/${userId}`;
    try {
      await updateDoc(doc(db, path), updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  // --- HABITS ---
  async getHabits(): Promise<Habit[]> {
    const userId = auth.currentUser?.uid;
    if (!userId) return [];
    const path = `users/${userId}/habits`;
    try {
      const q = query(collection(db, path));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as Habit);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async toggleHabitFavorite(habitId: string): Promise<void> {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    const path = `users/${userId}/habits/${habitId}`;
    try {
      const habitRef = doc(db, path);
      const habitDoc = await getDoc(habitRef);
      if (habitDoc.exists()) {
        const current = habitDoc.data().isFavorite || false;
        await updateDoc(habitRef, { isFavorite: !current });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async addHabit(habit: Habit): Promise<void> {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    const path = `users/${userId}/habits/${habit.id}`;
    try {
      await setDoc(doc(db, path), habit);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async deleteHabit(habitId: string): Promise<void> {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    const path = `users/${userId}/habits/${habitId}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // --- INSTANCES ---
  async getWeekInstances(dates: string[]): Promise<HabitInstance[]> {
    const userId = auth.currentUser?.uid;
    if (!userId) return [];
    const path = `users/${userId}/habitInstances`;
    try {
      // Firestore doesn't support 'in' with more than 10-30 items, but 7 dates is fine
      const q = query(collection(db, path), where('date', 'in', dates));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as HabitInstance);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async getInstancesForRange(startDate: string, endDate: string): Promise<HabitInstance[]> {
    const userId = auth.currentUser?.uid;
    if (!userId) return [];
    const path = `users/${userId}/habitInstances`;
    try {
      const q = query(
        collection(db, path), 
        where('date', '>=', startDate),
        where('date', '<=', endDate)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as HabitInstance);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async updateInstanceStatus(instanceId: string, completed: boolean, value?: number): Promise<void> {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    const path = `users/${userId}/habitInstances/${instanceId}`;
    try {
      const instRef = doc(db, path);
      const instDoc = await getDoc(instRef);
      
      const updates: any = { completed };
      if (completed) updates.completedAt = new Date().toISOString();
      if (value !== undefined) updates.value = value;

      if (instDoc.exists()) {
        await updateDoc(instRef, updates);
      } else {
        // If it doesn't exist, we need habitId and date from the instanceId (date_habitId)
        const [date, habitId] = instanceId.split('_');
        await setDoc(instRef, {
          id: instanceId,
          habitId,
          date,
          ...updates
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  // --- TASKS ---
  async getTasks(): Promise<Task[]> {
    const userId = auth.currentUser?.uid;
    if (!userId) return [];
    const path = `users/${userId}/tasks`;
    try {
      const q = query(collection(db, path));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as Task);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async addTask(task: Task): Promise<void> {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    const path = `users/${userId}/tasks/${task.id}`;
    try {
      await setDoc(doc(db, path), task);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    const path = `users/${userId}/tasks/${taskId}`;
    try {
      await updateDoc(doc(db, path), updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async deleteTask(taskId: string): Promise<void> {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    const path = `users/${userId}/tasks/${taskId}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // --- PROJECTS ---
  async getProjects(): Promise<Project[]> {
    const userId = auth.currentUser?.uid;
    if (!userId) return [];
    const path = `users/${userId}/projects`;
    try {
      const q = query(collection(db, path));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as Project);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  },

  async addProject(project: Project): Promise<void> {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    const path = `users/${userId}/projects/${project.id}`;
    try {
      await setDoc(doc(db, path), project);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  async updateProject(projectId: string, updates: Partial<Project>): Promise<void> {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    const path = `users/${userId}/projects/${projectId}`;
    try {
      await updateDoc(doc(db, path), updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  },

  async deleteProject(projectId: string): Promise<void> {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    const path = `users/${userId}/projects/${projectId}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  },

  // --- SUBSCRIPTIONS ---
  subscribeToHabits(callback: (habits: Habit[]) => void) {
    const userId = auth.currentUser?.uid;
    if (!userId) return () => {};
    const path = `users/${userId}/habits`;
    const q = query(collection(db, path));
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => doc.data() as Habit));
    }, (error) => handleFirestoreError(error, OperationType.LIST, path));
  },

  subscribeToTasks(callback: (tasks: Task[]) => void) {
    const userId = auth.currentUser?.uid;
    if (!userId) return () => {};
    const path = `users/${userId}/tasks`;
    const q = query(collection(db, path));
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => doc.data() as Task));
    }, (error) => handleFirestoreError(error, OperationType.LIST, path));
  },

  subscribeToProjects(callback: (projects: Project[]) => void) {
    const userId = auth.currentUser?.uid;
    if (!userId) return () => {};
    const path = `users/${userId}/projects`;
    const q = query(collection(db, path));
    return onSnapshot(q, (snapshot) => {
      callback(snapshot.docs.map(doc => doc.data() as Project));
    }, (error) => handleFirestoreError(error, OperationType.LIST, path));
  },

  // --- SUGGESTIONS ---
  getSuggestions(interests: InterestType[]): Habit[] {
    const SUGGESTED_HABITS: Habit[] = [
        { id: 'h1', name: 'Morning Run (Gym)', icon: 'Activity', interest: InterestType.HEALTH, schedule: ScheduleType.DAILY, triggerType: TriggerType.LOCATION, triggerConfig: { locationName: 'Gold\'s Gym' }, streak: 0 },
        { id: 'h2', name: 'Market Analysis', icon: 'TrendingUp', interest: InterestType.FINANCE, schedule: ScheduleType.WEEKDAYS, triggerType: TriggerType.APP_OPEN, triggerConfig: { appName: 'Market Terminal', actionDetail: 'Check S&P 500' }, streak: 0 },
        { id: 'h3', name: 'Social Media < 30m', icon: 'Smartphone', interest: InterestType.DETOX, schedule: ScheduleType.DAILY, triggerType: TriggerType.SCREEN_TIME, triggerConfig: { thresholdMinutes: 30 }, streak: 0 },
        { id: 'h4', name: 'Read Arch Insight', icon: 'BookOpen', interest: InterestType.LEARNING, schedule: ScheduleType.DAILY, triggerType: TriggerType.MANUAL, streak: 0 },
        { id: 'h5', name: 'Deep Work Session', icon: 'Zap', interest: InterestType.PRODUCTIVITY, schedule: ScheduleType.WEEKDAYS, triggerType: TriggerType.APP_OPEN, triggerConfig: { appName: 'Timer Started' }, streak: 0 }
    ];

    let suggestions = SUGGESTED_HABITS.filter(h => interests.includes(h.interest));
    if (suggestions.length < 5) {
        const remaining = 5 - suggestions.length;
        const defaults = SUGGESTED_HABITS.filter(h => !suggestions.find(s => s.id === h.id)).slice(0, remaining);
        suggestions = [...suggestions, ...defaults];
    }
    return suggestions.slice(0, 5);
  },

  async reset() {
    // In Firebase, we don't usually clear the whole DB from the client
    // But we can sign out
    await auth.signOut();
  },

  async resetUser(): Promise<void> {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    const path = `users/${userId}`;
    try {
      // Reset onboarding status and clear basic info
      await updateDoc(doc(db, path), {
        onboarded: false,
        interests: [],
        coachName: 'CORE AI Coach'
      });
      
      // Note: Subcollections like habits, tasks, projects are not deleted here 
      // but the user will be forced to re-onboard which will overwrite/add new ones.
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }
};
