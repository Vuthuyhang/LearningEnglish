import { create } from 'zustand';
import { NewsArticle } from './news.model';
import { NewsService } from './news.service';

interface NewsState {
  articles: NewsArticle[];
  isLoading: boolean;
  error: string | null;
  fetchNews: () => Promise<void>;
}

export const useNewsStore = create<NewsState>((set) => ({
  articles: [],
  isLoading: false,
  error: null,
  fetchNews: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await NewsService.getTopHeadlines();
      set({ articles: data.articles, isLoading: false });
    } catch (err) {
      set({ error: 'Không thể tải', isLoading: false });
    }
  },
}));