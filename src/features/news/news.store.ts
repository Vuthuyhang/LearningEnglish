// import { create } from 'zustand';
// import { NewsArticle } from './news.model';
// import { NewsService } from './news.service';

// interface NewsState {
//   articles: NewsArticle[];
//   isLoading: boolean;
//   error: string | null;
//   fetchNews: () => Promise<void>;
//   getTopArticles: (count: number) => NewsArticle[];
// }

// export const useNewsStore = create<NewsState>((set, get) => ({
//   articles: [],
//   isLoading: false,
//   error: null,
//   fetchNews: async () => {
//     if (get().articles.length === 0) set({ isLoading: true });
    
//     try {
//       const response = await NewsService.getTopHeadlines();
//       set({ articles: response.articles, isLoading: false, error: null });
//     } catch (err) {
//       set({ error: 'Không thể tải tin tức', isLoading: false });
//     }
//   },
//   getTopArticles: (count: number) => {
//     return get().articles.slice(0, count);
//   }
// }));
import { create } from 'zustand';
import { GuardianArticle } from './news.model';
import { NewsService } from './news.service';

interface NewsState {
  articles: GuardianArticle[]; // Danh sách bài báo từ Guardian
  isLoading: boolean;
  error: string | null;
  
  // Hành động lấy tin tức
  fetchNews: () => Promise<void>;
  
  // Hàm bổ trợ: lấy dữ liệu cho trang chủ (nếu cần)
  getArticlesForHome: (count: number) => GuardianArticle[];
}

export const useNewsStore = create<NewsState>((set, get) => ({
  articles: [],
  isLoading: false,
  error: null,

  fetchNews: async () => {
    // Bật trạng thái đang tải và reset lỗi cũ
    set({ isLoading: true, error: null });
    
    try {
      // Gọi sang Service đã cấu hình cho Guardian
      const results = await NewsService.getTopNews();
      
      // Cập nhật danh sách bài báo
      set({ 
        articles: results, 
        isLoading: false 
      });
      
      console.log("✅ Store: Đã cập nhật " + results.length + " bài báo mới.");
    } catch (err) {
      console.error("Store Error:", err);
      set({ 
        error: 'Không thể tải tin tức lúc này. Hãy thử lại sau nhé ', 
        isLoading: false 
      });
    }
  },

  // Hàm để lấy một số lượng bài báo nhất định cho màn hình Trang chủ
  getArticlesForHome: (count: number) => {
    return get().articles.slice(0, count);
  }
}));