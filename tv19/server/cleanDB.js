import "dotenv/config";
import mongoose from "mongoose";
import RssFeed from "./models/RssFeed.js";
import connectDB from "./db.js";

const brokenPatterns = [
  'patrika.com/rss',
  'bhaskar.com/rss-feed',
  'downtoearth.org.in/rss',
  'skymetweather.com/content/feed',
  'rssfeeds/1081479906.cms' // Only used incorrectly for karnataka
];

async function clean() {
  await connectDB();
  
  const feeds = await RssFeed.find({});
  let deletedCount = 0;
  
  for (const feed of feeds) {
    if (brokenPatterns.some(pat => feed.url.includes(pat))) {
      await RssFeed.findByIdAndDelete(feed._id);
      console.log('Deleted:', feed.url);
      deletedCount++;
    }
  }
  
  console.log(`Cleanup complete. Deleted ${deletedCount} broken feeds.`);
  process.exit(0);
}

clean();
