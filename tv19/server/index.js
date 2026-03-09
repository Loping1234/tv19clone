import express from "express";
import cors from "cors";
import Parser from "rss-parser";
import { fileURLToPath } from "url";
import path from "path";
import multer from "multer";
import cron from "node-cron";
import connectDB from "./db.js";
import { getConfig, updateConfig } from "./models/SiteConfig.js";
import News from "./models/News.js";
import RssFeed from "./models/RssFeed.js";
// import View from "./models/View.js"; // You'll need to create this model if it doesn't exist

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const parser = new Parser({
  customFields: {
    item: [
      ["media:content", "mediaContent", { keepArray: false }],
      ["media:thumbnail", "mediaThumbnail", { keepArray: false }],
      ["media:group", "mediaGroup", { keepArray: false }],
    ],
  },
});

app.use(cors());
app.use(express.json());

// Serve uploaded files statically
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Multer config for file uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(__dirname, "uploads")),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = file.fieldname + "-" + Date.now() + ext;
    cb(null, name);
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Global error handlers to prevent silent exits
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED REJECTION:", reason);
});

// RSS feed URLs mapped by category (Times of India + BBC + supplementary)
const RSS_FEEDS = {
  top: [
    "https://timesofindia.indiatimes.com/rssfeedstopstories.cms",
    "https://feeds.bbci.co.uk/news/rss.xml",
  ],
  india: [
    "https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms",
    "https://feeds.bbci.co.uk/news/world/asia/india/rss.xml",
    "https://www.thehindu.com/news/national/feeder/default.rss",
  ],
  business: [
    "https://timesofindia.indiatimes.com/rssfeeds/1898055.cms",
    "https://feeds.bbci.co.uk/news/business/rss.xml",
    "https://economictimes.indiatimes.com/rssfeedstopstories.cms",
  ],
  finance: [
    "https://economictimes.indiatimes.com/wealth/rssfeeds/837555174.cms",
    "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms",
  ],
  markets: [
    "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms",
    "https://economictimes.indiatimes.com/markets/stocks/rssfeeds/2146842.cms",
  ],
  entertainment: [
    "https://timesofindia.indiatimes.com/rssfeeds/1081479906.cms",
    "https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml",
  ],
  health: [
    "https://timesofindia.indiatimes.com/rssfeeds/3908999.cms",
    "https://feeds.bbci.co.uk/news/health/rss.xml",
    "https://www.thehindu.com/sci-tech/health/feeder/default.rss",
  ],
  science: [
    "https://timesofindia.indiatimes.com/rssfeeds/4719161.cms",
    "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml",
    "https://www.thehindu.com/sci-tech/science/feeder/default.rss",
  ],
  sports: [
    "https://timesofindia.indiatimes.com/rssfeeds/4719148.cms",
    "https://feeds.bbci.co.uk/sport/rss.xml",
    "https://www.thehindu.com/sport/feeder/default.rss",
  ],
  technology: [
    "https://timesofindia.indiatimes.com/rssfeeds/66949542.cms",
    "https://feeds.bbci.co.uk/news/technology/rss.xml",
    "https://www.thehindu.com/sci-tech/technology/feeder/default.rss",
  ],
  world: [
    "https://timesofindia.indiatimes.com/rssfeeds/296589292.cms",
    "https://feeds.bbci.co.uk/news/world/rss.xml",
    "https://www.thehindu.com/news/international/feeder/default.rss",
  ],
  politics: [
    "https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms",
    "https://feeds.bbci.co.uk/news/politics/rss.xml",
    "https://www.thehindu.com/news/national/feeder/default.rss",
  ],
  environment: [
    "https://timesofindia.indiatimes.com/rssfeeds/2647163.cms",
    "https://feeds.bbci.co.uk/news/science_and_environment/rss.xml",
    "https://www.downtoearth.org.in/rss/all",
  ],
  lifestyle: [
    "https://timesofindia.indiatimes.com/rssfeeds/2886704.cms",
    "https://feeds.bbci.co.uk/news/magazine/rss.xml",
  ],
  education: [
    "https://timesofindia.indiatimes.com/rssfeeds/913168846.cms",
    "https://feeds.bbci.co.uk/news/education/rss.xml",
  ],
  crime: [
    "https://news.google.com/rss/search?q=crime+news+india&hl=en-IN&gl=IN&ceid=IN:en",
  ],
  astrology: [
    "https://timesofindia.indiatimes.com/rssfeeds/6547154.cms",
  ],
  opinion: [
    "https://timesofindia.indiatimes.com/rssfeeds/784865811.cms",
    "https://www.thehindu.com/opinion/feeder/default.rss",
  ],
  arts: [
    "https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml",
    "https://www.thehindu.com/entertainment/art/feeder/default.rss",
  ],
  weather: [
    "https://www.skymetweather.com/content/feed/",
    "https://www.downtoearth.org.in/rss/climate-change",
  ],
  // Categories that map to Google News RSS searches
  "green-future": [
    "https://news.google.com/rss/search?q=green+energy+sustainability+india&hl=en-IN&gl=IN&ceid=IN:en",
    "https://www.downtoearth.org.in/rss/all",
  ],
  trending: [
    "https://timesofindia.indiatimes.com/rssfeedstopstories.cms",
    "https://feeds.bbci.co.uk/news/rss.xml",
    "https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en",
  ],
  rajasthan: [
    "https://news.google.com/rss/search?q=Rajasthan+news&hl=en-IN&gl=IN&ceid=IN:en",
    "https://timesofindia.indiatimes.com/rssfeeds/2148496.cms", // TOI Jaipur
  ],
  manufacturing: [
    "https://news.google.com/rss/search?q=manufacturing+industry+india&hl=en-IN&gl=IN&ceid=IN:en",
    "https://economictimes.indiatimes.com/industry/indl-goods/svs/rssfeeds/13352651.cms",
  ],
};

// Images that are known to be generic/broken and should be skipped
const GENERIC_IMAGE_PATTERNS = [
  "imgsize-.cms",
  "toiedit-logo",
  "toilogo",
  "toiblogs/photo/blogs/wp-content/uploads/2019/01/toiedit-logo",
  "toiblogs/photo/blogs/wp-content/uploads/2014/07/toilogo",
  "placeholder",
  "default-image",
  "no-image",
  "noimage",
];

// Map a single RSS item → normalized article object
function mapItem(item, feedTitle) {
  let image = extractImage(item);

  // Reject known bad/generic images
  if (image && GENERIC_IMAGE_PATTERNS.some((pat) => image.includes(pat))) {
    image = null;
  }

  // Strip Google News title suffix "Headline - Source"
  let title = item.title || "";
  let source = feedTitle || "Unknown";
  const dashIdx = title.lastIndexOf(" - ");
  if (feedTitle === "Google News" && dashIdx > 0) {
    source = title.substring(dashIdx + 3).trim();
    title = title.substring(0, dashIdx).trim();
  }

  return {
    source,
    author: item.creator || item["dc:creator"] || null,
    title,
    description: item.contentSnippet || item.content || null,
    url: item.link || "",
    image,
    publishedAt: item.isoDate || item.pubDate || new Date().toISOString(),
    content: item.content || null,
  };
}

// Fetch and parse multiple feed URLs, return merged articles array
async function fetchFeeds(feedUrls, label) {
  const results = await Promise.allSettled(
    feedUrls.map((url) => parser.parseURL(url))
  );

  const articles = [];
  for (const result of results) {
    if (result.status === "fulfilled") {
      const feed = result.value;
      articles.push(...feed.items.map((item) => mapItem(item, feed.title)));
    } else if (label) {
      console.warn(`Feed fetch failed [${label}]:`, result.reason?.message);
    }
  }
  return articles;
}

// GET /api/news?category=top&size=10&imagesOnly=true
app.get("/api/news", async (req, res) => {
  try {
    const categoryQuery = (req.query.category || "top").toString().toLowerCase();
    const size = parseInt(req.query.size) || 20;
    const imagesOnly = req.query.imagesOnly === "true";

    // Build the query
    const dbQuery = { status: true }; // Only show actively toggled articles

    // Handle 'top' logic vs specific category
    if (categoryQuery !== "top" && categoryQuery !== "trending") {
      dbQuery.category = categoryQuery;
    }

    // Require image if specified
    if (imagesOnly) {
      dbQuery.image = { $ne: null, $ne: "" };
    }

    // Fetch from MongoDB
    const articles = await News.find(dbQuery)
      .sort({ publishedAt: -1 }) // newest first
      .limit(size);

    res.json({ totalResults: articles.length, articles });
  } catch (err) {
    console.error("News fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch news from database" });
  }
});

// GET /api/news/search?q=keyword&size=10&category=top
// Searches across MongoDB articles using regex
app.get("/api/news/search", async (req, res) => {
  try {
    const query = (req.query.q || "").toString().trim();
    const size = parseInt(req.query.size) || 20;
    const category = (req.query.category || "").toString().toLowerCase();

    if (!query) {
      return res.status(400).json({ error: "Query parameter 'q' is required" });
    }

    const dbQuery = { status: true }; // Only active news

    // Add regex search across title, description, content
    dbQuery.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
      { content: { $regex: query, $options: "i" } },
    ];

    if (category && category !== "top" && category !== "trending") {
      dbQuery.category = category;
    }

    const articles = await News.find(dbQuery)
      .sort({ publishedAt: -1 })
      .limit(size);

    res.json({ totalResults: articles.length, articles });
  } catch (err) {
    console.error("RSS search error:", err.message);
    res.status(500).json({ error: "Failed to search news database" });
  }
});

// GET /api/news/state?state=Rajasthan&size=15
// Fetches state news from MongoDB
app.get("/api/news/state", async (req, res) => {
  try {
    const stateName = (req.query.state || "Rajasthan").toString().trim();
    const size = parseInt(req.query.size) || 15;

    if (!stateName) {
      return res.status(400).json({ error: "Query parameter 'state' is required" });
    }

    const dbQuery = { status: true };
    // Search for state name in text fields
    dbQuery.$or = [
      { title: { $regex: stateName, $options: "i" } },
      { description: { $regex: stateName, $options: "i" } },
      { content: { $regex: stateName, $options: "i" } },
    ];

    const articles = await News.find(dbQuery)
      .sort({ publishedAt: -1 })
      .limit(size);

    res.json({ totalResults: articles.length, articles });
  } catch (err) {
    console.error("State fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch state news from database" });
  }
});

// GET /api/categories — returns list of all supported categories
app.get("/api/categories", (_req, res) => {
  res.json({ categories: Object.keys(RSS_FEEDS) });
});



// GET /api/rss-feeds — returns all configured RSS feed URLs with categories
app.get("/api/rss-feeds", async (_req, res) => {
  try {
    const feeds = await RssFeed.find().sort({ createdAt: -1 });
    res.json({ totalFeeds: feeds.length, feeds });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch RSS feeds" });
  }
});

// GET /api/rss-feeds/:id
app.get("/api/rss-feeds/:id", async (req, res) => {
  try {
    const feed = await RssFeed.findById(req.params.id);
    if (!feed) return res.status(404).json({ error: "Feed not found" });
    res.json(feed);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch feed" });
  }
});

// PUT /api/rss-feeds/:id
app.put("/api/rss-feeds/:id", async (req, res) => {
  try {
    const { url, category, subheading, status } = req.body;
    const feed = await RssFeed.findByIdAndUpdate(
      req.params.id,
      { url, category, subheading, status },
      { returnDocument: 'after', runValidators: true }
    );
    if (!feed) return res.status(404).json({ error: "Feed not found" });
    res.json(feed);
  } catch (err) {
    res.status(500).json({ error: "Failed to update feed" });
  }
});

// POST /api/rss-feeds
app.post("/api/rss-feeds", async (req, res) => {
  try {
    const { url, category, subheading, status } = req.body;
    const feed = new RssFeed({ url, category, subheading, status });
    await feed.save();
    res.json(feed);
  } catch (err) {
    res.status(500).json({ error: "Failed to create feed. It might already exist." });
  }
});

// DELETE /api/rss-feeds/:id
app.delete("/api/rss-feeds/:id", async (req, res) => {
  try {
    const feed = await RssFeed.findByIdAndDelete(req.params.id);
    if (!feed) return res.status(404).json({ error: "Feed not found" });
    res.json({ message: "Feed deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete feed" });
  }
});

// GET /api/categories/counts — returns real-time article counts per category from MongoDB
app.get("/api/categories/counts", async (_req, res) => {
  try {
    const counts = await News.aggregate([
      { $match: { status: true } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    // Convert array to object: { top: 12, india: 8, ... }
    const result = {};
    for (const item of counts) {
      if (item._id) result[item._id] = item.count;
    }
    res.json({ categoryCounts: result, totalArticles: Object.values(result).reduce((a, b) => a + b, 0) });
  } catch (err) {
    console.error("Category counts error:", err.message);
    res.status(500).json({ error: "Failed to fetch category counts" });
  }
});

// ============================================================
//  Site Configuration API (MongoDB)
// ============================================================

// GET /api/config — fetch current site config
app.get("/api/config", async (_req, res) => {
  try {
    const config = await getConfig();
    res.json(config);
  } catch (err) {
    console.error("Config fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch config" });
  }
});

// PUT /api/config — update text fields
app.put("/api/config", async (req, res) => {
  try {
    const allowed = ["siteName", "siteEmail", "officeAddress", "recaptchaSiteKey", "recaptchaSecretKey"];
    const data = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) data[key] = req.body[key];
    }
    const config = await updateConfig(data);
    res.json(config);
  } catch (err) {
    console.error("Config update error:", err.message);
    res.status(500).json({ error: "Failed to update config" });
  }
});

// POST /api/config/upload-favicon — upload favicon image
app.post("/api/config/upload-favicon", upload.single("favicon"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const faviconUrl = `/uploads/${req.file.filename}`;
    const config = await updateConfig({ faviconUrl });
    res.json({ faviconUrl: config.faviconUrl, message: "Favicon uploaded" });
  } catch (err) {
    console.error("Favicon upload error:", err.message);
    res.status(500).json({ error: "Failed to upload favicon" });
  }
});

// POST /api/config/upload-icon — upload site icon
app.post("/api/config/upload-icon", upload.single("icon"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });
    const siteIconUrl = `/uploads/${req.file.filename}`;
    const config = await updateConfig({ siteIconUrl });
    res.json({ siteIconUrl: config.siteIconUrl, message: "Site icon uploaded" });
  } catch (err) {
    console.error("Icon upload error:", err.message);
    res.status(500).json({ error: "Failed to upload site icon" });
  }
});

//

app.get("/api/admin/views", async (req, res) => {
  try {
    const views = await View.find();
    res.json(views);
  } catch (error) {
    console.error("Views fetch error:", error.message);
    res.status(500).json({ error: "Failed to fetch views" });
  }
});

app.put("/api/admin/views/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { views } = req.body;
    const view = await View.findByIdAndUpdate(id, { views }, { new: true });
    res.json(view);
  } catch (error) {
    console.error("Views update error:", error.message);
    res.status(500).json({ error: "Failed to update views" });
  }
});

app.delete("/api/admin/views/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const view = await View.findByIdAndDelete(id);
    res.json(view);
  } catch (error) {
    console.error("Views delete error:", error.message);
    res.status(500).json({ error: "Failed to delete views" });
  }
});

// Admin News API
app.get("/api/admin/news", async (req, res) => {
  try {
    const news = await News.find().sort({ publishedAt: -1 });
    res.json(news);
  }
  catch (err) {
    console.error("Admin News fetch error:", err.message);
    res.status(500).json({ error: "Failed to fetch Admin news" });
  }
});
// --- Helpers ---

function deduplicateByTitle(articles) {
  const seen = new Set();
  return articles.filter((a) => {
    const key = a.title.toLowerCase().trim();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * For articles missing images, attempts to scrape og:image from the article URL.
 * Updates articles in-place.
 */
async function enrichArticlesWithImages(articles) {
  await Promise.allSettled(
    articles.map(async (article) => {
      if (!article.image && article.url) {
        const scrapedImage = await fetchOgImage(article.url);
        if (
          scrapedImage &&
          !GENERIC_IMAGE_PATTERNS.some((pat) => scrapedImage.includes(pat))
        ) {
          article.image = scrapedImage;
        }
      }
    })
  );
}

// Scrape og:image (or twitter:image fallback) from an article URL
async function fetchOgImage(url, timeoutMs = 4000) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const resp = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml",
      },
    });
    clearTimeout(timer);

    if (!resp.ok) return null;

    // Only read first 50 KB — meta tags are always in <head>
    const reader = resp.body.getReader();
    let html = "";
    let done = false;
    while (!done && html.length < 50000) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      if (value) html += new TextDecoder().decode(value);
    }
    reader.cancel().catch(() => { });

    // Try og:image first, then twitter:image as fallback
    const match =
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i) ||
      html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i);

    return match ? match[1] : null;
  } catch {
    return null;
  }
}

// Extract image from RSS item fields
function extractImage(item) {
  // media:thumbnail (BBC, TOI)
  if (item.mediaThumbnail?.$?.url) return item.mediaThumbnail.$.url;
  if (item["media:thumbnail"]?.$?.url) return item["media:thumbnail"].$.url;

  // media:group > media:thumbnail (YouTube-style feeds)
  if (item.mediaGroup?.["media:thumbnail"]?.[0]?.$?.url)
    return item.mediaGroup["media:thumbnail"][0].$.url;

  // media:content
  if (item.mediaContent?.$?.url) return item.mediaContent.$.url;
  if (item["media:content"]?.$?.url) return item["media:content"].$.url;

  // enclosure (podcast-style image attachments)
  if (item.enclosure?.url && item.enclosure.type?.startsWith("image"))
    return item.enclosure.url;

  // Inline <img> in content:encoded or content HTML
  const html = item["content:encoded"] || item.content || "";
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (match) return match[1];

  return null;
}

// Background Job: Fetch all feeds and save to MongoDB every 30 minutes
cron.schedule('*/30 * * * *', async () => {
  console.log('🔄 Starting scheduled RSS fetch job...');
  try {
    let totalUpserted = 0;

    // Read active feeds from MongoDB instead of hardcoded RSS_FEEDS
    const feeds = await RssFeed.find({ status: true });
    const feedCategories = {};
    for (const feed of feeds) {
      if (!feedCategories[feed.category]) feedCategories[feed.category] = [];
      feedCategories[feed.category].push(feed.url);
    }

    // Loop through all defined active categories
    for (const [category, feedUrls] of Object.entries(feedCategories)) {
      // Don't auto-fetch the "search" generic URLs, just the defined RSS endpoints
      if (category === 'rajasthan' || category === 'manufacturing' || category === 'crime' || category === 'green-future') {
        continue; // skip the ones that rely purely on google search for now to avoid rate limits
      }

      console.log(`Fetching category: ${category}...`);
      let articles = await fetchFeeds(feedUrls, category);

      // Attempt to ensure they all have images locally before saving
      await enrichArticlesWithImages(articles);

      for (const article of articles) {
        // Upsert into DB based on unique URL
        await News.findOneAndUpdate(
          { url: article.url },
          {
            $setOnInsert: {
              title: article.title,
              description: article.description,
              image: article.image,
              source: article.source,
              category: category,
              publishedAt: article.publishedAt,
              content: article.content,
              status: true // New articles default to active (visible)
            }
          },
          { upsert: true, new: true }
        );
        totalUpserted++;
      }
    }
    console.log(`✅ Scheduled RSS fetch complete. Processed ${totalUpserted} articles.`);
  } catch (error) {
    console.error('❌ Error during scheduled RSS fetch:', error);
  }
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB, then start the server
connectDB().then(async () => {
  // Seed initial RSS Feeds if empty
  try {
    const count = await RssFeed.countDocuments();
    if (count === 0) {
      console.log('🌱 Seeding initial RSS Feeds to MongoDB...');
      const feedsToInsert = [];
      for (const [category, urls] of Object.entries(RSS_FEEDS)) {
        for (const url of urls) {
          feedsToInsert.push({ category, url, status: true });
        }
      }
      await RssFeed.insertMany(feedsToInsert);
      console.log(`✅ Seeded ${feedsToInsert.length} RSS feeds to MongoDB.`);
    }
  } catch (e) {
    console.error('❌ Failed to seed RSS feeds:', e);
  }

  app.listen(PORT, () => {
    console.log(`📡 News RSS proxy running on http://localhost:${PORT}`);
  });
});
