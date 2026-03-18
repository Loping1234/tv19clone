import axios from "axios";
const BASE_URL = "/api/news";

export interface Article {
  source: string;
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  image: string | null;
  publishedAt: string;
  content: string | null;
}

export interface NewsResponse {
  totalResults: number;
  articles: Article[];
}

export type NewsCategory =
  | "arts"
  | "astrology"
  | "business"
  | "crime"
  | "education"
  | "entertainment"
  | "finance"
  | "green-future"
  | "health"
  | "india"
  | "lifestyle"
  | "manufacturing"
  | "markets"
  | "opinion"
  | "politics"
  | "rajasthan"
  | "science"
  | "sports"
  | "technology"
  | "top"
  | "trending"
  | "weather"
  | "environment"
  | "world";


/**
 * Fetch latest news by category.
 * Hits our Express backend which fetches from RSS feeds.
 * @param imagesOnly - If true, only returns articles that have images (default: true)
 */

export const getNews = async (
  category: string = "top",
  size: number = 20,
  imagesOnly: boolean = false,
  skip: number = 0
): Promise<NewsResponse> => {
  try {
    const response = await axios.get<NewsResponse>(BASE_URL, {
      params: { 
        category, 
        size, 
        imagesOnly: imagesOnly ? "true" : undefined, 
        skip 
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const getTopHeadlines = async (
  category: NewsCategory = "top",
  _country?: string,
  pageSize: number = 20,
  imagesOnly: boolean = true
): Promise<NewsResponse> => {
  try {
    const response = await axios.get<NewsResponse>(BASE_URL, {
      params: {
        category,
        size: pageSize,
        imagesOnly: imagesOnly ? "true" : undefined,
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const getRajasthan = async (
  category: NewsCategory = "rajasthan",
  _country?: string,
  pageSize: number = 20,
  imagesOnly: boolean = true
): Promise<NewsResponse> => {
  try {
    const response = await axios.get<NewsResponse>(BASE_URL, {
      params: {
        category,
        size: pageSize,
        imagesOnly: imagesOnly ? "true" : undefined,
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const getEducation = async (
  category: NewsCategory = "education",
  _country?: string,
  pageSize: number = 20,
  imagesOnly: boolean = true
): Promise<NewsResponse> => {
  try {
    const response = await axios.get<NewsResponse>(BASE_URL, {
      params: {
        category,
        size: pageSize,
        imagesOnly: imagesOnly ? "true" : undefined,
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const getOpinion = async (
  category: NewsCategory = "opinion",
  _country?: string,
  pageSize: number = 20,
  imagesOnly: boolean = true
): Promise<NewsResponse> => {
  try {
    const response = await axios.get<NewsResponse>(BASE_URL, {
      params: {
        category,
        size: pageSize,
        imagesOnly: imagesOnly ? "true" : undefined,
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const getLifestyle = async (
  category: NewsCategory = "lifestyle",
  _country?: string,
  pageSize: number = 20,
  imagesOnly: boolean = true
): Promise<NewsResponse> => {
  try {
    const response = await axios.get<NewsResponse>(BASE_URL, {
      params: {
        category,
        size: pageSize,
        imagesOnly: imagesOnly ? "true" : undefined,
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};    

export const getSports = async (
  category: NewsCategory = "sports",
  _country?: string,
  pageSize: number = 20,
  imagesOnly: boolean = true
): Promise<NewsResponse> => {
  try {
    const response = await axios.get<NewsResponse>(BASE_URL, {
      params: {
        category,
        size: pageSize,
        imagesOnly: imagesOnly ? "true" : undefined,
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const getCrime = async (
  category: NewsCategory = "crime",
  _country?: string,
  pageSize: number = 20,
  imagesOnly: boolean = true
): Promise<NewsResponse> => {
  try {
    const response = await axios.get<NewsResponse>(BASE_URL, {
      params: {
        category,
        size: pageSize,
        imagesOnly: imagesOnly ? "true" : undefined,
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const getAstrology = async (
  category: NewsCategory = "astrology",
  _country?: string,
  pageSize: number = 20,
  imagesOnly: boolean = true
): Promise<NewsResponse> => {
  try {
    const response = await axios.get<NewsResponse>(BASE_URL, {
      params: {
        category,
        size: pageSize,
        imagesOnly: imagesOnly ? "true" : undefined,
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const getIndia = async (
  category: NewsCategory = "india",
  _country?: string,
  pageSize: number = 20,
  imagesOnly: boolean = true
): Promise<NewsResponse> => {
  try {
    const response = await axios.get<NewsResponse>(BASE_URL, {
      params: {
        category,
        size: pageSize,
        imagesOnly: imagesOnly ? "true" : undefined,
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const getPolitics = async (
  category: NewsCategory = "politics",
  _country?: string,
  pageSize: number = 20,
  imagesOnly: boolean = true
): Promise<NewsResponse> => {
  try {
    const response = await axios.get<NewsResponse>(BASE_URL, {
      params: {
        category,
        size: pageSize,
        imagesOnly: imagesOnly ? "true" : undefined,
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const getWorld = async (
  category: NewsCategory = "world",
  _country?: string,
  pageSize: number = 20,
  imagesOnly: boolean = true
): Promise<NewsResponse> => {
  try {
    const response = await axios.get<NewsResponse>(BASE_URL, {
      params: {
        category,
        size: pageSize,
        imagesOnly: imagesOnly ? "true" : undefined,
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};


export const getGreenFuture = async (
  category: NewsCategory = "green-future",
  _country?: string,
  pageSize: number = 20,
  imagesOnly: boolean = true
): Promise<NewsResponse> => {
  try {
    const response = await axios.get<NewsResponse>(BASE_URL, {
      params: {
        category,
        size: pageSize,
        imagesOnly: imagesOnly ? "true" : undefined,
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};


/**
 * Search news articles by keyword query.
 * Hits our Express backend /api/news/search endpoint.
 */
export const searchNews = async (
  query: string,
  pageSize: number = 20
): Promise<NewsResponse> => {
  try {
    const response = await axios.get<NewsResponse>(`${BASE_URL}/search`, {
      params: {
        q: query,
        size: pageSize,
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

/**
 * Fetch state-specific news based on detected state name.
 * Hits our Express backend /api/news/state endpoint (Google News RSS).
 */
export const getStateNews = async (
  stateName: string = "Rajasthan",
  pageSize: number = 15
): Promise<NewsResponse> => {
  try {
    const response = await axios.get<NewsResponse>(`${BASE_URL}/state`, {
      params: {
        state: stateName,
        size: pageSize,
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const getArts = async (
  category: NewsCategory = "arts",
  _country?: string,
  pageSize: number = 20,
  imagesOnly: boolean = true
): Promise<NewsResponse> => {
  try {
    const response = await axios.get<NewsResponse>(BASE_URL, {
      params: {
        category,
        size: pageSize,
        imagesOnly: imagesOnly ? "true" : undefined,
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const getTechnology = async (
  category: NewsCategory = "technology",
  _country?: string,
  pageSize: number = 20,
  imagesOnly: boolean = true
): Promise<NewsResponse> => {
  try {
    const response = await axios.get<NewsResponse>(BASE_URL, {
      params: {
        category,
        size: pageSize,
        imagesOnly: imagesOnly ? "true" : undefined,
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const getEntertainment = async (
  category: NewsCategory = "entertainment",
  _country?: string,
  pageSize: number = 20,
  imagesOnly: boolean = true
): Promise<NewsResponse> => {
  try {
    const response = await axios.get<NewsResponse>(BASE_URL, {
      params: {
        category,
        size: pageSize,
        imagesOnly: imagesOnly ? "true" : undefined,
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const getBusiness = async (
  category: NewsCategory = "business",
  _country?: string,
  pageSize: number = 20,
  imagesOnly: boolean = true
): Promise<NewsResponse> => {
  try {
    const response = await axios.get<NewsResponse>(BASE_URL, {
      params: {
        category,
        size: pageSize,
        imagesOnly: imagesOnly ? "true" : undefined,
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const getTrending = async (
  category: NewsCategory = "trending",
  _country?: string,
  pageSize: number = 20,
  imagesOnly: boolean = true
): Promise<NewsResponse> => {
  try {
    const response = await axios.get<NewsResponse>(BASE_URL, {
      params: {
        category,
        size: pageSize,
        imagesOnly: imagesOnly ? "true" : undefined,
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// --- Category Counts ---

export interface CategoryCountsResponse {
  categoryCounts: Record<string, number>;
  totalArticles: number;
}

export const getCategoryCounts = async (): Promise<CategoryCountsResponse> => {
  try {
    const response = await axios.get<CategoryCountsResponse>('/api/counts/categories');
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// --- Custom Fallback ---
export const scrapeFallbackImage = async (url: string, brokenImage: string): Promise<string | null> => {
  try {
    const response = await axios.get<{ imageUrl: string }>(`${BASE_URL}/scrape-image`, {
      params: { url, brokenImage },
    });
    return response.data.imageUrl;
  } catch (error) {
    // We ignore errors here since it's a silent fallback mechanism
    return null;
  }
};

// --- Helpers ---

function handleApiError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 500) {
      throw new Error("Backend failed to fetch RSS feed");
    }
  }
  throw error;
}
