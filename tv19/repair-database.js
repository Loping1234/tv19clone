import mongoose from "mongoose";
import Category from "./server/models/Category.js";
import News from "./server/models/News.js";

const MONGO_URI = "mongodb://localhost:27017/newsTV19";

async function repair() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to DB");

  const categoriesToPurge = [
    "astrology", "opinion", "weather", "crime", "india", 
    "rajasthan", "delhi", "mumbai", "green-future", "education",
    "state"
  ];

  console.log("Purging articles without images in specific categories...");
  const result = await News.deleteMany({
    category: { $in: categoriesToPurge },
    image: { $in: [null, ""] }
  });
  console.log(`Deleted ${result.deletedCount} image-less articles.`);

  console.log("Database cleaned. Now the next RSS refresh will fetch fresh articles with images.");
  process.exit(0);
}

repair();
