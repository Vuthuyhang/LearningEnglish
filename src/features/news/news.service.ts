import axios from 'axios';
import { NEWS_API_KEY, NEWS_API_URL } from '@env'; 
import { NewsResponse } from './news.model';

const API_KEY = '3a25c83ce350412eb8fdea6543185fac'; 

export const NewsService = {
  getTopHeadlines: async (category = 'general'): Promise<NewsResponse> => {
    try {
      const response = await axios.get(`${NEWS_API_URL}/top-headlines`, {
        params: {
          country: 'us', 
          category: category,
          apiKey: API_KEY,
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};