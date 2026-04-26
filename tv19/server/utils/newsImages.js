import pkg from "google-news-url-decoder";

const { GoogleDecoder } = pkg;

const DEFAULT_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.8",
};

const GOOGLE_NEWS_HOST = "news.google.com";
const MAX_HTML_CHARS = 80000;
const decoder = new GoogleDecoder();
const decodeCache = new Map();

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withTimeout(promise, timeoutMs) {
  let timer;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error("Timed out")), timeoutMs);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

export function isGoogleNewsUrl(url) {
  try {
    return new URL(url).hostname === GOOGLE_NEWS_HOST;
  } catch {
    return false;
  }
}

function hasUsableImage(article) {
  return Boolean(article?.image && String(article.image).trim());
}

function absolutizeUrl(candidate, baseUrl) {
  if (!candidate) return null;
  try {
    return new URL(candidate, baseUrl).href;
  } catch {
    return candidate;
  }
}

function getCachedDecode(url) {
  const cached = decodeCache.get(url);
  if (!cached) return null;
  if (cached.expiresAt < Date.now()) {
    decodeCache.delete(url);
    return null;
  }
  return cached.value;
}

function setCachedDecode(url, value, ttlMs) {
  decodeCache.set(url, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
}

async function tryHttpRedirect(url, timeoutMs) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: "follow",
      headers: DEFAULT_HEADERS,
    });
    clearTimeout(timer);
    const finalUrl = response.url || url;
    await response.body?.cancel?.();
    return isGoogleNewsUrl(finalUrl) ? null : finalUrl;
  } catch {
    clearTimeout(timer);
    return null;
  }
}

export async function resolveGoogleNewsUrl(url, options = {}) {
  const timeoutMs = options.timeoutMs || 6000;
  if (!url || !isGoogleNewsUrl(url)) {
    return { url, decoded: false };
  }

  const cached = getCachedDecode(url);
  if (cached !== null) {
    return { url: cached || url, decoded: Boolean(cached) };
  }

  try {
    const result = await withTimeout(decoder.decode(url), Math.min(timeoutMs, 3500));
    if (result?.status && result.decoded_url) {
      setCachedDecode(url, result.decoded_url, 24 * 60 * 60 * 1000);
      return { url: result.decoded_url, decoded: true };
    }
  } catch {
    // Google often rate-limits this path. We fall back below.
  }

  const redirectedUrl = await tryHttpRedirect(url, timeoutMs);
  if (redirectedUrl) {
    setCachedDecode(url, redirectedUrl, 24 * 60 * 60 * 1000);
    return { url: redirectedUrl, decoded: true };
  }

  setCachedDecode(url, "", 30 * 60 * 1000);
  return { url, decoded: false };
}

export async function resolveGoogleNewsUrlsInArticles(articles, options = {}) {
  const limit = options.limit ?? 12;
  const batchSize = options.batchSize ?? 4;
  const delayMs = options.delayMs ?? 800;
  const urls = [
    ...new Set(
      articles
        .map((article) => article.url)
        .filter((url) => url && isGoogleNewsUrl(url))
    ),
  ].slice(0, limit);

  if (urls.length === 0) return { attempted: 0, decoded: 0 };

  let decoded = 0;
  const resolvedByUrl = new Map();

  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map((url) => resolveGoogleNewsUrl(url, options))
    );

    results.forEach((result, index) => {
      if (result.status !== "fulfilled") return;
      const originalUrl = batch[index];
      const resolvedUrl = result.value.url;
      if (resolvedUrl && resolvedUrl !== originalUrl) {
        resolvedByUrl.set(originalUrl, resolvedUrl);
        decoded += 1;
      }
    });

    if (i + batchSize < urls.length) {
      await sleep(delayMs);
    }
  }

  articles.forEach((article) => {
    const resolvedUrl = resolvedByUrl.get(article.url);
    if (resolvedUrl) article.url = resolvedUrl;
  });

  return { attempted: urls.length, decoded };
}

function extractMetaImage(html) {
  const patterns = [
    /<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image(?::secure_url)?["']/i,
    /<meta[^>]+name=["']twitter:image(?::src)?["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image(?::src)?["']/i,
    /"image"\s*:\s*"([^"]+)"/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return match[1].replace(/\\\//g, "/");
  }

  return null;
}

export async function fetchOgImage(url, timeoutMs = 7000) {
  try {
    const resolved = await resolveGoogleNewsUrl(url, { timeoutMs });
    let resolvedUrl = resolved.url || url;
    if (isGoogleNewsUrl(resolvedUrl)) {
      return { image: null, realUrl: null };
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const response = await fetch(resolvedUrl, {
      signal: controller.signal,
      headers: DEFAULT_HEADERS,
      redirect: "follow",
    });
    clearTimeout(timer);

    if (!response.ok) {
      await response.body?.cancel?.();
      return {
        image: null,
        realUrl: resolvedUrl !== url ? resolvedUrl : null,
      };
    }

    resolvedUrl = response.url || resolvedUrl;

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let html = "";
    let done = false;
    while (!done && html.length < MAX_HTML_CHARS) {
      const chunk = await reader.read();
      done = chunk.done;
      if (chunk.value) html += decoder.decode(chunk.value, { stream: !done });
    }
    reader.cancel().catch(() => {});

    const image = absolutizeUrl(extractMetaImage(html), resolvedUrl);

    return {
      image,
      realUrl: resolvedUrl !== url ? resolvedUrl : null,
    };
  } catch {
    return null;
  }
}

export async function enrichArticleImages(articles, options = {}) {
  const limit = options.limit ?? 10;
  const batchSize = options.batchSize ?? 2;
  const delayMs = options.delayMs ?? 700;
  const timeoutMs = options.timeoutMs ?? 7000;
  const candidates = articles
    .filter((article) => article?.url && (!hasUsableImage(article) || isGoogleNewsUrl(article.url)))
    .slice(0, limit);

  const stats = {
    attempted: candidates.length,
    imagesFound: 0,
    urlsResolved: 0,
  };

  for (let i = 0; i < candidates.length; i += batchSize) {
    const batch = candidates.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map(async (article) => {
        if (hasUsableImage(article)) {
          const resolved = await resolveGoogleNewsUrl(article.url, { timeoutMs });
          if (resolved.url && resolved.url !== article.url) {
            article.url = resolved.url;
            return { urlResolved: true, imageFound: false };
          }
          return { urlResolved: false, imageFound: false };
        }

        const result = await fetchOgImage(article.url, timeoutMs);
        if (!result) return { urlResolved: false, imageFound: false };

        let urlResolved = false;
        if (result.realUrl && result.realUrl !== article.url) {
          article.url = result.realUrl;
          urlResolved = true;
        }

        if (result.image) {
          article.image = result.image;
          return { urlResolved, imageFound: true };
        }

        return { urlResolved, imageFound: false };
      })
    );

    results.forEach((result) => {
      if (result.status !== "fulfilled") return;
      if (result.value.imageFound) stats.imagesFound += 1;
      if (result.value.urlResolved) stats.urlsResolved += 1;
    });

    if (i + batchSize < candidates.length) {
      await sleep(delayMs);
    }
  }

  return stats;
}

export function sortArticlesForDisplay(articles) {
  return [...articles].sort((left, right) => {
    const leftHasImage = hasUsableImage(left);
    const rightHasImage = hasUsableImage(right);

    if (leftHasImage !== rightHasImage) {
      return Number(rightHasImage) - Number(leftHasImage);
    }

    return new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime();
  });
}
