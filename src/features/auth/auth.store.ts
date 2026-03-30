import { create } from 'zustand';
import { AuthState, UserProfile } from './auth.model'; 

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
        photoURL: firebaseUser.photoURL,
      };
      set({ isLoggedIn: true, user: profile, isLoading: false });
    } else {
      set({ isLoggedIn: false, user: null, isLoading: false });
    }
  },
  logout: () => set({ isLoggedIn: false, user: null }),
}));