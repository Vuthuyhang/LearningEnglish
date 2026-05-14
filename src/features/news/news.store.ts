import { create } from 'zustand';
import { NewsArticle } from './news.model';
import { NewsService } from './news.service';

interface NewsState {
  articles: NewsArticle[];
  isLoading: boolean;
  error: string | null;
  fetchNews: () => Promise<void>;
  getTopArticles: (count: number) => NewsArticle[];
}

export const useNewsStore = create<NewsState>((set, get) => ({
  articles: [],
  isLoading: false,
  error: null,
  fetchNews: async () => {
    if (get().articles.length === 0) set({ isLoading: true });
    
    try {
      const response = await NewsService.getTopHeadlines();
      set({ articles: response.articles, isLoading: false, error: null });
    } catch (err) {
      set({ error: 'Không thể tải tin tức', isLoading: false });
    }
  },
  getTopArticles: (count: number) => {
    return get().articles.slice(0, count);
  }
}));