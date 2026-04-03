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
    const user = await FirebaseAuthService.login(email, password);
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

  signup: async (email: string, password: string) => {
    const user = await FirebaseAuthService.signup(email, password);
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
    await FirebaseAuthService.resetPassword(email);
    return true;
  },

  logout: async () => {
    await FirebaseAuthService.logout();
  }
};
