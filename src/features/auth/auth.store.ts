import { create } from 'zustand';
import { AuthState, UserProfile } from './auth.model';
import { AuthService } from './auth.service';

export const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  user: null,
  isLoading: false,
  setLoading: (val) => set({ isLoading: val }),
  setUser: (firebaseUser) => {
    if (firebaseUser) {
      const profile: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL ?? undefined,
      };
      set({ isLoggedIn: true, user: profile, isLoading: false });
    } else {
      set({ isLoggedIn: false, user: null, isLoading: false });
    }
  },
  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const firebaseUser = await AuthService.login(email, password);
      if (firebaseUser) {
        const profile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL ?? undefined,
        };
        set({ isLoggedIn: true, user: profile, isLoading: false });
      } else {
        set({ isLoggedIn: false, user: null, isLoading: false });
      }
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },
  logout: () => set({ isLoggedIn: false, user: null }),
}));