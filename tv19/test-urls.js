import fetch from 'node-fetch';

const urls = [
  "https://www.thehindu.com/news/national/feeder/default.rss",
  "https://www.news18.com/rss/india.xml",
  "https://www.news18.com/rss/business.xml",
  "https://gadgets360.com/rss/feeds",
  "https://www.patrika.com/rss/rajasthan-news/"
];

async function test() {
  for (const url of urls) {
    try {
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      console.log(`URL: ${url} -> Status: ${res.status}`);
    } catch (e) {
      console.log(`URL: ${url} -> ERROR: ${e.message}`);
    }
  }
}

test();
