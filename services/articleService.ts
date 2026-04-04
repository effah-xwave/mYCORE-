
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
  async fetchRandomArticles(count: number = 5, query?: string): Promise<Article[]> {
    try {
      // Primary: WordPress REST API from thearchinsight.com
      // Using a different proxy approach or direct if possible
      let targetUrl = `https://www.thearchinsight.com/wp-json/wp/v2/posts?per_page=${count * 2}&_embed`;
      if (query) {
        targetUrl += `&search=${encodeURIComponent(query)}`;
      }
      
      let posts = [];
      try {
        const response = await fetch(targetUrl);
        if (response.ok) {
          posts = await response.json();
        } else {
          throw new Error('Direct fetch failed');
        }
      } catch (e) {
        // Fallback 1: allorigins proxy
        try {
          const proxyUrl = 'https://api.allorigins.win/get?url=';
          const res = await fetch(`${proxyUrl}${encodeURIComponent(targetUrl)}`);
          if (res.ok) {
            const data = await res.json();
            posts = JSON.parse(data.contents);
          } else {
            throw new Error('AllOrigins failed');
          }
        } catch (e2) {
          // Fallback 2: corsproxy.io
          try {
            const res = await fetch(`https://corsproxy.io/?${encodeURIComponent(targetUrl)}`);
            if (res.ok) {
              posts = await res.json();
            } else {
              throw new Error('CorsProxy.io failed');
            }
          } catch (e3) {
            console.warn('All article fetch attempts failed, using mock data.');
          }
        }
      }

      if (posts && posts.length > 0) {
        return posts.map((post: any) => ({
          id: post.id,
          title: post.title.rendered,
          excerpt: post.excerpt.rendered,
          content: post.content.rendered,
          link: post.link,
          date: post.date,
          imageUrl: post._embedded?.['wp:featuredmedia']?.[0]?.source_url || `https://picsum.photos/seed/${post.id}/800/600`,
          author: post._embedded?.['author']?.[0]?.name || 'Arch Insight Team',
        })).sort(() => Math.random() - 0.5).slice(0, count);
      }
      
      // If we got here, posts is empty but no error was thrown
      return getFallbackData(count);
    } catch (error) {
      console.warn('Article fetch failed, using fallback data:', error);
      return getFallbackData(count);
    }
  }
};

function getFallbackData(count: number): Article[] {
  return [
    {
      id: 101,
      title: "The Future of Minimalist Architecture",
      excerpt: "Exploring how less is becoming more in modern urban design.",
      content: "<p>Minimalism is not just a design style; it's a philosophy of life. In architecture, this translates to clean lines, functional spaces, and a deep connection with the environment...</p><p>As cities become more crowded, the need for efficient, beautiful spaces grows. Minimalist architecture offers a solution that prioritizes quality over quantity.</p>",
      link: "https://www.thearchinsight.com",
      date: new Date().toISOString(),
      imageUrl: "https://picsum.photos/seed/arch1/800/600",
      author: "Core Editorial"
    },
    {
      id: 102,
      title: "Sustainable Materials in 2026",
      excerpt: "New innovations in bio-concrete and recycled glass.",
      content: "<p>Sustainability is no longer optional. The construction industry is one of the largest contributors to carbon emissions, but new materials are changing the game...</p><p>Bio-concrete, which can heal its own cracks, and high-performance recycled glass are just the beginning of a greener future for our buildings.</p>",
      link: "https://www.thearchinsight.com",
      date: new Date().toISOString(),
      imageUrl: "https://picsum.photos/seed/arch2/800/600",
      author: "Core Editorial"
    },
    {
      id: 103,
      title: "The Psychology of Light and Space",
      excerpt: "How natural light affects our productivity and well-being.",
      content: "<p>Light is the most important element in design. It shapes how we perceive space and how we feel within it. Studies show that natural light can increase productivity by up to 15%...</p><p>By understanding the circadian rhythm, architects can design spaces that support our natural biological processes, leading to healthier and happier occupants.</p>",
      link: "https://www.thearchinsight.com",
      date: new Date().toISOString(),
      imageUrl: "https://picsum.photos/seed/arch3/800/600",
      author: "Core Editorial"
    },
    {
      id: 104,
      title: "Urban Green Spaces: A Necessity",
      excerpt: "Why every city needs more parks and vertical gardens.",
      content: "<p>Urbanization is accelerating, but we must not forget our connection to nature. Green spaces are the lungs of our cities, providing clean air and a place for mental restoration...</p>",
      link: "https://www.thearchinsight.com",
      date: new Date().toISOString(),
      imageUrl: "https://picsum.photos/seed/arch4/800/600",
      author: "Core Editorial"
    }
  ].slice(0, count);
}
