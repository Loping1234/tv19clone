import mongoose from "mongoose";
import News from "./server/models/News.js";

const MONGO_URI = "mongodb://localhost:27017/newsTV19";

async function check() {
  await mongoose.connect(MONGO_URI);
  const counts = await News.aggregate([
    { $group: { _id: "$category", count: { $sum: 1 } } }
  ]);
  console.log(JSON.stringify(counts, null, 2));
  process.exit(0);
}

check();
