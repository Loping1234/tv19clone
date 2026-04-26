const mongoose = require('mongoose');
const newsSchema = new mongoose.Schema({ category: String, pubDate: Date, title: String });
const News = mongoose.model('News', newsSchema);

async function check() {
  await mongoose.connect('mongodb://localhost:27017/newsdb');
  const stats = await News.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 }, latest: { $max: '$pubDate' } } }
  ]);
  console.log('Category Stats:', JSON.stringify(stats, null, 2));

  // Also check some Rajasthan titles to see if Ajmer etc. are there
  const rajasthanNews = await News.find({ category: 'rajasthan' }).sort({ pubDate: -1 }).limit(10);
  console.log('\nLatest Rajasthan News:');
  rajasthanNews.forEach(n => console.log(`- [${n.pubDate.toISOString()}] ${n.title}`));

  process.exit(0);
}

check();
