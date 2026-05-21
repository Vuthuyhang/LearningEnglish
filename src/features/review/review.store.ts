import { create } from 'zustand';
import firestore from '@react-native-firebase/firestore';

interface ReviewState {
  highScores: { [key: string]: number }; 
  fetchHighScores: (uid: string) => Promise<void>;
  updateHighScore: (uid: string, gameId: string, newScore: number) => Promise<void>;
}

export const useReviewStore = create<ReviewState>((set, get) => ({
  highScores: {},

  
  fetchHighScores: async (uid) => {
    const doc = await firestore().collection('users').doc(uid).get();
    if (doc.exists()) {
      const data = doc.data();
      set({ highScores: data?.scores || {} });
    }
  },

  
  updateHighScore: async (uid, gameId, newScore) => {
    const currentHigh = get().highScores[gameId] || 0;

    if (newScore > currentHigh) {
      
      const updatedScores = { ...get().highScores, [gameId]: newScore };
      set({ highScores: updatedScores });

     
      await firestore().collection('users').doc(uid).set({
        scores: updatedScores
      }, { merge: true });
    }
  }
}));