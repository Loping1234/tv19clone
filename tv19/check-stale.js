import mongoose from "mongoose";
import News from "./server/models/News.js";

const MONGO_URI = "mongodb://localhost:27017/newsTV19";

async function check() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to DB");

  const cats = ["crime", "technology", "india", "rajasthan"];
  
  for (const cat of cats) {
    const latest = await News.findOne({ category: cat }).sort({ publishedAt: -1 });
    if (latest) {
      console.log(`Category [${cat}]: Latest article is from ${latest.publishedAt} - Title: ${latest.title}`);
    } else {
      console.log(`Category [${cat}]: NO ARTICLES FOUND`);
    }
  }

  process.exit(0);
}

check();
