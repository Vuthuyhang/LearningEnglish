// import axios from 'axios';
// import { NEWS_API_KEY, NEWS_API_URL } from '@env'; 
// import { NewsResponse } from './news.model';

// const API_KEY = '3a25c83ce350412eb8fdea6543185fac'; 

// export const NewsService = {
//   getTopHeadlines: async (category = 'general'): Promise<NewsResponse> => {
//     try {
//       const response = await axios.get(`${NEWS_API_URL}/top-headlines`, {
//         params: {
//           country: 'us', 
//           category: category,
//           apiKey: API_KEY,
//         },
//       });
//       return response.data;
//     } catch (error) {
//       throw error;
//     }
//   },
// };
import axios from 'axios';
import { GUARDIAN_API_KEY, GUARDIAN_API_URL } from '@env';

export const NewsService = {
  getTopNews: async () => {
    try {
      const response = await axios.get(`${GUARDIAN_API_URL}/search`, {
        params: {
          'api-key': GUARDIAN_API_KEY,
          'show-fields': 'thumbnail,bodyText,byline,trailText', // Lấy đủ dữ liệu cần thiết
          'page-size': 20,
          'order-by': 'newest'
        },
      });
      return response.data.response.results; // Trả về mảng bài báo
    } catch (error) {
      console.error("Lỗi gọi Guardian API:", error);
      throw error;
    }
  },
};