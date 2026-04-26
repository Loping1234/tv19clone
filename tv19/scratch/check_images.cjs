const mongoose = require('mongoose');
const newsSchema = new mongoose.Schema({ category: String, image: String });
const News = mongoose.model('News', newsSchema);

async function checkImages() {
  await mongoose.connect('mongodb://localhost:27017/newsdb');
  const categories = ['opinion', 'astrology', 'education', 'green-future', 'crime', 'weather', 'finance', 'business', 'india', 'rajasthan'];
  
  for (const cat of categories) {
    const total = await News.countDocuments({ category: cat });
    const withImage = await News.countDocuments({ category: cat, image: { $ne: '', $exists: true } });
    console.log(`${cat}: ${withImage}/${total} images`);
  }
  
  process.exit(0);
}

checkImages();
