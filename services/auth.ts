import { User } from '../types';

// Mock Session for demo purposes
const SESSION_KEY = 'mycore_session';

export const AuthService = {
  getSession: async () => {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  },

  login: async (email: string, password: string) => {
    // Simulate API call
    return new Promise<{ user: any }>((resolve, reject) => {
      setTimeout(() => {
        if (email.includes('@')) {
          const user = { email, id: 'user_123', user_metadata: { name: email.split('@')[0] } };
          localStorage.setItem(SESSION_KEY, JSON.stringify({ user }));
          resolve({ user });
        } else {
          reject(new Error("Invalid email"));
        }
      }, 1000);
    });
  },

  signup: async (email: string, password: string) => {
    // Simulate API call
    return new Promise<{ user: any }>((resolve) => {
      setTimeout(() => {
        const user = { email, id: 'user_123', user_metadata: { name: email.split('@')[0] } };
        localStorage.setItem(SESSION_KEY, JSON.stringify({ user }));
        resolve({ user });
      }, 1000);
    });
  },

  loginWithGoogle: async () => {
     return new Promise<{ user: any; email: string }>((resolve) => {
        setTimeout(() => {
            const email = "demo@growthnexis.global";
            const user = { email, id: 'user_google_123', user_metadata: { name: "Demo User" } };
            localStorage.setItem(SESSION_KEY, JSON.stringify({ user }));
            resolve({ user, email });
        }, 1500);
     });
  },

  logout: async () => {
    localStorage.removeItem(SESSION_KEY);
    return Promise.resolve();
  }
};