// Mock Authentication Service
// Simulates a backend auth provider using LocalStorage

import { FirebaseAuthService } from './firebaseAuth';

export const AuthService = {
  getSession: async () => {
    const user = FirebaseAuthService.getCurrentUser();
    if (!user) return null;
    return {
      user: {
        id: user.uid,
        email: user.email,
        user_metadata: {
          name: user.displayName || user.email?.split('@')[0] || 'User'
        }
      }
    };
  },

  login: async (email: string, password: string) => {
    // Firebase doesn't support simple email/password without more setup, 
    // but we can use Google Login as the primary method.
    // For now, we'll keep the mock for email/password if needed, 
    // but encourage Google Login.
    throw new Error("Email/Password login is not configured. Please use Google Login.");
  },

  signup: async (email: string, password: string) => {
    throw new Error("Email/Password signup is not configured. Please use Google Login.");
  },

  loginWithGoogle: async () => {
    const user = await FirebaseAuthService.loginWithGoogle();
    return {
      id: user.uid,
      email: user.email,
      user_metadata: {
        name: user.displayName || user.email?.split('@')[0] || 'User'
      }
    };
  },

  resetPassword: async (email: string) => {
    // TODO: Implement Firebase reset password
    return true;
  },

  logout: async () => {
    await FirebaseAuthService.logout();
  }
};
