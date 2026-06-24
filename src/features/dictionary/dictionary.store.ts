import { create } from 'zustand';
import { DictaionaryService } from './dictionary.service';

interface DictionaryState {
  recentSearches: any[];
  searchResult: any | null;
  isLoading: boolean;
  
  search: (word: string) => Promise<void>;
  clearResult: () => void;
}

export const useDictionaryStore = create<DictionaryState>((set, get) => ({
  recentSearches: [],
  searchResult: null,
  isLoading: false,

  search: async (word: string) => {
    if (!word) return;
    set({ isLoading: true, searchResult: null });
    try {
      const data = await DictaionaryService.getDefinition(word);
      
      // Lưu vào lịch sử (không trùng lặp)
      const currentHistory = get().recentSearches;
      const filtered = currentHistory.filter(item => item.word.toLowerCase() !== word.toLowerCase());
      
      set({ 
        searchResult: data, 
        recentSearches: [data, ...filtered].slice(0, 10), // Giữ 10 từ gần nhất
        isLoading: false 
      });
    } catch (error) {
      set({ isLoading: false, searchResult: { error: true, word } });
    }
  },

  clearResult: () => set({ searchResult: null }),
}));