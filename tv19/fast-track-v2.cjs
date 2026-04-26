const mongoose = require('mongoose');
const Parser = require('rss-parser');
const axios = require('axios');

const mongoUri = 'mongodb://localhost:27017/newsdb';

const categories = {
  india: ['https://www.indiatoday.in/rss/1206514'],
  technology: ['https://www.indiatoday.in/rss/1206551'],
  crime: ['https://www.indiatoday.in/rss/1206550'],
  business: ['https://www.indiatoday.in/rss/1206555'],
  education: ['https://www.indiatoday.in/rss/1206510'],
  lifestyle: ['https://www.indiatoday.in/rss/1206509'],
  sports: ['https://www.indiatoday.in/rss/1206553'],
  world: ['https://www.indiatoday.in/rss/1206577'],
  opinion: ['https://www.indiatoday.in/rss/1206503'],
  astrology: ['https://api.livehindustan.com/feeds/rss/astrology/rssfeed.xml'],
  "green-future": ['https://api.livehindustan.com/feeds/rss/lifestyle/rssfeed.xml'],
  finance: ['https://www.news18.com/rss/business.xml'],
  weather: ['https://news.google.com/rss/search?q=weather+india&hl=en-IN&gl=IN&ceid=IN:en'],
  rajasthan: [
    'https://api.livehindustan.com/feeds/rss/rajasthan/rssfeed.xml',
    'https://api.livehindustan.com/feeds/rss/rajasthan/ajmer/rssfeed.xml',
    'https://api.livehindustan.com/feeds/rss/rajasthan/jaipur/rssfeed.xml',
    'https://api.livehindustan.com/feeds/rss/rajasthan/jodhpur/rssfeed.xml',
    'https://api.livehindustan.com/feeds/rss/rajasthan/udaipur/rssfeed.xml',
    'https://api.livehindustan.com/feeds/rss/rajasthan/kota/rssfeed.xml'
  ]
};

const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail']
    ]
  },
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  }
});

const newsSchema = new mongoose.Schema({
  title: String,
  description: String,
  link: { type: String, unique: true },
  pubDate: Date,
  category: String,
  source: String,
  image: String,
  fullContent: String,
  scrapedAt: { type: Date, default: Date.now }
});

const News = mongoose.models.News || mongoose.model('News', newsSchema);

async function run() {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to DB');

    for (const [category, urls] of Object.entries(categories)) {
      console.log(`\nProcessing category: ${category}`);
      for (const url of urls) {
        try {
          console.log(`  Fetching: ${url}`);
          
          let feedContent;
          const response = await axios.get(url, {
              headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
              },
              timeout: 15000
          });
          feedContent = response.data;

          const feed = await parser.parseString(feedContent);
          let count = 0;
          
          for (const item of feed.items) {
            const pubDate = item.pubDate ? new Date(item.pubDate) : new Date();
            
            // Extract image
            let image = '';
            
            // 1. Media Content
            if (item.mediaContent && item.mediaContent.$ && item.mediaContent.$.url) {
                image = item.mediaContent.$.url;
            } 
            // 2. Media Thumbnail
            else if (item.mediaThumbnail && item.mediaThumbnail.$ && item.mediaThumbnail.$.url) {
                image = item.mediaThumbnail.$.url;
            }
            // 3. Enclosure
            else if (item.enclosure && item.enclosure.url) {
                image = item.enclosure.url;
            } 
            // 4. Inline HTML img
            else {
                const html = item.content || item.description || "";
                const imgMatch = html.match(/<img[^>]+src="([^">]+)"/i);
                if (imgMatch) image = imgMatch[1];
            }
            
            // Fallback for Google News
            if (!image && item.link && item.link.includes('news.google.com')) {
                // Google News RSS items don't have images directly, but we can try to guess or use a placeholder
                // For now, let's just leave it empty and the frontend might use a default.
            }

            await News.updateOne(
              { link: item.link },
              {
                $set: {
                  title: item.title,
                  description: item.contentSnippet || item.description || "",
                  pubDate: pubDate,
                  category: category,
                  source: feed.title || 'RSS Feed',
                  image: image,
                  fullContent: item.content || item.description || ""
                }
              },
              { upsert: true }
            );
            count++;
          }
          console.log(`  Successfully processed ${count} articles from ${url}`);
        } catch (err) {
          console.error(`  Error processing ${url}: ${err.message}`);
        }
      }
    }

    console.log('\nFast-track complete!');
    process.exit(0);
  } catch (err) {
    console.error('Connection error:', err);
    process.exit(1);
  }
}

run();
