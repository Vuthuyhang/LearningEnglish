// export interface NewsArticle {
//   source: { id: string | null; name: string };
//   author: string | null;
//   title: string;
//   description: string;
//   url: string;
//   urlToImage: string;
//   publishedAt: string;
//   content: string;
// }

// export interface NewsResponse {
//   status: string;
//   totalResults: number;
//   articles: NewsArticle[];
// }
export interface GuardianArticle {
  id: string;
  webTitle: string;        // Tiêu đề bài báo
  webUrl: string;
  apiUrl: string;
  sectionName: string;     // Chủ đề (Politics, World, Business...)
  webPublicationDate: string; //
  fields?: {
    thumbnail?: string;    // Ảnh minh họa
    bodyText?: string;     // Nội dung văn bản thuần (Dùng để tách chữ)
    byline?: string;       // Tác giả
    trailText?: string;    // Mô tả ngắn
  };
}

export interface GuardianResponse {
  response: {
    status: string;
    total: number;
    results: GuardianArticle[];
  };
}