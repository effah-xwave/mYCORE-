
export interface Article {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  link: string;
  date: string;
  imageUrl?: string;
  author?: string;
}

export const ArticleService = {
  async fetchRandomArticles(count: number = 5): Promise<Article[]> {
    try {
      // Using WordPress REST API
      // We use a proxy to avoid CORS issues if the site doesn't allow direct access
      const proxyUrl = 'https://api.allorigins.win/get?url=';
      const targetUrl = encodeURIComponent(`https://www.thearchinsight.com/wp-json/wp/v2/posts?per_page=${count * 2}&_embed`);
      
      const response = await fetch(`${proxyUrl}${targetUrl}`);
      if (!response.ok) throw new Error('Failed to fetch articles');
      
      const data = await response.json();
      const posts = JSON.parse(data.contents);
      
      const articles: Article[] = posts.map((post: any) => ({
        id: post.id,
        title: post.title.rendered,
        excerpt: post.excerpt.rendered,
        content: post.content.rendered,
        link: post.link,
        date: post.date,
        imageUrl: post._embedded?.['wp:featuredmedia']?.[0]?.source_url,
        author: post._embedded?.['author']?.[0]?.name,
      }));

      // Shuffle and take requested count
      return articles.sort(() => Math.random() - 0.5).slice(0, count);
    } catch (error) {
      console.error('Error fetching articles:', error);
      return [];
    }
  }
};
