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

// ============================================================
//  Two generic fetchers — all named exports delegate to these
// ============================================================

/**
 * Fetch by category from `/api/news` (MongoDB-only, no RSS fallback).
 * Best for categories that are regularly ingested by the cron job.
 */
const fetchByCategory = async (
  category: string,
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
        skip,
      },
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

/**
 * Fetch by state/category from `/api/news/state` (MongoDB + RSS fallback).
 * Preferred for most categories — if DB is empty or stale, Tier 2 kicks in
 * and fetches live from RSS feeds.
 */
const fetchByState = async (
  state: string,
  size: number = 15,
  skip: number = 0
): Promise<NewsResponse> => {
  try {
    const response = await axios.get<NewsResponse>(`${BASE_URL}/state`, {
      params: { state, size, skip },
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};

// ============================================================
//  Named exports (kept for backward-compatible component imports)
// ============================================================

/** Generic news fetch — delegates to fetchByCategory */
export const getNews = async (
  category: string = "top",
  size: number = 20,
  imagesOnly: boolean = false,
  skip: number = 0
): Promise<NewsResponse> => fetchByCategory(category, size, imagesOnly, skip);

/** Top headlines */
export const getTopHeadlines = async (
  category: NewsCategory = "top",
  _country?: string,
  pageSize: number = 20,
  imagesOnly: boolean = true
): Promise<NewsResponse> => fetchByCategory(category, pageSize, imagesOnly);

/** Trending */
export const getTrending = async (
  category: NewsCategory = "trending",
  _country?: string,
  pageSize: number = 20,
  imagesOnly: boolean = true
): Promise<NewsResponse> => fetchByCategory(category, pageSize, imagesOnly);

/** Rajasthan (via state endpoint for RSS fallback) */
export const getRajasthan = async (
  category: NewsCategory = "rajasthan",
  _country?: string,
  pageSize: number = 20
): Promise<NewsResponse> => fetchByState(category, pageSize);

// --- Categories now routed through state endpoint (RSS fallback) ---

/** Finance — switched to state endpoint so RSS fallback works */
export const getFinance = async (
  category: string = "finance",
  _country?: string,
  pageSize: number = 20
): Promise<NewsResponse> => fetchByState(category, pageSize);

/** Weather — switched to state endpoint so RSS fallback works */
export const getWeather = async (
  category: string = "weather",
  _country?: string,
  pageSize: number = 20
): Promise<NewsResponse> => fetchByState(category, pageSize);

/** Crime — switched to state endpoint so RSS fallback works */
export const getCrime = async (
  category: string = "crime",
  _country?: string,
  pageSize: number = 20
): Promise<NewsResponse> => fetchByState(category, pageSize);

/** Opinion — switched to state endpoint so RSS fallback works */
export const getOpinion = async (
  category: string = "opinion",
  _country?: string,
  pageSize: number = 20
): Promise<NewsResponse> => fetchByState(category, pageSize);

/** Astrology — switched to state endpoint so RSS fallback works */
export const getAstrology = async (
  category: string = "astrology",
  _country?: string,
  pageSize: number = 20
): Promise<NewsResponse> => fetchByState(category, pageSize);

/** Arts — switched to state endpoint so RSS fallback works */
export const getArts = async (
  category: string = "arts",
  _country?: string,
  pageSize: number = 20
): Promise<NewsResponse> => fetchByState(category, pageSize);

/** GreenFuture (environment) — switched to state endpoint so RSS fallback works */
export const getGreenFuture = async (
  category: string = "environment",
  _country?: string,
  pageSize: number = 20
): Promise<NewsResponse> => fetchByState(category, pageSize);

// --- Categories already on state endpoint ---

export const getIndia = async (
  region: string = "india",
  pageSize: number = 20,
  skip: number = 0
): Promise<NewsResponse> => {
  // FIX: Don't concatenate "India" — just pass the region directly.
  // Previously: `${region} India` produced "india India" → "india+India" in URL.
  const query = region === "All Stories" ? "india" : region;
  return fetchByState(query, pageSize, skip);
};

export const getPolitics = async (
  subCategory: string = "politics",
  pageSize: number = 20,
  skip: number = 0
): Promise<NewsResponse> => {
  const query = subCategory === "All Stories" ? "politics" : subCategory;
  return fetchByState(query, pageSize, skip);
};

export const getSports = async (
  category: NewsCategory | string = "sports",
  _country?: string,
  pageSize: number = 20,
  _imagesOnly: boolean = true,
  skip: number = 0
): Promise<NewsResponse> => fetchByState(category, pageSize, skip);

export const getWorld = async (
  category: NewsCategory | string = "world",
  _country?: string,
  pageSize: number = 20,
  _imagesOnly: boolean = true,
  skip: number = 0
): Promise<NewsResponse> => fetchByState(category, pageSize, skip);

export const getEntertainment = async (
  category: NewsCategory | string = "entertainment",
  _country?: string,
  pageSize: number = 20,
  _imagesOnly: boolean = true,
  skip: number = 0
): Promise<NewsResponse> => fetchByState(category, pageSize, skip);

export const getBusiness = async (
  subCategory: string = "business",
  pageSize: number = 20,
  skip: number = 0
): Promise<NewsResponse> => {
  const query = subCategory === "All Stories" ? "business" : subCategory;
  return fetchByState(query, pageSize, skip);
};

export const getLifestyle = async (
  subCategory: string = "lifestyle",
  pageSize: number = 20,
  skip: number = 0
): Promise<NewsResponse> => {
  const query = subCategory === "All Stories" ? "lifestyle" : subCategory;
  return fetchByState(query, pageSize, skip);
};

export const getEducation = async (
  subCategory: string = "education",
  pageSize: number = 20,
  skip: number = 0
): Promise<NewsResponse> => {
  const query = subCategory === "All Stories" ? "education" : subCategory;
  return fetchByState(query, pageSize, skip);
};

export const getTechnology = async (
  subCategory: string = "technology",
  pageSize: number = 20,
  skip: number = 0
): Promise<NewsResponse> => {
  const query = subCategory === "All Stories" ? "technology" : subCategory;
  return fetchByState(query, pageSize, skip);
};

export const getStateNews = async (
  stateName: string = "Rajasthan",
  pageSize: number = 15,
  skip: number = 0
): Promise<NewsResponse> => fetchByState(stateName, pageSize, skip);

// --- Generic Dynamic Category Fetcher ---
export const getDynamicCategoryNews = async (
  category: string,
  subCategory: string = "All Stories",
  pageSize: number = 30,
  skip: number = 0
): Promise<NewsResponse> => {
  const state = (subCategory && subCategory !== "All Stories") ? subCategory : category;
  return fetchByState(state, pageSize, skip);
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

// --- Helpers ---

function handleApiError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 500) {
      throw new Error("Backend failed to fetch RSS feed");
    }
  }
  throw error;
}
