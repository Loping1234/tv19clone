import mongoose from "mongoose";
import News from "./server/models/News.js";
import RSSParser from "rss-parser";

const parser = new RSSParser();

const FEEDS = {
  crime: ["https://timesofindia.indiatimes.com/rssfeeds/-2128830753.cms", "https://zeenews.india.com/rss/india-crime-news.xml"],
  rajasthan: ["https://timesofindia.indiatimes.com/rssfeeds/3012526.cms", "https://zeenews.india.com/rss/india-rajasthan-news.xml", "https://www.patrika.com/rss/rajasthan-news/"]
};

async function fastTrack() {
  await mongoose.connect("mongodb://localhost:27017/newsTV19");
  console.log("Fast-tracking Crime and Rajasthan...");

  for (const [cat, urls] of Object.entries(FEEDS)) {
    for (const url of urls) {
      try {
        console.log(`Fetching ${cat} from ${url}`);
        const feed = await parser.parseURL(url);
        for (const item of feed.items) {
           await News.findOneAndUpdate(
             { url: item.link },
             {
               $set: {
                 title: item.title,
                 description: item.contentSnippet || item.content || "",
                 source: feed.title || "News",
                 category: cat,
                 publishedAt: item.isoDate ? new Date(item.isoDate) : new Date(),
                 status: true
               }
             },
             { upsert: true }
           );
        }
      } catch (e) {
        console.error(`Failed ${url}: ${e.message}`);
      }
    }
  }
  console.log("Fast-track complete!");
  process.exit(0);
}

fastTrack();
