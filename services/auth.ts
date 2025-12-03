import { User } from '../types';

// Simulate Firebase Auth delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock user session key
const SESSION_KEY = 'mycore_auth_session';

export const AuthService = {
  // Check if user is currently logged in (persisted session)
  getCurrentUser: (): { email: string; uid: string } | null => {
    const stored = localStorage.getItem(SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  // Simulate Firebase Login
  login: async (email: string, password: string): Promise<{ email: string; uid: string }> => {
    await delay(800); // Fake network latency
    
    // In a real app, this would validate against Firebase Auth
    if (!email.includes('@')) throw new Error("Invalid email address");
    if (password.length < 6) throw new Error("Password must be at least 6 characters");

    const user = { email, uid: 'firebase_uid_' + Math.random().toString(36).substr(2, 9) };
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  },

  // Simulate Firebase Signup
  signup: async (email: string, password: string): Promise<{ email: string; uid: string }> => {
    await delay(1000);
    if (!email.includes('@')) throw new Error("Invalid email address");
    if (password.length < 6) throw new Error("Password must be at least 6 characters");

    // Create new session
    const user = { email, uid: 'firebase_uid_' + Math.random().toString(36).substr(2, 9) };
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  },

  // Simulate Google Login
  loginWithGoogle: async (): Promise<{ email: string; uid: string }> => {
    await delay(1200);
    const user = { email: 'demo@growthnexis.global', uid: 'google_uid_123' };
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return user;
  },

  logout: async () => {
    await delay(300);
    localStorage.removeItem(SESSION_KEY);
  }
};