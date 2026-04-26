const mongoose = require('mongoose');

// Define temporary schemas for the migration script
const categorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    order: { type: Number, default: 0 },
    status: { type: Boolean, default: true },
    isMainCategory: { type: Boolean, default: false },
    rssUrls: [{ type: String, trim: true }],
});

const subheadingSchema = new mongoose.Schema({
    category: { type: String, required: true },
    label: { type: String, required: true },
    slug: { type: String, required: true },
    order: { type: Number, default: 0 },
    status: { type: Boolean, default: true },
    rssUrls: [{ type: String, trim: true }],
});

const Category = mongoose.model('Category', categorySchema);
const Subheading = mongoose.model('Subheading', subheadingSchema);

const FEED_MAP = {
  top: { custom: ["https://feeds.feedburner.com/ndtvnews-top-stories"] },
  india: { custom: ["https://www.ndtv.com/rss/india", "https://www.indiatoday.in/rss/1206514", "https://timesofindia.indiatimes.com/rssfeeds/2965893.cms", "https://www.thehindu.com/news/national/feeder/default.rss"] },
  business: { custom: ["https://timesofindia.indiatimes.com/rssfeeds/1898055.cms", "https://www.news18.com/rss/business.xml"] },
  technology: { custom: ["https://www.ndtv.com/rss/gadgets", "https://www.indiatoday.in/rss/1206551", "https://gadgets360.com/rss/feeds", "https://timesofindia.indiatimes.com/rssfeeds/66949542.cms"] },
  crime: { custom: ["https://www.indiatoday.in/rss/1206550", "https://timesofindia.indiatimes.com/rssfeeds/-2128830753.cms"] },
  sports: { custom: ["https://timesofindia.indiatimes.com/rssfeeds/4719131.cms", "https://www.news18.com/rss/sports.xml"] },
  entertainment: { custom: ["https://timesofindia.indiatimes.com/rssfeeds/1081479906.cms", "https://www.news18.com/rss/entertainment.xml"] },
  rajasthan: { custom: ["https://api.livehindustan.com/feeds/rss/rajasthan/rssfeed.xml", "https://timesofindia.indiatimes.com/rssfeeds/3012526.cms"] }
};

const CITIES = {
  rajasthan: [
    { label: "Ajmer", slug: "ajmer", rss: ["https://api.livehindustan.com/feeds/rss/rajasthan/ajmer/rssfeed.xml"] },
    { label: "Jaipur", slug: "jaipur", rss: ["https://api.livehindustan.com/feeds/rss/rajasthan/jaipur/rssfeed.xml"] },
    { label: "Jodhpur", slug: "jodhpur", rss: ["https://api.livehindustan.com/feeds/rss/rajasthan/jodhpur/rssfeed.xml"] },
    { label: "Udaipur", slug: "udaipur", rss: ["https://api.livehindustan.com/feeds/rss/rajasthan/udaipur/rssfeed.xml"] },
    { label: "Kota", slug: "kota", rss: ["https://api.livehindustan.com/feeds/rss/rajasthan/kota/rssfeed.xml"] }
  ]
};

async function migrate() {
    try {
        await mongoose.connect('mongodb://localhost:27017/newsdb');
        console.log('Connected to DB');

        // 1. Create Main Categories
        let order = 1;
        for (const [slug, data] of Object.entries(FEED_MAP)) {
            const name = slug.charAt(0).toUpperCase() + slug.slice(1);
            await Category.findOneAndUpdate(
                { slug },
                { 
                    name, 
                    slug, 
                    isMainCategory: true, 
                    order: order++, 
                    rssUrls: data.custom || [] 
                },
                { upsert: true, new: true }
            );
            console.log(`Synced Category: ${name}`);
        }

        // 2. Create Subheadings
        for (const [parentSlug, cities] of Object.entries(CITIES)) {
            let subOrder = 1;
            for (const city of cities) {
                await Subheading.findOneAndUpdate(
                    { category: parentSlug, slug: city.slug },
                    { 
                        category: parentSlug,
                        label: city.label,
                        slug: city.slug,
                        order: subOrder++,
                        rssUrls: city.rss,
                        status: true
                    },
                    { upsert: true, new: true }
                );
                console.log(`Synced Subheading: ${city.label} under ${parentSlug}`);
            }
        }

        console.log('\nMigration complete!');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
