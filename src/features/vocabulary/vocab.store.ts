import { create } from 'zustand';
import { IVocabulary } from './vocab.model';
import { VocabularyService } from './vocab.service';

interface VocabularyState {
  vocabList: IVocabulary[];
  isLoading: boolean;
  fetchVocab: (uid: string) => Promise<void>;
  removeWord: (uid: string, wordId: string) => Promise<void>;
}

export const useVocabularyStore = create<VocabularyState>((set, get) => ({
  vocabList: [],
  isLoading: false,

  fetchVocab: async (uid: string) => {
    set({ isLoading: true });
    try {
      const data = await VocabularyService.getVocabularies(uid);
      set({ vocabList: data as IVocabulary[], isLoading: false });
    } catch (error) {
      set({ isLoading: false });
    }
  },

  removeWord: async (uid: string, wordId: string) => {
    try {
      await VocabularyService.deleteVocabulary(uid, wordId);
      const newList = get().vocabList.filter(item => item.word !== wordId);
      set({ vocabList: newList });
    } catch (error) {
      console.log("Lỗi xóa từ:", error);
    }
  }
}));