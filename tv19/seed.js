import mongoose from "mongoose";
import "dotenv/config";
import Poll from "./server/models/Poll.js";
import News from "./server/models/News.js";

async function fetchOgImage(url, timeoutMs = 6000) {
  try {
    let resolvedUrl = url;
    if (url.includes('news.google.com')) {
      try {
        const headResp = await fetch(url, {
          method: 'GET',
          redirect: 'follow',
          signal: AbortSignal.timeout(3000),
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1)' },
        });
        resolvedUrl = headResp.url;
      } catch {
        return null;
      }
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const resp = await fetch(resolvedUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
      },
    });
    clearTimeout(timer);
    if (!resp.ok) return null;

    const reader = resp.body.getReader();
    let html = "";
    let done = false;
    while (!done && html.length < 10000) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      if (value) html += new TextDecoder().decode(value);
    }
    reader.cancel().catch(() => {});

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

async function run() {
  await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/newsTV19");
  console.log("Connected to DB");

  // 1. Seed Poll
  const pollCount = await Poll.countDocuments();
  if (pollCount === 0) {
    const newPoll = new Poll({
      question: "Which sector will drive India's growth in the next decade?",
      options: [
        { text: "Technology & IT", votes: 120 },
        { text: "Manufacturing", votes: 85 },
        { text: "Green Energy", votes: 150 },
        { text: "Agriculture", votes: 45 }
      ],
      status: true,
      totalVotes: 400
    });
    await newPoll.save();
    console.log("Created sample poll");
  } else {
    console.log("Poll already exists");
  }

  // 2. Heavy Image Enrichment (150 articles)
  console.log("Running heavy image enrichment on 150 articles...");
  const articlesWithoutImages = await News.find({
    image: { $in: [null, ""] },
    publishedAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
  })
    .sort({ publishedAt: -1 })
    .limit(150)
    .lean();

  if (articlesWithoutImages.length > 0) {
    const MICRO_BATCH = 5;
    let foundImages = 0;
    
    for (let i = 0; i < articlesWithoutImages.length; i += MICRO_BATCH) {
      const batch = articlesWithoutImages.slice(i, i + MICRO_BATCH);

      await Promise.allSettled(
        batch.map(async (article) => {
          if (!article.url) return;
          const ogImage = await fetchOgImage(article.url);
          if (ogImage) {
            await News.updateOne(
              { _id: article._id },
              { $set: { image: ogImage } }
            );
            foundImages++;
          }
        })
      );
      process.stdout.write(`Processed ${Math.min(i + MICRO_BATCH, articlesWithoutImages.length)}/${articlesWithoutImages.length} (Found: ${foundImages})\r`);
    }
    console.log(`\nEnrichment complete. Found ${foundImages} missing images.`);
  }

  process.exit(0);
}

run();
