import axios from "axios";
const BASE_URL = "/api/news";

export interface Article {
  _id: string;
  source: string;
  author: string | null;
  title: string;
  description: string | null;
  url: string;
  image: string | null;
  publishedAt: string;
  content: string | null;
  views?: number;
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


export const getSports = async (
  category: NewsCategory | string = "sports",
  _country?: string,
  pageSize: number = 20,
  _imagesOnly: boolean = true,
  skip: number = 0
): Promise<NewsResponse> => {
  try {
    const response = await axios.get<NewsResponse>(`${BASE_URL}/state`, {
      params: {
        state: category,
        size: pageSize,
        skip,
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
  region: string = "india",
  pageSize: number = 20,
  skip: number = 0
): Promise<NewsResponse> => {
  try {
    const query = region === "All Stories" ? "india" : `${region} India`;
    const response = await axios.get<NewsResponse>(`${BASE_URL}/state`, {
      params: {
        state: query,
        size: pageSize,
        skip,
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const getPolitics = async (
  subCategory: string = "politics",
  pageSize: number = 20,
  skip: number = 0
): Promise<NewsResponse> => {
  try {
    const query = subCategory === "All Stories" ? "politics" : subCategory;
    const response = await axios.get<NewsResponse>(`${BASE_URL}/state`, {
      params: {
        state: query,
        size: pageSize,
        skip,
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
  pageSize: number = 15,
  skip: number = 0
): Promise<NewsResponse> => {
  try {
    const response = await axios.get<NewsResponse>(`${BASE_URL}/state`, {
      params: {
        state: stateName,
        size: pageSize,
        skip,
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const getWorld = async (
  category: NewsCategory | string = "world",
  _country?: string,
  pageSize: number = 20,
  _imagesOnly: boolean = true,
  skip: number = 0
): Promise<NewsResponse> => {
  try {
    const response = await axios.get<NewsResponse>(`${BASE_URL}/state`, {
      params: {
        state: category,
        size: pageSize,
        skip,
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
  subCategory: string = "technology",
  pageSize: number = 20,
  skip: number = 0
): Promise<NewsResponse> => {
  try {
    const query = subCategory === "All Stories" ? "technology" : subCategory;
    const response = await axios.get<NewsResponse>(`${BASE_URL}/state`, {
      params: {
        state: query,
        size: pageSize,
        skip,
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const getEntertainment = async (
  category: NewsCategory | string = "entertainment",
  _country?: string,
  pageSize: number = 20,
  _imagesOnly: boolean = true,
  skip: number = 0
): Promise<NewsResponse> => {
  try {
    const response = await axios.get<NewsResponse>(`${BASE_URL}/state`, {
      params: {
        state: category,
        size: pageSize,
        skip,
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const getBusiness = async (
  subCategory: string = "business",
  pageSize: number = 20,
  skip: number = 0
): Promise<NewsResponse> => {
  try {
    const query = subCategory === "All Stories" ? "business" : subCategory;
    const response = await axios.get<NewsResponse>(`${BASE_URL}/state`, {
      params: {
        state: query,
        size: pageSize,
        skip,
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const getLifestyle = async (
  subCategory: string = "lifestyle",
  pageSize: number = 20,
  skip: number = 0
): Promise<NewsResponse> => {
  try {
    const query = subCategory === "All Stories" ? "lifestyle" : subCategory;
    const response = await axios.get<NewsResponse>(`${BASE_URL}/state`, {
      params: {
        state: query,
        size: pageSize,
        skip,
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const getEducation = async (
  subCategory: string = "education",
  pageSize: number = 20,
  skip: number = 0
): Promise<NewsResponse> => {
  try {
    const query = subCategory === "All Stories" ? "education" : subCategory;
    const response = await axios.get<NewsResponse>(`${BASE_URL}/state`, {
      params: {
        state: query,
        size: pageSize,
        skip,
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

// --- Generic Dynamic Category Fetcher ---
export const getDynamicCategoryNews = async (
  category: string,
  subCategory: string = "All Stories",
  pageSize: number = 30,
  skip: number = 0
): Promise<NewsResponse> => {
  try {
    const params: Record<string, string | number> = {
      category,
      size: pageSize,
      skip,
      state: (subCategory && subCategory !== "All Stories") ? subCategory : category
    };

    const response = await axios.get<NewsResponse>(`${BASE_URL}/state`, { params });
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

// --- Single Article & Views ---

export const getArticleById = async (id: string): Promise<Article> => {
  try {
    const response = await axios.get<{ article: Article }>(`${BASE_URL}/${id}`);
    return response.data.article;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

export const recordArticleView = async (id: string): Promise<void> => {
  try {
    await axios.post(`${BASE_URL}/${id}/view`);
  } catch (error) {
    // Silently handle view tracking errors
    console.error("Failed to record view", error);
  }
};

export const getRelatedArticles = async (
  category: string,
  excludeId: string,
  limit: number = 4
): Promise<Article[]> => {
  try {
    const response = await axios.get<NewsResponse>(BASE_URL, {
      params: { category, size: limit + 1 }, // fetch one extra in case we filter out the current one
    });
    return response.data.articles.filter((a) => a._id !== excludeId).slice(0, limit);
  } catch (error) {
    handleApiError(error);
    throw error;
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
