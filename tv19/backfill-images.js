import "dotenv/config";
import mongoose from "mongoose";
import News from "./server/models/News.js";
import { enrichArticleImages } from "./server/utils/newsImages.js";

function parseArgs(argv) {
  const options = {
    limit: 300,
    batchSize: 8,
    category: "",
    retryFailures: false,
  };

  argv.forEach((arg) => {
    if (arg.startsWith("--limit=")) options.limit = Number(arg.split("=")[1]) || options.limit;
    if (arg.startsWith("--batch=")) options.batchSize = Number(arg.split("=")[1]) || options.batchSize;
    if (arg.startsWith("--category=")) options.category = arg.split("=")[1].toLowerCase().trim();
    if (arg === "--retry-failures") options.retryFailures = true;
  });

  return options;
}

async function persistArticle(original, article) {
  const setData = { imageCheckedAt: new Date() };
  const update = { $set: setData, $inc: { imageCheckAttempts: 1 } };

  if (article.image && article.image !== original.image) {
    setData.image = article.image;
  }
  if (article.url && article.url !== original.url) {
    setData.url = article.url;
  }

  try {
    await News.updateOne({ _id: original._id }, update);
  } catch (err) {
    if (err.code === 11000 && setData.url) {
      delete setData.url;
      await News.updateOne({ _id: original._id }, update);
      return;
    }
    throw err;
  }
}

async function run() {
  const options = parseArgs(process.argv.slice(2));
  const mongoUri =
    process.env.MONGO_URI ||
    process.env.MONGODB_URI ||
    "mongodb://localhost:27017/newsTV19";

  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
  console.log("Connected to MongoDB");

  const query = {
    $or: [
      { image: { $in: [null, ""] } },
      { url: /news\.google\.com/ },
    ],
  };

  if (!options.retryFailures) {
    query.$and = [
      {
        $or: [
          { imageCheckAttempts: { $exists: false } },
          { imageCheckAttempts: { $lt: 4 } },
        ],
      },
    ];
  }
  if (options.category) {
    query.category = options.category;
  }

  const articles = await News.find(query)
    .sort({ publishedAt: -1 })
    .limit(options.limit)
    .lean();

  console.log(`Found ${articles.length} articles to check.`);

  let checked = 0;
  let imagesFound = 0;
  let urlsResolved = 0;

  for (let i = 0; i < articles.length; i += options.batchSize) {
    const batch = articles.slice(i, i + options.batchSize).map((article) => ({ ...article }));
    const stats = await enrichArticleImages(batch, {
      limit: batch.length,
      batchSize: 2,
      delayMs: 1000,
      timeoutMs: 8000,
    });

    await Promise.allSettled(
      batch.map((article, index) => persistArticle(articles[i + index], article))
    );

    checked += batch.length;
    imagesFound += stats.imagesFound;
    urlsResolved += stats.urlsResolved;
    process.stdout.write(
      `Checked ${checked}/${articles.length} | images ${imagesFound} | URLs ${urlsResolved}\r`
    );
  }

  console.log(`\nDone. Checked ${checked}, found ${imagesFound} images, resolved ${urlsResolved} URLs.`);
  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error("Backfill failed:", err);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
