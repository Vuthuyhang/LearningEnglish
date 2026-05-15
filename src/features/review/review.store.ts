import { create } from 'zustand';
import firestore from '@react-native-firebase/firestore';

interface ReviewState {
  highScores: { [key: string]: number }; // Ví dụ: { 'match': 1500, 'scramble': 1200 }
  fetchHighScores: (uid: string) => Promise<void>;
  updateHighScore: (uid: string, gameId: string, newScore: number) => Promise<void>;
}

export const useReviewStore = create<ReviewState>((set, get) => ({
  highScores: {},

  // Lấy điểm từ Firebase khi mở App
  fetchHighScores: async (uid) => {
    const doc = await firestore().collection('users').doc(uid).get();
    if (doc.exists()) {
      const data = doc.data();
      set({ highScores: data?.scores || {} });
    }
  },

  // Cập nhật điểm nếu điểm mới cao hơn điểm cũ
  updateHighScore: async (uid, gameId, newScore) => {
    const currentHigh = get().highScores[gameId] || 0;

    if (newScore > currentHigh) {
      // 1. Cập nhật Store cục bộ ngay lập tức
      const updatedScores = { ...get().highScores, [gameId]: newScore };
      set({ highScores: updatedScores });

      // 2. Lưu lên Firebase
      await firestore().collection('users').doc(uid).set({
        scores: updatedScores
      }, { merge: true });
    }
  }
}));